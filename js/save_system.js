// =============================================
// CHESS+ ROGUELIKE: 3-SLOT SAVE & LOAD SYSTEM
// Persistent LocalStorage + JSON File Import/Export
// =============================================

'use strict';

const SaveSystem = {
  PREFIX: 'chess_plus_save_slot_',
  MAX_SLOTS: 3,

  /**
   * Read save data for a slot (1, 2, 3)
   */
  getSlot(slotIndex) {
    try {
      const raw = localStorage.getItem(this.PREFIX + slotIndex);
      return (raw && raw !== 'undefined' && raw !== 'null') ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`[SaveSystem] Error reading slot ${slotIndex}:`, e);
      return null;
    }
  },

  /**
   * Get metadata for all 3 slots
   */
  getAllSlots() {
    const slots = [];
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      slots.push({
        slot: i,
        data: this.getSlot(i)
      });
    }
    return slots;
  },

  /**
   * Check if any valid save exists
   */
  hasAnySave() {
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      if (this.getSlot(i)) return true;
    }
    return false;
  },

  /**
   * Get the slot with the most recent timestamp
   */
  getLatestSlot() {
    let latest = null;
    let maxTime = 0;
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const data = this.getSlot(i);
      if (data && data.timeEpoch && data.timeEpoch > maxTime) {
        maxTime = data.timeEpoch;
        latest = i;
      }
    }
    return latest;
  },

  /**
   * Save current active game state into slot (1..3)
   */
  saveToSlot(slotIndex, app) {
    if (!app) return false;
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Gather placed pieces and verify
      const placed = (app.placedPieces || []).map(p => ({
        invId: p.invId,
        type: p.type,
        sq: p.sq,
        talismans: p.talismans ? [...p.talismans] : [],
        maxTalismans: p.maxTalismans || 3
      }));

      const inventory = (app.inventory || []).map(item => ({
        id: item.id,
        type: item.type,
        battlesFought: item.battlesFought || 0,
        talismans: item.talismans ? [...item.talismans] : [],
        maxTalismans: item.maxTalismans || 3
      }));

      const talismanInventory = (app.talismanInventory || []).map(t => ({
        id: t.id,
        talismanId: t.talismanId,
        usesLeft: t.usesLeft,
        maxUses: t.maxUses
      }));

      const saveData = {
        version: '2.8.0',
        timestamp: dateStr,
        timeEpoch: Date.now(),
        stage: app.stage || 1,
        gold: app.gold || 0,
        maxSlots: app.maxSlots || 3,
        slotUpgradeIndex: app.slotUpgradeIndex || 0,
        invNextId: app.invNextId || (inventory.length + 1),
        inventory,
        placedPieces: placed,
        setupFormation: app.setupFormation ? JSON.parse(JSON.stringify(app.setupFormation)) : [],
        talismanNextId: app.talismanNextId || 1,
        talismanInventory,
        talismanChoices: app.talismanChoices ? JSON.parse(JSON.stringify(app.talismanChoices)) : [],
        cardChoices: app.cardChoices ? [...app.cardChoices] : [],
        // Summary for quick display
        summary: {
          stage: app.stage || 1,
          gold: app.gold || 0,
          armySize: inventory.length,
          deployedSize: placed.length,
          talismanCount: talismanInventory.length
        }
      };

      localStorage.setItem(this.PREFIX + slotIndex, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error(`[SaveSystem] Error saving to slot ${slotIndex}:`, e);
      return false;
    }
  },

  /**
   * Delete a save slot
   */
  deleteSlot(slotIndex) {
    try {
      localStorage.removeItem(this.PREFIX + slotIndex);
      return true;
    } catch (e) {
      console.error(`[SaveSystem] Error deleting slot ${slotIndex}:`, e);
      return false;
    }
  },

  /**
   * Export all slots to a downloadable JSON file
   */
  exportToFile() {
    const payload = {
      game: 'Chess+ Roguelike',
      exportedAt: new Date().toISOString(),
      slots: this.getAllSlots()
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess_plus_saves_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Import saves from a JSON file
   */
  importFromFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && Array.isArray(parsed.slots)) {
          for (const item of parsed.slots) {
            if (item && item.slot && item.data) {
              localStorage.setItem(this.PREFIX + item.slot, JSON.stringify(item.data));
            }
          }
          if (callback) callback(true, 'Saves imported successfully!');
        } else if (parsed && parsed.stage !== undefined) {
          // Direct single save format -> Save to Slot 1
          localStorage.setItem(this.PREFIX + '1', JSON.stringify(parsed));
          if (callback) callback(true, 'Save imported to Slot 1!');
        } else {
          if (callback) callback(false, 'Invalid save file format.');
        }
      } catch (err) {
        if (callback) callback(false, 'Failed to parse JSON file.');
      }
    };
    reader.onerror = () => {
      if (callback) callback(false, 'Error reading file.');
    };
    reader.readAsText(file);
  }
};
