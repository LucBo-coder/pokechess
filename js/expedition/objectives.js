'use strict';
// Objectives resolve through the existing combat lifecycle, never through VFX.
window.ExpeditionObjectives={
    definitions:{elimination:{name:'Đánh bại toàn bộ đối thủ'},survival:{name:'Sống sót 30 giây',seconds:30},elitehunt:{name:'Hạ mục tiêu tinh anh'}},
    attach(combat,kind){const definition=this.definitions[kind];if(!definition)throw Error('Mục tiêu không hợp lệ.');combat.expeditionObjective={kind,targetId:[...combat.units.values()].find(u=>u.color==='b'&&u.isBoss)?.id??[...combat.units.values()].find(u=>u.color==='b')?.id,targetTick:(definition.seconds??0)*combat.tickRate};},
    verify(combat,winner){const objective=combat.expeditionObjective;if(!objective||winner!=='w'||!combat.initialTeams?.has('w')||!combat.initialTeams?.has('b'))return false;
        const alive=[...combat.units.values()].some(u=>u.color==='w'&&u.hp>0);if(!alive)return false;
        return objective.kind==='survival'?combat.tickCount>=objective.targetTick:objective.kind==='elitehunt'?!combat.units.has(objective.targetId):false;
    }
};
const expeditionCheckBattleEnd=HexCombat.prototype.checkBattleEnd;
HexCombat.prototype.checkBattleEnd=function(){if(!this.battleEnded&&ExpeditionObjectives.verify(this,'w')){this.finishBattle('w','objective');return;}return expeditionCheckBattleEnd.call(this);};
