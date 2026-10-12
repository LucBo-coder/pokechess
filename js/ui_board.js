// =============================================
// CHESS+ ROGUELIKE: BOARD RENDERING & VISUAL CUES
// Board DOM, Piece animations, Click/Hover handlers
// Move preview, Ditto transform, Evolution animations
// =============================================

'use strict';


// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {

  getAutoFormationScore(piece, square, enemies) {
    const role = String(
      typeof HexUnitConfig !== 'undefined'
        ? HexUnitConfig.getRole(piece.type) || 'fighter'
        : 'fighter'
    ).toLowerCase();

    const row = Math.floor(square / 7);
    const col = square % 7;

    // Hàng 4 gần địch nhất; hàng 7 xa nhất.
    const preferredRows = {
      tank: 4,
      fighter: 4,
      assassin: 4,
      mage: 7,
      marksman: 7
    };

    let score = -Math.abs(row - (preferredRows[role] ?? 5)) * 12;

    // Tank đứng giữa, Assassin đánh hai cánh.
    if (role === 'tank') {
      score += (3 - Math.abs(col - 3)) * 3;
    } else if (role === 'assassin') {
      score += Math.abs(col - 3) * 3;
    } else if (role === 'fighter') {
      score += (3 - Math.abs(col - 3)) * 1.5;
    }

    // So sánh hệ với các Pokémon địch ở cùng khu vực.
    if (
      typeof TypeSystem !== 'undefined' &&
      typeof TypeSystem.getTypeEffectiveness === 'function' &&
      typeof TypeSystem.getEffectivePieceElements === 'function'
    ) {
      for (const enemy of enemies) {
        const enemyTypes = TypeSystem.getEffectivePieceElements(enemy.piece);
        const defendTypes = [
          enemyTypes?.element,
          enemyTypes?.element2
        ].filter(Boolean);

        if (!defendTypes.length) continue;

        const multiplier = TypeSystem.getHexAttack({ ...piece, square }, enemy.piece).multiplier;

        const enemyCol = enemy.square % 7;
        const columnDistance = Math.abs(col - enemyCol);
        const proximityWeight = Math.max(0, 4 - columnDistance);

        // Khắc hệ là ưu tiên bổ sung, không phá hoàn toàn đội hình class.
        score += (multiplier - 1) * proximityWeight * 6;
      }
    }

    return score;
  },

  autoArrangePlayerFormation() {
    if (this.phase !== 'setup' || this.isSetupAnimating) return;

    const units = [];

    for (let square = 28; square < 56; square++) {
      const piece = this.game.board[square];

      if (piece?.color === W) {
        units.push({ piece, oldSquare: square });
      }
    }

    if (!units.length) {
      this.showToast?.('Chưa có Pokémon trên sân!', 'warning');
      return;
    }

    const enemies = [];

    for (let square = 0; square < 28; square++) {
      const piece = this.game.board[square];

      if (piece?.color === B) {
        enemies.push({ piece, square });
      }
    }

    const availableSquares = Array.from(
      { length: 28 },
      (_, i) => i + 28
    );

    const assignments = [];

    // Ưu tiên class tuyến đầu trước để giữ vị trí tốt.
    const priority = {
      tank: 0,
      fighter: 1,
      assassin: 2,
      mage: 3,
      marksman: 4
    };

    units.sort((a, b) => {
      const getPriority = unit => {
        const role = typeof HexUnitConfig !== 'undefined'
          ? HexUnitConfig.getRole(unit.piece.type)
          : 'fighter';

        return priority[String(role).toLowerCase()] ?? 5;
      };

      return getPriority(a) - getPriority(b);
    });

    for (const unit of units) {
      let bestSquare = null;
      let bestScore = -Infinity;

      for (const square of availableSquares) {
        const score = this.getAutoFormationScore(
          unit.piece,
          square,
          enemies
        );

        if (score > bestScore) {
          bestScore = score;
          bestSquare = square;
        }
      }

      if (bestSquare === null) continue;

      assignments.push({
        piece: unit.piece,
        oldSquare: unit.oldSquare,
        square: bestSquare
      });

      availableSquares.splice(
        availableSquares.indexOf(bestSquare),
        1
      );
    }

    // Lưu HP theo từng Pokémon trước khi đổi ô.
    const previousHP = { ...this.pieceHP };

    for (let square = 28; square < 56; square++) {
      this.game.board[square] = null;
      delete this.pieceHP[square];
    }

    for (const assignment of assignments) {
      this.game.board[assignment.square] = assignment.piece;

      if (previousHP[assignment.oldSquare] !== undefined) {
        this.pieceHP[assignment.square] =
          previousHP[assignment.oldSquare];
      }

      const placed = this.placedPieces.find(
        item => item.invId === assignment.piece.invId
      );

      if (placed) {
        placed.sq = assignment.square;
      }
    }

    this.selectedBoardSq = -1;
    this.selectedInvId = null;
    this.legalTargets = [];

    this.saveSetupFormation();
    this.renderBoard();
    this.renderInventory();
    this.renderTalismans();

    this.showToast?.(
      'Đã tự động sắp xếp đội hình!',
      'success'
    );
  },

  isHexDeploySquare(sq) {
    return Number.isInteger(sq) && sq >= 28 && sq < 56;
  },
  previewPieceMoves(pieceType) {
    const centerSq = 35; // square d4
    this.isPreviewing = true;
  
    document.querySelectorAll('.square').forEach(sq => {
      sq.classList.remove('show-ray', 'preview-center');
      sq.querySelectorAll('.preview-piece, .preview-shadow').forEach(e => e.remove());
      const actualPiece = sq.querySelector('.piece:not(.preview-piece)');
      const actualShadow = sq.querySelector('.piece-shadow:not(.preview-shadow)');
      if (sq.dataset.sq == centerSq) {
        if (actualPiece) actualPiece.style.display = 'none';
        if (actualShadow) actualShadow.style.display = 'none';
      }
    });
  
    const dummyGame = new ChessGame();
    dummyGame.board.fill(null);
    dummyGame.board[centerSq] = { color: W, type: pieceType };
  
    if (pieceType === 'P') {
      dummyGame.board[centerSq - 8 - 1] = { color: B, type: 'P' };
      dummyGame.board[centerSq - 8 + 1] = { color: B, type: 'P' };
    } else if (pieceType === 'E') {
      // Petard: đặt 1 quân làm ngòi nổ và 1 quân địch phía sau để thấy tia ăn cờ
      dummyGame.board[centerSq - 8] = { color: W, type: 'P' };
      dummyGame.board[centerSq - 8 * 2] = { color: B, type: 'P' };
    } else if (pieceType === 'C') {
      // Seer: đặt quân địch ở các ô hình thoi để hiển thị đầy đủ viền tấn công e_ray và ô di chuyển m_ray
      const attackOffsets = [
        [-2, 0], [2, 0], [0, -2], [0, 2],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];
      const cr = dummyGame.row(centerSq), cc = dummyGame.col(centerSq);
      for (const [dr, dc] of attackOffsets) {
        if (dummyGame.inBounds(cr + dr, cc + dc)) {
          dummyGame.board[dummyGame.idx(cr + dr, cc + dc)] = { color: B, type: 'P' };
        }
      }
    } else if (pieceType === 'D') {
      // Dragon: đặt quân địch ở các ô chéo (1 và 2 ô) để hiển thị tia đỏ ăn cờ, ô dọc trống để hiển thị tia xanh di chuyển
      const diagOffsets = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-2, -2], [-2, 2], [2, -2], [2, 2]
      ];
      const cr = dummyGame.row(centerSq), cc = dummyGame.col(centerSq);
      for (const [dr, dc] of diagOffsets) {
        if (dummyGame.inBounds(cr + dr, cc + dc)) {
          dummyGame.board[dummyGame.idx(cr + dr, cc + dc)] = { color: B, type: 'P' };
        }
      }
    } else if (pieceType === 'A') {
      // Arch: đặt quân địch ở 4 hướng thẳng (cách 2 và 3 ô) để thấy tia đỏ bắn xuyên, các ô kề cạnh 1 ô trống để thấy tia xanh di chuyển
      const straightOffsets = [
        [-2, 0], [-3, 0],
        [2, 0], [3, 0],
        [0, -2], [0, -3],
        [0, 2], [0, 3]
      ];
      const cr = dummyGame.row(centerSq), cc = dummyGame.col(centerSq);
      for (const [dr, dc] of straightOffsets) {
        if (dummyGame.inBounds(cr + dr, cc + dc)) {
          dummyGame.board[dummyGame.idx(cr + dr, cc + dc)] = { color: B, type: 'P' };
        }
      }
    } else if (pieceType === 'X') {
      // Nixie: Đặt 1 quân địch phía trước để thấy đòn đâm tấn công và các hướng di chuyển
      dummyGame.board[centerSq - 8] = { color: B, type: 'P' };
    }
  
    const moves = dummyGame.pseudoMoves(centerSq);
  
    const centerEl = this.getSquareEl(centerSq);
    if (centerEl) {
      centerEl.classList.add('preview-center', 'has-piece');
  
      const shadow = document.createElement('img');
      shadow.className = 'piece-shadow preview-shadow';
      shadow.src = 'assets/table/shadow_hovered.png';
      shadow.alt = '';
      centerEl.appendChild(shadow);
  
      const img = document.createElement('img');
      img.className = 'piece preview-piece';
      img.src = getPieceIconUrl(pieceType);
      img.alt = pieceType;
      centerEl.appendChild(img);
    }
  
    for (const m of moves) {
      const rayType = m.moveOnly ? 'moveOnly' : (m.captureOnly ? 'captureOnly' : 'both');
      this.showRay(m.to, rayType);
    }
  },

  clearPreview() {
    if (!this.isPreviewing) return;
    this.isPreviewing = false;
    this.clearRays();
    this.renderBoard();
  },
  
  // ---- Reroll Recruitment Cards (Costs 5 Gold) ----

  renderBoard() {
    document.querySelectorAll('.square').forEach(sq => {
      sq.classList.remove(
        'has-piece',
        'show-ray',
        'target-attack',
        'target-move',
        'piece-hover',
        'selected',
        'deploy-zone',
        'preview-center',
        'talisman-target-eligible',
        'talisman-target-ineligible',
        'setup-boss',
        'setup-miniboss'
      );
      sq.querySelectorAll(
        '.piece, .piece-shadow, .preview-piece, .preview-shadow, ' +
        '.hp-bar-wrap, .piece-hud, .unit-healthbar, .ui-talisman-mark, .setup-boss-crown'
      ).forEach(e => e.remove());
    });
    // Drag & drop cho tất cả ô Hex, kể cả ô trống
    document.querySelectorAll('.board .square').forEach(el => {
      const sq = Number(el.dataset.sq);

      el.ondragover = null;
      el.ondrop = null;

      if (this.phase !== 'setup') return;

      el.ondragover = (e) => {
        if (!this.isHexDeploySquare(sq)) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      };

      el.ondrop = (e) => {
        if (!this.isHexDeploySquare(sq)) return;

        e.preventDefault();

        const raw = e.dataTransfer.getData('text/plain');

        if (!/^\d+$/.test(raw)) return;

        const fromSq = Number(raw);

        if (
          fromSq !== sq &&
          this.isHexDeploySquare(fromSq)
        ) {
          this.swapOrMoveBoardPieces(fromSq, sq);
        }
      };
    });
  
    // Update Sudden Death classes
    for (let i = 0; i < 64; i++) {
      const el = this.getSquareEl(i);
      if (!el) continue;
      if (this.collapsedSquares && this.collapsedSquares.has(i)) {
        el.classList.add('tile-collapsed');
        el.classList.remove('tile-shaking', 'tile-falling');
      } else if (this.shakingSquares && this.shakingSquares.has(i)) {
        el.classList.add('tile-shaking');
        el.classList.remove('tile-collapsed');
      } else {
        el.classList.remove('tile-shaking', 'tile-collapsed', 'tile-falling');
      }
    }
  
    // Deploy zone highlight on ranks 1 & 2 during setup
    // Highlight 28 ô Hex thuộc sân người chơi
    if (this.phase === 'setup') {
      for (let sq = 28; sq < 56; sq++) {
        const sqEl = this.getSquareEl(sq);

        if (sqEl) {
          sqEl.classList.add('deploy-zone');
        }
      }
    }
  
    // Place pieces
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (!p) continue;
      const el = this.getSquareEl(i);
      if (!el) continue;
      el.classList.add('has-piece');
  
      if (this.phase === 'setup' && this.activeApplyingTalisman && p.color === W) {
        const talDef = TALISMANS[this.activeApplyingTalisman.talismanId];
        const maxSlots = (p.maxTalismans || 3) + (window.MetaProgression?.getExtraTalismanSlots() ?? 0);
        const isSlotFull = talDef && !talDef.isSpell && (p.talismans || []).length >= maxSlots;
        const isEligible = typeof TalismanSystem !== 'undefined' && TalismanSystem.isApplicable(this.activeApplyingTalisman.talismanId, p.type) && !isSlotFull;
        el.classList.add(isEligible ? 'talisman-target-eligible' : 'talisman-target-ineligible');
      }
  
      const shadow = document.createElement('img');
      shadow.className = 'piece-shadow';
      shadow.src = 'assets/table/shadow.png';
      shadow.alt = '';
      el.appendChild(shadow);
  
      const displayType = p.transformType || p.type;
      const img = document.createElement('img');
      img.className = 'piece';
      if (this.phase === 'battle' && this.actedThisRound && this.actedThisRound.has(p)) {
        img.classList.add('piece-acted');
      }
      if (p.isDittoTransformed) {
        img.classList.add('ditto-transformed');
        const origName = (typeof PIECES !== 'undefined' && PIECES[p.type]?.name) ? PIECES[p.type].name : 'Ditto';
        const transName = (typeof PIECES !== 'undefined' && PIECES[displayType]?.name) ? PIECES[displayType].name : displayType;
        img.title = `✨ ${origName} (Transformed into ${transName})`;
      } else {
        const pInfo = (typeof PIECES !== 'undefined' && PIECES[displayType]) ? PIECES[displayType] : p;
        if (pInfo) {
          const { element: effT1, element2: effT2 } = (typeof TypeSystem !== 'undefined')
            ? TypeSystem.getEffectivePieceElements(p)
            : { element: pInfo.element || 'normal', element2: pInfo.element2 };
          const t1 = effT1.toUpperCase();
          const t2 = effT2 ? effT2.toUpperCase() : null;
          const typeStr = t2 ? `${t1}/${t2}` : t1;
          const isWhite = typeof TypeSystem !== 'undefined' ? TypeSystem.isWhiteSquare(i) : true;
          const activeAtk = typeof TypeSystem !== 'undefined' ? TypeSystem.getAttackingType(p, i).toUpperCase() : t1;
          img.title = document.body.classList.contains('hex-mode')
            ? `${pInfo.name || displayType} [${typeStr}]\nAttack: ${TypeSystem.getHexAttackingType(p, i).toUpperCase()} (Hex ${i})\nDefense: ${typeStr}`
            : `${pInfo.name || displayType} [${typeStr}]\nAttack Element: ${activeAtk} (${isWhite ? 'White square: 1st Type' : 'Dark square: 2nd Type'})\nDefense: ${typeStr}`;
        }
      }
      img.src = getPieceIconUrl(displayType);
      img.alt = `${p.color}${displayType}`;
  
      if (this.phase === 'setup' && p.color === W) {
        img.draggable = true;
        img.style.cursor = 'grab';
        img.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', i.toString());
        });
      }
  
      el.appendChild(img);

      // Hiển thị Boss ngay trong giai đoạn SETUP
      if (this.phase === 'setup' && p.color === B && p.isBoss === true) {
        const bossType = p.bossType === 'miniBoss'
          ? 'miniBoss'
          : 'boss';

        el.classList.add(
          bossType === 'miniBoss' ? 'setup-miniboss' : 'setup-boss'
        );

        const crown = document.createElement('span');
        crown.className = 'setup-boss-crown';
        crown.textContent = bossType === 'miniBoss' ? '♛' : '♛';
        crown.title = bossType === 'miniBoss' ? 'MINI BOSS' : 'BOSS';

        el.appendChild(crown);
      }

      if (this.phase === 'setup') {
        el.ondragover = (e) => {
          if (this.isHexDeploySquare(i)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        };

        el.ondrop = (e) => {
          if (!this.isHexDeploySquare(i)) return;

          e.preventDefault();

          const fromSq = Number(
            e.dataTransfer.getData('text/plain')
          );

          if (
            Number.isInteger(fromSq) &&
            fromSq !== i &&
            this.isHexDeploySquare(fromSq)
          ) {
            this.swapOrMoveBoardPieces(fromSq, i);
          }
        };
      }
  
      // HP Fraction + Active Attack Type Badge (visible in both setup and battle)
      if (this.phase === 'battle' || this.phase === 'setup') {
        const st = this.phase === 'setup'
          ? this.getHexPieceStats(p, i)
          : this.getEffectivePieceStats(p);
        const curHp = this.phase === 'setup' ? st.hp ?? st.maxHp
          : this.pieceHP[i] !== undefined ? Math.max(0, this.pieceHP[i]) : st.maxHp;
  
        const hud = document.createElement('div');
        hud.className = `piece-hud piece-hud-${p.color}`;
  
        const hpNum = document.createElement('span');
        hpNum.className = 'hud-hp-num';
        hpNum.textContent = `${curHp}/${st.maxHp}`;
        hud.appendChild(hpNum);
        if (window.UnitHealthBar) el.appendChild(UnitHealthBar.create(curHp, st.maxHp));

        if (typeof TypeSystem !== 'undefined') {
          const hexMode = document.body.classList.contains('hex-mode');
          const elements = TypeSystem.getEffectivePieceElements(p);
          const atkType = hexMode ? TypeSystem.getHexAttackingType(p, i) : TypeSystem.getAttackingType(p, i);
          const isWhite = TypeSystem.isWhiteSquare(i);
          const typeBadge = document.createElement('img');
          typeBadge.className = 'hud-type-badge';
          typeBadge.src = TypeSystem.getIconUrl(atkType);
          typeBadge.alt = atkType.toUpperCase();
          typeBadge.title = hexMode
            ? `Attack: ${atkType.toUpperCase()} (Hex ${i}: ${TypeSystem.isWhiteHex(i) ? '1st type' : '2nd type or 1st'})`
            : `Active Attack: ${atkType.toUpperCase()} (${isWhite ? 'White square: 1st type' : 'Black square: 2nd type'})`;
          hud.appendChild(typeBadge);
        }
  
        el.appendChild(hud);
      }
    }
  
    this.renderSelectionRays();
    this.updateTurnIndicator();
    this.updateStats();
    this.updateEnemyCard();
  },
  
  
  // Highlights selected square and shows standard/move/attack rays

  renderSelectionRays() {
    this.clearRays();
  
    if (this.selectedBoardSq !== -1) {
      const selEl = this.getSquareEl(this.selectedBoardSq);
      if (selEl) {
        selEl.classList.add('selected');
        this.setShadow(selEl, true);
      }
      for (const m of this.legalTargets) {
        const rayType = m.moveOnly ? 'moveOnly' : (m.captureOnly ? 'captureOnly' : 'both');
        this.showRay(m.to, rayType, this.selectedBoardSq);
      }
    }
  },

  updateTurnIndicator() {
    const phaseText = document.getElementById('phaseText');
    const phaseDot = document.getElementById('phaseDot');
    const btnBattle = document.getElementById('btnStartBattle');
    const btnAuto = document.getElementById('btnStartAutoBattle') || document.getElementById('btnToggleAutoBattle');
    const btnRecall = document.getElementById('btnRecallAll');

    let btnFormation = document.getElementById('btnAutoFormation');

    if (!btnFormation && btnRecall) {
      btnFormation = document.createElement('button');
      btnFormation.id = 'btnAutoFormation';
      btnFormation.type = 'button';
      btnFormation.className = btnRecall.className;
      btnFormation.dataset.i18n = 'visual.autoFormation';
      btnFormation.textContent = t('visual.autoFormation');
      btnFormation.title = 'Tự xếp đội hình theo class và khắc hệ';

      btnFormation.addEventListener('click', () => {
        this.autoArrangePlayerFormation();
      });

      btnRecall.insertAdjacentElement('afterend', btnFormation);
    }

    if (btnFormation) {
      btnFormation.style.display =
        this.phase === 'setup' ? 'inline-flex' : 'none';

      btnFormation.disabled =
        this.phase !== 'setup' ||
        this.isSetupAnimating ||
        this.placedPieces.length === 0;
    }

    const enemyName = document.getElementById('enemyName');
  
    const canDeploy = this.placedPieces.length > 0;
  
    if (this.phase === 'setup') {
      if (phaseDot) { phaseDot.classList.remove('battle'); }
      if (phaseText) { phaseText.textContent = ''; }
      if (btnBattle) {
        btnBattle.style.display = 'inline-flex';
        btnBattle.disabled = !canDeploy;
        btnBattle.textContent = t('combat.battle');
      }
      if (btnAuto) {
        btnAuto.style.display = 'none';
        btnAuto.disabled = !canDeploy;
        btnAuto.innerHTML = 'AUTO';
        btnAuto.classList.remove('auto-active');
      }
      if (btnRecall) {
        btnRecall.style.display = 'inline-flex';
      }
      if (enemyName) enemyName.textContent = t('shop.stage',{stage:this.stage});
    } else {
      if (phaseDot) { phaseDot.classList.add('battle'); }
      if (btnBattle) {
        btnBattle.style.display = 'inline-flex';
        btnBattle.disabled = true;
        btnBattle.textContent = t('combat.battle');
      }
      if (btnAuto) {
        btnAuto.style.display = 'none';
        btnAuto.disabled = true;
        btnAuto.innerHTML = this.isAutoBattle ? 'AUTO BATTLING' : 'AUTO';
        btnAuto.classList.toggle('auto-active', !!this.isAutoBattle);
      }
      if (btnRecall) btnRecall.style.display = 'none';
      if (phaseText) { phaseText.textContent = ''; }
      if (enemyName) {
        const turnWho = this.hexCombat ? 'HEX BATTLE' : this.game.turn === W ? 'YOUR TURN' : 'ENEMY TURN';
        enemyName.textContent = `${t('combat.stage')} ${this.stage} • ${this.hexCombat ? t('combat.battle') : I18n.legacy(turnWho)}`;
      }
    }
    this.updateAutoBattleUI();
    if (typeof this.updateSkipButton === 'function') {
      this.updateSkipButton();
    }
    if (typeof this.renderTurnOrderStrip === 'function') {
      this.renderTurnOrderStrip();
    }
  },
  
  // --- In-place DOM Manipulations (Smooth, zero full-board rebuilds) ---

  movePieceDOM(fromSq, toSq) {
    const fromEl = this.getSquareEl(fromSq);
    const toEl = this.getSquareEl(toSq);
    if (!fromEl || !toEl) return;
  
    const els = fromEl.querySelectorAll('.piece, .piece-shadow, .piece-hud');
    els.forEach(el => {
      el.classList.remove('piece-attacking', 'piece-capturing', 'piece-advance-move');
      el.style.removeProperty('--atk-dx');
      el.style.removeProperty('--atk-dy');
      el.style.removeProperty('--move-dx');
      el.style.removeProperty('--move-dy');
      toEl.appendChild(el);
    });
  
    fromEl.classList.remove('has-piece');
    toEl.classList.add('has-piece');
  
    const piece = toEl.querySelector('.piece');
    if (piece) {
      piece.classList.add('piece-land-bounce');
      setTimeout(() => piece.classList.remove('piece-land-bounce'), 220);
    }
    this.spawnLandPuff(toSq);

    // Dynamically update active attack type badge and tooltip for the new tile color
    this.updatePieceTypeBadge(toSq);
  },

  updatePieceTypeBadge(sq) {
    const el = this.getSquareEl(sq);
    if (!el) return;
    const p = this.game.board[sq];
    if (!p) return;

    if (typeof TypeSystem !== 'undefined') {
      const atkType = TypeSystem.getAttackingType(p, sq);
      const isWhite = TypeSystem.isWhiteSquare(sq);

      let hud = el.querySelector('.piece-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.className = `piece-hud piece-hud-${p.color}`;
        const st = this.getEffectivePieceStats(p);
        const curHp = this.pieceHP[sq] !== undefined ? Math.max(0, this.pieceHP[sq]) : st.maxHp;
        const hpNum = document.createElement('span');
        hpNum.className = 'hud-hp-num';
        hpNum.textContent = `${curHp}/${st.maxHp}`;
        hud.appendChild(hpNum);
        el.appendChild(hud);
      }

      let typeBadge = hud.querySelector('.hud-type-badge');
      if (!typeBadge) {
        typeBadge = document.createElement('img');
        typeBadge.className = 'hud-type-badge';
        hud.appendChild(typeBadge);
      }
      typeBadge.src = TypeSystem.getIconUrl(atkType);
      typeBadge.alt = atkType.toUpperCase();
      typeBadge.title = `Active Attack: ${atkType.toUpperCase()} (${isWhite ? 'White square: 1st type' : 'Black square: 2nd type'})`;

      const img = el.querySelector('.piece');
      if (img && !p.isDittoTransformed) {
        const displayType = p.transformType || p.type;
        const pInfo = (typeof PIECES !== 'undefined' && PIECES[displayType]) ? PIECES[displayType] : p;
        if (pInfo) {
          const { element: effT1, element2: effT2 } = (typeof TypeSystem !== 'undefined')
            ? TypeSystem.getEffectivePieceElements(p)
            : { element: pInfo.element || 'normal', element2: pInfo.element2 };
          const t1 = effT1.toUpperCase();
          const t2 = effT2 ? effT2.toUpperCase() : null;
          const typeStr = t2 ? `${t1}/${t2}` : t1;
          img.title = `${pInfo.name || displayType} [${typeStr}]\nAttack Type: ${atkType.toUpperCase()} (${isWhite ? 'White tile: Type 1' : 'Black tile: Type 2'})\nDefending Types: ${typeStr}`;
        }
      }
    }
  },

  removePieceDOM(sq) {
    const el = this.getSquareEl(sq);
    if (!el) return;
    el.querySelectorAll('.piece, .piece-shadow, .piece-hud').forEach(e => e.remove());
    el.classList.remove('has-piece');
  },

  updatePieceHpDOM(sq, curHp, maxHp) {
    const el = this.getSquareEl(sq);
    if (!el) return;
    const hpNum = el.querySelector('.hud-hp-num');
    if (hpNum) hpNum.textContent = `${curHp}/${maxHp}`;
  },

  promotePieceDOM(sq, color, nextType = '3') {
    const el = this.getSquareEl(sq);
    if (!el) return;
    const img = el.querySelector('.piece');
    if (img) {
      img.src = getPieceIconUrl(nextType);
      img.classList.remove('piece-transform-anim');
      void img.offsetWidth;
      img.classList.add('piece-transform-anim');
      setTimeout(() => img.classList.remove('piece-transform-anim'), 700);
    }
    const hpNum = el.querySelector('.hud-hp-num');
    const st = PIECE_STATS[nextType] || PIECE_STATS['1'];
    if (hpNum) hpNum.textContent = `${st.maxHp}/${st.maxHp}`;
    this.updatePieceTypeBadge(sq);
    if (this.spawnLandPuff) this.spawnLandPuff(sq);
    if (typeof CombatEngine !== 'undefined') {
      const name = PIECE_NAMES[nextType] || 'EVOLVED!';
      CombatEngine.spawnTextPopup(this, sq, `EVOLVED TO ${name.toUpperCase()}!`, 'revive-popup');
    }
  },

  triggerTransformAnimation(sq, invId) {
    if (sq !== undefined && sq !== null && sq !== -1) {
      const el = this.getSquareEl(sq);
      if (el) {
        const img = el.querySelector('.piece');
        if (img) {
          img.classList.remove('piece-transform-anim');
          void img.offsetWidth;
          img.classList.add('piece-transform-anim');
          setTimeout(() => img.classList.remove('piece-transform-anim'), 700);
        }
        if (this.spawnLandPuff) this.spawnLandPuff(sq);
      }
    }
    if (invId !== undefined && invId !== null) {
      const invSlot = document.querySelector(`.inv-slot[data-inv-id="${invId}"]`);
      if (invSlot) {
        const slotPiece = invSlot.querySelector('.inv-slot-piece');
        if (slotPiece) {
          slotPiece.classList.remove('piece-transform-anim');
          void slotPiece.offsetWidth;
          slotPiece.classList.add('piece-transform-anim');
          setTimeout(() => slotPiece.classList.remove('piece-transform-anim'), 700);
        }
        invSlot.classList.add('inv-slot-bounce');
        setTimeout(() => invSlot.classList.remove('inv-slot-bounce'), 300);
      }
    }
  },

  playBoardEvolutionSequence(evolutions) {
    if (!evolutions || evolutions.length === 0) return;
    const revision = this.setupRevision;
    const valid = () => this.setupRevision === revision;
    const complete = evo => {
      this.pendingEvolutions = (this.pendingEvolutions || []).filter(p => p.invId !== evo.invId);
      this.saveRoguelikeProgress?.();
    };
  
    this.isSetupAnimating = true;
  
    evolutions.forEach((evo, idx) => {
      const stepDelay = idx * 1100;
      setTimeout(() => {
        // Find square where piece is placed
        if (!valid()) return;
        let sq = -1;
        for (let i = 0; i < 64; i++) {
          const p = this.game.board[i];
          if (p && p.invId === evo.invId) {
            sq = i;
            break;
          }
        }
  
        const sqEl = sq !== -1 ? this.getSquareEl(sq) : null;
        const img = sqEl ? sqEl.querySelector('.piece') : null;
  
        if (sqEl && img) {
          if (typeof soundManager !== 'undefined') {
            soundManager.playSfx('promote');
          }
  
          // 1. Add evolving animation
          img.classList.remove('piece-evolving');
          void img.offsetWidth;
          img.classList.add('piece-evolving');
  
          // 2. Add radial shockwave
          const shockwave = document.createElement('div');
          shockwave.className = 'evolution-shockwave';
          sqEl.appendChild(shockwave);
          setTimeout(() => {
            if (shockwave && shockwave.parentNode) shockwave.parentNode.removeChild(shockwave);
          }, 1100);
  
          // 3. At climax (500ms): swap sprite, update stats & HUD
          setTimeout(() => {
            if (!valid()) return;
            img.src = getPieceIconUrl(evo.nextType);
            img.alt = evo.newName;
  
            if (this.game.board[sq]) {
              this.game.board[sq].type = evo.nextType;
            }
  
            const item = this.inventory.find(i => i.id === evo.invId);
            if (item) {
              item.type = evo.nextType;
              item.battlesFought = 0;
            }
  
            const form = this.setupFormation.find(f => f.invId === evo.invId);
            if (form) form.type = evo.nextType;

            // Recalculate effective elements to ensure talisman type override is retained on evolved unit
            if (typeof TypeSystem !== 'undefined') {
              if (this.game.board[sq]) TypeSystem.getEffectivePieceElements(this.game.board[sq]);
              if (item) TypeSystem.getEffectivePieceElements(item);
            }
  
            // Spawn puff & popup
            if (this.spawnLandPuff) this.spawnLandPuff(sq);
            if (typeof CombatEngine !== 'undefined') {
              CombatEngine.spawnTextPopup(this, sq, `✨ ${evo.newName.toUpperCase()}!`, 'evo-popup');
            }
  
            // Update HUD HP
            const hpNum = sqEl.querySelector('.hud-hp-num');
            if (hpNum && this.game.board[sq]) {
              const st = this.getHexPieceStats(this.game.board[sq], sq);
              hpNum.textContent = `${st.hp ?? st.maxHp}/${st.maxHp}`;
            }
            complete(evo);
  
            this.addLog(`✨ EVOLUTION: Your ${evo.oldName} evolved into ${evo.newName}!`);
          }, 500);
  
          // 4. Remove animation class
          setTimeout(() => {
            img.classList.remove('piece-evolving');
          }, 1400);
        } else {
          // Fallback: If not on board, update inventory directly
          const item = this.inventory.find(i => i.id === evo.invId);
          if (item) {
            item.type = evo.nextType;
            item.battlesFought = 0;
            if (typeof TypeSystem !== 'undefined') TypeSystem.getEffectivePieceElements(item);
          }
          const form = this.setupFormation.find(f => f.invId === evo.invId);
          if (form) form.type = evo.nextType;
          complete(evo);
          this.addLog(`✨ EVOLUTION: Your ${evo.oldName} evolved into ${evo.newName}!`);
        }
      }, stepDelay);
    });
  
    const totalTime = evolutions.length * 1100 + 500;
    setTimeout(() => {
      if (!valid()) return;
      this.isSetupAnimating = false;
      this.renderBoard();
      this.renderInventory();
      this.updateTurnIndicator();
      this.renderTalismans();
      this.renderShop();
      this.updateStats();
      if (this.currentSaveSlot && typeof SaveSystem !== 'undefined') {
        SaveSystem.saveToSlot(this.currentSaveSlot, this);
      }
    }, totalTime);
  },

  triggerInstantEvolution(pieceOrItem, nextType, itemName = 'Evolution Stone') {
    const pType = String(pieceOrItem.type);
    const oldDef = (typeof PIECES !== 'undefined') ? PIECES[pType] : null;
    const nextDef = (typeof PIECES !== 'undefined') ? PIECES[nextType] : null;
    const oldName = oldDef ? oldDef.name : `Unit #${pType}`;
    const newName = nextDef ? nextDef.name : `Unit #${nextType}`;
    const targetInvId = pieceOrItem.invId || pieceOrItem.id;
  
    // Trigger board evolution sequence for this single unit immediately
    this.playBoardEvolutionSequence([{
      oldName,
      newName,
      oldType: pType,
      nextType: String(nextType),
      invId: targetInvId
    }]);
  
    this.addLog(`✨ STONE EVOLUTION: Used [${itemName}]! ${oldName} evolved into ${newName}!`);
    if (this.showToast) {
      this.showToast(`✨ ${oldName} evolved into ${newName}!`, 'success');
    }
  },

  showRay(idx, rayType = 'both', sourceSq = -1) {
    const el = this.getSquareEl(idx);
    if (!el) return;
  
    const fromSq = sourceSq !== -1 ? sourceSq : this.selectedBoardSq;
    const sourcePiece = fromSq !== -1 ? this.game.board[fromSq] : null;
    const targetPiece = this.game.board[idx];
  
    // RULE: If ray lies on an ally (đồng minh), DO NOT show anything
    if (sourcePiece && targetPiece && targetPiece.color === sourcePiece.color) {
      return;
    }
  
    // RULE: If rayType is moveOnly and square contains an enemy piece, HIDE IT
    if (rayType === 'moveOnly' && targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color) {
      return;
    }
  
    // Threaten enemy piece: shake and tint enemy piece red
    if ((rayType === 'captureOnly' || rayType === 'both') && targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color) {
      const pieceEl = el.querySelector('.piece');
      if (pieceEl) {
        pieceEl.classList.remove('piece-hit-flash');
        pieceEl.classList.add('piece-threatened');
      }
    }
  
    const ray = el.querySelector('.ray-overlay');
    if (ray) {
      if (rayType === 'moveOnly') {
        ray.src = 'assets/table/m_ray.png';
      } else if (rayType === 'captureOnly') {
        ray.src = 'assets/table/e_ray.png';
      } else {
        const isDark = (this.game.row(idx) + this.game.col(idx)) % 2 === 0;
        ray.src = isDark ? 'assets/table/b_ray.png' : 'assets/table/w_ray.png';
      }
    }
    el.classList.add('show-ray');
  },

  clearRays() {
    document.querySelectorAll('.square').forEach(sq => {
      sq.classList.remove('selected', 'show-ray');
      const ray = sq.querySelector('.ray-overlay');
      if (ray) {
        const idx = parseInt(sq.dataset.sq);
        const isDark = (this.game.row(idx) + this.game.col(idx)) % 2 === 0;
        ray.src = isDark ? 'assets/table/b_ray.png' : 'assets/table/w_ray.png';
      }
      const pieceEl = sq.querySelector('.piece');
      if (pieceEl) {
        pieceEl.classList.remove('piece-threatened', 'piece-hit-flash');
      }
    });
  },

  setShadow(squareEl, hovered) {
    const shadow = squareEl.querySelector('.piece-shadow');
    if (shadow) {
      shadow.src = hovered ? 'assets/table/shadow_hovered.png' : 'assets/table/shadow.png';
    }
  },
  
  // ---- Mouse Hover Effects ----

  onSquareHover(idx) {
    if (this.phase === 'battle') return;
    if (this.collapsedSquares && this.collapsedSquares.has(idx)) return;
    if (this.isPreviewing || this.isAnimating) return;
  
    const p = this.game.board[idx];
    if (!p) return;
  
    // Both friendly pieces and enemy pieces lift up on hover
    const sqEl = this.getSquareEl(idx);
    if (sqEl) {
      sqEl.classList.add('piece-hover');
      this.setShadow(sqEl, true);
    }
  
    // If no piece is currently selected on board, show guide rays for this piece (including enemy piece moves!)
    if (this.selectedBoardSq === -1 && this.selectedInvId === null) {
      HexView.highlightRange(idx, HexUnitConfig.getConfig(p.type).attackRange, new HexBoard());
    }
  },

  onSquareLeave(idx) {
    if (this.phase === 'battle') return;
    HexView.clearRange();
    const sqEl = this.getSquareEl(idx);
    if (sqEl) {
      sqEl.classList.remove('piece-hover');
      if (!sqEl.classList.contains('selected')) {
        this.setShadow(sqEl, false);
      }
    }
  
    // Clear hover rays & threat animations if no piece is selected
    if (this.selectedBoardSq === -1 && !this.isPreviewing && this.selectedInvId === null) {
      this.clearRays();
    }
  },
  
  // ---- Square Click Dispatcher ----

  onSquareClick(idx) {
    if (this.collapsedSquares && this.collapsedSquares.has(idx)) return;
    if (this.phase === 'setup') {
      this.handleSetupSquareClick(idx);
    } else if (this.phase === 'battle') {
      this.handleBattleSquareClick(idx);
    }
  },

  handleSetupSquareClick(idx) {
    if (this.isSetupAnimating) return;
  
    // If currently applying a talisman
    if (this.activeApplyingTalisman) {
      const p = this.game.board[idx];
      if (p && p.color === W) {
        this.applyTalismanToPiece(p);
      } else {
        alert('Click one of your pieces (on the board or bench) to apply talisman!');
      }
      return;
    }
  
    const canDeployHere = this.isHexDeploySquare(idx);
  
    // 1. Placing or swapping a piece from bench
    if (this.selectedInvId) {
      if (!canDeployHere) {
        alert('Chỉ được đặt Pokémon trong 4 hàng dưới!');
        return;
      }
  
      const invItem = this.inventory.find(item => item.id === this.selectedInvId);
      if (!invItem) return;
  
      const existingPiece = this.game.board[idx];
  
      // Đã có quân đồng minh tại ô này -> THAY THẾ (Swap Bench <-> Board)
      if (existingPiece && existingPiece.color === W) {
        this.isSetupAnimating = true;
  
        const invSlot = document.querySelector(`.inv-slot[data-inv-id="${this.selectedInvId}"]`);
        const targetSqEl = this.getSquareEl(idx);
        let delta = null;
        if (invSlot && targetSqEl) {
          delta = this.getAppRelativeDelta(invSlot, targetSqEl);
        }
  
        // Tạo clone quân cũ trên bàn bay về lại bench
        const currentPieceImg = targetSqEl?.querySelector('.piece');
        if (currentPieceImg && delta) {
          const boardEl = document.querySelector('.board');
          const clone = currentPieceImg.cloneNode(true);
          clone.className = 'piece piece-setup-recall';
          clone.style.position = 'absolute';
          clone.style.left = `${targetSqEl.offsetLeft}px`;
          clone.style.top = `${targetSqEl.offsetTop - 22}px`;
          clone.style.setProperty('--fly-to-x', `${-delta.dx}px`);
          clone.style.setProperty('--fly-to-y', `${-delta.dy}px`);
          if (boardEl) boardEl.appendChild(clone);
          setTimeout(() => { if (clone && clone.parentNode) clone.parentNode.removeChild(clone); }, 250);
        }
  
        const existingPlacedIdx = this.placedPieces.findIndex(p => p.sq === idx);
        if (existingPlacedIdx !== -1) {
          this.placedPieces.splice(existingPlacedIdx, 1);
        }
  
        const talismans = invItem.talismans ? [...invItem.talismans] : [];
        const maxTalismans = invItem.maxTalismans || 3;
        this.game.board[idx] = { color: W, type: invItem.type, invId: invItem.id, talismans, maxTalismans };
        this.placedPieces.push({ invId: invItem.id, type: invItem.type, sq: idx, talismans, maxTalismans });
        this.saveSetupFormation();
  
        const oldBenchId = existingPiece.invId;
        this.selectedInvId = null;
        this.selectedBoardSq = -1;
        this.renderInventory();
        this.renderBoard();
        this.renderTalismans();
        this.updateStats();
  
        // Quân mới từ bench bay vào ô trên bàn cờ
        if (delta) {
          const newPieceEl = this.getSquareEl(idx)?.querySelector('.piece');
          if (newPieceEl) {
            newPieceEl.style.setProperty('--fly-from-x', `${-delta.dx}px`);
            newPieceEl.style.setProperty('--fly-from-y', `${-delta.dy}px`);
            newPieceEl.classList.add('piece-setup-deploy');
            setTimeout(() => {
              if (newPieceEl) {
                newPieceEl.classList.remove('piece-setup-deploy');
                newPieceEl.style.removeProperty('--fly-from-x');
                newPieceEl.style.removeProperty('--fly-from-y');
                newPieceEl.classList.add('piece-land-bounce');
                setTimeout(() => newPieceEl.classList.remove('piece-land-bounce'), 220);
              }
              this.spawnLandPuff(idx);
              this.isSetupAnimating = false;
            }, 240);
          } else {
            this.spawnLandPuff(idx);
            this.isSetupAnimating = false;
          }
        } else {
          this.spawnLandPuff(idx);
          this.isSetupAnimating = false;
        }
  
        // Bench slot nảy lên
        const updatedSlot = document.querySelector(`.inv-slot[data-inv-id="${oldBenchId}"]`);
        if (updatedSlot) {
          updatedSlot.classList.add('inv-slot-bounce');
          setTimeout(() => updatedSlot.classList.remove('inv-slot-bounce'), 250);
        }
        return;
      }
  
      // Ô trống -> Đưa quân lên cờ (Animation lên cờ)
      if (!existingPiece) {
        if (this.placedPieces.length >= this.maxSlots) {
          alert(`Board is full (${this.maxSlots}/${this.maxSlots} units). Click a piece on the board to swap, or upgrade slot capacity!`);
          return;
        }
  
        this.isSetupAnimating = true;
  
        const invSlot = document.querySelector(`.inv-slot[data-inv-id="${this.selectedInvId}"]`);
        const targetSqEl = this.getSquareEl(idx);
        let delta = null;
        if (invSlot && targetSqEl) {
          delta = this.getAppRelativeDelta(invSlot, targetSqEl);
        }
  
        const talismans = invItem.talismans ? [...invItem.talismans] : [];
        const maxTalismans = invItem.maxTalismans || 3;
        this.game.board[idx] = { color: W, type: invItem.type, invId: invItem.id, talismans, maxTalismans };
        this.placedPieces.push({ invId: invItem.id, type: invItem.type, sq: idx, talismans, maxTalismans });
        this.saveSetupFormation();
  
        this.selectedInvId = null;
        this.selectedBoardSq = -1;
        this.renderInventory();
        this.renderBoard();
        this.renderTalismans();
        this.updateStats();
  
        if (delta) {
          const newPieceEl = this.getSquareEl(idx)?.querySelector('.piece');
          if (newPieceEl) {
            newPieceEl.style.setProperty('--fly-from-x', `${-delta.dx}px`);
            newPieceEl.style.setProperty('--fly-from-y', `${-delta.dy}px`);
            newPieceEl.classList.add('piece-setup-deploy');
            setTimeout(() => {
              if (newPieceEl) {
                newPieceEl.classList.remove('piece-setup-deploy');
                newPieceEl.style.removeProperty('--fly-from-x');
                newPieceEl.style.removeProperty('--fly-from-y');
                newPieceEl.classList.add('piece-land-bounce');
                setTimeout(() => newPieceEl.classList.remove('piece-land-bounce'), 220);
              }
              this.spawnLandPuff(idx);
              this.isSetupAnimating = false;
            }, 240);
          } else {
            this.spawnLandPuff(idx);
            this.isSetupAnimating = false;
          }
        } else {
          this.spawnLandPuff(idx);
          this.isSetupAnimating = false;
        }
        return;
      }
    }
  
    // 2. Clicking a deployed piece (Select, Deselect, or Swap directly)
    const p = this.game.board[idx];
    if (p && p.color === W) {
      if (this.selectedBoardSq === idx) {
        // Deselect if clicking the already selected piece
        this.selectedBoardSq = -1;
        this.legalTargets = [];
        this.renderBoard();
        this.renderTalismans();
        this.updateSellButton();
        return;
      } else if (this.selectedBoardSq !== -1) {
        // Swap with the currently selected piece!
        this.swapOrMoveBoardPieces(this.selectedBoardSq, idx);
        this.updateSellButton();
        return;
      } else {
        // Select this piece and compute legalTargets so rays and enemy threat shakes display
        this.selectedBoardSq = idx;
        this.selectedInvId = null;
        this.legalTargets = [];
        this.setTalismanTab('bag');
        this.renderBoard();
        this.renderTalismans();
        this.updateSellButton();
        return;
      }
    }
  
    // 3. Moving a selected deployed piece to another empty home square, or deselecting on click away
    if (!this.game.board[idx] && this.isHexDeploySquare(idx)) {
      if (!this.game.board[idx] && canDeployHere) {
        this.swapOrMoveBoardPieces(this.selectedBoardSq, idx);
      } else {
        // Clicked invalid tile or enemy piece: deselect
        this.selectedBoardSq = -1;
        this.legalTargets = [];
        this.renderBoard();
        this.renderTalismans();
      }
      this.updateSellButton();
    }
  },

  swapOrMoveBoardPieces(fromSq, toSq) {
    if (this.phase !== 'setup' || this.isSetupAnimating) return;
    if (
      !this.isHexDeploySquare(fromSq) ||
      !this.isHexDeploySquare(toSq)
    ) {
      return;
    }

    if (!this.getSquareEl(fromSq) || !this.getSquareEl(toSq)) {
      return;
  }
    const fromPiece = this.game.board[fromSq];
    if (!fromPiece || fromPiece.color !== W) return;
  
    if (
      !this.isHexDeploySquare(fromSq) ||
      !this.isHexDeploySquare(toSq)
    ) {
      alert('Chỉ được sắp xếp Pokémon trong 4 hàng dưới!');
      return;
    }
  
    const toPiece = this.game.board[toSq];
    const fromEl = this.getSquareEl(fromSq);
    const toEl = this.getSquareEl(toSq);
    const fromImg = fromEl?.querySelector('.piece');
    const toImg = toEl?.querySelector('.piece');
  
    // Tính khoảng cách dựa trên vị trí thật của ô Hex
    const fromX = fromEl?.offsetLeft ?? 0;
    const fromY = fromEl?.offsetTop ?? 0;

    const toX = toEl?.offsetLeft ?? 0;
    const toY = toEl?.offsetTop ?? 0;

    const dx = toX - fromX;
    const dy = toY - fromY;
  
    if (toPiece && toPiece.color === W) {
      // SWAP TWO PIECES ON BOARD (Parabolic crossing arcs)
      this.isSetupAnimating = true;
  
      if (fromImg && toImg) {
        fromImg.style.setProperty('--swap-dx', `${dx}px`);
        fromImg.style.setProperty('--swap-dy', `${dy}px`);
        fromImg.classList.add('piece-setup-swap-a');
  
        toImg.style.setProperty('--swap-dx', `${-dx}px`);
        toImg.style.setProperty('--swap-dy', `${-dy}px`);
        toImg.classList.add('piece-setup-swap-b');
      }
  
      setTimeout(() => {
        this.game.board[fromSq] = toPiece;
        this.game.board[toSq] = fromPiece;
  
        const placedFrom = this.placedPieces.find(item => item.sq === fromSq);
        const placedTo = this.placedPieces.find(item => item.sq === toSq);
        if (placedFrom) placedFrom.sq = toSq;
        if (placedTo) placedTo.sq = fromSq;
  
        this.saveSetupFormation();
        this.selectedBoardSq = -1;
        this.renderBoard();
        this.renderInventory();
        this.renderTalismans();
        this.spawnLandPuff(fromSq);
        this.spawnLandPuff(toSq);
  
        const newFromImg = this.getSquareEl(fromSq)?.querySelector('.piece');
        const newToImg = this.getSquareEl(toSq)?.querySelector('.piece');
        if (newFromImg) {
          newFromImg.classList.add('piece-land-bounce');
          setTimeout(() => newFromImg.classList.remove('piece-land-bounce'), 220);
        }
        if (newToImg) {
          newToImg.classList.add('piece-land-bounce');
          setTimeout(() => newToImg.classList.remove('piece-land-bounce'), 220);
        }
  
        this.isSetupAnimating = false;
        this.addLog(`Swapped positions of ${PIECE_NAMES[fromPiece.type]} and ${PIECE_NAMES[toPiece.type]}.`);
      }, 210);
  
    } else if (!toPiece) {
      // MOVE TO EMPTY SQUARE (Smooth hop arc)
      this.isSetupAnimating = true;
  
      if (fromImg) {
        fromImg.style.setProperty('--hop-dx', `${dx}px`);
        fromImg.style.setProperty('--hop-dy', `${dy}px`);
        fromImg.classList.add('piece-setup-hop');
      }
  
      setTimeout(() => {
        this.game.board[toSq] = fromPiece;
        this.game.board[fromSq] = null;
  
        const placed = this.placedPieces.find(item => item.sq === fromSq);
        if (placed) placed.sq = toSq;
        this.saveSetupFormation();
  
        this.selectedBoardSq = -1;
        this.renderBoard();
        this.renderInventory();
        this.renderTalismans();
        this.spawnLandPuff(toSq);
  
        const newToImg = this.getSquareEl(toSq)?.querySelector('.piece');
        if (newToImg) {
          newToImg.classList.add('piece-land-bounce');
          setTimeout(() => newToImg.classList.remove('piece-land-bounce'), 220);
        }
  
        this.isSetupAnimating = false;
      }, 190);
    }
  },
  
  // =============================================
  // DITTO SPECIAL ABILITY: TRANSFORM INTO NEAREST ALLY
  // (Copy moveset & appearance only, retain Ditto stats)
  // =============================================

  transformDittoPieces() {
    const dittoIndices = [];
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (p && String(p.type) === '132') {
        dittoIndices.push(i);
      }
    }
  
    if (dittoIndices.length === 0) return;
  
    let anyTransformed = false;
  
    for (const sq of dittoIndices) {
      const piece = this.game.board[sq];
      if (!piece) continue;
  
      const rA = this.game.row(sq);
      const cA = this.game.col(sq);
  
      let bestAlly = null;
      let minDistance = Infinity;
  
      // Tìm quân đồng minh cùng màu gần nhất trên bàn cờ
      for (let j = 0; j < 64; j++) {
        if (j === sq) continue;
        const other = this.game.board[j];
        if (!other || other.color !== piece.color) continue;
  
        const rB = this.game.row(j);
        const cB = this.game.col(j);
        const dr = Math.abs(rA - rB);
        const dc = Math.abs(cA - cB);
  
        // Khoảng cách Chebyshev + Euclidean
        const chebyshev = Math.max(dr, dc);
        const euclideanSq = dr * dr + dc * dc;
  
        // Ưu tiên đồng minh khác loài Ditto nếu có nhiều đồng minh
        const isOtherDitto = (String(other.type) === '132');
        const dittoPenalty = isOtherDitto ? 0.01 : 0;
        const score = chebyshev * 100 + euclideanSq + dittoPenalty;
  
        if (score < minDistance) {
          minDistance = score;
          bestAlly = other;
        }
      }
  
      if (bestAlly) {
        // Biến hình thành Pokémon đồng minh gần nhất (sao chép ngoại hình & moveset)
        const targetType = bestAlly.transformType || bestAlly.type;
        piece.transformType = targetType;
        piece.isDittoTransformed = true;
        anyTransformed = true;
  
        const allyName = (typeof PIECES !== 'undefined' && PIECES[targetType] && PIECES[targetType].name)
          ? PIECES[targetType].name
          : `Pokemon #${targetType}`;
  
        const dittoSide = piece.color === W ? 'Your Ditto' : 'Enemy Ditto';
        this.addLog(`✨ [TRANSFORM] ${dittoSide} transformed into nearest ally: ${allyName}! (Copied appearance & moveset)`);
        this.updatePieceTypeBadge(sq);
  
        if (typeof CombatEngine !== 'undefined' && typeof CombatEngine.spawnTextPopup === 'function') {
          setTimeout(() => {
            CombatEngine.spawnTextPopup(this, sq, 'TRANSFORM!', 'transform-popup');
          }, 150);
        }
      }
    }
  
    if (anyTransformed && typeof soundManager !== 'undefined') {
      soundManager.playSfx('mutate');
    }
  },

  resetDittoTransformations() {
    for (let i = 0; i < 64; i++) {
      const p = this.game.board[i];
      if (p && p.isDittoTransformed) {
        delete p.transformType;
        delete p.isDittoTransformed;
      }
    }
    if (this.placedPieces) {
      for (const p of this.placedPieces) {
        if (p.isDittoTransformed) {
          delete p.transformType;
          delete p.isDittoTransformed;
        }
      }
    }
  }
  
  // =============================================
  // TURN-BASED COMBAT SYSTEM (PLAYER VS AI)
  // =============================================

});
