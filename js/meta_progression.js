/**
 * ========================================================================
 * CHESS+ ROGUELIKE: META PROGRESSION SYSTEM
 * 1. Unified Giant Matrix Map: Core Astral + 18 Elemental Constellations
 * 2. 100% Crisp Retro Pixel-Art Node & Frame Rendering (Zero Blur)
 * 3. Nearest-Neighbor Crisp Element Icons (16x16 Pixel Art)
 * 4. High-DPI & Scale-Proof Cursor Tracking Engine (#app transform: scale)
 * 5. Permanent Starter Selection & Unlock Engine
 * ========================================================================
 */

'use strict';

// Pre-computed pixel circle scanlines for crisp, round pixel-art geometry (r = 1 to 40)
const PIXEL_CIRCLE_SPANS = {};
for (let r = 1; r <= 40; r++) {
  const spans = [];
  const R = r + 0.5;
  for (let y = -r; y <= r; y++) {
    const val = R * R - y * y;
    if (val >= 0) {
      const x = Math.floor(Math.sqrt(val));
      spans.push({ y, x });
    }
  }
  PIXEL_CIRCLE_SPANS[r] = spans;
}

const MetaProgression = {
  STORAGE_KEY: 'chessplus_meta_progression_v2',
  OLD_STORAGE_KEY: 'chessplus_meta_progression_v1',

  currentFocusId: 'core',

  // Persistent Meta State
  data: {
    skillPoints: 0,
    totalPointsEarned: 0,
    allocatedNodes: ['origin'],
    trees: {
      core: ['origin']
    },
    pokemonBuyCounts: {
      '1': 3,
      '4': 3,
      '7': 3
    },
    unlockedStarters: ['1', '4', '7'],
    selectedStarterId: '4',
    selectedStarterIds: ['4', '1', '7']
  },

  // Tree Canvas State
  canvas: null,
  ctx: null,
  dpr: 1,
  logicalWidth: 750,
  logicalHeight: 380,
  camera: { x: 375, y: 190, zoom: 0.8 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  hoveredNode: null,
  animFrameId: null,
  camAnimFrameId: null,
  particleList: [],
  nodes: {},
  edges: [],
  elementIcons: {},

  init() {
    this.load();
    this.ensureDefaultStarters();
    this.loadElementIcons();
    this.buildSkillTreeGraph();
    this.initMatrixTabs();
  },

  loadElementIcons() {
    const elements = [
      'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
      'fire', 'flying', 'ghost', 'grass', 'ground', 'ice',
      'normal', 'poison', 'psychic', 'rock', 'steel', 'water'
    ];
    elements.forEach(el => {
      const img = new Image();
      img.src = `assets/elements/${el}.png`;
      this.elementIcons[el] = img;
    });
  },

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        let raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) {
          raw = localStorage.getItem(this.OLD_STORAGE_KEY);
        }
        if (raw && raw !== 'undefined' && raw !== 'null') {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const allocSet = new Set(['origin']);
            if (Array.isArray(parsed.allocatedNodes)) {
              parsed.allocatedNodes.forEach(id => allocSet.add(id));
            }
            if (parsed.trees && typeof parsed.trees === 'object') {
              for (const tid in parsed.trees) {
                if (Array.isArray(parsed.trees[tid])) {
                  parsed.trees[tid].forEach(id => allocSet.add(id));
                }
              }
            }

            this.data = {
              skillPoints: Number(parsed.skillPoints) || 0,
              totalPointsEarned: Number(parsed.totalPointsEarned) || 0,
              allocatedNodes: Array.from(allocSet),
              trees: parsed.trees || { core: Array.from(allocSet) },
              pokemonBuyCounts: parsed.pokemonBuyCounts || { '1': 3, '4': 3, '7': 3 },
              unlockedStarters: Array.isArray(parsed.unlockedStarters) ? parsed.unlockedStarters : ['1', '4', '7'],
              selectedStarterIds: Array.isArray(parsed.selectedStarterIds) && parsed.selectedStarterIds.length > 0
                ? parsed.selectedStarterIds.map(String)
                : (parsed.selectedStarterId ? [String(parsed.selectedStarterId), '1', '7'].slice(0, 3) : ['4', '1', '7']),
              selectedStarterId: String(parsed.selectedStarterId || '4')
            };
          }
        }
      }
    } catch (e) {
      console.warn('MetaProgression load failed:', e);
    }
  },

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        const alloc = this.getAllocatedNodes();
        if (!this.data.trees) this.data.trees = {};
        this.data.trees.core = alloc;
        this.data.allocatedNodes = alloc;
        this.data.selectedStarterIds = this.getSelectedStarters();
        this.data.selectedStarterId = this.data.selectedStarterIds[0] || '4';
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn('MetaProgression save failed:', e);
    }
  },

  ensureDefaultStarters() {
    ['1', '4', '7'].forEach(id => {
      if (!this.data.unlockedStarters.includes(id)) {
        this.data.unlockedStarters.push(id);
      }
      if (!this.data.pokemonBuyCounts[id] || this.data.pokemonBuyCounts[id] < 3) {
        this.data.pokemonBuyCounts[id] = 3;
      }
    });
  },

  getAllocatedNodes() {
    if (!Array.isArray(this.data.allocatedNodes)) {
      this.data.allocatedNodes = ['origin'];
    }
    if (!this.data.allocatedNodes.includes('origin')) {
      this.data.allocatedNodes.unshift('origin');
    }
    return this.data.allocatedNodes;
  },

  hasNode(id) {
    return this.getAllocatedNodes().includes(id);
  },

  // ==========================================================================
  // UNIFIED SKILL TREE GRAPH BUILDER (CORE + 18 ELEMENTAL CONSTELLATIONS)
  // ==========================================================================
  buildSkillTreeGraph() {
    const nodes = {};
    const edges = [];
    const allocList = this.getAllocatedNodes();

    const addNode = (id, label, type, quad, x, y, desc, statKey, elementIconKey) => {
      nodes[id] = {
        id,
        label,
        type,
        quad: quad || 'core',
        x: Number(x) || 0,
        y: Number(y) || 0,
        desc: desc || '',
        statKey: statKey || 'both',
        elementIconKey: elementIconKey || null,
        allocated: allocList.includes(id)
      };
    };

    const addEdge = (from, to) => {
      if (!edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
        edges.push({ from, to });
      }
    };

    if (typeof TREE_REGISTRY !== 'undefined') {
      if (TREE_REGISTRY['core'] && TREE_REGISTRY['core'].buildGraph) {
        TREE_REGISTRY['core'].buildGraph(addNode, addEdge);
      }
      for (const tid in TREE_REGISTRY) {
        if (tid !== 'core' && TREE_REGISTRY[tid].buildGraph) {
          TREE_REGISTRY[tid].buildGraph(addNode, addEdge);
        }
      }
    }

    this.nodes = nodes;
    this.edges = edges;
  },

  // ==========================================================================
  // CAMERA NAVIGATION & FOCUS ON CONSTELLATIONS
  // ==========================================================================
  initMatrixTabs() {
    const container = document.getElementById('skillTreeMatrixTabs');
    if (!container) return;
    const buttons = container.querySelectorAll('.matrix-tab');
    buttons.forEach(btn => {
      btn.onclick = () => {
        const treeId = btn.getAttribute('data-tree');
        if (treeId) {
          this.focusConstellation(treeId);
          if (typeof soundManager !== 'undefined') soundManager.playSfx('click');
        }
      };
    });
  },

  updateMatrixTabs() {
    const container = document.getElementById('skillTreeMatrixTabs');
    if (!container) return;
    const buttons = container.querySelectorAll('.matrix-tab');
    buttons.forEach(btn => {
      const tid = btn.getAttribute('data-tree');
      if (tid === this.currentFocusId) {
        btn.classList.add('active');
        try {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch (_) {}
      } else {
        btn.classList.remove('active');
      }
    });
  },

  focusConstellation(treeId) {
    if (typeof TREE_REGISTRY === 'undefined' || !TREE_REGISTRY[treeId]) {
      treeId = 'core';
    }
    this.currentFocusId = treeId;
    this.updateMatrixTabs();

    if (!this.canvas) return;
    const def = TREE_REGISTRY[treeId];
    const targetWorldX = def.centerX || 0;
    const targetWorldY = def.centerY || 0;
    const targetZoom = (treeId === 'core') ? 0.75 : 0.85;

    const logicalW = this.logicalWidth || 750;
    const logicalH = this.logicalHeight || 380;

    const targetCamX = (logicalW / 2) - targetWorldX * targetZoom;
    const targetCamY = (logicalH / 2) - targetWorldY * targetZoom;

    this.animateCameraTo(targetCamX, targetCamY, targetZoom);
    this.updateHUD();
  },

  animateCameraTo(targetX, targetY, targetZoom, duration = 350) {
    if (this.camAnimFrameId) cancelAnimationFrame(this.camAnimFrameId);

    const startX = this.camera.x;
    const startY = this.camera.y;
    const startZoom = this.camera.zoom;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.x = startX + (targetX - startX) * ease;
      this.camera.y = startY + (targetY - startY) * ease;
      this.camera.zoom = startZoom + (targetZoom - startZoom) * ease;

      if (progress < 1) {
        this.camAnimFrameId = requestAnimationFrame(step);
      } else {
        this.camAnimFrameId = null;
      }
    };

    this.camAnimFrameId = requestAnimationFrame(step);
  },

  centerView() {
    this.focusConstellation('core');
  },

  // ==========================================================================
  // STARTER UNLOCK ENGINE
  // ==========================================================================
  getStarterRequirement(rarity) {
    const r = (rarity || 'common').toLowerCase();
    if (r === 'epic') return 8;
    if (r === 'rare') return 5;
    return 3;
  },

  recordPokemonPurchase(type) {
    const id = String(type);
    if (typeof PIECES === 'undefined' || !PIECES[id]) return null;
    const p = PIECES[id];

    if (Number(p.stage) !== 1 || (p.rarity && p.rarity.toLowerCase() === 'legend')) {
      return null;
    }

    this.data.pokemonBuyCounts[id] = (this.data.pokemonBuyCounts[id] || 0) + 1;
    const count = this.data.pokemonBuyCounts[id];
    const req = this.getStarterRequirement(p.rarity);
    let justUnlocked = false;

    if (count >= req && !this.data.unlockedStarters.includes(id)) {
      this.data.unlockedStarters.push(id);
      justUnlocked = true;
    }

    this.save();
    return { id, count, req, justUnlocked, isUnlocked: count >= req };
  },

  isStarterUnlocked(type) {
    return this.data.unlockedStarters.includes(String(type));
  },

  getStarterProgress(type) {
    const id = String(type);
    const p = (typeof PIECES !== 'undefined') ? PIECES[id] : null;
    const rarity = p ? p.rarity : 'common';
    const req = this.getStarterRequirement(rarity);
    const count = this.data.pokemonBuyCounts[id] || 0;
    return { count, req, isUnlocked: this.isStarterUnlocked(id) };
  },

  getSelectedStarters() {
    if (!Array.isArray(this.data.selectedStarterIds) || this.data.selectedStarterIds.length === 0) {
      const fallback = [this.data.selectedStarterId || '4', '1', '7'].filter(Boolean);
      this.data.selectedStarterIds = [...new Set(fallback)].slice(0, 3);
    }
    const unique = [...new Set(this.data.selectedStarterIds.map(String))].slice(0, 3);
    this.data.selectedStarterIds = unique.length > 0 ? unique : ['4', '1', '7'];
    this.data.selectedStarterId = this.data.selectedStarterIds[0];
    return this.data.selectedStarterIds;
  },

  getSelectedStarter() {
    return this.getSelectedStarters()[0] || '4';
  },

  toggleStarter(type) {
    const id = String(type);
    if (!this.isStarterUnlocked(id)) return false;
    let list = [...this.getSelectedStarters()];
    if (list.includes(id)) {
      if (list.length > 1) {
        list = list.filter(x => x !== id);
      } else {
        return false; // Keep at least 1 starter in squad
      }
    } else {
      if (list.length < 3) {
        list.push(id);
      } else {
        // If 3 are already selected, swap the 3rd slot with the newly chosen starter
        list = [list[0], list[1], id];
      }
    }
    this.data.selectedStarterIds = list;
    this.data.selectedStarterId = list[0];
    this.save();
    return true;
  },

  removeStarter(type) {
    const id = String(type);
    let list = [...this.getSelectedStarters()];
    if (list.includes(id) && list.length > 1) {
      this.data.selectedStarterIds = list.filter(x => x !== id);
      this.data.selectedStarterId = this.data.selectedStarterIds[0];
      this.save();
      return true;
    }
    return false;
  },

  setSelectedStarter(type) {
    return this.toggleStarter(type);
  },

  getEligibleStarters() {
    if (typeof PIECES === 'undefined') return [];
    const list = [];
    const keys = (typeof ALL_PIECE_KEYS !== 'undefined' ? ALL_PIECE_KEYS : Object.keys(PIECES));
    const activeStarters = this.getSelectedStarters();

    for (const key of keys) {
      const p = PIECES[key];
      if (!p) continue;
      if (Number(p.stage) === 1 && (p.rarity || 'common').toLowerCase() !== 'legend' && !key.startsWith('mega_')) {
        const prog = this.getStarterProgress(key);
        const slotIdx = activeStarters.indexOf(key);
        list.push({
          id: key,
          ...p,
          buyCount: prog.count,
          reqCount: prog.req,
          isUnlocked: prog.isUnlocked,
          isSelected: slotIdx !== -1,
          slotIndex: slotIdx !== -1 ? slotIdx + 1 : 0
        });
      }
    }

    list.sort((a, b) => {
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;
      if (a.isSelected && b.isSelected) return a.slotIndex - b.slotIndex;
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      return (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0);
    });

    return list;
  },

  // ==========================================================================
  // SKILL POINTS REWARD ENGINE
  // ==========================================================================
  awardStageClearPoints(stage) {
    if (stage % 5 === 0) {
      const pts = 1;
      this.data.skillPoints += pts;
      this.data.totalPointsEarned += pts;
      this.save();
      return pts;
    }
    return 0;
  },

  getSkillPoints() {
    return this.data.skillPoints;
  },

  // ==========================================================================
  // PASSIVE TREE BUFF CALCULATIONS
  // ==========================================================================
  getBonusStartingGold() {
    let gold = 0;
    if (this.hasNode('w_gold_1')) gold += 1;
    if (this.hasNode('w_gold_2')) gold += 2;
    if (this.hasNode('w_notable_1')) gold += 5;
    if (this.hasNode('w_gold_3')) gold += 2;
    return gold;
  },

  getBonusStartingSlots() {
    let slots = 0;
    if (this.hasNode('w_slot_1')) slots += 1;
    if (this.hasNode('w_slot_2')) slots += 1;
    if (this.hasNode('w_notable_5')) slots += 1;
    return slots;
  },

  getRerollDiscount() {
    let discount = 0;
    if (this.hasNode('w_reroll_1')) discount += 1;
    if (this.hasNode('w_notable_3')) discount += 1;
    return discount;
  },

  getExtraShopCards() {
    let cards = 0;
    if (this.hasNode('w_card_1')) cards += 1;
    if (this.hasNode('w_keystone')) cards += 1;
    return cards;
  },

  getBonusMaxHp(piece, stage) {
    if (!piece || piece.color !== W) return 0;
    let hp = 0;
    if (typeof TREE_REGISTRY === 'undefined') return 0;

    if (TREE_REGISTRY['core'] && TREE_REGISTRY['core'].getBonusHp) {
      hp += TREE_REGISTRY['core'].getBonusHp(piece, stage, (id) => this.hasNode(id), this.getSelectedStarters());
    }

    if (piece) {
      const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
      if (pDef) {
        const e1 = (pDef.element || '').toLowerCase();
        const e2 = (pDef.element2 || '').toLowerCase();
        const checked = new Set();
        [e1, e2].forEach(el => {
          if (el && !checked.has(el) && TREE_REGISTRY[el] && TREE_REGISTRY[el].getBonusHp) {
            checked.add(el);
            hp += TREE_REGISTRY[el].getBonusHp(piece, stage, (id) => this.hasNode(id));
          }
        });
      }
    }

    return hp;
  },

  getBonusDamage(piece, stage) {
    if (!piece || piece.color !== W) return 0;
    let dmg = 0;
    if (typeof TREE_REGISTRY === 'undefined') return 0;

    if (TREE_REGISTRY['core'] && TREE_REGISTRY['core'].getBonusAtk) {
      dmg += TREE_REGISTRY['core'].getBonusAtk(piece, stage, (id) => this.hasNode(id), this.getSelectedStarters());
    }

    if (piece) {
      const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
      if (pDef) {
        const e1 = (pDef.element || '').toLowerCase();
        const e2 = (pDef.element2 || '').toLowerCase();
        const checked = new Set();
        [e1, e2].forEach(el => {
          if (el && !checked.has(el) && TREE_REGISTRY[el] && TREE_REGISTRY[el].getBonusAtk) {
            checked.add(el);
            dmg += TREE_REGISTRY[el].getBonusAtk(piece, stage, (id) => this.hasNode(id));
          }
        });
      }
    }

    return dmg;
  },

  getCritChanceBonus(piece) {
    if (!piece || piece.color !== W) return 0;
    let crit = 0;
    if (this.hasNode('m_crit_1')) crit += 0.03;
    if (this.hasNode('m_notable_3')) crit += 0.08;
    return crit;
  },

  getExtraTalismanSlots() {
    let extra = 0;
    if (this.hasNode('r_notable_2')) extra += 1;
    return extra;
  },

  hasKeystoneUnyieldingWill() {
    return this.hasNode('m_keystone');
  },

  hasKeystoneChosenChampion() {
    return this.hasNode('r_keystone');
  },

  hasKeystonePrimordialCatalyst() {
    return this.hasNode('a_keystone');
  },

  hasFreeRerollPerStage() {
    return this.hasNode('w_notable_2');
  },

  // ==========================================================================
  // CONTINUOUS MAP ALLOCATION & RESPEC LOGIC
  // ==========================================================================
  canAllocate(nodeId) {
    if (this.hasNode(nodeId)) return false;
    if (this.data.skillPoints < 1) return false;

    for (const edge of this.edges) {
      if (edge.from === nodeId && this.hasNode(edge.to)) return true;
      if (edge.to === nodeId && this.hasNode(edge.from)) return true;
    }
    return false;
  },

  allocateNode(nodeId) {
    if (!this.canAllocate(nodeId)) return false;

    this.data.skillPoints -= 1;
    this.getAllocatedNodes().push(nodeId);
    if (this.nodes[nodeId]) {
      this.nodes[nodeId].allocated = true;
    }

    this.save();

    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('socket');
    }

    const node = this.nodes[nodeId];
    if (node) {
      this.spawnParticles(node.x, node.y, 25);
    }

    this.updateHUD();
    return true;
  },

  resetTree() {
    const list = this.getAllocatedNodes();
    const refundCount = list.filter(id => id !== 'origin').length;

    this.data.skillPoints += refundCount;
    this.data.allocatedNodes = ['origin'];
    this.data.trees = { core: ['origin'] };

    for (const id in this.nodes) {
      this.nodes[id].allocated = (id === 'origin');
    }

    this.save();

    if (typeof soundManager !== 'undefined') {
      soundManager.playSfx('reflect');
    }

    this.updateHUD();
    return refundCount;
  },

  // ==========================================================================
  // HIGH-DPI & CRISP PIXEL-ART CANVAS ENGINE WITH EXACT MOUSE SYNC
  // ==========================================================================
  setupCanvasResolution() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement || document.getElementById('skillTreeCanvasContainer');
    if (!container) return;

    // Logical width/height in #app CSS layout
    const logicalW = container.clientWidth || 750;
    const logicalH = container.clientHeight || 380;

    // Real screen bounding box on client monitor
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // Physical pixel backing store
    const targetBufferWidth = Math.round((rect.width || logicalW) * dpr);
    const targetBufferHeight = Math.round((rect.height || logicalH) * dpr);

    if (this.canvas.width !== targetBufferWidth || this.canvas.height !== targetBufferHeight) {
      this.canvas.width = targetBufferWidth;
      this.canvas.height = targetBufferHeight;
    }

    this.logicalWidth = logicalW;
    this.logicalHeight = logicalH;
    this.dpr = dpr;
  },

  drawPixelCircle(ctx, cx, cy, r, color) {
    const clampedR = Math.max(1, Math.min(40, Math.round(r)));
    const spans = PIXEL_CIRCLE_SPANS[clampedR];
    if (!spans) return;
    const icx = Math.round(cx);
    const icy = Math.round(cy);
    ctx.fillStyle = color;
    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      ctx.fillRect(icx - s.x, icy + s.y, s.x * 2 + 1, 1);
    }
  },

  drawPixelRing(ctx, cx, cy, r, color, thickness = 1) {
    const clampedR = Math.max(2, Math.min(40, Math.round(r)));
    const innerR = Math.max(1, clampedR - thickness);
    const spansOuter = PIXEL_CIRCLE_SPANS[clampedR];
    const spansInner = PIXEL_CIRCLE_SPANS[innerR];
    if (!spansOuter || !spansInner) return;
    const icx = Math.round(cx);
    const icy = Math.round(cy);
    ctx.fillStyle = color;

    for (let i = 0; i < spansOuter.length; i++) {
      const so = spansOuter[i];
      const y = icy + so.y;
      const innerIdx = so.y + innerR;
      if (innerIdx >= 0 && innerIdx < spansInner.length) {
        const si = spansInner[innerIdx];
        const leftW = Math.max(1, so.x - si.x);
        ctx.fillRect(icx - so.x, y, leftW, 1);
        ctx.fillRect(icx + si.x + 1, y, leftW, 1);
      } else {
        ctx.fillRect(icx - so.x, y, so.x * 2 + 1, 1);
      }
    }
  },

  /**
   * Scale-Proof Cursor Tracking
   * Correctly inverts #app transform: scale(s) and canvas container offsets
   */
  getCanvasMouse(e) {
    if (!this.canvas) return null;
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const logicalW = this.logicalWidth || 750;
    const logicalH = this.logicalHeight || 380;

    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return {
      x,
      y,
      scaleX,
      scaleY,
      isInside: (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )
    };
  },

  initCanvas(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.setupCanvasResolution();
    this.buildSkillTreeGraph();
    this.initMatrixTabs();

    if (!this.camera.x && !this.camera.y) {
      this.centerView();
    }

    canvasEl.onmousedown = (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
    };

    window.onmousemove = (e) => {
      const modal = document.getElementById('skillTreeModal');
      if (!modal || modal.classList.contains('hidden')) return;

      const m = this.getCanvasMouse(e);
      if (!m) return;

      if (this.isDragging) {
        const dx = (e.clientX - this.dragStart.x) * m.scaleX;
        const dy = (e.clientY - this.dragStart.y) * m.scaleY;
        this.camera.x += dx;
        this.camera.y += dy;
        this.dragStart = { x: e.clientX, y: e.clientY };
      } else if (m.isInside) {
        this.checkHover(m.x, m.y);
      } else {
        this.checkHover(-99999, -99999);
      }
    };

    window.onmouseup = () => {
      this.isDragging = false;
    };

    canvasEl.onmouseleave = () => {
      if (!this.isDragging) {
        this.checkHover(-99999, -99999);
      }
    };

    canvasEl.onwheel = (e) => {
      e.preventDefault();
      const m = this.getCanvasMouse(e);
      if (!m) return;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.max(0.35, Math.min(2.5, this.camera.zoom * zoomFactor));

      this.camera.x = m.x - (m.x - this.camera.x) * (newZoom / this.camera.zoom);
      this.camera.y = m.y - (m.y - this.camera.y) * (newZoom / this.camera.zoom);
      this.camera.zoom = newZoom;
    };

    canvasEl.onclick = (e) => {
      const m = this.getCanvasMouse(e);
      if (!m) return;
      const node = this.getNodeAtScreen(m.x, m.y);
      if (node && !node.allocated) {
        if (this.canAllocate(node.id)) {
          this.allocateNode(node.id);
        } else if (this.data.skillPoints < 1) {
          if (typeof app !== 'undefined' && app.showToast) {
            app.showToast('Not enough Skill Points! Defeat stages to earn more.', 'gold');
          }
        } else {
          if (typeof app !== 'undefined' && app.showToast) {
            app.showToast('Must connect to an adjacent allocated node!', 'cyan');
          }
        }
      }
    };

    if (!this._resizeAttached) {
      this._resizeAttached = true;
      window.addEventListener('resize', () => {
        this.setupCanvasResolution();
      });
    }

    this.startAnimationLoop();
  },

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.camera.x) / this.camera.zoom,
      y: (sy - this.camera.y) / this.camera.zoom
    };
  },

  worldToScreen(wx, wy) {
    return {
      x: wx * this.camera.zoom + this.camera.x,
      y: wy * this.camera.zoom + this.camera.y
    };
  },

  getNodeRadius(type) {
    if (type === 'keystone') return 24;
    if (type === 'notable') return 16;
    if (type === 'origin') return 24;
    return 10;
  },

  getNodeAtScreen(sx, sy) {
    const w = this.screenToWorld(sx, sy);
    for (const id in this.nodes) {
      const n = this.nodes[id];
      const r = this.getNodeRadius(n.type);
      const dist = Math.hypot(n.x - w.x, n.y - w.y);
      if (dist <= r + 4) return n;
    }
    return null;
  },

  checkHover(sx, sy) {
    const node = this.getNodeAtScreen(sx, sy);
    if (node !== this.hoveredNode) {
      this.hoveredNode = node;
      this.renderTooltip(node);
      if (this.canvas) {
        this.canvas.style.cursor = node ? 'pointer' : 'grab';
      }
    }
  },

  renderTooltip(node) {
    const panel = document.getElementById('skillTreeTooltip');
    if (!panel) return;

    if (!node) {
      panel.style.display = 'none';
      return;
    }

    panel.style.display = 'block';
    const isAlloc = this.hasNode(node.id);
    const canAlloc = this.canAllocate(node.id);

    let statusText = isAlloc
      ? '<span style="color:#2ed573;">ALLOCATED</span>'
      : (canAlloc
        ? '<span style="color:#00f2fe;">AVAILABLE (Cost: 1 Point)</span>'
        : '<span style="color:#8395a7;">LOCKED (Connect adjacent node)</span>');

    let typeBadge = '';
    if (node.type === 'keystone') typeBadge = '<span class="node-badge-keystone">KEYSTONE</span>';
    else if (node.type === 'notable') typeBadge = '<span class="node-badge-notable">NOTABLE</span>';
    else if (node.type === 'origin') typeBadge = '<span class="node-badge-origin">ORIGIN</span>';
    else typeBadge = '<span class="node-badge-minor">MINOR PASSIVE</span>';

    panel.innerHTML = `
      <div class="tooltip-header">
        <div class="tooltip-title">${node.label}</div>
        ${typeBadge}
      </div>
      <div class="tooltip-desc">${node.desc}</div>
      <div class="tooltip-status">${statusText}</div>
    `;
  },

  spawnParticles(wx, wy, count = 15) {
    const pColor = '#00f2fe';
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particleList.push({
        x: wx,
        y: wy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        color: pColor
      });
    }
  },

  startAnimationLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    let time = 0;

    const render = () => {
      time += 0.02;
      this.draw(time);
      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  },

  getConstellationThemeColor(quad) {
    if (!quad || quad === 'core' || quad === 'might' || quad === 'wealth' || quad === 'arcana' || quad === 'relics') {
      return '#00f2fe';
    }
    if (typeof TREE_REGISTRY !== 'undefined' && TREE_REGISTRY[quad]) {
      return TREE_REGISTRY[quad].themeColor || '#00f2fe';
    }
    return '#00f2fe';
  },

  draw(time) {
    if (!this.ctx || !this.canvas) return;
    this.setupCanvasResolution();

    const ctx = this.ctx;
    const logicalW = this.logicalWidth || 750;
    const logicalH = this.logicalHeight || 380;

    // Reset transform to native canvas buffer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // CRITICAL: Disable all image smoothing for 100% crisp pixel art!
    ctx.imageSmoothingEnabled = false;
    if ('mozImageSmoothingEnabled' in ctx) ctx.mozImageSmoothingEnabled = false;
    if ('webkitImageSmoothingEnabled' in ctx) ctx.webkitImageSmoothingEnabled = false;
    if ('msImageSmoothingEnabled' in ctx) ctx.msImageSmoothingEnabled = false;

    // Map physical canvas backing store 1:1 to logical coordinate space
    const bufferScaleX = this.canvas.width / logicalW;
    const bufferScaleY = this.canvas.height / logicalH;
    ctx.setTransform(bufferScaleX, 0, 0, bufferScaleY, 0, 0);

    // 1. Cosmic Deep Space Background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, logicalW, logicalH);

    ctx.save();
    ctx.translate(Math.round(this.camera.x), Math.round(this.camera.y));
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // 2. Subtle Constellation Orbit Ring
    ctx.beginPath();
    ctx.arc(0, 0, 850, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 16]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw All Constellation Edges (Integer-snapped, crisp, NO shadowBlur)
    for (const edge of this.edges) {
      const from = this.nodes[edge.from];
      const to = this.nodes[edge.to];
      if (!from || !to) continue;

      const isAllocatedEdge = from.allocated && to.allocated;
      const isAvailableEdge = (from.allocated || to.allocated);
      const isBridge = (from.quad !== to.quad);
      const themeColor = this.getConstellationThemeColor(from.quad !== 'core' ? from.quad : to.quad);

      const fx = Math.round(from.x);
      const fy = Math.round(from.y);
      const tx = Math.round(to.x);
      const ty = Math.round(to.y);

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);

      if (isAllocatedEdge) {
        ctx.strokeStyle = isBridge ? '#fbc531' : themeColor;
        ctx.lineWidth = isBridge ? 3.5 : 2.5;
        ctx.stroke();
      } else if (isAvailableEdge) {
        ctx.strokeStyle = isBridge ? 'rgba(251, 197, 49, 0.7)' : 'rgba(79, 172, 254, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      } else {
        ctx.strokeStyle = isBridge ? 'rgba(251, 197, 49, 0.25)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.2;
        if (isBridge) ctx.setLineDash([4, 6]);
        ctx.stroke();
        if (isBridge) ctx.setLineDash([]);
      }
    }

    // 4. Draw All Nodes as 100% Crisp Pixel-Art Badges (Scanline Stepped Geometry)
    for (const id in this.nodes) {
      const node = this.nodes[id];
      const r = this.getNodeRadius(node.type);
      const isAllocated = node.allocated;
      const canAlloc = this.canAllocate(node.id);
      const isHovered = (this.hoveredNode && this.hoveredNode.id === node.id);
      const themeColor = this.getConstellationThemeColor(node.quad);
      const nx = Math.round(node.x);
      const ny = Math.round(node.y);

      // (A) Stepped Pixel Halo / Pulse
      if (isAllocated) {
        const pulseR = r + 4 + Math.round(Math.sin(time * 3 + nx * 0.05) * 1.5);
        const haloColor = node.type === 'keystone' ? 'rgba(255, 118, 117, 0.25)' : `${themeColor}28`;
        this.drawPixelCircle(ctx, nx, ny, pulseR, haloColor);
      } else if (canAlloc) {
        const pulseR = r + 3 + Math.round(Math.sin(time * 5 + ny * 0.05) * 1.5);
        this.drawPixelCircle(ctx, nx, ny, pulseR, 'rgba(46, 213, 115, 0.35)');
      }

      // (B) Base Pixel-Art Badge
      let borderColor = '#324058';
      let fillColor = '#111726';
      let borderWidth = 2;

      if (node.type === 'origin') {
        borderWidth = 3;
        borderColor = isAllocated ? themeColor : '#4b6584';
        fillColor = isAllocated ? '#09101d' : '#050811';
      } else if (isAllocated) {
        borderColor = '#ffffff';
        if (node.type === 'keystone') fillColor = '#ff7675';
        else if (node.type === 'notable') fillColor = '#fbc531';
        else fillColor = themeColor;
      } else if (canAlloc) {
        borderColor = '#2ed573';
        fillColor = '#13391e';
      }

      // 1. Outer Pixel Border
      this.drawPixelCircle(ctx, nx, ny, r, borderColor);
      // 2. Inner Pixel Fill
      this.drawPixelCircle(ctx, nx, ny, r - borderWidth, fillColor);

      // 3. Ornate Decorative Inner Pixel Ring for Notables & Keystones
      if (node.type === 'notable' || node.type === 'keystone') {
        const innerR = Math.round(r * 0.55);
        const ringColor = isAllocated ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)';
        this.drawPixelRing(ctx, nx, ny, innerR, ringColor);
      }

      // (C) Render Official 16x16 Pixel-Art Icon inside Origin nodes
      if (node.elementIconKey && this.elementIcons[node.elementIconKey]) {
        const iconImg = this.elementIcons[node.elementIconKey];
        if (iconImg.complete && iconImg.naturalWidth > 0) {
          // Exact 2x scale = 32x32 integer pixels, nearest-neighbor
          const iconSize = 32;
          const ix = Math.round(nx - iconSize / 2);
          const iy = Math.round(ny - iconSize / 2);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(iconImg, ix, iy, iconSize, iconSize);
        }
      } else if (node.id === 'origin') {
        // Astral Core Center: Authentic 16-bit Pixel-Art Pokéball
        const pbR = 14;
        this.drawPixelCircle(ctx, nx, ny, pbR, '#1e272e');
        const spansUpper = PIXEL_CIRCLE_SPANS[pbR - 2];
        if (spansUpper) {
          ctx.fillStyle = '#ff4757';
          for (let i = 0; i < spansUpper.length; i++) {
            const s = spansUpper[i];
            if (s.y < 0) {
              ctx.fillRect(nx - s.x, ny + s.y, s.x * 2 + 1, 1);
            }
          }
        }
        if (spansUpper) {
          ctx.fillStyle = '#f1f2f6';
          for (let i = 0; i < spansUpper.length; i++) {
            const s = spansUpper[i];
            if (s.y > 0) {
              ctx.fillRect(nx - s.x, ny + s.y, s.x * 2 + 1, 1);
            }
          }
        }
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(nx - pbR + 2, ny - 1, (pbR - 2) * 2 + 1, 3);
        this.drawPixelCircle(ctx, nx, ny, 5, '#1e272e');
        this.drawPixelCircle(ctx, nx, ny, 3, '#ffffff');
      }

      // (D) Hover Pixel Ring
      if (isHovered) {
        this.drawPixelRing(ctx, nx, ny, r + 3, '#ffffff');
      }
    }

    // 5. Draw Particle Bursts as crisp pixel squares
    for (let i = this.particleList.length - 1; i >= 0; i--) {
      const p = this.particleList[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particleList.splice(i, 1);
        continue;
      }

      const pSize = Math.max(1, Math.round(3 * p.life));
      ctx.fillStyle = p.color || '#00f2fe';
      ctx.fillRect(Math.round(p.x - pSize / 2), Math.round(p.y - pSize / 2), pSize, pSize);
    }

    ctx.restore();
  },

  updateHUD() {
    const ptsEl = document.getElementById('skillTreePointsCount');
    if (ptsEl) {
      ptsEl.textContent = this.data.skillPoints;
    }
    const allocEl = document.getElementById('skillTreeAllocatedCount');
    if (allocEl && this.nodes) {
      const allocCount = this.getAllocatedNodes().length;
      allocEl.textContent = `${allocCount}/${Object.keys(this.nodes).length}`;
    }
    const titleEl = document.querySelector('.skill-tree-main-title');
    if (titleEl) {
      const treeDef = (typeof TREE_REGISTRY !== 'undefined') ? TREE_REGISTRY[this.currentFocusId] : null;
      titleEl.textContent = treeDef ? `ASTRAL MATRIX — ${treeDef.name}` : 'ASTRAL PASSIVE MATRIX';
    }
  }
};

if (typeof window !== 'undefined') {
  window.MetaProgression = MetaProgression;
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', () => {
      MetaProgression.init();
    });
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetaProgression;
}
