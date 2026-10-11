// =============================================
// CHESS+ ROGUELIKE: TURN-BASED COMBAT SYSTEM
// Battle execution, attack logic, move validation
// Repetition detection, sudden death, victory/defeat
// =============================================

'use strict';


// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {

  startBattle() {
    if (this.phase === 'battle') return;
    if (this.isSetupAnimating) return;
    if (this.placedPieces.length === 0) {
      alert('Deploy at least 1 piece to the board to begin the battle!');
      return;
    }
  
    this.disposeHexBattle();
    this.battleRounds = 1;
    this.cancelApplyTalisman();
    this.saveSetupFormation();
    // Track pieces deployed in this battle for battle count / evolution
    this.deployedInBattleIds = new Set(this.placedPieces.map(p => p.invId));
    this.phase = 'battle';
    this.game.turn = W;
    this.isAnimating = false;
    this.selectedInvId = null;
    this.selectedBoardSq = -1;
    this.legalTargets = [];
    this.postMoveAttackPhase = null;
    this.updateSkipButton();
    this.roundMoves = 0;
    this.collapsePhase = 0;
    this.shakingSquares.clear();
    this.collapsedSquares.clear();
    if (this.game.collapsedSquares) this.game.collapsedSquares.clear();
    this.resetRepetitionTracking();
  
    for (let i = 0; i < 64; i++) {
      const el = this.getSquareEl(i);
      if (el) {
        el.classList.remove('tile-shaking', 'tile-falling', 'tile-collapsed', 'piece-hover');
      }
    }
  
    // Ditto biến hình thành đồng minh gần nhất (chỉ ngoại hình & moveset)
    this.transformDittoPieces();
  
    // Initialize HP for every piece currently on the board using effective stats
    this.pieceHP = {};
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (!p) continue;
      const st = this.getEffectivePieceStats(p);
      this.pieceHP[i] = st.maxHp;
      p.divineShieldUsed = false;
      p.phoenixUsed = false;
      p.focusSashUsed = false;
      p.focusBandUsed = false;
      p.sitrusBerryUsed = false;
      p.lumBerryUsed = false;
      p.redCardUsed = false;
      p.shedShellUsed = false;
      p.airBalloonPopped = false;
      p.weaknessPolicyTriggered = false;
      p.ejectButtonUsed = false;
      p.destinyKnotUsed = false;
      p.custapBerryUsed = false;
      p.smokeBallUsed = false;
      p.starfBerryUsed = false;
      p.smokeTurns = 0;
      p.hasStarfEvasion = false;
      p.hasStickyBarbBleed = 0;
      p.isToxicPoisoned = false;
      p._battleBonusAtk = 0;
      p._metronomeStacks = 0;
    }

    // Apply Soothe Bell & Toxic Orb start-of-battle auras
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (!p) continue;
      if (typeof TalismanSystem !== 'undefined') {
        if (TalismanSystem.hasToxicOrb(p)) {
          p.isToxicPoisoned = true;
          p._battleBonusAtk = (p._battleBonusAtk || 0) + 6;
          this.addLog(`☠️ Toxic Orb activated on ${PIECE_NAMES[p.type] || 'Unit'}: gained +6 Berserk ATK!`);
        }
        if (TalismanSystem.hasSootheBell(p)) {
          for (const nSq of new HexBoard().getNeighbors(i)) {
                const neighbor = this.game.board[nSq];
                if (neighbor && neighbor.color === p.color) {
                  neighbor._battleBonusAtk = (neighbor._battleBonusAtk || 0) + 3;
                  const nSt = this.getEffectivePieceStats(neighbor);
                  this.pieceHP[nSq] = Math.min(nSt.maxHp, (this.pieceHP[nSq] || nSt.maxHp) + 8);
                  this.addLog(`🔔 Soothe Bell chimed: granted +3 ATK and +8 Max HP to adjacent ${PIECE_NAMES[neighbor.type]}!`);
                }
          }
        }
      }
    }
  
    // Record initial board state
    const initialHash = this.getBoardStateHash();
    this.repetitionStates[initialHash] = 1;
  
    this.renderBoard();
    this.renderShop();
    this.renderTalismans();
    const aiLevel = Math.min(4, 1 + Math.floor((this.stage - 1) / 3));
    const aiRanks = ['', 'NOVICE (EASY)', 'INTERMEDIATE', 'TACTICAL MASTER', 'GRANDMASTER'];
    this.addLog(`=== STAGE ${this.stage} — BATTLE COMMENCED (AI: ${aiRanks[aiLevel]}) ===`);
    this.updateTurnIndicator();
    this.updateAutoBattleUI();
  

    this.battleRounds = 1;

    // Khởi tạo Auto Combat Hex
    const bridge = new HexBridge(this);
    const combat = bridge.createCombat({
      moveCooldownTicks: 15
    });

    // Kiểm tra đủ hai phe
    const teams = new Set(
      [...combat.units.values()].map(unit => unit.color)
    );

    if (teams.size < 2) {
      console.error('HexCombat: Không đủ hai phe để bắt đầu.');
      this.phase = 'setup';
      this.renderBoard();
      this.renderShop();
      this.renderTalismans();
      this.updateAutoBattleUI();
      return;
    }
    this.hexBattleFinished = false;
    // Lưu phiên chiến đấu
    this.hexCombat = combat;

    // Tạo renderer
    this.hexRenderer = new HexRenderer(combat);
    document.body.classList.add('hex-combat-active');
    // Hiển thị Pokémon Auto Combat
    this.hexRenderer.renderInitialUnits();
    this.renderInventory();
    this.updateTurnIndicator();

    // Bắt đầu mô phỏng 30 ticks/giây
    combat.start();
    this.syncHexBattlePause();

    console.log('Hex Auto Combat started!', {
      units: combat.units.size,
      tickRate: combat.tickRate
    });

  },

  buildActionQueue() {
    const queue = [];
    for (let sq = 0; sq < 64; sq++) {
      const p = this.game.board[sq];
      if (p && (this.pieceHP[sq] === undefined || this.pieceHP[sq] > 0)) {
        const stats = this.getEffectivePieceStats(p);
        queue.push({
          piece: p,
          sq: sq,
          color: p.color,
          speed: stats.speed,
          baseSpeed: stats.baseSpeed,
          hasStrikeFirst: stats.hasStrikeFirst && this.battleRounds === 1,
          acted: false,
          isDefeated: false
        });
      }
    }

    // Sort descending by Speed (Fastest units first)
    // In case of speed tie: Player units first, then lower square index
    queue.sort((a, b) => {
      if (b.speed !== a.speed) return b.speed - a.speed;
      if (a.color !== b.color) return a.color === W ? -1 : 1;
      return a.sq - b.sq;
    });

    // Append Round End marker
    queue.push({
      isRoundEnd: true,
      acted: false
    });

    this.turnQueue = queue;
    this.currentQueueIndex = 0;
  },

  renderTurnOrderStrip() {
    const container = document.getElementById('turnOrderContainer');
    const strip = document.getElementById('turnOrderStrip');
    const roundBadge = document.getElementById('turnQueueRoundBadge');
    if (!strip) return;

    if (roundBadge) {
      roundBadge.textContent = `ROUND ${this.battleRounds || 1}`;
    }

    if (this.phase !== 'battle') {
      if (container) container.classList.add('hidden');
      strip.innerHTML = '';
      return;
    }

    if (container) container.classList.remove('hidden');
    strip.innerHTML = '';

    if (!this.turnQueue || this.turnQueue.length === 0) return;

    this.turnQueue.forEach((item, idx) => {
      const card = document.createElement('div');

      if (item.isRoundEnd) {
        card.className = `turn-card turn-card-end ${idx === this.currentQueueIndex ? 'active-turn' : ''}`;
        card.innerHTML = `<span>[END ROUND ${this.battleRounds || 1}]</span>`;
        strip.appendChild(card);
        return;
      }

      // Check if unit is still alive
      let isAlive = false;
      for (let s = 0; s < 64; s++) {
        if (this.game.board[s] === item.piece && (this.pieceHP[s] === undefined || this.pieceHP[s] > 0)) {
          isAlive = true;
          item.sq = s;
          break;
        }
      }

      const isCurrent = (idx === this.currentQueueIndex);
      const isPlayer = item.color === W;
      const pieceName = (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[item.piece.type]) ? PIECE_NAMES[item.piece.type] : (item.piece.name || item.piece.type);
      const iconUrl = typeof getPieceIconUrl === 'function' ? getPieceIconUrl(item.piece.type) : `assets/pokemon/icons/${item.piece.type}.png`;

      let classes = `turn-card ${isPlayer ? 'player-unit' : 'enemy-unit'}`;
      if (isCurrent) classes += ' active-turn';
      if (item.acted) classes += ' has-acted';
      if (!isAlive || item.isDefeated) classes += ' is-defeated';

      card.className = classes;

      let spdBadgeHtml = '';
      if (item.hasStrikeFirst) {
        spdBadgeHtml = `<span class="spd-pill strike-first-pill" title="Strike First (+1000 SPD Round 1)"><img src="assets/ui/spd.png?v=${typeof ASSET_VERSION !== 'undefined' ? ASSET_VERSION : '1'}" class="ui-icon-micro" alt="SPD" /><span>${item.speed}</span></span>`;
      } else {
        spdBadgeHtml = `<span class="spd-pill" title="Speed"><img src="assets/ui/spd.png?v=${typeof ASSET_VERSION !== 'undefined' ? ASSET_VERSION : '1'}" class="ui-icon-micro" alt="SPD" /><span>${item.speed}</span></span>`;
      }

      let passBtnHtml = '';
      if (isCurrent && isPlayer && !this.isAnimating) {
        passBtnHtml = `<button class="turn-pass-btn" id="btnPassActiveTurn" title="Skip this unit's turn">PASS</button>`;
      }

      card.innerHTML = `
        <img src="${iconUrl}" class="turn-card-icon" alt="${pieceName}" />
        <span class="turn-card-name">${pieceName}</span>
        ${spdBadgeHtml}
        ${passBtnHtml}
      `;

      card.addEventListener('click', (e) => {
        if (e.target.id === 'btnPassActiveTurn') {
          e.stopPropagation();
          this.passCurrentQueueTurn();
          return;
        }
        if (isAlive && !item.isDefeated) {
          const tile = this.getSquareEl(item.sq);
          if (tile) {
            tile.classList.add('tile-hovered');
            setTimeout(() => tile.classList.remove('tile-hovered'), 600);
          }
        }
      });

      strip.appendChild(card);

      if (isCurrent) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 50);
      }
    });
  },

  updateSkipButton() {
    const btnSkip = document.getElementById('btnSkipTurn');
    if (!btnSkip) return;

    if (this.phase !== 'battle' || this.isAutoBattle || this.isAnimating || this.game.turn !== W) {
      btnSkip.classList.add('hidden');
      btnSkip.style.display = 'none';
      return;
    }

    const currentItem = this.turnQueue && this.turnQueue[this.currentQueueIndex];
    if (!currentItem || currentItem.color !== W || currentItem.isRoundEnd || currentItem.isDefeated) {
      btnSkip.classList.add('hidden');
      btnSkip.style.display = 'none';
      return;
    }

    btnSkip.classList.remove('hidden');
    btnSkip.style.display = 'inline-flex';
    btnSkip.disabled = false;

    if (this.postMoveAttackPhase) {
      btnSkip.innerHTML = '⏭ SKIP';
      btnSkip.title = 'Bỏ qua tấn công và kết thúc lượt';
    } else {
      btnSkip.innerHTML = '⏭ SKIP';
      btnSkip.title = 'Bỏ qua lượt của Pokémon này';
    }
  },

  getAttackMovesFromSquare(sq) {
    const piece = this.game.board[sq];
    if (!piece || (this.pieceHP[sq] !== undefined && this.pieceHP[sq] <= 0)) return [];
    const pseudo = this.game.pseudoMoves(sq);
    const enemyColor = piece.color === W ? B : W;
    return pseudo.filter(m => {
      if (m.moveOnly) return false;
      if (this.collapsedSquares && this.collapsedSquares.has(m.to)) return false;

      if (m.isLineAttack) {
        if (m.enemiesOnLine && m.enemiesOnLine.length > 0) {
          const livingEnemies = m.enemiesOnLine.filter(esq => {
            const ep = this.game.board[esq];
            return ep && ep.color === enemyColor && (this.pieceHP[esq] === undefined || this.pieceHP[esq] > 0);
          });
          if (livingEnemies.length > 0) return true;
        }
        const t = this.game.board[m.to];
        return t && t.color === enemyColor && (this.pieceHP[m.to] === undefined || this.pieceHP[m.to] > 0);
      }

      const target = this.game.board[m.to];
      return target && target.color === enemyColor && (this.pieceHP[m.to] === undefined || this.pieceHP[m.to] > 0);
    });
  },

  findBestAttackFromSquare(sq, color, attackMoves) {
    if (!attackMoves || attackMoves.length === 0) return null;
    const oppColor = color === W ? B : W;
    let bestMove = null;
    let bestScore = -Infinity;

    for (const m of attackMoves) {
      let targetSq = m.to;
      let target = this.game.board[targetSq];
      if (m.isLineAttack && (!target || target.color !== oppColor)) {
        if (m.enemiesOnLine && m.enemiesOnLine.length > 0) {
          targetSq = m.enemiesOnLine[0];
          target = this.game.board[targetSq];
        }
      }
      if (!target || target.color !== oppColor) continue;

      const hp = this.pieceHP[targetSq] || 100;
      const piece = this.game.board[sq];
      const stats = typeof this.getEffectivePieceStats === 'function' ? this.getEffectivePieceStats(piece) : { damage: 20 };
      const willKill = hp <= stats.damage;

      let score = willKill ? 1000 : 0;
      score += Math.max(0, 1000 - hp);
      const valMap = { p: 10, n: 30, b: 35, r: 50, q: 90, k: 200 };
      score += (valMap[target.type] || 20) * 5;

      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }

    return bestMove || attackMoves[0];
  },

  enterPostMoveAttackPhase(currentItem, newSq, attackMoves) {
    if (this.phase !== 'battle') return;
    const status = this.checkBattleStatus();
    if (status !== 'playing') return;

    this.postMoveAttackPhase = {
      item: currentItem,
      sq: newSq,
      moves: attackMoves
    };
    this.selectedBoardSq = newSq;
    this.legalTargets = attackMoves;
    this.renderSelectionRays();
    this.updateSkipButton();

    const piece = this.game.board[newSq];
    const pName = piece ? (PIECE_NAMES[piece.type] || 'Unit') : 'Unit';
    this.addLog(`⚔️ ${pName} moved! Choose an enemy target to attack, or click SKIP.`);
  },

  passPostMoveAttack() {
    if (!this.postMoveAttackPhase) return;
    const item = this.postMoveAttackPhase.item;
    const sq = this.postMoveAttackPhase.sq;
    this.postMoveAttackPhase = null;
    this.selectedBoardSq = -1;
    this.legalTargets = [];
    this.renderSelectionRays();
    this.updateSkipButton();

    const piece = (this.game && this.game.board[sq]) || (item && item.piece);
    const pName = piece ? (PIECE_NAMES[piece.type] || 'Unit') : 'Unit';
    this.addLog(`${pName} skipped attack.`);
    this.onUnitActionComplete(item);
  },

  passCurrentQueueTurn() {
    if (this.phase !== 'battle' || this.isAnimating) return;
    if (this.postMoveAttackPhase) {
      this.passPostMoveAttack();
      return;
    }
    const currentItem = this.turnQueue && this.turnQueue[this.currentQueueIndex];
    if (!currentItem || currentItem.color !== W) return;
    this.addLog(`${PIECE_NAMES[currentItem.piece.type] || 'Unit'} passed its turn.`);
    this.onUnitActionComplete(currentItem);
  },

  executeNextQueueTurn() {
    if (this.phase !== 'battle') return;

    // Check battle outcome
    const status = this.checkBattleStatus();
    if (status === 'win') {
      setTimeout(() => this.handleStageVictory(), 450);
      return;
    }
    if (status === 'loss') {
      setTimeout(() => this.handleStageDefeat('All your pieces have fallen in battle!'), 450);
      return;
    }
    if (status === 'draw') {
      setTimeout(() => this.handleStageDraw(), 450);
      return;
    }

    if (!this.turnQueue || this.currentQueueIndex >= this.turnQueue.length) {
      this.finishCurrentRound();
      return;
    }

    const currentItem = this.turnQueue[this.currentQueueIndex];

    // Reached Round End?
    if (currentItem.isRoundEnd) {
      this.finishCurrentRound();
      return;
    }

    // Locate current square of this piece
    let currentSq = currentItem.sq;
    if (this.game.board[currentSq] !== currentItem.piece) {
      currentSq = -1;
      for (let s = 0; s < 64; s++) {
        if (this.game.board[s] === currentItem.piece) {
          currentSq = s;
          currentItem.sq = s;
          break;
        }
      }
    }

    // If unit died or was removed from board: advance immediately
    if (currentSq === -1 || (this.pieceHP[currentSq] !== undefined && this.pieceHP[currentSq] <= 0)) {
      currentItem.isDefeated = true;
      currentItem.acted = true;
      this.currentQueueIndex++;
      this.renderTurnOrderStrip();
      this.executeNextQueueTurn();
      return;
    }

    // Check if unit is paralyzed
    if (currentItem.piece && currentItem.piece.isParalyzed) {
      currentItem.piece.isParalyzed = false;
      const pName = PIECE_NAMES[currentItem.piece.type] || 'Unit';
      this.addLog(`⚡ ${pName} (${currentItem.color === W ? 'Player' : 'Enemy'}) is Paralyzed and skips turn!`);
      if (typeof CombatEngine !== 'undefined') {
        CombatEngine.spawnElectricFX(this, currentSq);
      }
      currentItem.acted = true;
      this.currentQueueIndex++;
      this.renderTurnOrderStrip();
      setTimeout(() => this.executeNextQueueTurn(), 400);
      return;
    }

    // Check if unit has any legal moves
    const pseudo = this.game.pseudoMoves(currentSq);
    const validMoves = pseudo.filter(m => !m.captureOnly || (this.game.board[m.to] && this.game.board[m.to].color !== currentItem.piece.color));

    if (validMoves.length === 0) {
      const pName = PIECE_NAMES[currentItem.piece.type] || 'Unit';
      this.addLog(`⚠️ ${pName} (${currentItem.color === W ? 'Player' : 'Enemy'}) has no legal moves and passes turn!`);
      currentItem.acted = true;
      this.currentQueueIndex++;
      this.renderTurnOrderStrip();
      setTimeout(() => this.executeNextQueueTurn(), 350);
      return;
    }

    // Turn dispatch based on color
    if (currentItem.color === W) {
      // ---- PLAYER (WHITE) TURN ----
      this.game.turn = W;
      this.postMoveAttackPhase = null;
      this.updateTurnIndicator();
      this.updateSkipButton();

      // Automatically select the active unit
      this.selectedBoardSq = currentSq;
      this.legalTargets = pseudo;
      this.renderSelectionRays();
      this.renderBoard();

      if (this.isAutoBattle) {
        setTimeout(() => {
          if (this.phase !== 'battle') return;
          const chosen = this.findBestMoveForPiece(currentSq, W, 4);
          if (chosen) {
            const isPureMove = !chosen.move.isLineAttack && !this.game.board[chosen.move.to];
            this.executeTurnMove(chosen.from, chosen.move, () => {
              if (isPureMove && this.phase === 'battle') {
                const newSq = chosen.move.to;
                currentItem.sq = newSq;
                const attackMoves = this.getAttackMovesFromSquare(newSq);
                if (attackMoves.length > 0) {
                  const bestAttack = this.findBestAttackFromSquare(newSq, W, attackMoves);
                  if (bestAttack) {
                    setTimeout(() => {
                      if (this.phase !== 'battle') return;
                      this.executeTurnMove(newSq, bestAttack, () => {
                        this.onUnitActionComplete(currentItem);
                      });
                    }, 200);
                    return;
                  }
                }
              }
              this.onUnitActionComplete(currentItem);
            });
          } else {
            this.onUnitActionComplete(currentItem);
          }
        }, 450);
      }
    } else {
      // ---- ENEMY (BLACK) TURN ----
      this.game.turn = B;
      this.postMoveAttackPhase = null;
      this.updateTurnIndicator();
      this.updateSkipButton();
      this.selectedBoardSq = -1;
      this.legalTargets = [];
      this.renderSelectionRays();

      setTimeout(() => {
        if (this.phase !== 'battle') return;
        const aiLevel = Math.min(4, 1 + Math.floor((this.stage - 1) / 3));
        const chosen = this.findBestMoveForPiece(currentSq, B, aiLevel);
        if (chosen) {
          const isPureMove = !chosen.move.isLineAttack && !this.game.board[chosen.move.to];
          this.executeTurnMove(chosen.from, chosen.move, () => {
            if (isPureMove && this.phase === 'battle') {
              const newSq = chosen.move.to;
              currentItem.sq = newSq;
              const attackMoves = this.getAttackMovesFromSquare(newSq);
              if (attackMoves.length > 0) {
                const bestAttack = this.findBestAttackFromSquare(newSq, B, attackMoves);
                if (bestAttack) {
                  setTimeout(() => {
                    if (this.phase !== 'battle') return;
                    this.executeTurnMove(newSq, bestAttack, () => {
                      this.onUnitActionComplete(currentItem);
                    });
                  }, 200);
                  return;
                }
              }
            }
            this.onUnitActionComplete(currentItem);
          });
        } else {
          this.onUnitActionComplete(currentItem);
        }
      }, 450);
    }
  },

  onUnitActionComplete(item) {
    this.postMoveAttackPhase = null;
    item.acted = true;
    this.selectedBoardSq = -1;
    this.legalTargets = [];
    this.renderSelectionRays();
    this.updateSkipButton();
    this.currentQueueIndex++;
    this.renderTurnOrderStrip();

    const status = this.checkBattleStatus();
    if (status === 'win') {
      setTimeout(() => this.handleStageVictory(), 450);
      return;
    }
    if (status === 'loss') {
      setTimeout(() => this.handleStageDefeat('All your pieces have fallen in battle!'), 450);
      return;
    }
    if (status === 'draw') {
      setTimeout(() => this.handleStageDraw(), 450);
      return;
    }

    setTimeout(() => {
      this.executeNextQueueTurn();
    }, 250);
  },

  finishCurrentRound() {
    this.addLog(`=== ROUND ${this.battleRounds} COMPLETE ===`);

    // 1. Synergy round-end effects (Poison venom tick, Burn damage, Water regen)
    if (typeof SynergySystem !== 'undefined') {
      SynergySystem.onRoundEnd(this);
    }

    // 2. Sudden Death Floor Collapse check
    this.checkSuddenDeathCollapse(() => {
      const status = this.checkBattleStatus();
      if (status === 'win') {
        setTimeout(() => this.handleStageVictory(), 450);
        return;
      }
      if (status === 'loss') {
        setTimeout(() => this.handleStageDefeat('All your pieces have fallen in battle!'), 450);
        return;
      }
      if (status === 'draw') {
        setTimeout(() => this.handleStageDraw(), 450);
        return;
      }

      // 3. Advance round counter and rebuild action queue
      this.battleRounds = (this.battleRounds || 1) + 1;
      this.addLog(`=== ROUND ${this.battleRounds} INITIATIVE QUEUE ===`);

      this.buildActionQueue();
      this.renderTurnOrderStrip();
      setTimeout(() => {
        this.executeNextQueueTurn();
      }, 400);
    });
  },

  handleBattleSquareClick(idx) {
    if (this.hexCombat) return;
    if (this.game.turn !== W || this.isAnimating) return;
    this.clearAutoBattleTimer();
  
    const currentItem = this.turnQueue && this.turnQueue[this.currentQueueIndex];
    if (!currentItem || currentItem.color !== W || currentItem.isRoundEnd) return;

    // 1. Post-Move Attack Phase: Unit already moved, now selecting target or skipping
    if (this.postMoveAttackPhase) {
      const activeSq = this.postMoveAttackPhase.sq;
      const move = this.postMoveAttackPhase.moves.find(m => m.to === idx);
      if (move) {
        this.postMoveAttackPhase = null;
        this.selectedBoardSq = -1;
        this.legalTargets = [];
        this.renderSelectionRays();
        this.updateSkipButton();
        this.roundMoves++;

        this.executeTurnMove(activeSq, move, () => {
          this.onUnitActionComplete(currentItem);
        });
      }
      return;
    }

    // 2. Initial Turn Action Phase
    const activeSq = currentItem.sq;
    // Active unit is automatically locked in as selected during its turn
    if (this.selectedBoardSq !== activeSq) {
      this.selectedBoardSq = activeSq;
      this.legalTargets = this.game.pseudoMoves(activeSq);
      this.renderSelectionRays();
    }

    // Friendly pieces cannot be clicked to switch selection or deselect
    const clickedPiece = this.game.board[idx];
    if (clickedPiece && clickedPiece.color === W) {
      return;
    }

    // Only clicking a valid move/attack target square executes an action
    if (this.legalTargets && this.legalTargets.length > 0) {
      const move = this.legalTargets.find(m => m.to === idx);
      if (move) {
        const currentPiece = this.game.board[activeSq];
        // If move is captureOnly, target square MUST contain an enemy piece!
        if (move.captureOnly && (!clickedPiece || (currentPiece && clickedPiece.color === currentPiece.color))) {
          return;
        }

        const isAttack = move.isLineAttack || (clickedPiece && clickedPiece.color !== currentPiece.color);
        const fromSq = activeSq;
        this.selectedBoardSq = -1;
        this.legalTargets = [];
        this.renderSelectionRays();
        this.updateSkipButton();
        this.roundMoves++;

        if (isAttack) {
          // -> Đánh -> next
          this.executeTurnMove(fromSq, move, () => {
            this.onUnitActionComplete(currentItem);
          });
        } else {
          // -> Di chuyển (vào ô trống)
          this.executeTurnMove(fromSq, move, () => {
            const newSq = move.to;
            currentItem.sq = newSq;

            if (this.phase !== 'battle') return;
            const status = this.checkBattleStatus();
            if (status !== 'playing') return;

            const attackMoves = this.getAttackMovesFromSquare(newSq);
            if (attackMoves.length === 0) {
              // -> Di chuyển nếu không có ai để đánh - next
              this.onUnitActionComplete(currentItem);
            } else {
              // -> Di chuyển có người đánh - Đánh hoặc bấm bỏ qua -> next
              this.enterPostMoveAttackPhase(currentItem, newSq, attackMoves);
            }
          });
        }
      }
    }
  },
  
  // Executes a move or attack in turn-based combat

  executeTurnMove(fromSq, move, onComplete) {
    const toSq = move.to;
    const piece = this.game.board[fromSq];
    if (!piece) { if (onComplete) onComplete(); return; }
  
    const target = this.game.board[toSq];
    const stats = this.getEffectivePieceStats(piece);
  
    this.isAnimating = true;
  
    if (move.isLineAttack) {
      // ---- PIERCING LINE ATTACK (ARCH) ----
      const enemies = move.enemiesOnLine || [toSq];
      const lines = move.lineSquares || [toSq];
  
      CombatEngine.triggerLineAttack(this, fromSq, lines, enemies, stats.damage, () => {
        let totalThornsDmg = 0;
        enemies.forEach(sq => {
          const tPiece = this.game.board[sq];
          if (tPiece && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasThorns(tPiece)) {
            totalThornsDmg += (TalismanSystem.getThornsDmg(tPiece) || 1);
          }
          if (this.pieceHP[sq] <= 0) {
            if (tPiece && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(tPiece) && !tPiece.phoenixUsed) {
              tPiece.phoenixUsed = true;
              const tSt = this.getEffectivePieceStats(tPiece);
              const reviveHp = Math.max(20, Math.round(tSt.maxHp * 0.3));
              this.pieceHP[sq] = reviveHp;
              this.updatePieceHpDOM(sq, reviveHp, tSt.maxHp);
              CombatEngine.spawnTextPopup(this, sq, 'REVIVED!');
              if (typeof soundManager !== 'undefined') soundManager.playSfx('revive');
              if (this.spawnLandPuff) this.spawnLandPuff(sq);
              this.addLog(`🔥 Phoenix Feather revived ${PIECE_NAMES[tPiece.type]} with ${reviveHp} HP!`);
              return;
            }
            if (piece.color === W) {
              this.addLog(`Your ${PIECE_NAMES[piece.type]} piercing arrow eliminated enemy ${tPiece ? PIECE_NAMES[tPiece.type] : 'unit'}!`);
            } else {
              this.addLog(`Enemy ${PIECE_NAMES[piece.type]} piercing arrow defeated your ${tPiece ? PIECE_NAMES[tPiece.type] : 'unit'}!`);
              const pi = this.placedPieces.findIndex(p => p.sq === sq);
              if (pi !== -1) this.placedPieces.splice(pi, 1);
            }
            delete this.pieceHP[sq];
            this.game.board[sq] = null;
            this.removePieceDOM(sq);
  
            if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasLifesteal(piece)) {
              const pSt = this.getEffectivePieceStats(piece);
              const curAtkHp = this.pieceHP[fromSq] !== undefined ? this.pieceHP[fromSq] : pSt.maxHp;
              if (curAtkHp < pSt.maxHp) {
                const healAmt = Math.max(15, Math.round(pSt.maxHp * 0.25));
                const healed = Math.min(pSt.maxHp, curAtkHp + healAmt);
                this.pieceHP[fromSq] = healed;
                this.updatePieceHpDOM(fromSq, healed, pSt.maxHp);
                CombatEngine.spawnHealPopup(this, fromSq, healAmt);
                this.addLog(`🩸 Vampiric Fang restored +${healAmt} HP to ${PIECE_NAMES[piece.type]}!`);
              }
            }
          } else {
            const leftHp = this.pieceHP[sq];
            if (piece.color === W) {
              this.addLog(`Your ${PIECE_NAMES[piece.type]} pierced enemy ${tPiece ? PIECE_NAMES[tPiece.type] : 'unit'} (${leftHp} HP left)`);
            } else {
              this.addLog(`Enemy ${PIECE_NAMES[piece.type]} pierced your ${tPiece ? PIECE_NAMES[tPiece.type] : 'unit'} (${leftHp} HP left)`);
            }
          }
        });
  
        // Thorns damage reflection back to line attacker
        if (totalThornsDmg > 0 && this.game.board[fromSq]) {
          const atkPiece = this.game.board[fromSq];
          if (this.pieceHP[fromSq] === undefined) {
            const aSt = this.getEffectivePieceStats(atkPiece);
            this.pieceHP[fromSq] = aSt.maxHp;
          }
          this.pieceHP[fromSq] = Math.max(0, this.pieceHP[fromSq] - totalThornsDmg);
          CombatEngine.spawnDmgPopup(this, fromSq, totalThornsDmg);
          if (typeof soundManager !== 'undefined') soundManager.playSfx('reflect');
          const aSt = this.getEffectivePieceStats(atkPiece);
          this.updatePieceHpDOM(fromSq, this.pieceHP[fromSq], aSt.maxHp);
          this.addLog(`⚡ Spike Shield reflected ${totalThornsDmg} damage to ${PIECE_NAMES[atkPiece.type]}!`);
  
          if (this.pieceHP[fromSq] <= 0) {
            if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(atkPiece) && !atkPiece.phoenixUsed) {
              atkPiece.phoenixUsed = true;
              this.pieceHP[fromSq] = 1;
              this.updatePieceHpDOM(fromSq, 1, aSt.maxHp);
              CombatEngine.spawnTextPopup(this, fromSq, 'REVIVED!');
              if (typeof soundManager !== 'undefined') soundManager.playSfx('revive');
              if (this.spawnLandPuff) this.spawnLandPuff(fromSq);
              this.addLog(`🔥 Phoenix Feather revived ${PIECE_NAMES[atkPiece.type]} with 1 HP!`);
            } else {
              if (atkPiece.color === W) {
                this.addLog(`Your ${PIECE_NAMES[atkPiece.type]} was eliminated by thorns reflection!`);
                const pi = this.placedPieces.findIndex(p => p.sq === fromSq);
                if (pi !== -1) this.placedPieces.splice(pi, 1);
              } else {
                this.addLog(`Enemy ${PIECE_NAMES[atkPiece.type]} was eliminated by thorns reflection!`);
              }
              delete this.pieceHP[fromSq];
              this.game.board[fromSq] = null;
              this.removePieceDOM(fromSq);
            }
          }
        }
  
        // Reset repetition since combat occurred
        this.resetRepetitionTracking();
  
        this.updateEnemyCard();
        this.updateStats();
        this.isAnimating = false;
        if (onComplete) onComplete();
      });
      return;
    }
  
    if (target && target.color !== piece.color) {
      // ---- ATTACK WITH DAMAGE ----
      if (this.pieceHP[toSq] === undefined) {
        const tSt = this.getEffectivePieceStats(target);
        this.pieceHP[toSq] = tSt.maxHp;
      }
  
      let dmg = stats.damage;
      let typeCombat = null;
      if (typeof TypeSystem !== 'undefined') {
        typeCombat = TypeSystem.calculateCombatDamage(piece, target, fromSq, dmg);
        // Ring Target: Strips enemy type immunities
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRingTarget(piece)) {
          if (typeCombat && typeCombat.multiplier === 0) {
            typeCombat.multiplier = 1.0;
            typeCombat.damage = Math.max(1, dmg);
            typeCombat.descriptor = { label: 'Ring Target bypassed immunity', multiplier: 1.0, popupText: 'IMMUNITY STRIPPED!' };
            this.addLog(`🎯 Ring Target stripped ${PIECE_NAMES[target.type] || 'Target'}'s elemental immunity!`);
          }
        }
        dmg = typeCombat.damage;
      }

      // Attacker Synergy: Psychic Crit & Dark Execute/Flank
      let isCrit = false;
      if (piece.color === W && typeof SynergySystem !== 'undefined') {
        const critRes = SynergySystem.checkCrit(piece, this);
        if (critRes.isCrit) {
          isCrit = true;
          dmg = Math.round(dmg * critRes.mult);
        }
        const darkBonus = SynergySystem.getDarkBonusDmg(piece, target, this, fromSq, toSq);
        if (darkBonus > 0) {
          dmg = Math.round(dmg * (1 + darkBonus));
        }
      }

      // Attacker Talismans: Scope Lens, Black Belt, Expert Belt, Choice Specs, Muscle Band, Metronome, Charcoal, Mystic Water
      if (typeof TalismanSystem !== 'undefined') {
        // Scope Lens (+20% Crit Chance, 1.5x multiplier)
        if (TalismanSystem.hasScopeLens(piece)) {
          if (!isCrit && Math.random() < 0.20) {
            isCrit = true;
            dmg = Math.round(dmg * 1.5);
          } else if (isCrit) {
            dmg = Math.round(dmg * 1.15);
          }
        }
        // Black Belt (when HP <= 50%, enrage +25% ATK)
        if (TalismanSystem.hasBlackBelt(piece)) {
          const curHp = this.pieceHP[fromSq] !== undefined ? this.pieceHP[fromSq] : stats.maxHp;
          if (curHp <= Math.round(stats.maxHp * 0.5)) {
            dmg = Math.round(dmg * 1.25);
            this.addLog(`🥋 Black Belt enrage: ${PIECE_NAMES[piece.type] || 'Unit'} dealt +25% Berserk damage!`);
          }
        }
        // Expert Belt (deals +20% extra damage on Type Advantages)
        if (TalismanSystem.hasExpertBelt(piece) && typeCombat && typeCombat.multiplier > 1.0) {
          dmg = Math.round(dmg * 1.2);
          this.addLog(`🥋 Expert Belt amplified super-effective strike to ${dmg} damage!`);
        }
        // Choice Specs (deals +15% special elemental damage)
        if (TalismanSystem.hasChoiceSpecs(piece)) {
          dmg = Math.round(dmg * 1.15);
        }
        // Muscle Band (+4% target current HP bonus damage)
        if (TalismanSystem.hasMuscleBand(piece)) {
          const targetCurHp = this.pieceHP[toSq] !== undefined ? this.pieceHP[toSq] : 30;
          const muscleDmg = Math.max(1, Math.round(targetCurHp * 0.04));
          dmg += muscleDmg;
          this.addLog(`💪 Muscle Band: dealt +${muscleDmg} bonus HP-shred damage!`);
        }
        // Metronome (consecutive strikes build rhythm tempo)
        if (TalismanSystem.hasMetronome(piece)) {
          piece._metronomeStacks = Math.min(3, (piece._metronomeStacks || 0) + 1);
          const metroBonus = piece._metronomeStacks * 2;
          dmg += metroBonus;
          this.addLog(`🎵 Metronome tempo: dealt +${metroBonus} rhythm damage!`);
        }
        // Charcoal (+4 Fire damage if Fire Pokémon)
        if (TalismanSystem.hasCharcoal(piece)) {
          const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
          const isFire = (pDef && (pDef.types?.includes('Fire') || pDef.type1 === 'Fire' || pDef.type2 === 'Fire'));
          if (isFire) {
            dmg += 4;
            this.addLog(`🔥 Charcoal ignited strike for +4 Fire damage!`);
          }
        }
        // Mystic Water (+3 Water damage if Water Pokémon)
        if (TalismanSystem.hasMysticWater(piece)) {
          const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
          const isWater = (pDef && (pDef.types?.includes('Water') || pDef.type1 === 'Water' || pDef.type2 === 'Water'));
          if (isWater) {
            dmg += 3;
            this.addLog(`💧 Mystic Water amplified strike for +3 Water damage!`);
          }
        }
        // Flame Orb: +4 burn damage on attack
        if (TalismanSystem.hasFlameOrb(piece)) {
          dmg += 4;
          target.burnDmg = Math.max(target.burnDmg || 0, 3);
          this.addLog(`🔥 Flame Orb ignited strike for +4 damage and Burn!`);
        }
        // Toxic Orb: +2 extra berserk damage
        if (TalismanSystem.hasToxicOrb(piece) && piece.isToxicPoisoned) {
          dmg += 2;
        }
      }

      // Defender Shield / Dodge / Damage Reduction
      let isDodged = false;
      if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasDivineShield(target) && !target.divineShieldUsed) {
        target.divineShieldUsed = true;
        dmg = 0;
        this.addLog(`🛡️ Divine Shield shielded ${PIECE_NAMES[target.type] || target.name} from all damage!`);
      } else if (target.color === W && typeof SynergySystem !== 'undefined' && SynergySystem.hasShield(target, this) && !target.stoneShieldUsed) {
        target.stoneShieldUsed = true;
        dmg = 0;
        this.addLog(`🛡️ Stone Shield completely absorbed attack on ${PIECE_NAMES[target.type] || target.name}!`);
      } else if (target.color === W && typeof SynergySystem !== 'undefined' && SynergySystem.checkDodge(target, this)) {
        dmg = 0;
        isDodged = true;
        this.addLog(`💨 ${PIECE_NAMES[target.type] || target.name} dodged the incoming attack!`);
      } else if (target.smokeTurns > 0) {
        target.smokeTurns--;
        dmg = 0;
        isDodged = true;
        this.addLog(`💨 Smoke Ball: ${PIECE_NAMES[target.type] || target.name} vanished into thick smoke and evaded!`);
      } else if (target.hasStarfEvasion && Math.random() < 0.35) {
        dmg = 0;
        isDodged = true;
        this.addLog(`⭐ Starf Berry: ${PIECE_NAMES[target.type] || target.name} cosmic-dodged the attack!`);
      } else if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasBrightPowder(target) && Math.random() < 0.18) {
        dmg = 0;
        isDodged = true;
        this.addLog(`✨ Bright Powder: ${PIECE_NAMES[target.type] || target.name} evaded the attack!`);
      } else {
        let reduction = (typeof TalismanSystem !== 'undefined') ? TalismanSystem.getDmgReduction(target) : 0;
        if (target.color === W && typeof SynergySystem !== 'undefined') {
          reduction += SynergySystem.getDmgReduction(target, this, dmg);
        }
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasProtectivePads(piece)) {
          reduction = 0;
          this.addLog(`🥊 Protective Pads pierced through defender's damage reduction!`);
        }
        if (reduction > 0) {
          dmg = Math.max(typeCombat && typeCombat.multiplier === 0 ? 0 : 1, dmg - reduction);
        }
      }

      let targetDies = (this.pieceHP[toSq] - dmg) <= 0;
      let phoenixRevived = false;
      let focusSashed = false;
      const tSt = this.getEffectivePieceStats(target);

      if (targetDies && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(target) && !target.phoenixUsed) {
        target.phoenixUsed = true;
        targetDies = false;
        phoenixRevived = true;
      } else if (targetDies && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasFocusSash(target) && !target.focusSashUsed) {
        target.focusSashUsed = true;
        targetDies = false;
        focusSashed = true;
      } else if (targetDies && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasFocusBand(target) && !target.focusBandUsed) {
        if (Math.random() < 0.35) {
          target.focusBandUsed = true;
          targetDies = false;
          focusSashed = true;
          this.addLog(`🎗️ Focus Band triggered! ${PIECE_NAMES[target.type] || 'Target'} hung on with 1 HP!`);
        }
      }

      // Air Balloon pops when struck
      if (dmg > 0 && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasAirBalloon(target) && !target.airBalloonPopped) {
        target.airBalloonPopped = true;
        this.addLog(`🎈 ${PIECE_NAMES[target.type] || 'Target'}'s Air Balloon popped by the hit!`);
      }

      // Red Card counter recoil (deal 5 true damage to attacker)
      if (dmg > 0 && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRedCard(target) && !target.redCardUsed) {
        target.redCardUsed = true;
        if (this.pieceHP[fromSq] !== undefined) {
          const rcDmg = 5;
          this.pieceHP[fromSq] = Math.max(1, this.pieceHP[fromSq] - rcDmg);
          const aSt = this.getEffectivePieceStats(piece);
          this.updatePieceHpDOM(fromSq, this.pieceHP[fromSq], aSt.maxHp);
          CombatEngine.spawnDmgPopup(this, fromSq, rcDmg);
          this.addLog(`🟥 Red Card: penalized ${PIECE_NAMES[piece.type] || 'Attacker'} for 5 true recoil damage!`);
        }
      }

      // Weakness Policy enrage (+8 ATK on super effective or crit)
      if (dmg > 0 && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasWeaknessPolicy(target) && !target.weaknessPolicyTriggered) {
        if (isCrit || (typeCombat && typeCombat.multiplier > 1.0)) {
          target.weaknessPolicyTriggered = true;
          target._battleBonusAtk = (target._battleBonusAtk || 0) + 8;
          this.addLog(`📜 Weakness Policy activated! ${PIECE_NAMES[target.type] || 'Defender'} gained +8 ATK!`);
        }
      }

      // Shed Shell barrier (when HP <= 30%)
      const remainingDefHp = this.pieceHP[toSq] - dmg;
      if (remainingDefHp > 0 && remainingDefHp <= Math.round(tSt.maxHp * 0.30) && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasShedShell(target) && !target.shedShellUsed) {
        target.shedShellUsed = true;
        const shieldAmt = 12;
        this.pieceHP[toSq] = Math.min(tSt.maxHp, remainingDefHp + shieldAmt);
        dmg = 0;
        this.updatePieceHpDOM(toSq, this.pieceHP[toSq], tSt.maxHp);
        CombatEngine.spawnHealPopup(this, toSq, shieldAmt);
        this.addLog(`🐚 Shed Shell: granted 12 HP emergency barrier to ${PIECE_NAMES[target.type] || 'Defender'}!`);
      }

      // Sitrus Berry emergency heal (when HP <= 50%)
      const curRemainingHp = this.pieceHP[toSq] - dmg;
      if (curRemainingHp > 0 && curRemainingHp <= Math.round(tSt.maxHp * 0.50) && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasSitrusBerry(target) && !target.sitrusBerryUsed) {
        target.sitrusBerryUsed = true;
        const healAmt = 16;
        const newHp = Math.min(tSt.maxHp, curRemainingHp + healAmt);
        this.pieceHP[toSq] = newHp;
        dmg = 0;
        this.updatePieceHpDOM(toSq, newHp, tSt.maxHp);
        CombatEngine.spawnHealPopup(this, toSq, healAmt);
        this.addLog(`🍊 Sitrus Berry consumed: restored +${healAmt} HP to ${PIECE_NAMES[target.type] || 'Defender'}!`);
      }

      // Smoke Ball detonation (when struck by direct hit)
      if (dmg > 0 && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasSmokeBall(target) && !target.smokeBallUsed) {
        target.smokeBallUsed = true;
        target.smokeTurns = 2;
        this.addLog(`💨 Smoke Ball detonated by ${PIECE_NAMES[target.type]}! Gained smoke shroud for next 2 turns!`);
      }

      // Sticky Barb attachment to attacker
      if (dmg > 0 && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasStickyBarb(target)) {
        piece.hasStickyBarbBleed = 3;
        this.addLog(`🌵 Sticky Barb latched onto attacker ${PIECE_NAMES[piece.type]} (-3 HP/round)!`);
      }

      // Custap Berry counter ambush (when remaining HP <= 30%)
      const remainingDefHpPre = this.pieceHP[toSq] - dmg;
      if (remainingDefHpPre > 0 && remainingDefHpPre <= Math.round(tSt.maxHp * 0.30) && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasCustapBerry(target) && !target.custapBerryUsed) {
        target.custapBerryUsed = true;
        if (this.pieceHP[fromSq] !== undefined) {
          const custapDmg = 10;
          this.pieceHP[fromSq] = Math.max(1, this.pieceHP[fromSq] - custapDmg);
          const aSt = this.getEffectivePieceStats(piece);
          this.updatePieceHpDOM(fromSq, this.pieceHP[fromSq], aSt.maxHp);
          CombatEngine.spawnDmgPopup(this, fromSq, custapDmg);
          this.addLog(`🍒 Custap Berry: ${PIECE_NAMES[target.type]} launched priority counter-strike for 10 true damage!`);
        }
      }

      // Starf Berry jackpot (when remaining HP <= 35%)
      if (remainingDefHpPre > 0 && remainingDefHpPre <= Math.round(tSt.maxHp * 0.35) && typeof TalismanSystem !== 'undefined' && TalismanSystem.hasStarfBerry(target) && !target.starfBerryUsed) {
        target.starfBerryUsed = true;
        const roll = Math.random();
        if (roll < 0.33) {
          target._battleBonusAtk = (target._battleBonusAtk || 0) + 10;
          this.addLog(`⭐ Starf Berry jackpot! ${PIECE_NAMES[target.type]} gained +10 ATK!`);
        } else if (roll < 0.66) {
          const healStarf = 24;
          this.pieceHP[toSq] = Math.min(tSt.maxHp, this.pieceHP[toSq] + healStarf);
          this.updatePieceHpDOM(toSq, this.pieceHP[toSq], tSt.maxHp);
          CombatEngine.spawnHealPopup(this, toSq, healStarf);
          this.addLog(`⭐ Starf Berry jackpot! ${PIECE_NAMES[target.type]} healed +${healStarf} HP!`);
        } else {
          target.hasStarfEvasion = true;
          this.addLog(`⭐ Starf Berry jackpot! ${PIECE_NAMES[target.type]} gained +35% Cosmic Evasion!`);
        }
      }

      // Check defender thorns / rocky helmet before attack resolution
      const defenderHadThorns = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasThorns(target);
      let thornsDmg = defenderHadThorns ? (TalismanSystem.getThornsDmg(target, dmg) || 1) : 0;
      if (target.color === W && typeof SynergySystem !== 'undefined') {
        thornsDmg += SynergySystem.getThornsDmg(target, this);
      }
      if (typeof TalismanSystem !== 'undefined' && (TalismanSystem.hasProtectivePads(piece) || (TalismanSystem.hasAirBalloon(piece) && !piece.airBalloonPopped))) {
        thornsDmg = 0;
      }
  
      CombatEngine.triggerAttack(this, fromSq, toSq, dmg, targetDies, () => {
        if (isCrit) {
          CombatEngine.spawnTextPopup(this, toSq, 'CRIT!', 'crit-popup');
        }
        if (isDodged) {
          CombatEngine.spawnTextPopup(this, toSq, 'DODGED!', 'dodge-popup');
        }
        // Floating Type Effectiveness popup
        if (typeCombat && typeCombat.descriptor && typeCombat.descriptor.popupText) {
          CombatEngine.spawnTextPopup(this, toSq, typeCombat.descriptor.popupText, typeCombat.descriptor.tag);
          if (typeCombat.multiplier >= 2.0 && typeof soundManager !== 'undefined') {
            soundManager.playSfx('crit');
          }
        }
        if (typeCombat && typeCombat.multiplier !== 1.0) {
          const atkName = PIECE_NAMES[piece.type] || piece.name || 'Unit';
          const defName = PIECE_NAMES[target.type] || target.name || 'Target';
          const atkTypeUpper = typeCombat.atkType.toUpperCase();
          const defTypesUpper = typeCombat.defTypes.map(t => t.toUpperCase()).join('/');
          const tileKind = typeCombat.onWhiteSquare ? 'White tile [Type 1]' : 'Black tile [Type 2]';
          if (typeCombat.multiplier >= 2.0) {
            this.addLog(`⚡ ${atkName} (${atkTypeUpper} on ${tileKind}) hit ${defName} (${defTypesUpper}): ${typeCombat.descriptor.label}! Dealt ${dmg} DMG!`);
          } else if (typeCombat.multiplier === 0) {
            this.addLog(`⛔ ${atkName} (${atkTypeUpper} on ${tileKind}) hit ${defName} (${defTypesUpper}): IMMUNE! (0 DMG)`);
          } else {
            this.addLog(`🛡️ ${atkName} (${atkTypeUpper} on ${tileKind}) hit ${defName} (${defTypesUpper}): ${typeCombat.descriptor.label}. Dealt ${dmg} DMG.`);
          }
        }
        if (phoenixRevived) {
          const reviveHp = Math.max(20, Math.round(tSt.maxHp * 0.3));
          this.pieceHP[toSq] = reviveHp;
          this.updatePieceHpDOM(toSq, reviveHp, tSt.maxHp);
          CombatEngine.spawnTextPopup(this, toSq, 'REVIVED!');
          if (typeof soundManager !== 'undefined') soundManager.playSfx('revive');
          if (this.spawnLandPuff) this.spawnLandPuff(toSq);
          this.addLog(`✨ Rainbow Wing revived ${PIECE_NAMES[target.type]} with ${reviveHp} HP!`);
        } else if (focusSashed) {
          this.pieceHP[toSq] = 1;
          this.updatePieceHpDOM(toSq, 1, tSt.maxHp);
          CombatEngine.spawnTextPopup(this, toSq, 'FOCUS SASH!');
          if (typeof soundManager !== 'undefined') soundManager.playSfx('revive');
          this.addLog(`🎗️ Focus Sash kept ${PIECE_NAMES[target.type]} standing with 1 HP!`);
        } else if (targetDies) {
          if (piece.color === W) {
            this.addLog(`Your ${PIECE_NAMES[piece.type]} eliminated enemy ${PIECE_NAMES[target.type]}!`);
          } else {
            this.addLog(`Enemy ${PIECE_NAMES[piece.type]} defeated your ${PIECE_NAMES[target.type]}!`);
            const pi = this.placedPieces.findIndex(p => p.sq === toSq);
            if (pi !== -1) this.placedPieces.splice(pi, 1);
          }

          // Destiny Knot: payback 50% killer current HP
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasDestinyKnot(target) && !target.destinyKnotUsed) {
            target.destinyKnotUsed = true;
            if (this.pieceHP[fromSq] !== undefined) {
              const curKillerHp = this.pieceHP[fromSq];
              const knotDmg = Math.max(3, Math.round(curKillerHp * 0.5));
              this.pieceHP[fromSq] = Math.max(1, curKillerHp - knotDmg);
              CombatEngine.spawnDmgPopup(this, fromSq, knotDmg);
              this.addLog(`🪢 Destiny Knot pulled killer down! Inflicted ${knotDmg} payback damage to ${PIECE_NAMES[piece.type]}!`);
            }
          }
  
          delete this.pieceHP[toSq];
          const atkHp = this.pieceHP[fromSq];
          this.game.board[toSq] = piece;
          this.game.board[fromSq] = null;
          delete this.pieceHP[fromSq];
          this.pieceHP[toSq] = atkHp;
  
          if (piece.color === W) {
            const placed = this.placedPieces.find(p => p.sq === fromSq);
            if (placed) placed.sq = toSq;
          }
  
          this.removePieceDOM(toSq);
          this.movePieceDOM(fromSq, toSq);
          this.checkPawnPromotion(toSq, piece.color);
          this.checkNixieFlip(toSq, piece.color);
  
          // Lifesteal for Shell Bell on hit
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasLifesteal(piece)) {
            const pSt = this.getEffectivePieceStats(piece);
            const curAtkHp = this.pieceHP[toSq] !== undefined ? this.pieceHP[toSq] : pSt.maxHp;
            if (curAtkHp < pSt.maxHp) {
              let healAmt = Math.max(3, Math.round(dmg * 0.2));
              if (TalismanSystem.hasBigRoot(piece)) {
                healAmt = Math.round(healAmt * 1.5);
              }
              const healed = Math.min(pSt.maxHp, curAtkHp + healAmt);
              this.pieceHP[toSq] = healed;
              this.updatePieceHpDOM(toSq, healed, pSt.maxHp);
              CombatEngine.spawnHealPopup(this, toSq, healAmt);
              this.addLog(`🩸 Shell Bell restored +${healAmt} HP to ${PIECE_NAMES[piece.type]}!`);
            }
          }

          // Dragon Fang heal on kill
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasDragonFang(piece)) {
            const pSt = this.getEffectivePieceStats(piece);
            const curAtkHp = this.pieceHP[toSq] !== undefined ? this.pieceHP[toSq] : pSt.maxHp;
            if (curAtkHp < pSt.maxHp) {
              let healAmt = 15;
              if (TalismanSystem.hasBigRoot(piece)) {
                healAmt = Math.round(healAmt * 1.5);
              }
              const healed = Math.min(pSt.maxHp, curAtkHp + healAmt);
              this.pieceHP[toSq] = healed;
              this.updatePieceHpDOM(toSq, healed, pSt.maxHp);
              CombatEngine.spawnHealPopup(this, toSq, healAmt);
              this.addLog(`🐉 Dragon Fang restored +${healAmt} HP to ${PIECE_NAMES[piece.type]} upon slaying enemy!`);
            }
          }
  
          // Splash damage for Razor Claw
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasSplash(piece)) {
            const tr = this.game.row(toSq), tc = this.game.col(toSq);
            const splashDmg = Math.max(4, Math.round(stats.damage * 0.25));
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = tr + dr, nc = tc + dc;
                if (this.game.inBounds(nr, nc)) {
                  const nSq = this.game.idx(nr, nc);
                  const neighbor = this.game.board[nSq];
                  if (neighbor && neighbor.color !== piece.color && this.pieceHP[nSq] > 0) {
                    if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasSafetyGoggles(neighbor)) {
                      this.addLog(`🥽 Safety Goggles protected ${PIECE_NAMES[neighbor.type]} from splash damage!`);
                      continue;
                    }
                    this.pieceHP[nSq] = Math.max(0, this.pieceHP[nSq] - splashDmg);
                    CombatEngine.spawnDmgPopup(this, nSq, splashDmg);
                    const nSt = this.getEffectivePieceStats(neighbor);
                    this.updatePieceHpDOM(nSq, this.pieceHP[nSq], nSt.maxHp);
                    if (this.pieceHP[nSq] <= 0) {
                      delete this.pieceHP[nSq];
                      this.game.board[nSq] = null;
                      this.removePieceDOM(nSq);
                    }
                  }
                }
              }
            }
          }
        } else {
          // Target survives: attacker returns to fromSq
          const leftHp = this.pieceHP[toSq];
          if (piece.color === W) {
            this.addLog(`Your ${PIECE_NAMES[piece.type]} dealt ${dmg} damage to ${PIECE_NAMES[target.type]} (${leftHp} HP left)`);
          } else {
            this.addLog(`Enemy ${PIECE_NAMES[piece.type]} dealt ${dmg} damage to your ${PIECE_NAMES[target.type]} (${leftHp} HP left)`);
          }

          // Eject Button emergency escape teleport!
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasEjectButton(target) && !target.ejectButtonUsed && this.pieceHP[toSq] > 0) {
            target.ejectButtonUsed = true;
            const edgeSquares = [0,1,2,3,4,5,6,7, 56,57,58,59,60,61,62,63, 8,16,24,32,40,48, 15,23,31,39,47,55];
            const emptyEdges = edgeSquares.filter(sq => !this.game.board[sq]);
            if (emptyEdges.length > 0) {
              const destSq = emptyEdges[Math.floor(Math.random() * emptyEdges.length)];
              const targetHp = this.pieceHP[toSq];
              delete this.pieceHP[toSq];
              this.game.board[destSq] = target;
              this.game.board[toSq] = null;
              this.pieceHP[destSq] = targetHp;
              if (target.color === W) {
                const placed = this.placedPieces.find(p => p.sq === toSq);
                if (placed) placed.sq = destSq;
              }
              this.movePieceDOM(toSq, destSq);
              this.updatePieceHpDOM(destSq, targetHp, tSt.maxHp);
              CombatEngine.spawnTextPopup(this, destSq, 'EJECTED!');
              this.addLog(`🔴 Eject Button: ${PIECE_NAMES[target.type]} emergency-ejected to square ${destSq}!`);
            }
          }

          // Iron Ball knockback smash:
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasIronBall(piece) && this.pieceHP[toSq] > 0) {
            try {
              const fr = this.game.row(fromSq), fc = this.game.col(fromSq);
              const tr = this.game.row(toSq), tc = this.game.col(toSq);
              const dr = Math.sign(tr - fr);
              const dc = Math.sign(tc - fc);
              const pushR = tr + dr, pushC = tc + dc;
              if (this.game.inBounds(pushR, pushC)) {
                const pushSq = this.game.idx(pushR, pushC);
                if (!this.game.board[pushSq]) {
                  const targetHp = this.pieceHP[toSq];
                  delete this.pieceHP[toSq];
                  this.game.board[pushSq] = target;
                  this.game.board[toSq] = null;
                  this.pieceHP[pushSq] = targetHp;
                  if (target.color === W) {
                    const placed = this.placedPieces.find(p => p.sq === toSq);
                    if (placed) placed.sq = pushSq;
                  }
                  this.movePieceDOM(toSq, pushSq);
                  this.updatePieceHpDOM(pushSq, targetHp, tSt.maxHp);
                  CombatEngine.spawnTextPopup(this, pushSq, 'KNOCKBACK!');
                  this.addLog(`⛓️ Iron Ball: concussive smash knocked ${PIECE_NAMES[target.type]} back!`);
                }
              }
            } catch (err) {
              console.warn('Iron Ball knockback exception handled:', err);
            }
          }

          // Quick Claw Double Strike
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasQuickClaw(piece) && !piece.inDoubleStrike) {
            if (Math.random() < 0.25 && this.pieceHP[toSq] > 0) {
              const extraDmg = Math.max(3, Math.round(stats.damage * 0.25));
              this.pieceHP[toSq] = Math.max(0, this.pieceHP[toSq] - extraDmg);
              CombatEngine.spawnDmgPopup(this, toSq, extraDmg);
              const tSt = this.getEffectivePieceStats(target);
              this.updatePieceHpDOM(toSq, this.pieceHP[toSq], tSt.maxHp);
              this.addLog(`⚡ Quick Claw triggered Swift Double Strike for +${extraDmg} damage!`);
              if (this.pieceHP[toSq] <= 0) {
                delete this.pieceHP[toSq];
                this.game.board[toSq] = null;
                this.removePieceDOM(toSq);
              }
            }
          }
        }
  
        // Common attacker destination and piece reference
        const atkFinalSq = targetDies ? toSq : fromSq;
        const atkPiece = this.game.board[atkFinalSq];

        // Rocky Helmet / Thorns damage reflection
        if (thornsDmg > 0 && atkPiece) {
          if (this.pieceHP[atkFinalSq] === undefined) {
            const aSt = this.getEffectivePieceStats(atkPiece);
            this.pieceHP[atkFinalSq] = aSt.maxHp;
          }
          this.pieceHP[atkFinalSq] = Math.max(0, this.pieceHP[atkFinalSq] - thornsDmg);
          CombatEngine.spawnDmgPopup(this, atkFinalSq, thornsDmg);
          if (typeof soundManager !== 'undefined') soundManager.playSfx('reflect');
          const aSt = this.getEffectivePieceStats(atkPiece);
          this.updatePieceHpDOM(atkFinalSq, this.pieceHP[atkFinalSq], aSt.maxHp);
          this.addLog(`🛡️ Rocky Helmet reflected ${thornsDmg} damage to ${PIECE_NAMES[atkPiece.type]}!`);
        }

        // Life Orb recoil
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasLifeOrb(piece)) {
          if (atkPiece && this.pieceHP[atkFinalSq] !== undefined && this.pieceHP[atkFinalSq] > 2) {
            this.pieceHP[atkFinalSq] = Math.max(1, this.pieceHP[atkFinalSq] - 2);
            const aSt = this.getEffectivePieceStats(atkPiece);
            this.updatePieceHpDOM(atkFinalSq, this.pieceHP[atkFinalSq], aSt.maxHp);
            CombatEngine.spawnDmgPopup(this, atkFinalSq, 2);
            this.addLog(`🔮 Life Orb recoil: ${PIECE_NAMES[piece.type]} lost 2 HP!`);
          }
        }

        // Leftovers turn heal
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasLeftovers(piece)) {
          if (atkPiece && this.pieceHP[atkFinalSq] !== undefined) {
            const aSt = this.getEffectivePieceStats(atkPiece);
            if (this.pieceHP[atkFinalSq] < aSt.maxHp) {
              let leftAmt = 4;
              if (TalismanSystem.hasBigRoot(atkPiece)) {
                leftAmt = Math.round(leftAmt * 1.5);
              }
              const newHp = Math.min(aSt.maxHp, this.pieceHP[atkFinalSq] + leftAmt);
              this.pieceHP[atkFinalSq] = newHp;
              this.updatePieceHpDOM(atkFinalSq, newHp, aSt.maxHp);
              CombatEngine.spawnHealPopup(this, atkFinalSq, leftAmt);
              this.addLog(`🍏 Leftovers restored +${leftAmt} HP to ${PIECE_NAMES[piece.type]}!`);
            }
          }
        }

        // Wise Glasses permanent +1 ATK per hit landed
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasWiseGlasses(piece)) {
          piece._battleBonusAtk = Math.min(4, (piece._battleBonusAtk || 0) + 1);
          this.addLog(`👓 Wise Glasses: ${PIECE_NAMES[piece.type] || 'Unit'} gained +1 ATK (now +${piece._battleBonusAtk})!`);
        }

        // Mystic Water splash healing for adjacent allies
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasMysticWater(piece)) {
          const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
          const isWater = (pDef && (pDef.types?.includes('Water') || pDef.type1 === 'Water' || pDef.type2 === 'Water'));
          if (isWater) {
            const ar = this.game.row(atkFinalSq), ac = this.game.col(atkFinalSq);
            let healedAny = false;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = ar + dr, nc = ac + dc;
                if (this.game.inBounds(nr, nc)) {
                  const nSq = this.game.idx(nr, nc);
                  const neighbor = this.game.board[nSq];
                  if (neighbor && neighbor.color === piece.color && this.pieceHP[nSq] !== undefined) {
                    const nSt = this.getEffectivePieceStats(neighbor);
                    if (this.pieceHP[nSq] < nSt.maxHp) {
                      let mHeal = 3;
                      if (TalismanSystem.hasBigRoot(neighbor)) mHeal = Math.round(mHeal * 1.5);
                      this.pieceHP[nSq] = Math.min(nSt.maxHp, this.pieceHP[nSq] + mHeal);
                      this.updatePieceHpDOM(nSq, this.pieceHP[nSq], nSt.maxHp);
                      CombatEngine.spawnHealPopup(this, nSq, mHeal);
                      healedAny = true;
                    }
                  }
                }
              }
            }
            if (healedAny) {
              this.addLog(`💧 Mystic Water: splashed +3 HP healing to adjacent allies!`);
            }
          }
        }

        // Toxic Orb lifesteal
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasToxicOrb(piece) && piece.isToxicPoisoned) {
          const pSt = this.getEffectivePieceStats(piece);
          const curAtkHp = this.pieceHP[atkFinalSq] !== undefined ? this.pieceHP[atkFinalSq] : pSt.maxHp;
          if (curAtkHp < pSt.maxHp) {
            let healAmt = Math.max(2, Math.round(dmg * 0.20));
            if (TalismanSystem.hasBigRoot(piece)) healAmt = Math.round(healAmt * 1.5);
            const newHp = Math.min(pSt.maxHp, curAtkHp + healAmt);
            this.pieceHP[atkFinalSq] = newHp;
            this.updatePieceHpDOM(atkFinalSq, newHp, pSt.maxHp);
            CombatEngine.spawnHealPopup(this, atkFinalSq, healAmt);
            this.addLog(`☠️ Toxic Orb: Poison rush lifesteal restored +${healAmt} HP to ${PIECE_NAMES[piece.type]}!`);
          }
        }

        // Flame Orb heatwave AoE to adjacent enemies
        if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasFlameOrb(piece)) {
          const ar = this.game.row(atkFinalSq), ac = this.game.col(atkFinalSq);
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = ar + dr, nc = ac + dc;
              if (this.game.inBounds(nr, nc)) {
                const nSq = this.game.idx(nr, nc);
                const neighbor = this.game.board[nSq];
                if (neighbor && neighbor.color !== piece.color && this.pieceHP[nSq] > 0) {
                  this.pieceHP[nSq] = Math.max(0, this.pieceHP[nSq] - 3);
                  CombatEngine.spawnDmgPopup(this, nSq, 3);
                  const nSt = this.getEffectivePieceStats(neighbor);
                  this.updatePieceHpDOM(nSq, this.pieceHP[nSq], nSt.maxHp);
                  if (this.pieceHP[nSq] <= 0) {
                    delete this.pieceHP[nSq];
                    this.game.board[nSq] = null;
                    this.removePieceDOM(nSq);
                  }
                }
              }
            }
          }
          this.addLog(`🔥 Flame Orb heatwave radiated 3 damage to adjacent enemies!`);
        }

        // Synergy On-Hit (Electric Paralyze, Fire Burn, Poison Venom) & Fairy Blessing Heal
        if (piece.color === W && typeof SynergySystem !== 'undefined' && dmg > 0) {
          SynergySystem.onHit(piece, target, dmg, this, toSq);
          SynergySystem.triggerFairyHeal(piece, this);
        }

        // Synergy Grass Lifesteal
        if (piece.color === W && typeof SynergySystem !== 'undefined' && dmg > 0) {
          const grassRatio = SynergySystem.getLifestealRatio(piece, this);
          if (grassRatio > 0) {
            const pSt = this.getEffectivePieceStats(piece);
            let healAmt = Math.max(3, Math.round(dmg * grassRatio));
            if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasBigRoot(piece)) {
              healAmt = Math.round(healAmt * 1.5);
            }
            const curAtkHp = this.pieceHP[atkFinalSq] !== undefined ? this.pieceHP[atkFinalSq] : pSt.maxHp;
            if (curAtkHp < pSt.maxHp) {
              const healed = Math.min(pSt.maxHp, curAtkHp + healAmt);
              this.pieceHP[atkFinalSq] = healed;
              this.updatePieceHpDOM(atkFinalSq, healed, pSt.maxHp);
              CombatEngine.spawnHealPopup(this, atkFinalSq, healAmt);
              this.addLog(`🌿 Grass Lifesteal restored +${healAmt} HP to ${PIECE_NAMES[piece.type]}!`);
            }
          }
        }

        // Synergy Fighting Splash Damage
        if (piece.color === W && typeof SynergySystem !== 'undefined' && dmg > 0) {
          const fightSplash = SynergySystem.getSplashRatio(piece, this);
          if (fightSplash > 0) {
            const splashDmg = Math.max(3, Math.round(stats.damage * fightSplash));
            const tr = this.game.row(toSq), tc = this.game.col(toSq);
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = tr + dr, nc = tc + dc;
                if (this.game.inBounds(nr, nc)) {
                  const nSq = this.game.idx(nr, nc);
                  const neighbor = this.game.board[nSq];
                  if (neighbor && neighbor.color !== piece.color && this.pieceHP[nSq] > 0) {
                    if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasSafetyGoggles(neighbor)) {
                      this.addLog(`🥽 Safety Goggles protected ${PIECE_NAMES[neighbor.type]} from splash damage!`);
                      continue;
                    }
                    this.pieceHP[nSq] = Math.max(0, this.pieceHP[nSq] - splashDmg);
                    CombatEngine.spawnDmgPopup(this, nSq, splashDmg);
                    const nSt = this.getEffectivePieceStats(neighbor);
                    this.updatePieceHpDOM(nSq, this.pieceHP[nSq], nSt.maxHp);
                    if (this.pieceHP[nSq] <= 0) {
                      delete this.pieceHP[nSq];
                      this.game.board[nSq] = null;
                      this.removePieceDOM(nSq);
                    }
                  }
                }
              }
            }
          }
        }

        // Synergy Ghost Death Curse
        if (target.color === W && targetDies && typeof SynergySystem !== 'undefined') {
          SynergySystem.triggerGhostDeathCurse(target, piece, this, atkFinalSq);
        }

        if (atkPiece && this.pieceHP[atkFinalSq] <= 0) {
          const aSt = this.getEffectivePieceStats(atkPiece);
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(atkPiece) && !atkPiece.phoenixUsed) {
            atkPiece.phoenixUsed = true;
            const revHp = Math.max(15, Math.round(aSt.maxHp * 0.25));
            this.pieceHP[atkFinalSq] = revHp;
            this.updatePieceHpDOM(atkFinalSq, revHp, aSt.maxHp);
            if (typeof soundManager !== 'undefined') soundManager.playSfx('revive');
            if (this.spawnLandPuff) this.spawnLandPuff(atkFinalSq);
            this.addLog(`✨ Rainbow Wing revived ${PIECE_NAMES[atkPiece.type]} with ${revHp} HP!`);
          } else {
            if (atkPiece.color === W) {
              this.addLog(`Your ${PIECE_NAMES[atkPiece.type]} was eliminated by reflected damage!`);
              const pi = this.placedPieces.findIndex(p => p.sq === atkFinalSq);
              if (pi !== -1) this.placedPieces.splice(pi, 1);
            } else {
              this.addLog(`Enemy ${PIECE_NAMES[atkPiece.type]} was eliminated by thorns reflection!`);
            }
            delete this.pieceHP[atkFinalSq];
            this.game.board[atkFinalSq] = null;
            this.removePieceDOM(atkFinalSq);
          }
        }
  
        // Combat occurred: reset repetition tracking
        this.resetRepetitionTracking();
  
        this.updateEnemyCard();
        this.updateStats();
        this.isAnimating = false;
        if (onComplete) onComplete();
      });
    } else {
      // ---- STANDARD CHESS ADVANCE TO EMPTY SQUARE ----
      CombatEngine.triggerAdvance(this, fromSq, toSq, () => {
        const atkHp = this.pieceHP[fromSq];
        this.game.board[toSq] = piece;
        this.game.board[fromSq] = null;
        delete this.pieceHP[fromSq];
        this.pieceHP[toSq] = atkHp;
  
        if (piece.color === W) {
          const placed = this.placedPieces.find(p => p.sq === fromSq);
          if (placed) placed.sq = toSq;
        }
  
        this.movePieceDOM(fromSq, toSq);
        this.checkPawnPromotion(toSq, piece.color);
        this.checkNixieFlip(toSq, piece.color);

        // Synergy Bug / Grass Move Heal
        if (piece.color === W && typeof SynergySystem !== 'undefined') {
          const syns = SynergySystem.getActiveSynergies(this);
          let moveHeal = 0;
          if (syns.bug && syns.bug.isActive && syns.bug.activeTier && syns.bug.activeTier.swarmMoveHeal) {
            const elements = SynergySystem.getPieceElements(piece);
            if (elements.includes('bug') || syns.bug.activeTier.level >= 5) {
              moveHeal += syns.bug.activeTier.swarmMoveHeal;
            }
          }
          if (syns.grass && syns.grass.isActive && syns.grass.activeTier && syns.grass.activeTier.teamMoveHeal) {
            moveHeal += syns.grass.activeTier.teamMoveHeal;
          }
          if (moveHeal > 0) {
            const pSt = this.getEffectivePieceStats(piece);
            const curHp = this.pieceHP[toSq] !== undefined ? this.pieceHP[toSq] : pSt.maxHp;
            if (curHp < pSt.maxHp) {
              const healed = Math.min(pSt.maxHp, curHp + moveHeal);
              this.pieceHP[toSq] = healed;
              this.updatePieceHpDOM(toSq, healed, pSt.maxHp);
              CombatEngine.spawnHealPopup(this, toSq, moveHeal);
            }
          }
        }
  
        // Check & record repetition / shuffling
        this.checkAndRecordRepetition(fromSq, toSq, piece);
  
        this.updateEnemyCard();
        this.updateStats();
        this.isAnimating = false;
        if (onComplete) onComplete();
      });
    }
  },
  
  // ---- Repetition / Draw Detection (Hòa cờ sau 5 nước = Win) ----

  getBoardStateHash() {
    const pieces = [];
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (p) pieces.push(`${i}:${p.color}${p.type}:${this.pieceHP[i] || 1}`);
    }
    return pieces.join('|');
  },

  resetRepetitionTracking() {
    this.repetitionStreak = 0;
    this.repetitionStates = {};
    this.recentMoves = [];
    this.movesWithoutDamage = 0;
  },

  checkAndRecordRepetition(fromSq, toSq, piece) {
    this.movesWithoutDamage++;
  
    // 1. Check if this move reverses a recent move by this side (A -> B then B -> A)
    const isReversal = this.recentMoves.some(
      m => m.color === piece.color && m.from === toSq && m.to === fromSq
    );
  
    // Save to recent moves list (keep last 12 moves)
    this.recentMoves.push({ color: piece.color, from: fromSq, to: toSq, type: piece.type });
    if (this.recentMoves.length > 12) this.recentMoves.shift();
  
    // 2. Check board state repetition (layout hash)
    const hash = this.getBoardStateHash();
    this.repetitionStates[hash] = (this.repetitionStates[hash] || 0) + 1;
    const stateCount = this.repetitionStates[hash];
  
    // Check single piece back-and-forth oscillation
    const colorMoves = this.recentMoves.filter(m => m.color === piece.color);
    let singlePieceOscillations = 0;
    if (colorMoves.length >= 4) {
      const last = colorMoves[colorMoves.length - 1];
      const prev = colorMoves[colorMoves.length - 2];
      const prev2 = colorMoves[colorMoves.length - 3];
      const prev3 = colorMoves[colorMoves.length - 4];
      if (last.from === prev.to && last.to === prev.from &&
        prev.from === prev2.to && prev.to === prev2.from &&
        prev2.from === prev3.to && prev2.to === prev3.from) {
        singlePieceOscillations = 4;
      }
    }
  
    if (isReversal || stateCount >= 2) {
      this.repetitionStreak++;
    } else {
      this.repetitionStreak = Math.max(0, this.repetitionStreak - 1);
    }
  },
  
  // Helper: Find all pieces of a color attacking a target square on the board

  getAttackersOnSquare(sq, byColor) {
    const attackers = [];
    for (let s = 0; s < 64; s++) {
      const p = this.game.board[s];
      if (p && p.color === byColor) {
        const moves = this.game.pseudoMoves(s);
        const atkMove = moves.find(m => m.to === sq && !m.moveOnly);
        if (atkMove) {
          const stats = this.getEffectivePieceStats(p);
          const val = (PIECE_VALUES[p.type] || 100) + (p.talismans ? p.talismans.length * 150 : 0);
          attackers.push({ sq: s, piece: p, damage: stats.damage, value: val, move: atkMove });
        }
      }
    }
    return attackers;
  },
  
  // Tactical Helper: Evaluate Petard Cannon aiming along orthogonal files/ranks

  evaluatePetardCannonAim(sq, color) {
    const oppColor = color === W ? B : W;
    const r = this.game.row(sq), c = this.game.col(sq);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let bestAimScore = 0;
  
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      let foundScreen = false;
      while (this.game.inBounds(nr, nc)) {
        const i = this.game.idx(nr, nc);
        const p = this.game.board[i];
        if (!foundScreen) {
          if (p) foundScreen = true;
        } else {
          if (p) {
            if (p.color === oppColor) {
              const val = (PIECE_VALUES[p.type] || 100);
              const pAim = p.type === 'K' ? 1600 : p.type === 'Q' ? 1100 : val >= 300 ? 650 : 380;
              if (pAim > bestAimScore) bestAimScore = pAim;
            }
            break;
          }
        }
        nr += dr; nc += dc;
      }
    }
    return bestAimScore;
  },
  
  // Tactical Helper: Detect if an allied piece moving to toSq creates a screen for Petard to fire

  isAllyCreatingPetardScreen(fromSq, toSq, color) {
    const oppColor = color === W ? B : W;
    const tr = this.game.row(toSq), tc = this.game.col(toSq);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
    for (const [dr, dc] of dirs) {
      let petardFound = false;
      let pr = tr - dr, pc = tc - dc;
      while (this.game.inBounds(pr, pc)) {
        const pi = this.game.idx(pr, pc);
        if (pi === fromSq) { pr -= dr; pc -= dc; continue; }
        const p = this.game.board[pi];
        if (p) {
          if (p.color === color && p.type === 'E') petardFound = true;
          break;
        }
        pr -= dr; pc -= dc;
      }
  
      if (petardFound) {
        let nr = tr + dr, nc = tc + dc;
        while (this.game.inBounds(nr, nc)) {
          const ni = this.game.idx(nr, nc);
          if (ni === fromSq) { nr += dr; nc += dc; continue; }
          const np = this.game.board[ni];
          if (np) {
            if (np.color === oppColor) return true;
            break;
          }
          nr += dr; nc += dc;
        }
      }
    }
    return false;
  },

  hasLegalMoves(color) {
    for (let sq = 0; sq < 64; sq++) {
      const p = this.game.board[sq];
      if (!p || p.color !== color) continue;
      const pMoves = this.game.pseudoMoves(sq);
      for (const m of pMoves) {
        if (m.captureOnly) {
          const target = this.game.board[m.to];
          if (!target || target.color === color) continue;
        }
        return true;
      }
    }
    return false;
  },
  
  // =========================================================================
  // MASTER AI EVALUATION ENGINE: TACTICAL & TALISMAN MASTER
  // Supports White (Auto Battler Grandmaster Level 4) and Black (Progression)
  // =========================================================================

  checkBattleStatus() {
    let w = 0, b = 0;
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (!p) continue;
      if (p.color === W) w++; else b++;
    }
    if (w === 0 && b === 0) return 'draw';
    if (b === 0) return 'win';
    if (w === 0) return 'loss';
    return 'playing';
  },

  checkPawnPromotion(sq, color) {
    // Pokemon evolve through battles (3 battles for stage 1 -> 2, 5 battles for stage 2 -> 3)
    // not by reaching the end of the board.
    return;
  },

  checkNixieFlip(sq, color) {
    const piece = this.game.board[sq];
    if (!piece || piece.type !== 'X') return;
    const row = this.game.row(sq);
    let justFlipped = false;
  
    if (color === W) {
      if (row === 0 && piece.fwd !== 1) {
        piece.fwd = 1;
        justFlipped = true;
      } else if (row === 7 && piece.fwd !== -1) {
        piece.fwd = -1;
        justFlipped = true;
      }
    } else {
      if (row === 7 && piece.fwd !== -1) {
        piece.fwd = -1;
        justFlipped = true;
      } else if (row === 0 && piece.fwd !== 1) {
        piece.fwd = 1;
        justFlipped = true;
      }
    }
  
    if (justFlipped) {
      if (typeof CombatEngine !== 'undefined') {
        CombatEngine.spawnTextPopup(this, sq, 'REVERSED!', 'revive-popup');
      }
      if (typeof soundManager !== 'undefined') {
        soundManager.playSfx('promote');
      }
      this.addLog(`🔱 ${color === W ? 'Your' : 'Enemy'} Nixie reached the end of the board and reversed strike direction!`);
    }
  },

  handleStageVictory() {
    this.isAnimating = false;
    this.postMoveAttackPhase = null;
    this.updateSkipButton();
    this.clearAutoBattleTimer();
  
    // 1. Số quân còn lại trên bàn của mình: +1 vàng mỗi quân
    let survivingCount = 0;

    if (this.hexCombat && this.hexCombat.winner === 'w') {
      survivingCount = [...this.hexCombat.units.values()]
        .filter(unit => unit.color === 'w' && unit.hp > 0)
        .length;
    } else {
      for (let i = 0; i < this.game.board.length; i++) {
        const p = this.game.board[i];
        if (p && p.color === W) survivingCount++;
      }
    }
  
    // 2. Thưởng số nước đi (đã +2 vàng tất cả các mốc: 7, 5, 3):
    // - Dưới 5 nước (< 5): +7 vàng (trước là +5)
    // - Dưới 10 nước (< 10): +5 vàng (trước là +3)
    // - Trên 10 nước (>= 10): +3 vàng (trước là +1)
    let speedBonus = 3;

    if (this.hexCombat) {
      // Auto Chess: thưởng theo thời gian chiến đấu
      const battleSeconds = this.hexCombat.tickCount / this.hexCombat.tickRate;

      if (battleSeconds < 15) {
        speedBonus = 7;
      } else if (battleSeconds < 30) {
        speedBonus = 5;
      } else {
        speedBonus = 3;
      }
    } else {
      // Giữ công thức cũ cho chế độ đánh theo lượt
      if (this.roundMoves < 5) {
        speedBonus = 7;
      } else if (this.roundMoves < 10) {
        speedBonus = 5;
      }
    }
  
    const synergyGold = (typeof SynergySystem !== 'undefined') ? SynergySystem.getBonusGoldWin(this) : 0;
    const totalReward = survivingCount + speedBonus + synergyGold;
    this.gold += totalReward;
    if (synergyGold > 0) {
      this.addLog(`✨ Normal Synergy bonus: +${synergyGold} Gold!`);
    }
    this.updateStats();

    // Astral Tree Skill Points Reward
    if (typeof MetaProgression !== 'undefined') {
      const awarded = MetaProgression.awardStageClearPoints(this.stage);
      if (awarded > 0) {
        this.addLog(`Astral Tree: +${awarded} Skill Point earned! Total: ${MetaProgression.getSkillPoints()}`);
        if (this.showToast) {
          this.showToast(`+${awarded} Skill Point! (Total: ${MetaProgression.getSkillPoints()})`, 'cyan');
        }
      }
    }

    // 3. Process battles fought and evolution for deployed Pokemon (deferred to next stage animation)
    const evolvedList = [];
    if (this.deployedInBattleIds && this.deployedInBattleIds.size > 0) {
      for (const invId of this.deployedInBattleIds) {
        const item = this.inventory.find(i => i.id === invId);
        if (!item) continue;
        item.battlesFought = (item.battlesFought || 0) + 1;
        const pDef = PIECES[item.type];
        const bugDiscount = (typeof SynergySystem !== 'undefined') ? SynergySystem.getEvoDiscount(item, this) : 0;
        const reqBattles = Math.max(1, (pDef?.battlesToEvolve || 3) - bugDiscount);
        // Only evolve via battles if battlesToEvolve > 0 and does not require an item
        if (pDef && pDef.battlesToEvolve && pDef.battlesToEvolve > 0 && !pDef.evoItem && item.battlesFought >= reqBattles) {
          let nextType = pDef.nextEvo;

          // Branched battle evolutions (e.g. Scyther, Sneasel, Wooper, Meowth, Yamask, Nincada, Burmy, Tyrogue, Wurmple, Clamperl):
          if (pDef.evoBranches && pDef.evoBranches.length > 0 && (!nextType || nextType === 'null')) {
            nextType = pDef.evoBranches[Math.floor(Math.random() * pDef.evoBranches.length)];
          }

          if (nextType) {
            const oldType = item.type;
            const oldName = pDef.name;
            const nextDef = PIECES[nextType];
            const newName = nextDef ? nextDef.name : nextType;
            evolvedList.push({ oldName, newName, oldType, nextType, invId: item.id });
          }
        }
      }
    }
  
    this.pendingEvolutions = evolvedList;
  
    const modal = document.getElementById('victoryModal');
    const title = modal ? modal.querySelector('.modal-title') : null;
    const subtitle = document.getElementById('victorySubtitle');
    const rewardPill = document.getElementById('victoryRewardText');
  
    if (title) title.textContent = 'STAGE VICTORY!';
    const duration = this.hexCombat
      ? `${(this.hexCombat.tickCount / this.hexCombat.tickRate).toFixed(1)}s`
      : `${this.roundMoves} moves`;
    if (subtitle) {
      subtitle.textContent = `Stage ${this.stage} Cleared in ${duration}! (${survivingCount} units survived)`;
    }
    this.addLog(`=== STAGE ${this.stage} VICTORY: +${totalReward}g (+${survivingCount} units, +${speedBonus}g in ${duration}) ===`);
  
    if (rewardPill) {
      rewardPill.innerHTML = `+${totalReward} <img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="modal-coin-icon" alt="Gold" /> (+${survivingCount} units, +${speedBonus} speed bonus)`;
    }
    if (modal) modal.classList.remove('hidden');
  },

  handleStageDefeat(reason) {
    this.isAnimating = false;
    this.postMoveAttackPhase = null;
    this.updateSkipButton();
    this.clearAutoBattleTimer();
    this.resetDittoTransformations();
    if (typeof soundManager !== 'undefined') soundManager.playSfx('defeat');
    const modal = document.getElementById('defeatModal');
    const subtitle = document.getElementById('defeatSubtitle');
    const statsEl = document.getElementById('defeatStats');
  
    if (subtitle) subtitle.textContent = reason || 'All your pieces have fallen in battle!';
    if (statsEl) statsEl.innerHTML = `Highest Stage Reached: Stage ${this.stage} | Total Gold: ${this.gold} <img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="modal-coin-icon" alt="Gold" />`;
    if (modal) modal.classList.remove('hidden');
  },

  handleStageDraw() {
    this.isAnimating = false;
    this.postMoveAttackPhase = null;
    this.updateSkipButton();
    this.clearAutoBattleTimer();
    this.resetDittoTransformations();
    if (typeof soundManager !== 'undefined') soundManager.playSfx('defeat');
    const modal = document.getElementById('drawModal');
    const subtitle = document.getElementById('drawSubtitle');
    if (subtitle) {
      subtitle.textContent = 'In a single collapse, all units on both sides fell into the abyss!';
    }
    this.addLog(`🤝 === STALEMATE DRAW: ALL UNITS FELL INTO THE ABYSS ===`);
    if (modal) modal.classList.remove('hidden');
  },

  retryBattle() {
    const modal = document.getElementById('drawModal');
    if (modal) modal.classList.add('hidden');
    // Reuse the Hex setup flow, including boss flags, scaling and all 28
    // player deployment cells. Inventory and setupFormation are preserved.
    this.setupNewStage();
    this.addLog('🔄 Stalemate! Your units were preserved. Ready for rematch!');
  },

  // ---- Sudden Death Tile Collapse Mechanics ----

  getTileLayer(sq) {
    const r = Math.floor(sq / 8);
    const c = sq % 8;
    return Math.min(r, 7 - r, c, 7 - c);
  },

  getSquaresInLayer(layer) {
    const res = [];
    for (let i = 0; i < 64; i++) {
      if (this.getTileLayer(i) === layer) res.push(i);
    }
    return res;
  },

  countPieces(color) {
    let count = 0;
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (p && p.color === color) count++;
    }
    return count;
  },

  checkSuddenDeathCollapse(onDone) {
    if (this.collapsePhase === undefined) this.collapsePhase = 0;

    // Trigger Sudden Death after 15 total piece moves or at least 8 full rounds:
    const suddenDeathTriggered = (this.roundMoves >= 15 || (this.battleRounds && this.battleRounds >= 8));

    // Phase 0: Before Sudden Death starts
    if (this.collapsePhase === 0) {
      if (!suddenDeathTriggered) {
        if (onDone) onDone();
        return;
      }

      // Start Sudden Death: Outermost rim (Layer 0, 28 tiles) begins shaking!
      this.collapsePhase = 1;
      const layer0Squares = this.getSquaresInLayer(0).filter(s => !this.collapsedSquares.has(s));
      this.shakingSquares = new Set(layer0Squares);
      layer0Squares.forEach(sq => {
        const el = this.getSquareEl(sq);
        if (el) el.classList.add('tile-shaking');
      });
      if (typeof soundManager !== 'undefined') soundManager.playSfx('earthquake');
      this.addLog(`⚠️ [SUDDEN DEATH] Vòng bo sụp đổ bắt đầu! Viền ngoài cùng (Layer 0) đang rung rinh dữ dội!`);
      if (onDone) onDone();
      return;
    }

    // Phase 1+: Collapse currently shaking squares, then shake the NEXT inner ring layer!
    if (this.shakingSquares && this.shakingSquares.size > 0) {
      this.isAnimating = true;
      if (typeof soundManager !== 'undefined') soundManager.playSfx('collapse');

      const fallingSquares = [...this.shakingSquares];
      fallingSquares.forEach(sq => {
        const el = this.getSquareEl(sq);
        if (el) {
          el.classList.remove('tile-shaking');
          el.classList.add('tile-falling');
        }
      });

      // Log which ring layer just collapsed
      if (this.collapsePhase === 1) {
        this.addLog(`💥 Viền ngoài cùng (Layer 0) đã sụp đổ xuống vực thẳm!`);
      } else if (this.collapsePhase === 2) {
        this.addLog(`💥 Viền thứ hai (Layer 1) đã sụp đổ xuống vực thẳm!`);
      } else if (this.collapsePhase === 3) {
        this.addLog(`💥 Viền thứ ba (Layer 2) đã sụp đổ! Chỉ còn 4 ô trung tâm!`);
      } else {
        this.addLog(`💥 Ô trung tâm đã sụp đổ xuống vực thẳm!`);
      }

      setTimeout(() => {
        // Finalize collapse of falling squares
        fallingSquares.forEach(sq => {
          this.collapsedSquares.add(sq);
          if (this.game.collapsedSquares) this.game.collapsedSquares.add(sq);

          const el = this.getSquareEl(sq);
          if (el) {
            el.classList.remove('tile-falling');
            el.classList.add('tile-collapsed');
            el.querySelectorAll('.piece, .piece-shadow, .piece-hud').forEach(c => c.remove());
          }

          // Eliminate piece on collapsed square if any
          const p = this.game.board[sq];
          if (p) {
            if (p.color === W) {
              const pi = this.placedPieces.findIndex(item => item.sq === sq);
              if (pi !== -1) this.placedPieces.splice(pi, 1);
            }
            this.game.board[sq] = null;
            delete this.pieceHP[sq];
          }
        });

        this.shakingSquares.clear();

        // Check unit count of both sides after collapse
        const wAlive = this.countPieces(W);
        const bAlive = this.countPieces(B);

        // Stalemate Draw: both sides lose all remaining units together
        if (wAlive === 0 && bAlive === 0) {
          this.isAnimating = false;
          setTimeout(() => this.handleStageDraw(), 400);
          return;
        }

        if (wAlive === 0) {
          this.isAnimating = false;
          setTimeout(() => this.handleStageDefeat('All your pieces fell into the abyss!'), 400);
          return;
        }

        if (bAlive === 0) {
          this.isAnimating = false;
          setTimeout(() => this.handleStageVictory(), 400);
          return;
        }

        // Advance to next collapse phase and shake the next layer:
        if (this.collapsePhase === 1) {
          // Layer 0 collapsed -> Shake Layer 1 (20 squares)
          this.collapsePhase = 2;
          const layer1Squares = this.getSquaresInLayer(1).filter(s => !this.collapsedSquares.has(s));
          this.shakingSquares = new Set(layer1Squares);
          layer1Squares.forEach(sq => {
            const el = this.getSquareEl(sq);
            if (el) el.classList.add('tile-shaking');
          });
          if (typeof soundManager !== 'undefined') soundManager.playSfx('earthquake');
          this.addLog(`⚠️ Viền thứ hai (Layer 1) đang rung rinh! Sẽ sụp đổ ở hiệp kế tiếp!`);
        } else if (this.collapsePhase === 2) {
          // Layer 1 collapsed -> Shake Layer 2 (12 squares)
          this.collapsePhase = 3;
          const layer2Squares = this.getSquaresInLayer(2).filter(s => !this.collapsedSquares.has(s));
          this.shakingSquares = new Set(layer2Squares);
          layer2Squares.forEach(sq => {
            const el = this.getSquareEl(sq);
            if (el) el.classList.add('tile-shaking');
          });
          if (typeof soundManager !== 'undefined') soundManager.playSfx('earthquake');
          this.addLog(`⚠️ Viền thứ ba (Layer 2) đang rung rinh! Sẽ sụp đổ ở hiệp kế tiếp!`);
        } else if (this.collapsePhase === 3) {
          // Layer 2 collapsed -> Shake Layer 3 (4 center tiles: [27, 28, 35, 36])
          this.collapsePhase = 4;
          const remainingCenter = [27, 28, 35, 36].filter(s => !this.collapsedSquares.has(s));
          if (remainingCenter.length > 0) {
            this.shakingSquares = new Set(remainingCenter);
            remainingCenter.forEach(sq => {
              const el = this.getSquareEl(sq);
              if (el) el.classList.add('tile-shaking');
            });
            if (typeof soundManager !== 'undefined') soundManager.playSfx('earthquake');
            this.addLog(`⚠️ 4 ô trung tâm cuối cùng đang rung rinh! Sẽ sụp đổ ở hiệp kế tiếp!`);
          }
        } else {
          // Center tiles collapsed
          this.collapsePhase = 5;
        }

        this.isAnimating = false;
        if (onDone) onDone();
      }, 650);
    } else {
      if (onDone) onDone();
    }
  }
  
  // ---- Custom In-Game Retro Pixel Toast & Confirm Dialog ----

});
