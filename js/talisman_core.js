// =============================================
// CHESS+ ROGUELIKE: TALISMAN & ITEM CORE SYSTEM
// All individual items are located in: js/talismans/<name>.js
// =============================================

'use strict';

const TALISMANS = (typeof window !== 'undefined' ? window : globalThis).TALISMANS =
  (typeof window !== 'undefined' && window.TALISMANS) ? window.TALISMANS : {};

// Helper to resolve official item icon path
function getItemIcon(filename) {
  if (typeof window !== 'undefined' && window.ITEM_ICON_PACK) {
    const cleanName = String(filename).split('?')[0].trim();
    if (window.ITEM_ICON_PACK[cleanName]) {
      return window.ITEM_ICON_PACK[cleanName];
    }
    const base = cleanName.split('/').pop();
    if (window.ITEM_ICON_PACK[base]) {
      return window.ITEM_ICON_PACK[base];
    }
  }
  const v = (typeof ASSET_VERSION !== 'undefined') ? ASSET_VERSION : '3.3.1791699025';
  return `assets/items/${filename}?v=${v}`;
}
if (typeof window !== 'undefined') {
  window.getItemIcon = getItemIcon;
}

// Global Evolution Stone Handler
function castEvolutionStone(stoneDef, ui, pieceOrItem) {
  if (!ui) return false;
  const pType = String(pieceOrItem.type);
  const pDef = (typeof PIECES !== 'undefined') ? PIECES[pType] : null;

  if (!pDef) {
    if (ui.showToast) ui.showToast('Invalid target unit!', 'warning');
    else alert('Invalid target unit!');
    return false;
  }

  let nextType = null;

  // 1. Branched Evolution Stone Rules:
  if (pType === '133') { // Eevee
    if (stoneDef.id === 'water_stone') nextType = '134'; // Vaporeon
    else if (stoneDef.id === 'thunder_stone') nextType = '135'; // Jolteon
    else if (stoneDef.id === 'fire_stone') nextType = '136'; // Flareon
    else if (stoneDef.id === 'sun_stone') nextType = '196'; // Espeon
    else if (stoneDef.id === 'moon_stone') nextType = '197'; // Umbreon
  }
  else if (pType === '44') { // Gloom
    if (stoneDef.id === 'leaf_stone') nextType = '45'; // Vileplume
    else if (stoneDef.id === 'sun_stone') nextType = '182'; // Bellossom
  }
  else if (pType === '61') { // Poliwhirl
    if (stoneDef.id === 'water_stone') nextType = '62'; // Poliwrath
    else if (stoneDef.id === 'kings_rock') nextType = '186'; // Politoed
  }
  else if (pType === '79') { // Slowpoke
    if (stoneDef.id === 'kings_rock') nextType = '199'; // Slowking
  }
  else if (pType === '281') { // Kirlia
    if (stoneDef.id === 'dawn_stone') nextType = '475'; // Gallade
  }
  else if (pType === '361') { // Snorunt
    if (stoneDef.id === 'dawn_stone') nextType = '478'; // Froslass
  }
  else if (pType === '366') { // Clamperl
    if (stoneDef.id === 'water_stone') nextType = '367'; // Huntail
    else if (stoneDef.id === 'dragon_scale') nextType = '368'; // Gorebyss
  }
  // 2. Explicit evoItem set in piece config (e.g. from Ctrl + Shift + E)
  else if (pDef.evoItem === stoneDef.id && pDef.nextEvo) {
    nextType = String(pDef.nextEvo);
  }
  // 3. Canonical Pokémon evolution stone rules
  else if (pDef.nextEvo) {
    const isWater = stoneDef.id === 'water_stone' && ['90', '120', '271'].includes(pType);
    const isFire = stoneDef.id === 'fire_stone' && ['37', '58', '274'].includes(pType);
    const isThunder = stoneDef.id === 'thunder_stone' && ['25', '82', '603'].includes(pType);
    const isLeaf = stoneDef.id === 'leaf_stone' && ['70', '102', '274'].includes(pType);
    const isMoon = stoneDef.id === 'moon_stone' && ['30', '33', '35', '39', '300'].includes(pType);
    const isSun = stoneDef.id === 'sun_stone' && ['191', '546', '694'].includes(pType);
    const isDusk = stoneDef.id === 'dusk_stone' && ['198', '200', '608'].includes(pType);
    const isDawn = stoneDef.id === 'dawn_stone' && ['281', '361'].includes(pType);
    const isShiny = stoneDef.id === 'shiny_stone' && ['176', '315', '572', '670'].includes(pType);
    const isIce = stoneDef.id === 'ice_stone' && ['27', '37'].includes(pType);
    const isMetalCoat = stoneDef.id === 'metal_coat' && ['95', '123'].includes(pType);
    const isKingsRock = stoneDef.id === 'kings_rock' && ['61', '79'].includes(pType);
    const isDragonScale = stoneDef.id === 'dragon_scale' && ['117'].includes(pType);
    const isUpGrade = stoneDef.id === 'up_grade' && ['137'].includes(pType);

    if (isWater || isFire || isThunder || isLeaf || isMoon || isSun || isDusk || isDawn || isShiny || isIce || isMetalCoat || isKingsRock || isDragonScale || isUpGrade) {
      nextType = String(pDef.nextEvo);
    }
  }

  if (!nextType) {
    const msg = `${pDef.name} cannot evolve using ${stoneDef.name}!`;
    if (ui.showToast) ui.showToast(msg, 'warning');
    else alert(msg);
    return false;
  }

  const nextDef = (typeof PIECES !== 'undefined') ? PIECES[nextType] : null;
  const newName = nextDef ? nextDef.name : `Unit #${nextType}`;

  if (typeof ui.triggerInstantEvolution === 'function') {
    ui.triggerInstantEvolution(pieceOrItem, nextType, stoneDef.name);
  } else {
    pieceOrItem.type = nextType;
    if (ui.addLog) ui.addLog(`✨ Used [${stoneDef.name}]! ${pDef.name} evolved into ${newName}!`);
  }

  return true;
}
if (typeof window !== 'undefined') {
  window.castEvolutionStone = castEvolutionStone;
}

