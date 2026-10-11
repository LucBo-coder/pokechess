// =============================================
// CHESS+ ROGUELIKE: TFT TYPE SYNERGY SYSTEM
// 18 Elements, Threshold Tiers, Stat Buffs & Combat Effects
// (100% Pure English, Tactical Turn-Based System)
// =============================================

'use strict';

const SYNERGY_DEFS = {
  // --- 1. WATER (155 Pokémon: Largest Roster) -> [3, 6, 9, 12] ---
  water: {
    id: 'water',
    name: 'Water',
    icon: 'assets/elements/water.png',
    color: '#3498db',
    tiers: [
      {
        count: 3,
        level: 1,
        desc: 'Water Pokémon gain +15 Max HP and regenerate 3 HP at the end of each round.',
        selfHp: 15,
        regen: 3
      },
      {
        count: 6,
        level: 2,
        desc: 'Water Pokémon gain +30 Max HP and regenerate 6 HP/round. All allies gain +15 Max HP.',
        selfHp: 30,
        teamHp: 15,
        regen: 6
      },
      {
        count: 9,
        level: 3,
        desc: 'All team Pokémon gain +45 Max HP and regenerate 10 HP at the end of each round.',
        teamHp: 45,
        teamRegen: 10
      },
      {
        count: 12,
        level: 4,
        desc: 'Tidal Deluge: All team Pokémon gain +70 Max HP and regenerate 16 HP at the end of each round.',
        teamHp: 70,
        teamRegen: 16
      }
    ]
  },

  // --- 2. GRASS (128 Pokémon: Very Large Roster) -> [3, 6, 9, 12] ---
  grass: {
    id: 'grass',
    name: 'Grass',
    icon: 'assets/elements/grass.png',
    color: '#2ecc71',
    tiers: [
      {
        count: 3,
        level: 1,
        desc: 'Grass Pokémon gain 12% Lifesteal from attack damage.',
        selfLifesteal: 0.12
      },
      {
        count: 6,
        level: 2,
        desc: 'Grass Pokémon gain 22% Lifesteal and +15 Max HP. Allies gain 8% Lifesteal.',
        selfLifesteal: 0.22,
        selfHp: 15,
        teamLifesteal: 0.08
      },
      {
        count: 9,
        level: 3,
        desc: 'All team Pokémon gain 25% Lifesteal and +30 Max HP.',
        teamLifesteal: 0.25,
        teamHp: 30
      },
      {
        count: 12,
        level: 4,
        desc: 'Eternal Bloom: All team Pokémon gain 38% Lifesteal, +50 Max HP, and heal +6 HP when moving.',
        teamLifesteal: 0.38,
        teamHp: 50,
        teamMoveHeal: 6
      }
    ]
  },

  // --- 3. NORMAL (131 Pokémon: Very Large Roster) -> [3, 6, 9, 12] ---
  normal: {
    id: 'normal',
    name: 'Normal',
    icon: 'assets/elements/normal.png',
    color: '#c8d6e5',
    tiers: [
      {
        count: 3,
        level: 1,
        desc: 'Normal Pokémon gain +4 ATK and +15 Max HP.',
        selfAtk: 4,
        selfHp: 15
      },
      {
        count: 6,
        level: 2,
        desc: 'Normal Pokémon gain +8 ATK and +28 Max HP. Gain +1 Gold upon stage victory.',
        selfAtk: 8,
        selfHp: 28,
        bonusGoldWin: 1
      },
      {
        count: 9,
        level: 3,
        desc: 'All team Pokémon gain +12 ATK, +45 Max HP, and +2 Gold upon stage victory.',
        teamAtk: 12,
        teamHp: 45,
        bonusGoldWin: 2
      },
      {
        count: 12,
        level: 4,
        desc: 'Boundless Potential: All team Pokémon gain +18 ATK, +65 Max HP, and +3 Gold upon stage victory.',
        teamAtk: 18,
        teamHp: 65,
        bonusGoldWin: 3
      }
    ]
  },

  // --- 4. FLYING (111 Pokémon: Very Large Roster) -> [3, 6, 9, 12] ---
  flying: {
    id: 'flying',
    name: 'Flying',
    icon: 'assets/elements/flying.png',
    color: '#81ecec',
    tiers: [
      {
        count: 3,
        level: 1,
        desc: 'Tailwind: Flying Pokémon gain +20 SPD and 15% Evasion (chance to dodge enemy attacks).',
        selfSpd: 20,
        selfDodge: 0.15
      },
      {
        count: 6,
        level: 2,
        desc: 'Tailwind Gale: Flying Pokémon gain +35 SPD, 25% Evasion; allies gain +15 SPD, 10% Evasion.',
        selfSpd: 35,
        selfDodge: 0.25,
        teamSpd: 15,
        teamDodge: 0.10
      },
      {
        count: 9,
        level: 3,
        desc: 'All team Pokémon gain +45 SPD, 30% Evasion, and +10 Max HP.',
        teamSpd: 45,
        teamDodge: 0.30,
        teamHp: 10
      },
      {
        count: 12,
        level: 4,
        desc: 'Sky Sovereignty: All team Pokémon gain +60 SPD, 40% Evasion, and +25 Max HP.',
        teamSpd: 60,
        teamDodge: 0.40,
        teamHp: 25
      }
    ]
  },

  // --- 5. PSYCHIC (105 Pokémon: Large Roster) -> [4, 8, 12] ---
  psychic: {
    id: 'psychic',
    name: 'Psychic',
    icon: 'assets/elements/psychic.png',
    color: '#fd79a8',
    tiers: [
      {
        count: 4,
        level: 1,
        desc: 'Psychic Pokémon gain 25% Critical Strike chance (deals x1.5 damage).',
        selfCrit: 0.25,
        critMult: 1.5
      },
      {
        count: 8,
        level: 2,
        desc: 'Psychic Pokémon gain 45% Crit (x1.75 dmg); other allies gain 20% Crit (x1.5 dmg).',
        selfCrit: 0.45,
        critMult: 1.75,
        teamCrit: 0.20,
        teamCritMult: 1.5
      },
      {
        count: 12,
        level: 3,
        desc: 'Telekinetic Mastery: All team Pokémon gain 60% Critical Strike chance (deals x2.0 damage).',
        teamCrit: 0.60,
        teamCritMult: 2.0
      }
    ]
  },

  // --- 6. BUG (93 Pokémon: Swarm Identity) -> [2, 3, 4, 5, 6] ---
  bug: {
    id: 'bug',
    name: 'Bug',
    icon: 'assets/elements/bug.png',
    color: '#badc58',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Bug Pokémon gain +4 ATK and +10 Max HP.',
        selfAtk: 4,
        selfHp: 10
      },
      {
        count: 3,
        level: 2,
        desc: 'Bug Pokémon gain +7 ATK, +18 Max HP, and require 1 fewer battle to evolve.',
        selfAtk: 7,
        selfHp: 18,
        evoDiscount: 1
      },
      {
        count: 4,
        level: 3,
        desc: 'Bug Pokémon gain +10 ATK, +26 Max HP, and heal 4 HP whenever they move.',
        selfAtk: 10,
        selfHp: 26,
        swarmMoveHeal: 4,
        evoDiscount: 1
      },
      {
        count: 5,
        level: 4,
        desc: 'Bug Pokémon gain +14 ATK, +36 Max HP, and heal 7 HP whenever they move.',
        selfAtk: 14,
        selfHp: 36,
        swarmMoveHeal: 7,
        evoDiscount: 1
      },
      {
        count: 6,
        level: 5,
        desc: 'Swarm Overlord: All team Pokémon gain +18 ATK, +48 Max HP, heal 8 HP on move, and evolve 1 battle faster.',
        teamAtk: 18,
        teamHp: 48,
        swarmMoveHeal: 8,
        evoDiscount: 1
      }
    ]
  },

  // --- 7. DRAGON (72 Pokémon: Ancient Might) -> [2, 3, 4, 5, 6] ---
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    icon: 'assets/elements/dragon.png',
    color: '#a29bfe',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Dragon Pokémon gain +6 ATK and pierce 10% damage reduction.',
        selfAtk: 6,
        armorPierce: 0.10
      },
      {
        count: 3,
        level: 2,
        desc: 'Dragon Pokémon gain +10 ATK, +18 Max HP, and pierce 15% damage reduction.',
        selfAtk: 10,
        selfHp: 18,
        armorPierce: 0.15
      },
      {
        count: 4,
        level: 3,
        desc: 'Dragon Pokémon gain +15 ATK, +30 Max HP, and pierce 20% damage reduction.',
        selfAtk: 15,
        selfHp: 30,
        armorPierce: 0.20
      },
      {
        count: 5,
        level: 4,
        desc: 'All team Pokémon gain +18 ATK, +40 Max HP, and pierce 25% damage reduction.',
        teamAtk: 18,
        teamHp: 40,
        teamArmorPierce: 0.25
      },
      {
        count: 6,
        level: 5,
        desc: 'Apex Wyrm: All team Pokémon gain +25 ATK, +60 Max HP, and pierce 35% damage reduction.',
        teamAtk: 25,
        teamHp: 60,
        teamArmorPierce: 0.35
      }
    ]
  },

  // --- 8. POISON (85 Pokémon) -> [2, 4, 6, 8] ---
  poison: {
    id: 'poison',
    name: 'Poison',
    icon: 'assets/elements/poison.png',
    color: '#9b59b6',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Poison attacks have 35% chance to Venom (inflicts -4 HP at round end, -3 enemy ATK).',
        poisonChance: 0.35,
        poisonDot: 4,
        poisonDebuff: 3
      },
      {
        count: 4,
        level: 2,
        desc: 'Poison attacks have 65% chance to Venom (inflicts -7 HP at round end, -5 enemy ATK).',
        poisonChance: 0.65,
        poisonDot: 7,
        poisonDebuff: 5
      },
      {
        count: 6,
        level: 3,
        desc: 'All team Pokémon attacks have 80% chance to Venom (-11 HP/round, -8 enemy ATK). Allies gain +15 Max HP.',
        poisonChance: 0.80,
        poisonDot: 11,
        poisonDebuff: 8,
        teamHp: 15
      },
      {
        count: 8,
        level: 4,
        desc: 'Lethal Toxicity: All attacks 100% Venom (-16 HP/round, -12 enemy ATK); poisoned units take +25% damage.',
        poisonChance: 1.0,
        poisonDot: 16,
        poisonDebuff: 12,
        poisonAmp: 0.25,
        teamHp: 25
      }
    ]
  },

  // --- 9. FIRE (83 Pokémon) -> [2, 4, 6, 8] ---
  fire: {
    id: 'fire',
    name: 'Fire',
    icon: 'assets/elements/fire.png',
    color: '#e74c3c',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Fire Pokémon gain +5 ATK. Attacks have 30% chance to Burn (-4 HP at end of round).',
        selfAtk: 5,
        burnChance: 0.30,
        burnDmg: 4
      },
      {
        count: 4,
        level: 2,
        desc: 'Fire Pokémon gain +10 ATK. Attacks have 60% chance to Burn (-8 HP at end of round).',
        selfAtk: 10,
        burnChance: 0.60,
        burnDmg: 8
      },
      {
        count: 6,
        level: 3,
        desc: 'All team Pokémon gain +12 ATK. Attacks have 85% chance to Burn (-12 HP at end of round).',
        teamAtk: 12,
        burnChance: 0.85,
        burnDmg: 12
      },
      {
        count: 8,
        level: 4,
        desc: 'Inferno Cataclysm: All team Pokémon gain +20 ATK. Attacks 100% Burn (-18 HP at end of round).',
        teamAtk: 20,
        burnChance: 1.0,
        burnDmg: 18
      }
    ]
  },

  // --- 10. GROUND (75 Pokémon) -> [2, 4, 6, 8] ---
  ground: {
    id: 'ground',
    name: 'Ground',
    icon: 'assets/elements/ground.png',
    color: '#d35400',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Ground Pokémon gain +15 Max HP and reflect 4 Thorns damage when struck.',
        selfHp: 15,
        selfThorns: 4
      },
      {
        count: 4,
        level: 2,
        desc: 'Ground Pokémon gain +30 Max HP and reflect 8 Thorns damage when struck.',
        selfHp: 30,
        selfThorns: 8
      },
      {
        count: 6,
        level: 3,
        desc: 'All team Pokémon gain +40 Max HP and reflect 11 Thorns damage when struck.',
        teamHp: 40,
        teamThorns: 11
      },
      {
        count: 8,
        level: 4,
        desc: 'Earth Colossus: All team Pokémon gain +65 Max HP and reflect 16 Thorns damage when struck.',
        teamHp: 65,
        teamThorns: 16
      }
    ]
  },

  // --- 11. FIGHTING (74 Pokémon) -> [2, 4, 6, 8] ---
  fighting: {
    id: 'fighting',
    name: 'Fighting',
    icon: 'assets/elements/fighting.png',
    color: '#e67e22',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Fighting Pokémon gain +5 ATK and deal 15% Splash damage to adjacent squares.',
        selfAtk: 5,
        selfSplash: 0.15
      },
      {
        count: 4,
        level: 2,
        desc: 'Fighting Pokémon gain +10 ATK and deal 25% Splash damage to adjacent squares.',
        selfAtk: 10,
        selfSplash: 0.25
      },
      {
        count: 6,
        level: 3,
        desc: 'All team Pokémon gain +12 ATK and deal 30% Splash damage to adjacent squares.',
        teamAtk: 12,
        teamSplash: 0.30
      },
      {
        count: 8,
        level: 4,
        desc: 'Grandmaster Dojo: All team Pokémon gain +20 ATK and deal 42% Splash damage to adjacent squares.',
        teamAtk: 20,
        teamSplash: 0.42
      }
    ]
  },

  // --- 12. ROCK (74 Pokémon) -> [2, 4, 6, 8] ---
  rock: {
    id: 'rock',
    name: 'Rock',
    icon: 'assets/elements/rock.png',
    color: '#b2bec3',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Rock Pokémon start battle with Stone Shield (blocks 1st attack) and reduce incoming dmg by 3.',
        selfShield: true,
        selfDmgReduction: 3
      },
      {
        count: 4,
        level: 2,
        desc: 'Rock Pokémon Stone Shield blocks 1st attack & reduce dmg by 6; allies reduce dmg by 2.',
        selfShield: true,
        selfDmgReduction: 6,
        teamDmgReduction: 2
      },
      {
        count: 6,
        level: 3,
        desc: 'All team Pokémon gain Stone Shield (blocks 1st attack) and reduce incoming dmg by 6.',
        teamShield: true,
        teamDmgReduction: 6
      },
      {
        count: 8,
        level: 4,
        desc: 'Mountain Fortress: All team Pokémon block first 2 incoming attacks and reduce incoming dmg by 10.',
        teamShieldTwo: true,
        teamShield: true,
        teamDmgReduction: 10
      }
    ]
  },

  // --- 13. ELECTRIC (69 Pokémon) -> [2, 4, 6] ---
  electric: {
    id: 'electric',
    name: 'Electric',
    icon: 'assets/elements/electric.png',
    color: '#f1c40f',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Electric Pokémon gain +20 SPD, +4 ATK, and bonus damage = 5% of Speed. 20% Paralyze chance.',
        selfSpd: 20,
        selfAtk: 4,
        speedDmgRatio: 0.05,
        paralyzeChance: 0.20
      },
      {
        count: 4,
        level: 2,
        desc: 'Electric Pokémon gain +40 SPD, +9 ATK, and bonus damage = 10% of Speed (allies +15 SPD). 40% Paralyze.',
        selfSpd: 40,
        selfAtk: 9,
        teamSpd: 15,
        speedDmgRatio: 0.10,
        paralyzeChance: 0.40
      },
      {
        count: 6,
        level: 3,
        desc: 'High Voltage: All team Pokémon gain +60 SPD, +14 ATK, and bonus damage = 15% of Speed. 50% Paralyze.',
        teamSpd: 60,
        teamAtk: 14,
        speedDmgRatio: 0.15,
        paralyzeChance: 0.50
      }
    ]
  },

  // --- 14. DARK (69 Pokémon) -> [2, 4, 6] ---
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: 'assets/elements/dark.png',
    color: '#636e72',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Dark Pokémon deal +20% bonus damage when attacking from the flank or rear.',
        flankBonus: 0.20
      },
      {
        count: 4,
        level: 2,
        desc: 'Dark Pokémon deal +35% flank bonus damage and +20% bonus damage to targets below 50% HP.',
        flankBonus: 0.35,
        executeBonus: 0.20
      },
      {
        count: 6,
        level: 3,
        desc: 'Nightfall Assassin: All team Pokémon deal +30% flank damage and +35% bonus damage to targets below 50% HP.',
        flankBonus: 0.30,
        teamExecuteBonus: 0.35
      }
    ]
  },

  // --- 15. STEEL (68 Pokémon) -> [2, 4, 6] ---
  steel: {
    id: 'steel',
    name: 'Steel',
    icon: 'assets/elements/steel.png',
    color: '#dfe6e9',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Steel Pokémon reduce all incoming damage by 15%.',
        selfPercentDmgRed: 0.15
      },
      {
        count: 4,
        level: 2,
        desc: 'Steel Pokémon reduce damage by 25%; all other allies reduce damage by 10%.',
        selfPercentDmgRed: 0.25,
        teamPercentDmgRed: 0.10
      },
      {
        count: 6,
        level: 3,
        desc: 'Titanium Bulwark: All team Pokémon reduce all incoming damage by 30%.',
        teamPercentDmgRed: 0.30
      }
    ]
  },

  // --- 16. GHOST (66 Pokémon) -> [2, 4, 6] ---
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    icon: 'assets/elements/ghost.png',
    color: '#6c5ce7',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Ghost Pokémon dodge the first attack directed at them.',
        selfFirstDodge: true
      },
      {
        count: 4,
        level: 2,
        desc: 'Ghost Pokémon dodge 1st attack. When any Ghost falls, the attacker suffers 25% of current HP as curse.',
        selfFirstDodge: true,
        deathCurse: 0.25
      },
      {
        count: 6,
        level: 3,
        desc: 'Phantom Realm: All team Pokémon dodge 1st attack. When any ally falls, attacker loses 35% of max HP.',
        teamFirstDodge: true,
        deathCurse: 0.35
      }
    ]
  },

  // --- 17. FAIRY (64 Pokémon) -> [2, 4, 6] ---
  fairy: {
    id: 'fairy',
    name: 'Fairy',
    icon: 'assets/elements/fairy.png',
    color: '#ff9ff3',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Fairy attacks restore 6 HP to the lowest-health living ally.',
        allyHealOnAttack: 6
      },
      {
        count: 4,
        level: 2,
        desc: 'Fairy attacks restore 12 HP to lowest-health ally; all allies gain +5 ATK.',
        allyHealOnAttack: 12,
        teamAtk: 5
      },
      {
        count: 6,
        level: 3,
        desc: 'Moonlight Serenade: All ally attacks restore 14 HP to lowest ally; all allies gain +10 ATK and +15 Max HP.',
        teamHealOnAttack: 14,
        teamAtk: 10,
        teamHp: 15
      }
    ]
  },

  // --- 18. ICE (48 Pokémon: Smallest Roster) -> [2, 4, 6] ---
  ice: {
    id: 'ice',
    name: 'Ice',
    icon: 'assets/elements/ice.png',
    color: '#00d2d3',
    tiers: [
      {
        count: 2,
        level: 1,
        desc: 'Ice Pokémon reduce damage by 4. Attacks inflict Chilled (-4 enemy ATK).',
        selfDmgReduction: 4,
        chillAtkDebuff: 4
      },
      {
        count: 4,
        level: 2,
        desc: 'Ice Pokémon reduce damage by 7. Attackers have 25% chance to be Frozen for 1 round.',
        selfDmgReduction: 7,
        freezeThornsChance: 0.25
      },
      {
        count: 6,
        level: 3,
        desc: 'Glacial Absolute: All team Pokémon reduce damage by 10. Attackers have 40% chance to be Frozen for 1 round.',
        teamDmgReduction: 10,
        freezeThornsChance: 0.40
      }
    ]
  }
};

