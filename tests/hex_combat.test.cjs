const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

const {loadGame}=require('./game-context.cjs');

test('Astral and player elemental synergies never buff enemies; crit reaches real attacks', () => {
    const {run} = loadGame();
    const result = run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=10;ui.game=new ChessGame();ui.inventory=[];
        for(const [sq,type] of [[49,'4'],[50,'5'],[51,'6']])ui.game.board[sq]={color:'w',type,invId:sq};
        ui.placedPieces=[49,50,51].map(sq=>({sq,type:ui.game.board[sq].type}));
        ui.game.board[0]={color:'b',type:'4'};
        const enemyBefore=new HexBridge(ui).getUnitStats(ui.game.board[0],0);
        const base=JSON.stringify(PIECES['4']);
        MetaProgression.data.allocatedNodes.push('m_hp_1','m_atk_1','m_crit_1','m_notable_3');
        const combat=new HexBridge(ui).createCombat({random:()=>0});const ally=combat.getUnitAt(49),enemy=combat.getUnitAt(0);
        const event=[];combat.onEvent=e=>event.push(e);
        ally.square=7;combat.hex.board[49]=null;combat.hex.board[7]=ally;
        combat.attack(ally,0);
        return {enemyHp:enemy.maxHp,enemyAttack:enemy.attackDamage,beforeHp:enemyBefore.maxHp,beforeAttack:enemyBefore.attackDamage,
            crit:ally.critChance,critical:event.some(e=>e.type==='damage'&&e.critical),unchanged:JSON.stringify(PIECES['4'])===base,
            trace:ally.statBreakdown.modifiers.astral};
    })()`);
    assert.equal(result.enemyHp,result.beforeHp);assert.equal(result.enemyAttack,result.beforeAttack);
    assert.ok(Math.abs(result.crit-0.11)<1e-9);assert.ok(result.critical&&result.unchanged);
    assert.equal(result.trace.hp,3);assert.equal(result.trace.attack,4);
});

test('Hex equipment effects resolve once, preserve immunity, and reset every battle', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=1;ui.game=new ChessGame();ui.inventory=[];ui.placedPieces=[];
        ui.game.board[49]={color:'w',type:'4',talismans:['muscle_band','wise_glasses','leftovers']};
        ui.game.board[42]={color:'b',type:'7',talismans:['focus_sash']};
        const combat=new HexBridge(ui).createCombat({random:()=>0.99}),a=combat.getUnitAt(49),b=combat.getUnitAt(42);
        const oldDamage=a.bossBaseDamage;a.hp-=50;
        const damage=combat.dealDamage(a,b,20,'attack',{damageType:'non-elemental'});
        const wise=a.bossBaseDamage-oldDamage;
        combat.dealDamage(a,b,999999,'attack',{damageType:'non-elemental'});const survived=b.hp;
        combat.dealDamage(a,b,999999,'attack',{damageType:'non-elemental'});const removed=!combat.units.has(b.id);
        const hp=a.hp;combat.tickCount=30;HexEffects.update(combat,a);const healed=a.hp-hp;
        const next=new HexBridge(ui).createCombat();
        const fresh=next.getUnitAt(49).bossBaseDamage===oldDamage&&!next.getUnitAt(42).survivalUsed;
        const immune=new HexCombat(new HexBoard());immune.addUnit(49,{id:'a',color:'w',element:'normal',maxHp:100,effects:a.effects});
        immune.addUnit(42,{id:'b',color:'b',element:'ghost',maxHp:100});
        const zero=immune.dealDamage(immune.getUnitAt(49),immune.getUnitAt(42),20);
        return {damage,wise,survived,removed,healed,fresh,zero};
    })()`);
    assert.ok(result.damage>20);assert.ok(Math.abs(result.wise-0.35)<1e-9);
    assert.equal(result.survived,1);assert.ok(result.removed&&result.fresh);
    assert.equal(result.healed,16);assert.equal(result.zero,0);
});

test('Astral recruitment cards, prices and free reroll persist without spending reward rerolls', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=5;ui.phase='setup';ui.gold=30;ui.runState=RoguelikeExpansion.createRun();
        ui.runState.freeRerolls=2;ui.renderShop=ui.updateStats=ui.addLog=()=>{};
        const price=ui.getPiecePrice('4');
        MetaProgression.data.allocatedNodes.push('w_card_1','w_keystone','w_notable_2','a_keystone');
        ui.generateRewardCards();const count=ui.cardChoices.length;ui.rerollCards();
        const first={stage:ui.runState.astralRerollStage,free:ui.runState.freeRerolls,gold:ui.gold};
        ui.runState=RoguelikeExpansion.restore(ui.runState);ui.rerollCards();
        return {count,discount:price-ui.getPiecePrice('4'),first,second:ui.runState.freeRerolls};
    })()`);
    assert.equal(result.count,5);assert.equal(result.discount,1);
    assert.equal(result.first.stage,5);assert.equal(result.first.free,2);assert.equal(result.first.gold,30);assert.equal(result.second,1);
});

test('Chosen Champion follows the original starter after evolution and applies once before Hex conversion', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=10;ui.game=new ChessGame();ui.placedPieces=[];
        ui.inventory=[{id:1,type:'5',starterSpeciesId:'4',talismans:[]}];
        ui.game.board[49]={type:'5',color:'w',invId:1};ui.game.board[0]={type:'5',color:'b'};
        const bridge=new HexBridge(ui),before=bridge.getEffectiveStats(ui.game.board[49],49);
        const enemyBefore=bridge.getUnitStats(ui.game.board[0],0);
        MetaProgression.data.allocatedNodes.push('r_keystone');
        const after=bridge.getEffectiveStats(ui.game.board[49],49),enemyAfter=bridge.getUnitStats(ui.game.board[0],0);
        const preview=bridge.getUnitStats(ui.game.board[49],49),combat=bridge.createCombat();
        return {hp:after.maxHp/before.maxHp,atk:after.damage/before.damage,enemyHp:enemyAfter.maxHp===enemyBefore.maxHp,
            enemyAtk:enemyAfter.attackDamage===enemyBefore.attackDamage,match:preview.maxHp===combat.getUnitAt(49).maxHp,
            starter:combat.getUnitAt(49).effects.starter};
    })()`);
    assert.ok(Math.abs(result.hp-1.5)<1e-9);assert.ok(Math.abs(result.atk-1.5)<1e-9);assert.ok(result.enemyHp&&result.enemyAtk&&result.match&&result.starter);
});

