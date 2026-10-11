// =============================================
// CHESS+ ROGUELIKE: ANIMATION & FX SYSTEM
// Centralized spell animations, talisman equip FX,
// and clean floating text notifications (NO raw emojis)
// =============================================

'use strict';

const AnimationSystem = {
  /**
   * Helper to clean any emoji or accidental icon characters from string
   */
  cleanText(str) {
    if (!str) return '';
    return String(str)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[👑✨💰🪞🔮⚔️🛡️❤️⚡]/g, '')
      .trim();
  },

  /**
   * Universal Floating Popup Notification
   * Reusable for any notification anywhere on board or bench.
   *
   * @param {Object} options
   * @param {Object} options.ui - RoguelikeUI instance
   * @param {number} [options.targetSq] - Square index (0..63)
   * @param {number|string} [options.invId] - Bench slot inventory ID
   * @param {string} options.text - Notification text (e.g. "+10 GOLD", "CLONED", "+1 SOCKET")
   * @param {string} [options.type='gold'] - Preset type: 'gold' | 'equip' | 'arcane' | 'mirror' | 'promote' | 'heal' | 'damage'
   * @param {string} [options.iconSrc=null] - Optional pixel icon image path (e.g. 'assets/ui/coin.png')
   * @param {number} [options.duration=850] - Display duration in ms
   */
  notify(options = {}) {
    const {
      ui,
      targetSq,
      invId,
      text = '',
      type = 'gold',
      iconSrc = null,
      duration = 850
    } = options;

    if (!ui) return;

    let container = null;
    if (options.targetEl) {
      container = options.targetEl;
    } else if (targetSq !== undefined && targetSq !== null && targetSq !== -1) {
      container = ui.getSquareEl(targetSq);
    } else if (invId !== undefined && invId !== null) {
      container = document.querySelector(`.inv-slot[data-inv-id="${invId}"]`);
    } else {
      container = document.getElementById('btnSellTalisman') || document.getElementById('statGold');
    }

    if (!container) return;

    // Map semantic type to CSS color class
    const typeClassMap = {
      gold: 'gold-popup',
      equip: 'equip-popup',
      arcane: 'arcane-popup',
      spell: 'arcane-popup',
      mirror: 'mirror-popup',
      promote: 'revive-popup',
      heal: 'heal-popup',
      damage: ''
    };
    const colorClass = typeClassMap[type] !== undefined ? typeClassMap[type] : (type || 'gold-popup');

    const popup = document.createElement('div');
    popup.className = `dmg-popup ${colorClass}`.trim();

    // Sanitize text to remove any emojis
    const cleanStr = this.cleanText(text);

    // Optional pixel icon image (Crisp 8-bit game asset, NOT emoji)
    if (iconSrc) {
      const icon = document.createElement('img');
      icon.className = 'popup-pixel-icon';
      icon.src = iconSrc;
      icon.alt = '';
      popup.appendChild(icon);
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = cleanStr;
    popup.appendChild(textSpan);

    container.appendChild(popup);

    setTimeout(() => {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, duration);
  },

  // Backward-compatible shortcut
  spawnFloatingText(ui, targetSq, invId, text, type = 'gold') {
    this.notify({ ui, targetSq, invId, text, type });
  },

  // Helper shortcuts for future features
  notifyGold(ui, targetSq, invId, amount) {
    this.notify({ ui, targetSq, invId, text: `+${amount} GOLD`, type: 'gold' });
  },

  notifyEquip(ui, targetSq, invId, talismanName) {
    this.notify({ ui, targetSq, invId, text: `+ ${talismanName.toUpperCase()}`, type: 'equip' });
  },

  notifySpell(ui, targetSq, invId, spellEffectText) {
    this.notify({ ui, targetSq, invId, text: spellEffectText, type: 'arcane' });
  },

  // Triggers piece elevation & radiant flash animation
  animatePiece(ui, targetSq, invId, animClass = 'piece-equip-anim', duration = 750) {
    let img = null;
    if (targetSq !== undefined && targetSq !== null && targetSq !== -1) {
      const el = ui.getSquareEl(targetSq);
      if (el) img = el.querySelector('.piece');
    }
    if (!img && invId !== undefined && invId !== null) {
      const invSlot = document.querySelector(`.inv-slot[data-inv-id="${invId}"]`);
      if (invSlot) {
        img = invSlot.querySelector('.inv-slot-piece');
        invSlot.classList.remove('inv-slot-bounce');
        void invSlot.offsetWidth;
        invSlot.classList.add('inv-slot-bounce');
        setTimeout(() => invSlot.classList.remove('inv-slot-bounce'), 250);
      }
    }

    if (img) {
      img.classList.remove(animClass);
      void img.offsetWidth; // Force reflow
      img.classList.add(animClass);
      setTimeout(() => img.classList.remove(animClass), duration);
    }
  },

  // Play Spell Cast FX (Audio + Visual Animation + Clean Floating Badge)
  playSpellCastFX(ui, spellId, targetSq, invId) {
    switch (spellId) {
      case 'crown_of_ascension': {
        if (typeof soundManager !== 'undefined') soundManager.playSfx('promote');
        this.animatePiece(ui, targetSq, invId, 'piece-transform-anim', 750);
        this.notify({ ui, targetSq, invId, text: 'CROWNED QUEEN', type: 'promote' });
        if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
          ui.spawnLandPuff(targetSq);
        }
        break;
      }

      case 'dark_transmutation': {
        if (typeof soundManager !== 'undefined') soundManager.playSfx('mutate');
        this.animatePiece(ui, targetSq, invId, 'piece-transform-anim', 750);
        this.notify({ ui, targetSq, invId, text: 'MUTATED', type: 'arcane' });
        if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
          ui.spawnLandPuff(targetSq);
        }
        break;
      }

      case 'midas_touch': {
        if (typeof soundManager !== 'undefined') {
          soundManager.playSfx('coin');
          setTimeout(() => soundManager.playSfx('coin'), 90);
        }
        this.notify({ ui, targetSq, invId, text: '+10 GOLD', type: 'gold' });
        if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
          ui.spawnLandPuff(targetSq);
        }
        // Pulse gold pill in header
        const goldPill = document.querySelector('.gold-pill');
        if (goldPill) {
          goldPill.classList.remove('pill-bounce');
          void goldPill.offsetWidth;
          goldPill.classList.add('pill-bounce');
          setTimeout(() => goldPill.classList.remove('pill-bounce'), 400);
        }
        break;
      }

      case 'astral_mirror': {
        if (typeof soundManager !== 'undefined') {
          soundManager.playSfx('magic');
          soundManager.playSfx('reflect');
        }
        this.animatePiece(ui, targetSq, invId, 'piece-equip-anim', 750);
        this.notify({ ui, targetSq, invId, text: 'CLONED', type: 'mirror' });
        if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
          ui.spawnLandPuff(targetSq);
        }
        // Highlight bench slot
        const lastSlot = document.querySelector('.inv-slot:not(.empty-slot)');
        if (lastSlot) {
          lastSlot.classList.remove('inv-slot-bounce');
          void lastSlot.offsetWidth;
          lastSlot.classList.add('inv-slot-bounce');
          setTimeout(() => lastSlot.classList.remove('inv-slot-bounce'), 250);
        }
        break;
      }

      case 'talisman_expansion': {
        if (typeof soundManager !== 'undefined') soundManager.playSfx('socket');
        this.animatePiece(ui, targetSq, invId, 'piece-equip-anim', 750);
        this.notify({ ui, targetSq, invId, text: '+1 SOCKET', type: 'arcane' });
        if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
          ui.spawnLandPuff(targetSq);
        }
        break;
      }

      default: {
        if (typeof soundManager !== 'undefined') soundManager.playSfx('magic');
        this.animatePiece(ui, targetSq, invId, 'piece-equip-anim', 750);
        if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
          ui.spawnLandPuff(targetSq);
        }
        break;
      }
    }
  },

  // Play Talisman Equip FX (Audio + Visual Animation + Clean Floating Badge)
  playTalismanEquipFX(ui, talId, targetSq, invId) {
    const talDef = (typeof TalismanSystem !== 'undefined') ? TalismanSystem.get(talId) : null;
    const talName = talDef ? talDef.name : 'TALISMAN';

    // Satisfying procedural crystal socket audio
    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('socket');
    }

    // Glowing animation on piece
    this.animatePiece(ui, targetSq, invId, 'piece-equip-anim', 750);

    // Clean floating text badge without emoji
    this.notify({
      ui,
      targetSq,
      invId,
      text: `+ ${talName.toUpperCase()}`,
      type: 'equip'
    });

    // Land puff at base if on board
    if (targetSq !== undefined && targetSq !== null && targetSq !== -1 && ui.spawnLandPuff) {
      ui.spawnLandPuff(targetSq);
    }
  }
};
