// =============================================
// CHESS+ ROGUELIKE: MENUS, SAVES & EVENT BINDINGS
// Main menu, in-game menu, save/load, bindEvents
// Toast/Confirm dialogs, viewport scaling, resetRun
// =============================================

'use strict';


// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {

  showToast(msg, type = 'warning') {
    window.NotificationCenter?.toast(msg, type);
  },

  showConfirm(msg, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    const subtitle = document.getElementById('confirmSubtitle');
    if (subtitle) subtitle.textContent = msg;
    if (modal) modal.classList.remove('hidden');
  
    this.pendingConfirmCallback = onConfirm;
    this.pendingCancelCallback = onCancel;
  },

  addLog(msg, category) {
    window.NotificationCenter?.record(msg, category);
  },

  // ---- Bind Buttons & Controls ----

  bindEvents() {
    const btnUp = document.getElementById('btnUpgradeSlot');
    if (btnUp) btnUp.addEventListener('click', () => this.buySlotUpgrade());
  
    const btnStart = document.getElementById('btnStartBattle');
    if (btnStart) btnStart.addEventListener('click', () => this.startManualBattle());
  
    const btnStartAuto = document.getElementById('btnStartAutoBattle');
    if (btnStartAuto) btnStartAuto.addEventListener('click', () => this.startAutoBattle());
  
    const btnToggleAutoBattle = document.getElementById('btnToggleAutoBattle');
    if (btnToggleAutoBattle) btnToggleAutoBattle.addEventListener('click', () => this.startAutoBattle());
  
    const btnRecallAll = document.getElementById('btnRecallAll');
    if (btnRecallAll) btnRecallAll.addEventListener('click', () => this.recallAllPieces());

    const btnSkipTurn = document.getElementById('btnSkipTurn');
    if (btnSkipTurn) btnSkipTurn.addEventListener('click', () => this.passCurrentQueueTurn());
  
    const btnSell = document.getElementById('btnSell');
    if (btnSell) btnSell.addEventListener('click', () => this.sellSelectedPiece());
  
    const btnReroll = document.getElementById('btnReroll');
    if (btnReroll) btnReroll.addEventListener('click', () => this.rerollCards());
  
    const btnNewRun = document.getElementById('btnNewRun');
    if (btnNewRun) {
      btnNewRun.addEventListener('click', () => {
        this.showConfirm(t('visual.confirmNewRun'), () => {
          this.resetRun();
        });
      });
    }
  
    const btnShopReward = document.getElementById('btnGoToShopReward');
    if (btnShopReward) {
      btnShopReward.addEventListener('click', () => {
        if (this.advanceRoguelikeStage) { this.advanceRoguelikeStage(); return; }
        const modal = document.getElementById('victoryModal');
        if (modal) modal.classList.add('hidden');
        this.stage++;
        this.cardChoices = [];
        this.talismanChoices = [];
        this.setupNewStage();
        this.setPokemonTab('recruit');
        if (this.currentSaveSlot && typeof SaveSystem !== 'undefined') {
          SaveSystem.saveToSlot(this.currentSaveSlot, this);
        }
      });
    }
  
    const btnRestartRun = document.getElementById('btnRestartRun');
    if (btnRestartRun) {
      btnRestartRun.addEventListener('click', () => {
        const modal = document.getElementById('defeatModal');
        if (modal) modal.classList.add('hidden');
        this.resetRun();
      });
    }
  
    const btnRetryStage = document.getElementById('btnRetryStage');
    if (btnRetryStage) {
      btnRetryStage.addEventListener('click', () => {
        const modal = document.getElementById('drawModal');
        if (modal) modal.classList.add('hidden');
        this.retryBattle();
      });
    }
  
    // Confirm Modal Accept / Cancel Buttons
    const btnAcceptConfirm = document.getElementById('btnAcceptConfirm');
    if (btnAcceptConfirm) {
      btnAcceptConfirm.addEventListener('click', () => {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.classList.add('hidden');
        if (this.pendingConfirmCallback) {
          const cb = this.pendingConfirmCallback;
          this.pendingConfirmCallback = null;
          cb();
        }
      });
    }
  
    const btnCancelConfirm = document.getElementById('btnCancelConfirm');
    if (btnCancelConfirm) {
      btnCancelConfirm.addEventListener('click', () => {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.classList.add('hidden');
        if (this.pendingCancelCallback) {
          const cb = this.pendingCancelCallback;
          this.pendingCancelCallback = null;
          cb();
        }
      });
    }
  
    // Dismiss Toast on click
    const toast = document.getElementById('gameToast');
    if (toast) {
      toast.addEventListener('click', () => {
        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
          this.toastTimeout = null;
        }
        toast.classList.add('toast-hide');
        setTimeout(() => {
          toast.classList.add('hidden');
          toast.classList.remove('toast-hide');
        }, 180);
      });
    }
  
    // Pokemon Panel Tabs: Bench (Kho) & Recruit (Shop)
    const tabPokemonBench = document.getElementById('tabPokemonBench');
    if (tabPokemonBench) tabPokemonBench.addEventListener('click', () => this.setPokemonTab('bench'));
  
    const tabPokemonRecruit = document.getElementById('tabPokemonRecruit');
    if (tabPokemonRecruit) tabPokemonRecruit.addEventListener('click', () => this.setPokemonTab('recruit'));
  
    // Talisman Tabs & Buttons
    const tabBag = document.getElementById('tabTalismanBag');
    if (tabBag) tabBag.addEventListener('click', () => this.setTalismanTab('bag'));

    const tabType = document.getElementById('tabTalismanType');
    if (tabType) tabType.addEventListener('click', () => this.setTalismanTab('type'));
  
    const tabShop = document.getElementById('tabTalismanShop');
    if (tabShop) tabShop.addEventListener('click', () => this.setTalismanTab('shop'));
  
    const btnSellTalisman = document.getElementById('btnSellTalisman');
    if (btnSellTalisman) btnSellTalisman.addEventListener('click', () => this.sellSelectedBagTalisman());
  
    const btnRerollTalisman = document.getElementById('btnRerollTalisman');
    if (btnRerollTalisman) btnRerollTalisman.addEventListener('click', () => this.rerollTalismans());
  
    const btnCancelApply = document.getElementById('btnCancelApplyTalisman');
    if (btnCancelApply) btnCancelApply.addEventListener('click', () => this.cancelApplyTalisman());
  
    // In-Game Menu Button in Header
    const btnOpenMenu = document.getElementById('btnOpenMenu');
    if (btnOpenMenu) {
      btnOpenMenu.addEventListener('click', () => {
        this.openInGameMenu();
      });
    }
  
    // Main Menu Screen Buttons
    const btnMenuContinue = document.getElementById('btnMenuContinue');
    if (btnMenuContinue) {
      btnMenuContinue.addEventListener('click', () => {
        const latestSlot = (typeof SaveSystem !== 'undefined') ? SaveSystem.getLatestSlot() : null;
        if (latestSlot) {
          this.loadGameSlot(latestSlot);
        } else {
          this.isGameActive = true;
          this.closeMainMenu();
        }
      });
    }
  
    const btnMenuNewRun = document.getElementById('btnMenuNewRun');
    if (btnMenuNewRun) {
      btnMenuNewRun.addEventListener('click', () => {
        this.resetRun();
        this.closeMainMenu();
      });
    }

    const btnMenuStarters = document.getElementById('btnMenuStarters');
    if (btnMenuStarters) {
      btnMenuStarters.addEventListener('click', () => {
        this.openStarterModal();
      });
    }

    const btnMenuSkillTree = document.getElementById('btnMenuSkillTree');
    if (btnMenuSkillTree) {
      btnMenuSkillTree.addEventListener('click', () => {
        this.openSkillTreeModal();
      });
    }
  
    const btnMenuSaves = document.getElementById('btnMenuSaves');
    if (btnMenuSaves) {
      btnMenuSaves.addEventListener('click', () => {
        this.openSaveSlotsModal();
      });
    }
  
    const btnMenuHowToPlay = document.getElementById('btnMenuHowToPlay');
    if (btnMenuHowToPlay) {
      btnMenuHowToPlay.addEventListener('click', () => {
        this.openHowToPlay();
      });
    }
  
    // In-Game Menu / Pause Modal Buttons
    const btnResumeGame = document.getElementById('btnResumeGame');
    if (btnResumeGame) {
      btnResumeGame.addEventListener('click', () => this.closeInGameMenu());
    }
  
    const btnOpenSaveSlots = document.getElementById('btnOpenSaveSlots');
    if (btnOpenSaveSlots) {
      btnOpenSaveSlots.addEventListener('click', () => this.openSaveSlotsModal());
    }
  
    const btnInGameHowToPlay = document.getElementById('btnInGameHowToPlay');
    if (btnInGameHowToPlay) {
      btnInGameHowToPlay.addEventListener('click', () => {
        this.openHowToPlay();
      });
    }
  
    const btnInGameRestart = document.getElementById('btnInGameRestart');
    if (btnInGameRestart) {
      btnInGameRestart.addEventListener('click', () => {
        this.showConfirm('Restart run from Stage 1? Unsaved progress will be lost.', () => {
          this.closeInGameMenu();
          this.resetRun();
        });
      });
    }
  
    const btnReturnToMainMenu = document.getElementById('btnReturnToMainMenu');
    if (btnReturnToMainMenu) {
      btnReturnToMainMenu.addEventListener('click', () => {
        this.closeInGameMenu();
        this.openMainMenu();
      });
    }
  
    // Save Vault Modal Buttons
    const btnCloseSaveSlots = document.getElementById('btnCloseSaveSlots');
    if (btnCloseSaveSlots) {
      btnCloseSaveSlots.addEventListener('click', () => this.closeSaveSlotsModal());
    }
  
    const btnExportSaves = document.getElementById('btnExportSaves');
    if (btnExportSaves) {
      btnExportSaves.addEventListener('click', () => {
        if (typeof SaveSystem !== 'undefined') SaveSystem.exportToFile();
      });
    }
  
    const btnImportSaves = document.getElementById('btnImportSaves');
    const importInput = document.getElementById('importSaveFileInput');
    if (btnImportSaves && importInput) {
      btnImportSaves.addEventListener('click', () => {
        importInput.value = '';
        importInput.click();
      });
      importInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file && typeof SaveSystem !== 'undefined') {
          SaveSystem.importFromFile(file, (ok, msg) => {
            this.showToast(msg, ok ? 'gold' : 'warning');
            this.renderSaveSlots();
            this.updateMainMenuState();
          });
        }
      });
    }
  
    // How to Play Modal Close
    const btnCloseHowToPlay = document.getElementById('btnCloseHowToPlay');
    if (btnCloseHowToPlay) {
      btnCloseHowToPlay.addEventListener('click', () => {
        this.closeHowToPlay();
      });
    }
  
    // Dismiss modals when clicking backdrop
    const howToPlayModal = document.getElementById('howToPlayModal');
    if (howToPlayModal) {
      howToPlayModal.addEventListener('click', (e) => {
        if (e.target === howToPlayModal) {
          this.closeHowToPlay();
        }
      });
    }
  
    const saveSlotsModal = document.getElementById('saveSlotsModal');
    if (saveSlotsModal) {
      saveSlotsModal.addEventListener('click', (e) => {
        if (e.target === saveSlotsModal) {
          this.closeSaveSlotsModal();
        }
      });
    }

    // Starter Selection Modal Events
    const starterModal = document.getElementById('starterSelectModal');
    if (starterModal) {
      starterModal.addEventListener('click', (e) => {
        if (e.target === starterModal) this.closeStarterModal();
      });
    }
    const btnCloseStarterModal = document.getElementById('btnCloseStarterModal');
    if (btnCloseStarterModal) {
      btnCloseStarterModal.addEventListener('click', () => this.closeStarterModal());
    }
    const starterSearchInput = document.getElementById('starterSearchInput');
    if (starterSearchInput) {
      starterSearchInput.addEventListener('input', (e) => {
        this.currentStarterSearch = e.target.value;
        this.renderStarterModal();
      });
    }
    const starterTabs = document.querySelectorAll('.starter-filter-tab');
    starterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        starterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentStarterFilter = tab.dataset.filter || 'all';
        this.renderStarterModal();
      });
    });

    // Astral Skill Tree Modal Events
    const skillTreeModal = document.getElementById('skillTreeModal');
    if (skillTreeModal) {
      skillTreeModal.addEventListener('click', (e) => {
        if (e.target === skillTreeModal) this.closeSkillTreeModal();
      });
    }
    const btnCloseSkillTree = document.getElementById('btnCloseSkillTree');
    if (btnCloseSkillTree) {
      btnCloseSkillTree.addEventListener('click', () => this.closeSkillTreeModal());
    }
    const btnResetSkillTree = document.getElementById('btnResetSkillTree');
    if (btnResetSkillTree) {
      btnResetSkillTree.addEventListener('click', () => {
        if (typeof MetaProgression !== 'undefined') {
          const refunded = MetaProgression.resetTree();
          MetaProgression.updateHUD();
          this.showToast(`Skill tree reset! Refunded ${refunded} points.`, 'cyan');
        }
      });
    }
    const btnCenterSkillTree = document.getElementById('btnCenterSkillTree');
    if (btnCenterSkillTree) {
      btnCenterSkillTree.addEventListener('click', () => {
        if (typeof MetaProgression !== 'undefined') {
          MetaProgression.centerView();
        }
      });
    }
  
    // Coffee Donate Modal Events
    const btnMenuCoffee = document.getElementById('btnMenuCoffee');
    if (btnMenuCoffee) {
      btnMenuCoffee.addEventListener('click', () => {
        this.openCoffeeDonateModal();
      });
    }
    const btnCloseCoffeeModal = document.getElementById('btnCloseCoffeeModal');
    if (btnCloseCoffeeModal) {
      btnCloseCoffeeModal.addEventListener('click', () => {
        this.closeCoffeeDonateModal();
      });
    }
    const btnDismissCoffeeModal = document.getElementById('btnDismissCoffeeModal');
    if (btnDismissCoffeeModal) {
      btnDismissCoffeeModal.addEventListener('click', () => {
        this.closeCoffeeDonateModal();
      });
    }
    const coffeeDonateModal = document.getElementById('coffeeDonateModal');
    if (coffeeDonateModal) {
      coffeeDonateModal.addEventListener('click', (e) => {
        if (e.target === coffeeDonateModal) {
          this.closeCoffeeDonateModal();
        }
      });
    }
    const donateAccNum = document.getElementById('donateAccNum');
    if (donateAccNum) {
      donateAccNum.addEventListener('click', () => {
        const stk = '100873549564';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(stk).then(() => {
            this.showToast('Copied Account No: 100873549564 (VietinBank)', 'info');
          }).catch(() => {
            this.showToast('Account No: 100873549564 (VietinBank)', 'info');
          });
        } else {
          this.showToast('Account No: 100873549564 (VietinBank)', 'info');
        }
      });
    }

    // Setup smooth drag-to-scroll for Talisman & Pokemon containers
    this.setupDragScroll(document.getElementById('talismanContent'));
    this.setupDragScroll(document.getElementById('pokemonContent'));
    this.setupDragScroll(document.getElementById('inventorySlots'));
    this.setupDragScroll(document.getElementById('rewardCardsGrid'));
  
    // Interactive step-by-step guided tutorial
    this.initTutorialEvents();
  
    if (typeof soundManager !== 'undefined') {
      soundManager.initUIListeners();
    }
  },
  
  // ---- Smooth Drag-to-Scroll for list containers without visible scrollbars ----

  setupDragScroll(container) {
    if (!container || container._hasDragScroll) return;
    container._hasDragScroll = true;
  
    let isDown = false;
    let startY = 0;
    let scrollTop = 0;
    let hasDragged = false;
    let preventNextClick = false;
  
    // Suppress child clicks if user performed a drag gesture
    container.addEventListener('click', (e) => {
      if (preventNextClick) {
        e.stopPropagation();
        e.preventDefault();
        preventNextClick = false;
      }
    }, true);
  
    const getPageY = (e) => {
      if (e.touches && e.touches.length > 0) return e.touches[0].pageY;
      return e.pageY;
    };
  
    const getScale = () => {
      const app = document.getElementById('app');
      const appRect = app ? app.getBoundingClientRect() : null;
      return (appRect && appRect.height) ? (appRect.height / 320) : 1;
    };
  
    const onDown = (e) => {
      // Allow only primary mouse button (0) or touch
      if (e.button !== undefined && e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      preventNextClick = false;
      startY = getPageY(e);
      scrollTop = container.scrollTop;
    };
  
    const onMove = (e) => {
      if (!isDown) return;
      const currentY = getPageY(e);
      const scale = getScale();
      const deltaY = (currentY - startY) / (scale || 1);
  
      if (Math.abs(deltaY) > 3) {
        hasDragged = true;
        preventNextClick = true;
        container.classList.add('is-dragging');
        container.scrollTop = scrollTop - deltaY;
      }
    };
  
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('is-dragging');
      if (hasDragged) {
        setTimeout(() => {
          preventNextClick = false;
        }, 120);
      }
    };
  
    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  
    container.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);
  },

  resetRun() {
    this.disposeHexBattle();
    this.closeAllModals();
    if (typeof soundManager !== 'undefined') {
      soundManager.play('tavern');
    }
    this.isAnimating = false;
    this.pieceHP = {};
    this.roundMoves = 0;
    this.isDrawWin = false;
    this.resetRepetitionTracking();
    this.stage = 1;
    this.runState = window.RoguelikeExpansion?.createRun();
    this.gold = 0 + (typeof MetaProgression !== 'undefined' ? MetaProgression.getBonusStartingGold() : 0);
    this.maxSlots = 3 + (typeof MetaProgression !== 'undefined' ? MetaProgression.getBonusStartingSlots() : 0);
    this.slotUpgradeIndex = 0;
    this.invNextId = 1;
    this.inventory = [];
    this.initStarterSquad();
    this.placedPieces = [];
    this.setupFormation = [];
    this.pendingEvolutions = [];
    this.selectedInvId = null;
    this.selectedBoardSq = -1;
    this.phase = 'setup';
  
    // Reset Recruitment Shop state & card choices
    this.cardChoices = [];
    this.hasRerolledStarter = false;
  
    // Reset Talisman State & choices
    this.talismanNextId = 1;
    this.talismanInventory = [];
    this.talismanChoices = [];
    this.talismanTab = 'bag';
    this.pokemonTab = 'bench';
    this.selectedBagTalismanId = null;
    this.activeApplyingTalisman = null;
    this.currentSaveSlot = null;
    this.isGameActive = true;
    this.clearAutoBattleTimer();
    this.isAutoBattle = false;
    this.updateAutoBattleUI();
  
    const logList = document.getElementById('moveList');
    if (logList) logList.innerHTML = '';
  
    // Initialize Stage 1 and auto-deploy starter trio
    this.setupNewStage();
  
    // Focus bench tab with the 3 deployed starters
    this.setPokemonTab('bench');
    this.renderShop();
    this.renderInventory();
    this.renderTalismans();
    this.renderBoard();
    this.updateStats();
    this.updateMainMenuState();
  },
  
  // =============================================
  // MAIN MENU & 3-SLOT SAVE/LOAD VAULT METHODS
  // =============================================

  openMainMenu() {
    this.closeAllModals();
    const overlay = document.getElementById('mainMenuOverlay');
    if (overlay) overlay.classList.remove('hidden');
    this.updateMainMenuState();
  },

  closeMainMenu() {
    const overlay = document.getElementById('mainMenuOverlay');
    if (overlay) overlay.classList.add('hidden');
    if (typeof soundManager !== 'undefined') {
      soundManager.play('tavern');
    }
  },

  updateMainMenuState() {
    const btnContinue = document.getElementById('btnMenuContinue');
    if (!btnContinue) return;
  
    const latestSlot = (typeof SaveSystem !== 'undefined') ? SaveSystem.getLatestSlot() : null;
    if (latestSlot) {
      const data = SaveSystem.getSlot(latestSlot);
      btnContinue.disabled = false;
      btnContinue.textContent = t('menu.continueSlot',{slot:latestSlot,stage:data?.stage||1});
      btnContinue.title = t('menu.continueSlotTitle',{slot:latestSlot});
    } else if (this.isGameActive && this.stage >= 1) {
      btnContinue.disabled = false;
      btnContinue.textContent = t('menu.continueStage',{stage:this.stage});
      btnContinue.title = t('menu.continueCurrent');
    } else {
      btnContinue.disabled = true;
      btnContinue.textContent = t('menu.continueJourney');
      btnContinue.title = t('menu.noSave');
    }
  },

  openInGameMenu() {
    this.closeAllModals();
    const modal = document.getElementById('inGameMenuModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeInGameMenu() {
    const modal = document.getElementById('inGameMenuModal');
    if (modal) modal.classList.add('hidden');
  },

  openSaveSlotsModal() {
    this.closeInGameMenu();
    const modal = document.getElementById('saveSlotsModal');
    if (modal) modal.classList.remove('hidden');
    this.renderSaveSlots();
  },

  closeSaveSlotsModal() {
    const modal = document.getElementById('saveSlotsModal');
    if (modal) modal.classList.add('hidden');
  },

  openHowToPlay() {
    this.startInteractiveTutorial();
  },

  closeHowToPlay() {
    this.finishTutorial();
  },

  openCoffeeDonateModal() {
    const modal = document.getElementById('coffeeDonateModal');
    if (modal) modal.classList.remove('hidden');
    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('click');
    }
  },

  closeCoffeeDonateModal() {
    const modal = document.getElementById('coffeeDonateModal');
    if (modal) modal.classList.add('hidden');
  },
  
  // ---- Interactive Step-by-Step Guided Tutorial System ----

  renderSaveSlots() {
    const list = document.getElementById('saveSlotsList');
    if (!list || typeof SaveSystem === 'undefined') return;
    list.innerHTML = '';
  
    const slots = SaveSystem.getAllSlots();
    for (const item of slots) {
      const slotNum = item.slot;
      const data = item.data;
      const card = document.createElement('div');
      card.className = `save-slot-card ${data ? 'save-slot-occupied' : 'save-slot-empty'} ${this.currentSaveSlot === slotNum ? 'slot-active' : ''}`;
  
      if (data) {
        const stage = data.stage || 1;
        const gold = data.gold || 0;
        const units = data.summary?.armySize || (data.inventory ? data.inventory.length : 3);
        const talismans = data.summary?.talismanCount || (data.talismanInventory ? data.talismanInventory.length : 0);
        const dateStr = data.timestamp || 'Unknown Date';
  
        card.innerHTML = `
          <div class="save-slot-info">
            <div class="save-slot-badge-row">
              <span class="save-slot-badge">SLOT ${slotNum}</span>
              <span class="save-slot-stage">STAGE ${stage}</span>
            </div>
            <div class="save-slot-stats">
              <span><strong>${gold}</strong>G</span>
              <span>•</span>
              <span>${units} UNITS</span>
              <span>•</span>
              <span>${talismans} TALISMANS</span>
            </div>
            <div class="save-slot-date">${dateStr}</div>
          </div>
          <div class="save-slot-actions">
            <button class="btn btn-primary btn-slot-load" type="button">LOAD</button>
            <button class="btn btn-gold btn-slot-save" type="button" title="Overwrite slot with current run">SAVE</button>
            <button class="btn btn-slot-delete" type="button" title="Delete this save">DEL</button>
          </div>
        `;
  
        const btnLoad = card.querySelector('.btn-slot-load');
        if (btnLoad) {
          btnLoad.addEventListener('click', () => {
            this.loadGameSlot(slotNum);
          });
        }
  
        const btnSave = card.querySelector('.btn-slot-save');
        if (btnSave) {
          btnSave.addEventListener('click', () => {
            this.saveGameSlot(slotNum);
          });
        }
  
        const btnDel = card.querySelector('.btn-slot-delete');
        if (btnDel) {
          btnDel.addEventListener('click', () => {
            this.showConfirm(`Delete Save Slot ${slotNum}?`, () => {
              SaveSystem.deleteSlot(slotNum);
              if (this.currentSaveSlot === slotNum) this.currentSaveSlot = null;
              this.showToast(`Deleted Save Slot ${slotNum}`, 'info');
              this.renderSaveSlots();
              this.updateMainMenuState();
            });
          });
        }
      } else {
        // Empty Slot
        card.innerHTML = `
          <div class="save-slot-info">
            <div class="save-slot-badge-row">
              <span class="save-slot-badge">SLOT ${slotNum}</span>
              <span class="save-slot-empty-text">[ EMPTY SLOT ]</span>
            </div>
          </div>
          <div class="save-slot-actions">
            <button class="btn btn-gold btn-slot-save-new" type="button">SAVE HERE</button>
          </div>
        `;
  
        const btnSaveNew = card.querySelector('.btn-slot-save-new');
        if (btnSaveNew) {
          btnSaveNew.addEventListener('click', () => {
            this.saveGameSlot(slotNum);
          });
        }
      }
  
      list.appendChild(card);
    }
  },

  saveGameSlot(slotNum) {
    if (typeof SaveSystem === 'undefined') return;
    const ok = SaveSystem.saveToSlot(slotNum, this);
    if (ok) {
      this.currentSaveSlot = slotNum;
      this.showToast(`Saved to Slot ${slotNum} (Stage ${this.stage})!`, 'gold');
      if (typeof soundManager !== 'undefined') soundManager.playSfx('coin');
      this.renderSaveSlots();
      this.updateMainMenuState();
    } else {
      this.showToast(`Failed to save to Slot ${slotNum}`, 'warning');
    }
  },

  loadGameSlot(slotNum) {
    if (typeof SaveSystem === 'undefined') return;
    const data = SaveSystem.getSlot(slotNum);
    if (!data) {
      this.showToast(`Slot ${slotNum} is empty!`, 'warning');
      return;
    }
    const ok = this.applySaveData(data,slotNum);
    if (ok) {
      this.currentSaveSlot = slotNum;
      this.isGameActive = true;
      this.closeSaveSlotsModal();
      this.closeMainMenu();
    }
  },

  applySaveData(saveData,slotNum = null) {
    if (!saveData) return false;
    this.disposeHexBattle();
  
    // Reset battle & animation flags
    this.isAnimating = false;
    this.isSetupAnimating = false;
    this.pieceHP = {};
    this.roundMoves = 0;
    this.isDrawWin = false;
    this.resetRepetitionTracking();
    this.shakingSquares.clear();
    this.collapsedSquares.clear();
    if (this.game && this.game.collapsedSquares) this.game.collapsedSquares.clear();
  
    // Close all open modals
    this.closeAllModals();
  
    // Stats
    this.stage = saveData.stage || 1;
    this.runState = window.RoguelikeExpansion?.restore(saveData.runState);
    this.gold = saveData.gold || 0;
    this.maxSlots = saveData.maxSlots || 3;
    this.slotUpgradeIndex = saveData.slotUpgradeIndex || 0;
    this.invNextId = saveData.invNextId || (saveData.inventory ? saveData.inventory.length + 1 : 4);
  
    // Inventories & setup formation
    this.inventory = (saveData.inventory || []).map(i => ({ ...i }));
    this.placedPieces = (saveData.placedPieces || []).map(p => ({ ...p }));
    this.setupFormation = (saveData.setupFormation || []).map(f => ({ ...f }));
    this.pendingEvolutions = (saveData.pendingEvolutions || []).map(e => ({ ...e }));
  
    // Talisman system
    this.talismanNextId = saveData.talismanNextId || 1;
    this.talismanInventory = (saveData.talismanInventory || []).map(t => ({ ...t }));
    this.talismanChoices = (saveData.talismanChoices || []).map(c => ({ ...c }));
    this.talismanTab = 'bag';
    this.pokemonTab = 'bench';
    this.selectedBagTalismanId = null;
    this.activeApplyingTalisman = null;
  
    // Preserve recruit cards if saved
    this.cardChoices = (saveData.cardChoices && saveData.cardChoices.length > 0)
      ? [...saveData.cardChoices]
      : [];
  
    // Stage reset & board populate
    window.MasterySystem?.restore(this,saveData,slotNum);
    this.setupNewStage();
  
    this.showToast(`Loaded Game: Stage ${this.stage} (${this.gold}g)`, 'gold');
    if (typeof soundManager !== 'undefined') {
      soundManager.play('tavern');
      soundManager.playSfx('coin');
    }
    return true;
  },

  closeAllModals() {
    const modals = [
      'victoryModal', 'defeatModal', 'drawModal', 'confirmModal',
      'promotionModal', 'inGameMenuModal', 'saveSlotsModal', 'howToPlayModal', 'roguelikeModal',
      'moveEditorModal', 'starterSelectModal', 'skillTreeModal', 'coffeeDonateModal', 'masteryCollectionModal'
    ];
    for (const id of modals) {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    }
  },

  // =============================================
  // STARTER SELECTION MODAL CONTROLLER
  // =============================================
  openStarterModal() {
    this.closeAllModals();
    const modal = document.getElementById('starterSelectModal');
    if (modal) {
      modal.classList.remove('hidden');
      this.currentStarterFilter = 'all';
      this.currentStarterSearch = '';
      const input = document.getElementById('starterSearchInput');
      if (input) input.value = '';
      const tabs = document.querySelectorAll('.starter-filter-tab');
      tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
      this.renderStarterModal();
      if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
    }
  },

  closeStarterModal() {
    const modal = document.getElementById('starterSelectModal');
    if (modal) modal.classList.add('hidden');
    this.syncStage1SquadIfWaiting();
  },

  syncStage1SquadIfWaiting() {
    // If player is in Stage 1 Setup phase before any moves, immediately refresh board with newly selected starters
    if (this.stage === 1 && this.phase === 'setup' && this.roundMoves === 0) {
      if (typeof this.initStarterSquad === 'function') {
        this.initStarterSquad();
        this.setupNewStage();
      }
    }
  },

  renderStarterModal() {
    if (typeof MetaProgression === 'undefined') return;
    const banner = document.getElementById('starterActiveBanner');
    const selectedIds = MetaProgression.getSelectedStarters();

    if (banner) {
      let slotsHtml = '';
      for (let i = 0; i < 3; i++) {
        const sId = selectedIds[i];
        if (sId && PIECES[sId]) {
          const p = PIECES[sId];
          slotsHtml += `
            <div class="starter-slot-box is-filled" data-slot="${i}">
              <div class="starter-slot-header">
                <span class="starter-slot-badge">SLOT ${i + 1}</span>
                ${selectedIds.length > 1 ? `<button class="starter-slot-remove-btn" data-remove-id="${sId}" title="Remove from starter squad">✕</button>` : ''}
              </div>
              <div class="starter-slot-body">
                <img src="${typeof getPieceIconUrl === 'function' ? getPieceIconUrl(p.asset || p.type) : `assets/pokemon/icons/${p.asset}.png`}" class="starter-slot-icon" alt="${p.name}" />
                <div class="starter-slot-info">
                  <div class="starter-slot-name">#${p.num} ${p.name.toUpperCase()}</div>
                  <div class="starter-slot-types">
                    <span class="badge" style="font-size:4px;padding:1px 3px;">${p.element.toUpperCase()}</span>
                    ${p.element2 ? `<span class="badge" style="font-size:4px;padding:1px 3px;">${p.element2.toUpperCase()}</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        } else {
          slotsHtml += `
            <div class="starter-slot-box is-empty" data-slot="${i}">
              <div class="starter-slot-header">
                <span class="starter-slot-badge empty-badge">SLOT ${i + 1}</span>
              </div>
              <div class="starter-slot-empty-content">
                <span class="starter-empty-plus">+</span>
                <span class="starter-empty-label">EMPTY SLOT</span>
              </div>
            </div>
          `;
        }
      }

      banner.innerHTML = `
        <div class="starter-squad-header">
          <div class="starter-squad-title">
            <span style="color:#ffd32a;">★</span> STARTER TRIO SQUAD 
            <span class="starter-squad-count">${selectedIds.length}/3 ACTIVE</span>
          </div>
          <div class="starter-squad-subtitle">All 3 chosen Pokémon deploy together at Stage 1 of every run!</div>
        </div>
        <div class="starter-slots-row">
          ${slotsHtml}
        </div>
      `;

      banner.querySelectorAll('.starter-slot-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const remId = btn.getAttribute('data-remove-id');
          if (MetaProgression.removeStarter(remId)) {
            this.syncStage1SquadIfWaiting();
            this.renderStarterModal();
            this.showToast('Removed from Starter Squad', 'default');
            if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
          }
        });
      });
    }

    const grid = document.getElementById('starterGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = MetaProgression.getEligibleStarters();
    const filter = this.currentStarterFilter || 'all';
    const search = (this.currentStarterSearch || '').trim().toLowerCase();

    const filtered = list.filter(item => {
      if (filter === 'unlocked' && !item.isUnlocked) return false;
      if (filter === 'locked' && item.isUnlocked) return false;
      if (search && !item.name.toLowerCase().includes(search) && !String(item.num).includes(search)) return false;
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#8395a7;font-family:var(--font-pixel);font-size:6px;">No matching Pokémon found.</div>';
      return;
    }

    for (const item of filtered) {
      const card = document.createElement('div');
      const isSelected = item.isSelected;
      const slotIndex = item.slotIndex;
      card.className = `starter-card ${isSelected ? 'is-active-starter' : ''} ${!item.isUnlocked ? 'is-locked' : ''}`;
      
      const pct = item.isUnlocked ? 100 : Math.min(100, Math.round((item.buyCount / item.reqCount) * 100));
      const countDisplay = item.isUnlocked
        ? `${Math.max(item.buyCount, item.reqCount)}/${item.reqCount}`
        : `${item.buyCount}/${item.reqCount}`;
      const statusLabel = item.isUnlocked ? `UNLOCKED: ${countDisplay}` : `RECRUITED: ${countDisplay}`;

      const progHtml = `
        <div class="starter-prog-wrap">
          <div class="starter-prog-bar"><div class="starter-prog-fill" style="width:${pct}%"></div></div>
          <div class="starter-prog-text" style="${item.isUnlocked ? 'color:#2ed573;' : ''}">${statusLabel}</div>
        </div>`;

      let btnHtml = '';
      if (isSelected) {
        btnHtml = `<button class="btn-select-starter is-active-slot" data-starter-id="${item.id}" data-action="remove">✓ IN SQUAD (SLOT ${slotIndex})</button>`;
      } else if (item.isUnlocked) {
        const canAdd = selectedIds.length < 3;
        btnHtml = `<button class="btn-select-starter ${canAdd ? 'btn-add-starter' : 'btn-swap-starter'}" data-starter-id="${item.id}" data-action="add">${canAdd ? '+ ADD TO SQUAD' : '⇄ SWAP IN (SLOT 3)'}</button>`;
      } else {
        btnHtml = `<button class="btn-select-starter" disabled>LOCKED</button>`;
      }

      card.innerHTML = `
        ${isSelected ? `<span class="starter-card-slot-ribbon">SLOT ${slotIndex}</span>` : ''}
        <img src="${typeof getPieceIconUrl === 'function' ? getPieceIconUrl(item.asset || item.type) : `assets/pokemon/icons/${item.asset}.png`}" class="starter-card-icon" alt="${item.name}" />
        <div class="starter-card-name">#${item.num} ${item.name}</div>
        <div class="starter-card-types">
          <span class="badge" style="font-size:4px;padding:1px 3px;">${item.element.toUpperCase()}</span>
          ${item.element2 ? `<span class="badge" style="font-size:4px;padding:1px 3px;">${item.element2.toUpperCase()}</span>` : ''}
        </div>
        ${progHtml}
        ${btnHtml}
      `;

      const actionBtn = card.querySelector(`button[data-starter-id="${item.id}"]`);
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          if (isSelected) {
            if (selectedIds.length > 1) {
              MetaProgression.removeStarter(item.id);
              this.syncStage1SquadIfWaiting();
              this.renderStarterModal();
              this.showToast(`Removed ${item.name} from squad.`, 'default');
              if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
            } else {
              this.showToast(`Must keep at least 1 starter in squad!`, 'warning');
            }
          } else {
            MetaProgression.toggleStarter(item.id);
            this.syncStage1SquadIfWaiting();
            this.renderStarterModal();
            this.showToast(`Added ${item.name} to Starter Squad!`, 'gold');
            if (typeof soundManager !== 'undefined') soundManager.playSfx('promote');
          }
        });
      }

      grid.appendChild(card);
    }
  },

  // =============================================
  // ASTRAL SKILL TREE MODAL CONTROLLER
  // =============================================
  openSkillTreeModal() {
    this.closeAllModals();
    const modal = document.getElementById('skillTreeModal');
    if (modal) {
      modal.classList.remove('hidden');
      const canvas = document.getElementById('skillTreeCanvas');
      if (canvas && typeof MetaProgression !== 'undefined') {
        MetaProgression.initCanvas(canvas);
        MetaProgression.initMatrixTabs();
        MetaProgression.updateMatrixTabs();
        MetaProgression.updateHUD();
        MetaProgression.centerView();
      }
      if (typeof soundManager !== 'undefined') soundManager.playSfx('magic');
    }
  },

  closeSkillTreeModal() {
    const modal = document.getElementById('skillTreeModal');
    if (modal) modal.classList.add('hidden');
    if (this.phase === 'setup') {
      this.renderBoard?.();
      this.renderBench?.();
      this.renderShop?.();
      this.renderSynergyPanel?.();
      this.updateStats?.();
    }
  },
  
  // =============================================
  // TALISMAN SYSTEM: INVENTORY, SHOP & SELL METHODS
  // =============================================

  spawnParticles() {
    this.setupViewportScaling();
  },

  setupViewportScaling() {
    const update = () => {
      const app = document.getElementById('app');
      if (!app) return;
      if (window.BattleVisual) {
        app.style.transform = 'none';
        window.BattleVisual.fitBoard();
        return;
      }
      const viewport = document.getElementById('gameViewport') || document.documentElement;
  
      const style = window.getComputedStyle(viewport);
      const padLeft = parseFloat(style.paddingLeft) || 0;
      const padRight = parseFloat(style.paddingRight) || 0;
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
  
      // Available window dimensions (taking visualViewport if available to account for onscreen navbars)
      const vv = window.visualViewport;
      const rawW = vv ? Math.min(viewport.clientWidth, vv.width) : (viewport.clientWidth || window.innerWidth);
      const rawH = vv ? Math.min(viewport.clientHeight, vv.height) : (viewport.clientHeight || window.innerHeight);
  
      // Usable content area strictly inside safe area insets (notches, camera cutouts, gesture bars)
      const w = Math.floor(rawW - padLeft - padRight);
      const h = Math.floor(rawH - padTop - padBottom);
      if (w <= 0 || h <= 0) return;
  
      // Native resolution is 768x432 (16:9) — scale is 1.0 at 768x432 (pixel-perfect 1:1)
      const scale = Math.min(w / 768, h / 432);
  
      app.style.setProperty('--app-width', '768px');
      app.style.width = '768px';
      app.style.minWidth = '768px';
      app.style.maxWidth = '768px';
      app.style.height = '432px';
      app.style.minHeight = '432px';
      app.style.maxHeight = '432px';
      app.style.transform = `scale(${scale})`;
    };
  
    const debouncedUpdate = () => {
      update();
      setTimeout(update, 80);
      setTimeout(update, 250);
      setTimeout(update, 500);
    };
  
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedUpdate);
      window.visualViewport.addEventListener('scroll', debouncedUpdate);
    }
    document.addEventListener('fullscreenchange', debouncedUpdate);
    document.addEventListener('webkitfullscreenchange', debouncedUpdate);
    update();
  
    this.setupMobileAutoLandscape();
  },

  setupMobileAutoLandscape() {
    const tryLockOrientation = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (e) { }
    };
  
    const tryFullscreen = async () => {
      const doc = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        try {
          if (doc.requestFullscreen) {
            await doc.requestFullscreen();
          } else if (doc.webkitRequestFullscreen) {
            await doc.webkitRequestFullscreen();
          }
        } catch (e) { }
      }
      tryLockOrientation();
    };
  
    // On user tap or click anywhere (especially on phone):
    const onUserTouch = () => {
      const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
        || (window.innerWidth < 950 && 'ontouchstart' in window);
      if (isMobile) {
        tryFullscreen();
      }
    };
  
    window.addEventListener('click', onUserTouch, { passive: true });
    window.addEventListener('touchstart', onUserTouch, { passive: true });
  
    // Rotate overlay button click
    const rotateBtn = document.getElementById('btnEnterLandscape');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tryFullscreen();
      });
    }
  
    const rotateOverlay = document.getElementById('rotateOverlay');
    if (rotateOverlay) {
      rotateOverlay.addEventListener('click', () => {
        tryFullscreen();
      });
    }
  
    // Try orientation lock immediately on load
    tryLockOrientation();
  }

});