test('localization uses Vietnamese defaults, English fallback, safe interpolation and persisted switching', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const initial=I18n.language,vi=t('menu.continueSlot',{slot:1,stage:126});
        const hostile=I18n.html('menu.continueSlotTitle',{slot:'<img src=x onerror=alert(1)>'});
        PokeChessLocales['en-US']['test.onlyEnglish']='English fallback';
        const fallback=t('test.onlyEnglish'),missing=t('missing.key'),defaultValue=t('missing.key',{defaultValue:'Available'});
        const number=I18n.number(1.5,{minimumFractionDigits:1});
        I18n.setLanguage('en-US');I18n.init();const restored=I18n.language;
        const en=t('menu.continueSlot',{slot:1,stage:126});
        return {initial,vi,hostile,fallback,missing,defaultValue,number,restored,en};
    })()`);
    assert.equal(result.initial,'vi-VN');assert.equal(result.vi,'TIẾP TỤC (Ô LƯU 1 • ẢI 126)');
    assert.ok(result.hostile.includes('&lt;img')&&!result.hostile.includes('<img'));
    assert.equal(result.fallback,'English fallback');assert.equal(result.missing,'');assert.equal(result.defaultValue,'Available');
    assert.equal(result.number,'1,5');assert.equal(result.restored,'en-US');assert.equal(result.en,'CONTINUE (SLOT 1 • STAGE 126)');
});

test('Mastery awards verified battles once, survives snapshot rollback, and excludes bench and summons', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=1;ui.phase='setup';ui.game=new ChessGame();ui.placedPieces=[];
        ui.inventory=[{id:1,type:'4',talismans:[]},{id:2,type:'7',talismans:[]}];
        ui.game.board[49]={color:'w',type:'4',invId:1};ui.game.board[42]={color:'b',type:'1'};
        MasterySystem.ensure(ui);SaveSystem.saveToSlot(1,ui);const before=JSON.parse(JSON.stringify(SaveSystem.getSlot(1)));
        const combat=new HexBridge(ui).createCombat({random:()=>0.99});combat.getUnitAt(42).hp=1;
        combat.addUnit(48,{id:'summon',type:'4',color:'w',maxHp:10,attackDamage:1});
        const premature=MasterySystem.award(ui,combat);
        for(let i=0;i<1000&&!combat.battleEnded;i++)combat.step();
        const first=MasterySystem.award(ui,combat),xp=ui.inventory[0].individualMastery.xp;
        const speciesXP=ui.masteryProfile.species['4'].xp,benchXP=ui.inventory[1].individualMastery.xp;
        const twice=MasterySystem.award(ui,combat);
        ui.runState=RoguelikeExpansion.restore(before.runState);ui.inventory=before.inventory;MasterySystem.restore(ui,before,1);
        const restored=ui.inventory[0].individualMastery.xp,third=MasterySystem.award(ui,combat);
        const profileXP=ui.masteryProfile.species['4'].xp;
        const other=Object.create(RoguelikeUI.prototype);other.runState=RoguelikeExpansion.createRun();other.inventory=[];
        MasterySystem.restore(other,{stage:1},2);
        return {premature,first,xp,speciesXP,benchXP,twice,restored,third,profileXP,otherXP:other.masteryProfile.species['4']?.xp??0};
    })()`);
    assert.equal(result.premature,null);assert.equal(result.first.length,1);assert.ok(result.xp>0);
    assert.equal(result.benchXP,0);assert.equal(result.twice,null);assert.equal(result.third,null);
    assert.equal(result.restored,result.xp);assert.equal(result.profileXP,result.speciesXP);assert.equal(result.otherXP,0);
});

test('species progress is bounded, individual identity follows evolution and copied forms do not gain species XP', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=1;ui.phase='setup';ui.game=new ChessGame();ui.placedPieces=[];
        ui.inventory=[{id:1,type:'4',talismans:[]}];MasterySystem.ensure(ui);
        const item=ui.inventory[0],id=item.instanceId;item.individualMastery.xp=420;
        item.type='5';MasterySystem.ensure(ui);const evolved={id:item.instanceId,xp:item.individualMastery.xp,rank:item.individualMastery.rank,species:item.individualMastery.speciesId};
        const max=MasterySystem.speciesRecord('6',999999999);
        ui.masteryProfile.species['5']=MasterySystem.speciesRecord('5',MasterySystem.threshold(5));
        const selected=MasterySystem.select(ui,id,'defense');ui.phase='battle';const changed=MasterySystem.select(ui,id,'offense');
        ui.inventory[0].type='132';ui.game.board[49]={color:'w',type:'132',transformType:'6',invId:1};
        const combat=new HexBridge(ui).createCombat();const copied=combat.getUnitAt(49);
        const freshId=RoguelikeExpansion.createRun().id;ui.runState.id=freshId;MasterySystem.ensure(ui);
        return {id,evolved,max,selected,changed,canonical:copied.mastery.speciesId,display:copied.pokemonId,newIdentity:ui.inventory[0].instanceId!==id};
    })()`);
    assert.equal(result.evolved.id,result.id);assert.equal(result.evolved.xp,420);assert.equal(result.evolved.rank,'veteran');assert.equal(result.evolved.species,'5');
    assert.equal(result.max.level,30);assert.equal(result.max.milestones.length,6);
    assert.ok(result.selected);assert.equal(result.changed,false);assert.equal(result.canonical,'132');assert.equal(result.display,'6');assert.ok(result.newIdentity);
});

test('mastery specializations heal and shield real allies with attributed stats, cooldowns and expiry', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(49,{id:'support',type:'3',color:'w',maxHp:200,combatRole:'tank',mastery:{speciesId:'3',speciesLevel:15,specialization:'defense',skillVariant:'original'}});
        combat.addUnit(50,{id:'ally',type:'7',color:'w',maxHp:200,hp:100});
        combat.addUnit(42,{id:'enemy',type:'4',color:'b',maxHp:200});
        const support=combat.getUnitAt(49),ally=combat.getUnitAt(50);
        MasterySystem.onSkill(combat,support,'enemy');const first=ally.hp;
        MasterySystem.onSkill(combat,support,'enemy');const duplicate=ally.hp;
        support.mastery.speciesId='7';combat.tickCount=360;MasterySystem.onSkill(combat,support,'enemy');
        const shield=ally.shield,attributed=combat.statistics.get('support').healingDone;
        combat.tickCount=600;combat.step();const expired=ally.shield;
        return {first,duplicate,shield,attributed,expired};
    })()`);
    assert.equal(result.first,116);assert.equal(result.duplicate,116);assert.equal(result.shield,20);
    assert.equal(result.attributed,16);assert.equal(result.expired,0);
});

test('every JavaScript source parses and HTML script references exist', () => {
    const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(file) : file.endsWith('.js') ? [file] : [];
    });
    for (const file of walk(path.join(root, 'js'))) new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    for (const match of html.matchAll(/<script[^>]*src="([^"?]+)[^"]*"/g)) assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
});

