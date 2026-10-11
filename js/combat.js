// =============================================
// CHESS+ ROGUELIKE: REALTIME COMBAT ENGINE
// =============================================

'use strict';

const CombatEngine = {
  // Spawn floating damage popup (-1, -2)
  spawnDmgPopup(ui, sq, dmg) {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const popup = document.createElement('div');
    popup.className = 'dmg-popup';
    popup.textContent = `-${dmg}`;
    el.appendChild(popup);
    setTimeout(() => {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 750);
  },

  // Spawn floating heal popup (+1 HP)
  spawnHealPopup(ui, sq, amount) {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const popup = document.createElement('div');
    popup.className = 'dmg-popup heal-popup';
    popup.textContent = `+${amount} HP`;
    el.appendChild(popup);
    setTimeout(() => {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 750);
  },

  // Spawn floating special text popup (e.g. "REVIVED!")
  spawnTextPopup(ui, sq, text, colorClass = 'revive-popup') {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const popup = document.createElement('div');
    popup.className = `dmg-popup ${colorClass}`;
    popup.textContent = text;
    el.appendChild(popup);
    setTimeout(() => {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 850);
  },

  // Spawn Poison FX: rising and popping bubbles
  spawnPoisonFX(ui, sq) {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'poison-bubble';
      const size = 4 + Math.floor(Math.random() * 4);
      const dx = -8 + Math.floor(Math.random() * 17);
      const wobble = 2 + Math.floor(Math.random() * 4);
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = '50%';
      bubble.style.top = '50%';
      bubble.style.setProperty('--p-dx', `${dx}px`);
      bubble.style.setProperty('--p-wobble', `${wobble}px`);
      bubble.style.animationDelay = `${i * 65}ms`;
      el.appendChild(bubble);
      setTimeout(() => {
        if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
      }, 750 + i * 65);
    }
  },

  // Spawn Fire FX: jumping flame embers
  spawnFireFX(ui, sq) {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'fire-spark';
      const size = 3 + Math.floor(Math.random() * 3);
      const dx = -10 + Math.floor(Math.random() * 21);
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = '50%';
      spark.style.top = '50%';
      spark.style.setProperty('--f-dx', `${dx}px`);
      spark.style.animationDelay = `${i * 50}ms`;
      el.appendChild(spark);
      setTimeout(() => {
        if (spark && spark.parentNode) spark.parentNode.removeChild(spark);
      }, 650 + i * 50);
    }
  },

  // Spawn Electric FX: piece shock shake and lightning sparks
  spawnElectricFX(ui, sq) {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const pieceImg = el.querySelector('.piece');
    if (pieceImg) {
      pieceImg.classList.remove('piece-shock-shake');
      void pieceImg.offsetWidth;
      pieceImg.classList.add('piece-shock-shake');
      setTimeout(() => {
        if (pieceImg) pieceImg.classList.remove('piece-shock-shake');
      }, 480);
    }
    const count = 4;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'electric-spark';
      const dx = -8 + Math.floor(Math.random() * 17);
      const dy = -8 + Math.floor(Math.random() * 17);
      const rot = Math.floor(Math.random() * 360);
      spark.style.left = '50%';
      spark.style.top = '50%';
      spark.style.setProperty('--e-dx', `${dx}px`);
      spark.style.setProperty('--e-dy', `${dy}px`);
      spark.style.setProperty('--e-rot', `${rot}deg`);
      spark.style.animationDelay = `${i * 60}ms`;
      el.appendChild(spark);
      setTimeout(() => {
        if (spark && spark.parentNode) spark.parentNode.removeChild(spark);
      }, 550 + i * 60);
    }
  },

  // Spawn Bleed FX: dripping sharp blood droplets
  spawnBleedFX(ui, sq) {
    const el = ui.getSquareEl(sq);
    if (!el) return;
    const count = 3;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'bleed-spark';
      const dx = -6 + Math.floor(Math.random() * 13);
      drop.style.left = '50%';
      drop.style.top = '50%';
      drop.style.setProperty('--b-dx', `${dx}px`);
      drop.style.animationDelay = `${i * 70}ms`;
      el.appendChild(drop);
      setTimeout(() => {
        if (drop && drop.parentNode) drop.parentNode.removeChild(drop);
      }, 600 + i * 70);
    }
  },

  // Calculate pixel delta between two square elements in 512x288 layout
  calcDelta(ui, fromSq, toSq, fromEl, toEl) {
    const rowA = Math.floor(fromSq / 8), colA = fromSq % 8;
    const rowB = Math.floor(toSq / 8), colB = toSq % 8;
    const tileSize = 22; // px in fixed 512x288 layout
    return {
      dx: (colB - colA) * tileSize,
      dy: (rowB - rowA) * tileSize
    };
  },

  // Simple, impactful attack animation (fast forward lunge, instant recovery)
  triggerAttack(ui, fromSq, toSq, damage, targetDies, onComplete) {
    const fromEl = ui.getSquareEl(fromSq);
    const toEl = ui.getSquareEl(toSq);
    if (!fromEl || !toEl) {
      if (onComplete) onComplete();
      return;
    }

    const { dx, dy } = this.calcDelta(ui, fromSq, toSq, fromEl, toEl);
    const atkImg = fromEl.querySelector('.piece');
    const defImg = toEl.querySelector('.piece');

    if (atkImg) {
      atkImg.style.setProperty('--atk-dx', `${dx}px`);
      atkImg.style.setProperty('--atk-dy', `${dy}px`);
      atkImg.classList.remove('piece-attacking', 'piece-capturing');
      void atkImg.offsetWidth; // Force CSS reflow
      atkImg.classList.add(targetDies ? 'piece-capturing' : 'piece-attacking');
    }

    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('slash');
    }

    // Impact timing: 110ms into the strike
    setTimeout(() => {
      if (typeof soundManager !== 'undefined') {
        soundManager.playSfx(targetDies ? 'kill' : 'hit');
      }

      // 1. Defender flash reaction
      if (defImg) {
        defImg.classList.remove('piece-hit-flash');
        void defImg.offsetWidth;
        defImg.classList.add('piece-hit-flash');
        if (targetDies) {
          defImg.classList.add('piece-defeat-fade');
        }
      }

      // 2. Floating damage number & impact puff
      this.spawnDmgPopup(ui, toSq, damage);
      if (ui.spawnLandPuff) ui.spawnLandPuff(toSq);

      // 3. Update defender HP in DOM in-place immediately (no board wipe!)
      ui.pieceHP[toSq] -= damage;
      const defTarget = ui.game.board[toSq];
      if (defTarget) {
        const defSt = ui.getEffectivePieceStats ? ui.getEffectivePieceStats(defTarget) : (PIECE_STATS[defTarget.type] || PIECE_STATS.P);
        const curHp = Math.max(0, ui.pieceHP[toSq]);
        ui.updatePieceHpDOM(toSq, curHp, defSt.maxHp);
      }
    }, 110);

    // Strike completes (~240ms)
    setTimeout(() => {
      if (atkImg) {
        atkImg.classList.remove('piece-attacking', 'piece-capturing');
        atkImg.style.removeProperty('--atk-dx');
        atkImg.style.removeProperty('--atk-dy');
      }
      if (defImg) {
        defImg.classList.remove('piece-hit-flash');
      }
      if (onComplete) onComplete();
    }, 240);
  },

  // Piercing Line Attack (Arch): deals damage to all enemies along a straight line up to 3 tiles
  triggerLineAttack(ui, fromSq, lineSquares, enemiesOnLine, damage, onComplete) {
    const fromEl = ui.getSquareEl(fromSq);
    const atkImg = fromEl ? fromEl.querySelector('.piece') : null;

    // 1. Arch bow release animation (fast recoil pulse)
    if (atkImg) {
      atkImg.classList.remove('piece-attacking', 'piece-capturing');
      void atkImg.offsetWidth;
      atkImg.classList.add('piece-attacking');
    }

    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('arrow');
    }

    // 2. Flash beam along the line
    lineSquares.forEach(sq => {
      const el = ui.getSquareEl(sq);
      if (el) {
        el.classList.remove('line-attack-beam');
        void el.offsetWidth;
        el.classList.add('line-attack-beam');
        setTimeout(() => el.classList.remove('line-attack-beam'), 350);
      }
    });

    // 3. Impact timing on all enemies along the line (110ms)
    setTimeout(() => {
      if (typeof soundManager !== 'undefined') {
        const anyKilled = enemiesOnLine.some(sq => (ui.pieceHP[sq] || 1) <= damage);
        soundManager.playSfx(anyKilled ? 'kill' : 'hit');
      }

      enemiesOnLine.forEach(sq => {
        const defEl = ui.getSquareEl(sq);
        const defImg = defEl ? defEl.querySelector('.piece') : null;

        const tPiece = ui.game.board[sq];
        const atkPiece = ui.game.board[fromSq];
        let actualDmg = damage;
        let typeCombat = null;

        if (tPiece && atkPiece && typeof TypeSystem !== 'undefined') {
          typeCombat = TypeSystem.calculateCombatDamage(atkPiece, tPiece, fromSq, damage);
          actualDmg = typeCombat.damage;
        }

        if (ui.pieceHP[sq] === undefined) {
          const tSt = tPiece ? (ui.getEffectivePieceStats ? ui.getEffectivePieceStats(tPiece) : (PIECE_STATS[tPiece.type] || PIECE_STATS.P)) : PIECE_STATS.P;
          ui.pieceHP[sq] = tSt.maxHp;
        }

        const willDie = (ui.pieceHP[sq] - actualDmg) <= 0;

        if (defImg) {
          defImg.classList.remove('piece-hit-flash');
          void defImg.offsetWidth;
          defImg.classList.add('piece-hit-flash');
          if (willDie) defImg.classList.add('piece-defeat-fade');
        }

        this.spawnDmgPopup(ui, sq, actualDmg);
        if (typeCombat && typeCombat.descriptor && typeCombat.descriptor.popupText) {
          this.spawnTextPopup(ui, sq, typeCombat.descriptor.popupText, typeCombat.descriptor.tag);
        }

        ui.pieceHP[sq] -= actualDmg;
        const curHp = Math.max(0, ui.pieceHP[sq]);
        const targetPiece = ui.game.board[sq];
        if (targetPiece) {
          const tSt = ui.getEffectivePieceStats ? ui.getEffectivePieceStats(targetPiece) : (PIECE_STATS[targetPiece.type] || PIECE_STATS.P);
          ui.updatePieceHpDOM(sq, curHp, tSt.maxHp);
        }
      });
    }, 110);

    // 4. Complete and cleanup (~280ms)
    setTimeout(() => {
      if (atkImg) {
        atkImg.classList.remove('piece-attacking', 'piece-capturing');
      }
      enemiesOnLine.forEach(sq => {
        const dEl = ui.getSquareEl(sq);
        const dImg = dEl ? dEl.querySelector('.piece') : null;
        if (dImg) dImg.classList.remove('piece-hit-flash');
      });
      if (onComplete) onComplete();
    }, 280);
  },

  // Smooth slide advance to empty square
  triggerAdvance(ui, fromSq, toSq, onComplete) {
    const fromEl = ui.getSquareEl(fromSq);
    const toEl = ui.getSquareEl(toSq);
    if (!fromEl || !toEl) {
      if (onComplete) onComplete();
      return;
    }

    const { dx, dy } = this.calcDelta(ui, fromSq, toSq, fromEl, toEl);
    const atkImg = fromEl.querySelector('.piece');
    if (atkImg) {
      atkImg.style.setProperty('--move-dx', `${dx}px`);
      atkImg.style.setProperty('--move-dy', `${dy}px`);
      atkImg.classList.remove('piece-advance-move');
      void atkImg.offsetWidth;
      atkImg.classList.add('piece-advance-move');
    }

    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('move');
    }

    setTimeout(() => {
      if (atkImg) {
        atkImg.classList.remove('piece-advance-move');
        atkImg.style.removeProperty('--move-dx');
        atkImg.style.removeProperty('--move-dy');
      }
      if (onComplete) onComplete();
    }, 220);
  }
};

(typeof window !== 'undefined' ? window : globalThis).CombatEngine = CombatEngine;
