// =============================================
// TREE MATRIX: FIRE CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (0, -850)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['fire'] = {
  id: 'fire',
  name: 'FIRE CONSTELLATION',
  element: 'fire',
  centerX: 0,
  centerY: -850,
  themeColor: '#ff4757',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom fire silhouette)
    addNode('fire_origin', 'FIRE STAR', 'origin', 'fire', 0, -850, 'The primordial hearth of Fire power.', 'both', 'fire');
    addNode('fire_node_1', 'Spark Ember I', 'minor', 'fire', 35, -815, '+3 ATK to Fire Pokémon.', 'atk');
    addNode('fire_node_2', 'Flame Flare I', 'minor', 'fire', 60, -865, '+3 ATK to Fire Pokémon.', 'atk');
    addNode('fire_notable_1', 'BLAZING WRATH', 'notable', 'fire', 35, -925, 'Fire Pokémon gain +6 bonus ATK.', 'notable');
    addNode('fire_node_3', 'Spark Ember II', 'minor', 'fire', -35, -815, '+8 Max HP to Fire Pokémon.', 'hp');
    addNode('fire_node_4', 'Flame Flare II', 'minor', 'fire', -60, -865, '+8 Max HP to Fire Pokémon.', 'hp');
    addNode('fire_notable_2', 'MOLTEN CARAPACE', 'notable', 'fire', -35, -925, 'Fire Pokémon gain +15 Max HP and reflect 4 fire damage when struck.', 'notable');
    addNode('fire_node_5', 'Hearth Stone', 'minor', 'fire', 0, -790, '+8 Max HP to Fire Pokémon.', 'hp');
    addNode('fire_node_6', 'Inner Combustion', 'minor', 'fire', 0, -910, '+3 ATK to Fire Pokémon.', 'atk');
    addNode('fire_keystone', 'INFERNAL AWAKENING', 'keystone', 'fire', 0, -990, 'KEYSTONE: Fire Pokémon deal +50% extra damage while above 50% HP, and attacks ignite targets for burn damage!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('fire_origin', 'fire_node_1');
    addEdge('fire_node_1', 'fire_node_2');
    addEdge('fire_node_2', 'fire_notable_1');
    addEdge('fire_notable_1', 'fire_keystone');
    addEdge('fire_origin', 'fire_node_3');
    addEdge('fire_node_3', 'fire_node_4');
    addEdge('fire_node_4', 'fire_notable_2');
    addEdge('fire_notable_2', 'fire_keystone');
    addEdge('fire_origin', 'fire_node_5');
    addEdge('fire_origin', 'fire_node_6');
    addEdge('fire_node_6', 'fire_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('m_keystone', 'fire_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'fire';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('fire_node_3')) hp += 8;
    if (hasNode('fire_node_4')) hp += 8;
    if (hasNode('fire_node_5')) hp += 8;
    if (hasNode('fire_notable_2')) hp += 15;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('fire_node_1')) dmg += 3;
    if (hasNode('fire_node_2')) dmg += 3;
    if (hasNode('fire_node_6')) dmg += 3;
    if (hasNode('fire_notable_1')) dmg += 6;
    return dmg;
  }
};