test('SETUP matches combat across normal, mini boss and boss stages, including rounding', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const results = [];
        for (const stage of [1, 2, 5, 10, 15, 20, 100]) {
            const ui = Object.create(RoguelikeUI.prototype);
            ui.stage = stage; ui.game = new ChessGame();
            ui.game.board[0] = {color: 'b', type: '4'};
            ui.game.board[7] = {color: 'b', type: '143', isBoss: true};
            ui.game.board[49] = {color: 'w', type: '7'};
            const combat = new HexBridge(ui).createCombat();
            for (const square of [0, 7, 49]) {
                const preview = HexPokemonInfo.getBattleStats(ui.game.board[square], square, ui);
                const unit = combat.getUnitAt(square);
                results.push([stage, square, preview.maxHp === unit.maxHp,
                    preview.damage === unit.attackDamage, preview.speed === unit.pokemonSpeed,
                    preview.attackSpeed === unit.attackSpeed, preview.mana === unit.mana,
                    preview.isBoss === unit.isBoss]);
            }
            results.push([stage, 'markedBoss', combat.getUnitAt(0).isBoss === false,
                combat.getUnitAt(7).isBoss === (stage % 5 === 0)]);
        }
        return results;
    })()`);
    for (const row of result) assert.ok(row.slice(2).every(Boolean), JSON.stringify(row));
});

test('boss fallback and balance constants are shared by preview and battle', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const ui = Object.create(RoguelikeUI.prototype);
        ui.stage = 10; ui.game = new ChessGame();
        ui.game.board[0] = {color: 'b', type: '4'};
        const preview = HexPokemonInfo.getBattleStats(ui.game.board[0], 0, ui);
        const unit = new HexBridge(ui).createCombat().getUnitAt(0);
        return { hp: unit.maxHp, attack: unit.attackDamage, matches: preview.maxHp === unit.maxHp && preview.damage === unit.attackDamage, isBoss: preview.isBoss };
    })()`);
    // Charmander: HP 78 × Fighter 1.1 × Hex 4, then stage 10 × Boss.
    assert.equal(result.hp, 1849);
    assert.equal(result.attack, 23);
    assert.ok(result.matches && result.isBoss);
});

test('start auras use Hex neighbors, are predicted once, and preserve setup objects', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const ui = Object.create(RoguelikeUI.prototype);
        ui.stage = 1; ui.game = new ChessGame();
        const piece = {color: 'w', type: '4', talismans: ['toxic_orb']};
        ui.game.board[35] = piece;
        ui.game.board[28] = {color: 'w', type: '7', talismans: ['soothe_bell']};
        ui.game.board[0] = {color: 'b', type: '1', talismans: []};
        const initial = JSON.stringify(piece);
        const bridge = new HexBridge(ui);
        const base = ui.getEffectivePieceStats({...piece, _battleBonusAtk: 0});
        const preview = bridge.getUnitStats(piece, 35);
        const unchanged = JSON.stringify(piece) === initial;
        piece._battleBonusAtk = 9;
        ui.phase = 'battle';
        const unit = bridge.createCombat().getUnitAt(35);
        return {expected: Math.max(1, Math.round((base.damage + 9) * 0.35)), preview: preview.attackDamage, battle: unit.attackDamage, unchanged};
    })()`);
    assert.ok(result.unchanged);
    assert.equal(result.preview, result.expected);
    assert.equal(result.battle, result.preview);
});

test('actual species keep their base stats and receive their class modifier exactly once', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const ui = Object.create(RoguelikeUI.prototype);
        ui.stage = 1; ui.phase = 'setup'; ui.game = new ChessGame();
        const original = JSON.stringify(PIECES);
        const bridge = new HexBridge(ui), groups = {};
        const errors = [];
        for (const [id, pokemon] of Object.entries(PIECES)) {
            const config = HexUnitConfig.getConfig(id);
            const piece = {type: id, color: 'w', talismans: []};
            const preview = bridge.getUnitStats(piece, 49);
            const hp = Math.max(1, Math.round(pokemon.maxHp * config.hpMultiplier * 4));
            const atk = Math.max(1, Math.round(pokemon.damage * config.damageMultiplier * 0.35));
            if (preview.maxHp !== hp || preview.attackDamage !== atk ||
                preview.pokemonSpeed !== getPokemonBaseSpeed(pokemon)) errors.push(id);
            (groups[config.role] ??= new Set()).add(preview.maxHp + ':' + preview.attackDamage);
            const combat = new HexBoard();
            const live = new HexCombat(combat);
            live.addUnit(49, {...preview, id});
            const unit = live.getUnitAt(49);
            if (unit.maxHp !== hp || unit.attackDamage !== atk) errors.push(id + ':combat');
        }
        return {count: Object.keys(PIECES).length, errors,
            unchanged: JSON.stringify(PIECES) === original,
            distinct: Object.values(groups).every(group => group.size > 1)};
    })()`);
    assert.equal(result.count, 1036);
    assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
    assert.ok(result.unchanged && result.distinct);
});

test('real Talisman and Synergy bonuses are added after class modifiers, once', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const ui = Object.create(RoguelikeUI.prototype);
        ui.stage = 1; ui.phase = 'setup'; ui.game = new ChessGame();
        ui.game.board[49] = {type: '4', color: 'w', talismans: ['muscle_band', 'choice_scarf']};
        ui.game.board[50] = {type: '37', color: 'w', talismans: []};
        ui.placedPieces = [{sq:49}, {sq:50}];
        const preview = new HexBridge(ui).getUnitStats(ui.game.board[49], 49);
        const active = SynergySystem.getActiveSynergies(ui).fire;
        const unit = new HexBridge(ui).createCombat().getUnitAt(49);
        return {hp:preview.maxHp, atk:preview.attackDamage, speed:preview.pokemonSpeed,
            tier:active.activeTier.level, matches:preview.maxHp === unit.maxHp && preview.attackDamage === unit.attackDamage};
    })()`);
    assert.equal(result.tier, 1);
    assert.equal(result.hp, 407); // (78 × 1.1 + 6 + 10) × 4
    assert.equal(result.atk, 15); // (28 × 1 + 5 + 5 + Fire 5) × 0.35
    assert.equal(result.speed, 150);
    assert.ok(result.matches);
});

test('temporary ATK is added after stage and boss scaling, not multiplied by class or equipment', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const rows = [];
        for (const stage of [1, 5, 10, 20]) {
            const ui = Object.create(RoguelikeUI.prototype);
            ui.stage = stage; ui.phase = 'battle'; ui.game = new ChessGame();
            const piece = {type:'143', color:'b', talismans:['muscle_band'], isBoss:true};
            ui.game.board[0] = piece;
            const bridge = new HexBridge(ui), plain = bridge.getUnitStats(piece,0);
            piece._battleBonusAtk = 20; piece._battleBonusSpeed = 30; piece._battleSpeedDebuff = 10;
            const buffed = bridge.getUnitStats(piece,0);
            const unit = bridge.createCombat().getUnitAt(0);
            rows.push({stage, attackDelta:buffed.attackDamage-plain.attackDamage,
                hpSame:buffed.maxHp===plain.maxHp, speedDelta:buffed.pokemonSpeed-plain.pokemonSpeed,
                attackSpeedMatches:buffed.attackSpeed===Math.max(0.5,Math.min(2.5,buffed.pokemonSpeed/100)),
                matches:unit.attackDamage===buffed.attackDamage && unit.attackSpeed===buffed.attackSpeed});
        }
        return rows;
    })()`);
    for (const row of result) {
        assert.equal(row.attackDelta, 7, JSON.stringify(row));
        assert.equal(row.speedDelta, 20);
        assert.ok(row.hpSame && row.matches && row.attackSpeedMatches);
    }
});

