const test=require('node:test');
const assert=require('node:assert/strict');
const {loadGame}=require('./game-context.cjs');

test('Death resolves once and invalidates owned pending hits',()=>{
 const {run}=loadGame();const r=run(`(()=>{const c=new HexCombat(new HexBoard()),events=[];c.onEvent=e=>events.push(e);
 c.addUnit(35,{id:'a',color:'w',maxHp:100});c.addUnit(21,{id:'b',color:'b',maxHp:100});
 const a=c.units.get('a');c.pendingHits=[{attackerId:'a',defenderId:'b'},{attackerId:'b',defenderId:'a'}];
 c.killUnit(a);c.killUnit(a);return {deaths:events.filter(e=>e.type==='death').length,pending:c.pendingHits.length,removed:!c.units.has('a'),state:a.lifecycle};})()`);
 assert.equal(r.deaths,1);assert.equal(r.pending,0);assert.ok(r.removed);assert.equal(r.state,'REMOVED');
});

test('Astral registry covers every node; repeated calculation never mutates base stats',()=>{
 const {run}=loadGame();const r=run(`(()=>{const p={type:'4',color:'w',talismans:[]},before=JSON.stringify(PIECES['4']);
 MetaProgression.data.allocatedNodes=['fire_origin','fire_node_1','fire_notable_1'];
 const values=Array.from({length:20},()=>MetaProgression.getBonusMaxHp(p,1));
 return {count:AstralModifiers.nodes.size,total:Object.keys(MetaProgression.nodes).length,unique:new Set(values).size,base:before===JSON.stringify(PIECES['4']),enemy:MetaProgression.getBonusMaxHp({...p,color:'b'},1),trace:AstralModifiers.trace(p,1).filter(r=>r.active).length};})()`);
 assert.equal(r.count,r.total);assert.equal(r.count,249);assert.equal(r.unique,1);assert.ok(r.base);assert.equal(r.enemy,0);assert.equal(r.trace,4); // Root origin is always unlocked.
});

test('All original equipment IDs retain save mapping and evolution category',()=>{
 const {run}=loadGame();const r=run(`(()=>{const ids=Object.keys(TALISMANS);return {count:ids.length,valid:ids.every(id=>EquipmentSystem.definition(id).saveMapping===id),stones:ids.filter(id=>TALISMANS[id].isSpell).every(id=>EquipmentSystem.definition(id).category==='evolution')};})()`);
 assert.equal(r.count,93);assert.ok(r.valid&&r.stones);
});

test('Ring Target removes immunity only when equipped; Safety Goggles block flagged area damage',()=>{
 const {run}=loadGame();const r=run(`(()=>{const c=new HexCombat(new HexBoard());c.addUnit(35,{id:'a',color:'w',element:'normal',maxHp:100});c.addUnit(21,{id:'b',color:'b',element:'ghost',maxHp:100});const a=c.units.get('a'),b=c.units.get('b');const immune=c.dealDamage(a,b,10);a.effects={talismans:['ring_target']};const hit=c.dealDamage(a,b,10);b.effects={talismans:['safety_goggles']};const area=c.dealDamage(a,b,10,'skill',{area:true});return {immune,hit,area};})()`);
 assert.equal(r.immune,0);assert.equal(r.hit,10);assert.equal(r.area,0);
});

test('Unequip returns inventory charge once and remains locked during battle',()=>{
 const {run}=loadGame();const r=run(`(()=>{const item={id:3,type:'4',talismans:['muscle_band']},ui={phase:'battle',talismanInventory:[],placedPieces:[],game:{board:[]},saveSetupFormation(){},renderInventory(){},renderBoard(){},renderTalismans(){},updateStats(){}};
 const locked=!EquipmentSystem.unequip(ui,item,'muscle_band');ui.phase='setup';const ok=EquipmentSystem.unequip(ui,item,'muscle_band');const repeated=EquipmentSystem.unequip(ui,item,'muscle_band');return {locked,ok,repeated,charges:ui.talismanInventory.length,equipped:item.talismans.length};})()`);
 assert.ok(r.locked&&r.ok);assert.equal(r.repeated,false);assert.equal(r.charges,1);assert.equal(r.equipped,0);
});

test('Balloon uses the resolved skill element and pops after a valid hit',()=>{
 const {run}=loadGame();const r=run(`(()=>{const c=new HexCombat(new HexBoard());c.addUnit(35,{id:'a',color:'w',element:'ground',maxHp:100});c.addUnit(21,{id:'b',color:'b',element:'normal',maxHp:100,effects:{talismans:['air_balloon']}});const a=c.units.get('a'),b=c.units.get('b');const ground=c.dealDamage(a,b,10,'skill',{element:'ground'});const fire=c.dealDamage(a,b,10,'skill',{element:'fire'});const popped=b.airBalloonPopped;const later=c.dealDamage(a,b,10,'skill',{element:'ground'});return {ground,fire,popped,later};})()`);
 assert.equal(r.ground,0);assert.ok(r.fire>0&&r.popped&&r.later>0);
});

test('Swarm expires precisely and reflection cannot recurse',()=>{
 const {run}=loadGame();const r=run(`(()=>{const c=new HexCombat(new HexBoard(),{random:()=>.99});c.addUnit(35,{id:'a',color:'w',element:'rock',maxHp:1000,effects:{elements:{element:'rock'},astral:['rock_keystone']}});c.addUnit(21,{id:'b',color:'w',element:'rock',maxHp:1000,effects:{elements:{element:'rock'},astral:['rock_keystone']}});
 const a=c.units.get('a'),b=c.units.get('b');a.statuses.swarm={expiresAt:30};a.swarmStacks=3;
 const before=HexEffects.outgoing(c,a,b,10,'attack',{});c.tickCount=30;const after=HexEffects.outgoing(c,a,b,10,'attack',{});
 let events=0;c.onEvent=e=>{if(e.type==='damage')events++};c.dealDamage(a,b,20,'attack',{damageType:'true'});return {before,after,events,a:a.hp,b:b.hp};})()`);
 assert.ok(r.before>r.after);assert.equal(r.events,2);assert.equal(r.a,995);assert.equal(r.b,980);
});

for(const size of [3,6,12])test(`${size} vs ${size} engine battle finishes and clears dead units`,()=>{
 const {run}=loadGame();const r=run(`(()=>{const c=new HexCombat(new HexBoard(),{random:()=>.8});
 for(let n=0;n<${size};n++){c.addUnit(28+n,{id:'a'+n,color:'w',element:'fire',maxHp:100,attackDamage:40,attackRange:2});c.addUnit(n,{id:'b'+n,color:'b',element:'grass',maxHp:100,attackDamage:25,attackRange:2});}
 let tick=0;while(!c.battleEnded&&tick++<5000)c.step();return {ended:c.battleEnded,ticks:tick,alive:[...c.units.values()].every(u=>u.hp>0),pending:c.pendingHits.every(h=>c.units.has(h.attackerId)&&c.units.has(h.defenderId))};})()`);
 assert.ok(r.ended&&r.alive&&r.pending,JSON.stringify(r));
});
