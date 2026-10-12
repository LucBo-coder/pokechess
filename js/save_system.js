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
      const masteryProfile = window.MasterySystem?.bindSlot(app,slotIndex) ?? null;
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
        starterSpeciesId: item.starterSpeciesId,
        instanceId: item.instanceId,
        individualMastery: item.individualMastery ? JSON.parse(JSON.stringify(item.individualMastery)) : null,
        battlesFought: item.battlesFought || 0,
        talismans: item.talismans ? [...item.talismans] : [],
        maxTalismans: item.maxTalismans || 3,
        traits: [...(item.traits || [])],
        wounds: Math.max(0,Math.min(0.5,item.wounds||0))
      }));

      const talismanInventory = (app.talismanInventory || []).map(t => ({
        id: t.id,
        talismanId: t.talismanId,
        usesLeft: t.usesLeft,
        maxUses: t.maxUses
      }));

      const saveData = {
        version: '3.5.0',
        masteryProfile,
        runState: app.runState ? JSON.parse(JSON.stringify(app.runState)) : null,
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
        pendingEvolutions: JSON.parse(JSON.stringify(app.pendingEvolutions || [])),
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
      slots: this.getAllSlots().map(item=>{
        if(item.data && window.MasterySystem) {
          const profileId=`slot:${item.slot}`;
          item.data.masteryProfile=MasterySystem.merge(profileId,MasterySystem.readProfiles()[profileId],item.data.masteryProfile);
        }
        return item;
      })
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
        const writes = parsed && Array.isArray(parsed.slots)
          ? parsed.slots.filter(item=>item?.data).map(item=>({slot:Number(item.slot),data:item.data}))
          : parsed?.stage !== undefined ? [{slot:1,data:parsed}] : [];
        if (!writes.length || new Set(writes.map(item=>item.slot)).size !== writes.length || writes.some(({slot,data})=>
          !Number.isInteger(slot)||slot<1||slot>this.MAX_SLOTS||!Number.isFinite(data.stage)||data.stage<1||!Array.isArray(data.inventory))) {
          callback?.(false,t('save.invalid')); return;
        }
        // Serialize and back up before any write; retain legacy fields verbatim.
        const serialized=writes.map(({slot,data})=>({key:this.PREFIX+slot,value:JSON.stringify(data)}));
        this.backup();
        const before=serialized.map(({key})=>({key,value:localStorage.getItem(key)}));
        try { for(const {key,value} of serialized)localStorage.setItem(key,value); }
        catch(error) { for(const {key,value} of before)value===null?localStorage.removeItem(key):localStorage.setItem(key,value); throw error; }
        callback?.(true,t('save.importOk'));
      } catch (err) {
        if (callback) callback(false, t('save.invalid'));
      }
    };
    reader.onerror = () => {
      if (callback) callback(false, t('save.invalid'));
    };
    reader.readAsText(file);
  },

  BACKUP_KEY:'pokechess_storage_backup_v1',
  storageKeys() {
    return Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(key=>
      key && key !== this.BACKUP_KEY && /^(chess_plus_save_slot_|pokechess_mastery_|chessplus_meta_|chess_music_|pokechess_language$|pokechess_reduced_|pokechess_combat_display_|chess_tutorial_seen$)/.test(key));
  },
  backup() {
    const snapshot={version:1,time:Date.now(),values:Object.fromEntries(this.storageKeys().map(key=>[key,localStorage.getItem(key)]))};
    localStorage.setItem(this.BACKUP_KEY,JSON.stringify(snapshot)); return snapshot;
  },
  restoreBackup() {
    const snapshot=JSON.parse(localStorage.getItem(this.BACKUP_KEY)??'null');
    if(snapshot?.version!==1||!snapshot.values||typeof snapshot.values!=='object')return false;
    const current=Object.fromEntries(this.storageKeys().map(key=>[key,localStorage.getItem(key)]));
    try {
      for(const key of this.storageKeys())localStorage.removeItem(key);
      for(const [key,value] of Object.entries(snapshot.values))localStorage.setItem(key,value);
      return true;
    } catch(error) {
      for(const key of this.storageKeys())localStorage.removeItem(key);
      for(const [key,value] of Object.entries(current))localStorage.setItem(key,value);
      throw error;
    }
  }
};
