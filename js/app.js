// =============================================
// CHESS+ ROGUELIKE: APPLICATION & UI CONTROLLER
// Turn-based Combat with HP & Damage
// =============================================

'use strict';

const asset = (p) => p;

class RoguelikeUI {


  finishHexBattle(winner) {
    const combat = this.hexCombat;

    if (!combat || this.hexBattleFinished) return;

    this.hexBattleFinished = true;
    this.lastMasteryAwards = window.MasterySystem?.award(this,combat) ?? [];

    console.log('Finishing Hex Battle:', winner);

    // Keep the completed combat until rewards have read its units and timer.
    this.disposeHexBattle(true);
    if (this.ensureRoguelikeState) this.ensureRoguelikeState().lastSummary = combat.getSummary();

    this.isAnimating = false;

    // Xử lý kết quả bằng hệ thống Stage gốc
    if (winner === 'w') {
      this.handleStageVictory();
    } else if (winner === 'b') {
      this.handleStageDefeat(
        'All your Pokémon have fallen in Auto Combat!'
      );
    } else {
      this.handleStageDraw();
    }
    this.renderCombatSummary?.();
  }

  disposeHexBattle(keepResult = false) {
    this.hexCombat?.stop();
    this.hexRenderer?.destroy();
    this.hexRenderer = null;
    this.hexBattlePaused = false;
    document.body.classList.remove('hex-combat-active');
    document.body.classList.remove('hex-combat-paused');
    window.HexPreparationInfo?.hide();
    if (!keepResult) {
      this.hexCombat = null;
      this.hexBattleFinished = false;
    }
  }

  syncHexBattlePause() {
    const combat = this.hexCombat;
    if (!combat || combat.battleEnded || this.phase !== 'battle') return;
    const blocked = !!document.querySelector(
      '.modal-overlay:not(.hidden), .main-menu-overlay:not(.hidden), .tutorial-overlay:not(.hidden)'
    );
    document.body.classList.toggle('hex-combat-paused', blocked);
    if (blocked && combat.running) {
      combat.stop();
      this.hexBattlePaused = true;
    } else if (!blocked && this.hexBattlePaused) {
      this.hexBattlePaused = false;
      combat.start();
    }
  }

  observeHexBattleOverlays() {
    // Observe direct class changes too (Escape and nested save/menu dialogs).
    this.hexOverlayObserver = new MutationObserver(records => {
      if (records.some(record => record.target.matches?.(
        '.modal-overlay, .main-menu-overlay, .tutorial-overlay'
      ))) this.syncHexBattlePause();
    });
    this.hexOverlayObserver.observe(document.getElementById('app'), {
      subtree: true, attributes: true, attributeFilter: ['class']
    });
  }


  constructor() {
    this.game = new ChessGame();

    // Roguelike Run State
    // Roguelike Run State: Starts with 0 gold (3 starters deployed automatically)
    this.stage = 1;
    this.runState = window.RoguelikeExpansion?.createRun();
    this.gold = 0 + (typeof MetaProgression !== 'undefined' ? MetaProgression.getBonusStartingGold() : 0);
    this.maxSlots = 3 + (window.MetaProgression?.getBonusStartingSlots() ?? 0);
    this.slotCosts = [10, 15, 20, 25, 30, 35, 45, 55, 70]; // Costs for slots 4 through 12 (max 12)
    this.slotUpgradeIndex = 0;

    // Squad: Starts with the 3 chosen starter Pokémon deployed!
    this.invNextId = 1;
    this.inventory = [];
    this.initStarterSquad();

    // Board & Selection state
    this.placedPieces = []; // { invId, type, sq }
    this.selectedInvId = null;
    this.selectedBoardSq = -1;
    this.isSetupAnimating = false;
    this.legalTargets = [];
    this.setupFormation = []; // [{ invId, type, setupSq }]

    // Turn-based Battle State
    this.pieceHP = {}; // sq -> currentHP
    this.isAnimating = false;
    this.phase = 'setup'; // 'setup' | 'battle'
    this.cardChoices = [];
    this.pokemonTab = 'bench'; // 'bench' | 'recruit'
    this.isPreviewing = false;
    this.roundMoves = 0;
    this.isAutoBattle = false;
    this.autoBattleTimer = null;

    // Sudden Death Collapse State (Sau lượt 15)
    this.shakingSquares = new Set();
    this.collapsedSquares = new Set();

    // Repetition & Move Tracking
    this.repetitionStreak = 0;
    this.repetitionStates = {};
    this.recentMoves = [];
    this.movesWithoutDamage = 0;

    // Talisman System State
    this.talismanNextId = 1;
    this.talismanInventory = [
      { id: this.talismanNextId++, talismanId: 'iron_vanguard', usesLeft: 1, maxUses: 2 }
    ];
    this.talismanChoices = [];
    this.talismanTab = 'bag'; // 'bag' | 'shop'
    this.selectedBagTalismanId = null;
    this.activeApplyingTalisman = null;

    // Save & Main Menu System State
    this.currentSaveSlot = null;
    this.isGameActive = false;

    // Toast & Custom Confirm Dialog State
    this.toastTimeout = null;
    this.pendingConfirmCallback = null;
    this.pendingCancelCallback = null;

    // Override native browser alert to route through Retro Pixel Toast
    window.alert = (msg) => {
      this.showToast(msg, 'warning');
    };

    if (typeof CustomMoveSystem !== 'undefined') {
      CustomMoveSystem.applyAllToPieces();
    }

    this.preloadAssets();
    this.buildBoardDOM();
    this.bindEvents();
    this.observeHexBattleOverlays();
    this.setupNewStage();
    this.spawnParticles();
    this.updateMainMenuState();
  }



