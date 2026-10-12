'use strict';

// Only this adapter touches the Classic controller. All Expedition mutations
// are checkpointed in one versioned envelope before their UI is presented.
window.ExpeditionSession={
    fields:['inventory','placedPieces','setupFormation','pendingEvolutions','invNextId','talismanNextId','talismanInventory','cardChoices','talismanChoices','maxSlots','slotUpgradeIndex'],
    checkpoint(change=()=>{},capture=true){
        const next=Expedition.clone(this.profile),run=next.run,ui=window.roguelikeUI;
        if(this.clock&&run)run.elapsedMs+=Math.max(0,Date.now()-this.clock);
        if(capture&&run&&ui.expeditionRun){for(const key of this.fields)run.squad[key]=Expedition.clone(ui[key]??run.squad[key]);run.gold=ui.gold;}
        change(run,next);this.profile=ExpeditionStore.write(next,this.profile.revision);this.clock=Date.now();this.hydrate(false);return this.profile.run;
    },
    hydrate(setup=false){const ui=window.roguelikeUI,r=this.profile.run;ui.expeditionRun=r;
        for(const key of this.fields)ui[key]=r.squad[key];ui.gold=r.gold;ui.stage=Expedition.stage(r);
        ui.runState={version:3,id:r.id,seed:Expedition.hash(r.seed),upgrades:r.upgrades,freeRerolls:0,lastVictoryStage:0,pendingReward:null,pendingEvent:null,eventStages:[]};
        ui.masteryProfile={...MasterySystem.fresh(`expedition:${this.profile.id}`),species:this.profile.species};ui.currentSaveSlot=null;
        if(setup){ui.phase='setup';ui.setupNewStage();}
        this.render?.();
    },
    enter(id='1',options=null){const ui=window.roguelikeUI;if(ui.phase==='battle')throw Error('Hãy kết thúc trận hiện tại trước.');
        let profile=ExpeditionStore.read(id)??Expedition.freshProfile(id);
        if(options){if(profile.run&&!['victory','defeat'].includes(profile.run.status))throw Error('Hãy tiếp tục hoặc kết thúc run hiện tại.');profile=ExpeditionStore.write({...profile,run:Expedition.create(profile,options)},profile.revision);}
        if(!profile.run)throw Error('Chưa có Expedition để tiếp tục.');
        // Interrupted combat restarts the same encounter; no result was awarded.
        if(profile.run.status==='battle'){profile.run.status='preparation';profile=ExpeditionStore.write(profile,profile.revision);}
        if(!this.classic){this.classic={};for(const key of [...this.fields,'stage','gold','runState','masteryProfile','currentSaveSlot','isGameActive'])this.classic[key]=Expedition.clone(ui[key]??null);}
        this.profile=profile;
        ui.closeMainMenu?.();ui.closeAllModals?.();ui.isGameActive=true;this.clock=Date.now();this.hydrate(this.profile.run.status==='preparation');this.render();
        window.GameNavigation?.remember('expedition',String(id));
    },
    leave(){const ui=window.roguelikeUI;if(!ui.expeditionRun)return;if(ui.phase==='battle')throw Error('Không thể chuyển chế độ giữa trận.');this.checkpoint();ui.disposeHexBattle();delete ui.expeditionRun;Object.assign(ui,this.classic);this.classic=null;ui.phase='setup';ui.setupNewStage();this.render();},
    select(id){this.checkpoint(run=>Expedition.select(run,id));if(this.profile.run.status==='preparation'){this.hydrate(true);this.checkpoint();}this.render();},
    action(id){this.checkpoint((run,profile)=>{
        if(run.status==='reward'){if(!Expedition.claim(run,id))throw Error('Lựa chọn đã được xử lý.');}
        else if(run.status==='node'){
            const node=Expedition.node(run),receipt=`node:${node.id}`;if(run.receipts.includes(receipt))return;
            if(node.type==='rest'){if(id==='heal')run.trainerHp=Math.min(run.maxTrainerHp,run.trainerHp+Math.ceil(run.maxTrainerHp*Expedition.CONFIG.restRatio));else if(id==='train')Expedition.grant(run,{kind:'blessing',blessing:'power'});else throw Error('Lựa chọn không hợp lệ.');}
            else if(node.type==='shop'){if(id==='leave'){Expedition.complete(run);return;}const offer=run.nodeState.offers?.find(o=>o.id===id);if(!offer||run.gold<offer.price)throw Error('Không đủ vàng.');run.gold-=offer.price;Expedition.grant(run,offer);run.nodeState.offers=run.nodeState.offers.filter(o=>o.id!==id);return;}
            else if(node.type==='treasure'){if(id!=='open')throw Error('Lựa chọn không hợp lệ.');run.gold+=12+run.act*4;if(run.talismans.length<3){const choices=Object.keys(Expedition.talismans).filter(x=>!run.talismans.includes(x));if(choices.length)run.talismans.push(Expedition.pick(run,'treasure',choices));}}
            else if(node.type==='event'){ExpeditionContent.apply(run,profile,id);}
            run.receipts.push(receipt);Expedition.complete(run);
        }
        if(['victory','defeat'].includes(run.status))this.recordResult(run,profile);
    });this.render();},
    recordResult(run,profile){const receipt=`history:${run.id}`;if(run.receipts.includes(receipt))return;run.receipts.push(receipt);profile.history.unshift({id:run.id,seed:run.seed,status:run.status,act:run.act+1,nodes:run.completed.length,trainerHp:run.trainerHp,ascension:run.ascension,elapsedMs:run.elapsedMs,endedAt:Date.now()});profile.history=profile.history.slice(0,50);
        profile.unlocks.starters=[...new Set([...profile.unlocks.starters,...run.squad.inventory.map(p=>String(p.type))])];
        if(run.status==='victory'){profile.unlocks.ascension=Math.max(profile.unlocks.ascension,Math.min(10,run.ascension+1));if(!profile.unlocks.loadouts.includes('guardian'))profile.unlocks.loadouts.push('guardian');}
    },
    abandon(){this.checkpoint((run,profile)=>{run.status='defeat';this.recordResult(run,profile);});window.roguelikeUI.phase='setup';this.render();},
    evolveAfterVictory(run,ui){run.squad.pendingEvolutions=[];for(const item of run.squad.inventory){if(!ui.deployedInBattleIds?.has(item.id))continue;const def=PIECES[item.type],discount=window.SynergySystem?.getEvoDiscount(item,ui)??0;if(!def?.battlesToEvolve||def.evoItem||item.battlesFought<Math.max(1,def.battlesToEvolve-discount))continue;let next=def.nextEvo;if((!next||next==='null')&&def.evoBranches?.length)next=Expedition.pick(run,`evolution:${item.instanceId}`,def.evoBranches);if(PIECES[next])run.squad.pendingEvolutions.push({oldName:def.name,newName:PIECES[next].name,oldType:item.type,nextType:next,invId:item.id});}},
    encounter(run){const node=Expedition.node(run);if(!node)return null;if(node.encounter)return node.encounter;
        const region=Expedition.regions[run.act],pool=Object.keys(PIECES).filter(id=>/^\d+$/.test(id)&&PIECES[id].stage<=run.act+1&&[PIECES[id].element,PIECES[id].element2].some(t=>region.types.includes(t)));
        const count=Math.min(12,3+run.act*2+(node.type==='elite'?1:0));node.encounter={pieces:Array.from({length:count},()=>Expedition.pick(run,`encounter:${node.id}`,pool.length?pool:run.starters)),objective:node.type==='challenge'?'survival':node.type==='elite'?'elitehunt':'elimination'};
        if(node.type==='boss')node.encounter.pieces[0]=region.boss;return node.encounter;
    }
};

