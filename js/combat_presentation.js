'use strict';

// Preferences and transient rendering never enter journey save data.
window.CombatPresentation = {
    key:'pokechess_combat_display_v1',
    presets:{minimal:{damage:false,skills:false,status:false,bars:true,effects:false},balanced:{damage:true,skills:true,status:false,bars:true,effects:true},detailed:{damage:true,skills:true,status:true,bars:true,effects:true}},
    settings:{}, listeners:new Set(), recentLog:new Map(), logPending:new Map(),
    init(){
        let saved;try{saved=JSON.parse(localStorage.getItem(this.key)||'null');}catch(_){}
        const mode=this.presets[saved?.mode]?saved.mode:'balanced';this.settings={mode,...this.presets[mode]};
        for(const key of Object.keys(this.presets.balanced))if(typeof saved?.[key]==='boolean')this.settings[key]=saved[key];
        const section=document.querySelector('.settings-section:nth-of-type(2)');if(!section)return;
        const select=document.createElement('select');select.className='language-select';select.setAttribute('aria-label',t('display.mode'));
        for(const mode of Object.keys(this.presets)){const option=document.createElement('option');option.value=mode;option.dataset.i18n='display.'+mode;select.append(option);}select.value=mode;
        select.onchange=()=>{this.settings={mode:select.value,...this.presets[select.value]};this.save();refresh();};section.append(select);
        const boxes={};for(const key of Object.keys(this.presets.balanced)){
            const label=document.createElement('label');label.className='motion-setting';const box=document.createElement('input');box.type='checkbox';box.checked=this.settings[key];box.onchange=()=>{this.settings[key]=box.checked;this.save();};
            const text=document.createElement('span');text.dataset.i18n='display.'+key;label.append(box,text);section.append(label);boxes[key]=box;
        }
        const refresh=()=>{for(const [key,box]of Object.entries(boxes))box.checked=this.settings[key];};
        this.save(false);I18n.updateDOM(section);
    },
    save(persist=true){if(persist)localStorage.setItem(this.key,JSON.stringify(this.settings));document.body.dataset.combatDisplay=this.settings.mode;for(const callback of this.listeners)callback();},
    enabled(key){return this.settings[key]!==false;},
    indicators(renderer,unit,sprite){
        for(const el of sprite.element.querySelectorAll('.hex-combat-hp,.hex-combat-mana,.hex-combat-shield'))el.hidden=!this.enabled('bars');
        let row=sprite.element.querySelector('.hex-status-icons');if(!row){row=document.createElement('div');row.className='hex-status-icons';sprite.element.append(row);}
        const glyphs={burn:'♨',poison:'●',berserker:'⚔',masteryGuard:'◆',masteryFocus:'✦',shield:'◇',frozen:'❄',paralyzed:'ϟ',chilled:'❄',hexed:'↓',smoke:'≋',starf:'★',swarm:'↑'};
        const statuses=Object.entries(unit.statuses??{}).filter(([,s])=>s.expiresAt==null||s.expiresAt>renderer.combat.tickCount);
        if(unit.shield>0)statuses.unshift(['shield',{}]);
        const key=statuses.map(([id,s])=>id+':'+Math.ceil(Math.max(0,(s.expiresAt-renderer.combat.tickCount)/renderer.combat.tickRate))).join('|');
        if(row.dataset.state===key)return;row.dataset.state=key;row.replaceChildren();
        for(const [id,state]of statuses.slice(0,3)){const icon=document.createElement('span');icon.className='combat-status-icon';icon.dataset.status=id;
            const name=t('status.'+id,{defaultValue:t('trait.'+id,{defaultValue:id})});const remaining=Number.isFinite(state.expiresAt)?Math.ceil((state.expiresAt-renderer.combat.tickCount)/renderer.combat.tickRate):null;
            icon.textContent=glyphs[id]??'✧';icon.title=name+(remaining!=null?' · '+remaining+'s':'');icon.setAttribute('aria-label',icon.title);row.append(icon);
        }
        if(statuses.length>3){const more=document.createElement('span');more.textContent='+'+(statuses.length-3);more.title=statuses.map(([id])=>t('status.'+id,{defaultValue:t('trait.'+id,{defaultValue:id})})).join(', ');row.append(more);}
    },
    record(combat,event){
        if(!['damage','heal','skill-cast','status','death','boss-phase-change'].includes(event.type))return;
        if(event.type==='damage'&&!(event.damage>0||event.absorbed>0))return;
        const id=event.unitId??event.defenderId,actor=event.attackerId??event.unitId;
        const name=uid=>{const unit=combat.units.get(uid);return unit?(window.PIECES?.[unit.pokemonId??unit.type]?.name??uid):combat.statistics?.get(uid)?.name??uid??'';};
        const key=[event.type,actor,id,event.status,event.source,event.critical,event.phase].join(':');
        if(event.type==='status'&&combat.tickCount-(this.recentLog.get(key)??-Infinity)<combat.tickRate)return;
        this.recentLog.set(key,combat.tickCount);if(this.recentLog.size>200)this.recentLog.delete(this.recentLog.keys().next().value);
        const record=this.logPending.get(key)??{event:{...event},actor:name(actor),target:name(id),amount:0,count:0};
        record.amount+=event.damage??event.amount??0;record.count++;this.logPending.set(key,record);
        if(this.logPending.size>=200)this.flushLog();
        if(!this.logTimer)this.logTimer=setTimeout(()=>this.flushLog(),200);
    },
    flushLog(){clearTimeout(this.logTimer);this.logTimer=null;
        for(const row of this.logPending.values()){
            const e=row.event;let text;
            if(e.type==='damage')text=t('log.damage',{actor:row.actor,target:row.target,amount:Math.round(row.amount),count:row.count});
            else if(e.type==='heal')text=t('log.heal',{target:row.target,amount:Math.round(row.amount)});
            else if(e.type==='death')text=t('log.knockout',{target:row.target});
            else if(e.type==='skill-cast')text=t('log.cast',{actor:row.actor,skill:t('skill.'+e.role+'.name',{defaultValue:e.skillName??''})});
            else if(e.type==='status')text=row.target+' · '+t('status.'+e.status,{defaultValue:t('trait.'+e.status,{defaultValue:e.status})});
            else text=t('combat.phase',{phase:e.phase});
            window.NotificationCenter?.record(text,'combat',false);
        }this.logPending.clear();
    },
    resetLog(){this.flushLog();this.recentLog.clear();}
};

