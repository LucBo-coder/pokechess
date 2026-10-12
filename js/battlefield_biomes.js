'use strict';

// Presentation preferences are deliberately outside Classic and Expedition saves.
window.BattlefieldBiomes = {
    STORAGE_KEY:'pokechess_biome_v1',
    maps:Object.freeze(Object.fromEntries([
        ['forest','Rừng','Forest'],['volcano','Núi lửa','Volcano'],
        ['ice_cavern','Hang băng','Ice Cavern'],['swamp','Đầm lầy','Swamp']
    ].map(([id,vi,en])=>[id,Object.freeze({id,vi,en,background:`assets/visual/maps/${id}-background.png`,fallback:'forest'})]))),
    elements:Object.freeze({fire:'assets/visual/hex/hex-fire.png',ice:'assets/visual/hex/hex-ice.png',poison:'assets/visual/hex/hex-poison.png'}),
    cache:new Map(), tiles:new Map(), epoch:0, current:'forest', requested:null,
    valid(id){return Object.hasOwn(this.maps,id)?id:'forest';},
    preference(){try{return this.valid(localStorage.getItem(this.STORAGE_KEY));}catch(_){return 'forest';}},
    authority(){
        const run=window.roguelikeUI?.expeditionRun;
        if(!run)return null;
        // Existing routes define regional combat effects, not a biome rotation.
        // Honor explicit map metadata if provided; never infer ice/lava from act numbers.
        const node=window.Expedition?.node(run),region=window.Expedition?.regions?.[run.act];
        const id=node?.biome??region?.biome??run.biome;
        return id==null?null:this.valid(id);
    },
    preparing(){return window.roguelikeUI?.phase==='setup'&&!window.roguelikeUI?.hexCombat?.running;},
    load(path){
        if(!this.cache.has(path))this.cache.set(path,new Promise(resolve=>{
            const image=new Image();let done=false;
            const finish=ok=>{if(done)return;done=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(ok);};
            const timer=setTimeout(()=>finish(false),8000);
            image.onload=()=>finish(image.naturalWidth>0);image.onerror=()=>finish(false);image.src=path;
        }));
        return this.cache.get(path);
    },
    async apply(id){
        id=this.valid(id);if(this.requested===id)return;
        this.requested=id;const epoch=++this.epoch;
        const ok=await this.load(this.maps[id].background);
        if(epoch!==this.epoch)return;
        const chosen=ok?id:'forest';
        const wrapper=document.querySelector('.board-wrapper');
        if(wrapper){wrapper.style.backgroundImage=`url("${this.maps[chosen].background}")`;wrapper.dataset.biome=chosen;}
        this.current=chosen;
        if(this.select)this.select.value=chosen;
        // fitBoard, unit rendering, combat and pointer geometry are untouched.
    },
    selectMap(id){
        if(!this.preparing()||this.authority()!==null)return false;
        id=this.valid(id);try{localStorage.setItem(this.STORAGE_KEY,id);}catch(_){}
        this.apply(id);return true;
    },
    async preview(enabled){
        if(!this.preparing())return false;
        if(this.previewSelect)this.previewSelect.value=enabled?'elements':'off';
        this.tiles.clear();
        if(enabled)for(const [index,type]of ['fire','ice','poison'].entries())this.tiles.set(49+index,type);
        this.renderTiles();
        await Promise.all([...new Set(this.tiles.values())].map(type=>this.load(this.elements[type])));
        this.renderTiles();return true;
    },
    renderTiles(){
        for(const cell of document.querySelectorAll('.board .square')){
            const type=this.tiles.get(Number(cell.dataset.sq));
            let surface=cell.querySelector('.hex-element-surface');
            if(!type){surface?.remove();continue;}
            if(!surface){surface=document.createElement('span');surface.className='hex-element-surface';surface.setAttribute('aria-hidden','true');cell.prepend(surface);}
            surface.dataset.element=type;surface.style.backgroundImage=`url("${this.elements[type]}")`;
        }
    },
    refresh(){
        const prep=this.preparing(),authority=this.authority();
        if(this.select){this.select.disabled=!prep||authority!==null;this.previewSelect.disabled=!prep;}
        if(!prep&&this.tiles.size){this.tiles.clear();if(this.previewSelect)this.previewSelect.value='off';this.renderTiles();}
        this.apply(authority??this.preference());
    },
    localize(){
        const en=window.I18n?.language==='en-US';
        this.mapText.textContent=en?'Map':'Map';this.previewText.textContent=en?'Preview':'Xem ô';
        this.controls.setAttribute('aria-label',en?'Battlefield visuals':'Hiển thị chiến trường');
        for(const option of this.select.options)option.textContent=this.maps[option.value][en?'en':'vi'];
        this.previewSelect.options[0].textContent=en?'Off':'Tắt';
        this.previewSelect.options[1].textContent=en?'Fire / Ice / Poison':'Lửa / Băng / Độc';
        this.previewSelect.title=en?'Visual preview only; no terrain bonuses.':'Chỉ xem thử hình ảnh; không có hiệu ứng địa hình.';
    },
    init(){
        const toolbar=document.getElementById('phaseButtons');if(!toolbar||this.initialized)return;this.initialized=true;
        const controls=this.controls=document.createElement('div');controls.className='biome-controls';
        for(const key of ['map','preview']){
            const label=document.createElement('label'),text=document.createElement('span'),select=document.createElement('select');
            select.id=key==='map'?'battlefield-map':'battlefield-tile-preview';label.append(text,select);controls.append(label);this[key+'Text']=text;
            if(key==='map'){this.select=select;for(const id of Object.keys(this.maps)){const option=document.createElement('option');option.value=id;select.append(option);}select.onchange=()=>this.selectMap(select.value);}
            else {this.previewSelect=select;for(const value of ['off','elements']){const option=document.createElement('option');option.value=value;select.append(option);}select.onchange=()=>this.preview(select.value==='elements');}
        }
        toolbar.append(controls);this.localize();window.I18n?.listeners.add(()=>this.localize());
        const p=RoguelikeUI.prototype,stats=p.updateStats,render=p.renderBoard;
        p.updateStats=function(...args){const result=stats.apply(this,args);BattlefieldBiomes.refresh();return result;};
        p.renderBoard=function(...args){const result=render.apply(this,args);BattlefieldBiomes.renderTiles();return result;};
        this.refresh();
    }
};
document.addEventListener('DOMContentLoaded',()=>BattlefieldBiomes.init());