test('Electric speed damage excludes temporary speed and Strike First; legacy stats stay compatible', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const ui = Object.create(RoguelikeUI.prototype);
        ui.stage = 1; ui.phase = 'setup'; ui.battleRounds = 1; ui.game = new ChessGame();
        const piece = {type:'25',color:'w',talismans:['choice_scarf']};
        ui.game.board[49]=piece; ui.game.board[50]={type:'81',color:'w',talismans:[]};
        ui.placedPieces=[{sq:49},{sq:50}];
        const bridge=new HexBridge(ui), plain=bridge.getUnitStats(piece,49);
        const p=PIECES['25'], role=HexUnitConfig.getConfig('25');
        const permanentSpeed=getPokemonBaseSpeed(p)+40+20;
        const expectedAtk=Math.round((p.damage*role.damageMultiplier+5+4+Math.round(permanentSpeed*0.05))*0.35);
        piece._battleBonusSpeed=40; piece.hasStrikeFirst=true;
        const buffed=bridge.getUnitStats(piece,49);
        const legacy=ui.getEffectivePieceStats(piece);
        const legacyExpected=p.damage+5+4+Math.round((permanentSpeed+1040)*0.05);
        ui.battleRounds=2;
        const secondRound=bridge.getUnitStats(piece,49);
        return {plainAtk:plain.attackDamage, expectedAtk, buffedAtk:buffed.attackDamage,
            speedDelta:buffed.pokemonSpeed-plain.pokemonSpeed, attackSpeed:buffed.attackSpeed,
            secondSpeed:secondRound.pokemonSpeed, expectedSecond:permanentSpeed+40,
            legacyAtk:legacy.damage, legacyExpected};
    })()`);
    assert.equal(result.plainAtk, result.expectedAtk);
    assert.equal(result.buffedAtk, result.plainAtk);
    assert.equal(result.speedDelta, 1040);
    assert.equal(result.attackSpeed, 2.5);
    assert.equal(result.secondSpeed, result.expectedSecond);
    assert.equal(result.legacyAtk, result.legacyExpected);
});

test('Hex attacking type uses all 56 current positions and leaves the legacy 8-column rule intact', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const errors=[];
        for (let square=0;square<56;square++) {
            const white=(Math.floor(square/7)+square%7)%2!==0;
            const piece={type:'1',square,talismans:[]};
            if(TypeSystem.getHexAttackingType(piece)!==(white?'grass':'poison')) errors.push(square);
        }
        return {errors,hex:TypeSystem.getHexAttackingType({type:'1',square:8}),
            legacy:TypeSystem.getAttackingType({type:'1'},8)};
    })()`);
    assert.equal(result.errors.length,0);
    assert.equal(result.hex,'poison');
    assert.equal(result.legacy,'grass');
});

test('basic attacks apply real type effectiveness once, before shield absorption', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        return [['4','1',40,'fire',2],['4','7',10,'fire',0.5],
            ['7','74',80,'water',4],['25','27',0,'electric',0]].map(([a,b,expected,element,multiplier])=>{
            const combat=new HexCombat(new HexBoard());
            combat.addUnit(1,{id:'a',type:a,color:'w',maxHp:1000,attackDamage:20,attackRange:4});
            combat.addUnit(0,{id:'b',type:b,color:'b',maxHp:1000});
            const attacker=combat.units.get('a'),defender=combat.units.get('b');
            defender.shield=5;
            combat.attack(attacker,0);
            const event=combat.events.find(e=>e.type==='damage');
            return {hpDamage:1000-defender.hp,expectedHp:Math.max(0,expected-5),
                shield:defender.shield,expectedShield:Math.max(0,5-expected),
                element:event.element,expectedElement:element,multiplier:event.effectiveness,expectedMultiplier:multiplier};
        });
    })()`);
    for(const row of result) {
        assert.equal(row.hpDamage,row.expectedHp);
        assert.equal(row.shield,row.expectedShield);
        assert.equal(row.element,row.expectedElement);
        assert.equal(row.multiplier,row.expectedMultiplier);
    }
});

test('moving a dual-type Pokémon changes its next attack and skill element, not its class', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(7,{id:'a',type:'1',color:'w',combatRole:'fighter',maxHp:1000,attackDamage:20,attackRange:4});
        combat.addUnit(1,{id:'b',type:'7',color:'b',maxHp:1000});
        const a=combat.units.get('a'),b=combat.units.get('b');
        combat.attack(a,1);
        combat.hex.moveUnit(7,0);a.square=0;
        combat.attack(a,1);a.mana=100;combat.castSkill(a);
        return {hp:b.hp,role:a.combatRole,elements:combat.events.filter(e=>e.type==='damage').map(e=>e.element),
            multipliers:combat.events.filter(e=>e.type==='damage').map(e=>e.effectiveness),
            skillElement:combat.events.find(e=>e.type==='skill-cast').element};
    })()`);
    assert.equal(result.hp,917); // Grass 40, Poison 20, Poison skill 23.
    assert.equal(result.role,'fighter');
    assert.deepEqual(Array.from(result.elements),['grass','poison','poison']);
    assert.deepEqual(Array.from(result.multipliers),[2,1,1]);
    assert.equal(result.skillElement,'poison');
});

test('declared skill element is consistent across AoE targets and differs from basic attacks', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const combat=new HexCombat(new HexBoard());
        HexSkillInfo.mage.element='water';
        combat.addUnit(1,{id:'a',type:'4',color:'w',combatRole:'mage',maxHp:1000,attackDamage:100,mana:100});
        for(const [square,id,type] of [[8,'rock','74'],[7,'water','7'],[9,'grass','1']])
            combat.addUnit(square,{id,type,color:'b',maxHp:1000});
        const a=combat.units.get('a');a.targetId='rock';combat.castSkill(a);
        return {basicElement:TypeSystem.getHexAttackingType(a),
            damage:combat.events.filter(e=>e.type==='damage').map(e=>[e.element,e.damage,e.effectiveness]),
            eventElement:combat.events.find(e=>e.type==='skill-cast').element};
    })()`);
    assert.equal(result.basicElement,'fire');
    assert.equal(result.eventElement,'water');
    assert.deepEqual(Array.from(result.damage,row=>Array.from(row)),[['water',364,4],['water',46,0.5],['water',46,0.5]]);
});

test('non-elemental damage bypasses immunity; fixed true damage also bypasses shield and amplification', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(1,{id:'a',type:'25',color:'w',maxHp:1000});
        combat.addUnit(0,{id:'b',type:'27',color:'b',maxHp:1000});
        const a=combat.units.get('a'),b=combat.units.get('b');b.shield=7;
        const immune=combat.dealDamage(a,b,20);
        const nonElemental=combat.dealDamage(a,b,20,'attack',{damageType:'non-elemental'});
        b.shield=50;combat.tickCount=combat.maxBattleTicks;
        const trueDamage=combat.dealDamage(a,b,10,'skill',{damageType:'true'});
        return {immune,nonElemental,trueDamage,shield:b.shield,
            elements:combat.events.filter(e=>e.type==='damage').map(e=>e.element)};
    })()`);
    assert.equal(result.immune,0);
    assert.equal(result.nonElemental,13);
    assert.equal(result.trueDamage,10);
    assert.equal(result.shield,50);
    assert.deepEqual(Array.from(result.elements),['electric',null,null]);
});

