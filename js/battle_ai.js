// =============================================
// CHESS+ ROGUELIKE: AI EVALUATION ENGINE
// findBestMove (Level 4 Grandmaster AI)
// Auto battle system, aiTurn, battle status checks
// =============================================

'use strict';


// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {

  findBestMoveForPiece(fromSq, color, aiLevel = 4) {
    return this.findBestMove(color, aiLevel, fromSq);
  },

  findBestMove(color, aiLevel = 4, specificSq = null) {
    const oppColor = color === W ? B : W;
  
    // 1. Collect all legal moves (for whole army or specific piece)
    const allMoves = [];
    const sqStart = (specificSq !== null && specificSq !== undefined && specificSq >= 0) ? specificSq : 0;
    const sqEnd = (specificSq !== null && specificSq !== undefined && specificSq >= 0) ? specificSq + 1 : 64;
    for (let sq = sqStart; sq < sqEnd; sq++) {
      const p = this.game.board[sq];
      if (p && p.color === color) {
        const pMoves = this.game.pseudoMoves(sq);
        for (const m of pMoves) {
          if (m.captureOnly) {
            const target = this.game.board[m.to];
            if (!target || target.color === color) continue;
          }
          allMoves.push({ from: sq, move: m });
        }
      }
    }
  
    if (allMoves.length === 0) return null;
  
    // 2. Intelligence Scaling
    const blunderProb = color === W ? 0.00 : [0, 0.40, 0.15, 0.03, 0.00][aiLevel];
    const threatWeight = color === W ? 1.30 : [0, 0.00, 0.50, 1.00, 1.25][aiLevel];
    const tradeWeight = color === W ? 1.35 : [0, 0.00, 0.50, 1.00, 1.30][aiLevel];
    const promoWeight = color === W ? 1.45 : [0, 0.30, 0.70, 1.00, 1.40][aiLevel];
    const noiseScale = color === W ? 0 : [0, 200, 70, 15, 0][aiLevel];
    const poolMargin = color === W ? 0 : [0, 100, 40, 12, 0][aiLevel];
    const isBlunderTurn = color === B && Math.random() < blunderProb;
  
    // Collect all living enemy pieces to power hunting & pursuit
    // (EXCLUDE enemies that are already on shaking/collapsed tiles - they are already doomed!)
    const enemySquares = [];
    for (let s = 0; s < 64; s++) {
      const ep = this.game.board[s];
      if (ep && ep.color === oppColor) {
        if (this.shakingSquares && this.shakingSquares.has(s)) continue;
        if (this.collapsedSquares && this.collapsedSquares.has(s)) continue;
        enemySquares.push(s);
      }
    }
  
    // 3. Move Scoring
    allMoves.forEach(item => {
      const fromSq = item.from;
      const toSq = item.move.to;
      const move = item.move;
      const piece = this.game.board[fromSq];
      const pStats = this.getEffectivePieceStats(piece);
      const pieceVal = (PIECE_VALUES[piece.type] || 100) + (piece.talismans ? piece.talismans.length * 150 : 0);
      const currentHp = this.pieceHP[fromSq] !== undefined ? this.pieceHP[fromSq] : pStats.maxHp;
  
      let score = 0;
  
      // Early blunder impulse (low-level Black only)
      if (isBlunderTurn) {
        const target = this.game.board[toSq];
        if (target && target.color === oppColor) {
          score += 1500 + Math.random() * 500;
        } else {
          const toRow = this.game.row(toSq);
          score += (color === W ? (7 - toRow) : toRow) * 30 + Math.random() * 200;
        }
        // Even for blunder: NEVER commit suicide onto trembling or collapsed tiles!
        if (this.shakingSquares && this.shakingSquares.has(toSq)) {
          score -= 999999;
        }
        if (this.collapsedSquares && this.collapsedSquares.has(toSq)) {
          score -= 999999;
        }
        item.score = score;
        return;
      }
  
      // --- Factor A: Self-Preservation & Current Danger ---
      let isUnderThreat = false;
      let willDieIfStays = false;
      let hasDivineShield = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasDivineShield(piece) && !piece.divineShieldUsed;
      let hasRevive = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(piece) && !piece.phoenixUsed;
  
      if (threatWeight > 0) {
        const currentThreats = this.getAttackersOnSquare(fromSq, oppColor);
        isUnderThreat = currentThreats.length > 0;
        const threatMaxDmg = isUnderThreat ? Math.max(...currentThreats.map(a => a.damage)) : 0;
        const threatTotalDmg = isUnderThreat ? currentThreats.reduce((sum, a) => sum + a.damage, 0) : 0;
        willDieIfStays = (threatMaxDmg >= currentHp || threatTotalDmg >= currentHp) && !hasDivineShield && !hasRevive;
      }
  
      // --- Factor B: Line Attack (Arch 'A') ---
      if (move.isLineAttack) {
        const enemies = move.enemiesOnLine || [toSq];
        let totalPiercingScore = 0;
        let selfThornsDanger = 0;
  
        enemies.forEach(eSq => {
          const ePiece = this.game.board[eSq];
          if (!ePiece) return;
          const eStats = this.getEffectivePieceStats(ePiece);
          const eVal = (PIECE_VALUES[ePiece.type] || 100) + (ePiece.talismans ? ePiece.talismans.length * 150 : 0);
          const eHp = this.pieceHP[eSq] !== undefined ? this.pieceHP[eSq] : eStats.maxHp;
  
          let eDmg = pStats.damage;
          const eShield = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasDivineShield(ePiece) && !ePiece.divineShieldUsed;
          if (eShield) eDmg = 0;
          else if (typeof TalismanSystem !== 'undefined') eDmg = Math.max(1, eDmg - TalismanSystem.getDmgReduction(ePiece));
  
          const eRevive = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(ePiece) && !ePiece.phoenixUsed;
          const eDies = (eHp - eDmg <= 0) && !eRevive;
  
          if (eDies) {
            totalPiercingScore += 6500 + eVal * 4;
            if (ePiece.type === 'K') totalPiercingScore += 5000;
            if (ePiece.type === 'Q') totalPiercingScore += 3500;
          } else {
            totalPiercingScore += 2500 + eDmg * 800 + eVal * 1.2;
            if (eHp - eDmg <= 1) totalPiercingScore += 1500; // Left at 1 HP!
            if (eShield) totalPiercingScore += 600;
          }
  
          if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasThorns(ePiece)) {
            const th = TalismanSystem.getThornsDmg(ePiece) || 1;
            selfThornsDanger += th;
          }
        });
  
        score += 4500 + totalPiercingScore;
        // Thorns penalty
        if (selfThornsDanger > 0) {
          if (currentHp <= selfThornsDanger && !hasDivineShield && !hasRevive) {
            score -= 5000;
          } else {
            score -= selfThornsDanger * 300;
          }
        }
        score += 1000; // Safe distance artillery bonus
      }
  
      // --- Factor C: Direct Attack on Enemy Unit (ATTACKING IS ABSOLUTE TOP PRIORITY!) ---
      else {
        const target = this.game.board[toSq];
        if (target && target.color === oppColor) {
          const tStats = this.getEffectivePieceStats(target);
          const targetVal = (PIECE_VALUES[target.type] || 100) + (target.talismans ? target.talismans.length * 150 : 0);
          const targetHp = this.pieceHP[toSq] !== undefined ? this.pieceHP[toSq] : tStats.maxHp;
  
          let dmg = pStats.damage;
          if (typeof TypeSystem !== 'undefined') {
            dmg = TypeSystem.calculateCombatDamage(piece, target, fromSq, dmg).damage;
          }
          const tShield = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasDivineShield(target) && !target.divineShieldUsed;
          if (tShield) dmg = 0;
          else if (typeof TalismanSystem !== 'undefined') dmg = Math.max(dmg === 0 ? 0 : 1, dmg - TalismanSystem.getDmgReduction(target));
  
          const tRevive = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasRevive(target) && !target.phoenixUsed;
          const targetDies = (targetHp - dmg <= 0) && !tRevive;
          const tThorns = typeof TalismanSystem !== 'undefined' && TalismanSystem.hasThorns(target) ? (TalismanSystem.getThornsDmg(target) || 1) : 0;
  
          // BASE ATTACK INCENTIVE: Any attack deals free damage or secures a kill!
          score += 4500;
  
          // Special Xiangqi Cannon / Petard Attack ('E')
          if (piece.type === 'E') {
            if (targetDies) {
              score += 7000 + targetVal * 4;
              if (target.type === 'K') score += 5000;
              if (target.type === 'Q') score += 3500;
            } else {
              // Petard deals safe ranged damage from behind its screen!
              score += 2500 + dmg * 900 + targetVal * 1.5;
              if (targetHp - dmg === 1) score += 1800;
            }
          }
          // Melee / Standard Attackers
          else {
            if (targetDies) {
              score += 6500 + targetVal * 4;
              if (target.type === 'K') score += 5000;
              if (target.type === 'Q') score += 3500;
              if (tStats.damage >= 2) score += 1200; // Eliminating high threat damage dealer
              if (target.talismans && target.talismans.length > 0) score += 800;
  
              // Cross Cleave Splash bonus
              if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasSplash(piece)) {
                const tr = this.game.row(toSq), tc = this.game.col(toSq);
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = tr + dr, nc = tc + dc;
                    if (this.game.inBounds(nr, nc)) {
                      const nSq = this.game.idx(nr, nc);
                      const neighbor = this.game.board[nSq];
                      if (neighbor && neighbor.color === oppColor && (this.pieceHP[nSq] || 1) > 0) {
                        score += 600;
                        if ((this.pieceHP[nSq] || 1) <= 1) score += 2500; // Splash kill!
                      }
                    }
                  }
                }
              }
  
              // Vampiric Fang Lifesteal bonus
              if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasLifesteal(piece) && currentHp < pStats.maxHp) {
                score += 800;
              }
  
              // Retaliation risk simulation on toSq AFTER KILL
              if (threatWeight > 0) {
                this.game.board[toSq] = piece;
                this.game.board[fromSq] = null;
                const postThreats = this.getAttackersOnSquare(toSq, oppColor);
                this.game.board[fromSq] = piece;
                this.game.board[toSq] = target;
  
                if (postThreats.length > 0) {
                  const threatMaxDmg = Math.max(...postThreats.map(a => a.damage));
                  const canKillUs = threatMaxDmg >= currentHp && !hasDivineShield && !hasRevive;
                  const tradeDiff = targetVal - pieceVal;
  
                  if (canKillUs) {
                    if (tradeDiff >= 0) {
                      score += tradeDiff * 2 * tradeWeight; // Good trade (e.g. killed Queen/Rook with Pawn)
                    } else {
                      score -= (1800 + Math.abs(tradeDiff) * 2) * tradeWeight; // Bad trade, but still killed!
                    }
                  } else {
                    // Only chip damage: we survive! Minor caution
                    score -= (threatMaxDmg * 120) * threatWeight;
                  }
                } else {
                  score += 2000; // Free clean kill with zero retaliation!
                }
              }
            } else {
              // Target survives: in Chess+, attacker hits and returns SAFELY to fromSq!
              // Taking 0 damage! Attacking is essentially free damage!
              score += 1500 + dmg * 1000 + targetVal * 1.5;
              if (targetHp - dmg === 1) score += 2000; // Weakened to 1 HP, sets up kill next turn!
              if (tShield) score += 600; // Stripped enemy Divine Shield!
            }
          }
  
          // Spike Shield Thorns penalty (suicide avoidance)
          if (tThorns > 0) {
            if (currentHp <= tThorns && !hasDivineShield && !hasRevive) {
              score -= 6000; // Don't suicide on thorns!
            } else {
              score -= tThorns * 400;
            }
          }
        }
        // --- Factor D: Moving to an Empty Square (Advance & Hunt!) ---
        else {
          let postThreats = [];
          if (threatWeight > 0) {
            this.game.board[toSq] = piece;
            this.game.board[fromSq] = null;
            postThreats = this.getAttackersOnSquare(toSq, oppColor);
            this.game.board[fromSq] = piece;
            this.game.board[toSq] = null;
  
            if (postThreats.length > 0) {
              const threatMaxDmg = Math.max(...postThreats.map(a => a.damage));
              const canKillUs = threatMaxDmg >= currentHp && !hasDivineShield && !hasRevive;
              if (canKillUs) {
                // Stepping into a lethal one-shot trap!
                score -= (2500 + pieceVal * 2) * threatWeight;
              } else {
                // Enemy can only deal chip damage (we have enough HP to survive!)
                score -= (threatMaxDmg * 120) * threatWeight;
              }
            } else {
              score += 100;
              // If we are currently facing lethal danger on fromSq, moving away saves our life!
              if (isUnderThreat && willDieIfStays) {
                score += (1800 + pieceVal * 1.5) * threatWeight;
              }
            }
          }
  
          const toRow = this.game.row(toSq);
          const toCol = this.game.col(toSq);
  
          // 1. Hunting Instinct: Close distance to the nearest enemy piece!
          if (enemySquares.length > 0) {
            let minEnemyDist = 99;
            for (let k = 0; k < enemySquares.length; k++) {
              const eSq = enemySquares[k];
              const d = Math.max(Math.abs(toRow - this.game.row(eSq)), Math.abs(toCol - this.game.col(eSq)));
              if (d < minEnemyDist) minEnemyDist = d;
            }
            // Reward closing in to attack range:
            score += (8 - minEnemyDist) * 160;
          }
  
          // 2. Petard Cannon Sniping Position Synergy
          if (piece.type === 'E') {
            const petardAim = this.evaluatePetardCannonAim(toSq, color);
            score += petardAim;
            if (color === W && toRow < 3) score -= 350;
            if (color === B && toRow > 4) score -= 350;
          } else {
            // Allied piece sets up screen for Petard
            if (this.isAllyCreatingPetardScreen(fromSq, toSq, color)) {
              score += 750;
            }
          }
  
          // 3. Pawn Promotion Priority & Forward March
          if (piece.type === 'P') {
            if (color === W) {
              if (toRow === 0) score += (postThreats.length === 0 ? 5000 : 3000) * promoWeight;
              else if (toRow === 1) score += (postThreats.length === 0 ? 1500 : 600) * promoWeight;
              else score += (7 - toRow) * 60;
            } else {
              if (toRow === 7) score += (postThreats.length === 0 ? 5000 : 3000) * promoWeight;
              else if (toRow === 6) score += (postThreats.length === 0 ? 1500 : 600) * promoWeight;
              else score += toRow * 60;
            }
          } else {
            // Forward advance
            score += (color === W ? (7 - toRow) : toRow) * 35;
          }
  
          // 4. Centralization
          const centerDist = Math.abs(toCol - 3.5) + Math.abs(toRow - 3.5);
          score += (7 - centerDist) * 25;
  
          // 5. Threat Generation (Moving into position to strike next turn!)
          if (threatWeight >= 0.5) {
            this.game.board[toSq] = piece;
            this.game.board[fromSq] = null;
            const newMoves = this.game.pseudoMoves(toSq);
            this.game.board[fromSq] = piece;
            this.game.board[toSq] = null;
  
            let threatsGenerated = 0;
            for (const nm of newMoves) {
              if (!nm.moveOnly) {
                const potTarget = this.game.board[nm.to];
                if (potTarget && potTarget.color === oppColor) {
                  const ptVal = PIECE_VALUES[potTarget.type] || 100;
                  score += 400 + ptVal * 0.6;
                  if (potTarget.type === 'K' || potTarget.type === 'Q') score += 800;
                  threatsGenerated++;
                }
              }
            }
            if (threatsGenerated >= 2) score += 1200; // Tactical Fork setup!
          }
        }
      }
  
      // --- Sudden Death Hazard Avoidance & Predictive Ring Shrinkage ---
      const toLayer = this.getTileLayer(toSq);
      const fromLayer = this.getTileLayer(fromSq);
  
      // 1. Ô đang rung động (chắc chắn sẽ sập xuống vực thẳm vào cuối lượt)
      // Ngoại lệ: Nếu là Arch bắn xuyên đường thẳng (isLineAttack), Arch KHÔNG bước vào toSq!
      if (!move.isLineAttack && this.shakingSquares && this.shakingSquares.has(toSq)) {
        score -= 999999; // CẤM TUYỆT ĐỐI! Nhảy vào là 100% chết mất xác!
      }
      if (this.collapsedSquares && this.collapsedSquares.has(toSq)) {
        score -= 999999; // Ô đã sập thành hư không!
      }
      if (this.shakingSquares && this.shakingSquares.has(fromSq)) {
        // Quân đang đứng trên ô rung: khẩn cấp di tản đến ô an toàn!
        if (!this.shakingSquares.has(toSq) && !this.collapsedSquares.has(toSq)) {
          score += 30000; // Ưu tiên di tản cứu mạng cực đại!
        } else {
          score -= 999999; // Di chuyển sang 1 ô rung khác hoặc ô sập vẫn là tự sát!
        }
      }
  
      // 2. Dự đoán vòng thu hẹp theo lượt (Predictive Ring Shrinkage)
      if ((this.collapsePhase >= 1 || this.roundMoves >= 14) && toLayer === 0 && !move.isLineAttack) {
        score -= 999999; // CẤM TUYỆT ĐỐI BƯỚC RA VÀNH 0!
      } else if (this.roundMoves >= 13 && toLayer === 0 && !move.isLineAttack) {
        score -= 15000; // Chuẩn bị sập vành 0, nhanh chóng rút vào trong
      }
  
      if ((this.collapsePhase >= 2 || this.roundMoves >= 16) && toLayer <= 1 && !move.isLineAttack) {
        score -= 999999; // CẤM BƯỚC RA LAYER 1 VÀ 0!
      } else if (this.roundMoves >= 15 && toLayer <= 1 && !move.isLineAttack) {
        score -= 15000; // Chuẩn bị sập vành 1, rút sâu vào Layer 2 hoặc 4 ô tâm
      }
  
      if ((this.collapsePhase >= 3 || this.roundMoves >= 17) && !move.isLineAttack) {
        if (toLayer < 2) {
          score -= 999999;
        } else if (toLayer === 2) {
          score -= 15000; // Vành 2 đang sập
        } else if (toLayer === 3) {
          score += 8000; // Chiếm giữ 4 ô trung tâm tối thượng (27, 28, 35, 36)
        }
      }
  
      // Lực hút về tâm bàn cờ tăng vọt khi bàn cờ co hẹp
      if (this.roundMoves >= 12) {
        const distToCenter = Math.abs(this.game.row(toSq) - 3.5) + Math.abs(this.game.col(toSq) - 3.5);
        score -= distToCenter * (this.roundMoves >= 15 ? 400 : 150);
      }
  
      // 3. Bảo vệ tính cơ động của quân Tốt (Pawn Trap Prevention)
      // Tốt không thể đi lùi, nếu ô phía trước sắp sập hoặc là vực thẳm mà không có quân ăn chéo -> Tốt sẽ bị phong tỏa vĩnh viễn!
      if (piece.type === 'P') {
        const dir = piece.color === W ? -1 : 1;
        const frontRow = this.game.row(toSq) + dir;
        const frontCol = this.game.col(toSq);
        if (frontRow >= 0 && frontRow < 8) {
          const frontSq = frontRow * 8 + frontCol;
          const isFrontDead = (this.collapsedSquares && this.collapsedSquares.has(frontSq)) ||
                              (this.shakingSquares && this.shakingSquares.has(frontSq));
          if (isFrontDead) {
            let hasDiagonalTarget = false;
            for (const dc of [-1, 1]) {
              const dCol = frontCol + dc;
              if (dCol >= 0 && dCol < 8) {
                const diagSq = frontRow * 8 + dCol;
                const diagPiece = this.game.board[diagSq];
                if (diagPiece && diagPiece.color === oppColor && (!this.collapsedSquares || !this.collapsedSquares.has(diagSq))) {
                  hasDiagonalTarget = true;
                  break;
                }
              }
            }
            if (!hasDiagonalTarget) {
              score -= 3000; // Tránh đưa Tốt vào ngõ cụt bất động!
            }
          }
        }
      }
  
      // --- Anti-Oscillation / Infinite Loop Prevention ---
      const isOscillating = this.recentMoves.some(m => m.color === color && m.from === toSq && m.to === fromSq);
      if (isOscillating) {
        score -= (this.repetitionStreak >= 2 ? 3500 : 900);
      }
  
      // Small noise
      score += Math.random() * noiseScale;
      item.score = score;
    });
  
    allMoves.sort((a, b) => b.score - a.score);
  
    const bestScore = allMoves[0].score;
    const topMoves = allMoves.filter(m => (bestScore - m.score) <= poolMargin);
    return topMoves[Math.floor(Math.random() * topMoves.length)] || allMoves[0];
  },
  
  // =========================================================================
  // AUTO BATTLER SYSTEM (PLAYER AI: 0.5s PER MOVE, GRANDMASTER LEVEL 4)
  // =========================================================================

  startAutoBattle() {
    if (this.phase !== 'setup') return;
    if (this.placedPieces.length === 0) {
      this.showToast('Deploy pieces to begin battle!', 'error');
      return;
    }
    this.isAutoBattle = true;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
    this.showToast('⚡ Auto Battle started! AI playing...', 'gold');
    this.startBattle();
  },

  startManualBattle() {
    if (this.phase !== 'setup') return;
    if (this.placedPieces.length === 0) {
      this.showToast('Deploy pieces to begin battle!', 'error');
      return;
    }
    this.isAutoBattle = false;
    this.clearAutoBattleTimer();
    if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
    this.startBattle();
  },

  toggleAutoBattle() {
    this.startAutoBattle();
  },

  updateAutoBattleUI() {
    const btnAuto = document.getElementById('btnStartAutoBattle') || document.getElementById('btnToggleAutoBattle');
    const btnBattle = document.getElementById('btnStartBattle');
    const isBattle = this.phase === 'battle';
    const canDeploy = this.placedPieces.length > 0;
  
    if (btnAuto) {
      if (isBattle) {
        btnAuto.disabled = true;
        btnAuto.innerHTML = this.isAutoBattle ? '⚡ AUTO RUN' : '⚡ AUTO';
        btnAuto.classList.toggle('auto-active', !!this.isAutoBattle);
      } else {
        btnAuto.disabled = !canDeploy;
        btnAuto.innerHTML = '⚡ AUTO';
        btnAuto.classList.remove('auto-active');
      }
    }
  
    if (btnBattle) {
      if (isBattle) {
        btnBattle.disabled = true;
        btnBattle.textContent = t('combat.battle');
      } else {
        btnBattle.disabled = !canDeploy;
        btnBattle.textContent = t('combat.battle');
      }
    }
  },

  scheduleAutoBattleMove(delay = 500) {
    this.clearAutoBattleTimer();
    if (!this.isAutoBattle || this.phase !== 'battle' || this.game.turn !== W || this.isAnimating) return;
    this.autoBattleTimer = setTimeout(() => {
      this.executeAutoBattleTurn();
    }, delay);
  },

  clearAutoBattleTimer() {
    if (this.autoBattleTimer) {
      clearTimeout(this.autoBattleTimer);
      this.autoBattleTimer = null;
    }
  },

  executeAutoBattleTurn() {
    if (!this.isAutoBattle || this.phase !== 'battle' || this.game.turn !== W || this.isAnimating) return;
  
    if (!this.hasLegalMoves(W)) {
      this.addLog('⚠️ Quân của bạn bị kẹt không có nước đi và bỏ qua lượt!');
      this.game.turn = B;
      this.updateTurnIndicator();
      setTimeout(() => this.aiTurn(), 450);
      return;
    }
  
    // Pick best move for White with Level 4 Grandmaster Intelligence
    const chosen = this.findBestMove(W, 4);
    if (!chosen) {
      const status = this.checkBattleStatus();
      if (status === 'loss') {
        this.handleStageDefeat('All your pieces have fallen in battle!');
      } else {
        this.addLog('⚠️ Không có nước đi hợp lệ, bỏ qua lượt!');
        this.game.turn = B;
        this.updateTurnIndicator();
        setTimeout(() => this.aiTurn(), 450);
      }
      return;
    }
  
    this.selectedBoardSq = -1;
    this.legalTargets = [];
    this.renderSelectionRays();
    this.roundMoves++;
  
    this.executeTurnMove(chosen.from, chosen.move, () => {
      const status = this.checkBattleStatus();
      if (status === 'draw') {
        setTimeout(() => this.handleStageDraw(), 500);
        return;
      }
      if (status === 'win') {
        setTimeout(() => this.handleStageVictory(), 500);
        return;
      }
      if (status === 'loss') {
        setTimeout(() => this.handleStageDefeat('All your pieces have fallen in battle!'), 500);
        return;
      }
  
      if (!this.hasLegalMoves(B)) {
        this.addLog('⚠️ Quân địch bị kẹt và bỏ qua lượt!');
        this.game.turn = W;
        this.updateTurnIndicator();
        if (this.isAutoBattle) this.scheduleAutoBattleMove(500);
        return;
      }
  
      // White turn finished -> switch to Black (AI)
      this.game.turn = B;
      this.updateTurnIndicator();
      setTimeout(() => this.aiTurn(), 450);
    });
  },
  
  // AI Turn Logic for Black Army

  aiTurn() {
    if (this.phase !== 'battle' || this.game.turn !== B) return;
  
    const aiLevel = Math.min(4, 1 + Math.floor((this.stage - 1) / 3));
    const chosen = this.findBestMove(B, aiLevel);
  
    if (!chosen) {
      this.addLog('⚠️ Quân địch bị kẹt và bỏ qua lượt!');
      this.game.turn = W;
      this.updateTurnIndicator();
      if (this.isAutoBattle && this.phase === 'battle') {
        this.scheduleAutoBattleMove(500);
      }
      return;
    }
  
    this.executeTurnMove(chosen.from, chosen.move, () => {
      const status = this.checkBattleStatus();
      if (status === 'draw') {
        setTimeout(() => this.handleStageDraw(), 500);
        return;
      }
      if (status === 'win') {
        setTimeout(() => this.handleStageVictory(), 500);
        return;
      }
      if (status === 'loss') {
        setTimeout(() => this.handleStageDefeat('All your pieces have fallen in battle!'), 500);
        return;
      }
  
      // Check Sudden Death Collapse after the round finishes!
      this.checkSuddenDeathCollapse(() => {
        const postCollapseStatus = this.checkBattleStatus();
        if (postCollapseStatus === 'draw') {
          setTimeout(() => this.handleStageDraw(), 500);
          return;
        }
        if (postCollapseStatus === 'win') {
          setTimeout(() => this.handleStageVictory(), 500);
          return;
        }
        if (postCollapseStatus === 'loss') {
          setTimeout(() => this.handleStageDefeat('All your pieces have fallen in battle!'), 500);
          return;
        }
  
        // If White (Player) has no legal moves left, White simply passes turn (no game defeat)
        if (!this.hasLegalMoves(W)) {
          this.addLog('⚠️ Quân của bạn bị kẹt và bỏ qua lượt!');
        }
  
        // AI turn finished -> trigger end of round triggers & return turn to Player (White)
        if (typeof SynergySystem !== 'undefined') {
          SynergySystem.onRoundEnd(this);
        }
        this.game.turn = W;
        this.updateTurnIndicator();
        // If Auto Battler is active, trigger White auto-move after 0.5s!
        if (this.isAutoBattle && this.phase === 'battle') {
          this.scheduleAutoBattleMove(500);
        }
      });
    });
  }

});
