// =============================================
// TREE MATRIX: CORE (ASTRAL GENERAL TREE)
// 65 Nodes: Might, Wealth, Arcana & Relics
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['core'] = {
  id: 'core',
  name: 'ASTRAL CORE',
  element: null,
  centerX: 0,
  centerY: 0,
  themeColor: '#00f2fe',
  
  buildGraph(addNode, addEdge) {
    // 0. CENTER ROOT
    addNode('origin', 'ORIGIN STAR', 'origin', 'center', 0, 0, 'The cosmic center of all Pokémon mastery.');

    // 1. NORTH QUADRANT: PATH OF MIGHT & WARFARE
    addNode('m_root', 'Might Gateway', 'minor', 'might', 0, -55, '+3 Max HP to all Pokémon.', 'hp');
    addNode('m_hp_1', 'Vitality Spark', 'minor', 'might', -35, -100, '+3 Max HP to all Pokémon.', 'hp');
    addNode('m_atk_1', 'Warrior Edge', 'minor', 'might', 35, -100, '+1 ATK to all Pokémon.', 'atk');
    addNode('m_conn_1', 'Iron Nexus', 'minor', 'might', 0, -140, '+4 Max HP & +1 ATK to all Pokémon.', 'both');

    // Middle Ring - Left Flank
    addNode('m_hp_2', 'Colossus Blood', 'minor', 'might', -85, -170, '+5 Max HP to all Pokémon.', 'hp');
    addNode('m_notable_1', "TITAN'S ROAR", 'notable', 'might', -140, -210, 'Frontline units gain +12 Max HP and +2 ATK.', 'notable');
    addNode('m_armor_1', 'Chitin Shell', 'minor', 'might', -195, -240, '+4 Max HP to all units.', 'hp');
    addNode('m_notable_5', 'TITANIC RESOLVE', 'notable', 'might', -150, -300, 'Your highest HP unit gains +20 Max HP.', 'notable');

    // Middle Ring - Right Flank
    addNode('m_atk_2', 'Blood Fury', 'minor', 'might', 85, -170, '+2 ATK to all Pokémon.', 'atk');
    addNode('m_notable_2', "SLAYER'S FOCUS", 'notable', 'might', 140, -210, '+6 ATK to all Pokémon.', 'notable');
    addNode('m_crit_1', 'Deadly Strike', 'minor', 'might', 195, -240, '+3% Critical Strike Chance.', 'crit');
    addNode('m_notable_3', 'LETHAL PRECISION', 'notable', 'might', 150, -300, '+8% Critical Strike Chance & +3 ATK.', 'notable');

    // Upper Spine
    addNode('m_hp_3', 'Heart of Oak', 'minor', 'might', -40, -220, '+5 Max HP to all units.', 'hp');
    addNode('m_atk_3', 'War Stomp', 'minor', 'might', 40, -220, '+3 ATK to all units.', 'atk');
    addNode('m_spine_1', 'Battle Sovereign', 'notable', 'might', 0, -270, '+10 Max HP & +4 ATK to all Pokémon.', 'notable');
    addNode('m_spine_2', 'Ascendant Fury', 'minor', 'might', 0, -340, '+5 Max HP & +2 ATK.', 'both');

    // North Keystone Constellation
    addNode('m_keystone', 'UNYIELDING WILL', 'keystone', 'might', 0, -420, 'KEYSTONE: All deployed Pokémon survive fatal damage with 1 HP once per combat round!', 'keystone');

    // Edges North
    addEdge('origin', 'm_root');
    addEdge('m_root', 'm_hp_1');
    addEdge('m_root', 'm_atk_1');
    addEdge('m_hp_1', 'm_conn_1');
    addEdge('m_atk_1', 'm_conn_1');
    addEdge('m_conn_1', 'm_hp_2');
    addEdge('m_conn_1', 'm_atk_2');
    addEdge('m_conn_1', 'm_hp_3');
    addEdge('m_conn_1', 'm_atk_3');
    addEdge('m_hp_2', 'm_notable_1');
    addEdge('m_notable_1', 'm_armor_1');
    addEdge('m_armor_1', 'm_notable_5');
    addEdge('m_atk_2', 'm_notable_2');
    addEdge('m_notable_2', 'm_crit_1');
    addEdge('m_crit_1', 'm_notable_3');
    addEdge('m_hp_3', 'm_spine_1');
    addEdge('m_atk_3', 'm_spine_1');
    addEdge('m_spine_1', 'm_spine_2');
    addEdge('m_notable_5', 'm_keystone');
    addEdge('m_notable_3', 'm_keystone');
    addEdge('m_spine_2', 'm_keystone');

    // 2. EAST QUADRANT: PATH OF WEALTH & THE VAULT
    addNode('w_root', 'Merchant Gateway', 'minor', 'wealth', 55, 0, '+1 Starting Gold in every run.', 'gold');
    addNode('w_gold_1', 'Coin Purse', 'minor', 'wealth', 100, -35, '+1 Starting Gold.', 'gold');
    addNode('w_reroll_1', 'Haggle Step', 'minor', 'wealth', 100, 35, 'Permanent -1 Gold discount on all Rerolls.', 'reroll');
    addNode('w_conn_1', 'Golden Scales', 'minor', 'wealth', 140, 0, '+2 Starting Gold & cheaper rerolls.', 'both');

    // Upper East
    addNode('w_gold_2', 'Gilded Chest', 'minor', 'wealth', 170, -85, '+2 Starting Gold.', 'gold');
    addNode('w_notable_1', 'GOLDEN HORIZON', 'notable', 'wealth', 210, -140, 'Start every new journey with +5 bonus Gold!', 'notable');
    addNode('w_gold_3', 'Treasure Cache', 'minor', 'wealth', 240, -195, '+2 Starting Gold.', 'gold');
    addNode('w_notable_4', 'TREASURY VAULT', 'notable', 'wealth', 300, -150, 'Interest rate bonus: +2 Gold earned at round end when hoarding gold.', 'notable');

    // Lower East
    addNode('w_reroll_2', 'Lucky Dice', 'minor', 'wealth', 170, 85, '+2% chance for higher tier cards.', 'luck');
    addNode('w_notable_2', 'FREE MARKET', 'notable', 'wealth', 210, 140, 'First Reroll in every stage is 100% FREE!', 'notable');
    addNode('w_card_1', 'Extended Shelves', 'minor', 'wealth', 240, 195, 'Shop displays +1 extra recruitment choice.', 'shop');
    addNode('w_notable_5', 'CARAVAN MASTER', 'notable', 'wealth', 300, 150, 'Deployable team size increased by +1 slot!', 'notable');

    // Outer East Spine
    addNode('w_slot_1', 'Roster Expansion', 'minor', 'wealth', 220, -40, '+1 Team Roster Slot capacity.', 'slot');
    addNode('w_slot_2', 'Grand Formation', 'minor', 'wealth', 220, 40, '+1 Team Roster Slot capacity.', 'slot');
    addNode('w_spine_1', 'Tycoon Sovereign', 'notable', 'wealth', 270, 0, 'Every completed stage awards +2 bonus Gold.', 'notable');
    addNode('w_spine_2', 'Midas Touch', 'minor', 'wealth', 340, 0, '+1 Starting Gold & +1% shop rare odds.', 'both');

    // East Keystone Constellation
    addNode('w_keystone', 'ASTRAL BAZAAR', 'keystone', 'wealth', 420, 0, 'KEYSTONE: Shop displays 5 cards (up from 4), and all unit purchases cost 1 less Gold!', 'keystone');

    // Edges East
    addEdge('origin', 'w_root');
    addEdge('w_root', 'w_gold_1');
    addEdge('w_root', 'w_reroll_1');
    addEdge('w_gold_1', 'w_conn_1');
    addEdge('w_reroll_1', 'w_conn_1');
    addEdge('w_conn_1', 'w_gold_2');
    addEdge('w_conn_1', 'w_reroll_2');
    addEdge('w_conn_1', 'w_slot_1');
    addEdge('w_conn_1', 'w_slot_2');
    addEdge('w_gold_2', 'w_notable_1');
    addEdge('w_notable_1', 'w_gold_3');
    addEdge('w_gold_3', 'w_notable_4');
    addEdge('w_reroll_2', 'w_notable_2');
    addEdge('w_notable_2', 'w_card_1');
    addEdge('w_card_1', 'w_notable_5');
    addEdge('w_slot_1', 'w_spine_1');
    addEdge('w_slot_2', 'w_spine_1');
    addEdge('w_spine_1', 'w_spine_2');
    addEdge('w_notable_4', 'w_keystone');
    addEdge('w_notable_5', 'w_keystone');
    addEdge('w_spine_2', 'w_keystone');

    // 3. SOUTH QUADRANT: PATH OF ARCANA & ELEMENTS
    addNode('a_root', 'Aether Gateway', 'minor', 'arcana', 0, 55, '+5 Max HP & +1 ATK to all Pokémon.', 'both');
    addNode('a_elem_1', 'Primal Spark', 'minor', 'arcana', -35, 100, '+2 ATK to all elemental types.', 'atk');
    addNode('a_mana_1', 'Mystic Well', 'minor', 'arcana', 35, 100, '+4 Max HP to all Pokémon.', 'hp');
    addNode('a_conn_1', 'Arcane Conduit', 'minor', 'arcana', 0, 140, 'Elemental synergy bonus damage increased by +15%.', 'synergy');

    // Lower West (Arcana flank)
    addNode('a_elem_2', 'Elemental Flux', 'minor', 'arcana', -85, 170, '+3 ATK to all elemental attacks.', 'atk');
    addNode('a_notable_1', 'ELEMENTAL OVERDRIVE', 'notable', 'arcana', -140, 210, 'Elemental synergy effects deal 40% increased damage.', 'notable');
    addNode('a_elem_3', 'Prismatic Core', 'minor', 'arcana', -195, 240, '+5 Max HP & +2 ATK.', 'both');
    addNode('a_notable_4', 'PRIMORDIAL RESONANCE', 'notable', 'arcana', -150, 300, 'Activating any 3+ synergy grants +10 team shields at combat start.', 'notable');

    // Lower East (Arcana flank)
    addNode('a_mana_2', 'Leyline Tap', 'minor', 'arcana', 85, 170, '+5 Max HP to all Pokémon.', 'hp');
    addNode('a_notable_2', 'ARCANE TRANSCENDENCE', 'notable', 'arcana', 140, 210, 'All Pokémon gain +8 Max HP and +2 ATK.', 'notable');
    addNode('a_mana_3', 'Astral Conduit', 'minor', 'arcana', 195, 240, '+6 Max HP to all units.', 'hp');
    addNode('a_notable_3', 'AETHER BARRIER', 'notable', 'arcana', 150, 300, 'Start each combat with a 15 HP barrier on all front-row units.', 'notable');

    // Lower Spine
    addNode('a_syn_1', 'Harmonic Resonance', 'minor', 'arcana', -40, 220, '+10% synergy effectiveness.', 'synergy');
    addNode('a_syn_2', 'Prismatic Alignment', 'minor', 'arcana', 40, 220, '+10% synergy effectiveness.', 'synergy');
    addNode('a_spine_1', 'Arcane Sovereign', 'notable', 'arcana', 0, 270, 'Synergies require 1 fewer piece to reach Tier 1 (minimum 2 pieces)!', 'notable');
    addNode('a_spine_2', 'Omni Infusion', 'minor', 'arcana', 0, 340, '+5 Max HP & +2 ATK to all units.', 'both');

    // South Keystone Constellation
    addNode('a_keystone', 'PRIMORDIAL CATALYST', 'keystone', 'arcana', 0, 420, 'KEYSTONE: All elemental synergy thresholds are permanently reduced by 1 piece!', 'keystone');

    // Edges South
    addEdge('origin', 'a_root');
    addEdge('a_root', 'a_elem_1');
    addEdge('a_root', 'a_mana_1');
    addEdge('a_elem_1', 'a_conn_1');
    addEdge('a_mana_1', 'a_conn_1');
    addEdge('a_conn_1', 'a_elem_2');
    addEdge('a_conn_1', 'a_mana_2');
    addEdge('a_conn_1', 'a_syn_1');
    addEdge('a_conn_1', 'a_syn_2');
    addEdge('a_elem_2', 'a_notable_1');
    addEdge('a_notable_1', 'a_elem_3');
    addEdge('a_elem_3', 'a_notable_4');
    addEdge('a_mana_2', 'a_notable_2');
    addEdge('a_notable_2', 'a_mana_3');
    addEdge('a_mana_3', 'a_notable_3');
    addEdge('a_syn_1', 'a_spine_1');
    addEdge('a_syn_2', 'a_spine_1');
    addEdge('a_spine_1', 'a_spine_2');
    addEdge('a_notable_4', 'a_keystone');
    addEdge('a_notable_3', 'a_keystone');
    addEdge('a_spine_2', 'a_keystone');

    // 4. WEST QUADRANT: PATH OF RELICS & STARTERS
    addNode('r_root', 'Relic Gateway', 'minor', 'relics', -55, 0, '+5 Max HP to Starter Pokémon.', 'hp');
    addNode('r_starter_1', 'Starter Bond', 'minor', 'relics', -100, -35, '+6 Max HP & +2 ATK to Starter.', 'both');
    addNode('r_talisman_1', 'Talisman Attunement', 'minor', 'relics', -100, 35, 'Talisman active effects are 15% more potent.', 'talisman');
    addNode('r_conn_1', 'Relic Nexus', 'minor', 'relics', -140, 0, '+1 Starting Talisman Choice at run start.', 'talisman');

    // Upper West (Starter flank)
    addNode('r_starter_2', 'Eternal Companion', 'minor', 'relics', -170, -85, '+3 ATK to Starter Pokémon.', 'atk');
    addNode('r_notable_1', 'PRIMAL COMPANION', 'notable', 'relics', -210, -140, 'Your Starter Pokémon gains +15 Max HP and +4 ATK permanently!', 'notable');
    addNode('r_starter_3', 'Alpha Lineage', 'minor', 'relics', -240, -195, '+8 Max HP to Starter Pokémon.', 'hp');
    addNode('r_notable_4', 'APEX EVOLUTION', 'notable', 'relics', -300, -150, 'Starter Pokémon evolves 1 round earlier in battle phases.', 'notable');

    // Lower West (Talisman flank)
    addNode('r_talisman_2', 'Ancient Rune', 'minor', 'relics', -170, 85, 'Equipped Talismans grant +5 Max HP.', 'talisman');
    addNode('r_notable_2', 'RELIC HOARDER', 'notable', 'relics', -210, 140, 'Unlock +1 additional Talisman slot on your team!', 'notable');
    addNode('r_talisman_3', 'Mystic Infusion', 'minor', 'relics', -240, 195, 'Talismans trigger 20% faster.', 'talisman');
    addNode('r_notable_5', 'SACRED ORB', 'notable', 'relics', -300, 150, 'Defeating Boss Stages guarantees a Legendary Talisman drop.', 'notable');

    // Outer West Spine
    addNode('r_drop_1', 'Fortune Finding', 'minor', 'relics', -220, -40, '+5% item drop chance after battle.', 'luck');
    addNode('r_drop_2', 'Treasure Seeker', 'minor', 'relics', -220, 40, '+5% item drop chance after battle.', 'luck');
    addNode('r_spine_1', 'Chronos Sovereign', 'notable', 'relics', -270, 0, 'Start each journey with 1 random Rare Talisman already equipped!', 'notable');
    addNode('r_spine_2', 'Eternal Heritage', 'minor', 'relics', -340, 0, '+10 Max HP & +3 ATK to Starter.', 'both');

    // West Keystone Constellation
    addNode('r_keystone', 'CHOSEN CHAMPION', 'keystone', 'relics', -420, 0, 'KEYSTONE: Starter Pokémon gains +50% Max HP, +50% ATK, and revives once per battle!', 'keystone');

    // Edges West
    addEdge('origin', 'r_root');
    addEdge('r_root', 'r_starter_1');
    addEdge('r_root', 'r_talisman_1');
    addEdge('r_starter_1', 'r_conn_1');
    addEdge('r_talisman_1', 'r_conn_1');
    addEdge('r_conn_1', 'r_starter_2');
    addEdge('r_conn_1', 'r_talisman_2');
    addEdge('r_conn_1', 'r_drop_1');
    addEdge('r_conn_1', 'r_drop_2');
    addEdge('r_starter_2', 'r_notable_1');
    addEdge('r_notable_1', 'r_starter_3');
    addEdge('r_starter_3', 'r_notable_4');
    addEdge('r_talisman_2', 'r_notable_2');
    addEdge('r_notable_2', 'r_talisman_3');
    addEdge('r_talisman_3', 'r_notable_5');
    addEdge('r_drop_1', 'r_spine_1');
    addEdge('r_drop_2', 'r_spine_1');
    addEdge('r_spine_1', 'r_spine_2');
    addEdge('r_notable_4', 'r_keystone');
    addEdge('r_notable_5', 'r_keystone');
    addEdge('r_spine_2', 'r_keystone');
  },

  getBonusHp(piece, stage, hasNode, selectedStarterId) {
    let hp = 0;
    if (hasNode('m_hp_1')) hp += 3;
    if (hasNode('m_conn_1')) hp += 4;
    if (hasNode('m_hp_2')) hp += 5;
    if (hasNode('m_hp_3')) hp += 5;
    if (hasNode('m_armor_1')) hp += 4;
    if (hasNode('m_spine_1')) hp += 10;
    if (hasNode('m_spine_2')) hp += 5;

    if (hasNode('a_root')) hp += 5;
    if (hasNode('a_mana_1')) hp += 4;
    if (hasNode('a_mana_2')) hp += 5;
    if (hasNode('a_mana_3')) hp += 6;
    if (hasNode('a_elem_3')) hp += 5;
    if (hasNode('a_spine_2')) hp += 5;
    if (hasNode('a_notable_2')) hp += 8;

    const isStarter = piece && (
      Array.isArray(selectedStarterId)
        ? selectedStarterId.includes(piece.type)
        : piece.type === selectedStarterId
    );

    if (isStarter) {
      if (hasNode('r_root')) hp += 5;
      if (hasNode('r_starter_1')) hp += 6;
      if (hasNode('r_starter_3')) hp += 8;
      if (hasNode('r_spine_2')) hp += 10;
      if (hasNode('r_notable_1')) hp += 15;
    }
    return hp;
  },

  getBonusAtk(piece, stage, hasNode, selectedStarterId) {
    let dmg = 0;
    if (hasNode('m_atk_1')) dmg += 1;
    if (hasNode('m_atk_2')) dmg += 2;
    if (hasNode('m_atk_3')) dmg += 3;
    if (hasNode('m_notable_2')) dmg += 6;

    const isStarter = piece && (
      Array.isArray(selectedStarterId)
        ? selectedStarterId.includes(piece.type)
        : piece.type === selectedStarterId
    );

    if (isStarter) {
      if (hasNode('r_starter_2')) dmg += 3;
      if (hasNode('r_notable_4')) dmg += 8;
    }
    return dmg;
  }
};