class FloatingCombatTextManager {
    constructor(renderer){this.renderer=renderer;this.labels=new Map();this.recent=new Map();this.disposed=false;}
    push(parent,value,kind){
        const unitId=parent.dataset.unitId;if(!unitId||parent.dataset.lifecycle!=='ALIVE'||this.disposed)return;
        const display=CombatPresentation;const numeric=['hex-float-damage','hex-float-skill','hex-float-heal','hex-float-shield'].includes(kind);
        const skill=kind==='hex-float-skill-name',critical=kind==='hex-float-effective',boss=skill&&parent.classList.contains('hex-boss-unit');
        if(numeric&&!display.enabled('damage')||skill&&!display.enabled('skills')||kind==='hex-float-status'&&!display.enabled('status'))return;
        if(kind.includes('hex-float-resisted')&&!display.enabled('status'))return;
        const now=performance.now(),key=unitId+':'+kind;
        const number=String(value).match(/[-+]?[0-9]+(?:[.][0-9]+)?/);const existing=this.labels.get(key);
        if(numeric&&number&&existing&&now-existing.updated<120){existing.amount+=Math.abs(Number(number[0]));existing.updated=now;this.write(existing);return;}
        const priority=boss?5:skill?4:critical?3:numeric?2:1;
        const announceKey=kind+':'+value;
        if(!numeric&&now-(this.recent.get(announceKey)??-Infinity)<(boss?400:900))return;
        if(!numeric){this.recent.set(announceKey,now);if(this.recent.size>100)this.recent.delete(this.recent.keys().next().value);}
        if(existing)this.remove(existing);
        const same=[...this.labels.values()].filter(row=>row.unitId===unitId).sort((a,b)=>a.priority-b.priority);
        if(same.length>=2){if(same[0].priority>priority)return;this.remove(same[0]);}
        const cap=matchMedia('(max-width:1050px)').matches?12:24;
        if(this.labels.size>=cap){const low=[...this.labels.values()].sort((a,b)=>a.priority-b.priority)[0];if(low.priority>priority)return;this.remove(low);}
        const el=document.createElement('div');el.className='hex-floating-text '+kind;el.dataset.priority=priority;el.setAttribute('aria-hidden','true');
        const row={key,unitId,el,priority,amount:number?Math.abs(Number(number[0])):0,numeric,kind,value:String(value),updated:now,timer:null};
        this.labels.set(key,row);this.write(row);parent.append(el);row.timer=setTimeout(()=>this.remove(row),650);
        el.addEventListener('animationend',event=>{if(event.target===el)this.remove(row);},{once:true});
    }
    write(row){row.el.textContent=row.numeric?(row.kind==='hex-float-heal'?'+':row.kind==='hex-float-shield'?'◇ ':'−')+Math.round(row.amount):row.value;}
    remove(row){clearTimeout(row.timer);row.el.remove();if(this.labels.get(row.key)===row)this.labels.delete(row.key);}
    removeUnit(id){for(const row of this.labels.values())if(row.unitId===id)this.remove(row);}
    destroy(){this.disposed=true;for(const row of this.labels.values())this.remove(row);this.recent.clear();CombatPresentation.resetLog();}
}
window.FloatingCombatTextManager=FloatingCombatTextManager;
CombatPresentation.init();