  getEffectivePieceStats(piece, options = {}) {
    if (!piece) return { maxHp: 1, damage: 1, speed: 100, baseSpeed: 100, hasStrikeFirst: false };
    const base = PIECE_STATS[piece.type] || PIECE_STATS.P;
    const baseSpd = (typeof getPokemonBaseSpeed === 'function') ? getPokemonBaseSpeed(base) : (base.speed || 100);
    // Hex supplies class modifiers; legacy callers retain their existing stats.
    const classConfig = options.classModifiers;
    const baseHp = (base.maxHp || 1) * (classConfig?.hpMultiplier ?? 1);
    const baseDmg = (base.damage !== undefined ? base.damage : 1) * (classConfig?.damageMultiplier ?? 1);
    const includeTemporary = options.includeTemporary !== false;
    const bonusPiece = includeTemporary ? piece : { ...piece, _battleBonusAtk: 0 };
    const inventoryItem=this.inventory?.find(item=>item.id===(piece.invId??piece.id));
    const astralPiece={...piece,starterSpeciesId:piece.starterSpeciesId??inventoryItem?.starterSpeciesId};
    
    let bonusAtk = (typeof TalismanSystem !== 'undefined' && typeof TalismanSystem.getBonusAtk === 'function' ? TalismanSystem.getBonusAtk(bonusPiece) : 0) + (options.startBonusAtk ?? 0);
    let bonusHp = (typeof TalismanSystem !== 'undefined' && typeof TalismanSystem.getBonusHp === 'function' ? TalismanSystem.getBonusHp(piece) : 0);
    let bonusSpd = 0;
    const modifierBreakdown = { equipment: { hp: bonusHp, attack: bonusAtk, speed: 0 }, synergy: {}, astral: {} };
    if (typeof TalismanSystem !== 'undefined') {
      if (typeof TalismanSystem.getBonusSpeed === 'function') {
        bonusSpd += TalismanSystem.getBonusSpeed(piece);
      } else if (typeof TalismanSystem.getSpeedBonus === 'function') {
        bonusSpd += TalismanSystem.getSpeedBonus(piece);
      }
    }

    modifierBreakdown.equipment.speed = bonusSpd;
    // Strike First: +1000 SPD, but strictly in the first round (Round 1)
    const curRound = (this.battleRounds !== undefined) ? this.battleRounds : 1;
    const hasSF = piece.hasStrikeFirst || (typeof TalismanSystem !== 'undefined' && typeof TalismanSystem.hasStrikeFirst === 'function' && TalismanSystem.hasStrikeFirst(piece)) || (typeof SynergySystem !== 'undefined' && typeof SynergySystem.hasStrikeFirst === 'function' && SynergySystem.hasStrikeFirst(piece, this));
    if (includeTemporary && hasSF && curRound === 1) {
      bonusSpd += 1000;
    }

    if (typeof SynergySystem !== 'undefined') {
      modifierBreakdown.synergy = { hp: SynergySystem.getBonusHp(piece, this), attack: SynergySystem.getBonusAtk(piece, this), speed: SynergySystem.getBonusSpeed(piece, this) };
      if (typeof SynergySystem.getBonusAtk === 'function') bonusAtk += SynergySystem.getBonusAtk(piece, this);
      if (typeof SynergySystem.getBonusHp === 'function') bonusHp += SynergySystem.getBonusHp(piece, this);
      if (typeof SynergySystem.getBonusSpeed === 'function') bonusSpd += SynergySystem.getBonusSpeed(piece, this);
    }
    if (piece.color === W && typeof MetaProgression !== 'undefined') {
      const curStage = this.stage || 1;
      modifierBreakdown.astral = { hp: MetaProgression.getBonusMaxHp(astralPiece, curStage), attack: MetaProgression.getBonusDamage(astralPiece, curStage), crit: MetaProgression.getCritChanceBonus(piece) };
      bonusAtk += modifierBreakdown.astral.attack;
      bonusHp += modifierBreakdown.astral.hp;
    }
    if (classConfig && piece.color === W) {
      bonusHp += this.runState?.upgrades?.hp ?? 0;
      bonusAtk += this.runState?.upgrades?.attack ?? 0;
      bonusSpd += this.runState?.upgrades?.speed ?? 0;
    }
    if (classConfig && window.HexTraits) {
      const bonus=HexTraits.classBonus(this,piece);
      bonusHp+=bonus.hp;bonusAtk+=bonus.attack;bonusSpd+=bonus.speed;
      if(HexTraits.traitsFor(this,piece).includes('swift'))bonusSpd+=20;
    }

    // Temporary battle buffs/debuffs (e.g. Ice chill debuff)
    const temporarySpeed = (Number(piece._battleBonusSpeed) || 0) - (Number(piece._battleSpeedDebuff) || 0)
      + (hasSF && curRound === 1 ? 1000 : 0);
    if (includeTemporary) bonusSpd += (Number(piece._battleBonusSpeed) || 0) - (Number(piece._battleSpeedDebuff) || 0);

    const effSpeed = Math.max(10, baseSpd + bonusSpd);
    const championMultiplier=piece.color===W&&window.MetaProgression?.hasKeystoneChosenChampion()&&MetaProgression.getSelectedStarters().includes(astralPiece.starterSpeciesId??piece.type)?1.5:1;
    modifierBreakdown.astral.championMultiplier=championMultiplier;

    // Electric synergy speed damage bonus: e.g. 5% / 10% / 15% of Speed
    if (typeof SynergySystem !== 'undefined' && typeof SynergySystem.getSpeedDamageBonus === 'function') {
      const speedDmg = SynergySystem.getSpeedDamageBonus(piece, effSpeed, this);
      bonusAtk += speedDmg;
    }

    return {
      ...base,
      baseSpeed: baseSpd,
      speed: effSpeed,
      hasStrikeFirst: !!hasSF,
      maxHp: (baseHp + bonusHp)*championMultiplier,
      damage: Math.max(0, baseDmg + bonusAtk)*championMultiplier,
      modifierBreakdown,
      temporaryBonuses: {
        attack: Number(piece._battleBonusAtk) || 0,
        speed: temporarySpeed
      }
    };
  }