(() => {
    const p=RoguelikeUI.prototype,S=ExpeditionSession,E=Expedition;
    const wrap=(object,name,fn)=>{const original=object[name];if(typeof original==='function')object[name]=function(...args){return fn.call(this,original,args);};};
    wrap(p,'getEnemyPiecesForStage',function(original,args){return this.expeditionRun?[...S.encounter(this.expeditionRun).pieces]:original.apply(this,args);});
    wrap(p,'getEnemyStageScaling',function(original,args){const r=this.expeditionRun;return r?{hpMultiplier:1+r.act*.25+(E.node(r)?.depth??0)*.025+r.ascension*.04,attackMultiplier:1+r.act*.18+r.ascension*.03}:original.apply(this,args);});
    wrap(p,'createStageBoss',function(original,args){const r=this.expeditionRun;if(!r)return original.apply(this,args);const type=E.node(r)?.type;return ['boss','elite'].includes(type)?{isBoss:true,bossType:type,hpMultiplier:type==='boss'?2.5:1.6,attackMultiplier:1.25,bossSkills:type==='boss'?['bossStrike','areaBlast','enrage']:['bossStrike'],skillCount:type==='boss'?3:1}:null;});
    wrap(MetaProgression,'getAllocatedNodes',function(original,args){return E.active()?[]:original.apply(this,args);});
    wrap(MetaProgression,'getSelectedStarters',function(original,args){return E.active()?.starters??original.apply(this,args);});
    wrap(MetaProgression,'save',function(original,args){if(E.active())return false;return original.apply(this,args);});
    wrap(p,'getEffectivePieceStats',function(original,args){const r=this.expeditionRun;if(!r||args[0]?.color!=='w')return original.apply(this,args);const modifiers={hp:0,attack:0,speed:0,sources:[]};for(const [id,count]of Object.entries(r.blessings)){const b=E.blessings[id];modifiers.hp+=(b.hp??0)*count;modifiers.attack+=(b.attack??0)*count;modifiers.speed+=(b.speed??0)*count;modifiers.sources.push({sourceId:`blessing:${id}`,count,method:'flat before Hex scaling'});}for(const id of r.talismans){modifiers.speed+=E.talismans[id].speed??0;modifiers.sources.push({sourceId:`team-talisman:${id}`,count:1,method:'flat before Hex scaling'});}return original.call(this,args[0],{...(args[1]??{}),expeditionModifiers:modifiers});});
    wrap(HexBridge.prototype,'getUnitStats',function(original,args){const stats=original.apply(this,args),r=this.ui.expeditionRun;if(r&&args[0].color==='w'){stats.hp=stats.maxHp;const shield=(r.blessings.barrier??0)*8+r.talismans.reduce((n,id)=>n+(E.talismans[id].shield??0),0);stats.shield=(stats.shield??0)+shield;stats.mana=Math.min(stats.maxMana??100,(stats.mana??0)+(r.blessings.focus??0)*10+r.talismans.reduce((n,id)=>n+(E.talismans[id].mana??0),0));}return stats;});
    wrap(p,'saveRoguelikeProgress',function(original,args){if(this.expeditionRun){S.checkpoint();return;}return original.apply(this,args);});
    wrap(SaveSystem,'saveToSlot',function(original,args){if(args[1]?.expeditionRun){S.checkpoint();return true;}return original.apply(this,args);});
    wrap(p,'saveGameSlot',function(original,args){if(this.expeditionRun){S.checkpoint();this.showToast(`Đã lưu Expedition ${S.profile.id}.`,'success');return;}return original.apply(this,args);});
    wrap(p,'openSaveSlotsModal',function(original,args){if(this.expeditionRun){S.menu='setup';S.render();return;}return original.apply(this,args);});
    wrap(MasterySystem,'persist',function(original,args){if(args[0]?.expeditionRun){S.checkpoint((r,profile)=>{profile.species=E.clone(args[0].masteryProfile.species);});return;}return original.apply(this,args);});
    wrap(HexBridge.prototype,'createCombat',function(original,args){const r=this.ui.expeditionRun;if(!r)return original.apply(this,args);const encounterRandom={rng:{states:{}},seed:`${r.seed}:${r.currentNode}`};const combat=original.call(this,{...(args[0]??{}),random:()=>E.random(encounterRandom,'combat')});for(const unit of combat.units.values())if(unit.color==='w')combat.addShield(unit,(r.blessings.barrier??0)*8+r.talismans.reduce((n,id)=>n+(E.talismans[id].shield??0),0),unit);window.ExpeditionObjectives?.attach(combat,S.encounter(r).objective);window.ExpeditionRegions?.attach(combat,r.act);return combat;});
    for(const name of ['generateRewardCards','rollTalismanChoices'])wrap(p,name,function(original,args){if(!this.expeditionRun)return original.apply(this,args);const random=Math.random;Math.random=()=>E.random(this.expeditionRun,`shop:${name}`);try{return original.apply(this,args);}finally{Math.random=random;}});
    for(const name of ['pickRewardPiece','buyTalisman','applyTalismanToPiece','executeSellPiece','sellBagTalisman','buySlotUpgrade','deployBenchPiece','recallPieceFromBoard','recallAllPieces','autoArrangePlayerFormation','swapOrMoveBoardPieces','triggerInstantEvolution'])wrap(p,name,function(original,args){if(this.expeditionRun&&this.expeditionRun.status!=='preparation')return false;const result=original.apply(this,args);if(this.expeditionRun)S.checkpoint();return result;});
    wrap(p,'startBattle',function(original,args){if(!this.expeditionRun)return original.apply(this,args);if(this.expeditionRun.status!=='preparation'||!this.placedPieces.length)return;
        S.checkpoint(r=>{r.status='battle';const receipt=`start:${r.currentNode}:${r.attempt}`;if(!r.receipts.includes(receipt)){r.receipts.push(receipt);r.trainerHp=Math.min(r.maxTrainerHp,r.trainerHp+(r.blessings.recovery??0)*5);}});original.apply(this,args);if(!this.hexCombat)S.checkpoint(r=>{r.status='preparation';});S.render();});
    wrap(p,'finishHexBattle',function(original,args){if(!this.expeditionRun)return original.apply(this,args);const combat=this.hexCombat;if(!combat?.battleEnded||!combat.resultVerified||this.hexBattleFinished)return;this.disposeHexBattle(true);this.phase='setup';
        try {
            S.checkpoint((r,profile)=>{
                if(!E.resolve(r,{winner:combat.winner,summary:combat.getSummary()}))return;
                const speciesGains={};
                for(const unit of combat.getSummary().units){
                    if(unit.color!=='w')continue;
                    const item=r.squad.inventory.find(p=>p.id===unit.invId);if(!item)continue;
                    item.wounds=0;if(combat.winner==='w')item.battlesFought++;
                    const xp=20+(combat.winner==='w'?20:0);speciesGains[item.type]=Math.max(speciesGains[item.type]??0,xp);
                    const individual=item.individualMastery??{};individual.xp=Math.min(5000,(individual.xp??0)+xp);individual.rank=MasterySystem.rank(individual.xp);individual.stats??={};for(const key of ['damageDealt','damageTaken','healingDone','skillsUsed','shieldProvided','aliveTicks'])individual.stats[key]=(Number(individual.stats[key])||0)+(Number(unit[key])||0);item.individualMastery=individual;
                }
                for(const [id,xp]of Object.entries(speciesGains))profile.species[id]=MasterySystem.speciesRecord(id,(profile.species[id]?.xp??0)+xp);
                if(combat.winner==='w')S.evolveAfterVictory(r,this);
                if(['victory','defeat'].includes(r.status))S.recordResult(r,profile);
            });
            this.hexBattleFinished=true;
        }catch(error){S.error=`Chưa lưu được kết quả: ${error.message}`;}
        S.render();
    });
    for(const name of ['resetRun','loadGameSlot','applySaveData','openSkillTreeModal','retryBattle','advanceRoguelikeStage'])wrap(p,name,function(original,args){if(this.expeditionRun){S.error='Hãy trở về Classic trước khi dùng Save/Astral cũ.';S.render();return false;}return original.apply(this,args);});
})();
