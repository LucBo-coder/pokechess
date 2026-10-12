const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {loadGame}=require('./game-context.cjs');
function game(){const g=loadGame();for(const name of ['core','objectives','content','session'])vm.runInContext(fs.readFileSync(path.join(__dirname,`../js/expedition/${name}.js`),'utf8'),g.context);return g;}

test('1000 seeds: connected routes terminate at a boss, independent streams and save replay',()=>{
 const {run}=game();const result=run(`(()=>{for(let seed=0;seed<1000;seed++){const p=Expedition.freshProfile('1'),a=Expedition.create(p,{seed}),b=Expedition.create(p,{seed});
 if(JSON.stringify(a.maps)!==JSON.stringify(b.maps))return false;for(const map of a.maps){Expedition.validateMap(map);if(!map.nodes.some(n=>n.type==='rest'))return false;}
 Expedition.random(a,'reward');if(Expedition.random(a,'combat')!==Expedition.random(b,'combat'))return false;
 const saved=Expedition.clone(a);if(Expedition.random(a,'shop')!==Expedition.random(saved,'shop'))return false;}return true;})()`);assert.ok(result);
});
test('boss defeat can retry, loss and win receipts are independent and applied once',()=>{
 const {run}=game();const r=run(`(()=>{const p=Expedition.freshProfile('1'),r=Expedition.create(p,{seed:7});r.currentNode=r.maps[0].nodes.find(n=>n.type==='boss').id;r.attempt=1;r.status='battle';
 Expedition.resolve(r,{winner:'b'});Expedition.resolve(r,{winner:'b'});const hp=r.trainerHp,available=Expedition.available(r);Expedition.select(r,available[0].id);r.status='battle';Expedition.resolve(r,{winner:'w'});const gold=r.gold;Expedition.resolve(r,{winner:'w'});Expedition.claim(r,'gold');const after=r.gold;Expedition.claim(r,'gold');return {hp,available:available.length,gold,after,final:r.gold,act:r.act};})()`);
 assert.equal(r.hp,80);assert.equal(r.available,1);assert.equal(r.gold,16);assert.equal(r.after,24);assert.equal(r.final,24);assert.equal(r.act,1);
});
test('all three Acts finish; terminal transitions are explicit',()=>{
 const {run}=game();const r=run(`(()=>{const p=Expedition.freshProfile('1'),r=Expedition.create(p,{seed:'complete'});let count=0;while(r.status!=='victory'&&count++<100){const n=Expedition.available(r)[0];Expedition.select(r,n.id);if(r.status==='preparation'){r.status='battle';Expedition.resolve(r,{winner:'w'});Expedition.claim(r,'gold');}else Expedition.complete(r);}return {status:r.status,nodes:r.completed.length,hp:r.trainerHp};})()`);
 assert.equal(r.status,'victory');assert.equal(r.nodes,27);assert.equal(r.hp,100);
});
test('save revision conflict, rollback backup, import validation and Classic isolation',()=>{
 const {run}=game();const r=run(`(()=>{localStorage.setItem(SaveSystem.PREFIX+'1','classic');localStorage.setItem('pokechess_meta_v2','legacy');const p=Expedition.freshProfile('1');p.run=Expedition.create(p,{seed:9});let saved=ExpeditionStore.write(p,0),conflict=false,invalid=false;
 try{ExpeditionStore.write(p,0);}catch(e){conflict=true;}saved.run.gold=42;saved=ExpeditionStore.write(saved,1);const exported=ExpeditionStore.export('1');const restored=ExpeditionStore.restore('1');try{ExpeditionStore.import(exported.replace('"version": 1','"version": 99'),'1');}catch(e){invalid=true;}return {conflict,invalid,gold:restored.run.gold,classic:localStorage.getItem(SaveSystem.PREFIX+'1'),meta:localStorage.getItem('pokechess_meta_v2')};})()`);
 assert.ok(r.conflict&&r.invalid);assert.equal(r.gold,10);assert.equal(r.classic,'classic');assert.equal(r.meta,'legacy');
});
test('failed storage write leaves prior active save intact',()=>{
 const {run}=game();assert.ok(run(`(()=>{const p=Expedition.freshProfile('1');p.run=Expedition.create(p,{seed:9});const saved=ExpeditionStore.write(p,0),before=ExpeditionStore.export('1'),original=localStorage.setItem;localStorage.setItem=(key,value)=>{if(key==='pokechess_expedition_v1:1')throw Error('quota');original(key,value);};let failed=false;try{ExpeditionStore.write(saved,1);}catch(e){failed=true;}localStorage.setItem=original;return failed&&before===ExpeditionStore.export('1');})()`));
});
test('corrupt primary save restores validated backup without destroying that backup',()=>{
 const {run}=game();assert.ok(run(`(()=>{const p=Expedition.freshProfile('1');p.run=Expedition.create(p,{seed:9});let saved=ExpeditionStore.write(p,0);saved=ExpeditionStore.write(saved,1);const key=ExpeditionStore.prefix+'1',backup=localStorage.getItem(key+':backup');localStorage.setItem(key,'{broken');const restored=ExpeditionStore.restore('1');return restored.run.seed==='9'&&localStorage.getItem(key+':backup')===backup;})()`));
});
test('failed profile switch never changes the active session or its save target',()=>{
 const {run}=game();assert.ok(run(`(()=>{const p=Expedition.freshProfile('1');p.run=Expedition.create(p,{seed:9});ExpeditionSession.profile=ExpeditionStore.write(p,0);window.roguelikeUI={phase:'setup',expeditionRun:ExpeditionSession.profile.run};const before=ExpeditionSession.profile;let failed=false;try{ExpeditionSession.enter('2');}catch(e){failed=true;}return failed&&ExpeditionSession.profile===before&&window.roguelikeUI.expeditionRun.id===before.run.id;})()`));
});
test('Expedition bridge refills HP, applies shield, isolates Astral and uses seeded combat',()=>{
 const {run}=game();const r=run(`(()=>{const ui=Object.create(RoguelikeUI.prototype),p=Expedition.freshProfile('1');p.run=Expedition.create(p,{seed:42});ui.expeditionRun=p.run;window.roguelikeUI=ui;ui.inventory=p.run.squad.inventory;ui.inventory[0].wounds=.5;ui.runState={id:p.run.id,upgrades:{hp:0,attack:0,speed:0}};ui.masteryProfile=MasterySystem.fresh('expedition:1');ui.placedPieces=[{invId:1,type:'1',sq:35}];ui.game={board:Array(64).fill(null)};ui.game.board[35]={type:'1',color:'w',invId:1,talismans:[]};ui.game.board[21]={type:'4',color:'b',talismans:[]};ui.stage=1;ui.phase='setup';p.run.blessings.barrier=1;p.run.talismans=['guard'];p.run.currentNode=p.run.maps[0].nodes[0].id;
 MetaProgression.data.allocatedNodes=['fire_keystone','fire_origin'];const allocatedBefore=JSON.stringify(MetaProgression.data.allocatedNodes);const c=new HexBridge(ui).createCombat(),u=c.units.get('hex_35');const stats={hp:u.hp,maxHp:u.maxHp,shield:u.shield,astral:u.effects.astral.length};delete ui.expeditionRun;stats.legacyUnchanged=allocatedBefore===JSON.stringify(MetaProgression.data.allocatedNodes);stats.classic=new HexBridge(ui).getUnitStats(ui.game.board[35],35).hp;return stats;})()`);
 assert.equal(r.hp,r.maxHp);assert.ok(r.shield>=18);assert.equal(r.astral,0);assert.ok(r.legacyUnchanged);assert.ok(r.classic<r.maxHp);
});