  getHexPieceStats(piece, square = -1) {
    const unit = this.phase === 'battle' ? this.hexCombat?.units.get(`hex_${square}`) : null;
    return unit
      ? { ...unit, damage: unit.attackDamage, speed: unit.pokemonSpeed }
      : HexPokemonInfo.getBattleStats(piece, square, this);
  }



  preloadAssets() {
    const assets = [
      'assets/table/shadow.png',
      'assets/table/shadow_hovered.png',
      'assets/table/b_ray.png',
      'assets/table/w_ray.png',
      'assets/table/m_ray.png',
      'assets/table/e_ray.png',
      'assets/ui/buy_button.png',
      'assets/ui/coin.png',
      'assets/ui/hp.png',
      'assets/ui/atk.png',
      'assets/ui/spd.png'
    ];
    ALL_PIECE_KEYS.forEach(k => {
      assets.push(getPieceIconUrl(k));
    });
    assets.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  // ---- Board DOM Construction ----



  buildBoardDOM() {
    const board = document.getElementById('chessBoard');
    if (!board) return;

    board.innerHTML = '';

    const hex = new HexBoard();

    const width = 36;
    const stepY = 31.5;
    const offsetX = 18;

    for (let row = 0; row < hex.rows; row++) {
      for (let col = 0; col < hex.cols; col++) {
        const sqIdx = hex.idx(row, col);
        const sq = document.createElement('div');

        sq.className = 'square ' +
          (row < 4 ? 'hex-enemy' : 'hex-player');

        sq.dataset.sq = sqIdx;
        sq.dataset.row = row;
        sq.dataset.col = col;

        sq.style.left =
          (col * width + (row % 2) * offsetX) + 'px';

        sq.style.top = (row * stepY) + 'px';

        // Keep overlay for existing UI compatibility
        const ray = document.createElement('img');
        ray.className = 'ray-overlay';
        ray.src = 'assets/table/w_ray.png';
        ray.alt = '';
        sq.appendChild(ray);

        sq.addEventListener('click', () => {
          this.onSquareClick(sqIdx);
        });

        sq.addEventListener('mouseenter', () => {
          this.onSquareHover(sqIdx);
        });

        sq.addEventListener('mouseleave', () => {
          this.onSquareLeave(sqIdx);
        });

        board.appendChild(sq);
      }
    }

    document.body.classList.add('hex-mode');
  }




  getSquareEl(idx) {
    return document.querySelector(`.square[data-sq="${idx}"]`);
  }

  // Calculate unscaled pixel delta between any two elements inside #app (bench slot <-> board square, etc.)


  getAppRelativeDelta(fromEl, toEl) {
    const app = document.getElementById('app');
    if (!app || !fromEl || !toEl) return { dx: 0, dy: 0 };
    const appRect = app.getBoundingClientRect();
    const scale = appRect.height / 320 || 1;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    return {
      dx: ((toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2)) / scale,
      dy: ((toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2)) / scale
    };
  }

  // Spawn visual land ripple and dust puff on board square


  spawnLandPuff(sq) {
    const sqEl = this.getSquareEl(sq);
    if (!sqEl) return;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('move');
    const puff = document.createElement('div');
    puff.className = 'land-puff';
    sqEl.appendChild(puff);
    setTimeout(() => {
      if (puff && puff.parentNode) puff.parentNode.removeChild(puff);
    }, 300);
  }

  // ---- Starter Trio Squad Initialization ----
  initStarterSquad() {
    const starters = (typeof MetaProgression !== 'undefined')
      ? MetaProgression.getSelectedStarters()
      : ['4', '1', '7'];
    this.inventory = starters.map(type => ({
      id: this.invNextId++,
      type: String(type),
      starterSpeciesId: String(type),
      talismans: [],
      maxTalismans: 3
    }));
  }

  // ---- Setup Stage ----


  setupNewStage() {
    this.setupRevision = (this.setupRevision || 0) + 1;
    this.isSetupAnimating = false;
    this.disposeHexBattle();
    this.resetDittoTransformations();
    if (typeof soundManager !== 'undefined') {
      soundManager.play('tavern');
    }
    this.phase = 'setup';
    this.battleRounds = 1;
    this.isAnimating = false;
    this.selectedInvId = null;
    this.selectedBoardSq = -1;
    this.legalTargets = [];
    this.pieceHP = {};
    this.roundMoves = 0;
    this.shakingSquares.clear();
    this.collapsedSquares.clear();
    if (this.game.collapsedSquares) this.game.collapsedSquares.clear();
    this.resetRepetitionTracking();

    // Clean DOM square states
    for (let i = 0; i < 56; i++) {
      const el = this.getSquareEl(i);
      if (el) {
        el.classList.remove('tile-shaking', 'tile-falling', 'tile-collapsed');
      }
    }

    // Reset board
    this.game.board.fill(null);
    this.game.turn = W;

    // Spawn AI pieces on ranks 7 & 8
    // Xoa toan bo Pokemon dich cu truoc khi xep doi hinh moi
    // Xoa Pokemon dich cu
    for (let sq = 0; sq < 28; sq++) {
      if (this.game.board[sq]?.color === 'b') {
        this.game.board[sq] = null;
      }
    }

    // Tao danh sach Pokemon dich
    // Tạo danh sách Pokémon địch
    const enemyTypes = this.getEnemyPiecesForStage(this.stage);

    // Sắp xếp đội hình
    const formation = this.getEnemyFormation(enemyTypes);

    // Lấy cấu hình Boss / Mini Boss của Stage
    const bossConfig = this.createStageBoss(this.stage);

    // Chọn Pokémon chủ lực làm Boss
    // Ưu tiên Tank, sau đó Fighter, rồi Pokémon đầu tiên
    let bossSquare = null;

    if (bossConfig && formation.length > 0) {
      const bossUnit =
        formation.find(u => u.role === 'tank') ||
        formation.find(u => u.role === 'fighter') ||
        formation[0];

      bossSquare = bossUnit.square;
    }

    // Đặt Pokémon lên bàn
    for (const unit of formation) {
      const pDef = PIECES[unit.type];

      const scaling = this.getEnemyStageScaling(this.stage);

      const piece = {
        color: B,
        type: unit.type,

        enemyStage: this.stage,
        stageHpMultiplier: scaling.hpMultiplier,
        stageAttackMultiplier: scaling.attackMultiplier,

        talismans: pDef?.defaultTalismans
          ? [...pDef.defaultTalismans]
          : [],
        maxTalismans: 3
      };

      // Gắn cấu hình Boss vào đúng một Pokémon
      if (bossConfig && unit.square === bossSquare) {
        Object.assign(piece, {
          ...bossConfig,
          bossStage: this.stage
        });
      }
      if (window.HexTraits) piece.eliteType=HexTraits.eliteFor(this.stage,unit.square,formation[0]?.square);

      this.game.board[unit.square] = piece;
    }

    console.log('[BOSS SETUP]', {
      stage: this.stage,
      encounter: this.getStageEncounter(this.stage).type,
      bossSquare,
      boss: bossSquare !== null
        ? this.game.board[bossSquare]
        : null
    });

    // Vị trí ưu tiên cho từng class trên bàn Hex 7 cột
    // Hàng 0-3 là khu vực địch

    // Restore player units to their EXACT setup positions (ranks 1 & 2)
    const homeDeploySquares = [
      52, 51, 53, 50, 54, 49, 55,
      45, 44, 46, 43, 47, 42, 48,
      38, 37, 39, 36, 40, 35, 41,
      31, 30, 32, 29, 33, 28, 34
  ];
    const restoredPlaced = [];

    if (this.setupFormation && this.setupFormation.length > 0) {
      for (const item of this.setupFormation) {
        if (restoredPlaced.length >= this.maxSlots) break;
        const invItem = this.inventory.find(inv => inv.id === item.invId);
        if (!invItem) continue;

        let targetSq = item.setupSq;
        // Verify targetSq is on player home ranks (48..63) and not already occupied
        if (
          targetSq < 28 ||
          targetSq > 55 ||
          this.game.board[targetSq]
      ) {
          targetSq = homeDeploySquares.find(s => !this.game.board[s]);
        }
        if (targetSq !== undefined) {
          const maxTalismans = invItem.maxTalismans || 3;
          this.game.board[targetSq] = { color: W, type: invItem.type, invId: invItem.id, talismans: invItem.talismans ? [...invItem.talismans] : [], maxTalismans };
          restoredPlaced.push({ invId: invItem.id, type: invItem.type, sq: targetSq, talismans: invItem.talismans ? [...invItem.talismans] : [], maxTalismans });
        }
      }
    }

    // If no units were restored (e.g. stage 1 initial load), auto-deploy up to maxSlots from bench
    if (restoredPlaced.length === 0) {
      let placedCount = 0;
      for (const item of this.inventory) {
        if (placedCount >= this.maxSlots) break;
        const targetSq = homeDeploySquares.find(s => !this.game.board[s]);
        if (targetSq !== undefined) {
          const maxTalismans = item.maxTalismans || 3;
          this.game.board[targetSq] = { color: W, type: item.type, invId: item.id, talismans: item.talismans ? [...item.talismans] : [], maxTalismans };
          restoredPlaced.push({ invId: item.id, type: item.type, sq: targetSq, talismans: item.talismans ? [...item.talismans] : [], maxTalismans });
          placedCount++;
        }
      }
    }

    this.placedPieces = restoredPlaced;
    this.saveSetupFormation();

    // Generate 3 random cards for this stage if none active
    if (!this.cardChoices || this.cardChoices.length === 0) {
      this.generateRewardCards();
    }

    if (this.talismanChoices.length === 0) {
      this.rollTalismanChoices();
    }

    this.updateStats();
    this.updateEnemyCard();
    this.renderShop();
    if (this.inventory.length === 0 && this.placedPieces.length === 0) {
      this.setPokemonTab('recruit');
    } else {
      this.setPokemonTab(this.pokemonTab || 'bench');
    }
    this.renderBoard();
    this.renderTalismans();
    this.updateTurnIndicator();
    this.updateAutoBattleUI();

    // Trigger board evolution animation for newly evolved pieces in next match
    if (this.runState?.lastVictoryStage === this.stage) {
      document.getElementById('victoryModal')?.classList.remove('hidden');
      this.renderCombatSummary?.();
    }
    if (this.runState?.pendingReward || this.runState?.pendingEvent) this.showRoguelikeChoices?.();
    if (this.pendingEvolutions?.length && this.runState?.lastVictoryStage !== this.stage) {
      const evosToPlay = [...this.pendingEvolutions];
      const revision = this.setupRevision;
      this.isSetupAnimating = true;
      this.updateTurnIndicator();
      setTimeout(() => {
        if (this.setupRevision === revision) this.playBoardEvolutionSequence(evosToPlay);
      }, 350);
    }
  }



}

(typeof window !== 'undefined' ? window : globalThis).RoguelikeUI = RoguelikeUI;

// Initialize Game when DOM ready
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('DOMContentLoaded', () => {
    window._rogueChess = window.roguelikeUI = new RoguelikeUI();
  });

