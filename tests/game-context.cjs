const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

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
        body: { classList: { remove: name => bodyClasses.delete(name), toggle: (name, on) => on ? bodyClasses.add(name) : bodyClasses.delete(name) } }
    };
    const storage = new Map();
    const context = {
        localStorage: {getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value), removeItem: key => storage.delete(key)},
        console: { log() {}, warn() {}, error() {} }, document,
        setInterval() { const id = ++nextTimer; timers.add(id); return id; },
        clearInterval(id) { timers.delete(id); },
        setTimeout() {}, clearTimeout() {}, addEventListener() {}
    };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    const pieceScripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8')
        .matchAll(/<script[^>]*src="([^"?]+)/g)].map(match => match[1])
        .filter(file => file.startsWith('js/pieces/'));
    const talismanScripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8')
        .matchAll(/<script[^>]*src="([^"?]+)/g)].map(match => match[1])
        .filter(file => file.startsWith('js/talismans/'));
    const scripts = [
        'locales/en-US.js', 'locales/vi-VN.js', 'locales/vi-items.js','locales/vi-text.js','locales/vi-systems.js','locales/vi-tree.js','locales/overhaul.js','js/i18n.js',
        'js/config.js', 'js/pieces_all.js', ...pieceScripts,
        'js/talisman_core.js', ...talismanScripts,
        'js/type_system.js', 'js/synergy_system.js', 'js/engine.js',
        ...[...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script[^>]*src="([^"?]+)/g)]
            .map(match => match[1]).filter(file => file.startsWith('js/trees/')),
        'js/meta_progression.js', 'js/app.js',
        'js/ui_shop.js', 'js/battle_combat.js', 'js/ui_menu.js',
        'js/autochess/hex_balance.js', 'js/autochess/hex_board.js',
        'js/autochess/hex_pathfinding.js', 'js/autochess/hex_ai.js',
        'js/autochess/hex_simulation.js', 'js/autochess/hex_combat.js',
        'js/autochess/hex_unit_config.js', 'js/autochess/hex_bridge.js',
        'js/autochess/hex_skill_info.js', 'js/autochess/hex_pokemon_info.js',
        'js/autochess/hex_preparation_info.js', 'js/save_system.js',
        'js/roguelike_expansion.js', 'js/autochess/hex_traits.js', 'js/autochess/hex_effects.js', 'js/mastery.js',
        'js/equipment.js','js/astral_modifiers.js','js/combat_equipment.js'
    ];
    for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    return { context, timers, run: code => vm.runInContext(code, context) };
}


module.exports={loadGame};
