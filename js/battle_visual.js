'use strict';

window.UnitHealthBar = {
    ratio(current, maximum) {
        return Number.isFinite(current) && Number.isFinite(maximum) && maximum > 0
            ? Math.max(0, Math.min(1, current / maximum)) : 0;
    },
    create(current, maximum, owner) {
        const track = document.createElement('div'); track.className = 'hex-combat-hp unit-healthbar';
        const fill = document.createElement('div'); fill.className = 'hex-combat-hp-fill';
        fill.style.clipPath = `inset(0 ${(1 - this.ratio(current, maximum)) * 100}% 0 0)`;
        track.append(fill); track.setAttribute('aria-hidden','true');window.FactionHealth?.apply(track,owner); return track;
    }
};

// Presentation only: move the existing nodes, never duplicate inventory/state.
window.BattleVisual = {
    fitBoard() {
        const wrapper = document.querySelector('.board-wrapper');
        const frame = wrapper?.querySelector('.board-frame');
        const cells = [...document.querySelectorAll('.board .square')];
        if (!wrapper || !frame || !cells.length || !document.body.classList.contains('hex-mode')) return;
        // Extrema include every vertex of the existing pointy hex polygon.
        const bounds = cells.reduce((b, cell) => ({
            left: Math.min(b.left, cell.offsetLeft), top: Math.min(b.top, cell.offsetTop),
            right: Math.max(b.right, cell.offsetLeft + cell.offsetWidth),
            bottom: Math.max(b.bottom, cell.offsetTop + cell.offsetHeight)
        }), {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity});
        const compact = window.matchMedia('(max-width:1050px)').matches;
        const size = Math.max(wrapper.clientWidth, wrapper.clientHeight);
        if (size <= 0) return;
        const offsetX = (wrapper.clientWidth - size) / 2, offsetY = (wrapper.clientHeight - size) / 2;
        // On compact screens crop the decorative perimeter, then intersect the
        // transformed clearing with the visible viewport before fitting the grid.
        const grass = {
            left: Math.max(8, offsetX + size * .18), right: Math.min(wrapper.clientWidth - 8, offsetX + size * .82),
            top: Math.max(8, offsetY + size * .19), bottom: Math.min(wrapper.clientHeight - 8, offsetY + size * .81)
        };
        const scale = Math.max(0, Math.min((grass.right - grass.left) / (bounds.right - bounds.left + 8), (grass.bottom - grass.top) / (bounds.bottom - bounds.top + 16)));
        wrapper.style.backgroundSize = `${size}px ${size}px`;
        frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
        frame.style.left = `${(grass.left + grass.right) / 2}px`; frame.style.top = `${(grass.top + grass.bottom) / 2}px`;
        this.transform = {scale, bounds, mapSize: size, offsetX, offsetY, grass};
    },
    drawer(side) {
        const app = document.getElementById('app');
        this.drawerFocus = document.activeElement;
        app.dataset.drawer = app.dataset.drawer === side ? '' : side;
        document.querySelectorAll('[data-open-drawer]').forEach(button => {
            button.setAttribute('aria-expanded', String(button.dataset.openDrawer === app.dataset.drawer));
        });
        const panel = document.querySelector(app.dataset.drawer === 'left' ? '.left-panel' : '.right-panel');
        if (app.dataset.drawer) panel?.querySelector('button')?.focus();
    },
    init() {
        const arena = document.querySelector('.board-view');
        arena.insertBefore(document.getElementById('talismanApplyBanner'),document.querySelector('.board-wrapper'));
        const bench = document.createElement('section'); bench.className = 'bench-dock card-box';
        bench.setAttribute('aria-label', t('shop.bench'));
        const title = document.createElement('div'); title.className = 'bench-header';
        title.append(document.getElementById('tabPokemonBench'), document.getElementById('btnSell'));
        bench.append(title, document.getElementById('inventorySlots'));
        document.getElementById('pokemonPanel').append(bench);
        const market = document.getElementById('marketView');
        arena.append(market);
        const collapse = document.createElement('button'); collapse.type = 'button';
        collapse.className = 'btn recruit-collapse'; collapse.dataset.i18n = 'layout.collapse';
        collapse.setAttribute('aria-expanded', 'true'); collapse.setAttribute('aria-controls', 'pokemonContent');
        collapse.onclick = () => { const closed = market.classList.toggle('collapsed'); collapse.setAttribute('aria-expanded', String(!closed)); this.fitBoard(); };
        market.querySelector('.pokemon-tabs').append(collapse);
        market.querySelector('.pokemon-tabs').insertBefore(document.getElementById('btnReroll'), collapse);
        const compactHeight = matchMedia('(max-height:500px)');
        const compactRecruit = () => { if(compactHeight.matches){market.classList.add('collapsed');collapse.setAttribute('aria-expanded','false');} };
        compactHeight.addEventListener('change',compactRecruit); compactRecruit();
        const capacity = document.createElement('div'); capacity.id = 'recruitCapacity'; capacity.className = 'recruit-capacity';
        market.querySelector('.pokemon-tabs').after(capacity);
        const actions = document.createElement('div'); actions.className = 'battle-actions';
        actions.append(document.getElementById('btnStartBattle')); market.querySelector('.pokemon-tabs').append(actions);
        const toolbar=document.getElementById('phaseButtons');
        // updateTurnIndicator owns the existing btnAutoFormation and its disabled state.
        toolbar.append(document.getElementById('btnUpgradeSlot'));
        const existingFx=document.getElementById('hex-fx-toggle');
        const fx=existingFx??document.createElement('button');fx.id='hex-fx-toggle';fx.className='btn';
        const labelFx=()=>fx.textContent=t(localStorage.getItem('pokechess_reduced_fx')==='1'?'vfx.low':'vfx.full');labelFx();
        if(!existingFx)fx.onclick=()=>{localStorage.setItem('pokechess_reduced_fx',localStorage.getItem('pokechess_reduced_fx')==='1'?'0':'1');labelFx();};
        toolbar.append(fx);I18n.listeners.add(labelFx);
        const settings = document.createElement('div'); settings.id='settingsModal';settings.className = 'modal-overlay hidden';
        const body = document.createElement('div'); body.className = 'modal-box settings-dialog';
        body.innerHTML='<div class="settings-heading"><h2 class="modal-title" data-i18n="menu.settings"></h2><button class="toast-close" data-i18n="menu.close"></button></div>';
        const closeSettings=()=>settings.classList.add('hidden');body.querySelector('button').onclick=closeSettings;
        const groups={};for(const key of ['audio','display','controls','language','profiles']) {
            const section=document.createElement('section');section.className='settings-section';
            const heading=document.createElement('h3');heading.dataset.i18n='settings.'+key;section.append(heading);body.append(section);groups[key]=section;
        }
        groups.audio.append(document.getElementById('musicWidget'));
        groups.language.append(document.getElementById('languageSelect'));
        groups.profiles.append(document.getElementById('btnNewRun'));
        const help=document.createElement('p');help.dataset.i18n='settings.help';groups.controls.append(help);
        settings.append(body);document.getElementById('app').append(settings);
        settings.onclick=event=>{if(event.target===settings)closeSettings();};
        const gear=document.createElement('button');gear.className='btn settings-gear';gear.id='btnSettings';gear.setAttribute('aria-label',t('menu.settings'));
        gear.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" fill-rule="evenodd" d="M6 0h4v3h2V1h2v3h2v4h-3v2h3v3h-3v3H9v-3H7v3H3v-3H0V9h3V7H0V3h3V0h3v3h2V0z M6 6v4h4V6z"/></svg>';
        gear.onclick=()=>settings.classList.remove('hidden');document.querySelector('.header-controls').append(gear);
        const motion = document.createElement('label'); motion.className = 'motion-setting';
        motion.innerHTML = '<input id="reducedMotion" type="checkbox"><span data-i18n="layout.motion"></span>';
        groups.display.append(motion);
        const fxProxy=document.createElement('button');fxProxy.className='btn';fxProxy.dataset.i18n='settings.effects';
        fxProxy.onclick=()=>document.getElementById('hex-fx-toggle')?.click();groups.display.append(fxProxy);
        for (const [key,action] of [['save.backup',() => { SaveSystem.backup(); window.roguelikeUI?.showToast(t('save.backupOk'),'success'); }],['save.rollback',() => window.roguelikeUI?.showConfirm(t('save.rollback'),() => { try { const ok=SaveSystem.restoreBackup(); window.roguelikeUI.showToast(t(ok?'save.rollbackOk':'save.noBackup'),ok?'success':'warning'); } catch(_) { window.roguelikeUI.showToast(t('save.invalid'),'error'); } })]]) {
            const button=document.createElement('button');button.type='button';button.className='btn';button.dataset.i18n=key;button.onclick=action;groups.profiles.append(button);
        }

        const input = motion.querySelector('input'); input.checked = localStorage.getItem('pokechess_reduced_motion') === '1';
        const applyMotion = () => document.body.classList.toggle('reduced-motion', input.checked || matchMedia('(prefers-reduced-motion: reduce)').matches);
        input.onchange = () => { localStorage.setItem('pokechess_reduced_motion', input.checked ? '1' : '0'); applyMotion(); };
        matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applyMotion); applyMotion();
        const nav = document.createElement('nav'); nav.className = 'battle-drawer-nav';
        for (const [side, key] of [['left','shop.bag'],['right','shop.bench']]) {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'btn';
            button.dataset.i18n = key; button.dataset.openDrawer = side;
            button.setAttribute('aria-expanded','false'); button.addEventListener('click', () => this.drawer(side)); nav.append(button);
        }
        document.querySelector('.game-header').append(nav);
        const utility = document.createElement('div'); utility.className = 'utility-actions';
        for (const [key, target] of [['menu.astralTree','btnMenuSkillTree'],['mastery.collection','btnMasteryCollection']]) {
            const button = document.createElement('button'); button.className = 'btn'; button.dataset.i18n = key;
            button.onclick = () => document.getElementById(target)?.click(); utility.append(button);
        }
        document.querySelector('.header-controls').append(utility);
        const lock=document.createElement('button');lock.className='btn recruit-lock';lock.dataset.i18n='layout.lock';lock.setAttribute('aria-pressed','false');
        // A local guard against accidental rerolls; does not alter offer generation or save data.
        lock.onclick=()=>{const locked=lock.getAttribute('aria-pressed')!=='true';lock.setAttribute('aria-pressed',String(locked));market.classList.toggle('reroll-locked',locked);};
        market.querySelector('.pokemon-tabs').insertBefore(lock,collapse);
        document.getElementById('btnReroll').addEventListener('click',event=>{if(lock.getAttribute('aria-pressed')==='true'){event.preventDefault();event.stopImmediatePropagation();window.roguelikeUI?.showToast(t('layout.lockHelp'),'info');}},true);
        const utilityToggle = document.createElement('button'); utilityToggle.className = 'btn utility-toggle'; utilityToggle.dataset.i18n = 'layout.utility';
        utilityToggle.setAttribute('aria-expanded', 'true'); utilityToggle.onclick = () => {
            const collapsed = document.querySelector('.game-layout').classList.toggle('utility-collapsed');
            utilityToggle.setAttribute('aria-expanded', String(!collapsed)); this.fitBoard();
        };
        document.querySelector('.header-controls').prepend(utilityToggle);
        const labels = {'#tabPokemonRecruit':'shop.recruit','#tabTalismanShop':'shop.shop','.talisman-panel-title':'visual.bagSynergy','.pokemon-panel-title':'shop.recruit'};
        for (const [selector,key] of Object.entries(labels)) document.querySelector(selector).dataset.i18n = key;
        for (const [id,key] of [['tabPokemonBench','shop.bench'],['tabTalismanBag','shop.bag'],['tabTalismanType','visual.synergy']]) {
            const button = document.getElementById(id), count = button.querySelector('span');
            const label = document.createElement('span'); label.dataset.i18n = key;
            button.replaceChildren(label, document.createTextNode(' ('), count, document.createTextNode(')'));
        }
        document.addEventListener('keydown', event => { if (event.key === 'Escape') {
            const opened = document.getElementById('app').dataset.drawer;
            document.getElementById('app').dataset.drawer = ''; closeSettings();
            window.HexPreparationInfo?.hide(); window.NotificationCenter?.close();
            document.querySelectorAll('[data-open-drawer]').forEach(button => button.setAttribute('aria-expanded','false'));
            if (opened) this.drawerFocus?.focus();
        } });
        // Native buttons use CSS border-image: no canvas, observer, or duplicate handlers.
        document.querySelectorAll('button').forEach(button => { if (!button.hasAttribute('type')) button.type = 'button'; });
        I18n.updateDOM();
        this.observer = new ResizeObserver(() => this.fitBoard());
        this.observer.observe(document.querySelector('.board-wrapper'));
        this.observer.observe(document.querySelector('.game-header'));
        const header=document.querySelector('.game-header'),toast=document.getElementById('gameToast');
        const placementObserver=new ResizeObserver(() => {
            const app=document.getElementById('app');
            app.style.setProperty('--header-height', `${header.offsetHeight}px`);
            app.style.setProperty('--content-top', `${header.offsetHeight+toast.offsetHeight}px`);
        });
        placementObserver.observe(header);placementObserver.observe(toast);
        document.addEventListener('DOMContentLoaded', () => this.fitBoard(), {once: true});
    }
};
BattleVisual.init();
