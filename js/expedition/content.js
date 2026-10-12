'use strict';
window.ExpeditionContent={
    events:{
        shrine:{name:'Đền tinh lực',choices:[{id:'pray',label:'Dâng 8 vàng: nhận Tập trung',gold:8,blessing:'focus'},{id:'leave',label:'Rời đền'}]},
        rescue:{name:'Pokémon lạc đường',choices:[{id:'rescue',label:'Giúp Eevee: mất 5 Trainer HP, nhận Pokémon và mở starter',hp:5,pokemon:'133',unlock:true},{id:'guide',label:'Đội có hệ Grass: dẫn đường và nhận 6 vàng',type:'grass',gainGold:6},{id:'leave',label:'Rời đi'}]},
        curse:{name:'Giao kèo cổ xưa',choices:[{id:'accept',label:'Nhận lời: mất 8 Trainer HP, nhận Sức mạnh',hp:8,blessing:'power'},{id:'cleanse',label:'Trả 6 vàng: hồi 12 Trainer HP',gold:6,heal:12},{id:'leave',label:'Từ chối'}]},
        shortcut:{name:'Đường mòn nguy hiểm',choices:[{id:'risk',label:'Mạo hiểm: mất 10 Trainer HP, nhận 15 vàng',hp:10,gainGold:15},{id:'survey',label:'Đội có hệ Flying: khảo sát và nhận 8 vàng',type:'flying',gainGold:8},{id:'leave',label:'Tiếp tục an toàn'}]}
    },
    eligible(run,choice){return run.gold>=(choice.gold??0)&&run.trainerHp>(choice.hp??0)&&(!choice.type||run.squad.inventory.some(p=>[PIECES[p.type].element,PIECES[p.type].element2,...(PIECES[p.type].types??[])].includes(choice.type)))&&(!choice.blessing||(run.blessings[choice.blessing]??0)<Expedition.blessings[choice.blessing].max);},
    apply(run,profile,id){const event=this.events[run.nodeState.event],choice=event?.choices.find(c=>c.id===id);if(!choice||!this.eligible(run,choice))throw Error('Lựa chọn không đủ điều kiện.');run.gold+= (choice.gainGold??0)-(choice.gold??0);run.trainerHp=Math.min(run.maxTrainerHp,run.trainerHp-(choice.hp??0)+(choice.heal??0));if(choice.blessing)Expedition.grant(run,{kind:'blessing',blessing:choice.blessing});if(choice.pokemon)Expedition.grant(run,{kind:'pokemon',species:choice.pokemon});if(choice.unlock&&!profile.unlocks.starters.includes(choice.pokemon))profile.unlocks.starters.push(choice.pokemon);}
};

// Region effects use the existing shield/heal/status/damage methods and die
// with their owning combat. Telegraphs refer to cells, not invisible sprites.
window.ExpeditionRegions={
    attach(combat,act){combat.expeditionRegion={act,nextWarning:combat.tickRate*8,pending:null};for(const u of combat.units.values()){if(u.color!=='w')continue;if(act===0&&HexEffects.matches(u,'grass'))combat.addShield(u,8,u,12);if(act===1&&Math.floor(u.square/7)===4)combat.addShield(u,12,u,12);if(act===2&&HexEffects.matches(u,'psychic'))combat.gainMana(u,10);}},
    update(combat){const state=combat.expeditionRegion;if(!state||combat.battleEnded)return;const boss=[...combat.units.values()].find(u=>u.color==='b'&&u.isBoss);if(!boss||boss.hp<=0)return;
        if(state.pending&&combat.tickCount>=state.pending.at){const hazard=state.pending;state.pending=null;combat.emit({type:'expedition-telegraph',ownerId:boss.id,cells:[],clear:true});for(const target of [...combat.units.values()].filter(u=>u.color==='w'&&hazard.cells.includes(u.square))){if(state.act===0)HexEffects.dot(combat,boss,target,'poison',3,3);else if(state.act===1)combat.dealDamage(boss,target,boss.attackDamage*.7,'skill',{element:'rock',area:true});else{target.mana=Math.max(0,target.mana-20);combat.addShield(boss,8,boss,5);}}combat.checkBattleEnd();}
        if(combat.battleEnded||combat.tickCount<state.nextWarning)return;state.nextWarning=combat.tickCount+combat.tickRate*10;
        const allies=[...combat.units.values()].filter(u=>u.color==='w');if(!allies.length)return;const target=allies[Math.floor(combat.random()*allies.length)],cells=state.act===1?allies.filter(u=>Math.floor(u.square/7)===Math.floor(target.square/7)).map(u=>u.square):[target.square];
        state.pending={at:combat.tickCount+Math.ceil(combat.tickRate*1.5),cells};combat.emit({type:'expedition-telegraph',ownerId:boss.id,cells,clear:false});const text=['Trùm: vùng độc','Trùm: đá lở','Trùm: hút năng lượng'][state.act];for(const u of allies.filter(u=>cells.includes(u.square))){u.statuses.bossWarning={expiresAt:state.pending.at};combat.emit({type:'status',unitId:u.id,status:'bossWarning',duration:1.5});}window.NotificationCenter?.record(`${text} · Hex ${cells.join(', ')} · 1,5 giây`,'boss',false);
    }
};
const expeditionRegionStep=HexCombat.prototype.step;
HexCombat.prototype.step=function(){expeditionRegionStep.call(this);ExpeditionRegions.update(this);};

if(window.HexRenderer){
    const event=HexRenderer.prototype.handleEvent,destroy=HexRenderer.prototype.destroy;
    const clear=renderer=>{for(const zone of renderer.expeditionZones??[])zone.remove();renderer.expeditionZones?.clear();};
    HexRenderer.prototype.handleEvent=function(e){
        if(e.type==='expedition-telegraph'){
            clear(this);this.expeditionZones??=new Set();this.expeditionZoneOwner=e.ownerId;
            if(!this.destroyed&&!e.clear&&this.combat.units.get(e.ownerId)?.hp>0)for(const square of e.cells){const cell=this.getCell(square);if(!cell)continue;const zone=document.createElement('span');zone.className='expedition-danger-zone';zone.textContent='!';zone.setAttribute('aria-label',t('status.bossWarning'));cell.append(zone);this.expeditionZones.add(zone);}
        }else if(e.type==='battle-end'||e.type==='death'&&e.unitId===this.expeditionZoneOwner)clear(this);
        return event.call(this,e);
    };
    HexRenderer.prototype.destroy=function(){clear(this);return destroy.call(this);};
}