  // Cheat code system: typing "g m g" or "gmg" on keyboard grants +10 Gold
  let cheatKeyBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    if (e.key === 'Escape' || e.key === 'Esc') {
      const coffeeModal = document.getElementById('coffeeDonateModal');
      const saveModal = document.getElementById('saveSlotsModal');
      const howToModal = document.getElementById('howToPlayModal');
      const inGameMenu = document.getElementById('inGameMenuModal');
      const mainMenu = document.getElementById('mainMenuOverlay');

      if (coffeeModal && !coffeeModal.classList.contains('hidden')) {
        coffeeModal.classList.add('hidden');
        return;
      }
      if (saveModal && !saveModal.classList.contains('hidden')) {
        saveModal.classList.add('hidden');
        return;
      }
      if (howToModal && !howToModal.classList.contains('hidden')) {
        howToModal.classList.add('hidden');
        return;
      }
      if (inGameMenu && !inGameMenu.classList.contains('hidden')) {
        inGameMenu.classList.add('hidden');
        return;
      }
      if (mainMenu && !mainMenu.classList.contains('hidden')) {
        return;
      }

      const ui = window._rogueChess || window.roguelikeUI;
      if (ui) ui.openInGameMenu();
      return;
    }

    cheatKeyBuffer += (e.key || '').toLowerCase();
    if (cheatKeyBuffer.length > 20) cheatKeyBuffer = cheatKeyBuffer.slice(-20);

    const normalized = cheatKeyBuffer.replace(/\s+/g, '');
    if (normalized.endsWith('gmg')) {
      cheatKeyBuffer = '';
      if (typeof window.gmg === 'function') {
        window.gmg(10);
      }
    }
  });

  window.gmg = function (amount = 10) {
    const ui = window._rogueChess || window.roguelikeUI;
    if (ui) {
      ui.gold += amount;
      ui.updateStats();
      ui.renderShop();
      ui.renderTalismans();
      ui.addLog(`💰 Cheat [g m g] activated: +${amount} Gold!`);

      const goldPill = document.querySelector('.gold-pill');
      if (goldPill) {
        goldPill.classList.remove('inv-slot-bounce');
        void goldPill.offsetWidth;
        goldPill.classList.add('inv-slot-bounce');
      }
      return `+${amount} Gold added! Total Gold: ${ui.gold}`;
    }
    return 'Game UI not ready.';
  };
  window.g_m_g = window.gmg;
}
