/**
 * ========================================================================
 * CHESS+ ROGUELIKE: DEVELOPER MOVE & STATS EDITOR (CTRL + SHIFT + E)
 * ========================================================================
 *
 * Chức năng dành riêng cho DEV (kích hoạt bằng Ctrl + Shift + E):
 * - Tách riêng từng Pokémon thành file độc lập trong C:\Code\chess+\js\pieces\
 * - Lưu trực tiếp vào file của Pokémon đang chọn qua Electron IPC
 * - Tạo mới Pokémon linh hoạt (nhập ID để tự động lấy ảnh icon trong assets)
 * - Mẫu nhanh & Copy nước đi từ dạng tiến hóa trước (Phím tắt C hoặc bấm nút)
 * - Phím tắt vẽ cọ nhanh khi mở editor:
 *     [A] = ALL (Vừa đi vừa ăn)
 *     [S] = MOVE ONLY (Chỉ đi)
 *     [D] = CAPTURE ONLY (Chỉ ăn)
 *     [E] = XÓA Ô (Clear)
 */

'use strict';

const CustomMoveSystem = {
  init() {
    this.purgeLocalStorageCache();
    this.loadAllPiecesFromDisk().then(() => {
      this.applyAllToPieces();
    });
  },

  /**
   * Xóa sạch toàn bộ cache localStorage cũ để đảm bảo 100% dữ liệu lấy trực tiếp từ file đĩa
   */
  purgeLocalStorageCache() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('chessplus_custom_moves');
        localStorage.removeItem('chessplus_custom_pieces_catalog');
      }
    } catch (e) {}
  },

  /**
   * Quét và nạp toàn bộ Pokémon trực tiếp từ thư mục C:\Code\chess+\js\pieces\
   */
  async loadAllPiecesFromDisk() {
    this.purgeLocalStorageCache();
    let fileList = [];

    // 1. Electron IPC: list-piece-files
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.listPieceFiles === 'function') {
      try {
        const res = await window.electronAPI.listPieceFiles();
        if (res && res.success && Array.isArray(res.files)) {
          fileList = res.files;
        }
      } catch (err) {
        console.warn('Electron listPieceFiles error:', err);
      }
    }

    // 2. Dev server API: /api/list-pieces
    if (fileList.length === 0 && window.POKECHESS_EDITOR_API && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/list-pieces?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.files)) {
            fileList = data.files;
          }
        }
      } catch (err) {}
    }

    // Luôn đảm bảo nạp tối thiểu toàn bộ danh sách Pokémon Gen 1 (1-151) và custom
    const knownDefaultPieceFiles = [
      'bulbasaur.js', 'ivysaur.js', 'venusaur.js', 'charmander.js', 'charmeleon.js', 'charizard.js',
      'squirtle.js', 'wartortle.js', 'blastoise.js', 'caterpie.js', 'metapod.js', 'butterfree.js',
      'weedle.js', 'kakuna.js', 'beedrill.js', 'pidgey.js', 'pidgeotto.js', 'pidgeot.js',
      'rattata.js', 'raticate.js', 'spearow.js', 'fearow.js', 'ekans.js', 'arbok.js',
      'pikachu.js', 'raichu.js', 'sandshrew.js', 'sandslash.js', 'nidoran_f.js', 'nidorina.js',
      'nidoqueen.js', 'nidorino.js', 'nidoking.js', 'clefairy.js', 'clefable.js',
      'vulpix.js', 'ninetales.js', 'jigglypuff.js', 'wigglytuff.js', 'zubat.js', 'golbat.js',
      'oddish.js', 'gloom.js', 'vileplume.js', 'paras.js', 'parasect.js', 'venonat.js',
      'venomoth.js', 'diglett.js', 'dugtrio.js', 'meowth.js', 'persian.js', 'psyduck.js',
      'golduck.js', 'mankey.js', 'primeape.js', 'growlithe.js', 'arcanine.js', 'poliwag.js',
      'poliwhirl.js', 'poliwrath.js', 'abra.js', 'kadabra.js', 'alakazam.js', 'machop.js',
      'machoke.js', 'machamp.js', 'bellsprout.js', 'weepinbell.js', 'victreebel.js', 'tentacool.js',
      'tentacruel.js', 'geodude.js', 'graveler.js', 'golem.js', 'ponyta.js', 'rapidash.js',
      'slowpoke.js', 'slowbro.js', 'magnemite.js', 'magneton.js', 'farfetchd.js', 'doduo.js',
      'dodrio.js', 'seel.js', 'dewgong.js', 'grimer.js', 'muk.js', 'shellder.js',
      'cloyster.js', 'gastly.js', 'haunter.js', 'gengar.js', 'onix.js', 'drowzee.js',
      'hypno.js', 'krabby.js', 'kingler.js', 'voltorb.js', 'electrode.js', 'exeggcute.js',
      'exeggutor.js', 'cubone.js', 'marowak.js', 'hitmonlee.js', 'hitmonchan.js', 'lickitung.js',
      'koffing.js', 'weezing.js', 'rhyhorn.js', 'rhydon.js', 'chansey.js', 'tangela.js',
      'kangaskhan.js', 'horsea.js', 'seadra.js', 'goldeen.js', 'seaking.js', 'staryu.js',
      'starmie.js', 'mr_mime.js', 'scyther.js', 'jynx.js', 'electabuzz.js', 'magmar.js',
      'pinsir.js', 'tauros.js', 'magikarp.js', 'gyarados.js', 'lapras.js', 'ditto.js',
      'eevee.js', 'vaporeon.js', 'jolteon.js', 'flareon.js', 'porygon.js', 'omanyte.js',
      'omastar.js', 'kabuto.js', 'kabutops.js', 'aerodactyl.js', 'snorlax.js', 'articuno.js',
      'zapdos.js', 'moltres.js', 'dratini.js', 'dragonair.js', 'dragonite.js', 'mewtwo.js',
      'mew.js', 'aron.js', 'lairon.js', 'aggron.js',
      // Gen 2 (Johto)
      'chikorita.js', 'bayleef.js', 'meganium.js', 'cyndaquil.js', 'quilava.js', 'typhlosion.js',
      'totodile.js', 'croconaw.js', 'feraligatr.js', 'mareep.js', 'flaaffy.js', 'ampharos.js',
      'espeon.js', 'umbreon.js', 'scizor.js', 'heracross.js', 'larvitar.js', 'pupitar.js',
      'tyranitar.js', 'lugia.js', 'ho_oh.js',
      // Gen 3 (Hoenn)
      'treecko.js', 'grovyle.js', 'sceptile.js', 'torchic.js', 'combusken.js', 'blaziken.js',
      'mudkip.js', 'marshtomp.js', 'swampert.js', 'ralts.js', 'kirlia.js', 'gardevoir.js',
      'bagon.js', 'shelgon.js', 'salamence.js', 'beldum.js', 'metang.js', 'metagross.js',
      'kyogre.js', 'groudon.js', 'rayquaza.js'
    ];
    for (const sf of knownDefaultPieceFiles) {
      if (!fileList.includes(sf)) fileList.push(sf);
    }

    for (const fileName of fileList) {
      try {
        await this.loadPieceFileContent(fileName);
      } catch (e) {
        console.error(`Lỗi nạp file Pokémon ${fileName}:`, e);
      }
    }

    this.applyAllToPieces();
  },

  /**
   * Nạp nội dung một file JavaScript từ js/pieces/<filename> và thực thi cập nhật vào PIECES
   */
  async loadPieceFileContent(fileName) {
    let code = null;

    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.readPieceFile === 'function') {
      try {
        const res = await window.electronAPI.readPieceFile(fileName);
        if (res && res.success && res.content) {
          code = res.content;
        }
      } catch (e) {}
    }

    // 2. Dev server API
    if (!code && window.POKECHESS_EDITOR_API && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/read-piece?filename=${encodeURIComponent(fileName)}&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.content) {
            code = data.content;
          }
        }
      } catch (e) {}
    }

    // 3. Static fetch
    if (!code && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`js/pieces/${fileName}?_t=${Date.now()}`);
        if (res.ok) {
          code = await res.text();
        }
      } catch (e) {}
    }

    if (code) {
      const targetPieces = (typeof window !== 'undefined' && window.PIECES) ? window.PIECES : (typeof PIECES !== 'undefined' ? PIECES : {});
      const runner = new Function('PIECES', 'window', 'globalThis', 'CustomMoveSystem', code);
      runner(targetPieces, (typeof window !== 'undefined' ? window : globalThis), (typeof globalThis !== 'undefined' ? globalThis : window), this);
      if (typeof PIECES !== 'undefined' && PIECES !== targetPieces) {
        Object.assign(PIECES, targetPieces);
      }
    } else if (typeof document !== 'undefined') {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `js/pieces/${fileName}?_t=${Date.now()}`;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }

    // Đồng bộ ID vào ALL_PIECE_KEYS và lưu fileMap chính xác
    if (!CustomMoveSystem.fileMap) CustomMoveSystem.fileMap = {};
    if (code) {
      const match = code.match(/PIECES\s*\[\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*\]/);
      if (match && match[1]) {
        const pId = match[1];
        CustomMoveSystem.fileMap[pId] = fileName;
        if (typeof ALL_PIECE_KEYS !== 'undefined' && !ALL_PIECE_KEYS.includes(pId)) {
          ALL_PIECE_KEYS.push(pId);
        }
      }
    }
    if (typeof PIECES !== 'undefined') {
      for (const k of Object.keys(PIECES)) {
        if (typeof ALL_PIECE_KEYS !== 'undefined' && !ALL_PIECE_KEYS.includes(k)) {
          ALL_PIECE_KEYS.push(k);
        }
        if (PIECES[k]) {
          const pName = (PIECES[k].name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (pName && (fileName.toLowerCase().includes(pName) || fileName.toLowerCase() === `${pName}.js`)) {
            CustomMoveSystem.fileMap[k] = fileName;
          }
        }
      }
    }
  },

  /**
   * Chuyển đổi tên Pokémon thành tên file hợp lệ (vd: "Lairon" -> "lairon.js")
   */
  cleanFileNameFromName(name, fallbackId) {
    if (name && typeof name === 'string') {
      const clean = name.toLowerCase().trim()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      if (clean) return `${clean}.js`;
    }
    return `piece_${fallbackId}.js`;
  },

  /**
   * Tên file JavaScript tương ứng của Pokémon trong js/pieces/
   * Luôn ưu tiên sinh theo TÊN nếu người dùng đổi tên hoặc tạo con mới!
   */
  getPieceFileName(type, overrideName = null) {
    const t = String(type);
    const defaultFileNames = {
      '1': 'bulbasaur.js',
      '2': 'ivysaur.js',
      '3': 'venusaur.js',
      '4': 'charmander.js',
      '5': 'charmeleon.js',
      '6': 'charizard.js',
      '7': 'squirtle.js',
      '8': 'wartortle.js',
      '9': 'blastoise.js'
    };
    if (defaultFileNames[t]) return defaultFileNames[t];

    // 1. Nếu có tên mới truyền vào (khi đổi tên trong ô input hoặc tạo mới)
    if (overrideName && typeof overrideName === 'string' && overrideName.trim()) {
      return this.cleanFileNameFromName(overrideName, t);
    }

    // 2. Nếu Pokémon trong PIECES có tên cụ thể (không phải tên mặc định generic)
    const p = (typeof PIECES !== 'undefined' && PIECES[t]) ? PIECES[t] : null;
    if (p && p.name && !p.name.startsWith('Pokemon #')) {
      return this.cleanFileNameFromName(p.name, t);
    }

    // 3. Nếu đã được nạp từ fileMap thực tế
    if (this.fileMap && this.fileMap[t]) return this.fileMap[t];

    if (p && p.name) {
      return this.cleanFileNameFromName(p.name, t);
    }

    return `piece_${t}.js`;
  },

  hasCustom(type) {
    const t = String(type);
    const cfg = this.getConfig(t);
    return !!(cfg && ((cfg.steps && cfg.steps.length > 0) || (cfg.slides && cfg.slides.length > 0)));
  },

  /**
   * Lấy cấu hình của Pokémon trực tiếp 100% từ PIECES (nạp từ file đĩa)
   */
  getConfig(type) {
    const t = String(type);
    if (typeof PIECES !== 'undefined' && PIECES[t]) {
      const p = PIECES[t];
      return {
        id: t,
        num: p.num || t,
        name: p.name || `Pokemon #${t}`,
        element: p.element || 'normal',
        element2: p.element2 || null,
        asset: p.asset || t,
        rarity: p.rarity || 'common',
        stage: p.stage || 1,
        value: p.value !== undefined ? p.value : (p.stage === 2 ? 7 : (p.stage === 3 ? 9 : 5)),
        maxHp: p.maxHp !== undefined ? p.maxHp : 3,
        damage: p.damage !== undefined ? p.damage : 1,
        battlesToEvolve: p.battlesToEvolve !== undefined ? p.battlesToEvolve : 3,
        nextEvo: p.nextEvo ? String(p.nextEvo) : null,
        desc: p.desc || '',
        steps: p.steps ? JSON.parse(JSON.stringify(p.steps)) : [],
        slides: p.slides ? JSON.parse(JSON.stringify(p.slides)) : []
      };
    }
    return {
      id: t,
      num: t,
      name: `Pokemon #${t}`,
      element: 'normal',
      element2: null,
      asset: t,
      rarity: 'common',
      stage: 1,
      value: 5,
      maxHp: 3,
      damage: 1,
      battlesToEvolve: 3,
      nextEvo: null,
      desc: '',
      steps: [],
      slides: []
    };
  },

  /**
   * Nạp lại trực tiếp mã nguồn file JavaScript từ thư mục js/pieces/
   */
  async reloadPieceFromFile(type) {
    const t = String(type);
    const fileName = this.getPieceFileName(t);
    await this.loadPieceFileContent(fileName);
    this.purgeLocalStorageCache();

    // Đồng bộ vào game runtime
    if (typeof app !== 'undefined') {
      if (app.updateStats) app.updateStats();
      if (app.renderInventory) app.renderInventory();
      if (app.renderShop) app.renderShop();
      if (app.renderBoard) app.renderBoard();
    }

    return this.getConfig(t);
  },

  setConfig(type, config) {
    const t = String(type);

    // Đồng bộ trực tiếp vào PIECES
    if (typeof PIECES !== 'undefined') {
      if (!PIECES[t]) {
        PIECES[t] = {
          id: t,
          num: config.num || t,
          name: config.name || `Pokemon #${t}`,
          element: config.element || 'normal',
          asset: config.asset || t,
          rarity: config.rarity || 'common',
          stage: config.stage || 1,
          value: config.value || 100,
          desc: config.desc || '',
          getMoves(game, i, r, c, piece, push, slide) {
            if (typeof CustomMoveSystem !== 'undefined') {
              return CustomMoveSystem.getMoves(game, i, r, c, piece, push, slide);
            }
            return [];
          }
        };
      }
      if (config.name) PIECES[t].name = config.name;
      if (config.element) PIECES[t].element = config.element;
      PIECES[t].element2 = config.element2 || null;
      if (config.stage !== undefined) PIECES[t].stage = Number(config.stage);
      if (config.rarity) PIECES[t].rarity = config.rarity;
      if (config.value !== undefined) PIECES[t].value = Number(config.value);
      if (config.desc !== undefined) PIECES[t].desc = config.desc;
      PIECES[t].maxHp = Number(config.maxHp !== undefined ? config.maxHp : (PIECES[t].maxHp || 3));
      PIECES[t].damage = Number(config.damage !== undefined ? config.damage : (PIECES[t].damage || 1));
      PIECES[t].battlesToEvolve = Number(config.battlesToEvolve !== undefined ? config.battlesToEvolve : (PIECES[t].battlesToEvolve || 3));
      PIECES[t].nextEvo = config.nextEvo ? String(config.nextEvo) : null;
      PIECES[t].evoItem = config.evoItem ? String(config.evoItem) : null;
      if (config.steps) PIECES[t].steps = JSON.parse(JSON.stringify(config.steps));
      if (config.slides) PIECES[t].slides = JSON.parse(JSON.stringify(config.slides));
    }

    this.applyAllToPieces();
  },

  /**
   * Xóa file vật lý trong thư mục js/pieces/ (Bảo vệ 9 starter 1-9)
   */
  async deletePiecePhysicalFile(fileName) {
    if (!fileName) return false;
    const safeName = fileName.replace(/\\/g, '/').split('/').pop();
    const starterFiles = [
      'bulbasaur.js', 'ivysaur.js', 'venusaur.js',
      'charmander.js', 'charmeleon.js', 'charizard.js',
      'squirtle.js', 'wartortle.js', 'blastoise.js'
    ];
    if (starterFiles.includes(safeName.toLowerCase())) {
      return false; // Tuyệt đối không xóa file starter gốc
    }

    let deleted = false;
    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.deletePieceFile === 'function') {
      try {
        const res = await window.electronAPI.deletePieceFile(safeName);
        if (res && res.success) deleted = true;
      } catch (e) {
        console.warn('Electron deletePieceFile error:', e);
      }
    }

    // 2. Dev server API
    if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/delete-piece', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: safeName })
        });
        if (res.ok) deleted = true;
      } catch (e) {}
    }
    return deleted;
  },

  /**
   * Xóa vĩnh viễn một Pokémon: xóa file trong js/pieces/, xóa khỏi PIECES và runtime game
   */
  async deletePiece(type) {
    const t = String(type);
    const numT = parseInt(t, 10);
    if (numT >= 1 && numT <= 9) {
      if (typeof app !== 'undefined' && app.showToast) {
        app.showToast('⚠️ Không thể xóa 9 Pokémon starter gốc (1-9)!', 'red');
      } else {
        alert('Không thể xóa 9 Pokémon starter gốc!');
      }
      return false;
    }

    const fileName = this.getPieceFileName(t);

    // 1. Xóa file vật lý trong js/pieces/
    await this.deletePiecePhysicalFile(fileName);

    // 2. Xóa khỏi PIECES runtime, ALL_PIECE_KEYS & fileMap
    if (typeof PIECES !== 'undefined') {
      delete PIECES[t];
    }
    if (typeof ALL_PIECE_KEYS !== 'undefined') {
      const idx = ALL_PIECE_KEYS.indexOf(t);
      if (idx !== -1) {
        ALL_PIECE_KEYS.splice(idx, 1);
      }
    }
    if (this.fileMap && this.fileMap[t]) {
      delete this.fileMap[t];
    }

    // 3. Xóa triệt để khỏi trận chiến nếu đang trên sân / ghế dự bị / cửa hàng
    if (typeof app !== 'undefined') {
      if (app.inventory) {
        app.inventory = app.inventory.filter(i => String(i.type) !== t);
      }
      if (app.placedPieces && app.game && app.game.board) {
        const removed = app.placedPieces.filter(p => String(p.type) === t);
        for (const rem of removed) {
          app.game.board[rem.sq] = null;
          if (app.removePieceDOM) app.removePieceDOM(rem.sq);
        }
        app.placedPieces = app.placedPieces.filter(p => String(p.type) !== t);
      }
      if (app.cardChoices) {
        app.cardChoices = app.cardChoices.filter(c => String(c) !== t);
      }
      if (app.updateStats) app.updateStats();
      if (app.renderInventory) app.renderInventory();
      if (app.renderBoard) app.renderBoard();
      if (app.renderShop) app.renderShop();
    }

    this.purgeLocalStorageCache();
    return true;
  },

  resetToDefault(type) {
    return this.reloadPieceFromFile(type);
  },

  /**
   * Cập nhật chỉ số trực tiếp vào game đang chạy
   */
  applyAllToPieces() {
    if (typeof PIECES === 'undefined') return;

    const allKeys = Object.keys(PIECES);
    for (const t of allKeys) {
      const cfg = this.getConfig(t);
      if (!cfg || !PIECES[t]) continue;

      if (cfg.name) PIECES[t].name = cfg.name;
      if (cfg.element) PIECES[t].element = cfg.element;
      if (cfg.stage !== undefined) PIECES[t].stage = Number(cfg.stage);
      if (cfg.rarity) PIECES[t].rarity = cfg.rarity;
      if (cfg.value !== undefined) PIECES[t].value = Number(cfg.value);
      if (cfg.desc !== undefined) PIECES[t].desc = cfg.desc;
      if (cfg.maxHp !== undefined && !isNaN(Number(cfg.maxHp))) {
        PIECES[t].maxHp = Number(cfg.maxHp);
      }
      if (cfg.damage !== undefined && !isNaN(Number(cfg.damage))) {
        PIECES[t].damage = Number(cfg.damage);
      }
      if (cfg.battlesToEvolve !== undefined && !isNaN(Number(cfg.battlesToEvolve))) {
        PIECES[t].battlesToEvolve = Number(cfg.battlesToEvolve);
      }
      if (cfg.nextEvo !== undefined) {
        PIECES[t].nextEvo = cfg.nextEvo ? String(cfg.nextEvo) : null;
      }
      if (cfg.steps) PIECES[t].steps = cfg.steps;
      if (cfg.slides) PIECES[t].slides = cfg.slides;
    }

    if (typeof app !== 'undefined') {
      if (app.updateStats) app.updateStats();
      if (app.renderInventory) app.renderInventory();
      if (app.renderShop) app.renderShop();
      if (app.renderBoard) app.renderBoard();
      if (app.updateSellButton) app.updateSellButton();
    }
  },

  /**
   * Tính toán nước đi hợp lệ từ steps và slides
   */
  getMoves(game, i, r, c, p, push, slide) {
    const moveType = (p && p.transformType) ? p.transformType : p.type;
    const config = this.getConfig(moveType);
    if (!config) return [];

    const moves = [];
    const dir = p.color === 'w' ? -1 : 1;

    // 1. Ô bước đơn
    if (config.steps && Array.isArray(config.steps)) {
      for (const step of config.steps) {
        const tr = r + step.dr * dir;
        const tc = c + step.dc;
        const flags = {
          moveOnly: step.mode === 'moveOnly' || step.mode === 'move',
          captureOnly: step.mode === 'captureOnly' || step.mode === 'attack'
        };
        push(moves, tr, tc, flags);
      }
    }

    // 2. Tia trượt dài (hỗ trợ gốc xuất phát startDr, startDc tùy ý từ bất kỳ ô nào trên bàn cờ)
    if (config.slides && Array.isArray(config.slides)) {
      for (const s of config.slides) {
        const sdr = s.dr * dir;
        const sdc = s.dc;
        const startR = s.startDr !== undefined ? s.startDr * dir : sdr;
        const startC = s.startDc !== undefined ? s.startDc : sdc;
        const maxSteps = s.maxSteps || 8;
        const flags = {
          moveOnly: s.mode === 'moveOnly' || s.mode === 'move',
          captureOnly: s.mode === 'captureOnly' || s.mode === 'attack'
        };

        let nr = r + startR;
        let nc = c + startC;
        let steps = 0;

        while (game.inBounds(nr, nc) && steps < maxSteps) {
          const ti = game.idx(nr, nc);
          const t = game.board[ti];
          if (t) {
            if (t.color !== p.color && !flags.moveOnly) {
              moves.push({ from: i, to: ti, ...flags });
            }
            break; // Gặp cản -> dừng tia trượt
          }
          moves.push({ from: i, to: ti, ...flags });
          nr += sdr;
          nc += sdc;
          steps++;
        }
      }
    }

    return moves;
  },

  /**
   * Tìm Pokémon cấp tiến hóa trước (con nào có nextEvo === currentType)
   */
  getPreviousEvolution(type) {
    const t = String(type);
    if (typeof PIECES === 'undefined') return null;

    for (const key in PIECES) {
      const p = PIECES[key];
      if (p) {
        if (String(p.nextEvo) === t) {
          return { type: key, ...p };
        }
        if (Array.isArray(p.evoBranches) && p.evoBranches.map(String).includes(t)) {
          return { type: key, ...p };
        }
      }
    }

    // Support Mega evolutions
    if (t.startsWith('mega_')) {
      const baseName = t.replace('mega_', '').replace('_x', '').replace('_y', '');
      for (const key in PIECES) {
        const p = PIECES[key];
        if (p && (p.name.toLowerCase() === baseName.toLowerCase() || p.asset === baseName)) {
          return { type: key, ...p };
        }
      }
    }

    return null;
  },

  /**
   * Tạo nội dung mã nguồn file JavaScript riêng cho một Pokémon
   */
  generatePieceFileContent(type) {
    const t = String(type);
    const p = this.getConfig(t);
    const num = p.num || t;
    const name = p.name || `Pokemon_${t}`;
    const element = p.element || 'normal';
    const element2 = p.element2 || null;
    const asset = p.asset || t;
    const rarity = p.rarity || 'common';
    const stage = Number(p.stage) || 1;
    const nextEvo = p.nextEvo ? `'${p.nextEvo}'` : 'null';
    const evoItem = p.evoItem ? `'${p.evoItem}'` : 'null';
    const battles = p.battlesToEvolve !== undefined && p.battlesToEvolve !== null ? Number(p.battlesToEvolve) : 0;
    const value = Number(p.value) || (stage === 1 ? 5 : (stage === 2 ? 7 : 9));
    const maxHp = Number(p.maxHp) || 3;
    const damage = Number(p.damage) || 1;
    const desc = p.desc || '';
    const stepsJson = JSON.stringify(p.steps || [], null, 2);
    const slidesJson = JSON.stringify(p.slides || [], null, 2);

    const elemComment = element2 ? `${element.toUpperCase()} / ${element2.toUpperCase()}` : element.toUpperCase();

    return `// =============================================
// POKEMON #${String(num).padStart(3, '0')}: ${name.toUpperCase()} (${elemComment})
// =============================================

'use strict';

PIECES['${t}'] = {
  id: '${t}',
  num: '${num}',
  name: '${name}',
  element: '${element}',
  element2: ${element2 ? `'${element2}'` : 'null'},
  asset: '${asset}',
  rarity: '${rarity}',
  stage: ${stage},
  nextEvo: ${nextEvo},
  battlesToEvolve: ${battles},
  evoItem: ${evoItem},
  value: ${value},
  maxHp: ${maxHp},
  damage: ${damage},
  desc: ${JSON.stringify(desc)},

  steps: ${stepsJson},
  slides: ${slidesJson},

  getMoves(game, i, r, c, p, push, slide) {
    if (typeof CustomMoveSystem !== 'undefined') {
      return CustomMoveSystem.getMoves(game, i, r, c, p, push, slide);
    }
    return [];
  }
};
`;
  },

  /**
   * Tải file JS của một Pokémon về máy
   */
  downloadPieceFile(type) {
    const t = String(type);
    const content = this.generatePieceFileContent(t);
    const filename = this.getPieceFileName(t);
    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Khởi động hệ thống
CustomMoveSystem.init();

// ========================================================================
// VISUAL IN-GAME MOVE & STATS EDITOR MODAL CONTROLLER
// ========================================================================

const CustomMoveEditor = {
  currentType: '1',
  currentBrush: 'all', // 'all' | 'moveOnly' | 'captureOnly' | 'clear'
  selectedSlideDir: null, // { id, name, dr, dc, arrow } - Hướng trượt đang được chọn để pick ô trên bản đồ
  config: null,

  // Tom Select instances
  tsPokemonSelect: null,
  tsNextEvoSelect: null,
  tsCloneSelect: null,
  tsCreateNextEvo: null,

  // 8 Slide Directions
  SLIDE_DIRECTIONS: [
    { id: 'diag_tl', name: '↖ Chéo Trên Trái', dr: 1, dc: -1, arrow: '↖' },
    { id: 'fwd',     name: '⬆ Thẳng Trước',     dr: 1, dc: 0,  arrow: '⬆' },
    { id: 'diag_tr', name: '↗ Chéo Trên Phải', dr: 1, dc: 1,  arrow: '↗' },
    { id: 'left',    name: '⬅ Ngang Trái',      dr: 0, dc: -1, arrow: '⬅' },
    { id: 'right',   name: '➡ Ngang Phải',     dr: 0, dc: 1,  arrow: '➡' },
    { id: 'diag_bl', name: '↙ Chéo Dưới Trái', dr: -1, dc: -1, arrow: '↙' },
    { id: 'back',    name: '⬇ Thẳng Sau',      dr: -1, dc: 0,  arrow: '⬇' },
    { id: 'diag_br', name: '↘ Chéo Dưới Phải', dr: -1, dc: 1,  arrow: '↘' }
  ],

  /**
   * Helper khởi tạo Tom Select cho các ô chọn Pokémon với giao diện dark pixel, icon và tag
   */
  initPokemonTomSelect(selector, options, onChange) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el || typeof TomSelect === 'undefined') return null;

    if (el.tomselect) {
      try {
        el.tomselect.destroy();
      } catch (e) {
        console.warn('Error destroying existing TomSelect:', e);
      }
    }

    const defaultCfg = {
      maxOptions: 2000,
      maxItems: 1,
      create: false,
      allowEmptyOption: true,
      searchField: ['text', 'value', 'name', 'element', 'fileName'],
      sortField: [{ field: '$order' }],
      render: {
        option: (data, escape) => {
          if (!data.value) {
            return `<div class="ts-pkm-option ts-pkm-empty">${escape(data.text)}</div>`;
          }
          const iconSrc = `assets/pokemon/icons/${data.value}.png`;
          const elemBadge1 = data.element ? `<span class="ts-pkm-elem elem-${escape(data.element)}">${escape(data.element).toUpperCase()}</span>` : '';
          const elemBadge2 = data.element2 ? `<span class="ts-pkm-elem elem-${escape(data.element2)}">${escape(data.element2).toUpperCase()}</span>` : '';
          const fileBadge = data.fileName ? `<span class="ts-pkm-file">${escape(data.fileName)}</span>` : '';
          return `<div class="ts-pkm-option">
            <img src="${iconSrc}" class="ts-pkm-icon" onerror="this.src='assets/pokemon/icons/egg.png'" />
            <span class="ts-pkm-id">#${escape(data.value)}</span>
            <span class="ts-pkm-name">${escape(data.name || data.text)}</span>
            ${elemBadge1}
            ${elemBadge2}
            ${fileBadge}
          </div>`;
        },
        item: (data, escape) => {
          if (!data.value) {
            return `<div class="ts-pkm-item ts-pkm-empty">${escape(data.text)}</div>`;
          }
          const iconSrc = `assets/pokemon/icons/${data.value}.png`;
          const elemBadge1 = data.element ? `<span class="ts-pkm-elem elem-${escape(data.element)}">${escape(data.element).toUpperCase()}</span>` : '';
          const elemBadge2 = data.element2 ? `<span class="ts-pkm-elem elem-${escape(data.element2)}">${escape(data.element2).toUpperCase()}</span>` : '';
          return `<div class="ts-pkm-item">
            <img src="${iconSrc}" class="ts-pkm-icon" onerror="this.src='assets/pokemon/icons/egg.png'" />
            <span class="ts-pkm-id">#${escape(data.value)}</span>
            <span class="ts-pkm-name">${escape(data.name || data.text)}</span>
            ${elemBadge1}
            ${elemBadge2}
          </div>`;
        }
      }
    };

    const ts = new TomSelect(el, Object.assign({}, defaultCfg, options));
    if (onChange) {
      ts.on('change', onChange);
    }
    return ts;
  },

  /**
   * Khởi tạo các Tom Select cho tất cả dropdown chọn Pokémon trong Editor
   */
  initTomSelectInstances() {
    if (typeof TomSelect === 'undefined') return;

    const list = this.getPokemonList();
    const pkmOptions = list.map(p => ({
      value: String(p.type),
      text: `#${p.type} ${p.name.toUpperCase()} (${CustomMoveSystem.getPieceFileName(p.type)})`,
      name: p.name.toUpperCase(),
      element: p.element,
      element2: p.element2,
      stage: p.stage,
      rarity: p.rarity,
      fileName: CustomMoveSystem.getPieceFileName(p.type)
    }));

    const evoOptions = [
      { value: '', text: 'KHÔNG (MAX / KHÔNG TIẾN HÓA)', name: 'KHÔNG (MAX)', element: '', fileName: '' },
      ...pkmOptions
    ];

    const cloneOptions = [
      { value: '', text: '-- Chọn Pokémon mẫu --', name: '-- Chọn Pokémon mẫu --', element: '', fileName: '' },
      ...pkmOptions
    ];

    if (!this.tsPokemonSelect) {
      this.tsPokemonSelect = this.initPokemonTomSelect('#moveEditorPokemonSelect', {
        placeholder: '🔍 Tìm Pokémon (Tên, ID, Hệ)...',
        options: pkmOptions,
        items: [String(this.currentType)]
      }, async (val) => {
        if (this._isRefreshing) return; // Chặn event giả trong lúc rebuild
        if (!val || val === this.currentType) return;
        await this.loadPieceFresh(val);
      });
    }

    if (!this.tsNextEvoSelect) {
      this.tsNextEvoSelect = this.initPokemonTomSelect('#editPieceNextEvo', {
        placeholder: '🔍 Chọn dạng tiến hóa...',
        options: evoOptions,
        items: [String(this.config?.nextEvo || '')]
      }, (val) => {
        this.saveCurrentInputsToConfig();
        this.renderPieceStatsInfo();
      });
    }

    if (!this.tsCloneSelect) {
      this.tsCloneSelect = this.initPokemonTomSelect('#selectCloneFromAnyPkm', {
        placeholder: '🔍 Tìm Pokémon mẫu...',
        options: cloneOptions,
        items: ['']
      }, (val) => {
        if (!val) return;
        this.copyMovesFromPokemon(val);
        setTimeout(() => {
          if (this.tsCloneSelect) this.tsCloneSelect.setValue('', true);
        }, 100);
      });
    }

    if (!this.tsCreateNextEvo) {
      this.tsCreateNextEvo = this.initPokemonTomSelect('#createPkmNextEvo', {
        placeholder: '🔍 Dạng tiến hóa (trống nếu max)...',
        options: evoOptions,
        items: ['']
      });
    }
  },

  getPokemonList() {
    const list = [];
    const registeredKeys = (typeof ALL_PIECE_KEYS !== 'undefined' && Array.isArray(ALL_PIECE_KEYS))
      ? ALL_PIECE_KEYS
      : ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const pieceKeys = (typeof PIECES !== 'undefined') ? Object.keys(PIECES) : [];

    // Gộp tất cả key từ cả ALL_PIECE_KEYS lẫn PIECES và sắp xếp tăng dần theo ID
    const uniqueKeys = Array.from(new Set([...registeredKeys, ...pieceKeys])).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a).localeCompare(String(b));
    });

    for (const k of uniqueKeys) {
      const p = (typeof PIECES !== 'undefined' && PIECES[k]) ? PIECES[k] : CustomMoveSystem.getConfig(k);
      list.push({
        type: String(k),
        name: p?.name || `Pokemon #${k}`,
        element: p?.element || 'normal',
        element2: p?.element2 || null,
        stage: p?.stage || 1,
        rarity: p?.rarity || 'common',
        value: p?.value !== undefined ? p.value : (p?.stage === 2 ? 7 : (p?.stage === 3 ? 9 : 5)),
        maxHp: p?.maxHp !== undefined ? p.maxHp : 3,
        damage: p?.damage !== undefined ? p.damage : 1,
        battlesToEvolve: p?.battlesToEvolve,
        nextEvo: p?.nextEvo,
        desc: p?.desc || '',
        icon: p?.asset || k
      });
    }
    return list;
  },

  toggle() {
    const modal = document.getElementById('moveEditorModal');
    if (modal && !modal.classList.contains('hidden')) {
      this.close();
    } else {
      this.open(this.currentType);
    }
  },

  async open(pieceType = '1') {
    // 1. Quét và nạp ngay toàn bộ file mới nhất từ thư mục C:\Code\chess+\js\pieces\
    await CustomMoveSystem.loadAllPiecesFromDisk();

    this.currentType = String(pieceType || this.currentType || '1');
    this.config = CustomMoveSystem.getConfig(this.currentType);

    const appContainer = document.getElementById('app') || document.body;
    let modal = document.getElementById('moveEditorModal');
    if (!modal) {
      this.createModalDOM();
      modal = document.getElementById('moveEditorModal');
    } else if (modal.parentElement !== appContainer) {
      appContainer.appendChild(modal);
    }

    // Ensure sub-modal is hidden by default
    const createModal = document.getElementById('editorCreatePokemonModal');
    if (createModal) {
      createModal.classList.add('hidden');
      createModal.style.display = 'none';
    }

    // Rebuild lại danh sách Pokémon trong dropdown để cập nhật các file mới tạo
    this.refreshPokemonDropdown(true);
    this.render();

    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }

    // Nạp lại dữ liệu tươi nhất trực tiếp từ file js/pieces/*.js
    await this.loadPieceFresh(this.currentType);
  },

  /**
   * Nạp trực tiếp Pokémon từ file JS và hiển thị lên màn hình
   */
  async loadPieceFresh(type) {
    this.currentType = String(type);
    this.config = await CustomMoveSystem.reloadPieceFromFile(this.currentType);
    this.render();
    if (typeof app !== 'undefined' && app.showToast) {
      const file = CustomMoveSystem.getPieceFileName(this.currentType);
      app.showToast(`📂 Đã nạp từ file: js/pieces/${file}`, 'gold');
    }
  },

  /**
   * Chuyển nhanh sang Pokémon liền kề (offset = -1: Lùi lại, offset = 1: Tiến tới)
   */
  async navPokemon(offset) {
    const list = this.getPokemonList();
    if (!list || list.length === 0) return;
    const curIdx = list.findIndex(p => String(p.type) === String(this.currentType));
    if (curIdx === -1) return;

    let nextIdx = curIdx + offset;
    if (nextIdx < 0) nextIdx = list.length - 1;
    if (nextIdx >= list.length) nextIdx = 0;

    const target = list[nextIdx];
    if (!target) return;

    if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
    await this.loadPieceFresh(target.type);
    if (this.tsPokemonSelect) {
      this.tsPokemonSelect.setValue(String(target.type), true);
    }
  },

  close() {
    if (this.tsPokemonSelect) this.tsPokemonSelect.close();
    if (this.tsNextEvoSelect) this.tsNextEvoSelect.close();
    if (this.tsCloneSelect) this.tsCloneSelect.close();
    if (this.tsCreateNextEvo) this.tsCreateNextEvo.close();

    const modal = document.getElementById('moveEditorModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    const createModal = document.getElementById('editorCreatePokemonModal');
    if (createModal) {
      createModal.classList.add('hidden');
      createModal.style.display = 'none';
    }
  },

  setBrush(brush) {
    this.currentBrush = brush;
    document.querySelectorAll('.btn-brush').forEach(b => {
      b.classList.toggle('active', b.dataset.brush === brush);
    });
    if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
  },

  createModalDOM() {
    const pkmList = this.getPokemonList();
    const html = `
      <div class="modal-overlay hidden" id="moveEditorModal">
        <div class="modal-box move-editor-box">
          <!-- 1. Header -->
          <div class="move-editor-header">
            <div class="move-editor-title-wrap">
              <span class="modal-title move-editor-title">DEV CONSOLE: POKÉMON &amp; MOVESET EDITOR</span>
              <span class="move-editor-subtitle">
                Shortcut: <strong>Ctrl + Shift + E</strong> • Nav: <strong>[</strong> Prev / <strong>]</strong> Next • Brush: <strong>[A]</strong> Move+Attack • <strong>[S]</strong> Move Only • <strong>[D]</strong> Attack Only • <strong>[E]</strong> Clear Cell • <strong>[C]</strong> Copy Prev Stage
              </span>
            </div>
            <button class="btn-close-editor" id="btnMoveEditorClose" type="button" title="Close Editor">✕</button>
          </div>

          <!-- 2. Clean Sub-Bar: Pokemon Picker & File Actions -->
          <div class="move-editor-subbar">
            <div class="editor-pkm-picker-group">
              <label class="editor-bar-label">POKÉMON:</label>
              <select id="moveEditorPokemonSelect" class="editor-select">
                ${pkmList.map(p => `<option value="${p.type}">#${p.type} ${p.name.toUpperCase()} (${CustomMoveSystem.getPieceFileName(p.type)})</option>`).join('')}
              </select>
              <button class="btn btn-reload-file" id="btnEditorReloadFile" type="button" title="Reload fresh data from file in js/pieces/">
                🔄 RELOAD FILE
              </button>
              <button class="btn btn-new-pokemon" id="btnEditorOpenCreatePkm" type="button" title="Create new Pokémon in the game">
                ➕ NEW POKÉMON
              </button>
              <button class="btn btn-delete-pokemon" id="btnEditorDeletePiece" type="button" title="Permanently delete this Pokémon and its source file">
                🗑 DELETE
              </button>
            </div>
            <div class="editor-file-status">
              <span class="editor-file-badge" id="editorCurrentFileBadge">📁 js/pieces/charmeleon.js</span>
            </div>
          </div>

          <!-- 3. Main Workspace: 2 Balanced Columns -->
          <div class="move-editor-main">
            <!-- LEFT COLUMN: 7x7 Interactive Board & Brushes -->
            <div class="move-editor-left-col">
              <!-- Brush Pill Bar -->
              <div class="editor-brush-bar">
                <span class="editor-brush-title">BRUSH:</span>
                <div class="editor-brush-pills">
                  <button class="btn-brush active" data-brush="all" type="button" title="Move and Attack enemy pieces (Key A)">
                    <span class="brush-dot dot-all"></span> [A] MOVE + ATTACK
                  </button>
                  <button class="btn-brush" data-brush="moveOnly" type="button" title="Move into empty cells only (Key S)">
                    <span class="brush-dot dot-move"></span> [S] MOVE ONLY
                  </button>
                  <button class="btn-brush" data-brush="captureOnly" type="button" title="Attack enemy pieces only (Key D)">
                    <span class="brush-dot dot-capture"></span> [D] ATTACK ONLY
                  </button>
                  <button class="btn-brush" data-brush="clear" type="button" title="Clear moves at cell (Key E)">
                    <span class="brush-dot dot-clear"></span> [E] CLEAR CELL
                  </button>
                </div>
              </div>

              <!-- Interactive Grid Area -->
              <div class="editor-board-container">
                <div class="grid-direction-indicator indicator-top">▲ FORWARD (PLAYER ADVANCE) ▲</div>
                <div id="editorRayGuideBanner" class="editor-ray-guide-banner" style="display: none;"></div>
                <div class="move-editor-grid-wrapper">
                  <div class="grid-direction-side side-left">◀ LEFT</div>
                  <div class="move-editor-grid" id="moveEditorGrid">
                    <!-- 49 dynamic cells -->
                  </div>
                  <div class="grid-direction-side side-right">RIGHT ▶</div>
                </div>
                <div class="grid-direction-indicator indicator-bottom">▼ BACKWARD ▼</div>
              </div>

              <!-- Quick Presets -->
              <div class="editor-left-tools">
                <span class="editor-mini-label">PRESETS:</span>
                <button class="btn btn-secondary btn-mini" id="btnPresetKnight" type="button">♞ KNIGHT</button>
                <button class="btn btn-secondary btn-mini" id="btnPresetKing" type="button">👑 KING</button>
                <button class="btn btn-secondary btn-mini" id="btnPresetPawn" type="button">♟ PAWN</button>
                <button class="btn btn-danger btn-mini" id="btnEditorClearAll" type="button">🗑 CLEAR ALL</button>
              </div>
            </div>

            <!-- RIGHT COLUMN: Stats & Evolution Configuration Cards -->
            <div class="move-editor-right-col">
              <!-- CARD 1: POKEMON INFO & BATTLE STATS -->
              <div class="editor-card">
                <div class="editor-card-header">
                  <span class="editor-card-title">POKÉMON INFO &amp; STATS</span>
                  <span class="editor-card-count" id="editorMovesSummary">0 steps • 0 ray slides</span>
                </div>
                <div class="editor-card-body">
                  <!-- Row 1: Name, Primary Type, Secondary Type -->
                  <div class="editor-field-row">
                    <div class="editor-field" style="flex: 1.2;">
                      <label>POKÉMON NAME:</label>
                      <input type="text" id="editPieceName" class="editor-text-input" placeholder="Name" />
                    </div>
                    <div class="editor-field" style="flex: 1;">
                      <label>PRIMARY TYPE:</label>
                      <select id="editPieceElement" class="editor-select">
                        <option value="grass">Grass</option>
                        <option value="fire">Fire</option>
                        <option value="water">Water</option>
                        <option value="electric">Electric</option>
                        <option value="bug">Bug</option>
                        <option value="normal">Normal</option>
                        <option value="poison">Poison</option>
                        <option value="ground">Ground</option>
                        <option value="rock">Rock</option>
                        <option value="flying">Flying</option>
                        <option value="psychic">Psychic</option>
                        <option value="ice">Ice</option>
                        <option value="fighting">Fighting</option>
                        <option value="ghost">Ghost</option>
                        <option value="dragon">Dragon</option>
                        <option value="steel">Steel</option>
                        <option value="fairy">Fairy</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                    <div class="editor-field" style="flex: 1;">
                      <label>SECONDARY TYPE:</label>
                      <select id="editPieceElement2" class="editor-select">
                        <option value="">(None)</option>
                        <option value="grass">Grass</option>
                        <option value="fire">Fire</option>
                        <option value="water">Water</option>
                        <option value="electric">Electric</option>
                        <option value="bug">Bug</option>
                        <option value="normal">Normal</option>
                        <option value="poison">Poison</option>
                        <option value="ground">Ground</option>
                        <option value="rock">Rock</option>
                        <option value="flying">Flying</option>
                        <option value="psychic">Psychic</option>
                        <option value="ice">Ice</option>
                        <option value="fighting">Fighting</option>
                        <option value="ghost">Ghost</option>
                        <option value="dragon">Dragon</option>
                        <option value="steel">Steel</option>
                        <option value="fairy">Fairy</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>

                  <!-- Row 2: Stage, Rarity, Gold Value -->
                  <div class="editor-field-row">
                    <div class="editor-field" style="flex: 1;">
                      <label>EVOLUTION STAGE:</label>
                      <select id="editPieceStage" class="editor-select">
                        <option value="1">Stage 1 (Basic)</option>
                        <option value="2">Stage 2 (Middle)</option>
                        <option value="3">Stage 3 (Final)</option>
                      </select>
                    </div>
                    <div class="editor-field" style="flex: 1;">
                      <label>RARITY:</label>
                      <select id="editPieceRarity" class="editor-select">
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legend">Legend</option>
                      </select>
                    </div>
                    <div class="editor-field" style="flex: 0.8;">
                      <label>GOLD COST:</label>
                      <input type="number" id="editPieceValue" class="editor-num-input" min="0" max="999" value="5" title="Recruitment Gold Cost" />
                    </div>
                  </div>

                  <!-- Row 3: HP, ATK, Evolution Battles -->
                  <div class="editor-field-row">
                    <div class="editor-field" style="flex: 1;">
                      <label>HP (MÁU TỐI ĐA):</label>
                      <input type="number" id="editPieceHp" class="editor-num-input" min="1" max="999" value="70" />
                    </div>
                    <div class="editor-field" style="flex: 1;">
                      <label>ATK (SÁT THƯƠNG):</label>
                      <input type="number" id="editPieceDmg" class="editor-num-input" min="0" max="999" value="25" />
                    </div>
                    <div class="editor-field" style="flex: 1;">
                      <label>TRẬN TIẾN HÓA:</label>
                      <input type="number" id="editPieceEvoBattles" class="editor-num-input" min="0" max="99" value="3" />
                    </div>
                  </div>

                  <!-- Row 4: Evolves Into + Required Evo Item + Copy Button -->
                  <div class="editor-field-row" style="align-items: flex-end;">
                    <div class="editor-field" style="flex: 1.2;">
                      <label>➔ EVOLVES INTO:</label>
                      <select id="editPieceNextEvo" class="editor-select editor-evo-select">
                        <option value="">NONE (MAX FORM)</option>
                        ${pkmList.map(p => `<option value="${p.type}">#${p.type} ${p.name.toUpperCase()}</option>`).join('')}
                      </select>
                    </div>
                    <div class="editor-field" style="flex: 1.2;">
                      <label>💎 REQUIRED EVO ITEM:</label>
                      <select id="editPieceEvoItem" class="editor-select">
                        <option value="">None (Battles Fought)</option>
                        <option value="fire_stone">Fire Stone</option>
                        <option value="water_stone">Water Stone</option>
                        <option value="thunder_stone">Thunder Stone</option>
                        <option value="leaf_stone">Leaf Stone</option>
                        <option value="moon_stone">Moon Stone</option>
                        <option value="sun_stone">Sun Stone</option>
                        <option value="dusk_stone">Dusk Stone</option>
                        <option value="dawn_stone">Dawn Stone</option>
                        <option value="shiny_stone">Shiny Stone</option>
                        <option value="ice_stone">Ice Stone</option>
                        <option value="metal_coat">Metal Coat</option>
                        <option value="kings_rock">King's Rock</option>
                        <option value="dragon_scale">Dragon Scale</option>
                        <option value="up_grade">Up-Grade</option>
                        <option value="mega_bracelet">Mega Bracelet / Mega Ring</option>
                        <option value="charizardite_x">Charizardite X</option>
                        <option value="charizardite_y">Charizardite Y</option>
                        <option value="blastoisinite">Blastoisinite</option>
                        <option value="venusaurite">Venusaurite</option>
                        <option value="gengarite">Gengarite</option>
                        <option value="mewtwonite_x">Mewtwonite X</option>
                        <option value="mewtwonite_y">Mewtwonite Y</option>
                        <option value="salamencite">Salamencite</option>
                        <option value="metagrossite">Metagrossite</option>
                        <option value="aggronite">Aggronite</option>
                        <option value="scizorite">Scizorite</option>
                      </select>
                    </div>
                    <button class="btn btn-copy-prev" id="btnEditorCopyPrevEvo" type="button" title="Copy moveset from previous evolution stage (Key C)">
                      ⚡ COPY PREV [C]
                    </button>
                  </div>

                  <!-- Row 5: Skill / Passive Description -->
                  <div class="editor-field-row">
                    <div class="editor-field" style="flex: 1;">
                      <label>📝 DESCRIPTION / PASSIVE:</label>
                      <input type="text" id="editPieceDesc" class="editor-text-input" placeholder="Enter Pokémon skill description..." />
                    </div>
                  </div>
                </div>
              </div>

              <!-- CARD 2: SLIDE RAYS & CLONE PRESETS -->
              <div class="editor-card">
                <div class="editor-card-header">
                  <span class="editor-card-title">SLIDE RAYS</span>
                  <div class="editor-clone-group">
                    <span class="editor-clone-label">CLONE MOVES FROM:</span>
                    <select id="selectCloneFromAnyPkm" class="editor-select">
                      <option value="">-- Select Template Pokémon --</option>
                      ${pkmList.map(p => `<option value="${p.type}">#${p.type} ${p.name}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div class="editor-card-body">
                  <div class="slide-rays-grid" id="slideRaysContainer">
                    <!-- Rendered dynamically -->
                  </div>
                  <div id="slideRayInspectorContainer">
                    <!-- Rendered dynamically when a direction is selected -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Footer Actions -->
          <div class="move-editor-footer">
            <button class="btn btn-secondary" id="btnEditorResetDefault" type="button">↺ RESET</button>
            <button class="btn btn-delete-pokemon-footer" id="btnEditorDeletePieceFooter" type="button" title="Permanently delete this Pokémon and file">🗑 DELETE POKÉMON</button>
            <button class="btn btn-secondary" id="btnEditorCopyFile" type="button" title="Copy full JS source code">📋 COPY JS CODE</button>
            <button class="btn btn-secondary" id="btnEditorDownloadFile" type="button" title="Download standalone JS file">⬇ DOWNLOAD JS</button>
            <div style="flex: 1;"></div>
            <button class="btn btn-secondary btn-nav-pkm" id="btnEditorPrevPiece" type="button" title="Lùi lại Pokémon trước (Phím [ hoặc Alt+◀)">◀ PREV</button>
            <button class="btn btn-primary btn-gold btn-large" id="btnEditorSavePiece" type="button">
              💾 SAVE TO JS/PIECES
            </button>
            <button class="btn btn-secondary btn-nav-pkm" id="btnEditorNextPiece" type="button" title="Tiến tới Pokémon tiếp theo (Phím ] hoặc Alt+▶)">NEXT ▶</button>
          </div>
        </div>
      </div>

      <!-- Sub-Modal: Create New Pokémon Form -->
      <div class="editor-sub-overlay hidden" id="editorCreatePokemonModal" style="display: none;">
        <div class="editor-create-box">
          <div class="editor-create-header">
            <span class="editor-create-title">➕ CREATE NEW POKÉMON</span>
            <button class="btn-close-editor" id="btnCancelCreatePkm" type="button">✕</button>
          </div>
          <div class="editor-create-body">
            <div class="editor-create-row">
              <div class="editor-create-preview-wrap">
                <img id="createPkmPreviewImg" class="editor-create-preview-img" src="assets/pokemon/icons/25.png" onerror="this.src='assets/pokemon/icons/egg.png'" />
                <span class="editor-create-preview-id" id="createPkmPreviewId">#25</span>
              </div>
              <div class="editor-form-col">
                <div class="editor-form-field">
                  <label>ID / NUM:</label>
                  <input type="number" id="createPkmId" class="editor-text-input" min="1" max="999" value="25" style="width: 50px;" />
                </div>
                <div class="editor-form-field">
                  <label>NAME:</label>
                  <input type="text" id="createPkmName" class="editor-text-input" placeholder="e.g. Pikachu" value="Pikachu" />
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <div class="editor-form-field" style="flex: 1;">
                <label>PRIMARY TYPE:</label>
                <select id="createPkmElement" class="editor-select" style="flex: 1;">
                  <option value="electric">Electric</option>
                  <option value="grass">Grass</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="normal">Normal</option>
                  <option value="ice">Ice</option>
                  <option value="fighting">Fighting</option>
                  <option value="poison">Poison</option>
                  <option value="ground">Ground</option>
                  <option value="flying">Flying</option>
                  <option value="psychic">Psychic</option>
                  <option value="bug">Bug</option>
                  <option value="rock">Rock</option>
                  <option value="ghost">Ghost</option>
                  <option value="dragon">Dragon</option>
                  <option value="steel">Steel</option>
                  <option value="fairy">Fairy</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div class="editor-form-field" style="flex: 1;">
                <label>SECONDARY TYPE:</label>
                <select id="createPkmElement2" class="editor-select" style="flex: 1;">
                  <option value="">(None)</option>
                  <option value="poison">Poison</option>
                  <option value="flying">Flying</option>
                  <option value="electric">Electric</option>
                  <option value="grass">Grass</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="normal">Normal</option>
                  <option value="ice">Ice</option>
                  <option value="fighting">Fighting</option>
                  <option value="ground">Ground</option>
                  <option value="psychic">Psychic</option>
                  <option value="bug">Bug</option>
                  <option value="rock">Rock</option>
                  <option value="ghost">Ghost</option>
                  <option value="dragon">Dragon</option>
                  <option value="steel">Steel</option>
                  <option value="fairy">Fairy</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <div class="editor-form-field" style="flex: 1;">
                <label>STAGE:</label>
                <select id="createPkmStage" class="editor-select">
                  <option value="1">1 (Basic)</option>
                  <option value="2">2 (Middle)</option>
                  <option value="3">3 (Final)</option>
                </select>
              </div>
              <div class="editor-form-field" style="flex: 1;">
                <label>RARITY:</label>
                <select id="createPkmRarity" class="editor-select">
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legend">Legend</option>
                </select>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <div class="editor-form-field" style="flex: 1;">
                <label>HP:</label>
                <input type="number" id="createPkmHp" class="editor-num-input" value="70" min="1" max="999" style="width: 40px;" />
              </div>
              <div class="editor-form-field" style="flex: 1;">
                <label>ATK:</label>
                <input type="number" id="createPkmDmg" class="editor-num-input" value="25" min="0" max="999" style="width: 40px;" />
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <div class="editor-form-field" style="flex: 1;">
                <label>TRẬN ĐẤU:</label>
                <input type="number" id="createPkmEvoBattles" class="editor-num-input" value="3" min="0" max="99" style="width: 32px;" />
              </div>
              <div class="editor-form-field" style="flex: 1;">
                <label>➔ EVOLVES INTO:</label>
                <select id="createPkmNextEvo" class="editor-select" style="flex: 1;">
                  <option value="">NONE (MAX)</option>
                  ${pkmList.map(p => `<option value="${p.type}">#${p.type} ${p.name.toUpperCase()}</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="font-size: 4px; color: #70a1ff;">
              📁 File: <strong id="createPkmFilenamePreview">pikachu.js</strong>
            </div>
          </div>
          <div class="editor-create-footer">
            <button class="btn btn-secondary" id="btnCancelCreatePkm2" type="button">CANCEL</button>
            <button class="btn btn-primary btn-gold" id="btnConfirmCreatePkm" type="button">✔ CREATE &amp; EDIT MOVES</button>
          </div>
        </div>
      </div>
    `;

    const appContainer = document.getElementById('app') || document.body;
    appContainer.insertAdjacentHTML('beforeend', html);
    this.initEvents();
  },

  initEvents() {
    const modal = document.getElementById('moveEditorModal');
    if (!modal) return;

    // Close button
    const btnClose = document.getElementById('btnMoveEditorClose');
    if (btnClose) btnClose.addEventListener('click', () => this.close());

    // Nút Nạp Lại Tươi Từ File (Quét lại toàn bộ thư mục js/pieces/)
    const btnReloadFile = document.getElementById('btnEditorReloadFile');
    if (btnReloadFile) {
      btnReloadFile.addEventListener('click', async () => {
        await CustomMoveSystem.loadAllPiecesFromDisk();
        this.refreshPokemonDropdown(true);
        await this.loadPieceFresh(this.currentType);
      });
    }

    // Xử lý Xóa Vĩnh Viễn Pokémon
    const handleDeletePkm = async () => {
      const t = String(this.currentType);
      const numT = parseInt(t, 10);
      if (numT >= 1 && numT <= 9) {
        if (typeof app !== 'undefined' && app.showToast) {
          app.showToast('⚠️ Không thể xóa 9 Pokémon starter gốc (1-9)!', 'red');
        } else {
          alert('Không thể xóa 9 Pokémon starter gốc!');
        }
        return;
      }

      const pName = (typeof PIECES !== 'undefined' && PIECES[t]?.name) || `Pokemon #${t}`;
      const fName = CustomMoveSystem.getPieceFileName(t);
      const ok = confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN Pokémon #${t} ${pName.toUpperCase()} và file js/pieces/${fName} không?\n\nFile trên đĩa cứng và dữ liệu Pokémon này trong game sẽ bị xóa hoàn toàn.`);
      if (!ok) return;

      const success = await CustomMoveSystem.deletePiece(t);
      if (success) {
        if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
        if (typeof app !== 'undefined' && app.showToast) {
          app.showToast(`🗑 Đã xóa #${t} ${pName} và file js/pieces/${fName}!`, 'gold');
        }
        this.refreshPokemonDropdown(true);
        await this.loadPieceFresh('1');
      }
    };

    const btnDelete = document.getElementById('btnEditorDeletePiece');
    if (btnDelete) btnDelete.addEventListener('click', handleDeletePkm);

    const btnDeleteFooter = document.getElementById('btnEditorDeletePieceFooter');
    if (btnDeleteFooter) btnDeleteFooter.addEventListener('click', handleDeletePkm);

    // Initialize searchable Tom Select on all Pokemon selector dropdowns
    this.initTomSelectInstances();

    // Fallback native listener if TomSelect wasn't loaded
    const select = document.getElementById('moveEditorPokemonSelect');
    if (select && !this.tsPokemonSelect) {
      select.addEventListener('change', async (e) => {
        await this.loadPieceFresh(e.target.value);
      });
    }

    // Live update stats inputs
    const nameInput = document.getElementById('editPieceName');
    const elemInput = document.getElementById('editPieceElement');
    const elem2Input = document.getElementById('editPieceElement2');
    const stageInput = document.getElementById('editPieceStage');
    const rarityInput = document.getElementById('editPieceRarity');
    const valueInput = document.getElementById('editPieceValue');
    const hpInput = document.getElementById('editPieceHp');
    const dmgInput = document.getElementById('editPieceDmg');
    const evoInput = document.getElementById('editPieceEvoBattles');
    const nextEvoInput = document.getElementById('editPieceNextEvo');
    const evoItemInput = document.getElementById('editPieceEvoItem');
    const descInput = document.getElementById('editPieceDesc');

    const onStatChange = () => {
      this.saveCurrentInputsToConfig();
      this.renderPieceStatsInfo();
      const currentName = document.getElementById('editPieceName')?.value?.trim();
      const targetFileName = CustomMoveSystem.getPieceFileName(this.currentType, currentName);
      const fileBadge = document.getElementById('editorCurrentFileBadge');
      if (fileBadge) fileBadge.textContent = `📁 js/pieces/${targetFileName}`;
      const btnSavePiece = document.getElementById('btnEditorSavePiece');
      if (btnSavePiece) btnSavePiece.innerHTML = `💾 SAVE TO JS/PIECES (${targetFileName})`;
    };

    if (nameInput) nameInput.addEventListener('input', onStatChange);
    if (elemInput) elemInput.addEventListener('change', onStatChange);
    if (elem2Input) elem2Input.addEventListener('change', onStatChange);
    if (stageInput) stageInput.addEventListener('change', onStatChange);
    if (rarityInput) rarityInput.addEventListener('change', onStatChange);
    if (valueInput) valueInput.addEventListener('input', onStatChange);
    if (hpInput) hpInput.addEventListener('input', onStatChange);
    if (dmgInput) dmgInput.addEventListener('input', onStatChange);
    if (evoInput) evoInput.addEventListener('input', onStatChange);
    if (nextEvoInput && !this.tsNextEvoSelect) nextEvoInput.addEventListener('change', onStatChange);
    if (evoItemInput) evoItemInput.addEventListener('change', onStatChange);
    if (descInput) descInput.addEventListener('input', onStatChange);

    // Brush selection buttons
    const brushBtns = document.querySelectorAll('.btn-brush');
    brushBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setBrush(btn.dataset.brush);
      });
    });

    // Copy from previous evolution
    const btnCopyPrev = document.getElementById('btnEditorCopyPrevEvo');
    if (btnCopyPrev) {
      btnCopyPrev.addEventListener('click', () => {
        this.copyFromPreviousEvolution();
      });
    }

    // Clone moves from any Pokemon dropdown (fallback listener)
    const selCloneAny = document.getElementById('selectCloneFromAnyPkm');
    if (selCloneAny && !this.tsCloneSelect) {
      selCloneAny.addEventListener('change', (e) => {
        const sourceId = e.target.value;
        if (!sourceId) return;
        this.copyMovesFromPokemon(sourceId);
        e.target.value = '';
      });
    }

    // Clear all steps and slides
    const btnClearAll = document.getElementById('btnEditorClearAll');
    if (btnClearAll) {
      btnClearAll.addEventListener('click', () => {
        if (!this.config) return;
        this.config.steps = [];
        this.config.slides = [];
        CustomMoveSystem.setConfig(this.currentType, this.config);
        this.render();
        if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
      });
    }

    // Reset default
    const btnResetDefault = document.getElementById('btnEditorResetDefault');
    if (btnResetDefault) {
      btnResetDefault.addEventListener('click', async () => {
        await this.loadPieceFresh(this.currentType);
      });
    }

    // Save piece directly into js/pieces/<filename>.js
    const btnSavePiece = document.getElementById('btnEditorSavePiece');
    if (btnSavePiece) {
      btnSavePiece.addEventListener('click', () => {
        this.savePieceToDisk();
      });
    }

    // Previous Pokemon navigation
    const btnPrevPiece = document.getElementById('btnEditorPrevPiece');
    if (btnPrevPiece) {
      btnPrevPiece.addEventListener('click', () => {
        this.navPokemon(-1);
      });
    }

    // Next Pokemon navigation
    const btnNextPiece = document.getElementById('btnEditorNextPiece');
    if (btnNextPiece) {
      btnNextPiece.addEventListener('click', () => {
        this.navPokemon(1);
      });
    }

    // Download piece file
    const btnDownload = document.getElementById('btnEditorDownloadFile');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        this.saveCurrentInputsToConfig();
        CustomMoveSystem.setConfig(this.currentType, this.config);
        CustomMoveSystem.downloadPieceFile(this.currentType);
        if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
        if (typeof app !== 'undefined' && app.showToast) {
          app.showToast(`⬇ Đã tải file: ${CustomMoveSystem.getPieceFileName(this.currentType)}`, 'gold');
        }
      });
    }

    // Copy JS code
    const btnCopyFile = document.getElementById('btnEditorCopyFile');
    if (btnCopyFile) {
      btnCopyFile.addEventListener('click', () => {
        this.saveCurrentInputsToConfig();
        CustomMoveSystem.setConfig(this.currentType, this.config);
        const code = CustomMoveSystem.generatePieceFileContent(this.currentType);
        const fileName = CustomMoveSystem.getPieceFileName(this.currentType);
        navigator.clipboard.writeText(code).then(() => {
          if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
          if (typeof app !== 'undefined' && app.showToast) {
            app.showToast(`📋 Đã copy mã file ${fileName} vào Clipboard!`, 'green');
          } else {
            alert(`Đã copy mã file ${fileName}!`);
          }
        }).catch(() => {
          prompt(`Mã file ${fileName}:`, code);
        });
      });
    }



    // Presets
    const btnKnight = document.getElementById('btnPresetKnight');
    if (btnKnight) {
      btnKnight.addEventListener('click', () => {
        const mode = this.currentBrush === 'clear' ? 'all' : this.currentBrush;
        const knightSteps = [
          { dr: 2, dc: 1, mode }, { dr: 2, dc: -1, mode },
          { dr: -2, dc: 1, mode }, { dr: -2, dc: -1, mode },
          { dr: 1, dc: 2, mode }, { dr: 1, dc: -2, mode },
          { dr: -1, dc: 2, mode }, { dr: -1, dc: -2, mode }
        ];
        for (const ks of knightSteps) {
          this.setTileStep(ks.dr, ks.dc, ks.mode);
        }
        this.render();
      });
    }

    const btnKing = document.getElementById('btnPresetKing');
    if (btnKing) {
      btnKing.addEventListener('click', () => {
        const mode = this.currentBrush === 'clear' ? 'all' : this.currentBrush;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            this.setTileStep(dr, dc, mode);
          }
        }
        this.render();
      });
    }

    const btnPawn = document.getElementById('btnPresetPawn');
    if (btnPawn) {
      btnPawn.addEventListener('click', () => {
        this.setTileStep(1, 0, 'moveOnly'); // Tiến 1 chỉ đi
        this.setTileStep(1, -1, 'captureOnly'); // Chéo trái chỉ ăn
        this.setTileStep(1, 1, 'captureOnly'); // Chéo phải chỉ ăn
        this.render();
      });
    }

    // ==========================================
    // CREATE NEW POKEMON SUB-MODAL EVENTS
    // ==========================================
    const createModal = document.getElementById('editorCreatePokemonModal');
    const btnOpenCreate = document.getElementById('btnEditorOpenCreatePkm');
    const btnCloseCreate1 = document.getElementById('btnCancelCreatePkm');
    const btnCloseCreate2 = document.getElementById('btnCancelCreatePkm2');
    const btnConfirmCreate = document.getElementById('btnConfirmCreatePkm');

    const inputId = document.getElementById('createPkmId');
    const inputName = document.getElementById('createPkmName');
    const selectStage = document.getElementById('createPkmStage');
    const imgPreview = document.getElementById('createPkmPreviewImg');
    const idPreview = document.getElementById('createPkmPreviewId');
    const filenamePreview = document.getElementById('createPkmFilenamePreview');

    const updateCreatePreview = () => {
      const idVal = inputId ? inputId.value.trim() : '1';
      const nameVal = inputName ? inputName.value.trim() : '';
      if (imgPreview) imgPreview.src = `assets/pokemon/icons/${idVal}.png`;
      if (idPreview) idPreview.textContent = `#${idVal}`;
      if (filenamePreview) {
        const safe = nameVal ? nameVal.toLowerCase().replace(/[^a-z0-9]/g, '_') : idVal;
        filenamePreview.textContent = `${safe || idVal}.js`;
      }
    };

    if (inputId) inputId.addEventListener('input', updateCreatePreview);
    if (inputName) inputName.addEventListener('input', updateCreatePreview);

    if (selectStage) {
      selectStage.addEventListener('change', () => {
        const stage = parseInt(selectStage.value, 10) || 1;
        const hpInput = document.getElementById('createPkmHp');
        const dmgInput = document.getElementById('createPkmDmg');
        const evoInput = document.getElementById('createPkmEvoBattles');
        if (hpInput) hpInput.value = stage === 1 ? 3 : (stage === 2 ? 5 : 8);
        if (dmgInput) dmgInput.value = stage === 1 ? 1 : (stage === 2 ? 2 : 3);
        if (evoInput) evoInput.value = stage === 1 ? 3 : (stage === 2 ? 5 : 0);
      });
    }

    if (btnOpenCreate) {
      btnOpenCreate.addEventListener('click', () => {
        // Gợi ý ID tiếp theo
        const allKeys = Object.keys(PIECES || {}).map(Number).filter(n => !isNaN(n));
        const maxId = allKeys.length > 0 ? Math.max(...allKeys) : 9;
        if (inputId) inputId.value = maxId + 1;
        if (inputName) inputName.value = '';
        if (this.tsCreateNextEvo) this.tsCreateNextEvo.setValue('', true);
        updateCreatePreview();
        if (createModal) {
          createModal.classList.remove('hidden');
          createModal.style.display = 'flex';
        }
      });
    }

    const closeCreate = () => {
      if (this.tsCreateNextEvo) this.tsCreateNextEvo.close();
      if (createModal) {
        createModal.classList.add('hidden');
        createModal.style.display = 'none';
      }
    };
    if (btnCloseCreate1) btnCloseCreate1.addEventListener('click', closeCreate);
    if (btnCloseCreate2) btnCloseCreate2.addEventListener('click', closeCreate);
    if (createModal) {
      createModal.addEventListener('click', (e) => {
        if (e.target === createModal) closeCreate();
      });
    }

    if (btnConfirmCreate) {
      btnConfirmCreate.addEventListener('click', () => {
        this.confirmCreatePokemon();
      });
    }
  },

  /**
   * Xác nhận tạo Pokémon mới
   */
  async confirmCreatePokemon() {
    const inputId = document.getElementById('createPkmId');
    const inputName = document.getElementById('createPkmName');
    const inputElement = document.getElementById('createPkmElement');
    const inputElement2 = document.getElementById('createPkmElement2');
    const inputStage = document.getElementById('createPkmStage');
    const inputRarity = document.getElementById('createPkmRarity');
    const inputHp = document.getElementById('createPkmHp');
    const inputDmg = document.getElementById('createPkmDmg');
    const inputEvo = document.getElementById('createPkmEvoBattles');
    const inputNextEvo = document.getElementById('createPkmNextEvo');

    const id = String(inputId?.value.trim());
    if (!id) {
      alert('Vui lòng nhập ID hợp lệ!');
      return;
    }

    const name = inputName?.value.trim() || `Pokemon #${id}`;
    const stage = parseInt(inputStage?.value, 10) || 1;
    const element = inputElement?.value || 'normal';
    const element2 = inputElement2?.value || null;
    const rarity = inputRarity?.value || 'common';
    const maxHp = Math.max(1, parseInt(inputHp?.value, 10) || 3);
    const damage = Math.max(0, parseInt(inputDmg?.value, 10) || 1);
    const battlesToEvolve = Math.max(0, parseInt(inputEvo?.value, 10) || 0);
    const nextEvo = inputNextEvo?.value.trim() || null;
    const value = stage === 1 ? 5 : (stage === 2 ? 7 : 9);

    const pieceObj = {
      id: id,
      num: id,
      name: name,
      element: element,
      element2: element2,
      asset: id,
      rarity: rarity,
      stage: stage,
      value: value,
      maxHp: maxHp,
      damage: damage,
      battlesToEvolve: battlesToEvolve,
      nextEvo: nextEvo,
      desc: `${name}: Quân cờ Pokémon mới tạo.`,
      steps: [],
      slides: []
    };

    // Xác định tên file chuẩn từ tên Pokémon mới tạo (vd: "Lairon" -> "lairon.js")
    const newFileName = CustomMoveSystem.getPieceFileName(id, name);
    if (!CustomMoveSystem.fileMap) CustomMoveSystem.fileMap = {};
    CustomMoveSystem.fileMap[id] = newFileName;

    // 1. Đăng ký vào PIECES runtime
    if (typeof PIECES !== 'undefined') {
      PIECES[id] = {
        ...pieceObj,
        getMoves(game, i, r, c, piece, push, slide) {
          if (typeof CustomMoveSystem !== 'undefined') {
            return CustomMoveSystem.getMoves(game, i, r, c, piece, push, slide);
          }
          return [];
        }
      };
    }

    // 2. Thêm vào ALL_PIECE_KEYS
    if (typeof ALL_PIECE_KEYS !== 'undefined' && !ALL_PIECE_KEYS.includes(id)) {
      ALL_PIECE_KEYS.push(id);
    }

    // 3. Đăng ký cấu hình
    CustomMoveSystem.setConfig(id, pieceObj);

    // 4. Đóng modal tạo mới & chuyển sang Pokémon mới này
    const createModal = document.getElementById('editorCreatePokemonModal');
    if (createModal) {
      createModal.classList.add('hidden');
      createModal.style.display = 'none';
    }

    this.currentType = id;
    this.config = CustomMoveSystem.getConfig(id);

    // 5. Cập nhật DOM inputs TRƯỚC để các input mang thông số của Pokémon mới
    this.render();

    // 6. Lưu file vào đĩa cứng ngay lập tức
    await this.savePieceToDisk();

    // 7. Cập nhật ngay dropdown mà không cần F5/Ctrl+Shift+R
    this.refreshPokemonDropdown(true);
    if (this.tsPokemonSelect) {
      this.tsPokemonSelect.setValue(String(id), true);
    }

    if (typeof soundManager !== 'undefined') soundManager.playSfx('levelup');
    if (typeof app !== 'undefined' && app.showToast) {
      app.showToast(`🎉 Đã tạo #${id} ${name.toUpperCase()} vào js/pieces/${newFileName}! Hãy vẽ nước đi.`, 'gold');
    }
  },

  refreshPokemonDropdown(forceRebuild = false) {
    if (typeof TomSelect !== 'undefined' && !this.tsPokemonSelect) {
      this.initTomSelectInstances();
      return;
    }

    if (!forceRebuild) {
      if (this.tsPokemonSelect) {
        this.tsPokemonSelect.setValue(String(this.currentType), true);
      }
      if (this.tsNextEvoSelect) {
        this.tsNextEvoSelect.setValue(String(this.config?.nextEvo || ''), true);
      }
      return;
    }

    const list = this.getPokemonList();
    const pkmOptions = list.map(p => ({
      value: String(p.type),
      text: `#${p.type} ${p.name.toUpperCase()} (${CustomMoveSystem.getPieceFileName(p.type)})`,
      name: p.name.toUpperCase(),
      element: p.element,
      element2: p.element2,
      stage: p.stage,
      rarity: p.rarity,
      fileName: CustomMoveSystem.getPieceFileName(p.type)
    }));

    const evoOptions = [
      { value: '', text: 'KHÔNG (MAX / KHÔNG TIẾN HÓA)', name: 'KHÔNG (MAX)', element: '', fileName: '' },
      ...pkmOptions
    ];

    const cloneOptions = [
      { value: '', text: '-- Chọn Pokémon mẫu --', name: '-- Chọn Pokémon mẫu --', element: '', fileName: '' },
      ...pkmOptions
    ];

    if (this.tsPokemonSelect) {
      this._isRefreshing = true;
      try {
        this.tsPokemonSelect.clearOptions();
        this.tsPokemonSelect.addOptions(pkmOptions);
        this.tsPokemonSelect.refreshOptions(false);
        this.tsPokemonSelect.setValue(String(this.currentType), true);
      } finally {
        this._isRefreshing = false;
      }
    } else {
      const select = document.getElementById('moveEditorPokemonSelect');
      if (select) {
        select.innerHTML = list.map(p => `<option value="${p.type}">#${p.type} ${p.name.toUpperCase()} (${CustomMoveSystem.getPieceFileName(p.type)})</option>`).join('');
        select.value = this.currentType;
      }
    }

    if (this.tsNextEvoSelect) {
      const currentNext = this.config?.nextEvo || '';
      this.tsNextEvoSelect.clearOptions();
      this.tsNextEvoSelect.addOptions(evoOptions);
      this.tsNextEvoSelect.refreshOptions(false);
      this.tsNextEvoSelect.setValue(String(currentNext), true);
    } else {
      const nextSelect = document.getElementById('editPieceNextEvo');
      if (nextSelect) {
        const currentVal = nextSelect.value;
        nextSelect.innerHTML = `<option value="">KHÔNG (MAX)</option>` + list.map(p => `<option value="${p.type}">#${p.type} ${p.name.toUpperCase()}</option>`).join('');
        nextSelect.value = currentVal;
      }
    }

    if (this.tsCloneSelect) {
      this.tsCloneSelect.clearOptions();
      this.tsCloneSelect.addOptions(cloneOptions);
      this.tsCloneSelect.refreshOptions(false);
      this.tsCloneSelect.setValue('', true);
    } else {
      const cloneSelect = document.getElementById('selectCloneFromAnyPkm');
      if (cloneSelect) {
        cloneSelect.innerHTML = `<option value="">-- Chọn Pokémon mẫu --</option>` + list.map(p => `<option value="${p.type}">#${p.type} ${p.name}</option>`).join('');
      }
    }

    if (this.tsCreateNextEvo) {
      this.tsCreateNextEvo.clearOptions();
      this.tsCreateNextEvo.addOptions(evoOptions);
      this.tsCreateNextEvo.refreshOptions(false);
      this.tsCreateNextEvo.setValue('', true);
    }
  },

  /**
   * Sao chép nước đi từ dạng tiến hóa trước
   */
  copyFromPreviousEvolution() {
    const prev = CustomMoveSystem.getPreviousEvolution(this.currentType);
    if (!prev) {
      if (typeof app !== 'undefined' && app.showToast) {
        app.showToast('Pokémon này không có dạng cấp trước! Hãy chọn Pokémon mẫu ở menu bên phải.', 'gold');
      } else {
        alert('Pokémon này là cấp cơ bản, không có dạng trước.');
      }
      return;
    }

    this.copyMovesFromPokemon(prev.id || prev.type);
  },

  /**
   * Sao chép toàn bộ steps và slides từ bất kỳ Pokémon nào
   */
  copyMovesFromPokemon(sourceId) {
    const srcConfig = CustomMoveSystem.getConfig(sourceId);
    if (!srcConfig) return;

    this.saveCurrentInputsToConfig();
    this.config.steps = JSON.parse(JSON.stringify(srcConfig.steps || []));
    this.config.slides = JSON.parse(JSON.stringify(srcConfig.slides || []));
    CustomMoveSystem.setConfig(this.currentType, this.config);
    this.render();

    if (typeof soundManager !== 'undefined') soundManager.playSfx('levelup');
    if (typeof app !== 'undefined' && app.showToast) {
      app.showToast(`⚡ Đã sao chép nước đi từ #${sourceId} ${srcConfig.name}!`, 'gold');
    }
  },

  /**
   * Lưu trực tiếp vào file C:\Code\chess+\js\pieces\<filename>.js
   * Tự động ĐỔI TÊN FILE NẾU ĐỔI TÊN POKÉMON & CẬP NHẬT NGAY DROPDOWN KHÔNG CẦN F5!
   */
  async savePieceToDisk() {
    // 1. Lấy tên mới nhất từ ô input #editPieceName (nếu người dùng vừa đổi tên)
    const nameInput = document.getElementById('editPieceName');
    const targetName = nameInput ? nameInput.value.trim() : (this.config?.name || '');

    // 2. Lưu các input hiện tại vào this.config
    this.saveCurrentInputsToConfig();
    if (targetName) this.config.name = targetName;
    CustomMoveSystem.setConfig(this.currentType, this.config);

    // 3. Tính toán tên file mới dựa trên tên Pokémon hiện tại
    const newFileName = CustomMoveSystem.getPieceFileName(this.currentType, targetName);
    const oldFileName = (CustomMoveSystem.fileMap && CustomMoveSystem.fileMap[this.currentType])
      ? CustomMoveSystem.fileMap[this.currentType]
      : null;

    // 4. Nếu tên file thay đổi (Đổi tên Pokemon -> Đổi file!), xóa file cũ trên đĩa
    let renamed = false;
    if (oldFileName && oldFileName !== newFileName) {
      const isUsedByOther = (typeof PIECES !== 'undefined') &&
        Object.keys(PIECES).some(k => k !== this.currentType && CustomMoveSystem.fileMap && CustomMoveSystem.fileMap[k] === oldFileName);
      if (!isUsedByOther) {
        await CustomMoveSystem.deletePiecePhysicalFile(oldFileName);
        renamed = true;
      }
    }

    // 5. Cập nhật ánh xạ fileMap
    if (!CustomMoveSystem.fileMap) CustomMoveSystem.fileMap = {};
    CustomMoveSystem.fileMap[this.currentType] = newFileName;
    if (typeof ALL_PIECE_KEYS !== 'undefined' && !ALL_PIECE_KEYS.includes(this.currentType)) {
      ALL_PIECE_KEYS.push(this.currentType);
    }

    const content = CustomMoveSystem.generatePieceFileContent(this.currentType);
    let saved = false;

    // 6a. Nếu chạy trong Electron với IPC
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.savePieceFile === 'function') {
      try {
        const res = await window.electronAPI.savePieceFile(newFileName, content);
        if (res && res.success) {
          saved = true;
        } else {
          console.warn('IPC save failed:', res?.error);
        }
      } catch (err) {
        console.error('Electron IPC save error:', err);
      }
    }

    // 6b. Nếu chạy qua Local Dev Server (có API /api/save-piece)
    if (!saved && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/save-piece', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: newFileName, content })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            saved = true;
          }
        }
      } catch (e) {}
    }

    // 6c. File System Access API
    if (!saved && typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function') {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: newFileName,
          types: [{
            description: 'JavaScript File',
            accept: { 'application/javascript': ['.js'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        saved = true;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }

    // 6d. Dự phòng: Tải file & copy clipboard
    if (!saved) {
      CustomMoveSystem.downloadPieceFile(this.currentType, newFileName);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(content).catch(() => {});
      }
      saved = true;
    }

    // 7. CẬP NHẬT NGAY LẬP TỨC: Rebuild Dropdown và chọn đúng Pokémon này không cần F5/Ctrl+Shift+R!
    this.refreshPokemonDropdown(true);
    if (this.tsPokemonSelect) {
      this.tsPokemonSelect.setValue(String(this.currentType), true);
    }
    this.render();

    // 8. Cập nhật nhãn và thông báo
    const fileBadge = document.getElementById('editorCurrentFileBadge');
    if (fileBadge) fileBadge.textContent = `📁 js/pieces/${newFileName}`;
    const btnSavePiece = document.getElementById('btnEditorSavePiece');
    if (btnSavePiece) btnSavePiece.innerHTML = `💾 LƯU VÀO JS/PIECES (${newFileName})`;

    // 9. Đồng bộ vào game runtime
    if (typeof app !== 'undefined') {
      if (app.updateStats) app.updateStats();
      if (app.renderInventory) app.renderInventory();
      if (app.renderShop) app.renderShop();
      if (app.renderBoard) app.renderBoard();
    }

    if (typeof soundManager !== 'undefined') soundManager.playSfx('levelup');
    const toastMsg = renamed
      ? `✅ Successfully renamed! Deleted js/pieces/${oldFileName} and saved to js/pieces/${newFileName}`
      : `✅ Saved directly: js/pieces/${newFileName}`;
    if (typeof app !== 'undefined' && app.showToast) {
      app.showToast(toastMsg, 'green');
    } else {
      alert(toastMsg);
    }
  },

  saveCurrentInputsToConfig() {
    if (!this.config) return;
    const nameInput = document.getElementById('editPieceName');
    const elemInput = document.getElementById('editPieceElement');
    const elem2Input = document.getElementById('editPieceElement2');
    const stageInput = document.getElementById('editPieceStage');
    const rarityInput = document.getElementById('editPieceRarity');
    const valueInput = document.getElementById('editPieceValue');
    const hpInput = document.getElementById('editPieceHp');
    const dmgInput = document.getElementById('editPieceDmg');
    const evoInput = document.getElementById('editPieceEvoBattles');
    const nextEvoInput = document.getElementById('editPieceNextEvo');
    const evoItemInput = document.getElementById('editPieceEvoItem');
    const descInput = document.getElementById('editPieceDesc');

    if (nameInput && nameInput.value.trim()) this.config.name = nameInput.value.trim();
    if (elemInput) this.config.element = elemInput.value || 'normal';
    this.config.element2 = (elem2Input && elem2Input.value) ? elem2Input.value : null;
    if (stageInput) this.config.stage = parseInt(stageInput.value, 10) || 1;
    if (rarityInput) this.config.rarity = rarityInput.value || 'common';
    if (valueInput) this.config.value = Math.max(0, parseInt(valueInput.value, 10) || 100);
    if (hpInput) this.config.maxHp = Math.max(1, parseInt(hpInput.value, 10) || 1);
    if (dmgInput) this.config.damage = Math.max(0, parseInt(dmgInput.value, 10) || 0);
    if (evoInput) this.config.battlesToEvolve = Math.max(0, parseInt(evoInput.value, 10) || 0);
    if (nextEvoInput) this.config.nextEvo = nextEvoInput.value || null;
    if (evoItemInput) this.config.evoItem = evoItemInput.value || null;
    if (descInput) this.config.desc = descInput.value.trim();

    CustomMoveSystem.setConfig(this.currentType, this.config);
  },

  setTileStep(dr, dc, mode) {
    if (!this.config) this.config = { steps: [], slides: [] };
    if (!this.config.steps) this.config.steps = [];

    this.config.steps = this.config.steps.filter(s => !(s.dr === dr && s.dc === dc));

    if (mode && mode !== 'clear') {
      this.config.steps.push({ dr, dc, mode });
    }
    CustomMoveSystem.setConfig(this.currentType, this.config);
  },

  getTileStep(dr, dc) {
    if (!this.config || !this.config.steps) return null;
    return this.config.steps.find(s => s.dr === dr && s.dc === dc) || null;
  },

  // Lấy tia trượt có gốc tại ô (r, c)
  getSlideRayOriginAt(r, c) {
    if (!this.config || !this.config.slides) return null;
    return this.config.slides.find(s => {
      const origR = s.startDr !== undefined ? s.startDr : s.dr;
      const origC = s.startDc !== undefined ? s.startDc : s.dc;
      return origR === r && origC === c;
    }) || null;
  },

  // Lấy tia trượt đi ngang qua ô (r, c) (không tính ô gốc)
  getSlideRaysPassingThrough(r, c) {
    if (!this.config || !this.config.slides) return null;
    for (const s of this.config.slides) {
      const origR = s.startDr !== undefined ? s.startDr : s.dr;
      const origC = s.startDc !== undefined ? s.startDc : s.dc;
      if (origR === r && origC === c) continue;
      const maxSteps = s.maxSteps || 8;
      for (let k = 1; k < maxSteps; k++) {
        const curR = origR + s.dr * k;
        const curC = origC + s.dc * k;
        if (curR === r && curC === c) {
          return { ...s, step: k + 1, origR, origC };
        }
      }
    }
    return null;
  },

  // Kiểm tra ô (r, c) có nằm trên tia trượt nào không (tính cả gốc và đường bắn)
  isCellCoveredBySlide(r, c) {
    const origin = this.getSlideRayOriginAt(r, c);
    if (origin) return { ...origin, step: 1, isOrigin: true };
    return this.getSlideRaysPassingThrough(r, c);
  },

  // Tính số lượng tia theo 1 hướng
  getSlideCountForDir(dir) {
    if (!this.config || !this.config.slides) return 0;
    return this.config.slides.filter(s => s.dr === dir.dr && s.dc === dir.dc).length;
  },

  isSlideActive(dir) {
    return this.getSlideCountForDir(dir) > 0;
  },

  selectSlideDir(dir) {
    if (this.selectedSlideDir && this.selectedSlideDir.id === dir.id) {
      this.selectedSlideDir = null;
    } else {
      this.selectedSlideDir = dir;
      if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
    }
    this.render();
  },

  clearSelectedSlideDir() {
    this.selectedSlideDir = null;
    this.render();
  },

  // Tạo hoặc toggle xóa tia trượt tại ô gốc (r, c) theo hướng dir
  addOrToggleSlideRayAt(r, c, dir, mode) {
    if (!this.config) this.config = { steps: [], slides: [] };
    if (!this.config.slides) this.config.slides = [];

    const origR = (r === 0 && c === 0) ? dir.dr : r;
    const origC = (r === 0 && c === 0) ? dir.dc : c;

    const existingIdx = this.config.slides.findIndex(s => {
      const sOrigR = s.startDr !== undefined ? s.startDr : s.dr;
      const sOrigC = s.startDc !== undefined ? s.startDc : s.dc;
      return s.dr === dir.dr && s.dc === dir.dc && sOrigR === origR && sOrigC === origC;
    });

    if (mode === 'clear') {
      if (existingIdx !== -1) {
        this.config.slides.splice(existingIdx, 1);
      }
    } else {
      const useMode = (!mode || mode === 'clear') ? 'all' : mode;
      if (existingIdx !== -1) {
        if (this.config.slides[existingIdx].mode === useMode) {
          this.config.slides.splice(existingIdx, 1);
        } else {
          this.config.slides[existingIdx].mode = useMode;
        }
      } else {
        this.config.slides.push({
          dr: dir.dr,
          dc: dir.dc,
          startDr: origR,
          startDc: origC,
          mode: useMode,
          maxSteps: 8
        });
      }
    }

    CustomMoveSystem.setConfig(this.currentType, this.config);
    this.render();
  },

  removeSlideRayAtIndex(index) {
    if (!this.config || !this.config.slides) return;
    if (index >= 0 && index < this.config.slides.length) {
      this.config.slides.splice(index, 1);
      CustomMoveSystem.setConfig(this.currentType, this.config);
      this.render();
    }
  },

  removeSlideRay(dir) {
    if (!this.config || !this.config.slides) return;
    this.config.slides = this.config.slides.filter(s => !(s.dr === dir.dr && s.dc === dir.dc));
    CustomMoveSystem.setConfig(this.currentType, this.config);
    this.render();
  },

  renderPieceStatsInfo() {
    const infoBox = document.getElementById('editorPieceStatsInfo');
    if (!infoBox) return;

    const list = this.getPokemonList();
    const pData = list.find(p => p.type === this.currentType) || { type: this.currentType, name: `Pokemon #${this.currentType}` };
    const fileName = CustomMoveSystem.getPieceFileName(this.currentType);

    const nextEvoName = this.config.nextEvo
      ? (list.find(p => p.type === String(this.config.nextEvo))?.name || `#${this.config.nextEvo}`)
      : 'MAX (NONE)';

    const pName = (this.config.name || pData.name || '').toUpperCase();
    const pElem = (this.config.element || pData.element || 'normal').toUpperCase();
    const pElem2 = (this.config.element2 || pData.element2 || '').toUpperCase();
    const elemDisplay = pElem2 ? `${pElem} / ${pElem2}` : pElem;
    const pStage = this.config.stage !== undefined ? this.config.stage : (pData.stage || 1);
    const pRarity = (this.config.rarity || pData.rarity || 'common').toUpperCase();
    const pValue = this.config.value !== undefined ? this.config.value : (pData.value !== undefined ? pData.value : 5);
    const pDesc = this.config.desc || pData.desc || '';

    infoBox.innerHTML = `
      <div style="font-weight: bold; color: #fff; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between;">
        <span>#${pData.type} ${pName}</span>
        <span class="piece-filename-badge">📁 ${fileName}</span>
      </div>
      <div style="font-size: 5px; color: #ced6e0; line-height: 1.4;">
        Type: <strong style="color: #48dbfb;">${elemDisplay}</strong> |
        Stage: <strong style="color: #ff9ff3;">${pStage}</strong> |
        Rarity: <strong style="color: #1dd1a1;">${pRarity}</strong> |
        Cost: <strong style="color: #ffd700;">${pValue}g</strong><br>
        ❤️ HP: <strong style="color: #ff6b6b;">${this.config.maxHp}</strong> |
        ATK: <strong style="color: #feca57;">${this.config.damage}</strong> |
        Battles to evolve: <strong style="color: #ffd700;">${this.config.battlesToEvolve}</strong> ➔ Next Evo: <strong style="color: #70a1ff;">${nextEvoName}</strong><br>
        ${pDesc ? `<em style="color: #a4b0be;">"${pDesc}"</em>` : ''}
      </div>
      <div style="font-size: 5px; color: #a55eea; margin-top: 2px;">
        ${this.config.steps?.length || 0} step(s) • ${this.config.slides?.length || 0} slide ray(s)
      </div>
    `;

    const movesSummary = document.getElementById('editorMovesSummary');
    if (movesSummary) {
      movesSummary.textContent = `⚡ ${this.config.steps?.length || 0} step(s) • ${this.config.slides?.length || 0} slide(s)`;
    }
  },

  render() {
    if (typeof document === 'undefined') return;
    this.refreshPokemonDropdown();

    const pList = this.getPokemonList();
    const pData = pList.find(p => p.type === this.currentType) || { type: this.currentType, name: `Pokemon #${this.currentType}`, icon: this.currentType };
    const fileName = CustomMoveSystem.getPieceFileName(this.currentType);

    // Update Top Sub-Bar File Badge
    const fileBadge = document.getElementById('editorCurrentFileBadge');
    if (fileBadge) {
      fileBadge.textContent = `📁 js/pieces/${fileName}`;
    }

    // Populate all metadata & stat inputs
    const nameInput = document.getElementById('editPieceName');
    const elemInput = document.getElementById('editPieceElement');
    const elem2Input = document.getElementById('editPieceElement2');
    const stageInput = document.getElementById('editPieceStage');
    const rarityInput = document.getElementById('editPieceRarity');
    const valueInput = document.getElementById('editPieceValue');
    const hpInput = document.getElementById('editPieceHp');
    const dmgInput = document.getElementById('editPieceDmg');
    const evoInput = document.getElementById('editPieceEvoBattles');
    const nextEvoInput = document.getElementById('editPieceNextEvo');
    const descInput = document.getElementById('editPieceDesc');

    if (nameInput) nameInput.value = this.config.name !== undefined ? this.config.name : (pData.name || '');
    if (elemInput) elemInput.value = this.config.element || pData.element || 'normal';
    if (elem2Input) elem2Input.value = this.config.element2 || pData.element2 || '';
    if (stageInput) stageInput.value = String(this.config.stage !== undefined ? this.config.stage : (pData.stage || 1));
    if (rarityInput) {
      let r = this.config.rarity || pData.rarity || 'common';
      if (r === 'legendary') r = 'legend';
      rarityInput.value = r;
    }
    if (valueInput) valueInput.value = this.config.value !== undefined ? this.config.value : (pData.value !== undefined ? pData.value : (pData.stage === 2 ? 7 : (pData.stage === 3 ? 9 : 5)));
    if (hpInput) hpInput.value = this.config.maxHp !== undefined ? this.config.maxHp : (pData.maxHp || 3);
    if (dmgInput) dmgInput.value = this.config.damage !== undefined ? this.config.damage : (pData.damage || 1);
    if (evoInput) evoInput.value = this.config.battlesToEvolve !== undefined ? this.config.battlesToEvolve : (pData.battlesToEvolve !== undefined ? pData.battlesToEvolve : 3);
    if (nextEvoInput) nextEvoInput.value = this.config.nextEvo || pData.nextEvo || '';
    const evoItemInput = document.getElementById('editPieceEvoItem');
    if (evoItemInput) evoItemInput.value = this.config.evoItem || pData.evoItem || '';
    if (descInput) descInput.value = this.config.desc !== undefined ? this.config.desc : (pData.desc || '');

    // Đồng bộ giá trị vào Tom Select instances (dùng _isRefreshing để chặn onChange giả)
    this._isRefreshing = true;
    try {
      if (this.tsPokemonSelect) {
        this.tsPokemonSelect.setValue(String(this.currentType), true);
      }
      if (this.tsNextEvoSelect) {
        this.tsNextEvoSelect.setValue(String(this.config.nextEvo || pData.nextEvo || ''), true);
      }
    } finally {
      this._isRefreshing = false;
    }

    // Update Previous Evolution button label
    const prevEvo = CustomMoveSystem.getPreviousEvolution(this.currentType);
    const btnCopyPrev = document.getElementById('btnEditorCopyPrevEvo');
    if (btnCopyPrev) {
      if (prevEvo) {
        btnCopyPrev.style.display = 'inline-flex';
        btnCopyPrev.innerHTML = `⚡ COPY FROM ${prevEvo.name.toUpperCase()} [C]`;
      } else {
        btnCopyPrev.style.display = 'none';
      }
    }

    // Update Save Button Label
    const btnSavePiece = document.getElementById('btnEditorSavePiece');
    if (btnSavePiece) {
      btnSavePiece.innerHTML = `💾 SAVE TO JS/PIECES (${fileName})`;
    }

    // Update Prev / Next Buttons Tooltip & Labels
    const btnPrevPiece = document.getElementById('btnEditorPrevPiece');
    const btnNextPiece = document.getElementById('btnEditorNextPiece');
    const curPkmIdx = pList.findIndex(p => String(p.type) === String(this.currentType));
    if (curPkmIdx !== -1) {
      const prevP = pList[(curPkmIdx - 1 + pList.length) % pList.length];
      const nextP = pList[(curPkmIdx + 1) % pList.length];
      if (btnPrevPiece) {
        btnPrevPiece.title = `Lùi lại: #${prevP.type} ${prevP.name.toUpperCase()} (Phím [ hoặc Alt+◀)`;
        btnPrevPiece.innerHTML = `◀ PREV (#${prevP.type})`;
      }
      if (btnNextPiece) {
        btnNextPiece.title = `Tiến tới: #${nextP.type} ${nextP.name.toUpperCase()} (Phím ] hoặc Alt+▶)`;
        btnNextPiece.innerHTML = `NEXT (#${nextP.type}) ▶`;
      }
    }

    // Toggle nút xóa (Chỉ cho phép xóa Pokémon tự tạo, bảo vệ 9 starter 1-9)
    const numId = parseInt(this.currentType, 10);
    const isStarter = !isNaN(numId) && numId >= 1 && numId <= 9;
    const btnDelete = document.getElementById('btnEditorDeletePiece');
    const btnDeleteFooter = document.getElementById('btnEditorDeletePieceFooter');
    if (btnDelete) {
      btnDelete.style.display = isStarter ? 'none' : 'inline-flex';
    }
    if (btnDeleteFooter) {
      btnDeleteFooter.style.display = isStarter ? 'none' : 'inline-flex';
    }

    this.renderPieceStatsInfo();

    // 1. Render Banner Hướng Dẫn khi đang chọn Hướng Trượt
    const rayBanner = document.getElementById('editorRayGuideBanner');
    if (rayBanner) {
      if (this.selectedSlideDir) {
        const brushLabel = this.currentBrush === 'all' ? 'Đi + Ăn [A]' : (this.currentBrush === 'moveOnly' ? 'Chỉ Đi [S]' : (this.currentBrush === 'captureOnly' ? 'Chỉ Ăn [D]' : 'Xóa [X]'));
        rayBanner.style.display = 'flex';
        rayBanner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 7px; color: #ffd700;">${this.selectedSlideDir.arrow}</span>
            <span>HƯỚNG BẮN: <strong style="color: #ffd700;">${this.selectedSlideDir.name}</strong> • CỌ: <strong style="color: #48dbfb;">${brushLabel}</strong></span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #ced6e0; font-style: italic;">👉 Rê chuột xem vệt laser, click ô bất kỳ để đặt/tắt tia trượt dài</span>
            <button class="btn-banner-close" type="button" title="Bỏ chọn hướng / Quay lại vẽ bước">✕ XONG</button>
          </div>
        `;
        const btnCloseBanner = rayBanner.querySelector('.btn-banner-close');
        if (btnCloseBanner) {
          btnCloseBanner.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectedSlideDir = null;
            this.render();
          });
        }
      } else {
        rayBanner.style.display = 'none';
      }
    }

    // 2. Render 7x7 Grid: dr from +3 (forward) to -3 (backward), dc from -3 (left) to +3 (right)
    const gridEl = document.getElementById('moveEditorGrid');
    if (gridEl) {
      gridEl.innerHTML = '';

      for (let r = 3; r >= -3; r--) {
        for (let c = -3; c <= 3; c++) {
          const isCenter = (r === 0 && c === 0);
          const cell = document.createElement('div');
          cell.className = 'editor-cell';
          cell.dataset.r = r;
          cell.dataset.c = c;

          if (isCenter) {
            cell.classList.add('cell-center');
            const iconImg = document.createElement('img');
            iconImg.className = 'cell-center-icon';
            iconImg.src = typeof getPieceIconUrl === 'function' ? getPieceIconUrl(pData.type || pData.icon) : `assets/pokemon/icons/${pData.icon || pData.type}.png`;
            iconImg.alt = pData.name;
            iconImg.onerror = () => { iconImg.src = 'assets/pokemon/icons/egg.png'; };
            cell.appendChild(iconImg);

            const centerLbl = document.createElement('span');
            centerLbl.className = 'cell-center-label';
            centerLbl.textContent = `#${pData.type}`;
            cell.appendChild(centerLbl);
          } else {
            const step = this.getTileStep(r, c);
            const originRay = this.getSlideRayOriginAt(r, c);
            const pathRay = this.getSlideRaysPassingThrough(r, c);

            if (step) {
              cell.classList.add(`mode-${step.mode}`);
              const tag = document.createElement('span');
              tag.className = 'cell-tag';
              tag.textContent = step.mode === 'all' ? 'ALL' : (step.mode === 'moveOnly' ? 'MOVE' : 'CAP');
              cell.appendChild(tag);
            }

            if (originRay) {
              cell.classList.add('has-slide-origin', `slide-origin-${originRay.mode}`);
              const originBadge = document.createElement('span');
              originBadge.className = `slide-origin-badge mode-${originRay.mode}`;
              originBadge.title = `Gốc tia trượt bắn hướng ${this.getRayArrow(originRay.dr, originRay.dc)}`;
              originBadge.textContent = `${this.getRayArrow(originRay.dr, originRay.dc)} ∞`;
              cell.appendChild(originBadge);
            } else if (!step && pathRay) {
              cell.classList.add('mode-slide', `mode-slide-${pathRay.mode || 'all'}`);
              const arrow = document.createElement('span');
              arrow.className = 'cell-ray-arrow';
              arrow.textContent = this.getRayArrow(pathRay.dr, pathRay.dc);
              cell.appendChild(arrow);

              const badge = document.createElement('span');
              badge.className = 'cell-ray-step-badge';
              badge.textContent = `${pathRay.step}`;
              cell.appendChild(badge);
            }

            // Laser hover preview khi đang chọn 1 hướng trượt
            if (this.selectedSlideDir) {
              cell.classList.add('cell-slide-aiming-ready');
              cell.addEventListener('mouseenter', () => {
                const dir = this.selectedSlideDir;
                for (let k = 0; ; k++) {
                  const pr = r + dir.dr * k;
                  const pc = c + dir.dc * k;
                  if (Math.abs(pr) > 3 || Math.abs(pc) > 3) break;
                  const targetCell = gridEl.querySelector(`.editor-cell[data-r="${pr}"][data-c="${pc}"]`);
                  if (targetCell) {
                    targetCell.classList.add('cell-laser-preview', `laser-${this.currentBrush}`);
                    if (k === 0) targetCell.classList.add('laser-origin-preview');
                  }
                }
              });

              cell.addEventListener('mouseleave', () => {
                gridEl.querySelectorAll('.cell-laser-preview').forEach(ac => {
                  ac.classList.remove('cell-laser-preview', 'laser-all', 'laser-moveOnly', 'laser-captureOnly', 'laser-clear', 'laser-origin-preview');
                });
              });
            }

            // Click cell handler
            cell.addEventListener('click', () => {
              if (this.selectedSlideDir) {
                // Tạo hoặc toggle tia trượt dài tại ô gốc này
                this.addOrToggleSlideRayAt(r, c, this.selectedSlideDir, this.currentBrush);
                if (typeof soundManager !== 'undefined') {
                  soundManager.playSfx(this.currentBrush === 'clear' ? 'click' : 'magic');
                }
                return;
              }

              // Chế độ vẽ bước đơn bình thường khi không chọn hướng trượt
              const currentStep = this.getTileStep(r, c);
              if (this.currentBrush === 'clear') {
                this.setTileStep(r, c, 'clear');
              } else if (currentStep && currentStep.mode === this.currentBrush) {
                this.setTileStep(r, c, 'clear');
              } else {
                this.setTileStep(r, c, this.currentBrush);
              }
              if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
              this.render();
            });
          }

          gridEl.appendChild(cell);
        }
      }
    }

    // 3. Render 8 Nút Hướng Tia Trượt Dài
    const slideCont = document.getElementById('slideRaysContainer');
    if (slideCont) {
      slideCont.innerHTML = '';
      for (const dir of this.SLIDE_DIRECTIONS) {
        const count = this.getSlideCountForDir(dir);
        const isSelected = this.selectedSlideDir && this.selectedSlideDir.id === dir.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-slide-ray ${count > 0 ? 'active' : ''} ${isSelected ? 'selected-direction' : ''}`;
        const statusBadge = isSelected ? '🎯 ĐANG CHỌN' : (count > 0 ? `${count} tia • ∞` : 'OFF');

        btn.innerHTML = `
          <span>${dir.name}</span>
          <span class="slide-status-badge">${statusBadge}</span>
        `;
        btn.title = `Chọn hướng ${dir.name} rồi click vào ô bất kỳ trên bàn cờ để đặt gốc tia bắn`;
        btn.addEventListener('click', () => {
          this.selectSlideDir(dir);
        });
        slideCont.appendChild(btn);
      }
    }

    // 4. Render Inspector & Danh Sách Chi Tiết Các Tia Trượt Dài Hiện Có
    const inspectorCont = document.getElementById('slideRayInspectorContainer');
    if (inspectorCont) {
      inspectorCont.innerHTML = '';

      // Khung điều khiển hướng nếu đang chọn hướng
      if (this.selectedSlideDir) {
        const dir = this.selectedSlideDir;
        const count = this.getSlideCountForDir(dir);
        const inspectorBox = document.createElement('div');
        inspectorBox.className = 'slide-ray-inspector';
        inspectorBox.innerHTML = `
          <div class="inspector-top">
            <div class="inspector-title">
              <span class="inspector-pulse-dot"></span>
              <span>HƯỚNG BẮN: <strong style="color: #ffd700;">${dir.name}</strong> <span style="color:#2ed573;">(${count} tia)</span></span>
            </div>
            <button class="btn-inspector-close" id="btnCloseSlideInspector" type="button" title="Bỏ chọn hướng / Quay lại vẽ bước">✕ XONG</button>
          </div>
          <div class="inspector-guide">
            💡 <em>Click vào ô bất kỳ trên bàn cờ 7x7 để tạo/tắt tia trượt xuất phát từ ô đó! (Cọ hiện tại: <strong style="color: #48dbfb;">${this.currentBrush}</strong>)</em>
          </div>
        `;
        const btnClose = inspectorBox.querySelector('#btnCloseSlideInspector');
        if (btnClose) {
          btnClose.addEventListener('click', () => {
            this.selectedSlideDir = null;
            this.render();
          });
        }
        inspectorCont.appendChild(inspectorBox);
      }

      // Danh sách tất cả các tia trượt dài đã tạo của Pokémon này
      const slidesListWrap = document.createElement('div');
      slidesListWrap.className = 'slide-rays-list-wrap';
      const slides = this.config.slides || [];

      let listHtml = `
        <div class="slide-rays-list-header">
          <span style="font-weight: bold; color: #ffd700;">⚡ DANH SÁCH TIA TRƯỢT DÀI (${slides.length}):</span>
        </div>
      `;

      if (slides.length === 0) {
        listHtml += `
          <div class="slide-rays-empty-hint">
            Chưa có tia trượt dài nào. Hãy bấm 1 trong 8 hướng ở trên, sau đó click vào ô bất kỳ trên bàn cờ để bắn tia từ ô đó!
          </div>
        `;
      } else {
        listHtml += `<div class="slide-rays-list-items">`;
        slides.forEach((s, idx) => {
          const arrow = this.getRayArrow(s.dr, s.dc);
          const dirName = this.getDirName(s.dr, s.dc);
          const origR = s.startDr !== undefined ? s.startDr : s.dr;
          const origC = s.startDc !== undefined ? s.startDc : s.dc;
          const modeTag = s.mode === 'all' ? 'ALL' : (s.mode === 'moveOnly' ? 'MOVE' : 'CAP');
          const modeLabel = s.mode === 'all' ? 'Đi + Ăn' : (s.mode === 'moveOnly' ? 'Chỉ Đi' : 'Chỉ Ăn');
          const maxLabel = (s.maxSteps || 8) >= 8 ? '∞' : `${s.maxSteps}ô`;

          listHtml += `
            <div class="slide-ray-item mode-${s.mode || 'all'}">
              <span class="slide-ray-item-arrow">${arrow}</span>
              <div class="slide-ray-item-info">
                <span class="slide-ray-item-name">${dirName}</span>
                <span class="slide-ray-item-coords">Gốc: (r:${origR}, c:${origC}) • ${modeLabel} • ${maxLabel}</span>
              </div>
              <button class="btn-del-slide-ray" data-index="${idx}" type="button" title="Xóa tia trượt này">🗑</button>
            </div>
          `;
        });
        listHtml += `</div>`;
      }

      slidesListWrap.innerHTML = listHtml;

      // Gắn sự kiện xóa tia
      const delBtns = slidesListWrap.querySelectorAll('.btn-del-slide-ray');
      delBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          this.removeSlideRayAtIndex(idx);
          if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
        });
      });

      inspectorCont.appendChild(slidesListWrap);
    }
  },

  getRayArrow(dr, dc) {
    if (dr > 0 && dc < 0) return '↖';
    if (dr > 0 && dc === 0) return '⬆';
    if (dr > 0 && dc > 0) return '↗';
    if (dr === 0 && dc < 0) return '⬅';
    if (dr === 0 && dc > 0) return '➡';
    if (dr < 0 && dc < 0) return '↙';
    if (dr < 0 && dc === 0) return '⬇';
    if (dr < 0 && dc > 0) return '↘';
    return '•';
  },

  getDirName(dr, dc) {
    const found = this.SLIDE_DIRECTIONS.find(d => d.dr === dr && d.dc === dc);
    return found ? found.name : `${dr}, ${dc}`;
  }
};

// ========================================================================
// GLOBAL KEYBOARD SHORTCUTS
// ========================================================================
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    // 1. Phím tắt mở/đóng Dev Editor: Ctrl + Shift + E
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      e.stopPropagation();
      CustomMoveEditor.toggle();
      return;
    }

    // 2. Phím tắt ESC để đóng dialog hoặc bỏ chọn hướng trượt / đóng Dev Editor
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      const createModal = document.getElementById('editorCreatePokemonModal');
      if (createModal && !createModal.classList.contains('hidden') && createModal.style.display !== 'none') {
        createModal.classList.add('hidden');
        createModal.style.display = 'none';
        return;
      }
      if (CustomMoveEditor.selectedSlideDir) {
        CustomMoveEditor.selectedSlideDir = null;
        CustomMoveEditor.render();
        return;
      }
      CustomMoveEditor.close();
      return;
    }

    // 3. Phím tắt thao tác nhanh trong Editor: A, S, D, E, C
    const modal = document.getElementById('moveEditorModal');
    if (!modal || modal.classList.contains('hidden') || modal.style.display === 'none') return;

    // Không kích hoạt khi đang gõ chữ trong ô input / select / textarea
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const key = e.key.toLowerCase();
    if (key === 'a') {
      e.preventDefault();
      CustomMoveEditor.setBrush('all');
    } else if (key === 's') {
      e.preventDefault();
      CustomMoveEditor.setBrush('moveOnly');
    } else if (key === 'd') {
      e.preventDefault();
      CustomMoveEditor.setBrush('captureOnly');
    } else if (key === 'e') {
      e.preventDefault();
      CustomMoveEditor.setBrush('clear');
    } else if (key === 'c') {
      e.preventDefault();
      CustomMoveEditor.copyFromPreviousEvolution();
    } else if (key === '[' || (e.altKey && e.key === 'ArrowLeft')) {
      e.preventDefault();
      CustomMoveEditor.navPokemon(-1);
    } else if (key === ']' || (e.altKey && e.key === 'ArrowRight')) {
      e.preventDefault();
      CustomMoveEditor.navPokemon(1);
    }
  });

  window.CustomMoveSystem = CustomMoveSystem;
  window.CustomMoveEditor = CustomMoveEditor;
} else if (typeof global !== 'undefined') {
  global.CustomMoveSystem = CustomMoveSystem;
  global.CustomMoveEditor = CustomMoveEditor;
}