test('Type Gem changes both displayed elements and Hex damage; immunities stay zero', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const combat = new HexCombat(new HexBoard());
        combat.addUnit(0, {id: 'a', type: '4', color: 'w', maxHp: 500, attackDamage: 100, talismans: ['water_gem']});
        combat.addUnit(1, {id: 'b', type: '74', color: 'b', maxHp: 500});
        const a = combat.units.get('a'), b = combat.units.get('b');
        const matchup = TypeSystem.getHexAttack(a, b);
        const dealt = combat.dealDamage(a, b, 10);
        const immuneCombat = new HexCombat(new HexBoard());
        immuneCombat.addUnit(0, {id: 'electric', type: '25', color: 'w', maxHp: 500});
        immuneCombat.addUnit(1, {id: 'ground', type: '27', color: 'b', maxHp: 500});
        const immune = immuneCombat.dealDamage(immuneCombat.units.get('electric'), immuneCombat.units.get('ground'), 10);
        return { element: matchup.element, multiplier: matchup.multiplier, dealt, immune, skillDescription: HexSkillInfo.getDescription('fighter') };
    })()`);
    assert.equal(result.element, 'water');
    assert.equal(result.multiplier, 4);
    assert.equal(result.dealt, 40);
    assert.equal(result.immune, 0);
    assert.match(result.skillDescription, /117% ATK/);
});

test('skill metadata preserves existing range policy and invalid casts never spend mana', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const c=new HexCombat(new HexBoard());
        c.addUnit(0,{id:'caster',type:'4',color:'w',combatRole:'fighter',maxHp:100,attackDamage:10,attackRange:1,maxMana:100,mana:100});
        c.addUnit(55,{id:'enemy',type:'4',color:'b',maxHp:100,attackDamage:10});
        const a=c.units.get('caster'),b=c.units.get('enemy');
        a.mana=99;const low=!c.castSkill(a)&&a.mana===99;
        a.mana=100;a.nextSkillTick=10;const cooldown=!c.castSkill(a)&&a.mana===100;
        a.nextSkillTick=0;b.hp=0;const dead=!c.castSkill(a)&&a.mana===100;
        b.hp=100;a.combatRole='unsupported';const unsupported=!c.castSkill(a)&&a.mana===100;
        a.combatRole='fighter';a.targetId=a.id;const valid=c.castSkill(a)&&a.mana===0&&b.hp===94&&a.skillCasts===1;
        return {low,cooldown,dead,unsupported,valid,distance:c.hex.distance(0,55),range:HexSkillInfo.fighter.range,
            basic:HexSkillInfo.basicAttack(a).category,active:HexSkillInfo.fighter.category,passive:HexTraits.CONFIG.guardian.category};
    })()`);
    assert.ok(result.low&&result.cooldown&&result.dead&&result.unsupported&&result.valid);
    assert.equal(result.distance,10);assert.equal(result.range,null);
    assert.equal(result.basic,'basic');assert.equal(result.active,'active');assert.equal(result.passive,'passive');
});

test('inspector follows stable unit ID while moving and hides when it dies', () => {
    const { context, run } = loadGame();
    const classes = new Set();
    const body = { innerHTML: '', children:[], querySelectorAll:()=>[], append() {} };
    context.document.createElement = () => ({dataset:{},append() {},innerHTML:''});
    context.document.createTextNode = text => ({textContent:text});
    context.HexPreparationInfo.panel = {
        classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name) },
        querySelector: selector => selector === '.hex-inspector-body' ? body : null, querySelectorAll: () => [], dataset: {}, contains:()=>false
    };
    const result = run(`(() => {
        const ui = Object.create(RoguelikeUI.prototype);
        ui.stage = 1; ui.phase = 'battle'; ui.game = new ChessGame();
        ui.game.board[49] = {type: '7', color: 'w', talismans: []};
        ui.game.board[0] = {type: '4', color: 'b', talismans: []};
        ui.hexCombat = new HexBridge(ui).createCombat(); window.roguelikeUI = ui;
        HexPreparationInfo.showCombatUnit('hex_49');
        const unit = ui.hexCombat.units.get('hex_49');
        ui.hexCombat.hex.moveUnit(49, 42); unit.square = 42; unit.hp -= 20;
        HexPreparationInfo.refresh();
        const follows = HexPreparationInfo.selectedUnitId === 'hex_49' && HexPreparationInfo.selectedSquare === 42;
        const resolves = HexPreparationInfo.getCombatUnit(42) === unit;
        ui.hexCombat.killUnit(unit); HexPreparationInfo.refresh();
        return {follows, resolves, hidden: !HexPreparationInfo.panel.classList.contains('visible')};
    })()`);
    assert.ok(result.follows && result.resolves && result.hidden);
    assert.ok(body.innerHTML.includes(run("t('combat.battle')")));
});

