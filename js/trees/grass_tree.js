// =============================================
// TREE MATRIX: GRASS CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (291, 799)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['grass'] = {
  id: 'grass',
  name: 'GRASS CONSTELLATION',
  element: 'grass',
  centerX: 291,
  centerY: 799,
  themeColor: '#2ed573',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom grass silhouette)
    addNode('grass_origin', 'GRASS STAR', 'origin', 'grass', 291, 799, 'The verdant core of Grass nature.', 'both', 'grass');
    addNode('grass_node_5', 'Stem Base', 'minor', 'grass', 291, 874, '+10 Max HP to Grass Pokémon.', 'hp');
    addNode('grass_node_1', 'Lower Lobe Left', 'minor', 'grass', 236, 829, '+8 Max HP to Grass Pokémon.', 'hp');
    addNode('grass_node_2', 'Mid Margin Left', 'minor', 'grass', 216, 774, '+2 ATK to Grass Pokémon.', 'atk');
    addNode('grass_notable_1', 'VERDANT FRENZY', 'notable', 'grass', 251, 719, 'Grass Pokémon deal +6 bonus ATK and heal 2 HP on hit.', 'notable');
    addNode('grass_node_3', 'Lower Lobe Right', 'minor', 'grass', 346, 829, '+8 Max HP to Grass Pokémon.', 'hp');
    addNode('grass_node_4', 'Mid Margin Right', 'minor', 'grass', 366, 774, '+2 ATK to Grass Pokémon.', 'atk');
    addNode('grass_notable_2', 'PHOTOSYNTHESIS', 'notable', 'grass', 331, 719, 'Grass Pokémon regenerate 4% Max HP at each turn start.', 'notable');
    addNode('grass_node_6', 'Central Vein', 'minor', 'grass', 291, 749, '+8 Max HP & +2 ATK.', 'both');
    addNode('grass_keystone', 'PRIMEVAL OVERGROWTH', 'keystone', 'grass', 291, 664, 'KEYSTONE: Grass Pokémon regenerate 10% Max HP each turn, and excess healing turns into permanent bonus Max HP!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('grass_node_5', 'grass_origin');
    addEdge('grass_origin', 'grass_node_6');
    addEdge('grass_node_6', 'grass_keystone');
    addEdge('grass_origin', 'grass_node_1');
    addEdge('grass_node_1', 'grass_node_2');
    addEdge('grass_node_2', 'grass_notable_1');
    addEdge('grass_notable_1', 'grass_keystone');
    addEdge('grass_origin', 'grass_node_3');
    addEdge('grass_node_3', 'grass_node_4');
    addEdge('grass_node_4', 'grass_notable_2');
    addEdge('grass_notable_2', 'grass_keystone');
    addEdge('grass_node_6', 'grass_node_2');
    addEdge('grass_node_6', 'grass_node_4');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('a_notable_3', 'grass_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'grass';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('grass_node_1')) hp += 8;
    if (hasNode('grass_node_3')) hp += 8;
    if (hasNode('grass_node_5')) hp += 8;
    if (hasNode('grass_node_6')) hp += 8;
    if (hasNode('grass_notable_2')) hp += 18;
    if (hasNode('grass_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('grass_node_2')) dmg += 3;
    if (hasNode('grass_node_4')) dmg += 3;
    if (hasNode('grass_node_6')) dmg += 3;
    if (hasNode('grass_notable_1')) dmg += 6;
    if (hasNode('grass_keystone')) dmg += 10;
    return dmg;
  }
};
