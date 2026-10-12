// Run against a local Chromium browser without installing test dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const browserPath = process.env.POKECHESS_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const runtimeErrors = [];
const missingLocalAssets = [];
let browser;
let socket;
let profile;
let sendCommand;

const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    fs.readFile(file, (error, data) => {
        if (error) {
            if (pathname !== '/favicon.ico') missingLocalAssets.push(pathname);
            response.writeHead(404); response.end(); return;
        }
        const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' }[path.extname(file)] || 'application/octet-stream';
        response.writeHead(200, { 'Content-Type': type }); response.end(data);
    });
});

async function main() {
    assert.ok(fs.existsSync(browserPath), 'Set POKECHESS_BROWSER to a Chromium executable.');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}/`;
    profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pokechess-review-'));
    browser = spawn(browserPath, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        '--disable-background-networking', '--remote-debugging-port=0',
        `--user-data-dir=${profile}`, '--window-size=1440,900', 'about:blank'
    ], { windowsHide: true, stdio: 'ignore' });
    let launchError;
    browser.on('error', error => { launchError = error; });
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) {
        if (launchError) throw launchError;
        await sleep(100);
    }
    assert.ok(fs.existsSync(portFile), 'Chromium did not expose its debugging port.');
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    const pending = new Map();
    let id = 0;
    socket.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.id) {
            const request = pending.get(message.id);
            pending.delete(message.id);
            if (message.error) request.reject(new Error(JSON.stringify(message.error)));
            else request.resolve(message.result);
        } else if (message.method === 'Runtime.exceptionThrown') {
            runtimeErrors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
        }
    };
    const command = (method, params = {}) => new Promise((resolve, reject) => {
        const requestId = ++id;
        pending.set(requestId, { resolve, reject });
        socket.send(JSON.stringify({ id: requestId, method, params }));
    });
    sendCommand = command;
    const screenshot = async name => {
        if (!process.argv.includes('--screenshots')) return;
        await evaluate(`Promise.race([Promise.all([...document.querySelectorAll('.board img')].map(image => image.decode().catch(() => {}))),new Promise(resolve=>setTimeout(resolve,3000))])`);
        // UI updates may replace image nodes while decode is awaited. Verify the
        // current nodes and give newly created local sprites time to finish.
        for(let i=0;i<50;i++){
            if(await evaluate(`[...document.querySelectorAll('.board .piece, .board .hex-combat-sprite')].every(image => image.complete && image.naturalWidth > 0)`))break;
            await sleep(100);
        }
        assert.ok(await evaluate(`[...document.querySelectorAll('.board .piece, .board .hex-combat-sprite')].every(image => image.complete && image.naturalWidth > 0)`), 'Missing Pokémon sprite image');
        const result = await command('Page.captureScreenshot', { format: 'png' });
        const folder = path.join(root, 'artifacts');
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(path.join(folder, (name.startsWith('visual-') ? name : 'visual-' + name) + '.png'), Buffer.from(result.data, 'base64'));
    };
    const evaluate = async expression => {
        const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        return result.result.value;
    };
    await command('Runtime.enable');
    await command('Page.enable');
    await command('Network.enable');
    // Keep this verification local and independent of fonts/audio/CDN services.
    await command('Network.setBlockedURLs', { urls: ['https://*', 'http://pokechess.fun/*'] });
    await command('Page.navigate', { url });
    for (let i = 0; i < 150; i++) {
        if (await evaluate('!!window.roguelikeUI && !!window.HexPreparationInfo?.initialized')) break;
        await sleep(100);
    }
    assert.equal(await evaluate('document.querySelectorAll(".board .square").length'), 56);
    const language = await evaluate(`(() => {
        const initial=I18n.language, vietnamese=document.getElementById('btnMenuNewRun').textContent;
        I18n.setLanguage('en-US');
        const english=document.getElementById('btnMenuNewRun').textContent;
        const persistent=localStorage.getItem(I18n.STORAGE_KEY);
        I18n.init();const restored=I18n.language;
        I18n.setLanguage('vi-VN');
        return {initial,vietnamese,english,persistent,restored,htmlLang:document.documentElement.lang};
    })()`);
    assert.equal(language.initial,'vi-VN');assert.equal(language.vietnamese,'Chơi');
    assert.equal(language.english,'Play');assert.equal(language.persistent,'en-US');
    assert.equal(language.restored,'en-US');assert.equal(language.htmlLang,'vi-VN');
    const masteryUI=await evaluate(`(() => {
        const ui=roguelikeUI;ui.resetRun();ui.closeMainMenu();MasterySystem.ensure(ui);
        const item=ui.inventory[0],placed=ui.placedPieces.find(p=>p.invId===item.id);
        ui.masteryProfile.species[item.type]=MasterySystem.speciesRecord(item.type,MasterySystem.threshold(15));
        item.individualMastery.xp=400;MasterySystem.ensure(ui);
        HexPreparationInfo.showInfo(ui.game.board[placed.sq],placed.sq);
        const section=HexPreparationInfo.panel.querySelector('.mastery-section');
        const select=section.querySelector('.mastery-specialization');select.value='defense';select.dispatchEvent(new Event('change'));
        const chosen=item.individualMastery.selectedSpecialization;
        document.getElementById('btnMasteryCollection').click();
        const modal=document.getElementById('masteryCollectionModal'),search=modal.querySelector('.mastery-search');
        search.value='Charizard';search.dispatchEvent(new Event('input'));
        const rows=modal.querySelectorAll('.mastery-collection-row').length,title=modal.querySelector('h2').textContent;
        modal.querySelector('.mastery-close').click();
        return {chosen,rows,title,closed:modal.classList.contains('hidden')};
    })()`);
    assert.equal(masteryUI.chosen,'defense');assert.equal(masteryUI.rows,1);
    assert.equal(masteryUI.title,'Bộ sưu tập tinh thông');assert.ok(masteryUI.closed);
    if(process.argv.includes('--screenshots')) {
        await evaluate('MasterySystem.openCollection(roguelikeUI)');
        await screenshot('mastery-collection');
        await evaluate("document.getElementById('masteryCollectionModal').classList.add('hidden')");
    }
    await evaluate('roguelikeUI.resetRun(); roguelikeUI.closeMainMenu();');

    for (const stage of [1, 5, 10]) {
        const preview = await evaluate(`(() => {
            const ui=roguelikeUI; ui.stage=${stage}; ui.setupNewStage();
            const combat=new HexBridge(ui).createCombat();
            const boardMatches = [...combat.units.values()].every(unit => {
                const piece=ui.game.board[unit.square];
                const stats=HexPokemonInfo.getBattleStats(piece,unit.square,ui);
                const activeType=TypeSystem.getHexAttackingType(piece,unit.square).toUpperCase();
                return stats.maxHp===unit.maxHp && stats.damage===unit.attackDamage &&
                    ui.getSquareEl(unit.square).querySelector('.hud-type-badge').alt===activeType &&
                    ui.getSquareEl(unit.square).querySelector('.hud-hp-num').textContent===unit.maxHp+'/'+unit.maxHp;
            });
            const benchMatches = ui.inventory.every(item => {
                const square=ui.placedPieces.find(piece=>piece.invId===item.id)?.sq;
                const stats=ui.getHexPieceStats(ui.game.board[square]??{...item,color:'w'},square);
                const card=document.querySelector('[data-inv-id="'+item.id+'"]');
                return card.querySelector('.stat-heart span').textContent===String(stats.maxHp)&&
                    card.querySelector('.stat-atk span').textContent===String(stats.damage);
            });
            const recruitMatches = ui.cardChoices.every(type => {
                const card=[...document.querySelectorAll('#rewardCardsGrid .reward-card')].find(card=>card.querySelector('img').alt===PIECES[type].name);
                const stats=ui.getHexPieceStats({type,color:'w',talismans:[]});
                return card && card.querySelector('.stat-heart span').textContent===String(stats.maxHp)&&
                    card.querySelector('.stat-atk span').textContent===String(stats.damage);
            });
            return {boardMatches,benchMatches,recruitMatches};
        })()`);
        assert.ok(Object.values(preview).every(Boolean), `Stage ${stage} HUD/prediction mismatch: ${JSON.stringify(preview)}`);
    }

    if (process.argv.includes('--roguelike-only')) {
        const reward = await evaluate(`(() => {
            const ui=roguelikeUI;ui.resetRun();ui.closeMainMenu();ui.currentSaveSlot=1;
            ui.inventory[0].traits=['swift','vampiric'];ui.inventory[0].wounds=.2;
            ui.inventory[0].battlesFought=PIECES[ui.inventory[0].type].battlesToEvolve-1;
            ui.setupNewStage();ui.startBattle();ui.hexCombat.stop();
            const combat=ui.hexCombat,hero=[...combat.units.values()].find(u=>u.sourcePiece?.invId===ui.inventory[0].id);
            for(const enemy of [...combat.units.values()].filter(u=>u.color==='b'))
                combat.dealDamage(hero,enemy,enemy.hp,'controlled-test',{damageType:'true'});
            combat.checkBattleEnd();
            const offers=JSON.stringify(ui.runState.pendingReward.choices),gold=ui.gold;
            ui.handleStageVictory();
            const once=ui.gold===gold,blocked=ui.advanceRoguelikeStage()===false&&ui.stage===1;
            const saved=SaveSystem.getSlot(1);ui.applySaveData(saved);
            const persisted=JSON.stringify(ui.runState.pendingReward.choices)===offers;
            const visible=!document.getElementById('roguelikeModal').classList.contains('hidden');
            const summary=document.querySelector('#victoryModal .hex-combat-summary');
            return {once,blocked,persisted,visible,cards:document.querySelectorAll('.roguelike-card').length,
                summary:!!summary&&summary.textContent.includes(t('summary.dealt')),traits:ui.inventory[0].traits,wounds:ui.inventory[0].wounds,
                expectedWounds:Math.min(.5,1-hero.hp/hero.maxHp)};
        })()`);
        assert.ok(reward.once&&reward.blocked&&reward.persisted&&reward.visible&&reward.summary,JSON.stringify(reward));
        assert.equal(reward.cards,3);assert.deepEqual(reward.traits,['swift','vampiric']);assert.equal(reward.wounds,reward.expectedWounds);
        await screenshot('roguelike-reward');
        const next = await evaluate(`(async () => {
            const ui=roguelikeUI,id=ui.runState.pendingReward.choices[0].id;
            const evolution=ui.pendingEvolutions[0],queued=!!evolution&&ui.inventory.find(i=>i.id===evolution.invId)?.type===evolution.oldType;
            const claimed=ui.claimRoguelikeReward(id),duplicate=ui.claimRoguelikeReward(id);
            const saved=SaveSystem.getSlot(1);ui.applySaveData(saved);
            const victoryVisible=!document.getElementById('victoryModal').classList.contains('hidden');
            ui.advanceRoguelikeStage();
            if(ui.runState.pendingEvent)ui.claimRoguelikeEvent(ui.runState.pendingEvent.choices.find(c=>c.kind==='leave').id);
            const advanced=ui.stage===2&&ui.phase==='setup'&&!ui.runState.pendingReward&&!ui.runState.pendingEvent;
            const duringEvolution=SaveSystem.getSlot(1).pendingEvolutions.some(e=>e.invId===evolution.invId);
            for(let i=0;i<80&&ui.isSetupAnimating;i++)await new Promise(resolve=>setTimeout(resolve,50));
            const evolved=ui.inventory.find(i=>i.id===evolution.invId)?.type===evolution.nextType&&
                ui.pendingEvolutions.length===0&&SaveSystem.getSlot(1).pendingEvolutions.length===0;
            ui.gold=0;ui.runState.freeRerolls=1;ui.rerollCards();
            const freeReroll=ui.gold===0&&ui.runState.freeRerolls===0&&SaveSystem.getSlot(1).runState.freeRerolls===0;
            // Force each real event kind with deterministic seeds; exercise its actual buttons.
            const seen=new Set();let eventUi=true;
            for(let seed=1;seed<500&&seen.size<6;seed++){
                ui.stage=1;ui.runState.eventStages=[];ui.runState.seed=seed;
                const event=RoguelikeExpansion.event(ui,2);
                if(!event||seen.has(event.kind))continue;
                seen.add(event.kind);ui.gold=0;ui.runState.pendingEvent=event;ui.showRoguelikeChoices();
                eventUi&&=[...document.querySelectorAll('.roguelike-card')].every((button,i)=>button.disabled===((event.choices[i].cost??0)>0));
                document.querySelector('[data-choice-id="'+event.choices.find(c=>c.kind==='leave').id+'"]').click();
                eventUi&&=!ui.runState.pendingEvent;
            }
            const old={version:'2.8.0',stage:5,gold:10,inventory:[{id:1,type:'7',talismans:[],battlesFought:0}],
                placedPieces:[],setupFormation:[],invNextId:2};
            ui.applySaveData(old);const compatible=ui.stage===5&&!ui.runState.pendingReward&&ui.runState.upgrades.hp===0;
            ui.startBattle();ui.hexCombat.stop();const boss=[...ui.hexCombat.units.values()].find(u=>u.isBoss);
            const legacyBattle=!!boss&&boss.bossType==='miniBoss';ui.disposeHexBattle();
            ui.resetRun();ui.inventory=Array.from({length:12},(_,i)=>({id:i+1,type:['1','4','7'][i%3],talismans:[],battlesFought:0}));
            ui.maxSlots=12;ui.setupFormation=[];ui.setupNewStage();ui.recallAllPieces();
            for(const item of ui.inventory)ui.deployBenchPiece(item);
            const fullSquad=ui.placedPieces.length===12&&ui.placedPieces.every(p=>p.sq>=28&&p.sq<56)&&
                [...new HexBridge(ui).createCombat().units.values()].filter(u=>u.color==='w').length===12;
            return {claimed,duplicate,victoryVisible,advanced,queued,duringEvolution,evolved,freeReroll,eventUi,events:seen.size,compatible,legacyBattle,fullSquad,
                cleanup:document.querySelectorAll('.hex-combat-unit,.elemental-projectile,.hex-floating-text').length===0};
        })()`);
        assert.ok(next.claimed&&next.victoryVisible&&next.advanced&&next.queued&&next.duringEvolution&&next.evolved&&next.freeReroll&&next.eventUi&&next.compatible&&next.legacyBattle&&next.fullSquad&&next.cleanup,JSON.stringify(next));
        assert.equal(next.duplicate,false);assert.equal(next.events,6);
        assert.deepEqual(runtimeErrors,[],'Roguelike runtime errors');
        console.log('Roguelike browser checks passed: real battle-end events, mandatory 1-of-3 reward, single claim, save/load before and after claim, all six event UIs, next stage, traits/wounds, old save and VFX cleanup. Controlled enemy elimination is used to exercise victory UI.');
        return;
    }

    if (process.argv.includes('--stats-only') || process.argv.includes('--elements-only')) {
        // Phase 1 checks actual game data without claiming layout/VFX pass.
        for (const stage of [1, 5, 10]) {
            const actualStart = await evaluate(`(() => {
                const ui=roguelikeUI; ui.stage=${stage}; ui.setupNewStage();
                const deployed=ui.placedPieces.map(p=>ui.game.board[p.sq]);
                deployed[0].talismans=['toxic_orb','muscle_band'];
                if (deployed[1]) deployed[1].talismans=['soothe_bell'];
                const before=new HexBridge(ui).createCombat();
                ui.startBattle(); ui.hexCombat.stop();
                return [...before.units.values()].every(preview=>{
                    const unit=ui.hexCombat.units.get(preview.id);
                    return unit && ['maxHp','attackDamage','attackSpeed','pokemonSpeed','mana','isBoss']
                        .every(key=>unit[key]===preview[key]);
                });
            })()`);
            assert.ok(actualStart, `Stage ${stage} actual startBattle differs from preview with Talismans`);
        }
        assert.deepEqual(runtimeErrors, [], 'Browser runtime errors');
        console.log('Stats-only browser checks passed: actual stage 1/5/10 SETUP, startBattle with Talismans, combat units, board HUD, Bench and Recruit. Layout and VFX not checked.');
        if (process.argv.includes('--elements-only')) {
            const elements = await evaluate(`(() => {
                const ui=roguelikeUI;ui.stage=1;ui.setupNewStage();ui.disposeHexBattle();ui.phase='battle';
                const combat=new HexCombat(new HexBoard()),bridge=new HexBridge(ui);
                for(const [square,id,type,color] of [[7,'a','1','w'],[1,'b','7','b']]) {
                    const piece={type,color,talismans:[]};
                    combat.addUnit(square,{...bridge.getUnitStats(piece,square),id});
                }
                ui.hexCombat=combat;
                const renderer=new HexRenderer(combat);ui.hexRenderer=renderer;renderer.renderInitialUnits();
                const a=combat.units.get('a'),b=combat.units.get('b');
                renderer.selectUnit('a');
                const firstInfo=HexPreparationInfo.panel.textContent;
                combat.attack(a,1);
                combat.hex.moveUnit(7,0);a.square=0;renderer.moveSprite('a',0);HexPreparationInfo.refresh();
                const movedInfo=HexPreparationInfo.panel.textContent;
                combat.attack(a,1);a.mana=100;combat.castSkill(a);
                const events=combat.events.filter(e=>e.type==='damage');
                const parent=renderer.sprites.get('b').element;
                renderer.showDamage({defenderId:'b',damage:0,absorbed:0,effectiveness:0,tick:31,element:'electric'});
                for(let i=0;i<30;i++) renderer.showDamage({defenderId:'b',damage:0,absorbed:0,effectiveness:0,tick:31,element:'electric'});
                const labels=parent.querySelectorAll('.hex-float-effectiveness');
                const result={elements:events.map(e=>e.element),multipliers:events.map(e=>e.effectiveness),
                    firstInfo:firstInfo.includes(t('pokemon.attack')+': '+t('type.grass')),movedInfo:movedInfo.includes(t('pokemon.attack')+': '+t('type.poison')),
                    labels:labels.length,immune:labels[0]?.textContent};
                renderer.destroy();
                result.feedbackClean=renderer.effectivenessFeedbackTicks.size===0;
                ui.hexRenderer=null;combat.stop();
                return result;
            })()`);
            assert.deepEqual(elements.elements,['grass','poison','poison']);
            assert.deepEqual(elements.multipliers,[2,1,1]);
            assert.ok(elements.firstInfo && elements.movedInfo && elements.feedbackClean);
            assert.equal(elements.labels,1);
            assert.equal(elements.immune,await evaluate("t('combat.immune')"));
            assert.deepEqual(runtimeErrors,[], 'Elemental browser runtime errors');
            console.log('Elemental browser checks passed: live moving unit, attack/skill events, active type HUD/inspector, limited feedback and renderer cleanup. Layout and full animation timing not checked.');
        }
        return;
    }

    const layout = await evaluate(`(() => {
        const ui=roguelikeUI; const square=ui.placedPieces[0].sq;
        HexPreparationInfo.showInfo(ui.game.board[square],square);
        const panel=HexPreparationInfo.panel, view=document.querySelector('.board-view');
        const info=panel.getBoundingClientRect(), board=document.querySelector('.board-wrapper').getBoundingClientRect();
        const arena=document.querySelector('.arena-center').getBoundingClientRect();
        const recruit=document.querySelector('.right-panel').getBoundingClientRect();
        return {beside:recruit.left>=board.right, contained:info.left>=0 && info.right<=innerWidth,
            boardClear:info.top<board.bottom, scrollable:view.scrollHeight<=view.clientHeight,
            position:getComputedStyle(panel).position};
    })()`);
    assert.ok(layout.beside && layout.contained && layout.boardClear && layout.scrollable, JSON.stringify(layout));
    assert.equal(layout.position, 'absolute');
    await evaluate('document.querySelector(".board-view").scrollTop=0;');
    await screenshot('hex-setup');

    const selected = await evaluate(`(() => {
        const ui=roguelikeUI; ui.startBattle(); ui.hexCombat.stop();
        document.querySelector('.board-view').scrollTop=0;
        const unit=[...ui.hexCombat.units.values()].find(unit=>unit.color==='w');
        const destination=ui.hexCombat.hex.getNeighbors(unit.square).find(square=>!ui.hexCombat.getUnitAt(square));
        ui.hexCombat.hex.moveUnit(unit.square,destination); unit.square=destination;
        ui.hexRenderer.moveSprite(unit.id,destination);
        return {id:unit.id,square:destination};
    })()`);
    await sleep(120); // Click while the sprite is still in its movement transition.
    const point = await evaluate(`(() => {
        const element=document.querySelector('[data-unit-id="${selected.id}"]');
        // Freeze only this visual transition so CDP latency cannot stale the hit coordinates.
        for(const animation of element.getAnimations())animation.pause();
        const rect=element.getBoundingClientRect();
        return {x:rect.left+rect.width/2,y:rect.top+rect.height/3};
    })()`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    assert.equal(await evaluate('roguelikeUI.hexRenderer.selectedUnitId'), selected.id);
    assert.equal(await evaluate('HexPreparationInfo.selectedUnitId'), selected.id);
    assert.equal(await evaluate('HexPreparationInfo.selectedSquare'), selected.square);
    await evaluate(`document.querySelector('[data-unit-id="${selected.id}"]').getAnimations().forEach(animation=>animation.play());`);

    const live = await evaluate(`(() => {
        const ui=roguelikeUI, unit=ui.hexCombat.units.get('${selected.id}');
        const detail=HexPreparationInfo.panel.querySelector('details'); detail.open=true;
        unit.hp-=20; unit.mana=60; unit.shield=15;
        const next=ui.hexCombat.hex.getNeighbors(unit.square).find(square=>!ui.hexCombat.getUnitAt(square));
        ui.hexCombat.hex.moveUnit(unit.square,next);unit.square=next;ui.hexRenderer.moveSprite(unit.id,next);
        HexPreparationInfo.refresh();
        const other=[...ui.hexCombat.units.values()].find(candidate=>candidate.id!==unit.id);
        document.querySelector('[data-unit-id="'+other.id+'"]').dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));
        const boss=[...ui.hexCombat.units.values()].find(candidate=>candidate.isBoss);
        boss.hp=boss.maxHp*0.2;ui.hexCombat.updateBossPhase(boss);
        return {id:HexPreparationInfo.selectedUnitId,square:HexPreparationInfo.selectedSquare,next,
            expanded:HexPreparationInfo.panel.querySelector('details').open,
            text:HexPreparationInfo.panel.textContent,
            bossPhase:ui.hexRenderer.sprites.get(boss.id).element.dataset.bossPhase};
    })()`);
    assert.equal(live.id, selected.id);
    assert.equal(live.square, live.next);
    assert.ok(live.expanded);
    assert.match(live.text, /60\/100/);
    assert.ok(live.text.includes(await evaluate("t('combat.shield')+' 15'")));
    assert.equal(live.bossPhase, '3');
    await screenshot('hex-battle');

    await evaluate('roguelikeUI.hexCombat.start(); roguelikeUI.openInGameMenu();');
    await sleep(100);
    const pausedTick = await evaluate('roguelikeUI.hexCombat.tickCount');
    await sleep(150);
    assert.equal(await evaluate('roguelikeUI.hexCombat.tickCount'), pausedTick);
    assert.equal(await evaluate('roguelikeUI.hexCombat.running'), false);
    await evaluate('roguelikeUI.closeInGameMenu();');
    await sleep(100);
    assert.ok(await evaluate(`roguelikeUI.hexCombat.tickCount>${pausedTick}`));

    const cleanup = await evaluate(`(() => {
        const ui=roguelikeUI;const previous=ui.hexCombat;
        ui.resetRun();ui.startBattle();ui.hexCombat.stop();
        const oneTooltip=document.querySelectorAll('.hex-unit-tooltip').length===1;
        const saved={stage:10,inventory:ui.inventory,setupFormation:ui.setupFormation,placedPieces:ui.placedPieces};
        const beforeLoad=ui.hexCombat;ui.applySaveData(saved);
        const clean=!previous.running&&!beforeLoad.running&&ui.hexCombat===null&&ui.hexRenderer===null&&
            !document.body.classList.contains('hex-combat-active')&&document.querySelectorAll('.hex-unit-tooltip').length===0;
        const hasBoss=ui.game.board.slice(0,56).some(piece=>piece?.isBoss);
        ui.retryBattle();
        return {oneTooltip,clean,hasBoss,validRetry:ui.placedPieces.every(piece=>piece.sq>=28&&piece.sq<56)};
    })()`);
    assert.ok(cleanup.oneTooltip && cleanup.clean && cleanup.hasBoss && cleanup.validRetry);

    const actions = await evaluate(`(async () => {
        const ui=roguelikeUI;ui.resetRun();ui.closeMainMenu();ui.gold=100;ui.updateStats();ui.renderShop();
        const inventoryNode=document.getElementById('inventorySlots'),initial=ui.inventory.length;
        const price=ui.getPiecePrice(ui.cardChoices[0]);
        document.querySelector('#rewardCardsGrid .btn-pick-card').click();
        const recruited=ui.inventory.length===initial+1 && ui.gold===100-price;
        document.getElementById('btnRecallAll').click();
        await new Promise(resolve=>setTimeout(resolve,700));
        const recalled=ui.placedPieces.length===0;
        const item=ui.inventory[0];document.querySelector('[data-inv-id="'+item.id+'"]').click();
        ui.getSquareEl(55).click();await new Promise(resolve=>setTimeout(resolve,700));
        const deployed=ui.placedPieces.some(p=>p.invId===item.id && p.sq===55);
        const transfer=new DataTransfer();transfer.setData('text/plain','55');
        ui.getSquareEl(54).dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:transfer}));
        await new Promise(resolve=>setTimeout(resolve,700));
        const dragged=ui.placedPieces.some(p=>p.invId===item.id && p.sq===54);
        document.getElementById('btnAutoFormation').click();
        await new Promise(resolve=>setTimeout(resolve,700));
        const arranged=ui.placedPieces.every(p=>p.sq>=28 && p.sq<56);
        ui.talismanChoices=[{talismanId:'muscle_band'}];ui.setTalismanTab('shop');
        document.querySelector('.btn-buy-talisman').click();
        const bought=ui.talismanInventory.some(t=>t.talismanId==='muscle_band');
        ui.setTalismanTab('bag');document.querySelector('.btn-use-talisman').click();
        document.querySelector('[data-inv-id="'+item.id+'"]').click();
        const equipped=item.talismans.includes('muscle_band');
        ui.buyTalisman('muscle_band',6);ui.setTalismanTab('bag');
        const beforeItemSell=ui.talismanInventory.length;document.getElementById('btnSellTalisman').click();
        const itemSold=ui.talismanInventory.length===beforeItemSell-1;
        const chosen=ui.placedPieces.find(p=>p.invId===item.id);ui.selectedBoardSq=chosen.sq;
        ui.updateSellButton();const beforeSell=ui.inventory.length;document.getElementById('btnSell').click();
        const sold=ui.inventory.length===beforeSell-1;
        // Old unversioned data must still load, then current-format data must round-trip.
        ui.applySaveData({stage:2,inventory:ui.inventory,placedPieces:ui.placedPieces,setupFormation:ui.setupFormation});
        ui.currentSaveSlot=1;SaveSystem.saveToSlot(1,ui);const saved=SaveSystem.getSlot(1);ui.applySaveData(saved);
        return {recruited,recalled,deployed,dragged,arranged,bought,equipped,sold,itemSold,saved:ui.stage===2,
            sameNode:inventoryNode===document.getElementById('inventorySlots')};
    })()`);
    assert.ok(Object.values(actions).every(Boolean), JSON.stringify(actions));

    const health = await evaluate(`(() => {
        const ui=roguelikeUI;ui.startBattle();ui.hexCombat.stop();
        const unit=[...ui.hexCombat.units.values()][0], fill=ui.hexRenderer.sprites.get(unit.id).hpFill;
        const result=[];for(const ratio of [0,.05,.5,1]) {
            unit.hp=unit.maxHp*ratio;ui.hexRenderer.updateHP();result.push(fill.style.clipPath);
        }
        unit.hp=NaN;ui.hexRenderer.updateHP();result.push(fill.style.clipPath);
        unit.maxHp=0;ui.hexRenderer.updateHP();result.push(fill.style.clipPath);
        ui.hexRenderer.selectUnit(unit.id);const before=ui.hexRenderer.selectedUnitId;
        document.querySelector('.hex-inspector-close').click();ui.hexRenderer.updateHP();
        return {clips:result,width:fill.style.width,selectionPreserved:before===ui.hexRenderer.selectedUnitId,
            closed:!HexPreparationInfo.panel.classList.contains('visible')};
    })()`);
    assert.deepEqual(health.clips,['inset(0px 100% 0px 0px)','inset(0px 95% 0px 0px)','inset(0px 50% 0px 0px)','inset(0px 0% 0px 0px)','inset(0px 100% 0px 0px)','inset(0px 100% 0px 0px)']);
    assert.equal(health.width,'');
    assert.ok(health.selectionPreserved && health.closed);
    await evaluate('roguelikeUI.resetRun();roguelikeUI.closeMainMenu();');
    const settingsCheck=await evaluate(`(() => {
        const ui=roguelikeUI,before=JSON.stringify(ui.inventory);ui.stage=5;
        const settings=document.getElementById('settingsModal');document.getElementById('btnSettings').click();
        document.getElementById('languageSelect').value='en-US';document.getElementById('languageSelect').dispatchEvent(new Event('change'));
        const translated=document.getElementById('btnStartBattle').textContent===t('combat.battle');
        document.getElementById('btnNewRun').click();
        const unchanged=ui.stage===5 && JSON.stringify(ui.inventory)===before;
        const confirmed=!document.getElementById('confirmModal').classList.contains('hidden');
        document.getElementById('btnCancelConfirm').click();settings.classList.add('hidden');I18n.setLanguage('vi-VN');
        return {translated,unchanged,confirmed};
    })()`);
    assert.ok(Object.values(settingsCheck).every(Boolean));
    const structure=await evaluate(`(() => {
        const ui=roguelikeUI,market=document.getElementById('marketView'),bar=market.querySelector('.pokemon-tabs');
        const roll=document.getElementById('btnReroll'),before=JSON.stringify(ui.cardChoices),gold=ui.gold;
        market.querySelector('.recruit-lock').click();roll.click();
        const guarded=JSON.stringify(ui.cardChoices)===before&&ui.gold===gold;market.querySelector('.recruit-lock').click();
        const gear=document.getElementById('btnSettings');gear.click();
        const modal=!document.getElementById('settingsModal').classList.contains('hidden')&&document.querySelectorAll('.settings-section').length===5;
        document.querySelector('.settings-heading button').click();NotificationCenter.dismiss();
        return {guarded,modal,battleInShop:bar.contains(document.getElementById('btnStartBattle')),
          singleArrange:document.querySelectorAll('#btnAutoFormation').length===1,
          singleEffects:document.querySelectorAll('#hex-fx-toggle').length===1&&document.getElementById('phaseButtons').contains(document.getElementById('hex-fx-toggle')),
          oneBenchAction:[...document.querySelectorAll('.bench-card-actions')].every(row=>row.children.length===1),
          astralOutsideBag:!document.getElementById('talismanView').querySelector('.utility-actions')};
    })()`);
    assert.ok(Object.values(structure).every(Boolean),JSON.stringify(structure));
    if(process.argv.includes('--screenshots')) {
        await evaluate("document.getElementById('btnSettings').click();");await sleep(100);
        await screenshot('settings-modal');
        await evaluate("document.querySelector('.settings-heading button').click();");
    }
    if(process.argv.includes('--screenshots')) {
        await evaluate("roguelikeUI.stage=1;roguelikeUI.setupNewStage();roguelikeUI.gold=100;roguelikeUI.updateStats();roguelikeUI.renderShop();roguelikeUI.setTalismanTab('shop');HexPreparationInfo.hide();");
        await sleep(1000);
        await screenshot('visual-desktop-recruit-shop');
    }

    const overhaul = await evaluate(`(async () => {
        const ui=roguelikeUI;ui.resetRun();ui.closeMainMenu();NotificationCenter.dismiss();
        const map=document.querySelector('.board-wrapper').getBoundingClientRect(),bench=document.querySelector('.bench-dock').getBoundingClientRect(),recruit=document.getElementById('marketView').getBoundingClientRect();
        const layout=bench.left>=map.right&&recruit.top>=map.bottom&&getComputedStyle(document.getElementById('inventorySlots')).flexDirection==='column';
        const item=ui.inventory[0],instance=item.instanceId;
        document.querySelector('[data-inv-id="'+item.id+'"]').click();
        const info=HexPreparationInfo.panel;info.querySelector('[data-info-tab=skills]').click();
        const tabs=info.querySelectorAll('[data-info-tab]').length===4&&info.querySelector('[data-info-section=skills]').hidden===false;
        info.querySelector('[data-info-tab=equipment]').click();const equipmentVisible=!info.querySelector('[data-info-section=equipment]').hidden;
        info.querySelector('.hex-inspector-close').click();
        ui.gold=0;const before=ui.inventory.length;ui.pickRewardPiece(ui.cardChoices[0],ui.getPiecePrice(ui.cardChoices[0]));
        const noGold=ui.inventory.length===before&&document.getElementById('toastMessage').textContent.includes('vàng');
        ui.gold=100;ui.maxSlots=ui.placedPieces.length;const fullBefore=ui.inventory.length;
        ui.pickRewardPiece(ui.cardChoices[0],ui.getPiecePrice(ui.cardChoices[0]));const fullRecruit=ui.inventory.length===fullBefore+1;
        const fullItem=ui.inventory.at(-1);ui.deployBenchPiece(fullItem);const fullDeploy=ui.placedPieces.length===ui.maxSlots;
        // Full equipment does not consume a charge or trigger deployment/recall.
        item.talismans=['leftovers','choice_band','focus_sash'];ui.talismanInventory=[{id:500,talismanId:'muscle_band',usesLeft:1,maxUses:1}];
        ui.startApplyTalisman(ui.talismanInventory[0]);const positions=JSON.stringify(ui.placedPieces);
        ui.applyTalismanToPiece(item);const fullTalisman=item.talismans.length===3&&ui.talismanInventory[0].usesLeft===1&&JSON.stringify(ui.placedPieces)===positions;
        const hint=!document.getElementById('talismanApplyBanner').classList.contains('hidden')&&document.getElementById('talismanApplyBanner').closest('.board-view')!==null;
        document.getElementById('btnCancelApplyTalisman').click();const cancelled=!ui.activeApplyingTalisman;
        NotificationCenter.recent.clear();const count=NotificationCenter.entries.length;
        for(let n=0;n<20;n++)ui.showToast('Không đủ vàng để thực hiện thao tác.','warning');
        const dedupe=NotificationCenter.entries.length===count+1;
        const toast=document.getElementById('gameToast').getBoundingClientRect(),battle=document.getElementById('btnStartBattle').getBoundingClientRect();
        const toastClear=toast.left>=0&&toast.right<=innerWidth&&toast.bottom<=document.querySelector('.board-view').getBoundingClientRect().top&&toast.bottom<=battle.top;
        document.querySelector('.toast-close').click();const dismissed=document.getElementById('gameToast').classList.contains('hidden');
        for(let n=0;n<300;n++)NotificationCenter.record('Kiểm tra giới hạn '+n,'system',false);
        NotificationCenter.open();
        const bounded=NotificationCenter.entries.length===200&&document.querySelectorAll('#moveList .move-entry').length===200;
        NotificationCenter.close();
        const files=[...CombatVfx.images.values()];await Promise.all(files.map(image=>image.decode()));
        const sheets=CombatVfx.assets.size===92&&[...CombatVfx.assets].every(([id,a])=>{const image=CombatVfx.images.get(id);return image.naturalWidth===a.frameSize[0]*a.frameCount&&image.naturalHeight===a.frameSize[1];});
        ui.startBattle();ui.hexCombat.stop();const player=[...ui.hexCombat.units.values()].find(unit=>unit.color==='w');
        const target=[...ui.hexCombat.units.values()].find(unit=>unit.color==='b');
        const vfx=ui.hexRenderer.sheetVfx;vfx.play('cast_fire_01',player.id,{duration:1});
        const effect=[...vfx.effects][0],first=effect.el.style.backgroundPosition;
        ui.hexCombat.tickCount+=3;vfx.update();const playback=effect.el.style.backgroundPosition!==first;
        const paused=effect.el.style.backgroundPosition;vfx.update();const pausedVfx=effect.el.style.backgroundPosition===paused;
        document.body.classList.add('reduced-motion');const reduced=!vfx.play('cast_water_01',player.id);document.body.classList.remove('reduced-motion');
        const manager=soundManager;manager.sfxVoices=[];manager.sfxLast=new Map();manager.isMuted=true;manager.playSfx('magic');const mute=manager.sfxVoices.length===0;
        manager.isMuted=false;manager.volume=0;manager.playSfx('magic');const zeroVolume=manager.sfxVoices.length===0;
        manager.volume=.2;for(const id of ['magic','slash','arrow','reflect','hit','kill','coin','promote','revive','socket'])manager.playSfx(id);
        const audioBounded=manager.sfxVoices.length<=8;const voices=manager.sfxVoices.length;manager.playSfx('magic');const audioDedupe=manager.sfxVoices.length===voices;
        ui.hexRenderer.destroy();const cleaned=vfx.effects.size===0&&document.querySelectorAll('.hex-sheet-vfx').length===0;
        ui.resetRun();ui.closeMainMenu();
        const profiles=[];
        MetaProgression.data.allocatedNodes=[...new Set([...MetaProgression.getAllocatedNodes(),'steel_origin','steel_node_1'])];MetaProgression.save();
        const astralBefore=JSON.stringify(MetaProgression.data);
        for(let slot=1;slot<=3;slot++){
            MasterySystem.ensure(ui);
            ui.currentSaveSlot=slot;ui.stage=49+slot;ui.gold=100+slot;
            ui.inventory[0].talismans=['muscle_band'];ui.inventory[0].individualMastery.xp=450;
            ui.runState.upgrades.hp=2;ui.setupNewStage();MasterySystem.ensure(ui);
            const identity=ui.inventory[0].instanceId;SaveSystem.saveToSlot(slot,ui);
            const saved=SaveSystem.getSlot(slot);ui.applySaveData(saved);
            const one=JSON.stringify({inventory:ui.inventory,placed:ui.placedPieces,run:ui.runState});ui.applySaveData(saved);
            profiles.push(ui.stage===49+slot&&ui.gold===100+slot&&ui.inventory[0].instanceId===identity&&ui.inventory[0].individualMastery.xp===450&&ui.inventory[0].talismans.includes('muscle_band')&&one===JSON.stringify({inventory:ui.inventory,placed:ui.placedPieces,run:ui.runState})&&JSON.stringify(MetaProgression.data)===astralBefore);
        }
        const savedBefore=localStorage.getItem(SaveSystem.PREFIX+'1');SaveSystem.backup();localStorage.setItem(SaveSystem.PREFIX+'1','{}');
        const rollback=SaveSystem.restoreBackup()&&localStorage.getItem(SaveSystem.PREFIX+'1')===savedBefore;
        const again=SaveSystem.restoreBackup()&&localStorage.getItem(SaveSystem.PREFIX+'1')===savedBefore;
        const imported=await new Promise(resolve=>SaveSystem.importFromFile(new File([JSON.stringify({slots:[{slot:1,data:SaveSystem.getSlot(2)}]})],'save.json'),ok=>resolve(ok)));
        const importBackup=imported&&JSON.parse(localStorage.getItem(SaveSystem.BACKUP_KEY)).values[SaveSystem.PREFIX+'1']===savedBefore;
        SaveSystem.restoreBackup();
        ui.resetRun();ui.closeMainMenu();NotificationCenter.dismiss();
        return {layout,tabs,equipmentVisible,noGold,fullRecruit,fullDeploy,fullTalisman,hint,cancelled,dedupe,toastClear,dismissed,bounded,sheets,playback,pausedVfx,reduced,mute,zeroVolume,audioBounded,audioDedupe,cleaned,profiles:profiles.every(Boolean),rollback,again,importBackup};
    })()`);
    assert.ok(Object.values(overhaul).every(Boolean),JSON.stringify(overhaul));
    console.log('Overhaul checks passed:',Object.keys(overhaul).join(', '));
    const oldOrigin=await evaluate('performance.timeOrigin');
    await command('Page.reload');
    for(let n=0;n<150;n++){if(await evaluate('performance.timeOrigin!=='+oldOrigin+' && !!window.roguelikeUI && !!window.HexPreparationInfo?.initialized'))break;await sleep(100);}
    const reloadedProfiles=await evaluate(`(() => {
        const ui=roguelikeUI;
        const result=[1,2,3].map(slot=>{const data=SaveSystem.getSlot(slot);ui.loadGameSlot(slot);
            return ui.stage===49+slot&&ui.inventory[0].instanceId===data.inventory[0].instanceId&&ui.inventory[0].individualMastery.xp===450&&ui.inventory[0].talismans.includes('muscle_band')&&MetaProgression.hasNode('steel_node_1');
        });ui.resetRun();ui.closeMainMenu();NotificationCenter.dismiss();return result;
    })()`);
    assert.ok(reloadedProfiles.every(Boolean),'All three high-stage profiles must survive a real page reload');
    await evaluate("roguelikeUI.renderInventory();document.querySelector('.bench-card').focus();");
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    assert.ok(await evaluate("HexPreparationInfo.panel.classList.contains('visible')"),'Keyboard activation opens Pokémon Info: '+await evaluate("JSON.stringify({focus:document.activeElement.outerHTML.slice(0,300),phase:roguelikeUI.phase,drawer:document.getElementById('app').dataset.drawer})"));
    await evaluate("HexPreparationInfo.hide();roguelikeUI.showConfirm('Kiểm tra focus',()=>{});");
    await sleep(50);
    await evaluate("document.getElementById('btnAcceptConfirm').focus()");
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.equal(await evaluate('document.activeElement.id'),'btnCancelConfirm','Confirmation keeps keyboard focus inside');
    await evaluate("document.getElementById('btnCancelConfirm').click();HexPreparationInfo.hide();");
    await evaluate(`(() => {const ui=roguelikeUI;ui.startBattle();ui.hexCombat.stop();const unit=[...ui.hexCombat.units.values()].find(unit=>unit.color==='w');ui.hexRenderer.sheetVfx.play('cast_fire_01',unit.id,{duration:2});ui.hexCombat.tickCount+=6;ui.hexRenderer.sheetVfx.update();})()`);
    await screenshot('overhaul-skill-playback');
    await evaluate('roguelikeUI.resetRun();roguelikeUI.closeMainMenu();NotificationCenter.dismiss();');

    const biomeEvidence=[];
    for(const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:1280,height:720},{width:1150,height:768},{width:768,height:432},{width:812,height:375}]){
        await command('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1,mobile:false});await sleep(120);
        const mapControls=await evaluate(`[...document.querySelectorAll('.biome-controls select')].map(select=>{const r=select.getBoundingClientRect(),bar=document.getElementById('boardTopControls').getBoundingClientRect();return {left:r.left,right:r.right,barRight:bar.right,visible:r.width>0&&r.left>=bar.left&&r.right<=bar.right+1};})`);
        assert.equal(mapControls.length,2);assert.ok(mapControls.every(c=>c.visible),'Biome selectors must fit toolbar at '+viewport.width+': '+JSON.stringify(mapControls));
        await evaluate(`BattlefieldBiomes.selectMap('forest');BattlefieldBiomes.apply('forest')`);await sleep(150);
        const baseline=await evaluate(`(()=>{window.biomeFormation=JSON.stringify(roguelikeUI.placedPieces);window.biomeEngine=roguelikeUI.hexCombat;return [...document.querySelectorAll('.board .square')].map(c=>{const r=c.getBoundingClientRect();return [r.x,r.y,r.width,r.height];});})()`);
        await screenshot('biome-forest-'+viewport.width);
        for(const id of ['volcano','ice_cavern','swamp']){
            await evaluate(`BattlefieldBiomes.selectMap('${id}');BattlefieldBiomes.load(BattlefieldBiomes.maps['${id}'].background)`);await sleep(80);
            const check=await evaluate(`(()=>{const cells=[...document.querySelectorAll('.board .square')];return {map:BattlefieldBiomes.current,rects:cells.map(c=>{const r=c.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}),formation:window.biomeFormation===JSON.stringify(roguelikeUI.placedPieces),engine:window.biomeEngine===roguelikeUI.hexCombat,hit:cells.every(c=>{const r=c.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e?.closest('.square')===c;})};})()`);
            assert.equal(check.map,id);assert.deepEqual(check.rects,baseline);assert.ok(check.formation&&check.engine&&check.hit,JSON.stringify(check));
            await evaluate('BattlefieldBiomes.preview(true)');assert.equal(await evaluate('document.querySelectorAll(".hex-element-surface").length'),3);
            assert.ok(await evaluate(`Promise.all(Object.values(BattlefieldBiomes.elements).map(path=>BattlefieldBiomes.load(path))).then(values=>values.every(Boolean))`));
            await screenshot('biome-'+id+'-'+viewport.width);await evaluate('BattlefieldBiomes.preview(false)');
            biomeEvidence.push({viewport,map:id,geometry:true,formation:true,engine:true,hit:true,textures:true});
        }
    }
    const fallbackCheck=await evaluate(`(async()=>{const b=BattlefieldBiomes,path=b.maps.swamp.background,cached=b.cache.get(path);const failed=await b.load('data:image/png;base64,bm90YW5pbWFnZQ==');b.cache.set(path,Promise.resolve(failed));b.requested=null;await b.apply('swamp');const result=!failed&&b.current==='forest'&&document.querySelector('.board-wrapper').dataset.biome==='forest';b.cache.set(path,cached);b.requested=null;return result;})()`);assert.ok(fallbackCheck);
    await evaluate(`BattlefieldBiomes.selectMap('forest');BattlefieldBiomes.apply('forest')`);
    await evaluate(`BattlefieldBiomes.preview(true);roguelikeUI.startBattle();roguelikeUI.hexCombat.stop();BattlefieldBiomes.refresh()`);
    assert.equal(await evaluate('document.querySelectorAll(".hex-element-surface").length'),0);
    assert.equal(await evaluate('BattlefieldBiomes.selectMap("swamp")'),false);
    await evaluate('roguelikeUI.resetRun();roguelikeUI.closeMainMenu();');
    fs.writeFileSync(path.join(root,'artifacts','biomes-evidence.json'),JSON.stringify(biomeEvidence,null,2));

    for (const viewport of [{width:768,height:1024}, { width: 768, height: 432 }, {width:812,height:375}, { width: 844, height: 390 }, {width:390,height:844}]) {
        await command('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: false });
        await sleep(100);
        const clear = await evaluate(`(() => {
            const ui=roguelikeUI,square=ui.placedPieces[0].sq;
            HexPreparationInfo.showInfo(ui.game.board[square],square); HexPreparationInfo.reveal();
            const panel=HexPreparationInfo.panel.getBoundingClientRect(),recruit=document.querySelector('.right-panel').getBoundingClientRect();
            const view=document.querySelector('.board-view');
            return {contained:panel.left>=0 && panel.right<=innerWidth,
                scrollHeight:view.scrollHeight,clientHeight:view.clientHeight,panel:panel.toJSON(),recruit:recruit.toJSON()};
        })()`);
        await screenshot(`visual-${viewport.width}`);
        assert.ok(clear.contained && clear.scrollHeight<=clear.clientHeight+1, JSON.stringify(clear));
        await evaluate("document.getElementById('app').dataset.drawer='';HexPreparationInfo.hide();");
        const hud=await evaluate(`(() => {
            const buttons=[...document.querySelectorAll('.game-header button')].filter(b=>b.getClientRects().length);
            const contained=buttons.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0;});
            const ui=roguelikeUI;ui.showToast('Thông báo dài '.repeat(50),'info');
            const toast=document.getElementById('gameToast').getBoundingClientRect(),map=document.querySelector('.board-wrapper').getBoundingClientRect();
            const safe=toast.left>=0&&toast.right<=innerWidth&&toast.bottom<=map.top&&map.height>60;
            NotificationCenter.dismiss();return {contained,safe};
        })()`);
        assert.ok(hud.contained&&hud.safe,JSON.stringify(hud));
        const hit=await evaluate(`(() => {
            const cell=roguelikeUI.getSquareEl(48),rect=cell.getBoundingClientRect();
            const point=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
            const battle=document.getElementById('btnStartBattle').getBoundingClientRect();
            const slot=document.querySelector('#inventorySlots .inv-slot'),source=slot.getBoundingClientRect();
            const delta=roguelikeUI.getAppRelativeDelta(slot,cell),scale=rect.width/36;
            return {square:point?.closest('.square')?.dataset.sq,battle: battle.bottom<=innerHeight && battle.top>=0,
                x:rect.width/36,y:rect.height/42,rect:rect.toJSON(),target:point?.className,
                animation:Math.abs(delta.dx*scale-(rect.left+rect.width/2-source.left-source.width/2))<.01};
        })()`);
        await screenshot(`visual-board-${viewport.width}`);
        assert.equal(hit.square,'48',JSON.stringify(hit));assert.ok(hit.battle);assert.ok(Math.abs(hit.x-hit.y)<.001);
        assert.ok(hit.animation,'Bench animation must use the board inverse scale');
        if(viewport.width===812) {
            await evaluate("document.querySelector('.recruit-collapse').click();");await sleep(100);
            const expanded=await evaluate(`(() => {
                const map=document.querySelector('.board-wrapper').getBoundingClientRect(),button=document.getElementById('btnStartBattle').getBoundingClientRect();
                return map.height>80&&button.bottom<=innerHeight&&document.querySelector('.board-view').scrollHeight<=document.querySelector('.board-view').clientHeight+1;
            })()`);
            assert.ok(expanded,'Expanded iPhone shop leaves a usable map and battle action');
            await screenshot('iphone-recruit-expanded');
            await evaluate("document.querySelector('.recruit-collapse').click();");
        }
        if(viewport.width===844) {
            await command('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
            const touch=await evaluate(`(() => {const r=roguelikeUI.getSquareEl(roguelikeUI.placedPieces[0].sq).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
            await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
            await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
            await sleep(150);
            assert.ok(await evaluate("HexPreparationInfo.panel.classList.contains('visible')"),'Tap must open unit details');
            await command('Emulation.setTouchEmulationEnabled',{enabled:false});
        }
    }
    await command('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    const clarity=[];
    for(const size of [3,6,12]){
        const result=await evaluate(`(()=>{
            roguelikeUI.resetRun();roguelikeUI.closeMainMenu();HexPreparationInfo.hide();
            document.body.classList.add('hex-combat-active');
            const c=new HexCombat(new HexBoard(),{random:()=>.8}),r=new HexRenderer(c);window.clarityCombat=c;window.clarityRenderer=r;
            for(let n=0;n<${size};n++)for(const color of ['w','b']){
                const square=color==='w'?28+n:n,id=color+n;
                c.addUnit(square,{id,color,type:color==='w'?'6':'3',pokemonId:color==='w'?'6':'3',element:color==='w'?'fire':'grass',maxHp:5000,attackDamage:20,attackRange:3,role:'mage',isBoss:n===0&&color==='b'});
                r.createSprite(c.units.get(id));
            }
            const start=performance.now();for(let n=0;n<180;n++)c.step();const elapsed=performance.now()-start;
            let thresholdColors=true;const savedHP=[...c.units.values()].map(u=>[u,u.hp]);for(const ratio of [1,.5,.1]){for(const [u]of savedHP)u.hp=u.maxHp*ratio;r.updateHP();thresholdColors&&=[...r.sprites].every(([id,s])=>getComputedStyle(s.hpFill).backgroundColor===(c.units.get(id).color==='w'?'rgb(39, 199, 111)':'rgb(239, 68, 68)'));}for(const [u,hp]of savedHP)u.hp=hp;
            for(const u of [...c.units.values()]){
                const target=[...c.units.values()].find(v=>v.color!==u.color);
                for(let n=0;n<8;n++){c.dealDamage(u,target,1,'skill',{damageType:'true'});c.healUnit(u,1);c.emit({type:'status',unitId:u.id,status:'burn',duration:3});}
                u.statuses.burn={expiresAt:c.tickCount+90};u.statuses.poison={expiresAt:c.tickCount+90};u.statuses.hexed={expiresAt:c.tickCount+60};
                c.emit({type:'skill-cast',unitId:u.id,targetId:target.id,role:'mage',delayTicks:6});
            }
            r.updateHP();const max=r.textManager.labels.size;
            const factionColors=[...r.sprites].every(([id,s])=>getComputedStyle(s.hpFill).backgroundColor===(c.units.get(id).color==='w'?'rgb(39, 199, 111)':'rgb(239, 68, 68)'));
            const bounded=max<=24&&[...r.sprites.values()].every(s=>s.element.querySelectorAll('.hex-floating-text').length<=2);
            const dead=[...c.units.values()][0],deadEl=r.sprites.get(dead.id).element;c.killUnit(dead);c.killUnit(dead);r.createSprite(dead);
            const noGhost=!r.sprites.has(dead.id)&&deadEl.querySelectorAll('.hex-combat-hp,.hex-combat-mana,.hex-combat-shield,.hex-floating-text').length===0;
            const owned=[...r.sprites].every(([id,s])=>c.units.has(id)&&s.element.dataset.unitId===id&&s.element.querySelector('.hex-combat-hp'));
            CombatPresentation.flushLog();return {size:${size},bounded,noGhost,owned,factionColors,thresholdColors,max,elapsed,log:NotificationCenter.entries.length<=200};
        })()`);
        assert.ok(result.bounded&&result.noGhost&&result.owned&&result.log&&result.factionColors&&result.thresholdColors,JSON.stringify(result));clarity.push(result);
        await screenshot('v43-combat-'+size);
        if(size===12&&process.argv.includes('--screenshots')){
            const baseline=await evaluate(`(()=>{const r=clarityRenderer,manager=r.textManager;r.textManager=null;
                for(const row of [...manager.labels.values()])manager.remove(row);
                for(const s of r.sprites.values())for(let n=0;n<4;n++)for(const [value,kind]of [['10','hex-float-damage'],['+8','hex-float-heal'],['Burn','hex-float-status'],['Critical','hex-float-effective'],['Skill','hex-float-skill-name']])r.spawnFloatingText(s.element,value,kind);
                const labels=[...document.querySelectorAll('.hex-floating-text')];for(const el of labels)el.style.animation='none';r.textManager=manager;
                return {units:r.sprites.size,labels:labels.length,reconstruction:true};})()`);
            await screenshot('v43-before-text-reconstruction');
            await evaluate("document.querySelectorAll('.hex-floating-text').forEach(el=>el.remove());");
            fs.writeFileSync(path.join(root,'artifacts','v43-before-text-evidence.json'),JSON.stringify(baseline,null,2));
        }
        await sleep(750);
        assert.equal(await evaluate('clarityRenderer.textManager.labels.size'),0,'Combat text expires while simulation is paused');
        assert.equal(await evaluate(`(()=>{clarityRenderer.destroy();document.body.classList.remove('hex-combat-active');return document.querySelectorAll('.hex-combat-unit,.hex-floating-text,.hex-sheet-vfx').length;})()`),0,'Battle reset removes every owned visual');
    }
    console.log('Combat clarity evidence:',JSON.stringify(clarity));
    fs.writeFileSync(path.join(root,'artifacts','v43-combat-evidence.json'),JSON.stringify(clarity,null,2));
    await command('Emulation.setDeviceMetricsOverride',{width:812,height:375,deviceScaleFactor:1,mobile:false});
    const displayCheck=await evaluate(`(()=>{
        const saved={...CombatPresentation.settings},journey=localStorage.getItem(SaveSystem.PREFIX+'1');
        const c=new HexCombat(new HexBoard()),r=new HexRenderer(c);c.addUnit(35,{id:'display',color:'w',type:'6',pokemonId:'6',maxHp:100});r.createSprite(c.units.get('display'));
        const el=r.sprites.get('display').element;CombatPresentation.settings={mode:'minimal',...CombatPresentation.presets.minimal};CombatPresentation.save();
        r.spawnFloatingText(el,'10','hex-float-damage');const minimal=r.textManager.labels.size===0;
        CombatPresentation.settings={mode:'detailed',...CombatPresentation.presets.detailed,bars:false};CombatPresentation.save();
        const hidden=el.querySelector('.hex-combat-hp').hidden;r.spawnFloatingText(el,'10','hex-float-damage');const detailed=r.textManager.labels.size===1;
        const independent=journey===localStorage.getItem(SaveSystem.PREFIX+'1');r.destroy();CombatPresentation.settings=saved;CombatPresentation.save();
        return {minimal,hidden,detailed,independent,clean:CombatPresentation.listeners.size===0};
    })()`);
    assert.ok(Object.values(displayCheck).every(Boolean),JSON.stringify(displayCheck));
    await command('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    const navigationCheck=await evaluate(`(()=>{const ui=roguelikeUI;ui.phase='setup';ui.disposeHexBattle();const inventory=JSON.stringify(ui.inventory);ui.openMainMenu();const noSwitcher=document.getElementById('expedition-panel').hidden;document.getElementById('btnMenuNewRun').click();return {noSwitcher,cards:document.querySelectorAll('#game-mode-cards button').length,inventory};})()`);
    assert.ok(navigationCheck.noSwitcher&&navigationCheck.cards===2);
    const menuPanels=await evaluate(`(()=>{document.getElementById('btnMenuSettings').click();const settings=document.getElementById('settingsModal'),front=getComputedStyle(settings).zIndex>getComputedStyle(document.getElementById('mainMenuOverlay')).zIndex;settings.classList.add('hidden');document.getElementById('btnMasteryCollection').click();const collection=document.getElementById('masteryCollectionModal'),visible=!collection.classList.contains('hidden');collection.querySelector('.mastery-close').click();return {front,visible,oneCollection:document.querySelectorAll('#btnMasteryCollection').length===1&&!document.getElementById('btnMenuCollection')};})()`);assert.ok(menuPanels.front&&menuPanels.visible&&menuPanels.oneCollection,JSON.stringify(menuPanels));
    await screenshot('unified-main-menu');
    for(const size of [{width:1366,height:768},{width:812,height:375}]){await command('Emulation.setDeviceMetricsOverride',{...size,deviceScaleFactor:1,mobile:false});await sleep(100);assert.ok(await evaluate(`(()=>{const box=document.querySelector('.main-menu-box').getBoundingClientRect();return box.left>=0&&box.right<=innerWidth&&box.top>=0&&box.bottom<=innerHeight;})()`));await screenshot('unified-menu-'+size.width);}
    await command('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    const classicEntry=await evaluate(`(()=>{const before=JSON.stringify(roguelikeUI.inventory);document.querySelector('[data-mode="classic"]').click();return !roguelikeUI.expeditionRun&&GameNavigation.mode()==='classic'&&document.getElementById('mainMenuOverlay').classList.contains('hidden')&&before===JSON.stringify(roguelikeUI.inventory);})()`);assert.ok(classicEntry);
    const speciesPreparation=await evaluate(`(()=>{
        const ui=roguelikeUI,classicKeys=[SaveSystem.PREFIX+'1',SaveSystem.PREFIX+'2',SaveSystem.PREFIX+'3',MasterySystem.STORAGE_KEY,MetaProgression.STORAGE_KEY].filter(Boolean),before=classicKeys.map(k=>localStorage.getItem(k));ui.phase='setup';ui.disposeHexBattle();
        ui.openMainMenu();document.getElementById('btnMenuNewRun').click();document.querySelector('[data-mode="expedition"]').click();const panel=document.getElementById('expedition-panel');panel.querySelector('select').value='3';panel.querySelector('input[aria-label="Seed"]').value='browser-expedition';[...panel.querySelectorAll('button')].find(b=>b.textContent==='Bắt đầu').click();
        const mapVisible=document.querySelector('.expedition-open')!==null&&document.getElementById('mainMenuOverlay').classList.contains('hidden');const first=Expedition.available(ui.expeditionRun)[0];ExpeditionSession.select(first.id);
        const item=ui.inventory[0];HexPreparationInfo.showInventory(item);HexPreparationInfo.setTab('skills');const choices=[...document.querySelectorAll('.species-skill-choices button')];if(!choices.length)throw Error('Missing source-backed skill choices');choices.at(-1).click();const chosen=item.selectedSpeciesMoveId,sourceStats=document.querySelector('.species-stats')?.textContent.includes('Sp.DEF'),choiceSaved=ExpeditionStore.read('3').run.squad.inventory[0].selectedSpeciesMoveId===chosen;
        window.speciesSmoke={classicKeys,before,mapVisible,itemId:item.id,chosen,sourceStats,choiceSaved};return {sourceStats,choiceSaved,count:choices.length};
    })()`);
    assert.ok(speciesPreparation.sourceStats&&speciesPreparation.choiceSaved);
    await screenshot('v50-species-skills');
    const expeditionCheck=await evaluate(`(()=>{
        const ui=roguelikeUI,{classicKeys,before,mapVisible,itemId,chosen,sourceStats,choiceSaved}=window.speciesSmoke,item=ui.inventory.find(p=>p.id===itemId);delete window.speciesSmoke;
        ui.autoArrangePlayerFormation();ui.startBattle();ui.hexCombat.stop();const combat=ui.hexCombat;const owned=[...combat.units.values()].find(u=>u.sourcePiece?.invId===item.id),model=owned?.speciesCombat?.version===1&&owned.speciesCombat.moveId===chosen;HexPreparationInfo.showCombatUnit(owned.id);HexPreparationInfo.setTab('skills');const locked=[...document.querySelectorAll('.species-skill-choices button')].every(b=>b.disabled);const node=ui.expeditionRun.currentNode,tick=combat.tickCount;ui.openMainMenu();ui.syncHexBattlePause();document.getElementById('btnMenuContinue').click();ui.syncHexBattlePause();combat.stop();const continued=ui.hexCombat===combat&&ui.expeditionRun.currentNode===node&&combat.tickCount===tick&&document.getElementById('mainMenuOverlay').classList.contains('hidden');for(const unit of [...combat.units.values()].filter(u=>u.color==='b'))combat.killUnit(unit);combat.checkBattleEnd();
        const reward=ui.expeditionRun.status==='reward',hp=ui.expeditionRun.trainerHp;ExpeditionSession.action('gold');const gold=ui.gold;ExpeditionSession.action('gold');const once=ui.gold===gold;
        const saved=ExpeditionStore.read('3'),isolated=classicKeys.every((k,i)=>localStorage.getItem(k)===before[i]);return {mapVisible,reward,hp,once,isolated,savedStatus:saved.run.status,sourceStats,choiceSaved,model,locked,continued};
    })()`);
    assert.ok(expeditionCheck.mapVisible&&expeditionCheck.reward&&expeditionCheck.once&&expeditionCheck.isolated,JSON.stringify(expeditionCheck));
    assert.equal(expeditionCheck.hp,100);assert.equal(expeditionCheck.savedStatus,'route');
    assert.ok(expeditionCheck.sourceStats&&expeditionCheck.choiceSaved&&expeditionCheck.model&&expeditionCheck.locked&&expeditionCheck.continued,JSON.stringify(expeditionCheck));
    const telegraphCheck=await evaluate(`(()=>{const c=new HexCombat(new HexBoard());c.addUnit(35,{id:'hazard-ally',color:'w',type:'1',maxHp:100});c.addUnit(21,{id:'hazard-boss',color:'b',isBoss:true,type:'248',maxHp:100});c.initialTeams=new Set(['w','b']);const r=new HexRenderer(c);for(const u of c.units.values())r.createSprite(u);ExpeditionRegions.attach(c,1);c.tickCount=240;ExpeditionRegions.update(c);const zones=document.querySelectorAll('.expedition-danger-zone').length;c.killUnit(c.units.get('hazard-boss'));const afterDeath=document.querySelectorAll('.expedition-danger-zone').length;r.destroy();return {zones,afterDeath,afterReset:document.querySelectorAll('.expedition-danger-zone').length};})()`);
    assert.ok(telegraphCheck.zones>0&&telegraphCheck.afterDeath===0&&telegraphCheck.afterReset===0,JSON.stringify(telegraphCheck));
    await screenshot('v50-expedition-route');
    for(const viewport of [{width:812,height:375},{width:390,height:844}]){
        await command('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1,mobile:false});await sleep(120);
        const bounds=await evaluate(`(()=>{const r=document.querySelector('#expedition-panel').getBoundingClientRect(),c=document.querySelector('.expedition-content');return {bounded:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,scroll:c.scrollHeight>=c.clientHeight,edges:document.querySelectorAll('.expedition-edges line').length};})()`);
        assert.ok(bounds.bounded&&bounds.scroll&&bounds.edges>0,JSON.stringify(bounds));await screenshot('v50-expedition-'+viewport.width);
    }
    await command('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    fs.writeFileSync(path.join(root,'artifacts','v50-expedition-evidence.json'),JSON.stringify({...expeditionCheck,telegraphCheck},null,2));
    fs.writeFileSync(path.join(root,'artifacts','unified-presentation-evidence.json'),JSON.stringify({navigationCheck,menuPanels,classicEntry,expeditionCheck,clarity,spriteRevision:await evaluate('PokemonSpriteManifest.revision')},null,2));
    const resumeCheck=await evaluate(`(()=>{const node=roguelikeUI.expeditionRun.currentNode,gold=roguelikeUI.gold;let preserved=true;for(let i=0;i<3;i++){GameNavigation.classic();ExpeditionSession.enter('3');preserved&&=roguelikeUI.expeditionRun.currentNode===node&&roguelikeUI.gold===gold;}ExpeditionSession.leave();return preserved;})()`);assert.ok(resumeCheck,'Repeated mode switching must preserve the saved node and economy');
    await command('Page.navigate',{url:url+'docs/visual/vfx-gallery.html'});
    for(let n=0;n<50;n++){if(await evaluate('document.querySelectorAll(".card canvas").length===92'))break;await sleep(100);}
    assert.equal(await evaluate('document.querySelectorAll(".card canvas").length'),92);
    const galleryLoaded=await evaluate('Promise.all(state.map(s=>s.image.decode())).then(()=>state.every(s=>s.image.naturalWidth>0))');
    assert.ok(galleryLoaded,'All 92 gallery sheets must load');
    const galleryPixels=await evaluate(`(() => state.every(s=>{
        const [w,h]=s.asset.frameSize,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');ctx.drawImage(s.image,(s.asset.frameCount-1)*w,0,w,h,0,0,w,h);
        const data=ctx.getImageData(0,0,w,h).data;
        if(!s.asset.loop && data.some((value,index)=>index%4===3&&value!==0))return false;
        for(let x=0;x<w;x++)if(data[x*4+3]||data[((h-1)*w+x)*4+3])return false;
        for(let y=0;y<h;y++)if(data[y*w*4+3]||data[(y*w+w-1)*4+3])return false;
        return true;
    }))()`);
    assert.ok(galleryPixels,'Exported one-shots finish transparent and have a clear boundary');
    await screenshot('overhaul-vfx-gallery');
    assert.deepEqual(runtimeErrors, [], 'Browser runtime errors');
    const missing = [...new Set(missingLocalAssets)];
    assert.deepEqual(missing, [], 'Missing local runtime assets');
    console.log('Browser checks passed: stats/combat, buy/sell/recruit/equip, Bench identity, recall/drag/formation, legacy/current saves, HP clipping, settings/confirmation/language, selection, desktop and compact layout, uniform hex scale, resize hit-test and touch details.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
    if (sendCommand && socket?.readyState === WebSocket.OPEN) {
        await Promise.race([sendCommand('Browser.close').catch(() => {}), sleep(2000)]);
    }
    socket?.close();
    if (browser && browser.exitCode === null) {
        await Promise.race([new Promise(resolve => browser.once('exit', resolve)), sleep(2000)]);
        if (browser.exitCode === null) browser.kill();
    }
    await new Promise(resolve => server.close(resolve));
    // Only delete the unique temporary browser profile created by this script.
    if (profile && path.dirname(profile) === os.tmpdir() && path.basename(profile).startsWith('pokechess-review-')) {
        await sleep(500);
        await fs.promises.rm(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
    }
}).catch(error => { console.error('Browser test cleanup failed:', error); process.exitCode = 1; });