test('boss phases update stats and attack cooldown using the live unit', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const combat = new HexCombat(new HexBoard());
        combat.addUnit(0, {id:'boss', type:'143', color:'b', maxHp:1000, attackDamage:100, attackSpeed:1, isBoss:true, bossType:'boss'});
        const boss = combat.units.get('boss');
        boss.hp = 500; combat.updateBossPhase(boss);
        const phase2 = [boss.bossPhase, boss.attackDamage, boss.attackSpeed];
        boss.hp = 200; combat.updateBossPhase(boss);
        return {phase2, phase3:[boss.bossPhase, boss.attackDamage, boss.attackSpeed, boss.mana], cooldown:combat.getAttackCooldown(boss)};
    })()`);
    assert.deepEqual(Array.from(result.phase2), [2, 125, 1.2]);
    assert.deepEqual(Array.from(result.phase3), [3, 150, 1.5, 100]);
    assert.equal(result.cooldown, 20);
});

test('pause/resume does not advance time; cleanup stops timers and retains results only when requested', () => {
    const { context, timers, run } = loadGame();
    let blocked = true;
    context.document.querySelector = () => blocked ? {} : null;
    run(`window.roguelikeUI = Object.create(RoguelikeUI.prototype);
        const ui = window.roguelikeUI; ui.phase='battle';
        ui.hexCombat = new HexCombat(new HexBoard());
        ui.hexCombat.addUnit(0,{id:'a',type:'4',color:'w'});
        ui.hexCombat.addUnit(49,{id:'b',type:'7',color:'b'});
        ui.hexCombat.start(); ui.syncHexBattlePause();`);
    assert.equal(timers.size, 0);
    assert.equal(context.roguelikeUI.hexCombat.tickCount, 0);
    blocked = false;
    run('ui.syncHexBattlePause(); ui.syncHexBattlePause();');
    assert.equal(timers.size, 1);
    let destroyed = 0;
    context.roguelikeUI.hexRenderer = { destroy() { destroyed++; } };
    run('ui.disposeHexBattle(true);');
    assert.equal(timers.size, 0);
    assert.equal(destroyed, 1);
    assert.ok(context.roguelikeUI.hexCombat);
    run('ui.disposeHexBattle();');
    assert.equal(context.roguelikeUI.hexCombat, null);
});

test('victory speed rewards use elapsed ticks at the 15s and 30s boundaries', () => {
    const { run } = loadGame();
    const rewards = run(`(() => {
        const rewards=[];
        for (const tickCount of [0, 449, 450, 899, 900]) {
            const ui=Object.create(RoguelikeUI.prototype);
            ui.stage=1; ui.gold=0; ui.inventory=[]; ui.game=new ChessGame();
            ui.hexCombat={winner:'w',tickCount,tickRate:30,units:new Map([['a',{color:'w',hp:10}]])};
            for(const method of ['updateSkipButton','clearAutoBattleTimer','updateStats','addLog','showRoguelikeChoices','renderCombatSummary'])ui[method]=()=>{};
            ui.handleStageVictory(); rewards.push(ui.gold);
        }
        return rewards;
    })()`);
    assert.deepEqual(Array.from(rewards), [8, 8, 6, 6, 4]);
});

test('real-time windups resolve damage at the hit tick and discard dead targets', () => {
    const { run } = loadGame();
    const result = run(`(() => {
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(0,{id:'a',type:'4',color:'w',maxHp:1000,attackDamage:20});
        combat.addUnit(1,{id:'b',type:'1',color:'b',maxHp:1000});
        const a=combat.units.get('a'),b=combat.units.get('b');
        combat.deferDamage=true;combat.attack(a,1);combat.deferDamage=false;
        const before=b.hp;combat.tickCount=3;combat.resolvePendingHits();const early=b.hp;
        combat.tickCount=4;combat.resolvePendingHits();const hit=b.hp;
        combat.deferDamage=true;combat.attack(a,1);combat.deferDamage=false;
        combat.killUnit(b);combat.tickCount=8;combat.resolvePendingHits();
        return {before,early,hit,hits:combat.events.filter(e=>e.type==='damage').length,
            pending:combat.pendingHits.length,damage:combat.getSummary().units.find(u=>u.id==='a').damageDealt};
    })()`);
    assert.equal(result.before,1000); assert.equal(result.early,1000); assert.equal(result.hit,960);
    assert.equal(result.hits,1); assert.equal(result.pending,0); assert.equal(result.damage,40);
});

test('rewards are three distinct deterministic choices, persist in real save slots, and claim once', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);
        Object.assign(ui,{stage:10,gold:20,inventory:[{id:1,type:'1',talismans:[],traits:['swift'],wounds:.4}],invNextId:2,
            talismanInventory:[],talismanNextId:1,placedPieces:[],currentSaveSlot:1,game:new ChessGame()});
        for(const name of ['updateStats','renderInventory','renderTalismans','renderCombatSummary','showRoguelikeChoices'])ui[name]=()=>{};
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(49,{id:'hero',type:'1',color:'w',maxHp:100,hp:60,sourcePiece:{invId:1}});
        combat.winner='w';ui.hexCombat=combat;
        ui.beginRoguelikeReward(8);
        const offered=JSON.stringify(ui.runState.pendingReward.choices);
        const unique=new Set(ui.runState.pendingReward.choices.map(c=>c.kind)).size;
        const saved=SaveSystem.getSlot(1);
        ui.runState=RoguelikeExpansion.restore(saved.runState);
        const unchanged=JSON.stringify(ui.runState.pendingReward.choices)===offered;
        const id=ui.runState.pendingReward.choices[0].id;
        const first=ui.claimRoguelikeReward(id),after=JSON.stringify([ui.gold,ui.inventory,ui.talismanInventory,ui.runState]);
        const second=ui.claimRoguelikeReward(id),noDuplicate=after===JSON.stringify([ui.gold,ui.inventory,ui.talismanInventory,ui.runState]);
        return {unique,unchanged,first,second,noDuplicate,saved:SaveSystem.getSlot(1).runState.pendingReward===null,
            traits:saved.inventory[0].traits,wounds:saved.inventory[0].wounds};
    })()`);
    assert.equal(result.unique,3);assert.ok(result.unchanged&&result.first&&result.noDuplicate&&result.saved);
    assert.equal(result.second,false);assert.deepEqual(Array.from(result.traits),['swift']);assert.equal(result.wounds,.4);
});

test('all six stage events are reachable, deterministic, affordable, single-use, and skip boss stages', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);
        Object.assign(ui,{stage:1,gold:0,inventory:[{id:1,type:'1'}],invNextId:2,talismanInventory:[],talismanNextId:1});
        ui.runState=RoguelikeExpansion.createRun();
        const kinds=new Set();let deterministic=true,bossSkipped=true;
        for(let seed=1;seed<500;seed++){
            ui.runState.seed=seed;
            const event=RoguelikeExpansion.event(ui,2);
            if(event){kinds.add(event.kind);deterministic&&=JSON.stringify(event)===JSON.stringify(RoguelikeExpansion.event(ui,2));}
            for(const stage of [5,10,15,20])bossSkipped&&=RoguelikeExpansion.event(ui,stage)===null;
        }
        let seed=1,event;
        while(!(event=RoguelikeExpansion.event(ui,2))){ui.runState.seed=++seed;}
        ui.runState.pendingEvent=event;
        ui.advanceRoguelikeStage=()=>{ui.stage++;};ui.saveRoguelikeProgress=()=>{};
        const leave=event.choices.find(c=>c.kind==='leave').id;
        const first=ui.claimRoguelikeEvent(leave),second=ui.claimRoguelikeEvent(leave);
        const affordable=!RoguelikeExpansion.apply(ui,{kind:'pokemon',pokemon:'4',cost:3});
        return {kinds:[...kinds].sort(),deterministic,bossSkipped,first,second,stage:ui.stage,
            replay:RoguelikeExpansion.event(ui,2)===null,affordable,gold:ui.gold};
    })()`);
    assert.deepEqual(Array.from(result.kinds),['cursed','merchant','shrine','training','treasure','wild']);
    assert.ok(result.deterministic&&result.bossSkipped&&result.first&&result.replay&&result.affordable);
    assert.equal(result.second,false);assert.equal(result.stage,2);assert.equal(result.gold,0);
});

test('old run saves gain safe defaults and permanent upgrades, traits, rerolls and wounds are bounded', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const old=RoguelikeExpansion.restore(null);
        const ui=Object.create(RoguelikeUI.prototype);
        Object.assign(ui,{gold:1000,inventory:[{id:1,type:'1',wounds:0}],runState:old});
        for(let i=0;i<100;i++)for(const choice of [
            {kind:'upgrade',attribute:'hp',amount:4},{kind:'upgrade',attribute:'speed',amount:5},
            {kind:'curse',wounds:.15},{kind:'reroll'},{kind:'risk',amount:1,wounds:.1}])RoguelikeExpansion.apply(ui,choice);
        RoguelikeExpansion.apply(ui,{kind:'trait',invId:1,trait:'swift'});
        RoguelikeExpansion.apply(ui,{kind:'trait',invId:1,trait:'arcane'});
        const third=RoguelikeExpansion.apply(ui,{kind:'trait',invId:1,trait:'guardian'});
        const duplicate=RoguelikeExpansion.apply(ui,{kind:'trait',invId:1,trait:'swift'});
        const wounds=ui.inventory[0].wounds;
        RoguelikeExpansion.apply(ui,{kind:'healing',amount:.35});
        return {defaults:old.version===3&&old.pendingReward===null,upgrades:old.upgrades,rerolls:old.freeRerolls,
            traits:ui.inventory[0].traits,third,duplicate,wounds,healed:ui.inventory[0].wounds};
    })()`);
    assert.ok(result.defaults);assert.deepEqual({...result.upgrades},{hp:40,attack:12,speed:60});assert.equal(result.rerolls,20);
    assert.equal(result.traits.length,2);assert.equal(result.third,false);assert.equal(result.duplicate,false);
    assert.equal(result.wounds,.5);assert.ok(Math.abs(result.healed-.15)<1e-10);
});

