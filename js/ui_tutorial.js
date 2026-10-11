// =============================================
// CHESS+ ROGUELIKE: INTERACTIVE TUTORIAL SYSTEM
// Step-by-step guided tutorial, rendering
// navigation buttons, tutorial events
// =============================================

'use strict';

// Extend RoguelikeUI prototype with methods from this module
Object.assign(RoguelikeUI.prototype, {

  initTutorialEvents() {
    const btnSkip = document.getElementById('btnTutorialSkip');
    if (btnSkip) btnSkip.addEventListener('click', () => this.finishTutorial());
  
    const btnPrev = document.getElementById('btnTutorialPrev');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevTutorialStep());
  
    const btnNext = document.getElementById('btnTutorialNext');
    if (btnNext) btnNext.addEventListener('click', () => this.nextTutorialStep());
  
    window.addEventListener('resize', () => {
      if (this.isTutorialActive) {
        this.renderTutorialStep();
      }
    });
  },

  getTutorialSteps() {
    return [
      {
        targetId: 'inventorySlots',
        title: '1. DEPLOY POKÉMON (BENCH)',
        body: 'Select a <strong>Pokémon from your Bench</strong> on the right, then click any <strong>empty square on Ranks 1 or 2</strong> to deploy it onto the battlefield!<br><br>Tip: Click <strong>[RECALL]</strong> above the board to return all pieces to your bench at any time.',
        hand: '▼',
        layout: {
          card: { x: 280, y: 95, w: 260 },
          pointer: { x: 550, y: 140 }
        }
      },
      {
        targetId: 'btnUpgradeSlot',
        title: '2. UPGRADE SQUAD CAPACITY (+SLOT)',
        body: 'You start with <strong>3 squad slots</strong>. Spend Gold earned from victories to expand your squad up to <strong>12 Pokémon</strong> on the battlefield!',
        hand: '▲',
        layout: {
          card: { x: 330, y: 65, w: 250 },
          pointer: { x: 575, y: 30 }
        }
      },
      {
        targetId: 'talismanView',
        title: '3. TALISMANS & SYNERGIES',
        body: 'The left panel houses your <strong>BAG, SYNERGIES & TALISMAN SHOP</strong>.<br><br>Tip: Check the <strong>SYNERGY</strong> tab to view your element tiers and bonuses, or equip up to 3 talismans per Pokémon!',
        hand: '▼',
        layout: {
          card: { x: 220, y: 85, w: 250 },
          pointer: { x: 185, y: 125 }
        }
      },
      {
        targetId: 'marketView',
        title: '4. RECRUIT NEW POKÉMON',
        body: 'The right panel features the <strong>RECRUIT</strong> shop: After each victory, draft 1 of 3 new Pokémon into your bench.<br><br>Tip: If you do not like the current choices, spend Gold to <strong>[REROLL]</strong> the selection!',
        hand: '▼',
        layout: {
          card: { x: 280, y: 95, w: 260 },
          pointer: { x: 550, y: 140 }
        }
      },
      {
        targetId: 'phaseButtons',
        title: '5. BATTLE CONTROLS',
        body: 'Choose your combat playstyle on the control bar above the board:<br>- <strong>[BATTLE]</strong>: Manually command your tactical piece movements each turn.<br>- <strong>[AUTO]</strong>: Let tactical AI play turns automatically.',
        hand: '▲',
        layout: {
          card: { x: 260, y: 90, w: 260 },
          pointer: { x: 435, y: 56 }
        }
      },
      {
        targetId: 'chessBoard',
        title: '6. SUDDEN DEATH (BOARD COLLAPSE)',
        body: '<strong>WARNING:</strong> After Turn 15, the outer tiles of the arena will begin to <strong>SHAKE</strong> and plunge into the abyss!<br><br>Move your Pokémon toward the <strong>center squares</strong> to avoid falling!',
        hand: '▼',
        layout: {
          card: { x: 250, y: 110, w: 268 },
          pointer: { x: 375, y: 35 }
        }
      },
      {
        targetId: 'btnOpenMenu',
        title: '7. MENU & SAVE VAULT',
        body: 'The game <strong>auto-saves after every stage</strong>. Click <strong>[MENU]</strong> or press <strong>ESC</strong> at any time to switch between 3 save slots or export backup files.<br><br><em>Best of luck on your tactical adventure to become the Champion!</em>',
        hand: '▲',
        layout: {
          card: { x: 470, y: 65, w: 255 },
          pointer: { x: 730, y: 30 }
        }
      }
    ].map((step,index)=>({ ...step, title:t(`tutorial.title${index+1}`), body:I18n.html([
      'guide.deploy','tutorial.body2','guide.synergy','tutorial.body4','guide.combat','guide.combat','tutorial.body7'
    ][index]) }));
  },

  startInteractiveTutorial() {
    if (typeof soundManager !== 'undefined') soundManager.play('socket');
  
    // Close any open modals
    const howToModal = document.getElementById('howToPlayModal');
    if (howToModal) howToModal.classList.add('hidden');
    const inGameMenuModal = document.getElementById('inGameMenuModal');
    if (inGameMenuModal) inGameMenuModal.classList.add('hidden');
    const saveSlotsModal = document.getElementById('saveSlotsModal');
    if (saveSlotsModal) saveSlotsModal.classList.add('hidden');
  
    // If on main menu, enter active game screen
    const menuOverlay = document.getElementById('mainMenuOverlay');
    if (menuOverlay && !menuOverlay.classList.contains('hidden')) {
      menuOverlay.classList.add('hidden');
      this.inMainMenu = false;
      this.closeMainMenu();
    }
  
    const overlay = document.getElementById('tutorialOverlay');
    if (!overlay) return;
  
    this.isTutorialActive = true;
    this.tutorialStepIndex = 0;
    overlay.classList.remove('hidden');
  
    this.renderTutorialStep();
  },

  renderTutorialStep() {
    const steps = this.getTutorialSteps();
    if (this.tutorialStepIndex < 0) this.tutorialStepIndex = 0;
    if (this.tutorialStepIndex >= steps.length) {
      this.finishTutorial();
      return;
    }
  
    const step = steps[this.tutorialStepIndex];
    if (step.targetId === 'marketView') {
      this.setPokemonTab('recruit');
    } else if (step.targetId === 'inventorySlots') {
      this.setPokemonTab('bench');
    } else if (step.targetId === 'talismanView' && typeof this.setTalismanTab === 'function') {
      this.setTalismanTab('bag');
    }
    const targetEl = document.getElementById(step.targetId);
    const spotlight = document.getElementById('tutorialSpotlight');
    const pointer = document.getElementById('tutorialPointer');
    const hand = document.getElementById('tutorialHand');
    const card = document.getElementById('tutorialCard');
    const badge = document.getElementById('tutorialStepBadge');
    const title = document.getElementById('tutorialTitle');
    const body = document.getElementById('tutorialBody');
    const btnPrev = document.getElementById('btnTutorialPrev');
    const btnNext = document.getElementById('btnTutorialNext');
  
    if (badge) badge.textContent = t('tutorial.step',{step:this.tutorialStepIndex+1,count:steps.length});
    if (title) title.textContent = step.title;
    if (body) body.innerHTML = step.body;
    if (hand) hand.textContent = step.hand || '▼';
  
    if (btnPrev) {
      btnPrev.disabled = (this.tutorialStepIndex === 0);
      btnPrev.style.opacity = (this.tutorialStepIndex === 0) ? '0.4' : '1';
    }
    if (btnNext) {
      btnNext.textContent = t(this.tutorialStepIndex === steps.length - 1 ? 'tutorial.finish' : 'tutorial.next');
    }
  
    const overlay = document.getElementById('tutorialOverlay');
    const app = document.getElementById('app');
    if (!overlay || !app || !targetEl || !spotlight || !card || !pointer) return;
  
    const overlayRect = overlay.getBoundingClientRect();
    const scale = overlayRect.height / 432 || 1;
    let tRect = targetEl.getBoundingClientRect();
  
    // Tightly frame active content for container elements so the golden frame perfectly centers around items
    if (step.targetId === 'inventorySlots') {
      const slots = targetEl.querySelectorAll('.inv-slot');
      if (slots.length > 0) {
        const first = slots[0].getBoundingClientRect();
        const last = slots[slots.length - 1].getBoundingClientRect();
        tRect = {
          left: Math.min(first.left, last.left),
          top: first.top,
          right: Math.max(first.right, last.right),
          bottom: last.bottom,
          width: Math.max(first.width, last.width),
          height: last.bottom - first.top
        };
      }
    } else if (step.targetId === 'talismanView') {
      const cards = targetEl.querySelectorAll('.talisman-card');
      if (cards.length > 0) {
        const first = cards[0].getBoundingClientRect();
        const last = cards[cards.length - 1].getBoundingClientRect();
        tRect = {
          left: Math.min(first.left, last.left),
          top: first.top,
          right: Math.max(first.right, last.right),
          bottom: last.bottom,
          width: Math.max(first.width, last.width),
          height: last.bottom - first.top
        };
      }
    } else if (step.targetId === 'marketView') {
      const grid = document.getElementById('rewardCardsGrid');
      if (grid) {
        const cards = grid.querySelectorAll('.reward-card');
        if (cards.length > 0) {
          const first = cards[0].getBoundingClientRect();
          const last = cards[cards.length - 1].getBoundingClientRect();
          tRect = {
            left: Math.min(first.left, last.left),
            top: first.top,
            right: Math.max(first.right, last.right),
            bottom: last.bottom,
            width: Math.max(first.width, last.width),
            height: last.bottom - first.top
          };
        }
      }
    }
  
    // Accurately measure relative to tutorialOverlay's own viewport rect
    const relLeft = (tRect.left - overlayRect.left) / scale;
    const relTop = (tRect.top - overlayRect.top) / scale;
    const relWidth = tRect.width / scale;
    const relHeight = tRect.height / scale;
  
    // Position Spotlight centered with 3px padding
    const pad = 3;
    const spotLeft = Math.max(0, relLeft - pad);
    const spotTop = Math.max(0, relTop - pad);
    const spotW = relWidth + pad * 2;
    const spotH = relHeight + pad * 2;
  
    spotlight.style.left = `${Math.round(spotLeft)}px`;
    spotlight.style.top = `${Math.round(spotTop)}px`;
    spotlight.style.width = `${Math.round(spotW)}px`;
    spotlight.style.height = `${Math.round(spotH)}px`;
  
    // Position Card & Pointer strictly using handcrafted layout to guarantee zero overlap
    if (step.layout) {
      card.style.left = `${step.layout.card.x}px`;
      card.style.top = `${step.layout.card.y}px`;
      card.style.width = `${step.layout.card.w || 220}px`;
  
      pointer.style.left = `${step.layout.pointer.x}px`;
      pointer.style.top = `${step.layout.pointer.y}px`;
    }
  },

  nextTutorialStep() {
    if (typeof soundManager !== 'undefined') soundManager.play('click');
    const steps = this.getTutorialSteps();
    if (this.tutorialStepIndex < steps.length - 1) {
      this.tutorialStepIndex++;
      this.renderTutorialStep();
    } else {
      this.finishTutorial();
    }
  },

  prevTutorialStep() {
    if (typeof soundManager !== 'undefined') soundManager.play('click');
    if (this.tutorialStepIndex > 0) {
      this.tutorialStepIndex--;
      this.renderTutorialStep();
    }
  },

  finishTutorial() {
    if (typeof soundManager !== 'undefined') soundManager.play('coin');
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) overlay.classList.add('hidden');
    this.isTutorialActive = false;
    try {
      localStorage.setItem('chess_tutorial_seen', 'true');
    } catch (e) {}
  }

});
