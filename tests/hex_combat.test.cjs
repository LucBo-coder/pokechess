const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadGame() {
    const timers = new Set();
    let nextTimer = 0;
    const bodyClasses = new Set();
    const document = {
        readyState: 'loading',
        addEventListener() {},
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        body: { classList: { remove: name => bodyClasses.delete(name) } }
    };
    const context = {
        console: { log() {}, warn() {}, error() {} }, document,
        setInterval() { const id = ++nextTimer; timers.add(id); return id; },
        clearInterval(id) { timers.delete(id); },
        setTimeout() {}, clearTimeout() {}, addEventListener() {}
    };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    const scripts = [
        'js/config.js', 'js/pieces_all.js', 'js/pieces/bulbasaur.js',
        'js/pieces/charmander.js', 'js/pieces/squirtle.js',
        'js/talisman_core.js', 'js/talismans/toxic_orb.js',
        'js/talismans/soothe_bell.js', 'js/talismans/water_gem.js',
        'js/type_system.js', 'js/engine.js', 'js/app.js',
        'js/ui_shop.js', 'js/battle_combat.js', 'js/ui_menu.js',
        'js/autochess/hex_balance.js', 'js/autochess/hex_board.js',
        'js/autochess/hex_pathfinding.js', 'js/autochess/hex_ai.js',
        'js/autochess/hex_simulation.js', 'js/autochess/hex_combat.js',
        'js/autochess/hex_unit_config.js', 'js/autochess/hex_bridge.js',
        'js/autochess/hex_skill_info.js', 'js/autochess/hex_pokemon_info.js',
        'js/autochess/hex_preparation_info.js'
    ];
    for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    return { context, timers, run: code => vm.runInContext(code, context) };
}

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
            ui.getEffectivePieceStats = () => ({maxHp: 101, damage: 17, speed: 155});
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
        ui.getEffectivePieceStats = () => ({maxHp: 100, damage: 100, speed: 100});
        ui.game.board[0] = {color: 'b', type: '4'};
        const preview = HexPokemonInfo.getBattleStats(ui.game.board[0], 0, ui);
        const unit = new HexBridge(ui).createCombat().getUnitAt(0);
        return { hp: unit.maxHp, attack: unit.attackDamage, matches: preview.maxHp === unit.maxHp && preview.damage === unit.attackDamage, isBoss: preview.isBoss };
    })()`);
    assert.equal(result.hp, 2156);
    assert.equal(result.attack, 81);
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
        const unit = bridge.createCombat().getUnitAt(35);
        return {expected: Math.max(1, Math.round((base.damage + 9) * 0.35)), preview: preview.attackDamage, battle: unit.attackDamage, unchanged};
    })()`);
    assert.ok(result.unchanged);
    assert.equal(result.preview, result.expected);
    assert.equal(result.battle, result.preview);
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

test('inspector follows stable unit ID while moving and hides when it dies', () => {
    const { context, run } = loadGame();
    const classes = new Set();
    const body = { innerHTML: '' };
    context.HexPreparationInfo.panel = {
        classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name) },
        querySelector: () => body, querySelectorAll: () => [], dataset: {}
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
    assert.match(body.innerHTML, /BATTLE/);
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
            for(const method of ['updateSkipButton','clearAutoBattleTimer','updateStats','addLog'])ui[method]=()=>{};
            ui.handleStageVictory(); rewards.push(ui.gold);
        }
        return rewards;
    })()`);
    assert.deepEqual(Array.from(rewards), [8, 8, 6, 6, 4]);
});