// =========================================================================
// TALISMAN SYSTEM CONTROLLER
// =========================================================================

const TalismanSystem = {
  /**
   * Danh sách toàn bộ file talisman mặc định trong js/talismans/
   */
  knownDefaultTalismanFiles: [
    // Đá tiến hóa & Consumables
    'fire_stone.js', 'water_stone.js', 'thunder_stone.js', 'leaf_stone.js',
    'moon_stone.js', 'sun_stone.js', 'dusk_stone.js', 'dawn_stone.js',
    'shiny_stone.js', 'ice_stone.js', 'metal_coat.js', 'kings_rock.js',
    'dragon_scale.js', 'up_grade.js',
    // Đá Mega (Held items, tốn 1 slot)
    'mega_bracelet.js', 'mega_ring.js', 'charizardite_x.js', 'charizardite_y.js',
    'blastoisinite.js', 'venusaurite.js', 'gengarite.js', 'mewtwonite_x.js',
    'mewtwonite_y.js', 'salamencite.js', 'metagrossite.js', 'aggronite.js', 'scizorite.js',
    // Trang bị chiến đấu (Battle Held items)
    'leftovers.js', 'choice_band.js', 'choice_specs.js', 'choice_scarf.js',
    'focus_sash.js', 'focus_band.js', 'rocky_helmet.js', 'life_orb.js',
    'expert_belt.js', 'quick_claw.js', 'assault_vest.js', 'shell_bell.js',
    'scope_lens.js', 'dragon_fang.js', 'iron_plate.js', 'razor_claw.js',
    'rainbow_wing.js', 'roller_skates.js', 'black_belt.js', 'exp_share.js', 'amulet_coin.js',
    'muscle_band.js', 'wise_glasses.js', 'eviolite.js', 'sitrus_berry.js',
    'lum_berry.js', 'bright_powder.js', 'metronome.js', 'big_root.js',
    'air_balloon.js', 'red_card.js', 'protective_pads.js', 'weakness_policy.js',
    'safety_goggles.js', 'shed_shell.js', 'charcoal.js', 'mystic_water.js',
    'eject_button.js', 'destiny_knot.js', 'toxic_orb.js', 'flame_orb.js',
    'sticky_barb.js', 'float_stone.js', 'starf_berry.js', 'custap_berry.js',
    'smoke_ball.js', 'iron_ball.js', 'soothe_bell.js', 'ring_target.js',
    // 18 Ngọc Nguyên Tố (Type Gems - Đổi hệ thứ 2 cho Pokémon)
    'normal_gem.js', 'fire_gem.js', 'water_gem.js', 'grass_gem.js',
    'electric_gem.js', 'ice_gem.js', 'fighting_gem.js', 'poison_gem.js',
    'ground_gem.js', 'flying_gem.js', 'psychic_gem.js', 'bug_gem.js',
    'rock_gem.js', 'ghost_gem.js', 'dragon_gem.js', 'steel_gem.js',
    'dark_gem.js', 'fairy_gem.js'
  ],

  /**
   * Quét và nạp toàn bộ talisman từ thư mục js/talismans/
   */
  async loadAllTalismansFromDisk() {
    let fileList = [];

    // 1. Electron IPC: listTalismanFiles
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.listTalismanFiles === 'function') {
      try {
        const res = await window.electronAPI.listTalismanFiles();
        if (res && res.success && Array.isArray(res.files)) {
          fileList = res.files;
        }
      } catch (err) {}
    }

    // 2. Dev server API: /api/list-talismans
    if (fileList.length === 0 && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/list-talismans?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.files)) {
            fileList = data.files;
          }
        }
      } catch (err) {}
    }

    // 3. Fallback danh sách mặc định
    for (const f of this.knownDefaultTalismanFiles) {
      if (!fileList.includes(f)) fileList.push(f);
    }

    // Nạp từng file
    for (const fileName of fileList) {
      try {
        await this.loadTalismanFile(fileName);
      } catch (e) {
        console.warn(`Lỗi nạp file talisman ${fileName}:`, e);
      }
    }

    this.applyAliases();
  },

  /**
   * Nạp nội dung một file talisman cụ thể từ js/talismans/<fileName>
   */
  async loadTalismanFile(fileName) {
    let code = null;

    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.readTalismanFile === 'function') {
      try {
        const res = await window.electronAPI.readTalismanFile(fileName);
        if (res && res.success && res.content) {
          code = res.content;
        }
      } catch (e) {}
    }

    // 2. Dev server API
    if (!code && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/read-talisman?filename=${encodeURIComponent(fileName)}&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.content) {
            code = data.content;
          }
        }
      } catch (e) {}
    }

    // 3. Static fetch
    if (!code && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`js/talismans/${fileName}?_t=${Date.now()}`);
        if (res.ok) {
          code = await res.text();
        }
      } catch (e) {}
    }

    if (code) {
      try {
        const fn = new Function('TALISMANS', 'getItemIcon', 'castEvolutionStone', code);
        fn(TALISMANS, getItemIcon, castEvolutionStone);
      } catch (err) {
        // Fallback eval
        try {
          eval(code);
        } catch (e) {
          console.error(`Failed to execute talisman code ${fileName}:`, e);
        }
      }
    }
  },

  /**
   * Áp dụng aliases tương thích ngược cho dữ liệu lưu cũ
   */
  applyAliases() {
    if (TALISMANS['rocky_helmet']) TALISMANS['spike_shield'] = TALISMANS['rocky_helmet'];
    if (TALISMANS['rainbow_wing']) TALISMANS['phoenix_feather'] = TALISMANS['rainbow_wing'];
    if (TALISMANS['dragon_fang']) TALISMANS['vampiric_fang'] = TALISMANS['dragon_fang'];
    if (TALISMANS['iron_plate']) TALISMANS['royal_aegis'] = TALISMANS['iron_plate'];
    if (TALISMANS['razor_claw']) TALISMANS['cross_cleave'] = TALISMANS['razor_claw'];
    if (TALISMANS['roller_skates']) TALISMANS['swift_boots'] = TALISMANS['roller_skates'];
    if (TALISMANS['black_belt']) TALISMANS['berserker_axe'] = TALISMANS['black_belt'];
    if (TALISMANS['mega_bracelet']) TALISMANS['mega_stone'] = TALISMANS['mega_bracelet'];
    if (TALISMANS['charizardite_x']) TALISMANS['charizardite'] = TALISMANS['charizardite_x'];
    if (TALISMANS['mewtwonite_x']) TALISMANS['mewtwonite'] = TALISMANS['mewtwonite_x'];
  },

  get(id) {
    return TALISMANS[id];
  },

  getAllKeys() {
    // Chỉ trả về các item chính thống (loại bỏ alias để shop hiển thị chuẩn 1-1)
    const aliases = ['spike_shield', 'phoenix_feather', 'vampiric_fang', 'royal_aegis', 'cross_cleave', 'swift_boots', 'berserker_axe', 'mega_stone', 'charizardite', 'mewtwonite'];
    return Object.keys(TALISMANS).filter(k => !aliases.includes(k));
  },

  isApplicable(talismanId, pieceType) {
    const t = TALISMANS[talismanId];
    if (!t) return false;
    if (t.targetTypes === 'all') return true;
    return Array.isArray(t.targetTypes) && t.targetTypes.includes(String(pieceType));
  },

  isNotFullyEvolved(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[String(piece.type)] : null;
    return Boolean(pDef && pDef.nextEvo);
  },

  getBonusAtk(piece) {
    if (!piece || !piece.talismans) return 0;
    let sum = 0;
    for (const tid of piece.talismans) {
      const t = TALISMANS[tid];
      if (t && t.bonusAtk) sum += t.bonusAtk;
    }
    if (piece._battleBonusAtk) sum += piece._battleBonusAtk;
    return sum;
  },

  getBonusHp(piece) {
    if (!piece || !piece.talismans) return 0;
    let sum = 0;
    for (const tid of piece.talismans) {
      const t = TALISMANS[tid];
      if (t && t.bonusHp) sum += t.bonusHp;
      if (tid === 'eviolite' && this.isNotFullyEvolved(piece)) {
        sum += 12; // Eviolite extra +12 HP if capable of evolving
      }
    }
    return sum;
  },

  getBonusSpeed(piece) {
    if (!piece || !piece.talismans) return 0;
    let sum = 0;
    for (const tid of piece.talismans) {
      const t = TALISMANS[tid];
      if (t && typeof t.bonusSpeed === 'number') {
        sum += t.bonusSpeed;
      }
    }
    return sum;
  },

  getSpeedBonus(piece) {
    return this.getBonusSpeed(piece);
  },

  hasStrikeFirst(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => {
      const t = TALISMANS[tid];
      return t && (t.hasStrikeFirst || t.strikeFirst);
    });
  },

  getDmgReduction(piece) {
    if (!piece || !piece.talismans) return 0;
    let red = 0;
    for (const tid of piece.talismans) {
      const t = TALISMANS[tid];
      if (t && t.dmgReduction) {
        let val = t.dmgReduction;
        if (tid === 'eviolite' && this.isNotFullyEvolved(piece)) {
          val += 2; // Eviolite extra +2 reduction (total 4) if capable of evolving
        }
        red = Math.max(red, val);
      }
    }
    return red;
  },

  hasDivineShield(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => tid === 'iron_plate' || tid === 'royal_aegis');
  },

  getTypeOverrideFromTalismans(talismans) {
    if (!Array.isArray(talismans) || talismans.length === 0) return null;
    for (let i = talismans.length - 1; i >= 0; i--) {
      const tid = talismans[i];
      const t = TALISMANS[tid];
      if (t && t.overrideElement2) {
        return String(t.overrideElement2).toLowerCase();
      }
    }
    return null;
  },

  isTypeGem(talismanId) {
    const t = TALISMANS[talismanId];
    return Boolean(t && t.overrideElement2);
  },

  hasSplash(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => tid === 'razor_claw' || tid === 'cross_cleave');
  },

  hasLifesteal(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => TALISMANS[tid]?.hasLifesteal);
  },

  hasRevive(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => tid === 'rainbow_wing' || tid === 'phoenix_feather');
  },

  hasThorns(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => (TALISMANS[tid]?.thornsDamage || TALISMANS[tid]?.hasRockyHelmet));
  },

  getThornsDmg(piece, incomingDmg = 0) {
    if (!piece || !piece.talismans) return 0;
    let sum = 0;
    for (const tid of piece.talismans) {
      const t = TALISMANS[tid];
      if (t && t.thornsDamage) sum += t.thornsDamage;
      else if (t && t.hasRockyHelmet && incomingDmg > 0) sum += Math.max(3, Math.round(incomingDmg * 0.20));
    }
    return sum;
  },

  hasLeftovers(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('leftovers');
  },

  hasFocusSash(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('focus_sash');
  },

  hasFocusBand(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('focus_band');
  },

  hasLifeOrb(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('life_orb');
  },

  hasScopeLens(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('scope_lens');
  },

  hasQuickClaw(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('quick_claw');
  },

  hasBlackBelt(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('black_belt') || piece.talismans.includes('berserker_axe');
  },

  hasExpertBelt(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('expert_belt');
  },

  hasChoiceSpecs(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('choice_specs');
  },

  hasDragonFang(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('dragon_fang') || piece.talismans.includes('vampiric_fang');
  },

  hasMuscleBand(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('muscle_band');
  },

  hasWiseGlasses(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('wise_glasses');
  },

  hasEviolite(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('eviolite');
  },

  hasSitrusBerry(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('sitrus_berry');
  },

  hasLumBerry(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('lum_berry');
  },

  hasBrightPowder(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('bright_powder');
  },

  hasMetronome(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('metronome');
  },

  hasBigRoot(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('big_root');
  },

  hasAirBalloon(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('air_balloon');
  },

  hasRedCard(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('red_card');
  },

  hasProtectivePads(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('protective_pads');
  },

  hasWeaknessPolicy(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('weakness_policy');
  },

  hasSafetyGoggles(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('safety_goggles');
  },

  hasShedShell(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('shed_shell');
  },

  hasCharcoal(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('charcoal');
  },

  hasMysticWater(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('mystic_water');
  },

  hasEjectButton(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('eject_button');
  },

  hasDestinyKnot(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('destiny_knot');
  },

  hasToxicOrb(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('toxic_orb');
  },

  hasFlameOrb(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('flame_orb');
  },

  hasStickyBarb(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('sticky_barb');
  },

  hasFloatStone(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('float_stone');
  },

  hasStarfBerry(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('starf_berry');
  },

  hasCustapBerry(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('custap_berry');
  },

  hasSmokeBall(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('smoke_ball');
  },

  hasIronBall(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('iron_ball');
  },

  hasSootheBell(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('soothe_bell');
  },

  hasRingTarget(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.includes('ring_target');
  },

  isMegaEvolved(piece) {
    if (!piece || !piece.talismans) return false;
    return piece.talismans.some(tid => TALISMANS[tid]?.isMega);
  },

  extendMoves(game, i, r, c, p, baseMoves, push, slide) {
    if (!p || !p.talismans || p.talismans.length === 0) return baseMoves;
    const moves = [...baseMoves];
    for (const tid of p.talismans) {
      const t = TALISMANS[tid];
      if (t && typeof t.extendMoves === 'function') {
        t.extendMoves(game, i, r, c, p, moves, push, slide);
      }
      // Roller Skates agility: allows 1-step omnidirectional move (8 directions)
      if (tid === 'roller_skates' || tid === 'swift_boots') {
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (game.inBounds(nr, nc)) {
            const sq = game.idx(nr, nc);
            const target = game.board[sq];
            if (!target || target.color !== p.color) {
              if (!moves.includes(sq)) moves.push(sq);
            }
          }
        }
      }
      // Float Stone: allows jumping directly over other pieces like a Knight!
      if (tid === 'float_stone') {
        const knightJumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (const [dr, dc] of knightJumps) {
          const nr = r + dr, nc = c + dc;
          if (game.inBounds(nr, nc)) {
            const sq = game.idx(nr, nc);
            const target = game.board[sq];
            if (!target || target.color !== p.color) {
              if (!moves.includes(sq)) moves.push(sq);
            }
          }
        }
      }
    }
    return moves;
  }
};

// Tự động kích hoạt nạp từ đĩa khi khởi chạy
if (typeof window !== 'undefined') {
  window.TalismanSystem = TalismanSystem;
  TalismanSystem.loadAllTalismansFromDisk();
}

if (typeof module !== 'undefined') {
  module.exports = { TALISMANS, TalismanSystem };
}
