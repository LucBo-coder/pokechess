const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {loadGame}=require('./game-context.cjs');
const {run}=loadGame();
const stages=[1,10,25,50,75,100,125,150];
const scenarios={
    beginner:{roster:['1','4','7'],upgrades:false,equipment:false,astral:false,mastery:false},
    balanced:{roster:['3','6','9','65','143','94','130','25','68','149','242','448'],mastery:15},
    offense:{roster:['6','130','149','65','94','254','373','448','475','445','461','257'],specialization:'offense',mastery:25},
    defense:{roster:['9','143','242','208','306','95','76','131','80','241','211','230'],specialization:'defense',mastery:25},
    fireSynergy:{roster:['4','5','6','126','136','155','156','157','240','467','244','38'],mastery:15},
    hybrid:{roster:['3','6','9','143','242','25','65','94','130','68','149','448'],mastery:20},
    highMastery:{roster:['3','6','9','65','143','94','130','25','68','149','242','448'],mastery:30},
    lowMastery:{roster:['3','6','9','65','143','94','130','25','68','149','242','448'],mastery:false}
};
const samples=[];
for(const stage of stages) {
    for(const [name,scenario] of Object.entries(scenarios))for(const seed of [1701,2701,3701]) {
        // Counterfactuals remove one system while keeping roster/encounter seeds.
        for(const ablation of name==='highMastery'?['full','noMastery','noEquipment','noAstral']:['full']) {
            const result=run(`(() => {
                const options=${JSON.stringify(scenario)},stage=${stage},seed=${seed},ablation=${JSON.stringify(ablation)};
                localStorage.removeItem(MasterySystem.STORAGE_KEY);
                const ui=Object.create(RoguelikeUI.prototype);ui.stage=stage;ui.phase='setup';ui.game=new ChessGame();
                ui.inventory=[];ui.placedPieces=[];ui.renderBoard=()=>{};
                ui.runState=RoguelikeExpansion.createRun();ui.runState.id='balance:'+seed;ui.runState.seed=seed;
                ui.runState.upgrades=options.upgrades===false?{hp:0,attack:0,speed:0}:{hp:40,attack:12,speed:60};
                MetaProgression.data.allocatedNodes=options.astral===false||ablation==='noAstral'?['origin']:['origin','m_hp_1','m_atk_1','m_atk_2','m_notable_3'];
                for(const [i,type] of options.roster.entries()) {
                    const invId=i+1,sq=28+i,talismans=options.equipment===false||ablation==='noEquipment'?[]:['leftovers','muscle_band'];
                    ui.inventory.push({id:invId,type,talismans:[...talismans]});ui.placedPieces.push({sq,type,invId,talismans:[...talismans]});
                    ui.game.board[sq]={type,color:'w',invId,talismans:[...talismans]};
                }
                MasterySystem.ensure(ui);
                if(options.mastery!==false&&ablation!=='noMastery')for(const item of ui.inventory) {
                    ui.masteryProfile.species[item.type]=MasterySystem.speciesRecord(item.type,MasterySystem.threshold(options.mastery));
                    item.individualMastery.xp=options.mastery>=30?2500:600;item.individualMastery.selectedSpecialization=options.specialization??'defense';
                    item.individualMastery.selectedSkillVariant=options.mastery>=20?'variant2':'variant1';
                }
                ui.autoArrangePlayerFormation();
                const original=Math.random;
                try {
                    Math.random=RoguelikeExpansion.random(ui.runState,stage,'encounter');
                    const enemies=ui.getEnemyFormation(ui.getEnemyPiecesForStage(stage)),boss=ui.createStageBoss(stage);
                    const bossSquare=boss?(enemies.find(e=>e.role==='tank')??enemies.find(e=>e.role==='fighter')??enemies[0]).square:null;
                    for(const enemy of enemies) {
                        const piece={type:enemy.type,color:'b',talismans:[...(PIECES[enemy.type].defaultTalismans??[])],eliteType:HexTraits.eliteFor(stage,enemy.square,enemies[0].square)};
                        if(enemy.square===bossSquare)Object.assign(piece,boss);ui.game.board[enemy.square]=piece;
                    }
                } finally {Math.random=original;}
                const combat=new HexBridge(ui).createCombat({random:RoguelikeExpansion.random(ui.runState,stage,'combat')});
                const bosses=[...combat.units.values()].filter(unit=>unit.isBoss).length;
                let phases=0;combat.onEvent=event=>{if(event.type==='boss-phase-change')phases++;};
                while(!combat.battleEnded&&combat.tickCount<=combat.maxBattleTicks)combat.step();
                const summary=combat.getSummary(),friendly=summary.units.filter(row=>row.color==='w');
                return {winner:summary.winner,seconds:summary.seconds,damage:friendly.reduce((sum,row)=>sum+row.damageDealt,0),
                    healing:friendly.reduce((sum,row)=>sum+row.healingDone,0),shields:friendly.reduce((sum,row)=>sum+row.shieldProvided,0),
                    survivors:friendly.filter(row=>row.hp>0).length,phases,
                    finite:summary.units.every(row=>[row.hp,row.maxHp,row.damageDealt,row.damageTaken,row.healingDone].every(Number.isFinite)),
                    queue:combat.pendingHits.length,bosses};
            })()`);
            assert.ok(result.finite&&result.seconds<=180&&result.winner&&result.queue===0,JSON.stringify({stage,name,seed,ablation,result}));
            assert.equal(result.bosses,stage%5===0?1:0);
            samples.push({stage,scenario:name,seed,ablation,...result});
        }
    }
    console.log(`Stage ${stage}: simulations finished`);
}
const groups=[];
for(const stage of stages)for(const [scenario] of Object.entries(scenarios)) {
    for(const ablation of scenario==='highMastery'?['full','noMastery','noEquipment','noAstral']:['full']) {
        const rows=samples.filter(row=>row.stage===stage&&row.scenario===scenario&&row.ablation===ablation);
        const average=key=>rows.reduce((sum,row)=>sum+row[key],0)/rows.length;
        groups.push({stage,scenario,ablation,samples:rows.length,winRate:rows.filter(row=>row.winner==='w').length/rows.length,
            seconds:average('seconds'),damage:average('damage'),healing:average('healing'),shields:average('shields'),survivors:average('survivors'),bossPhaseChanges:average('phases')});
    }
}
const report={description:'Controlled fixtures with three deterministic encounter/combat seeds. High mastery, max run upgrades, equipment and selected Astral nodes are explicit fixtures, not evidence of attainable economy progression. Ablations are separate combats; differences are not additive damage attribution.',stages,groups,samples};
const target=path.join(__dirname,'..','artifacts','mastery-balance.json');
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
console.log(`${samples.length} actual simulations passed; results: ${target}`);
