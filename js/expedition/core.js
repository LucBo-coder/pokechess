'use strict';

// Expedition saves never overwrite Classic slots or the global Astral store.
window.Expedition = {
    VERSION: 1,
    CONFIG: Object.freeze({acts:3,steps:9,trainerHp:100,startingGold:10,loss:{battle:10,elite:15,boss:20,challenge:15},restRatio:.3,teamSlots:[3,5,7],teamCap:12}),
    clone(value){return JSON.parse(JSON.stringify(value));},
    hash(value){let h=2166136261;for(const ch of String(value)){h=Math.imul(h^ch.charCodeAt(0),16777619);}return h>>>0;},
    random(run,stream){const states=run.rng.states;let s=states[stream]??this.hash(`${run.seed}:${stream}:1`);s=(s+0x6D2B79F5)>>>0;states[stream]=s;let x=Math.imul(s^(s>>>15),s|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296;},
    pick(run,stream,items){return items[Math.floor(this.random(run,stream)*items.length)];},
    active(){return window.roguelikeUI?.expeditionRun??null;},
    regions:[{id:'forest',name:'Rừng Nguyên Sơ',types:['grass','bug','normal'],boss:'3'},{id:'frontier',name:'Biên Giới Biến Động',types:['rock','ground','water','electric'],boss:'248'},{id:'sanctuary',name:'Thánh Địa Tinh Tú',types:['psychic','ghost','dragon','fairy'],boss:'150'}],
    nodeTypes:{battle:{label:'Chiến đấu',icon:'⚔'},elite:{label:'Tinh anh',icon:'◆'},boss:{label:'Trùm',icon:'♛'},event:{label:'Sự kiện',icon:'?'},shop:{label:'Cửa hàng',icon:'▣'},rest:{label:'Nghỉ ngơi',icon:'♥'},treasure:{label:'Kho báu',icon:'◇'},challenge:{label:'Thử thách',icon:'!'}},
    blessings:{vigor:{name:'Sinh lực',text:'+6 HP cơ bản cho cả đội.',max:3,hp:6},power:{name:'Sức mạnh',text:'+2 ATK cơ bản cho cả đội.',max:3,attack:2},tempo:{name:'Nhịp độ',text:'+10 tốc độ cho cả đội.',max:3,speed:10},recovery:{name:'Hồi phục',text:'Đầu trận hồi 5 Trainer HP.',max:2,trainerHeal:5},barrier:{name:'Rào chắn',text:'Đầu trận nhận shield 8 HP quy đổi Hex.',max:3,shield:8},focus:{name:'Tập trung',text:'Đầu trận nhận thêm 10 năng lượng.',max:3,mana:10}},
    talismans:{guard:{name:'Bùa hộ vệ',text:'Cả đội nhận thêm shield 10 HP quy đổi Hex đầu trận.',shield:10},spark:{name:'Bùa tinh lực',text:'Cả đội nhận thêm 15 năng lượng đầu trận.',mana:15},wind:{name:'Bùa phong hành',text:'Cả đội +12 tốc độ.',speed:12}},
    freshProfile(id,starters=[]){return {version:1,id,revision:0,unlocks:{starters:[...new Set(['1','4','7',...starters])],ascension:0,events:['shrine','rescue','curse'],loadouts:['standard']},species:{},achievements:[],history:[],run:null};},
    create(profile,{seed,starters=['1','4','7'],ascension=0,loadout='standard'}={}){
        if(starters.length<1||starters.length>3||new Set(starters).size!==starters.length||starters.some(id=>!profile.unlocks.starters.includes(id)||!PIECES[id]))throw Error('Đội khởi đầu không hợp lệ.');
        if(!Number.isInteger(ascension)||ascension<0||ascension>profile.unlocks.ascension)throw Error('Độ khó chưa mở.');
        const run={version:1,generatorVersion:1,id:`exp-${Date.now().toString(36)}-${this.hash(`${seed}:${profile.revision}:${profile.id}`)}`,seed:String(seed??Date.now()),rng:{version:1,states:{}},status:'route',act:0,currentNode:null,completed:[],receipts:[],trainerHp:this.CONFIG.trainerHp,maxTrainerHp:this.CONFIG.trainerHp,gold:this.CONFIG.startingGold,ascension,loadout,starters:[...starters],blessings:{},talismans:[],pendingReward:null,pendingResult:null,startedAt:Date.now(),elapsedMs:0,revision:0,
            squad:{inventory:starters.map((type,i)=>({id:i+1,type,starterSpeciesId:type,battlesFought:0,talismans:[],maxTalismans:3,traits:[],wounds:0})),placedPieces:[],setupFormation:[],pendingEvolutions:[],invNextId:starters.length+1,talismanNextId:1,talismanInventory:[],cardChoices:[],talismanChoices:[],maxSlots:3,slotUpgradeIndex:0},upgrades:{hp:0,attack:0,speed:0}};
        for(const item of run.squad.inventory){item.instanceId=`${run.id}:${item.id}`;item.individualMastery={xp:0,rank:'novice',stats:{},selectedSkillVariant:'original'};}
        if(loadout==='guardian'&&profile.unlocks.loadouts.includes(loadout))run.talismans=['guard'];
        else if(loadout!=='standard')throw Error('Bộ khởi đầu chưa mở.');
        run.speciesCombatVersion=window.SpeciesCombat?SpeciesCombat.VERSION:0;
        run.maps=this.regions.map((_,act)=>this.generateMap(run,act));return run;
    },
    generateMap(run,act){const nodes=[];for(let depth=0;depth<this.CONFIG.steps;depth++){
        const width=depth===this.CONFIG.steps-1?1:3;
        for(let lane=0;lane<width;lane++){
            const type=depth===this.CONFIG.steps-1?'boss':depth===0?'battle':depth===3&&lane===1||depth===6&&lane===1?'rest':this.pick(run,`route:${act}`,['battle','battle','elite','event','shop','rest','treasure','challenge']);
            nodes.push({id:`a${act}-d${depth}-l${lane}`,act,depth,lane,type,next:[],encounterSeed:this.hash(`${run.seed}:${act}:${depth}:${lane}`)});
        }
    }
    for(const node of nodes){const next=nodes.filter(n=>n.depth===node.depth+1);node.next=next.filter(n=>Math.abs(n.lane-node.lane)<=1||next.length===1).map(n=>n.id);}
    const graph={act,nodes};this.validateMap(graph);return graph;},
    validateMap(graph){if(!Array.isArray(graph?.nodes)||!graph.nodes.length||graph.nodes.some(n=>typeof n.id!=='string'||!Number.isInteger(n.depth)||n.depth<0||n.depth>=this.CONFIG.steps||!Number.isInteger(n.lane)||n.lane<0||n.lane>2||!Array.isArray(n.next)))throw Error('Bản đồ không hợp lệ.');const ids=new Set(graph.nodes.map(n=>n.id));if(ids.size!==graph.nodes.length)throw Error('Trùng node.');
        const visited=new Set(),queue=graph.nodes.filter(n=>n.depth===0).map(n=>n.id);while(queue.length){const id=queue.shift();if(visited.has(id))continue;visited.add(id);const node=graph.nodes.find(n=>n.id===id);if(!node||!this.nodeTypes[node.type])throw Error('Node không hợp lệ.');for(const to of node.next){const target=graph.nodes.find(n=>n.id===to);if(!target||target.depth!==node.depth+1)throw Error('Đường nối không hợp lệ.');queue.push(to);}if(node.type!=='boss'&&!node.next.length)throw Error('Đường cụt.');}
        const bosses=graph.nodes.filter(n=>n.type==='boss');if(visited.size!==graph.nodes.length||bosses.length!==1||bosses[0].depth!==this.CONFIG.steps-1||bosses[0].next.length)throw Error('Bản đồ không liên thông.');return true;},
    node(run,id=run.currentNode){return run.maps[run.act].nodes.find(n=>n.id===id);},
    available(run){if(run.status!=='route')return [];const prior=this.node(run);if(prior?.type==='boss'&&!run.completed.includes(prior.id))return [prior];return run.maps[run.act].nodes.filter(n=>prior?prior.next.includes(n.id):n.depth===0);},
    stage(run){return run.act*this.CONFIG.steps+(this.node(run)?.depth??0)+1;},
    select(run,id){if(!this.available(run).some(n=>n.id===id))throw Error('Không thể đi đến node này.');run.currentNode=id;const node=this.node(run);run.status=['battle','elite','boss','challenge'].includes(node.type)?'preparation':'node';
        run.attempt=(run.attempt??0)+1;run.squad.cardChoices=[];run.squad.talismanChoices=[];run.nodeState={};if(node.type==='event')run.nodeState.event=this.pick(run,`event:${id}`,['shrine','rescue','curse','shortcut']);return node;},
    complete(run){const node=this.node(run);if(!run.completed.includes(node.id))run.completed.push(node.id);
        if(node.type==='boss'){if(run.act===this.CONFIG.acts-1){run.status='victory';return;}run.act++;run.currentNode=null;run.squad.maxSlots=Math.max(run.squad.maxSlots,this.CONFIG.teamSlots[run.act]);}
        run.status='route';run.nodeState=null;
    },
    rewardOffers(run){const pool=Object.keys(PIECES).filter(id=>/^\d+$/.test(id)&&PIECES[id].stage<=Math.min(3,run.act+1));const blessings=Object.keys(this.blessings).filter(id=>(run.blessings[id]??0)<this.blessings[id].max);const items=Object.keys(TALISMANS).filter(id=>TALISMANS[id].category==='held');
        return [{id:'gold',kind:'gold',amount:8+run.act*3},{id:'pokemon',kind:'pokemon',species:this.pick(run,`reward:${run.currentNode}`,pool)},blessings.length?{id:'blessing',kind:'blessing',blessing:this.pick(run,`reward:${run.currentNode}`,blessings)}:{id:'equipment',kind:'equipment',item:this.pick(run,`reward:${run.currentNode}`,items)}];},
    resolve(run,{winner,summary=null}){const receipt=`result:${run.currentNode}:${run.attempt??0}`;if(run.status!=='battle'||run.receipts.includes(receipt))return false;
        run.receipts.push(receipt);run.pendingResult={winner,summary};
        if(winner==='w'){run.gold+=6+run.act*2;run.pendingReward=this.rewardOffers(run);run.status='reward';}
        else{run.trainerHp=Math.max(0,run.trainerHp-this.CONFIG.loss[this.node(run).type]);if(run.trainerHp===0)run.status='defeat';else if(this.node(run).type==='boss')run.status='route';else this.complete(run);}
        return true;},
    claim(run,id){if(run.status!=='reward'||run.receipts.includes(`reward:${run.currentNode}`))return false;const offer=run.pendingReward?.find(o=>o.id===id);if(!offer)return false;
        this.grant(run,offer);run.receipts.push(`reward:${run.currentNode}`);run.pendingReward=null;this.complete(run);return true;},
    grant(run,offer){if(offer.kind==='gold')run.gold+=offer.amount;
        if(offer.kind==='blessing'){const def=this.blessings[offer.blessing];run.blessings[offer.blessing]=Math.min(def.max,(run.blessings[offer.blessing]??0)+1);}
        if(offer.kind==='pokemon'){const id=run.squad.invNextId++;run.squad.inventory.push({id,type:offer.species,instanceId:`${run.id}:${id}`,battlesFought:0,talismans:[],maxTalismans:3,traits:[],wounds:0});}
        if(offer.kind==='equipment'){run.squad.talismanInventory.push({id:run.squad.talismanNextId++,talismanId:offer.item,usesLeft:1,maxUses:1});}},
    validateProfile(p){if(p?.version!==1||typeof p.id!=='string'||!Number.isInteger(p.revision)||p.revision<0||!Array.isArray(p.history)||!Array.isArray(p.unlocks?.starters)||p.unlocks.starters.some(id=>!Object.hasOwn(PIECES,id))||!Array.isArray(p.unlocks.loadouts)||!Number.isInteger(p.unlocks.ascension)||p.unlocks.ascension<0||p.unlocks.ascension>10||!p.species||typeof p.species!=='object'||Array.isArray(p.species))throw Error('Hồ sơ Expedition không hợp lệ.');
        const r=p.run;if(r){
            if(r.speciesCombatVersion!==undefined&&![0,1].includes(r.speciesCombatVersion))throw Error('Phiên bản combat species không hỗ trợ.');
            if(r.version!==1||!['route','node','preparation','battle','reward','victory','defeat'].includes(r.status)||!Number.isFinite(r.trainerHp)||!Number.isFinite(r.maxTrainerHp)||r.maxTrainerHp<=0||r.trainerHp<0||r.trainerHp>r.maxTrainerHp||!Number.isFinite(r.gold)||r.gold<0||!Array.isArray(r.receipts)||!Array.isArray(r.squad?.inventory)||!Number.isInteger(r.act)||r.act<0||r.act>=3||r.maps?.length!==3||r.rng?.version!==1||!r.rng.states)throw Error('Run không hợp lệ.');
            if(Object.values(r.rng.states).some(value=>!Number.isInteger(value)||value<0||value>4294967295)||!r.blessings||Object.entries(r.blessings).some(([id,count])=>!this.blessings[id]||!Number.isInteger(count)||count<0||count>this.blessings[id].max)||!Array.isArray(r.talismans)||r.talismans.length>3||new Set(r.talismans).size!==r.talismans.length||r.talismans.some(id=>!Object.hasOwn(this.talismans,id))||!Number.isInteger(r.squad.maxSlots)||r.squad.maxSlots<1||r.squad.maxSlots>this.CONFIG.teamCap)throw Error('Build không hợp lệ.');
            for(const [act,map]of r.maps.entries()){this.validateMap(map);if(map.act!==act||map.nodes.some(n=>n.act!==act))throw Error('Act không hợp lệ.');}
            if(r.currentNode&&!this.node(r))throw Error('Node hiện tại không tồn tại.');
            const ids=new Set();for(const unit of r.squad.inventory){if(!Object.hasOwn(PIECES,unit.type)||!Number.isInteger(unit.id)||ids.has(unit.id)||!Array.isArray(unit.talismans)||unit.talismans.some(id=>!Object.hasOwn(TALISMANS,id)))throw Error('Đội hình không hợp lệ.');ids.add(unit.id);}
            if(!Number.isInteger(r.squad.invNextId)||r.squad.inventory.some(p=>p.id>=r.squad.invNextId))throw Error('ID Pokémon không hợp lệ.');
            if(r.status==='reward'&&!Array.isArray(r.pendingReward))throw Error('Thiếu phần thưởng.');
        }return true;}
};

window.ExpeditionStore={
    prefix:'pokechess_expedition_v1:',
    read(id){const raw=localStorage.getItem(this.prefix+id);if(!raw)return null;const p=JSON.parse(raw);Expedition.validateProfile(p);return p;},
    write(profile,expectedRevision){Expedition.validateProfile(profile);const key=this.prefix+profile.id,old=localStorage.getItem(key),current=old?JSON.parse(old):null;
        if((current?.revision??0)!==expectedRevision)throw Error('Hồ sơ đã thay đổi ở cửa sổ khác. Hãy tải lại.');
        const next=Expedition.clone(profile);next.revision=expectedRevision+1;if(next.run)next.run.revision=next.revision;
        if(old)localStorage.setItem(key+':backup',old);localStorage.setItem(key,JSON.stringify(next));return next;},
    restore(id){const raw=localStorage.getItem(this.prefix+id+':backup');if(!raw)throw Error('Chưa có bản sao lưu.');const p=JSON.parse(raw);Expedition.validateProfile(p);if(p.id!==id)throw Error('Sai hồ sơ.');let current;try{current=this.read(id);}catch(error){const next=Expedition.clone(p);next.revision++;if(next.run)next.run.revision=next.revision;localStorage.setItem(this.prefix+id,JSON.stringify(next));return next;}p.revision=current?.revision??0;return this.write(p,p.revision);},
    export(id){return JSON.stringify({format:'pokechess-expedition',version:1,profile:this.read(id)},null,2);},
    import(text,id){const data=JSON.parse(text);if(data.format!=='pokechess-expedition'||data.version!==1||data.profile?.id!==id)throw Error('Tệp Expedition không hợp lệ.');Expedition.validateProfile(data.profile);const existing=this.read(id);return this.write({...data.profile,revision:existing?.revision??0},existing?.revision??0);}
};