test('traits trigger actual damage, healing, mana and shields with cooldowns and no stacking', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(0,{id:'a',type:'4',color:'w',maxHp:200,hp:90,attackDamage:20,traits:['berserker','vampiric']});
        combat.addUnit(1,{id:'b',type:'1',color:'b',maxHp:200,traits:['laststand']});
        combat.addUnit(7,{id:'c',type:'7',color:'w',maxHp:200,traits:['arcane','guardian']});
        const a=combat.units.get('a'),b=combat.units.get('b'),c=combat.units.get('c');
        HexTraits.update(combat,a);const berserk=a.attackDamage;
        HexTraits.update(combat,a);const stacked=a.attackDamage;
        HexTraits.update(combat,c);const mana=c.mana,shield=a.shield;
        HexTraits.update(combat,c);const noRepeat=c.mana===mana&&a.shield===shield;
        const before=a.hp;combat.dealDamage(a,b,40,'attack',{damageType:'non-elemental'});
        const heal=a.hp-before;
        combat.dealDamage(a,b,40,'attack',{damageType:'non-elemental'});const sameTickHp=a.hp;
        combat.tickCount=30;combat.dealDamage(a,b,40,'attack',{damageType:'non-elemental'});const laterHp=a.hp;
        combat.dealDamage(a,b,1000,'attack',{damageType:'true'});const lastStand=b.hp;
        combat.dealDamage(a,b,1000,'attack',{damageType:'true'});const dead=!combat.units.has('b');
        a.hp=100;combat.tickCount=240;HexTraits.update(combat,a);
        const restored=a.attackDamage;
        combat.tickCount=241;HexTraits.update(combat,a);
        const stats=combat.getSummary().units.find(u=>u.id==='a');
        return {berserk,stacked,mana,shield,noRepeat,heal,sameTickHp,laterHp,lastStand,dead,restored,
            healing:stats.healingDone,damage:stats.damageDealt,defenderHealing:combat.statistics.get('b').healingDone};
    })()`);
    assert.equal(result.berserk,24);assert.equal(result.stacked,24);assert.equal(result.mana,35);assert.equal(result.shield,24);
    assert.ok(result.noRepeat);assert.equal(result.heal,6);assert.equal(result.sameTickHp,96);assert.equal(result.laterHp,102);
    assert.equal(result.lastStand,40);assert.ok(result.dead);assert.equal(result.restored,20);
    assert.equal(result.healing,12);assert.equal(result.damage,240);assert.equal(result.defenderHealing,40);
});

test('Swift and class/element synergy use the shared preview and count unique deployed species', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=3;ui.game=new ChessGame();
        ui.inventory=[{id:1,type:'1',traits:['swift'],wounds:.3}];
        ui.placedPieces=[{sq:49,type:'1'},{sq:50,type:'4'},{sq:51,type:'1'}];
        for(const [sq,type] of [[49,'1'],[50,'4'],[51,'1']])ui.game.board[sq]={color:'w',type,talismans:[],invId:sq===49?1:undefined};
        const bonus=HexTraits.classBonus(ui,ui.game.board[49]),counts=HexTraits.classSynergies(ui);
        const preview=new HexBridge(ui).getUnitStats(ui.game.board[49],49);
        const live=new HexBridge(ui).createCombat().getUnitAt(49);
        const base=getPokemonBaseSpeed(PIECES['1'])+SynergySystem.getBonusSpeed(ui.game.board[49],ui);
        const same=['hp','maxHp','attackDamage','pokemonSpeed','moveCooldownTicks','mana','critChance'].every(key=>live[key]===preview[key]);
        ui.stage=1;const early=HexTraits.classBonus(ui,ui.game.board[49]);
        ui.stage=3;ui.placedPieces=[];ui.game.board.fill(null);
        for(const [i,type] of ['1','4','7','25','74','92'].entries()){
            const sq=49+i;ui.placedPieces.push({sq,type});ui.game.board[sq]={color:'w',type};
        }
        const diversity=HexTraits.elementDiversity(ui);
        return {same,count:counts.fighter.count,tier:counts.fighter.tier,attack:bonus.attack,early:early.attack,
            swift:preview.pokemonSpeed===base+20,move:preview.moveCooldownTicks,hp:preview.hp,maxHp:preview.maxHp,
            diversity:diversity.tier,diversityBonus:HexTraits.classBonus(ui,ui.game.board[49]).hp};
    })()`);
    assert.ok(result.same&&result.swift);assert.equal(result.count,2);assert.equal(result.tier,1);
    assert.equal(result.attack,2);assert.equal(result.early,0);assert.equal(result.move,12);
    assert.equal(result.hp,Math.round(result.maxHp*.7));assert.equal(result.diversity,2);assert.equal(result.diversityBonus,10);
});

