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
        `--user-data-dir=${profile}`, '--window-size=1024,768', 'about:blank'
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
        await evaluate(`Promise.all([...document.querySelectorAll('.board img')].map(image => image.decode().catch(() => {})))`);
        assert.ok(await evaluate(`[...document.querySelectorAll('.board .piece, .board .hex-combat-sprite')].every(image => image.complete && image.naturalWidth > 0)`), 'Missing Pokémon sprite image');
        const result = await command('Page.captureScreenshot', { format: 'png' });
        const folder = path.join(root, 'artifacts');
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(path.join(folder, name + '.png'), Buffer.from(result.data, 'base64'));
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
    await evaluate('roguelikeUI.resetRun(); roguelikeUI.closeMainMenu();');

    for (const stage of [1, 5, 10]) {
        const preview = await evaluate(`(() => {
            const ui=roguelikeUI; ui.stage=${stage}; ui.setupNewStage();
            const combat=new HexBridge(ui).createCombat();
            const boardMatches = [...combat.units.values()].every(unit => {
                const piece=ui.game.board[unit.square];
                const stats=HexPokemonInfo.getBattleStats(piece,unit.square,ui);
                return stats.maxHp===unit.maxHp && stats.damage===unit.attackDamage &&
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
            return boardMatches && benchMatches && recruitMatches;
        })()`);
        assert.ok(preview, `Stage ${stage} HUD/prediction mismatch`);
    }

    const layout = await evaluate(`(() => {
        const ui=roguelikeUI; const square=ui.placedPieces[0].sq;
        HexPreparationInfo.showInfo(ui.game.board[square],square);
        const panel=HexPreparationInfo.panel, view=document.querySelector('.board-view');
        const info=panel.getBoundingClientRect(), board=document.querySelector('.board-wrapper').getBoundingClientRect();
        const arena=document.querySelector('.arena-center').getBoundingClientRect();
        const recruit=document.querySelector('.right-panel').getBoundingClientRect();
        return {below:info.top>=board.bottom, contained:info.left>=arena.left && info.right<=arena.right,
            recruitClear:info.right<=recruit.left, scrollable:view.scrollHeight>view.clientHeight,
            position:getComputedStyle(panel).position};
    })()`);
    assert.ok(layout.below && layout.contained && layout.recruitClear && layout.scrollable);
    assert.equal(layout.position, 'relative');
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
        const rect=document.querySelector('[data-unit-id="${selected.id}"]').getBoundingClientRect();
        return {x:rect.left+rect.width/2,y:rect.top+rect.height/3};
    })()`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    assert.equal(await evaluate('roguelikeUI.hexRenderer.selectedUnitId'), selected.id);
    assert.equal(await evaluate('HexPreparationInfo.selectedUnitId'), selected.id);
    assert.equal(await evaluate('HexPreparationInfo.selectedSquare'), selected.square);

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
    assert.match(live.text, /SHIELD 15/);
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

    for (const viewport of [{ width: 768, height: 432 }, { width: 844, height: 390 }]) {
        await command('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: false });
        await sleep(100);
        const clear = await evaluate(`(() => {
            const ui=roguelikeUI,square=ui.placedPieces[0].sq;
            HexPreparationInfo.showInfo(ui.game.board[square],square);
            const panel=HexPreparationInfo.panel.getBoundingClientRect(),recruit=document.querySelector('.right-panel').getBoundingClientRect();
            return panel.right<=recruit.left;
        })()`);
        assert.ok(clear, `Inspector overlaps Recruit at ${viewport.width}×${viewport.height}`);
    }
    assert.deepEqual(runtimeErrors, [], 'Browser runtime errors');
    // Existing optional dev endpoints/overrides and BGM are absent in the
    // supplied static project; bundled Pokémon definitions still load.
    const knownMissing = new Set(['/api/list-talismans', '/api/list-pieces', '/api/read-talisman', '/api/read-piece', '/assets/audio/tavern.mp3', '/js/pieces/nidoran_m.js']);
    const missing = [...new Set(missingLocalAssets)];
    assert.deepEqual(missing.filter(file => !knownMissing.has(file)), [], 'New missing local assets');
    if (missing.length) console.log('Existing unavailable resources:', missing.join(', '));
    console.log('Browser checks passed: stage 1/5/10 stats and HUD, inspector layout, selection during movement, live stats, pinned selection, boss phases, pause/resume, restart/load/retry, scaled landscape viewports.');
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
        fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    }
});