const SynergySystem = {
  getDefs() {
    return SYNERGY_DEFS;
  },

  /**
   * Helper to extract elements for a piece
   */
  getPieceElements(pieceOrInfo) {
    if (!pieceOrInfo) return ['normal'];
    if (typeof TypeSystem !== 'undefined' && typeof TypeSystem.getEffectivePieceElements === 'function') {
      const { element: t1, element2: t2 } = TypeSystem.getEffectivePieceElements(pieceOrInfo);
      return t2 ? [t1, t2] : [t1];
    }
    const pInfo = (typeof PIECES !== 'undefined' && pieceOrInfo.type && PIECES[pieceOrInfo.type]) 
      ? PIECES[pieceOrInfo.type] 
      : pieceOrInfo;
    const t1 = (pInfo.element || 'normal').toLowerCase();
    const t2 = pInfo.element2 ? pInfo.element2.toLowerCase() : null;
    return t2 ? [t1, t2] : [t1];
  },

  /**
   * Calculate all active synergies based on player's placed units on board
   */
  getActiveSynergies(ui) {
    if (!ui || !ui.placedPieces) return {};

    const counts = {};
    const seenSpeciesPerType = {};
    const playerColor = (typeof W !== 'undefined' ? W : 'w');

    for (const placed of ui.placedPieces) {
      if (placed.sq === undefined || placed.sq < 0) continue;
      const boardPiece = (ui.game && ui.game.board) ? ui.game.board[placed.sq] : null;
      if (boardPiece && boardPiece.color && boardPiece.color !== playerColor) continue;

      const pieceType = (boardPiece && boardPiece.type) || placed.type;
      if (!pieceType) continue;

      const piece = boardPiece || placed || { color: playerColor, type: pieceType };
      const pInfo = (typeof PIECES !== 'undefined' && PIECES[pieceType]) ? PIECES[pieceType] : piece;
      const elements = this.getPieceElements(piece);

      for (const t of elements) {
        if (!SYNERGY_DEFS[t]) continue;
        if (!seenSpeciesPerType[t]) seenSpeciesPerType[t] = new Set();
        if (!counts[t]) counts[t] = { count: 0, pieces: [] };

        // Unique champion/species counts towards trait (TFT rule)
        if (!seenSpeciesPerType[t].has(pieceType)) {
          seenSpeciesPerType[t].add(pieceType);
          counts[t].count++;
        }
        counts[t].pieces.push({ piece, info: pInfo });
      }
    }

    const result = {};
    for (const [tKey, def] of Object.entries(SYNERGY_DEFS)) {
      const data = counts[tKey] || { count: 0, pieces: [] };
      let activeTier = null;
      for (const tier of def.tiers) {
        if (data.count >= tier.count) {
          activeTier = tier;
        }
      }
      result[tKey] = {
        def,
        count: data.count,
        pieces: data.pieces,
        activeTier,
        isActive: !!activeTier
      };
    }
    return result;
  },

  /**
   * Return total count of currently active synergies
   */
  getActiveCount(ui) {
    const syns = this.getActiveSynergies(ui);
    let count = 0;
    for (const item of Object.values(syns)) {
      if (item.isActive) count++;
    }
    return count;
  },

  /**
   * Stat Bonus: Attack (ATK)
   */
  getBonusAtk(piece, ui) {
    if (!piece || !ui) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    let bonus = 0;

    for (const [tKey, s] of Object.entries(syns)) {
      if (!s.isActive || !s.activeTier) continue;
      if (s.activeTier.teamAtk) {
        bonus += s.activeTier.teamAtk;
      }
      if (elements.includes(tKey) && s.activeTier.selfAtk) {
        bonus += s.activeTier.selfAtk;
      }
    }
    return bonus;
  },

  /**
   * Stat Bonus: HP
   */
  getBonusHp(piece, ui) {
    if (!piece || !ui) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    let bonus = 0;

    for (const [tKey, s] of Object.entries(syns)) {
      if (!s.isActive || !s.activeTier) continue;
      if (s.activeTier.teamHp) {
        bonus += s.activeTier.teamHp;
      }
      if (elements.includes(tKey) && s.activeTier.selfHp) {
        bonus += s.activeTier.selfHp;
      }
    }
    return bonus;
  },

  /**
   * Stat Bonus: Speed (SPD)
   */
  getBonusSpeed(piece, ui) {
    if (!piece || !ui) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    let bonus = 0;

    for (const [tKey, s] of Object.entries(syns)) {
      if (!s.isActive || !s.activeTier) continue;
      if (s.activeTier.teamSpd) {
        bonus += s.activeTier.teamSpd;
      }
      if (elements.includes(tKey) && s.activeTier.selfSpd) {
        bonus += s.activeTier.selfSpd;
      }
    }
    return bonus;
  },

  /**
   * Electric Synergy: Bonus Damage = % of Speed (e.g. 5% / 10% / 15%)
   */
  getSpeedDamageBonus(piece, speed, ui) {
    if (!piece || !ui || !speed) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const electric = syns.electric;
    if (!electric || !electric.isActive || !electric.activeTier) return 0;

    const isElectric = elements.includes('electric');
    // Tier 3 affects entire team, lower tiers affect Electric Pokémon
    if (isElectric || (electric.activeTier.level && electric.activeTier.level >= 3)) {
      const ratio = electric.activeTier.speedDmgRatio || 0.05;
      return Math.round(speed * ratio);
    }
    return 0;
  },

  /**
   * Damage Reduction during Combat
   */
  getDmgReduction(piece, ui, incomingDmg = 0) {
    if (!piece || !ui || piece.color !== W) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    let flatRed = 0;
    let pctRed = 0;

    for (const [tKey, s] of Object.entries(syns)) {
      if (!s.isActive || !s.activeTier) continue;
      if (s.activeTier.teamDmgReduction) flatRed += s.activeTier.teamDmgReduction;
      if (elements.includes(tKey) && s.activeTier.selfDmgReduction) flatRed += s.activeTier.selfDmgReduction;

      if (s.activeTier.teamPercentDmgRed) pctRed = Math.max(pctRed, s.activeTier.teamPercentDmgRed);
      if (elements.includes(tKey) && s.activeTier.selfPercentDmgRed) pctRed = Math.max(pctRed, s.activeTier.selfPercentDmgRed);
    }

    let total = flatRed;
    if (pctRed > 0 && incomingDmg > 0) {
      total += Math.round(incomingDmg * pctRed);
    }
    return total;
  },

  /**
   * Rock Synergy Shield: Block incoming attacks
   */
  hasShield(piece, ui) {
    if (!piece || !ui || piece.color !== (typeof W !== 'undefined' ? W : 'w')) return false;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const rock = syns.rock;
    if (!rock || !rock.isActive || !rock.activeTier) return false;
    if (rock.activeTier.teamShield) return true;
    return elements.includes('rock') && !!rock.activeTier.selfShield;
  },

  /**
   * Flying / Ghost Synergy: Dodge chance
   */
  checkDodge(piece, ui) {
    if (!piece || !ui || piece.color !== (typeof W !== 'undefined' ? W : 'w')) return false;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);

    // Ghost: Dodge first attack
    const ghost = syns.ghost;
    if (ghost && ghost.isActive && ghost.activeTier) {
      if (ghost.activeTier.teamFirstDodge || (elements.includes('ghost') && ghost.activeTier.selfFirstDodge)) {
        if (!piece.ghostDodgeUsed) {
          piece.ghostDodgeUsed = true;
          return true;
        }
      }
    }

    // Flying: Percentage Dodge chance
    const flying = syns.flying;
    if (flying && flying.isActive && flying.activeTier) {
      let chance = 0;
      if (flying.activeTier.teamDodge) chance = flying.activeTier.teamDodge;
      else if (elements.includes('flying') && flying.activeTier.selfDodge) chance = flying.activeTier.selfDodge;

      if (chance > 0 && Math.random() < chance) {
        return true;
      }
    }
    return false;
  },

  /**
   * Ghost Death Curse
   */
  triggerGhostDeathCurse(victim, slayer, ui, slayerSq) {
    if (!victim || !slayer || !ui || victim.color !== (typeof W !== 'undefined' ? W : 'w')) return;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(victim);
    const ghost = syns.ghost;
    if (!ghost || !ghost.isActive || !ghost.activeTier || !ghost.activeTier.deathCurse) return;
    if (ghost.activeTier.teamFirstDodge || elements.includes('ghost')) {
      const sSt = ui.getEffectivePieceStats(slayer);
      const curseDmg = Math.max(8, Math.round(sSt.maxHp * ghost.activeTier.deathCurse));
      if (slayerSq !== undefined && slayerSq >= 0 && ui.pieceHP && ui.pieceHP[slayerSq] !== undefined) {
        ui.pieceHP[slayerSq] = Math.max(0, ui.pieceHP[slayerSq] - curseDmg);
        ui.updatePieceHpDOM(slayerSq, ui.pieceHP[slayerSq], sSt.maxHp);
        if (typeof CombatEngine !== 'undefined') {
          CombatEngine.spawnDmgPopup(ui, slayerSq, curseDmg);
        }
        const sName = (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[slayer.type]) ? PIECE_NAMES[slayer.type] : slayer.type;
        ui.addLog(`👻 Phantom Curse deals ${curseDmg} curse damage to ${sName}!`);
        if (ui.pieceHP[slayerSq] <= 0) {
          delete ui.pieceHP[slayerSq];
          ui.game.board[slayerSq] = null;
          ui.removePieceDOM(slayerSq);
        }
      }
    }
  },

  /**
   * Normal Bonus Gold upon victory
   */
  getBonusGoldWin(ui) {
    if (!ui) return 0;
    const syns = this.getActiveSynergies(ui);
    let bonus = 0;
    for (const s of Object.values(syns)) {
      if (s.isActive && s.activeTier && s.activeTier.bonusGoldWin) {
        bonus += s.activeTier.bonusGoldWin;
      }
    }
    return bonus;
  },

  /**
   * Bug evolution battle discount
   */
  getEvoDiscount(piece, ui) {
    if (!piece || !ui) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const bug = syns.bug;
    if (bug && bug.isActive && bug.activeTier && bug.activeTier.evoDiscount && elements.includes('bug')) {
      return bug.activeTier.evoDiscount;
    }
    return 0;
  },

  /**
   * Psychic Synergy: Critical Hit Check
   */
  checkCrit(piece, ui) {
    if (!piece || !ui || piece.color !== W) return { isCrit: false, mult: 1.0 };
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const psych = syns.psychic;
    if (!psych || !psych.isActive || !psych.activeTier) return { isCrit: false, mult: 1.0 };

    let chance = 0;
    let mult = 2.0;

    if (psych.activeTier.teamCrit) {
      chance = psych.activeTier.teamCrit;
      mult = psych.activeTier.teamCritMult || 2.5;
    } else if (elements.includes('psychic') && psych.activeTier.selfCrit) {
      chance = psych.activeTier.selfCrit;
      mult = psych.activeTier.critMult || 2.0;
    }

    if (chance > 0 && Math.random() < chance) {
      return { isCrit: true, mult };
    }
    return { isCrit: false, mult: 1.0 };
  },

  /**
   * Grass Synergy: Lifesteal ratio
   */
  getLifestealRatio(piece, ui) {
    if (!piece || !ui || piece.color !== W) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const grass = syns.grass;
    if (!grass || !grass.isActive || !grass.activeTier) return 0;

    if (grass.activeTier.teamLifesteal) return grass.activeTier.teamLifesteal;
    if (elements.includes('grass') && grass.activeTier.selfLifesteal) return grass.activeTier.selfLifesteal;
    return 0;
  },

  /**
   * Fighting Synergy: Splash ratio
   */
  getSplashRatio(piece, ui) {
    if (!piece || !ui || piece.color !== W) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const fight = syns.fighting;
    if (!fight || !fight.isActive || !fight.activeTier) return 0;

    if (fight.activeTier.teamSplash) return fight.activeTier.teamSplash;
    if (elements.includes('fighting') && fight.activeTier.selfSplash) return fight.activeTier.selfSplash;
    return 0;
  },

  /**
   * Ground Synergy: Thorns damage
   */
  getThornsDmg(piece, ui) {
    if (!piece || !ui || piece.color !== W) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const ground = syns.ground;
    if (!ground || !ground.isActive || !ground.activeTier) return 0;

    if (ground.activeTier.teamThorns) return ground.activeTier.teamThorns;
    if (elements.includes('ground') && ground.activeTier.selfThorns) return ground.activeTier.selfThorns;
    return 0;
  },

  /**
   * Dark Synergy: Flank or Execute bonus damage
   */
  getDarkBonusDmg(piece, target, ui, fromSq, toSq) {
    if (!piece || !target || !ui || piece.color !== W) return 0;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(piece);
    const dark = syns.dark;
    if (!dark || !dark.isActive || !dark.activeTier) return 0;

    let multiplier = 0;
    if (dark.activeTier.executeBonus) {
      const tSt = ui.getEffectivePieceStats(target);
      const curHp = ui.pieceHP[toSq] !== undefined ? ui.pieceHP[toSq] : tSt.maxHp;
      if (curHp < tSt.maxHp * 0.5) {
        multiplier += dark.activeTier.executeBonus;
      }
    }
    if (elements.includes('dark') && dark.activeTier.flankBonus) {
      const fr = Math.floor(fromSq / 8), tr = Math.floor(toSq / 8);
      if (fr >= tr) {
        multiplier += dark.activeTier.flankBonus;
      }
    }
    return multiplier;
  },

  /**
   * Fairy Synergy: Heal lowest ally on attack
   */
  triggerFairyHeal(attacker, ui) {
    if (!attacker || !ui || attacker.color !== W) return;
    const syns = this.getActiveSynergies(ui);
    const fairy = syns.fairy;
    if (!fairy || !fairy.isActive || !fairy.activeTier || !fairy.activeTier.allyHealOnAttack) return;

    const healAmt = fairy.activeTier.allyHealOnAttack;
    let lowestSq = -1;
    let lowestPct = 1.0;
    let lowestPiece = null;

    for (let sq = 0; sq < 64; sq++) {
      const p = ui.game.board[sq];
      if (p && p.color === W && ui.pieceHP[sq] !== undefined && ui.pieceHP[sq] > 0) {
        const st = ui.getEffectivePieceStats(p);
        const pct = ui.pieceHP[sq] / st.maxHp;
        if (pct < lowestPct) {
          lowestPct = pct;
          lowestSq = sq;
          lowestPiece = p;
        }
      }
    }

    if (lowestSq !== -1 && lowestPct < 1.0) {
      const st = ui.getEffectivePieceStats(lowestPiece);
      const nextHp = Math.min(st.maxHp, ui.pieceHP[lowestSq] + healAmt);
      ui.pieceHP[lowestSq] = nextHp;
      ui.updatePieceHpDOM(lowestSq, nextHp, st.maxHp);
      if (typeof CombatEngine !== 'undefined') {
        CombatEngine.spawnHealPopup(ui, lowestSq, healAmt);
      }
      const targetName = (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[lowestPiece.type]) ? PIECE_NAMES[lowestPiece.type] : lowestPiece.type;
      ui.addLog(`✨ Fairy Blessing heals +${healAmt} HP to ${targetName}!`);
    }
  },

  /**
   * On Hit Status Triggers (Electric Paralyze, Fire Burn, Poison Dot)
   */
  onHit(attacker, target, damage, ui, toSq) {
    if (!attacker || !target || !ui || attacker.color !== W) return;
    const syns = this.getActiveSynergies(ui);
    const elements = this.getPieceElements(attacker);
    const targetName = (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[target.type]) ? PIECE_NAMES[target.type] : target.type;

    // Check Lum Berry on target: cures and prevents first status ailment!
    const checkLumBerry = () => {
      if (typeof TalismanSystem !== 'undefined' && TalismanSystem.hasLumBerry(target) && !target.lumBerryUsed) {
        target.lumBerryUsed = true;
        ui.addLog(`🍈 Lum Berry consumed: cured status ailment on ${targetName}!`);
        if (typeof CombatEngine !== 'undefined') {
          CombatEngine.spawnTextPopup(ui, toSq, 'LUM BERRY!', 'heal-popup');
        }
        return true;
      }
      return false;
    };

    // Electric Paralyze
    const electric = syns.electric;
    if (electric && electric.isActive && electric.activeTier && electric.activeTier.paralyzeChance) {
      if (Math.random() < electric.activeTier.paralyzeChance) {
        if (!checkLumBerry()) {
          target.isParalyzed = true;
          ui.addLog(`⚡ ${targetName} is Paralyzed! (Action skipped next round)`);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnElectricFX(ui, toSq);
          }
        }
      }
    }

    // Fire Burn
    const fire = syns.fire;
    if (fire && fire.isActive && fire.activeTier && fire.activeTier.burnChance) {
      if (Math.random() < fire.activeTier.burnChance) {
        if (!checkLumBerry()) {
          target.burnDmg = Math.max(target.burnDmg || 0, fire.activeTier.burnDmg);
          ui.addLog(`🔥 ${targetName} is afflicted with Burn (-${target.burnDmg} HP/round)!`);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnFireFX(ui, toSq);
          }
        }
      }
    }

    // Poison
    const poison = syns.poison;
    if (poison && poison.isActive && poison.activeTier && poison.activeTier.poisonDot) {
      if (!checkLumBerry()) {
        target.poisonDot = Math.max(target.poisonDot || 0, poison.activeTier.poisonDot);
        ui.addLog(`🧪 ${targetName} is Poisoned (-${target.poisonDot} HP/round)!`);
        if (typeof CombatEngine !== 'undefined') {
          CombatEngine.spawnPoisonFX(ui, toSq);
        }
      }
    }
  },

  /**
   * End of Round Triggers (Water Regen, Burn Tick, Poison Tick)
   */
  onRoundEnd(ui) {
    if (!ui || !ui.game || !ui.game.board) return;
    const syns = this.getActiveSynergies(ui);

    // 1. Water Regeneration
    const water = syns.water;
    if (water && water.isActive && water.activeTier) {
      for (let sq = 0; sq < 64; sq++) {
        const p = ui.game.board[sq];
        if (p && p.color === W && ui.pieceHP[sq] !== undefined && ui.pieceHP[sq] > 0) {
          const elements = this.getPieceElements(p);
          let heal = 0;
          if (water.activeTier.teamRegen) heal = water.activeTier.teamRegen;
          else if (elements.includes('water') && water.activeTier.regen) heal = water.activeTier.regen;

          if (heal > 0) {
            const st = ui.getEffectivePieceStats(p);
            if (ui.pieceHP[sq] < st.maxHp) {
              const nextHp = Math.min(st.maxHp, ui.pieceHP[sq] + heal);
              ui.pieceHP[sq] = nextHp;
              ui.updatePieceHpDOM(sq, nextHp, st.maxHp);
              if (typeof CombatEngine !== 'undefined') {
                CombatEngine.spawnHealPopup(ui, sq, heal);
              }
            }
          }
        }
      }
    }

    // 2. Status ailments, Sticky Barb, and Toxic Orb ticks
    for (let sq = 0; sq < 64; sq++) {
      const p = ui.game.board[sq];
      if (p && ui.pieceHP[sq] !== undefined && ui.pieceHP[sq] > 0) {
        let dotTotal = 0;
        const pName = (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[p.type]) ? PIECE_NAMES[p.type] : p.type;

        if (p.burnDmg) {
          dotTotal += p.burnDmg;
          ui.addLog(`🔥 ${pName} suffers ${p.burnDmg} Burn damage!`);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnFireFX(ui, sq);
          }
        }
        if (p.poisonDot) {
          dotTotal += p.poisonDot;
          ui.addLog(`🧪 ${pName} suffers ${p.poisonDot} Poison damage!`);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnPoisonFX(ui, sq);
          }
        }
        if (p.hasStickyBarbBleed) {
          dotTotal += p.hasStickyBarbBleed;
          ui.addLog(`🌵 ${pName} takes ${p.hasStickyBarbBleed} bleeding damage from Sticky Barb!`);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnBleedFX(ui, sq);
          }
        }
        if (p.isToxicPoisoned) {
          dotTotal += 2;
          ui.addLog(`☠️ ${pName} takes 2 HP poison damage from Toxic Orb!`);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnPoisonFX(ui, sq);
          }
        }

        if (dotTotal > 0) {
          const st = ui.getEffectivePieceStats(p);
          const nextHp = Math.max(0, ui.pieceHP[sq] - dotTotal);
          ui.pieceHP[sq] = nextHp;
          ui.updatePieceHpDOM(sq, nextHp, st.maxHp);
          if (typeof CombatEngine !== 'undefined') {
            CombatEngine.spawnDmgPopup(ui, sq, dotTotal);
          }
          if (nextHp <= 0) {
            ui.addLog(`💀 ${pName} succumbed to damage over time!`);
            ui.game.board[sq] = null;
            ui.renderBoard();
          }
        }
      }
    }
  },

  /**
   * Normal Synergy: Bonus Gold on Victory
   */
  getBonusGoldWin(ui) {
    if (!ui) return 0;
    const syns = this.getActiveSynergies(ui);
    const normal = syns.normal;
    if (normal && normal.isActive && normal.activeTier && normal.activeTier.bonusGoldWin) {
      return normal.activeTier.bonusGoldWin;
    }
    return 0;
  },

  /**
   * Render the Synergy Drawer panel (English, TFT Card Style)
   */
  /**
   * Render the Synergy Drawer panel (English, TFT Card Style)
   * Only displays traits of Pokémon currently deployed on the board (count > 0).
   */
  renderSynergyPanel(ui, container) {
    if (!container) return;
    container.innerHTML = '';

    const syns = this.getActiveSynergies(ui);
    const allList = Object.values(syns);

    // Sort: active traits first (by tier level desc, then count desc), then in-progress traits (by count desc)
    allList.sort((a, b) => {
      const aLvl = a.activeTier ? a.activeTier.level : 0;
      const bLvl = b.activeTier ? b.activeTier.level : 0;
      if (aLvl !== bLvl) return bLvl - aLvl;
      if (a.count !== b.count) return b.count - a.count;
      return a.def.name.localeCompare(b.def.name);
    });

    const activeList = allList.filter(s => s.isActive);
    const inProgressList = allList.filter(s => !s.isActive && s.count > 0);

    // If no Pokémon deployed on the board yet
    if (activeList.length === 0 && inProgressList.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'syn-empty-box';
      emptyBox.innerHTML = `
        <div class="syn-empty-title">NO ACTIVE TRAITS</div>
        <div class="syn-empty-hint">Deploy Pokémon onto the board to activate trait synergies!</div>
      `;
      container.appendChild(emptyBox);
      return;
    }

    // Section 1: Active Synergies (reached breakpoint)
    if (activeList.length > 0) {
      const header = document.createElement('div');
      header.className = 'talisman-section-divider';
      header.textContent = `ACTIVE TRAITS (${activeList.length})`;
      container.appendChild(header);

      for (const item of activeList) {
        container.appendChild(this.createSynergyCard(item));
      }
    }

    // Section 2: In-Progress Synergies (on board, reaching towards tier 1)
    if (inProgressList.length > 0) {
      const header = document.createElement('div');
      header.className = 'talisman-section-divider';
      header.textContent = `IN PROGRESS (${inProgressList.length})`;
      container.appendChild(header);

      for (const item of inProgressList) {
        container.appendChild(this.createSynergyCard(item));
      }
    }
  },

  /**
   * Construct a single Synergy Card DOM element
   */
  createSynergyCard(item) {
    const def = item.def;
    const isActive = item.isActive;
    const activeTier = item.activeTier;

    const card = document.createElement('div');
    card.className = `talisman-card synergy-card ${isActive ? 'synergy-active' : 'synergy-inactive'}`;
    if (isActive) {
      card.style.borderLeftColor = def.color;
      card.style.boxShadow = `0 0 6px ${def.color}35`;
    } else {
      card.style.borderLeftColor = `${def.color}66`;
    }

    let badgeHtml = '';
    if (isActive) {
      badgeHtml = `<div class="synergy-tier-badge tier-active" style="background:${def.color}30;border:1px solid ${def.color};color:#fff;">TIER ${activeTier.level} (${item.count}/${activeTier.count})</div>`;
    } else {
      const targetCount = def.tiers[0].count;
      badgeHtml = `<div class="synergy-tier-badge tier-inactive">${item.count}/${targetCount}</div>`;
    }

    // TFT-style tier pills in header
    const pillsHtml = def.tiers.map(t => {
      const reached = item.count >= t.count;
      return `<span class="synergy-tier-pill ${reached ? 'reached' : ''}" style="${reached ? `background:${def.color}40;color:#fff;border-color:${def.color};` : ''}">${t.count}</span>`;
    }).join('');

    // Only render the ACTIVE tier effect, or next tier if in progress
    let tiersHtml = '';
    if (isActive && activeTier) {
      tiersHtml = `
        <div class="synergy-tier-line tier-reached">
          <span class="synergy-bullet" style="color:${def.color};">(${activeTier.count}):</span>
          <span class="synergy-tier-text" style="color:#ffffff;">${activeTier.desc}</span>
        </div>
      `;
    } else {
      const targetTier = def.tiers[0];
      tiersHtml = `
        <div class="synergy-tier-line tier-unreached">
          <span class="synergy-bullet" style="color:#8395a7;">(${targetTier.count}):</span>
          <span class="synergy-tier-text" style="color:#8395a7;">${targetTier.desc}</span>
        </div>
      `;
    }

    let unitsHtml = '';
    if (item.pieces && item.pieces.length > 0) {
      const uniqueNames = [...new Set(item.pieces.map(p => (typeof PIECE_NAMES !== 'undefined' && PIECE_NAMES[p.piece.type]) ? PIECE_NAMES[p.piece.type] : p.piece.type))];
      unitsHtml = `
        <div class="synergy-units-row">
          <span style="color:${def.color};font-weight:700;">Deployed:</span> ${uniqueNames.join(', ')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="talisman-card-header">
        <img src="${def.icon}" class="talisman-icon" alt="${def.name}" />
        <div class="talisman-card-title-wrap">
          <div class="talisman-name" style="${isActive ? `color:${def.color};` : 'color:#dcdde1;'}">
            ${def.name.toUpperCase()}
          </div>
          <div class="synergy-tiers-badges">
            ${pillsHtml}
          </div>
        </div>
        ${badgeHtml}
      </div>
      <div class="synergy-tiers-list">
        ${tiersHtml}
      </div>
      ${unitsHtml}
    `;

    return card;
  }
};

if (typeof window !== 'undefined') {
  window.SynergySystem = SynergySystem;
  window.SYNERGY_DEFS = SYNERGY_DEFS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SynergySystem, SYNERGY_DEFS };
}