test('elite mechanics mitigate, summon with no repeated scaling, and leave boss scheduling intact', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const ui=Object.create(RoguelikeUI.prototype);ui.stage=6;ui.game=new ChessGame();
        const bridge=new HexBridge(ui),piece={color:'b',type:'4',eliteType:'armored',talismans:[]};
        ui.game.board[0]=piece;
        const base=bridge.getUnitStats({...piece,eliteType:null},0),armored=bridge.getUnitStats(piece,0);
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(0,{...armored,id:'armor'});combat.addUnit(1,{id:'a',type:'7',color:'w',maxHp:1000});
        const damage=combat.dealDamage(combat.getUnitAt(1),combat.getUnitAt(0),100,'attack',{damageType:'non-elemental'});
        combat.addUnit(7,{...bridge.getUnitStats({...piece,eliteType:'summoner'},7),id:'summoner'});
        const parent=combat.units.get('summoner');
        for(let i=0;i<10;i++)HexTraits.summon(combat,parent);
        const children=[...combat.units.values()].filter(u=>u.id.startsWith('summon_'));
        const noRescale=children.every(u=>u.maxHp===Math.round(parent.maxHp*.35)&&u.attackDamage===Math.round(parent.attackDamage*.6));
        const elemental=combat.units.get('armor');elemental.eliteType='elemental';elemental.element='fire';elemental.damageReduction=0;
        const elementalDamage=combat.dealDamage(combat.getUnitAt(1),elemental,100,'attack',{element:'fire'});
        const bossStages=[5,10,15,20].every(stage=>HexTraits.eliteFor(stage,0,0)===null);
        return {hp:armored.maxHp===Math.round(base.maxHp*1.25),atk:armored.attackDamage===Math.round(base.attackDamage*.9),
            damage,summons:children.length,noRescale,bossStages,elementalDamage};
    })()`);
    assert.ok(result.hp&&result.atk&&result.noRescale&&result.bossStages);assert.equal(result.damage,80);assert.equal(result.summons,2);
    assert.equal(result.elementalDamage,38); // Fire resists Fire: 100 × .5 × .75, rounded.
});

test('actual-data early/mid/late and boss fights finish with finite stats and event-based summaries', () => {
    const {run}=loadGame();
    const results=run(`(() => {
        const results=[];
        for(const stage of [1,5,10,20])for(const roster of [
            ['1','4','7'],['143','65','94','130','25'],['1','2','3','152','153'],['4','5','6','126','136']]){
            const ui=Object.create(RoguelikeUI.prototype);ui.stage=stage;ui.game=new ChessGame();ui.inventory=[];ui.placedPieces=[];
            for(const [i,type] of roster.entries()){
                ui.game.board[49+i]={type,color:'w',talismans:[]};ui.placedPieces.push({sq:49+i,type});
                ui.game.board[i]={type,color:'b',talismans:[],isBoss:i===0&&stage%5===0};
            }
            const combat=new HexBridge(ui).createCombat({random:()=>.5});
            while(!combat.battleEnded&&combat.tickCount<=combat.maxBattleTicks)combat.step();
            const summary=combat.getSummary(),events=combat.events.filter(e=>e.type==='damage');
            results.push({stage,roster:roster.join(','),winner:summary.winner,seconds:summary.seconds,
                finished:combat.battleEnded,finite:summary.units.every(u=>Number.isFinite(u.damageDealt)&&Number.isFinite(u.damageTaken)&&u.hp>=0),
                exact:summary.units.reduce((sum,u)=>sum+u.damageDealt,0)===events.reduce((sum,e)=>sum+e.damage,0),
                clean:combat.pendingHits.length===0});
        }
        return results;
    })()`);
    for(const row of results)assert.ok(row.finished&&row.finite&&row.exact&&row.clean&&row.seconds<=180,JSON.stringify(row));
    console.log('Controlled roster balance samples:',JSON.stringify(results.map(({stage,roster,winner,seconds})=>({stage,roster,winner,seconds}))));
});

test('critical hits use actual damage events; reset clears old hits, statistics and timers', () => {
    const {run,timers}=loadGame();
    const result=run(`(() => {
        const combat=new HexCombat(new HexBoard(),{random:()=>0});
        combat.addUnit(0,{id:'a',type:'4',color:'w',maxHp:100,attackDamage:20,critChance:.2});
        combat.addUnit(1,{id:'b',type:'1',color:'b',maxHp:100});
        combat.attack(combat.getUnitAt(0),1);
        const event=combat.events.find(e=>e.type==='damage'),damage=combat.statistics.get('a').damageDealt;
        combat.deferDamage=true;combat.attack(combat.getUnitAt(0),1);combat.start();combat.reset();
        const cleared=combat.pendingHits.length===0&&combat.statistics.size===0&&combat.units.size===0&&combat.events.length===0&&!combat.running;
        combat.addUnit(0,{id:'a',type:'7',color:'w',maxHp:100});
        return {critical:event.critical,damage,cleared,fresh:combat.statistics.get('a').damageDealt===0};
    })()`);
    assert.ok(result.critical&&result.cleared&&result.fresh);assert.equal(result.damage,60);assert.equal(timers.size,0);
});

test('a melee windup cancels if its target moves out of range; mana and tank shield are capped', () => {
    const {run}=loadGame();
    const result=run(`(() => {
        const combat=new HexCombat(new HexBoard());
        combat.addUnit(0,{id:'a',type:'143',combatRole:'tank',color:'w',maxHp:100,attackDamage:20});
        combat.addUnit(1,{id:'b',type:'1',color:'b',maxHp:1000});
        const a=combat.getUnitAt(0),b=combat.getUnitAt(1);
        combat.deferDamage=true;combat.attack(a,1);combat.deferDamage=false;
        combat.hex.moveUnit(1,55);b.square=55;combat.tickCount=4;combat.resolvePendingHits();
        for(let i=0;i<100;i++){combat.tickCount+=90;combat.gainMana(a,1000);combat.castSkill(a);}
        combat.gainMana(a,1000);
        return {hp:b.hp,shield:a.shield,mana:a.mana,casts:a.skillCasts};
    })()`);
    assert.equal(result.hp,1000);assert.equal(result.shield,100);assert.equal(result.mana,100);assert.equal(result.casts,100);
});

test('existing encounter generator remains playable with bounded run upgrades at normal and boss stages', () => {
    const {run}=loadGame();
    const results=run(`(() => {
        const originalRandom=Math.random,results=[];
        try {
            for(const stage of [1,3,5,6,10,12,20]) {
                const ui=Object.create(RoguelikeUI.prototype);ui.stage=stage;ui.game=new ChessGame();ui.placedPieces=[];ui.inventory=[];
                ui.runState=RoguelikeExpansion.createRun();ui.runState.seed=1701;
                Math.random=RoguelikeExpansion.random(ui.runState,stage,'balance-encounter');
                ui.runState.upgrades={hp:Math.min(40,stage*2),attack:Math.min(12,stage),speed:Math.min(60,stage*3)};
                const roster=stage===1?['1','4','7']:['3','6','9','65','143','25'];
                for(const [i,type] of roster.entries()) {
                    const sq=49+i;ui.placedPieces.push({sq,type});ui.game.board[sq]={type,color:'w',talismans:[]};
                }
                const enemies=ui.getEnemyFormation(ui.getEnemyPiecesForStage(stage)),boss=ui.createStageBoss(stage);
                const bossSquare=boss?(enemies.find(e=>e.role==='tank')??enemies.find(e=>e.role==='fighter')??enemies[0]).square:null;
                for(const enemy of enemies){
                    const piece={type:enemy.type,color:'b',talismans:[...(PIECES[enemy.type].defaultTalismans??[])],
                        eliteType:HexTraits.eliteFor(stage,enemy.square,enemies[0].square)};
                    if(enemy.square===bossSquare)Object.assign(piece,boss);
                    ui.game.board[enemy.square]=piece;
                }
                const combat=new HexBridge(ui).createCombat({random:Math.random});
                const bosses=[...combat.units.values()].filter(u=>u.isBoss).length;
                while(!combat.battleEnded&&combat.tickCount<=combat.maxBattleTicks)combat.step();
                const summary=combat.getSummary();
                results.push({stage,winner:summary.winner,seconds:summary.seconds,bosses,expectedBoss:stage%5===0?1:0,
                    bounded:combat.pendingHits.length===0&&summary.units.every(u=>Number.isFinite(u.damageDealt)&&u.hp>=0)});
            }
        } finally {Math.random=originalRandom;}
        return results;
    })()`);
    for(const row of results){assert.ok(row.bounded&&row.winner&&row.seconds<=180,JSON.stringify(row));assert.equal(row.bosses,row.expectedBoss);}
    console.log('Existing encounter samples (controlled veteran squad, not a win-rate claim):',JSON.stringify(results));
});