test('survival and elite hunt resolve only verified objectives; Classic remains elimination',()=>{
 const {run}=game();const r=run(`(()=>{const make=()=>{const c=new HexCombat(new HexBoard());c.addUnit(35,{id:'a',color:'w',maxHp:100});c.addUnit(21,{id:'b',color:'b',maxHp:100});c.addUnit(22,{id:'c',color:'b',maxHp:100});c.initialTeams=new Set(['w','b']);return c;};const survival=make();ExpeditionObjectives.attach(survival,'survival');survival.tickCount=899;survival.checkBattleEnd();const early=survival.battleEnded;survival.tickCount=900;survival.checkBattleEnd();const elite=make();ExpeditionObjectives.attach(elite,'elitehunt');elite.killUnit(elite.units.get('b'));elite.checkBattleEnd();const classic=make();classic.killUnit(classic.units.get('b'));classic.checkBattleEnd();return {early,win:survival.winner,verified:survival.resultVerified,elite:elite.resultVerified,classic:classic.battleEnded};})()`);
 assert.equal(r.early,false);assert.equal(r.win,'w');assert.ok(r.verified&&r.elite);assert.equal(r.classic,false);
});
test('rapid DoT refresh preserves tick cadence and avoids repeating status announcements',()=>{
 const {run}=game();const r=run(`(()=>{const c=new HexCombat(new HexBoard()),events=[];c.onEvent=e=>events.push(e);c.addUnit(35,{id:'a',color:'w',maxHp:100});c.addUnit(21,{id:'b',color:'b',maxHp:1000});const a=c.units.get('a'),b=c.units.get('b');for(let tick=0;tick<=120;tick++){c.tickCount=tick;if(tick%15===0)HexEffects.dot(c,a,b,'poison',3,3);HexEffects.update(c,b);}return {hp:b.hp,status:events.filter(e=>e.type==='status'&&e.status==='poison').length};})()`);
 assert.equal(r.hp,988);assert.equal(r.status,1);
});
test('stacked equipment and Astral evasion use one roll with a 75 percent cap',()=>{
 const {run}=game();const r=run(`(()=>{let calls=0,state=42;const c=new HexCombat(new HexBoard(),{random:()=>{calls++;state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;}});c.addUnit(35,{id:'d',color:'w',maxHp:100,effects:{elements:{element:'flying',element2:'ghost'},astral:['ghost_keystone','flying_notable_2','flying_keystone'],flags:{},tiers:{},talismans:[]}});const d=c.units.get('d');d.starfEvasion=.35;d.statuses.smoke={expiresAt:1000};let dodges=0;for(let i=0;i<10000;i++)if(HexEffects.incoming(c,d,10,'attack')===0)dodges++;return {calls,dodges};})()`);
 assert.equal(r.calls,10000);assert.ok(r.dodges>7350&&r.dodges<7650,JSON.stringify(r));
});
test('event eligibility, costs, capped blessings and recruitment unlock use one profile transaction',()=>{
 const {run}=game();const r=run(`(()=>{const p=Expedition.freshProfile('1'),r=Expedition.create(p,{seed:2});r.nodeState={event:'shrine'};ExpeditionContent.apply(r,p,'pray');const gold=r.gold,focus=r.blessings.focus;let denied=false;try{ExpeditionContent.apply(r,p,'pray');}catch(e){denied=true;}r.nodeState.event='rescue';ExpeditionContent.apply(r,p,'rescue');const after=r.trainerHp;return {gold,focus,denied,after,inventory:r.squad.inventory.length,unlocks:new Set(p.unlocks.starters).size};})()`);
 assert.equal(r.gold,2);assert.equal(r.focus,1);assert.ok(r.denied);assert.equal(r.after,95);assert.equal(r.inventory,4);assert.equal(r.unlocks,4);
});
test('regional enemy pools use actual species elements instead of falling back to starter roster',()=>{
 const {run}=game();assert.ok(run(`(()=>{const p=Expedition.freshProfile('1'),r=Expedition.create(p,{seed:123});for(let act=0;act<3;act++){r.act=act;r.currentNode=r.maps[act].nodes[0].id;const encounter=ExpeditionSession.encounter(r),types=Expedition.regions[act].types;if(!encounter.pieces.every(id=>[PIECES[id].element,PIECES[id].element2].some(type=>types.includes(type))))return false;}return true;})()`));
});
test('regional boss hazards telegraph before resolution and never damage a vacated cell',()=>{
 const {run}=game();const r=run(`(()=>{const results=[];for(let act=0;act<3;act++){const c=new HexCombat(new HexBoard());c.addUnit(35,{id:'a',color:'w',maxHp:1000});c.addUnit(21,{id:'boss',color:'b',isBoss:true,maxHp:1000,attackDamage:100});c.initialTeams=new Set(['w','b']);ExpeditionRegions.attach(c,act);const a=c.units.get('a');c.tickCount=240;ExpeditionRegions.update(c);const before=a.hp,pending=c.expeditionRegion.pending;const warned=!!a.statuses.bossWarning&&pending.at===285;c.hex.moveUnit(35,36);a.square=36;c.tickCount=285;ExpeditionRegions.update(c);results.push(warned&&a.hp===before&&!a.statuses.poison&&c.expeditionRegion.pending===null);}return results.every(Boolean);})()`);assert.ok(r);
});
test('battle-count evolution preserves instance and branches; terminal history records only once',()=>{
 const {run}=game();const r=run(`(()=>{const p=Expedition.freshProfile('1'),r=Expedition.create(p,{seed:4});r.squad.inventory[0].battlesFought=PIECES['1'].battlesToEvolve;const id=r.squad.inventory[0].instanceId;ExpeditionSession.evolveAfterVictory(r,{deployedInBattleIds:new Set([1])});r.status='victory';ExpeditionSession.recordResult(r,p);ExpeditionSession.recordResult(r,p);return {evo:r.squad.pendingEvolutions[0]?.nextType,id:r.squad.inventory[0].instanceId===id,history:p.history.length,ascension:p.unlocks.ascension,guardian:p.unlocks.loadouts.includes('guardian')};})()`);
 assert.equal(String(r.evo),'2');assert.ok(r.id&&r.guardian);assert.equal(r.history,1);assert.equal(r.ascension,1);
});
test('real Expedition engine encounters finish with finite stats across regions and boss variations',()=>{
 const {run}=game();const rows=run(`(()=>{const rows=[];for(let act=0;act<3;act++)for(const kind of ['battle','elite','boss','challenge']){const p=Expedition.freshProfile('1'),r=Expedition.create(p,{seed:kind});r.act=act;r.currentNode=r.maps[act].nodes.find(n=>n.type==='boss').id;const node=Expedition.node(r);node.type=kind;const ui=Object.create(RoguelikeUI.prototype);window.roguelikeUI=ui;ui.expeditionRun=r;ui.inventory=r.squad.inventory;ui.runState={id:r.id,upgrades:r.upgrades};ui.masteryProfile=MasterySystem.fresh('expedition:1');ui.phase='setup';ui.stage=Expedition.stage(r);ui.game={board:Array(64).fill(null)};ui.placedPieces=[];for(let i=0;i<3;i++){ui.game.board[35+i]={color:'w',type:ui.inventory[i].type,invId:ui.inventory[i].id,talismans:[]};ui.placedPieces.push({sq:35+i,invId:i+1,type:ui.inventory[i].type});}const enemies=ExpeditionSession.encounter(r).pieces;for(let i=0;i<enemies.length;i++)ui.game.board[14+i]={color:'b',type:enemies[i],talismans:[],isBoss:i===0&&['boss','elite'].includes(kind)};const c=new HexBridge(ui).createCombat();while(!c.battleEnded&&c.tickCount<=c.maxBattleTicks)c.step();rows.push({act,kind,finished:c.battleEnded,verified:c.resultVerified,finite:c.getSummary().units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.damageDealt)),seconds:c.tickCount/c.tickRate});}return rows;})()`);
 assert.equal(rows.length,12);for(const row of rows)assert.ok(row.finished&&row.verified&&row.finite,JSON.stringify(row));
});
