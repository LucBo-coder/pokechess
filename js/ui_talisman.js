// =============================================
// CHESS+ ROGUELIKE: TALISMAN & SYNERGY SYSTEM
// Talisman inventory, shop, synergy tab, rendering
// =============================================

'use strict';

// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {

  getTalismanSellPrice(item) {
    if (!item) return 2;
    const tid = item.talismanId || item;
    const def = (typeof TalismanSystem !== 'undefined') ? I18n.itemDefinition(tid) : null;
    const baseCost = (def && def.price) ? def.price : 5;
    const ratio = (item.maxUses && item.usesLeft) ? (item.usesLeft / item.maxUses) : 1;
    return Math.max(1, Math.round(baseCost * 0.5 * ratio));
  },

  sellSelectedBagTalisman() {
    if (this.phase === 'battle') {
      this.showToast('Cannot sell talismans during combat!', 'warning');
      return;
    }
    if (!this.talismanInventory || this.talismanInventory.length === 0) {
      this.showToast('Talisman bag is empty!', 'warning');
      return;
    }
  
    let target = null;
    if (this.selectedBagTalismanId) {
      target = this.talismanInventory.find(i => i.id === this.selectedBagTalismanId);
    }
    if (!target && this.talismanInventory.length === 1) {
      target = this.talismanInventory[0];
    }
  
    if (!target) {
      this.showToast('Please select a talisman in your bag to sell!', 'warning');
      return;
    }
  
    this.sellBagTalisman(target);
  },

  sellBagTalisman(item) {
    if (this.phase === 'battle') {
      this.showToast('Cannot sell talismans during combat!', 'warning');
      return;
    }
    if (!item) return;
    const idx = this.talismanInventory.findIndex(i => i.id === item.id);
    if (idx === -1) return;
  
    const def = (typeof TalismanSystem !== 'undefined') ? I18n.itemDefinition(item.talismanId) : null;
    const talName = def ? def.name : 'Talisman';
    const sellPrice = this.getTalismanSellPrice(item);
  
    if (this.activeApplyingTalisman && this.activeApplyingTalisman.id === item.id) {
      this.cancelApplyTalisman();
    }
  
    this.talismanInventory.splice(idx, 1);
    if (this.selectedBagTalismanId === item.id) {
      this.selectedBagTalismanId = null;
    }
  
    this.gold += sellPrice;
  
    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('coin');
    }
  
    if (typeof AnimationSystem !== 'undefined') {
      AnimationSystem.notify({
        ui: this,
        text: `+${sellPrice} GOLD`,
        type: 'gold'
      });
    }
  
    this.addLog(`Sold [${talName}] for +${sellPrice} Gold.`);
    this.updateStats();
    this.renderTalismans();
    this.renderShop();
  },

  setTalismanTab(tab) {
    this.talismanTab = tab;
    this.selectedBagTalismanId = null;
    const tabBag = document.getElementById('tabTalismanBag');
    const tabType = document.getElementById('tabTalismanType');
    const tabShop = document.getElementById('tabTalismanShop');
    if (tabBag) tabBag.classList.toggle('active', tab === 'bag');
    if (tabType) tabType.classList.toggle('active', tab === 'type' || tab === 'synergy');
    if (tabShop) tabShop.classList.toggle('active', tab === 'shop');
    this.renderTalismans();
  },

  rollTalismanChoices() {
    if (typeof TalismanSystem === 'undefined') return;
    const keys = TalismanSystem.getAllKeys();
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3);
    this.talismanChoices = picked.map(tid => {
      const def = I18n.itemDefinition(tid);
      return {
        talismanId: tid,
        price: def ? def.price : 5
      };
    });
  },

  rerollTalismans() {
    if (this.phase === 'battle') {
      alert('Cannot reroll talismans during combat!');
      return;
    }
    if (this.gold < 3) {
      alert('You need at least 3 Gold to reroll the talisman shop!');
      return;
    }
    this.gold -= 3;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
    this.rollTalismanChoices();
    this.renderTalismans();
    this.updateStats();
    this.addLog('Rerolled talisman shop for 3 Gold.');
  },

  buyTalisman(talismanId, price = 5) {
    if (this.phase === 'battle') {
      alert('Cannot purchase talismans during combat!');
      return;
    }
    if (this.gold < price) {
      alert(`You need at least ${price} Gold to purchase this talisman!`);
      return;
    }
  
    const def = I18n.itemDefinition(talismanId);
    if (!def) return;
  
    this.gold -= price;
    if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
    const newItem = {
      id: this.talismanNextId++,
      talismanId: talismanId,
      usesLeft: def.maxUses,
      maxUses: def.maxUses
    };
    this.talismanInventory.push(newItem);
  
    // Remove from shop choices
    const idx = this.talismanChoices.findIndex(c => c.talismanId === talismanId);
    if (idx !== -1) {
      this.talismanChoices.splice(idx, 1);
    }
  
    this.addLog(`Purchased [${def.name}] for ${price} Gold!`);
    this.updateStats();
    this.renderTalismans();
  },

  startApplyTalisman(talismanItem) {
    if (this.phase === 'battle') {
      alert('Can only equip talismans during the preparation phase!');
      return;
    }
  
    if (this.activeApplyingTalisman && this.activeApplyingTalisman.id === talismanItem.id) {
      this.cancelApplyTalisman();
      return;
    }
  
    this.activeApplyingTalisman = talismanItem;
    this.selectedInvId = null;
    this.selectedBoardSq = -1;
  
    const banner = document.getElementById('talismanApplyBanner');
    if (banner) {
      banner.classList.remove('hidden');
      const msg = banner.querySelector('.talisman-apply-msg');
      if (msg) {
        const talDef = I18n.itemDefinition(talismanItem.talismanId);
        msg.textContent = (talDef && talDef.isSpell)
          ? `Use [${talDef.name}] on a compatible Pokémon (${talDef.targetDesc})!`
          : `Select a Pokémon to equip [${talDef?.name || 'Talisman'}]!`;
      }
    }
  
    this.renderTalismans();
    this.renderInventory();
    this.renderBoard();
  },

  cancelApplyTalisman() {
    this.activeApplyingTalisman = null;
    const banner = document.getElementById('talismanApplyBanner');
    if (banner) banner.classList.add('hidden');
  
    this.renderTalismans();
    this.renderInventory();
    this.renderBoard();
  },

  applyTalismanToPiece(pieceOrItem) {
    if (!this.activeApplyingTalisman) return;
  
    const talId = this.activeApplyingTalisman.talismanId;
    const talDef = I18n.itemDefinition(talId);
    if (!talDef) return;
  
    if (!TalismanSystem.isApplicable(talId, pieceOrItem.type)) {
      alert(`[${talDef.name}] can only be equipped to: ${talDef.targetDesc}!`);
      return;
    }
  
    const targetInvId = pieceOrItem.invId || pieceOrItem.id;
    const placed = this.placedPieces.find(p => p.invId === targetInvId || (pieceOrItem.sq !== undefined && p.sq === pieceOrItem.sq));
    const targetSq = (pieceOrItem.sq !== undefined) ? pieceOrItem.sq : (placed ? placed.sq : -1);
  
    // SPELLED CONSUMABLE EFFECT
    if (talDef.isSpell) {
      const success = talDef.cast(this, pieceOrItem);
      if (success === false) return;
  
      // Consume spell and remove from inventory
      this.talismanInventory = this.talismanInventory.filter(t => t.id !== this.activeApplyingTalisman.id);
      this.cancelApplyTalisman();
      this.renderTalismans();
      this.renderInventory();
      this.renderBoard();
      this.updateStats();
  
      // Trigger Centralized Spell Cast FX on the fresh DOM
      if (typeof AnimationSystem !== 'undefined') {
        AnimationSystem.playSpellCastFX(this, talId, targetSq, targetInvId);
      }
      return;
    }
  
    const invItem = this.inventory.find(i => i.id === targetInvId);
    const boardPiece = placed ? this.game.board[placed.sq] : (pieceOrItem.sq !== undefined ? this.game.board[pieceOrItem.sq] : null);
  
    const maxSlots = (pieceOrItem.maxTalismans || (invItem && invItem.maxTalismans) || (placed && placed.maxTalismans) || (boardPiece && boardPiece.maxTalismans) || 3) + (window.MetaProgression?.getExtraTalismanSlots() ?? 0);
  
    if (!pieceOrItem.talismans) {
      pieceOrItem.talismans = [];
    }
  
    const currentTalismans = (pieceOrItem.talismans && pieceOrItem.talismans.length > 0)
      ? pieceOrItem.talismans
      : (invItem && invItem.talismans && invItem.talismans.length > 0)
        ? invItem.talismans
        : (placed && placed.talismans ? placed.talismans : []);
  
    if (currentTalismans.length >= maxSlots) {
      this.showToast(t('equipment.full',{count:currentTalismans.length,max:maxSlots}), 'warning');
      return;
    }
  
    if (currentTalismans.includes(talId)) {
      alert(`This Pokémon already has [${talDef.name}] equipped!`);
      return;
    }
  
    // Attach talisman
    pieceOrItem.talismans.push(talId);
  
    // Sync between inventory item and board deployed piece
    if (pieceOrItem.id !== undefined) {
      // Bench inventory item
      const deployed = this.placedPieces.find(p => p.invId === pieceOrItem.id);
      if (deployed) {
        if (!deployed.talismans) deployed.talismans = [];
        if (!deployed.talismans.includes(talId)) deployed.talismans.push(talId);
        const bPiece = this.game.board[deployed.sq];
        if (bPiece) {
          if (!bPiece.talismans) bPiece.talismans = [];
          if (!bPiece.talismans.includes(talId)) bPiece.talismans.push(talId);
        }
      }
    } else if (pieceOrItem.invId !== undefined) {
      // Board piece
      const iItem = this.inventory.find(i => i.id === pieceOrItem.invId);
      if (iItem) {
        if (!iItem.talismans) iItem.talismans = [];
        if (!iItem.talismans.includes(talId)) iItem.talismans.push(talId);
      }
      if (placed) {
        if (!placed.talismans) placed.talismans = [];
        if (!placed.talismans.includes(talId)) placed.talismans.push(talId);
      }
    }
  
    // Save formation
    this.saveSetupFormation();
  
    // Decrement uses
    this.activeApplyingTalisman.usesLeft--;
    const left = this.activeApplyingTalisman.usesLeft;
    const max = this.activeApplyingTalisman.maxUses;
  
    this.addLog(`Equipped [${talDef.name}] to ${PIECE_NAMES[pieceOrItem.type] || pieceOrItem.type}! (${left}/${max} uses remaining)`);
  
    if (left <= 0) {
      this.talismanInventory = this.talismanInventory.filter(t => t.id !== this.activeApplyingTalisman.id);
      this.addLog(`[${talDef.name}] has been completely depleted.`);
    }
  
    this.cancelApplyTalisman();
    this.renderTalismans();
    this.renderInventory();
    this.renderBoard();
    this.updateStats();
  
    // Trigger Centralized Talisman Equip FX (Sound + Glowing Piece + Floating Badge)
    if (typeof AnimationSystem !== 'undefined') {
      AnimationSystem.playTalismanEquipFX(this, talId, targetSq, targetInvId);
    }
  },

  getSelectedPiece() {
    if (this.selectedBoardSq !== -1) {
      const p = this.game.board[this.selectedBoardSq];
      if (p && p.color === (typeof W !== 'undefined' ? W : 'w')) return p;
    }
    if (this.selectedInvId) {
      const item = this.inventory.find(i => i.id === this.selectedInvId);
      if (item) return item;
    }
    return null;
  },

  renderTalismans() {
    const badge = document.getElementById('talismanCountBadge');
    if (badge) badge.textContent = this.talismanInventory.length;
  
    const synBadge = document.getElementById('talismanTypeBadge');
    if (synBadge && typeof SynergySystem !== 'undefined') {
      synBadge.textContent = SynergySystem.getActiveCount(this);
    }

    const content = document.getElementById('talismanContent');
    if (!content) return;
    content.innerHTML = '';
  
    const footer = document.getElementById('talismanFooter');
    const btnSellTalisman = document.getElementById('btnSellTalisman');
    const btnRerollTalisman = document.getElementById('btnRerollTalisman');

    // === TAB 1: SYNERGY SYSTEM TAB ===
    if (this.talismanTab === 'type' || this.talismanTab === 'synergy') {
      if (footer) footer.style.display = 'none';
      if (typeof SynergySystem !== 'undefined') {
        SynergySystem.renderSynergyPanel(this, content);
        window.HexTraits?.renderSynergies(this, content);
      }
      return;
    }
  
    if (footer) {
      footer.style.display = 'flex';
    }
  
    // === TAB 2: BAG VIEW ===
    if (this.talismanTab === 'bag') {
      if (btnRerollTalisman) btnRerollTalisman.style.display = 'none';
      if (btnSellTalisman) {
        btnSellTalisman.style.display = 'inline-flex';
  
        // Auto-select single talisman if none currently selected
        if (!this.selectedBagTalismanId && this.talismanInventory.length === 1) {
          this.selectedBagTalismanId = this.talismanInventory[0].id;
        } else if (this.selectedBagTalismanId && !this.talismanInventory.some(i => i.id === this.selectedBagTalismanId)) {
          this.selectedBagTalismanId = null;
        }
  
        const selectedItem = this.talismanInventory.find(i => i.id === this.selectedBagTalismanId);
        if (this.phase === 'battle') {
          btnSellTalisman.disabled = true;
          btnSellTalisman.innerHTML = t('shop.sell');
          btnSellTalisman.title = 'Cannot sell talismans during combat';
        } else if (selectedItem) {
          const sellPrice = this.getTalismanSellPrice(selectedItem);
          const def = I18n.itemDefinition(selectedItem.talismanId);
          btnSellTalisman.disabled = false;
          btnSellTalisman.innerHTML = `SELL +${sellPrice}<img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="G" />`;
          btnSellTalisman.title = `Sell [${def?.name || 'Talisman'}] for ${sellPrice} Gold`;
        } else {
          btnSellTalisman.disabled = (this.talismanInventory.length === 0);
          btnSellTalisman.innerHTML = t('shop.sell');
          btnSellTalisman.title = (this.talismanInventory.length === 0)
            ? 'Talisman bag is empty'
            : 'Select a talisman in bag to sell';
        }
      }
  
      const selectedPiece = this.getSelectedPiece();
      let hasRenderedUnitSection = false;
  
      if (selectedPiece) {
        const invItem = this.inventory.find(i => i.id === (selectedPiece.invId || selectedPiece.id));
        const placed = (this.selectedBoardSq !== -1)
          ? this.placedPieces.find(p => p.sq === this.selectedBoardSq)
          : this.placedPieces.find(p => p.invId === (selectedPiece.invId || selectedPiece.id));
        const maxSlots = (selectedPiece.maxTalismans || (invItem && invItem.maxTalismans) || (placed && placed.maxTalismans) || 3) + (window.MetaProgression?.getExtraTalismanSlots() ?? 0);
  
        const attachedTalismans = (selectedPiece.talismans && selectedPiece.talismans.length > 0)
          ? selectedPiece.talismans
          : (placed && placed.talismans && placed.talismans.length > 0)
            ? placed.talismans
            : (invItem && invItem.talismans ? invItem.talismans : []);
  
        const pieceName = (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[selectedPiece.type]) ? PIECE_NAMES[selectedPiece.type] : 'POKÉMON';
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'talisman-section-divider';
        sectionHeader.textContent = `${pieceName.toUpperCase()} (${attachedTalismans.length}/${maxSlots})`;
        content.appendChild(sectionHeader);
        hasRenderedUnitSection = true;
  
        if (attachedTalismans.length > 0) {
          for (const tid of attachedTalismans) {
            const def = I18n.itemDefinition(tid);
            if (!def) continue;
  
            const card = document.createElement('div');
            card.className = 'talisman-card talisman-equipped-card';
            card.innerHTML = `
              <div class="talisman-card-header">
                <img src="${def.icon}" class="talisman-icon" alt="${def.name}" />
                <div class="talisman-card-title-wrap">
                  <div class="talisman-name">${def.name}</div>
                  <div class="talisman-target-desc">${def.targetDesc}</div>
                </div>
                <div class="talisman-status-badge">EQUIPPED</div>
              </div>
              <div class="talisman-desc">${def.desc || def.description}</div>
            `;
            content.appendChild(card);
          }
        }
      }
  
      // Render unassigned talismans in bag
      if (this.talismanInventory.length > 0) {
        if (hasRenderedUnitSection) {
          const divider = document.createElement('div');
          divider.className = 'talisman-section-divider';
          divider.textContent = `TALISMANS IN BAG (${this.talismanInventory.length})`;
          content.appendChild(divider);
        }
  
        for (const item of this.talismanInventory) {
          const def = I18n.itemDefinition(item.talismanId);
          if (!def) continue;
  
          const isSelected = this.selectedBagTalismanId === item.id;
          const isApplying = this.activeApplyingTalisman && this.activeApplyingTalisman.id === item.id;
          const isSpell = !!def.isSpell;
          const badgeText = isSpell ? I18n.legacy('SPELL') : `${item.usesLeft}/${item.maxUses}`;
          const badgeClass = isSpell ? 'talisman-uses-badge talisman-spell-badge' : 'talisman-uses-badge';
          const actionText = I18n.legacy(isApplying ? 'CANCEL' : (isSpell ? 'USE' : 'EQUIP'));
  
          const card = document.createElement('div');
          card.className = `talisman-card ${isSelected ? 'bag-selected' : ''} ${isApplying ? 'applying-active' : ''} ${isSpell ? 'spell-card' : ''}`;
  
          card.innerHTML = `
            <div class="talisman-card-header">
              <img src="${def.icon}" class="talisman-icon" alt="${def.name}" />
              <div class="talisman-card-title-wrap">
                <div class="talisman-name">${def.name}</div>
                <div class="talisman-target-desc">${def.targetDesc}</div>
              </div>
              <div class="${badgeClass}">${badgeText}</div>
            </div>
            <div class="talisman-desc">${def.desc || def.description}</div>
            <div class="talisman-card-action">
              <button class="btn-use-talisman ${isApplying ? 'btn-cancel' : ''}" type="button">
                ${actionText}
              </button>
            </div>
          `;
  
          const btnUse = card.querySelector('.btn-use-talisman');
          if (btnUse) {
            btnUse.addEventListener('click', (e) => {
              e.stopPropagation();
              if (isApplying) this.cancelApplyTalisman();
              else this.startApplyTalisman(item);
            });
          }
  
          card.addEventListener('click', () => {
            if (isApplying) {
              this.cancelApplyTalisman();
            } else {
              this.selectedBagTalismanId = (this.selectedBagTalismanId === item.id) ? null : item.id;
              this.renderTalismans();
            }
          });
  
          content.appendChild(card);
        }
      } else if (!hasRenderedUnitSection) {
        content.innerHTML = `<div class="talisman-empty-msg" style="font-size:5px;color:var(--text-muted);text-align:center;padding:12px 2px;">Talisman bag is empty.<br>Visit the [SHOP] tab to buy new talismans!</div>`;
      }
    } else {
      // === TAB 3: SHOP MODE ===
      if (btnSellTalisman) btnSellTalisman.style.display = 'none';
      if (btnRerollTalisman) {
        btnRerollTalisman.style.display = 'inline-flex';
        btnRerollTalisman.disabled = (this.phase === 'battle' || this.gold < 3);
      }
  
      if (this.phase === 'battle') {
        content.innerHTML = `<div class="talisman-empty-msg" style="font-size:5px;color:var(--text-muted);text-align:center;padding:12px 2px;">Battle in progress!<br>Talisman shop is temporarily closed.</div>`;
        return;
      }
  
      if (this.talismanChoices.length === 0) {
        content.innerHTML = `<div class="talisman-empty-msg" style="font-size:5px;color:var(--text-muted);text-align:center;padding:12px 2px;">Sold out of talismans.<br>Click REROLL to find new talismans!</div>`;
        return;
      }
  
      for (const choice of this.talismanChoices) {
        const def = I18n.itemDefinition(choice.talismanId);
        if (!def) continue;
  
        const price = choice.price || 5;
        const canAfford = this.gold >= price;
        const isBattle = this.phase === 'battle';
        const isSpell = !!def.isSpell;
        const badgeText = isSpell ? I18n.legacy('SPELL') : `${def.maxUses}/${def.maxUses}`;
        const badgeClass = isSpell ? 'talisman-uses-badge talisman-spell-badge' : 'talisman-uses-badge';
  
        const card = document.createElement('div');
        card.className = `talisman-card ${!canAfford ? 'cant-afford' : ''} ${isSpell ? 'spell-card' : ''}`;
        card.dataset.slotState = !canAfford ? 'disabled' : isBattle ? 'locked' : 'normal';
  
        card.innerHTML = `
          <div class="talisman-card-header">
            <img src="${def.icon}" class="talisman-icon" alt="${def.name}" />
            <div class="talisman-card-title-wrap">
              <div class="talisman-name">${def.name}</div>
              <div class="talisman-target-desc">${def.targetDesc}</div>
            </div>
            <div class="${badgeClass}">${badgeText}</div>
          </div>
          <div class="talisman-desc">${def.desc || def.description}</div>
          <div class="talisman-card-action">
            <button class="btn-buy-talisman" type="button" ${!canAfford || isBattle ? 'disabled' : ''}>
              ${price} <img src="assets/ui/coin.png?v=${ASSET_VERSION}" class="btn-ui-icon" alt="G" />
            </button>
          </div>
        `;
  
        const btnBuy = card.querySelector('.btn-buy-talisman');
        if (btnBuy) {
          btnBuy.addEventListener('click', (e) => {
            e.stopPropagation();
            this.buyTalisman(choice.talismanId, price);
          });
        }
  
        card.addEventListener('click', () => {
          if (canAfford && !isBattle) {
            this.buyTalisman(choice.talismanId, price);
          }
        });
  
        content.appendChild(card);
      }
    }
  }

});
