// =============================================
// CHESS+ ROGUELIKE: SHOP, INVENTORY & BENCH
// Recruit shop, reward cards, bench management
// Piece pricing, sell, slot upgrades, stats
// =============================================

'use strict';


// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {
  autoArrangePlayerFormation() {
    if (this.phase !== 'setup') {
      console.warn('AUTO FORM chỉ hoạt động trong setup');
      return;
    }

    const rolePriority = {
      tank: 0,
      fighter: 1,
      assassin: 2,
      mage: 3,
      marksman: 4
    };

    const roleSlots = {
      tank: [
        31, 30, 32, 29, 33, 28, 34,
        38, 37, 39, 36, 40, 35, 41
      ],

      fighter: [
        38, 37, 39, 36, 40, 35, 41,
        31, 30, 32, 29, 33, 28, 34
      ],

      assassin: [
        28, 34, 35, 41, 42, 48,
        29, 33, 36, 40
      ],

      mage: [
        45, 44, 46, 43, 47, 42, 48,
        52, 51, 53, 50, 54, 49, 55
      ],

      marksman: [
        52, 51, 53, 50, 54, 49, 55,
        45, 44, 46, 43, 47, 42, 48
      ]
    };

    const units = this.placedPieces.map(piece => ({
      ...piece,
      role: String(
        HexUnitConfig.getRole(piece.type) || 'fighter'
      ).toLowerCase()
    }));

    units.sort((a, b) =>
      (rolePriority[a.role] ?? 5) -
      (rolePriority[b.role] ?? 5)
    );

    const used = new Set();
    const newFormation = [];

    for (const unit of units) {
      const preferred = roleSlots[unit.role] || roleSlots.fighter;

      const fallback = Array.from(
        { length: 28 },
        (_, i) => i + 28
      );

      const square = [...preferred, ...fallback].find(
        sq => !used.has(sq)
      );

      if (square === undefined) continue;

      used.add(square);

      newFormation.push({
        ...unit,
        sq: square
      });
    }

    // Xóa các Pokémon hiện tại của người chơi khỏi bàn cờ
    for (let sq = 28; sq < 56; sq++) {
      if (this.game.board[sq]?.color === 'w') {
        this.game.board[sq] = null;
      }
    }

    // Đặt lại Pokémon vào các ô mới
    for (const unit of newFormation) {
      this.game.board[unit.sq] = {
        color: 'w',
        type: unit.type,
        invId: unit.invId,
        talismans: [...(unit.talismans || [])],
        maxTalismans: unit.maxTalismans ?? 3
      };
    }

    this.placedPieces = newFormation.map(unit => ({
      invId: unit.invId,
      type: unit.type,
      sq: unit.sq,
      talismans: [...(unit.talismans || [])],
      maxTalismans: unit.maxTalismans ?? 3
    }));

    this.setupFormation = newFormation.map(unit => ({
      invId: unit.invId,
      type: unit.type,
      setupSq: unit.sq
    }));

    this.renderBoard();

    console.log(
      `AUTO FORM: Đã sắp xếp ${newFormation.length} Pokémon`
    );
  },  
  getEnemyFormation(enemyTypes) {
    const rolePriority = {
      tank: 0,
      fighter: 1,
      assassin: 2,
      mage: 3,
      marksman: 4
    };

    const roleSlots = {
      tank: [
        24, 23, 25, 22, 26, 21, 27,
        17, 16, 18, 15, 19, 14, 20
      ],
      fighter: [
        23, 25, 22, 26, 24, 21, 27,
        16, 18, 15, 19, 17, 14, 20
      ],
      assassin: [
        14, 20, 15, 19, 21, 27,
        7, 13, 16, 18
      ],
      mage: [
        3, 2, 4, 1, 5, 0, 6,
        10, 9, 11, 8, 12
      ],
      marksman: [
        0, 6, 1, 5, 2, 4, 3,
        7, 13, 8, 12
      ]
    };

    const getRole = type => String(
      HexUnitConfig.getRole(type) || 'fighter'
    ).toLowerCase();

    // Lay Pokemon nguoi choi tren ban co
    const playerUnits = this.game.board
      .map((piece, square) => {
        if (!piece || piece.color !== 'w') return null;

        return {
          type: piece.type,
          square,
          role: getRole(piece.type)
        };
      })
      .filter(Boolean);

    const units = enemyTypes.map((type, index) => ({
      type,
      index,
      role: getRole(type)
    }));

    units.sort((a, b) =>
      (rolePriority[a.role] ?? 5) -
      (rolePriority[b.role] ?? 5) ||
      a.index - b.index
    );

    // Lay he cua Pokemon
    const getElements = type => {
      const piece = { type };

      if (
        typeof TypeSystem !== 'undefined' &&
        typeof TypeSystem.getEffectivePieceElements === 'function'
      ) {
        try {
          const elements =
            TypeSystem.getEffectivePieceElements(piece);

          if (Array.isArray(elements)) {
            return elements
              .filter(Boolean)
              .map(e => String(e).toLowerCase());
          }

          if (elements) {
            return [String(elements).toLowerCase()];
          }
        } catch (error) {
          console.warn('Cannot read Pokemon elements:', error);
        }
      }

      return [];
    };

    // Tinh loi the khac he
    const getTypeAdvantage = (attacker, defender) => {
      if (
        typeof TypeSystem === 'undefined' ||
        typeof TypeSystem.getEffectiveness !== 'function'
      ) {
        return 1;
      }

      const attackTypes = getElements(attacker);
      const defenseTypes = getElements(defender);

      if (!attackTypes.length || !defenseTypes.length) {
        return 1;
      }

      let bestMultiplier = 1;

      for (const attackType of attackTypes) {
        let multiplier = 1;

        for (const defenseType of defenseTypes) {
          const value = Number(
            TypeSystem.getEffectiveness(
              attackType,
              defenseType
            )
          );

          if (Number.isFinite(value)) {
            multiplier *= value;
          }
        }

        bestMultiplier = Math.max(
          bestMultiplier,
          multiplier
        );
      }

      return bestMultiplier;
    };

    // Khoang cach tren ban hex odd-r
    const hexDistance = (a, b) => {
      const toCube = sq => {
        const row = Math.floor(sq / 7);
        const col = sq % 7;

        const x = col - Math.floor(
          (row - (row & 1)) / 2
        );

        const z = row;
        const y = -x - z;

        return { x, y, z };
      };

      const p1 = toCube(a);
      const p2 = toCube(b);

      return Math.max(
        Math.abs(p1.x - p2.x),
        Math.abs(p1.y - p2.y),
        Math.abs(p1.z - p2.z)
      );
    };

    const scorePosition = (unit, square) => {
      const preferred =
        roleSlots[unit.role] || roleSlots.fighter;

      const preferredIndex = preferred.indexOf(square);

      // Diem doi hinh mac dinh
      let score = preferredIndex >= 0
        ? 100 - preferredIndex * 3
        : -30;

      const row = Math.floor(square / 7);

      // Giu vai tro class
      if (unit.role === 'tank') {
        score += row * 12;
      } else if (unit.role === 'fighter') {
        score += row * 8;
      } else if (unit.role === 'assassin') {
        score += (square % 7 === 0 ||
          square % 7 === 6) ? 20 : 0;
      } else if (
        unit.role === 'mage' ||
        unit.role === 'marksman'
      ) {
        score += (3 - row) * 12;
      }

      // Tinh diem dua tren Pokemon doi phuong
      for (const player of playerUnits) {
        const distance = hexDistance(
          square,
          player.square
        );

        const attackAdvantage = getTypeAdvantage(
          unit.type,
          player.type
        );

        const defenseAdvantage = getTypeAdvantage(
          player.type,
          unit.type
        );

        // Uu tien muc tieu co the khac he
        if (attackAdvantage > 1) {
          score += 35 / (1 + distance * 0.25);
        }

        // Tranh dung gan Pokemon khac he minh
        if (defenseAdvantage > 1) {
          score -= 30 / (1 + distance * 0.25);
        }

        // Assassin uu tien ap sat hang sau
        if (
          unit.role === 'assassin' &&
          (
            player.role === 'mage' ||
            player.role === 'marksman'
          )
        ) {
          score += 40 / (1 + distance);
        }

        // Tank uu tien chan fighter / assassin
        if (
          unit.role === 'tank' &&
          (
            player.role === 'fighter' ||
            player.role === 'assassin'
          )
        ) {
          score += 20 / (1 + distance);
        }
      }

      return score;
    };

    const used = new Set();
    const formation = [];

    for (const unit of units) {
      let bestSquare = null;
      let bestScore = -Infinity;

      for (let square = 0; square < 28; square++) {
        if (used.has(square)) continue;

        const score = scorePosition(
          unit,
          square
        );

        if (score > bestScore) {
          bestScore = score;
          bestSquare = square;
        }
      }

      if (bestSquare === null) continue;

      used.add(bestSquare);

      formation.push({
        type: unit.type,
        square: bestSquare,
        role: unit.role
      });
    }

    return formation;
  },
  getEnemyStageScaling(stage = this.stage) {
    const s = Math.max(1, Math.floor(Number(stage) || 1));

    return {
      hpMultiplier: 1 + (s - 1) * 0.06,
      attackMultiplier: 1 + (s - 1) * 0.0315
    };
  },
  getStageEncounter(stage = this.stage) {
    
    const stageNumber = Math.max(1, Math.floor(Number(stage) || 1));

    if (stageNumber % 10 === 0) {
      return {
        type: 'boss',
        rarity: 'legend',
        skillCount: 3,
        lootTier: 'legendary',
        effect: 'legendary-arrival'
      };
    }

    if (stageNumber % 5 === 0) {
      return {
        type: 'miniBoss',
        rarity: 'epic',
        skillCount: 1,
        lootTier: 'epic',
        effect: 'epic-arrival'
      };
    }

    return {
      type: 'normal',
      rarity: null,
      skillCount: 0,
      lootTier: 'normal',
      effect: null
    };
  },
  createStageBoss(stage = this.stage) {
    const encounter = this.getStageEncounter(stage);

    if (encounter.type === 'normal') {
      return null;
    }

    const isBoss = encounter.type === 'boss';

    return {
      isBoss: true,
      bossType: encounter.type,
      rarity: encounter.rarity,
      hpMultiplier: isBoss ? 3.5 : 2,
      attackMultiplier: isBoss ? 1.8 : 1.35,
      skillCount: encounter.skillCount,
      bossSkills: isBoss
        ? ['bossStrike', 'areaBlast', 'enrage']
        : ['bossStrike'],
      arrivalEffect: encounter.effect,
      lootTier: encounter.lootTier
    };
  },

  getEnemyPiecesForStage(stage) {
    if (stage <= STAGE_CONFIGS.length) {
      return [...STAGE_CONFIGS[stage - 1].pieces];
    }
    const count = Math.min(8, 4 + Math.floor((stage - 6) / 2));
    const pool = [...ALL_PIECE_KEYS];
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const randIdx = Math.floor(Math.random() * pool.length);
      enemies.push(pool[randIdx]);
    }
    return enemies;
  },

  generateRewardCards() {
    const choiceCount = 3 + (window.MetaProgression?.getExtraShopCards() ?? 0);
    // Normal Recruit Shop: Offer first-stage Pokemon by rarity weights
    const allStage1 = (typeof ALL_PIECE_KEYS !== 'undefined' ? ALL_PIECE_KEYS : Object.keys(PIECES))
      .filter(k => PIECES[k] && Number(PIECES[k].stage) === 1);
  
    if (allStage1.length === 0) {
      this.cardChoices = ['1', '4', '7'];
      return;
    }
  
    // Group candidates by rarity (common, rare, epic, legend)
    const groups = {
      common: allStage1.filter(k => (PIECES[k]?.rarity || 'common') === 'common'),
      rare: allStage1.filter(k => PIECES[k]?.rarity === 'rare'),
      epic: allStage1.filter(k => PIECES[k]?.rarity === 'epic'),
      legend: allStage1.filter(k => PIECES[k]?.rarity === 'legend' || PIECES[k]?.rarity === 'legendary')
    };
    groups.legendary = groups.legend;
  
    // Calculate rarity weights based on current stage
    // Mấy round đầu chỉ ra common, lâu lâu ra rare thôi
    let weights;
    if (this.stage <= 2) {
      weights = { common: 90, rare: 10, epic: 0, legend: 0 };
    } else if (this.stage <= 4) {
      weights = { common: 75, rare: 25, epic: 0, legend: 0 };
    } else if (this.stage <= 6) {
      weights = { common: 55, rare: 35, epic: 10, legend: 0 };
    } else if (this.stage <= 8) {
      weights = { common: 40, rare: 40, epic: 18, legend: 2 };
    } else {
      weights = { common: 25, rare: 40, epic: 25, legend: 10 };
    }
  
    const rollRarity = () => {
      const roll = Math.random() * 100;
      if (roll < weights.common && groups.common.length > 0) return 'common';
      if (roll < weights.common + weights.rare && groups.rare.length > 0) return 'rare';
      if (roll < weights.common + weights.rare + weights.epic && groups.epic.length > 0) return 'epic';
      if (groups.legend.length > 0) return 'legend';
      return groups.common.length > 0 ? 'common' : 'rare';
    };
  
    const choices = [];
    const used = new Set();
    let attempts = 0;
    while (choices.length < choiceCount && attempts < 80) {
      attempts++;
      const targetRarity = rollRarity();
      let pool = groups[targetRarity];
      if (!pool || pool.length === 0) pool = groups.common.length > 0 ? groups.common : allStage1;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick && !used.has(pick)) {
        used.add(pick);
        choices.push(pick);
      }
    }
  
    // Fallback if needed
    while (choices.length < choiceCount && allStage1.length > 0) {
      const rand = allStage1[Math.floor(Math.random() * allStage1.length)];
      if (!choices.includes(rand)) choices.push(rand);
      else if (choices.length < allStage1.length) continue;
      else choices.push(rand);
    }
  
    this.cardChoices = choices.slice(0, choiceCount);
  },
  
  // ---- Update Header & Stats ----

  updateStats() {
    const stageEl = document.getElementById('statStage');
    const goldEl = document.getElementById('statGold');
    const deployedEl = document.getElementById('statDeployed');
    const maxSlotsEl = document.getElementById('statMaxSlots');
  
    if (stageEl) stageEl.textContent = this.stage;
    if (goldEl) goldEl.textContent = this.gold;
    if (deployedEl) deployedEl.textContent = this.placedPieces.length;
    if (maxSlotsEl) maxSlotsEl.textContent = this.maxSlots;
  
    const synBadge = document.getElementById('talismanTypeBadge');
    if (synBadge && typeof SynergySystem !== 'undefined') {
      synBadge.textContent = SynergySystem.getActiveCount(this);
    }
  
    // Header Slot Button
    const btnUp = document.getElementById('btnUpgradeSlot');
    if (btnUp) {
      if (this.slotUpgradeIndex < this.slotCosts.length && this.maxSlots < 12) {
        const nextCost = this.slotCosts[this.slotUpgradeIndex];
        const nextSlot = this.maxSlots + 1;
        btnUp.innerHTML = `<img src="assets/ui/slot.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="" /> +${I18n.html('shop.slot')} ${nextSlot} (${nextCost} <img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="G" />)`;
        btnUp.disabled = this.gold < nextCost;
      } else {
        btnUp.innerHTML = `<span>⭐</span> ${I18n.html('shop.maxSlots')} (12)`;
        btnUp.disabled = true;
      }
    }
  
    // Roll Button with MetaProgression discount
    const discount = (typeof MetaProgression !== 'undefined') ? MetaProgression.getRerollDiscount() : 0;
    const rerollCost = this.getRecruitRerollCost();
    const btnReroll = document.getElementById('btnReroll');
    if (btnReroll) {
      btnReroll.innerHTML = `${I18n.html('shop.roll')} (${rerollCost} <img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="G" />)`;
      btnReroll.disabled = this.gold < rerollCost || this.phase === 'battle';
    }
  
    // Roll Talisman (3g) Button
    const btnRerollTal = document.getElementById('btnRerollTalisman');
    if (btnRerollTal) {
      btnRerollTal.disabled = this.gold < 3 || this.phase === 'battle';
    }
  
    this.updateSellButton();
  },

  updateEnemyCard() {
    const enemyConfig = (this.stage <= STAGE_CONFIGS.length)
      ? STAGE_CONFIGS[this.stage - 1]
      : { name: `Shadow Army ${this.stage}`, pieces: this.getEnemyPiecesForStage(this.stage) };
  
    const nameEl = document.getElementById('enemyName');
    const unitsEl = document.getElementById('enemyUnits');
    const counterEl = document.getElementById('enemyCounter');
    const hpBar = document.getElementById('enemyHpBar');
  
    if (nameEl) nameEl.textContent = t('shop.stage',{stage:this.stage});
  
    const pieceCounts = {};
    for (const p of enemyConfig.pieces) {
      pieceCounts[p] = (pieceCounts[p] || 0) + 1;
    }
    const unitStrs = Object.entries(pieceCounts).map(([type, cnt]) => `${cnt} ${PIECE_NAMES[type]}`);
    if (unitsEl) unitsEl.textContent = `Army: ${unitStrs.join(', ')}`;
  
    // Count alive enemy pieces
    let currentEnemyAlive = 0;
    for (let i = 0; i < 64; i++) {
      if (this.game.board[i] && this.game.board[i].color === B) currentEnemyAlive++;
    }
    if (counterEl) counterEl.textContent = `${currentEnemyAlive} / ${enemyConfig.pieces.length} units`;
    if (hpBar) {
      const pct = enemyConfig.pieces.length > 0 ? (currentEnemyAlive / enemyConfig.pieces.length) * 100 : 0;
      hpBar.style.width = `${pct}%`;
    }
  },
  
  // ---- Live Piece Movement Preview in Center of Board ----

  rerollCards() {
    if (this.phase === 'battle') {
      alert('Cannot reroll pieces during battle! Finish the battle first.');
      return;
    }
    const discount = (typeof MetaProgression !== 'undefined') ? MetaProgression.getRerollDiscount() : 0;
    const astralFree = window.MetaProgression?.hasFreeRerollPerStage() && this.runState?.astralRerollStage !== this.stage;
    const rerollCost = this.getRecruitRerollCost();
    if (this.gold < rerollCost) {
      alert(`You need at least ${rerollCost} Gold to reroll recruitment cards!`);
      return;
    }
    this.gold -= rerollCost;
    if (astralFree) this.ensureRoguelikeState().astralRerollStage = this.stage;
    else if (rerollCost === 0) this.runState.freeRerolls--;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
    this.hasRerolledStarter = true;
    this.generateRewardCards();
    this.renderShop();
    this.updateStats();
    this.addLog(`Rerolled piece recruitment cards for ${rerollCost}g.`);
    this.saveRoguelikeProgress?.();
  },
  
  // ---- Piece Pricing by Rarity: Initial Starter Pick is FREE, then costs gold by rarity ----

  getPiecePrice(type) {
    const info = PIECE_INFO[type];
    const rarity = info?.rarity || 'common';
    const prices = {
      common: 3,
      rare: 5,
      epic: 8,
      legend: 12,
      legendary: 12
    };
    return Math.max(1, (prices[rarity] || 5) - (window.MetaProgression?.hasNode('w_keystone') ? 1 : 0));
  },

  getRecruitRerollCost() {
    if (this.runState?.freeRerolls > 0 || (window.MetaProgression?.hasFreeRerollPerStage() && this.runState?.astralRerollStage !== this.stage)) return 0;
    return Math.max(1, 5 - (window.MetaProgression?.getRerollDiscount() ?? 0));
  },
  
  // ---- Piece Sell Price by Rarity (~60-70% refund) ----

  getPieceSellPrice(type) {
    const info = PIECE_INFO[type];
    const rarity = info?.rarity || 'common';
    const sellPrices = {
      common: 2,
      rare: 3,
      epic: 5,
      legend: 8,
      legendary: 8
    };
    return sellPrices[rarity] || 2;
  },
  
  // ---- Update Sell Button state & label dynamically ----

  updateSellButton() {
    const btnSell = document.getElementById('btnSell');
    if (!btnSell) return;
  
    if (this.phase === 'battle') {
      btnSell.disabled = true;
      btnSell.innerHTML = 'SELL';
      btnSell.title = 'Cannot sell pieces during battle';
      return;
    }
  
    const selectedPiece = this.getSelectedPiece();
    if (selectedPiece && selectedPiece.type) {
      const sellPrice = this.getPieceSellPrice(selectedPiece.type);
      const pieceName = PIECE_NAMES[selectedPiece.type] || 'Piece';
      btnSell.disabled = false;
      btnSell.innerHTML = `SELL +${sellPrice}<img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="G" />`;
      btnSell.title = `Sell selected ${pieceName} for ${sellPrice} Gold`;
    } else {
      btnSell.disabled = true;
      btnSell.innerHTML = 'SELL';
      btnSell.title = 'Select a piece from your bench or board to sell';
    }
  },
  
  // ---- Sell Selected Piece (Refunds gold & removes piece) ----

  sellSelectedPiece() {
    if (this.phase === 'battle') {
      alert('Cannot sell pieces during battle!');
      return;
    }
  
    const selectedPiece = this.getSelectedPiece();
    if (!selectedPiece) {
      alert('Please select a piece from your bench or board to sell!');
      return;
    }
  
    if (this.inventory.length <= 1) {
      this.showConfirm('This is your last remaining piece! Are you sure you want to sell it?', () => {
        this.executeSellPiece(selectedPiece);
      });
      return;
    }
  
    this.executeSellPiece(selectedPiece);
  },

  executeSellPiece(selectedPiece) {
    const type = selectedPiece.type;
    const sellPrice = this.getPieceSellPrice(type);
    const pieceName = PIECE_NAMES[type] || 'Piece';
  
    // 1. If piece is selected from bench
    if (this.selectedInvId) {
      const invId = this.selectedInvId;
      this.inventory = this.inventory.filter(i => i.id !== invId);
  
      const placedIdx = this.placedPieces.findIndex(p => p.invId === invId);
      if (placedIdx !== -1) {
        const sq = this.placedPieces[placedIdx].sq;
        this.game.board[sq] = null;
        this.placedPieces.splice(placedIdx, 1);
        this.removePieceDOM(sq);
      }
      this.setupFormation = this.setupFormation.filter(f => f.invId !== invId);
    }
    // 2. If piece is selected from board
    else if (this.selectedBoardSq !== -1) {
      const sq = this.selectedBoardSq;
      const boardPiece = this.game.board[sq];
      const invId = boardPiece?.invId;
  
      this.game.board[sq] = null;
      this.removePieceDOM(sq);
      this.placedPieces = this.placedPieces.filter(p => p.sq !== sq);
  
      if (invId) {
        this.inventory = this.inventory.filter(i => i.id !== invId);
        this.setupFormation = this.setupFormation.filter(f => f.invId !== invId);
      }
    }
  
    // Reward gold and sound
    this.gold += sellPrice;
    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('coin');
    }
  
    this.addLog(`Sold ${pieceName} for +${sellPrice}g.`);
  
    // Reset selection state
    this.selectedInvId = null;
    this.selectedBoardSq = -1;
    this.legalTargets = [];
  
    this.saveSetupFormation();
    this.renderInventory();
    this.renderBoard();
    this.renderShop();
    this.renderTalismans();
    this.updateStats();
    this.updateSellButton();
  },
  
  // ---- Render Recruit Choices in Right Panel ----

  renderShop() {
    const grid = document.getElementById('rewardCardsGrid');
    if (!grid) return;
    grid.innerHTML = '';
  
    const subtitle = document.getElementById('marketSubtitle');
  
    if (this.phase === 'battle') {
      if (subtitle) subtitle.textContent = t('shop.lockedBattle');
      grid.innerHTML = `<div class="recruit-locked-msg">Finish battle to recruit units!</div>`;
      return;
    }
  
    if (!this.cardChoices || this.cardChoices.length === 0) {
      if (subtitle) subtitle.textContent = t('shop.recruited');
      grid.innerHTML = `
        <div class="recruit-picked-msg">
          <span>Unit Added To Bench!</span>
          Click Roll (5g) above to recruit extra units.
        </div>
      `;
      return;
    }
  
    if (subtitle) {
      if (this.inventory.length === 0 && this.placedPieces.length === 0) {
        subtitle.textContent = t('shop.starterPrompt');
      } else {
        subtitle.textContent = t('shop.recruitPrompt');
      }
    }
  
    for (const type of this.cardChoices) {
      const info = PIECE_INFO[type];
      const st = this.getHexPieceStats({ type, color: W, talismans: [] });
      const price = this.getPiecePrice(type);
      const isFree = price === 0;
      const canAfford = this.gold >= price;
  
      const card = document.createElement('div');
      card.className = `reward-card ${!canAfford ? 'cant-afford' : ''}`;
  
      const rarityKey = (info.rarity === 'legendary' || info.rarity === 'legend') ? 'legend' : (info.rarity || 'common');
      const rarityLabel = rarityKey.toUpperCase();
      const typeStr = info.element2 ? `${info.element.toUpperCase()}/${info.element2.toUpperCase()}` : (info.element || 'NORMAL').toUpperCase();
      card.title = `${info.name} [${typeStr}] (${rarityLabel})\nHP: ${st.maxHp} | ATK: ${st.damage}\nAttack element depends on Hex position\nCost: ${isFree ? 'FREE' : price + 'g'}`;
  
      card.innerHTML = `
        <div class="reward-card-img-wrap">
          <img src="${getPieceIconUrl(type)}" class="reward-card-img" alt="${info.name}" />
        </div>
        <div class="reward-card-info">
          <div class="card-name">${info.name.toUpperCase()}</div>
          <div class="card-rarity rarity-${rarityKey}">
            <span>${rarityLabel}</span>
            ${typeof TypeSystem !== 'undefined' ? TypeSystem.renderPieceBadgesHtml(info, 'card-type-badge') : ''}
          </div>
          <div class="card-stats">
            <span class="stat-badge stat-heart"><img src="assets/ui/hp.png?v=${ASSET_VERSION}" class="ui-icon-micro" alt="HP" /><span>${st.maxHp}</span></span>
            <span class="stat-badge stat-atk"><img src="assets/ui/atk.png?v=${ASSET_VERSION}" class="ui-icon-micro" alt="ATK" /><span>${st.damage}</span></span>
            <span class="stat-badge stat-spd" title="Combat Speed"><img src="assets/ui/spd.png?v=${ASSET_VERSION}" class="ui-icon-micro" alt="SPD" /><span>${st.speed}</span></span>
          </div>
        </div>
        <button class="btn-pick-card ${isFree ? 'btn-free' : ''}" type="button" ${!canAfford ? 'disabled' : ''}>
          ${isFree ? 'FREE' : `${price} <img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="G" />`}
        </button>
      `;
  
      card.addEventListener('mouseenter', () => this.previewPieceMoves(type));
      card.addEventListener('mouseleave', () => this.clearPreview());
  
      const buyAction = () => {
        if (!canAfford) {
          this.addLog(`Not enough gold! Need ${price}g to recruit ${info.name}.`);
          return;
        }
        this.clearPreview();
        this.pickRewardPiece(type, price);
      };
  
      const pickBtn = card.querySelector('.btn-pick-card');
      if (pickBtn) {
        pickBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          buyAction();
        });
      }
      card.addEventListener('click', () => {
        buyAction();
      });
  
      grid.appendChild(card);
    }
  },

  pickRewardPiece(type, price = 0) {
    if (this.gold < price) {
      alert(`You need at least ${price} Gold to recruit this piece!`);
      return;
    }
  
    this.gold -= price;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
    const pDef = PIECES[type];
    const defaultTalismans = (pDef && pDef.defaultTalismans) ? [...pDef.defaultTalismans] : [];
    const newItem = { id: this.invNextId++, type: type, battlesFought: 0, talismans: defaultTalismans, maxTalismans: 3 };
    this.inventory.push(newItem);
    this.cardChoices = [];
  
    if (price === 0) {
      this.addLog(`Recruited ${PIECE_NAMES[type]} to bench (FREE)!`);
    } else {
      this.addLog(`Bought ${PIECE_NAMES[type]} for ${price}g!`);
      // Track purchases across runs for Starter unlock (Common: 3x, Rare: 5x, Epic: 8x)
      if (typeof MetaProgression !== 'undefined') {
        const unlockRes = MetaProgression.recordPokemonPurchase(type);
        if (unlockRes && unlockRes.justUnlocked) {
          const pName = PIECE_NAMES[type] || `Pokemon #${type}`;
          this.addLog(`NEW STARTER UNLOCKED: ${pName}!`);
          if (this.showToast) {
            this.showToast(`New starter unlocked: ${pName}!`, 'gold');
          }
        }
      }
    }
  
    this.renderShop();
    this.renderInventory();
    this.updateStats();
    this.setPokemonTab('bench');
  
    const newSlot = document.querySelector(`.inv-slot[data-inv-id="${newItem.id}"]`);
    if (newSlot) {
      newSlot.classList.add('inv-slot-bounce');
      setTimeout(() => newSlot.classList.remove('inv-slot-bounce'), 300);
    }
  },
  
  // ---- Buy Slot Capacity Upgrade ----

  buySlotUpgrade() {
    if (this.slotUpgradeIndex >= this.slotCosts.length || this.maxSlots >= 12) return;
    const cost = this.slotCosts[this.slotUpgradeIndex];
    if (this.gold < cost) return;
  
    this.gold -= cost;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
    this.maxSlots++;
    this.slotUpgradeIndex++;
  
    this.updateStats();
    this.renderInventory();
    this.renderBoard();
    this.renderShop();
  },
  
  // ---- Pokemon Panel Tabs: Bench (Kho) vs Recruit (Shop) ----

  setPokemonTab(tab) {
    this.pokemonTab = tab;
    const tabBench = document.getElementById('tabPokemonBench');
    const tabRecruit = document.getElementById('tabPokemonRecruit');
    if (tabBench) tabBench.classList.toggle('active', tab === 'bench');
    if (tabRecruit) tabRecruit.classList.toggle('active', tab === 'recruit');
  
    const invSlots = document.getElementById('inventorySlots');
    const recruitGrid = document.getElementById('rewardCardsGrid');
    if (invSlots) invSlots.classList.toggle('hidden', tab !== 'bench');
    if (recruitGrid) recruitGrid.classList.toggle('hidden', tab !== 'recruit');
  
    const btnSell = document.getElementById('btnSell');
    const btnReroll = document.getElementById('btnReroll');
    if (btnSell) btnSell.classList.toggle('hidden', tab !== 'bench');
    if (btnReroll) btnReroll.classList.toggle('hidden', tab !== 'recruit');
  
    const subtitle = document.getElementById('marketSubtitle');
    if (tab === 'bench') {
      if (subtitle) {
        subtitle.textContent = t('shop.squadBench',{deployed:this.placedPieces.length,slots:this.maxSlots,count:this.inventory.length});
      }
      this.updateSellButton();
      this.renderInventory();
    } else {
      this.renderShop();
    }
  },
  
  // ---- Quick Deploy piece from Bench directly onto board ----

  deployBenchPiece(item) {
    if (this.phase === 'battle') return;
    if (this.placedPieces.length >= this.maxSlots) {
      alert(`Board is full (${this.maxSlots}/${this.maxSlots} units). Recall a unit first or upgrade slot capacity!`);
      return;
    }
    // Use all 28 player Hex cells, including squads larger than eight units.
    let targetSq = -1;
    for (let sq = 55; sq >= 28; sq--) {
      if (!this.game.board[sq]) {
        targetSq = sq;
        break;
      }
    }
    if (targetSq !== -1) {
      this.selectedInvId = item.id;
      this.handleSetupSquareClick(targetSq);
    } else {
      this.onInventorySlotClick(item);
    }
  },
  
  // ---- Render Bench Inventory Dock (96x48 cards matching Recruit) ----

  renderInventory() {
    const container = document.getElementById('inventorySlots');
    const totalCountEl = document.getElementById('invTotalCount');
    if (!container) return;
  
    container.innerHTML = '';
    if (totalCountEl) totalCountEl.textContent = this.inventory.length;
  
    const subtitle = document.getElementById('marketSubtitle');
    if (subtitle && this.pokemonTab === 'bench') {
      subtitle.textContent = t('shop.squadBench',{deployed:this.placedPieces.length,slots:this.maxSlots,count:this.inventory.length});
    }
  
    if (this.inventory.length === 0) {
      container.innerHTML = `
        <div class="recruit-picked-msg" style="padding: 10px 4px;">
          <span>Bench is empty!</span><br/>Click RECRUIT tab to get Pokemon.
        </div>
      `;
      return;
    }
  
    for (const item of this.inventory) {
      const isDeployed = this.placedPieces.some(p => p.invId === item.id);
      const isSelected = this.selectedInvId === item.id;
      const info = PIECE_INFO[item.type];
      const deployed = this.placedPieces.find(piece => piece.invId === item.id);
      const boardPiece = deployed ? this.game.board[deployed.sq] : null;
      const eff = this.getHexPieceStats(boardPiece ?? { ...item, color: W }, deployed?.sq ?? -1);
  
      const maxSlots = (item.maxTalismans || 3) + (window.MetaProgression?.getExtraTalismanSlots() ?? 0);
      const talDef = this.activeApplyingTalisman ? TALISMANS[this.activeApplyingTalisman.talismanId] : null;
      const isSlotFull = talDef && !talDef.isSpell && (item.talismans || []).length >= maxSlots;
      const isEligible = this.activeApplyingTalisman && TalismanSystem.isApplicable(this.activeApplyingTalisman.talismanId, item.type) && !isSlotFull;
      const isTargetIneligible = this.activeApplyingTalisman && !isEligible;
  
      const slot = document.createElement('div');
      slot.className = `reward-card bench-card inv-slot ${isDeployed ? 'deployed' : ''} ${isSelected ? 'selected' : ''} ${isEligible ? 'talisman-target-eligible' : ''} ${isTargetIneligible ? 'talisman-target-ineligible' : ''}`;
      slot.dataset.invId = item.id;
  
      const pDef = PIECES[item.type];
      const battlesFought = item.battlesFought || 0;
      const battlesToEvolve = pDef?.battlesToEvolve;
      const nextEvoDef = pDef?.nextEvo ? PIECES[pDef.nextEvo] : null;
  
      let evoTooltip = '';
      let evoRowHtml = '';
      if (item.type === '133') {
        evoTooltip = '\nEvolution: 5 Branches (Water/Thunder/Fire/Sun/Moon Stones)';
        evoRowHtml = '<span class="stat-evo" title="5 Evolution Stone Branches" style="color:#ff9ff3;">💎5 Branches</span>';
      } else if (pDef?.evoBranches && (!battlesToEvolve || battlesToEvolve === 0)) {
        const branchNames = pDef.evoBranches.map(id => PIECES[id]?.name || id).join(', ');
        evoTooltip = `\nEvolution: Item Branches (${branchNames})`;
        evoRowHtml = '<span class="stat-evo" title="Evolves using Items" style="color:#ff9ff3;">💎Branches</span>';
      } else if (pDef?.evoBranches && battlesToEvolve) {
        const branchNames = pDef.evoBranches.map(id => PIECES[id]?.name || id).join(', ');
        evoTooltip = `\nEvolution: ${battlesFought}/${battlesToEvolve} battles ➔ Branches (${branchNames})`;
        evoRowHtml = `<span class="stat-evo" title="Branched Evolution: ${battlesFought}/${battlesToEvolve} battles" style="color:#ffd700;">★${battlesFought}/${battlesToEvolve}</span>`;
      } else if (nextEvoDef && pDef?.evoItem) {
        const stoneDef = (typeof TalismanSystem !== 'undefined') ? TalismanSystem.get(pDef.evoItem) : null;
        const itemLabel = stoneDef ? stoneDef.name : pDef.evoItem;
        evoTooltip = `\nEvolution: Needs ${itemLabel} ➔ ${nextEvoDef.name}`;
        evoRowHtml = `<span class="stat-evo" title="Needs ${itemLabel} to evolve" style="color:#ff9ff3;">💎${itemLabel}</span>`;
      } else if (nextEvoDef && battlesToEvolve) {
        evoTooltip = `\nEvolution: ${battlesFought}/${battlesToEvolve} battles ➔ ${nextEvoDef.name}`;
        evoRowHtml = `<span class="stat-evo" title="Evolution: ${battlesFought}/${battlesToEvolve} battles" style="color:#ffd700;">★${battlesFought}/${battlesToEvolve}</span>`;
      } else {
        evoTooltip = `\nEvolution: Max Stage`;
        evoRowHtml = `<span class="stat-evo" title="Max Evolution Stage" style="color:#7bed9f;">★MAX</span>`;
      }
  
      const isMega = (typeof TalismanSystem !== 'undefined') && TalismanSystem.isMegaEvolved(item);
      const displayName = isMega ? `MEGA ${info.name.toUpperCase()}` : info.name.toUpperCase();
  
      const rarityKey = (info.rarity === 'legendary' || info.rarity === 'legend') ? 'legend' : (info.rarity || 'common');
      const rarityLabel = rarityKey.toUpperCase();
      const { element: effT1, element2: effT2 } = (typeof TypeSystem !== 'undefined')
        ? TypeSystem.getEffectivePieceElements(item)
        : { element: info.element || 'normal', element2: info.element2 };
      const t1 = effT1.toUpperCase();
      const t2 = effT2 ? effT2.toUpperCase() : null;
      const typeStr = t2 ? `${t1}/${t2}` : t1;
      const talismanNames = (item.talismans && item.talismans.length > 0)
        ? `\nTalismans (${item.talismans.length}/${maxSlots}): ${item.talismans.map(tid => TALISMANS[tid]?.name || tid).join(', ')}`
        : `\nTalismans: 0/${maxSlots}`;
      slot.title = `${displayName} [${typeStr}] (${rarityLabel})\nHP: ${eff.maxHp} | ATK: ${eff.damage}\nAttack element depends on Hex position${evoTooltip}${info.desc ? '\n' + info.desc : ''}${talismanNames}`;
  
      let sealHtml = '';
      if (item.talismans && item.talismans.length > 0) {
        sealHtml = `<img src="assets/ui/talismans/talisman_seal.svg?v=${ASSET_VERSION}" class="ui-talisman-mark" alt="Talisman" />`;
      }
  
      slot.innerHTML = `
        <div class="reward-card-img-wrap">
          <img src="${getPieceIconUrl(item.type)}" class="reward-card-img inv-slot-piece ${isMega ? 'piece-mega-aura' : ''}" alt="${info.name}" />
          ${sealHtml}
        </div>
        <div class="reward-card-info">
          <div class="card-name" style="${isMega ? 'color:#ffd700;' : ''}">${displayName}</div>
          <div class="card-rarity-row">
            <span class="card-rarity rarity-${rarityKey}"><span>${rarityLabel}</span></span>
            ${typeof TypeSystem !== 'undefined' ? TypeSystem.renderPieceBadgesHtml(item, 'slot-type-badge') : ''}
            ${evoRowHtml}
          </div>
          <div class="card-stats">
            <span class="stat-badge stat-heart"><img src="assets/ui/hp.png?v=${ASSET_VERSION}" class="ui-icon-micro" alt="HP" /><span>${eff.maxHp}</span></span>
            <span class="stat-badge stat-atk"><img src="assets/ui/atk.png?v=${ASSET_VERSION}" class="ui-icon-micro" alt="ATK" /><span>${eff.damage}</span></span>
            <span class="stat-badge stat-spd" title="Combat Speed"><img src="assets/ui/spd.png?v=${ASSET_VERSION}" class="ui-icon-micro" alt="SPD" /><span>${eff.speed || 100}</span></span>
          </div>
        </div>
      `;
  
      slot.addEventListener('mouseenter', () => this.previewPieceMoves(item.type));
      slot.addEventListener('mouseleave', () => this.clearPreview());
  
      slot.addEventListener('click', () => {
        this.clearPreview();
        this.onInventorySlotClick(item);
      });
      container.appendChild(slot);
    }
  },

  onInventorySlotClick(item) {
    if (this.phase === 'battle') return; // Locked during battle
  
    if (this.activeApplyingTalisman) {
      this.applyTalismanToPiece(item);
      return;
    }
  
    const isDeployed = this.placedPieces.some(p => p.invId === item.id);
    if (isDeployed) {
      this.recallPieceFromBoard(item.id);
      return;
    }
  
    if (this.selectedInvId === item.id) {
      this.selectedInvId = null;
    } else {
      this.selectedInvId = item.id;
      this.selectedBoardSq = -1;
      this.setTalismanTab('bag');
    }
  
    this.renderInventory();
    this.renderBoard();
    this.renderTalismans();
    this.updateSellButton();
  },

  saveSetupFormation() {
    this.setupFormation = this.placedPieces.map(p => ({
      invId: p.invId,
      type: p.type,
      setupSq: p.sq
    }));
  },

  recallPieceFromBoard(invId) {
    if (this.phase === 'battle') return;
    const idx = this.placedPieces.findIndex(p => p.invId === invId);
    if (idx === -1) return;
  
    const placed = this.placedPieces[idx];
    const sqEl = this.getSquareEl(placed.sq);
    const pieceImg = sqEl?.querySelector('.piece');
    const invSlot = document.querySelector(`.inv-slot[data-inv-id="${invId}"]`);
  
    let delta = null;
    if (pieceImg && invSlot) {
      delta = this.getAppRelativeDelta(invSlot, sqEl);
    }
  
    if (delta && pieceImg) {
      this.isSetupAnimating = true;
      pieceImg.style.setProperty('--fly-to-x', `${-delta.dx}px`);
      pieceImg.style.setProperty('--fly-to-y', `${-delta.dy}px`);
      pieceImg.classList.add('piece-setup-recall');
  
      setTimeout(() => {
        this.game.board[placed.sq] = null;
        this.placedPieces.splice(idx, 1);
        this.saveSetupFormation();
        this.selectedInvId = null;
        this.selectedBoardSq = -1;
        this.renderInventory();
        this.renderBoard();
        this.updateStats();
        this.isSetupAnimating = false;
  
        const updatedSlot = document.querySelector(`.inv-slot[data-inv-id="${invId}"]`);
        if (updatedSlot) {
          updatedSlot.classList.add('inv-slot-bounce');
          setTimeout(() => updatedSlot.classList.remove('inv-slot-bounce'), 250);
        }
      }, 210);
    } else {
      this.game.board[placed.sq] = null;
      this.placedPieces.splice(idx, 1);
      this.saveSetupFormation();
      this.selectedInvId = null;
      this.selectedBoardSq = -1;
      this.renderInventory();
      this.renderBoard();
      this.updateStats();
    }
  },

  recallAllPieces() {
    if (this.phase === 'battle' || this.isSetupAnimating) return;
    if (this.placedPieces.length === 0) return;
  
    const list = [...this.placedPieces];
    list.forEach((p, i) => {
      setTimeout(() => {
        this.recallPieceFromBoard(p.invId);
      }, i * 50);
    });
  }
  
  // =============================================
  // BOARD RENDERING & VISUAL CUES
  // =============================================

});
