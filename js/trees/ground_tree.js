// =============================================
// TREE MATRIX: GROUND CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (837, 148)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['ground'] = {
  id: 'ground',
  name: 'GROUND CONSTELLATION',
  element: 'ground',
  centerX: 837,
  centerY: 148,
  themeColor: '#d1a054',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom ground silhouette)
    addNode('ground_origin', 'GROUND STAR', 'origin', 'ground', 837, 148, 'The earthen bedrock of Ground power.', 'both', 'ground');
    addNode('ground_node_1', 'West Mountain Peak', 'minor', 'ground', 782, 83, '+10 Max HP to Ground Pokémon.', 'hp');
    addNode('ground_node_2', 'East Mountain Peak', 'minor', 'ground', 892, 83, '+10 Max HP to Ground Pokémon.', 'hp');
    addNode('ground_notable_1', 'TECTONIC SMASH', 'notable', 'ground', 732, 118, 'Ground Pokémon deal +6 bonus ATK.', 'notable');
    addNode('ground_notable_2', 'SEISMIC BULWARK', 'notable', 'ground', 942, 118, 'Ground Pokémon gain +20 Max HP and 15% physical damage reduction.', 'notable');
    addNode('ground_node_3', 'Strata Layer West', 'minor', 'ground', 762, 203, '+10 Max HP to Ground Pokémon.', 'hp');
    addNode('ground_node_4', 'Strata Layer East', 'minor', 'ground', 912, 203, '+2 ATK to Ground Pokémon.', 'atk');
    addNode('ground_node_5', 'Deep Bedrock Left', 'minor', 'ground', 802, 233, '+10 Max HP to Ground Pokémon.', 'hp');
    addNode('ground_node_6', 'Deep Bedrock Right', 'minor', 'ground', 872, 233, '+2 ATK to Ground Pokémon.', 'atk');
    addNode('ground_keystone', 'EARTHEN MONOLITH', 'keystone', 'ground', 837, 13, 'KEYSTONE: Ground Pokémon gain +30 Max HP and cannot be knocked back or displaced!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('ground_node_5', 'ground_node_6');
    addEdge('ground_node_6', 'ground_node_4');
    addEdge('ground_node_4', 'ground_node_3');
    addEdge('ground_node_3', 'ground_node_5');
    addEdge('ground_origin', 'ground_node_3');
    addEdge('ground_origin', 'ground_node_4');
    addEdge('ground_origin', 'ground_node_1');
    addEdge('ground_origin', 'ground_node_2');
    addEdge('ground_notable_1', 'ground_node_1');
    addEdge('ground_node_1', 'ground_keystone');
    addEdge('ground_notable_2', 'ground_node_2');
    addEdge('ground_node_2', 'ground_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('w_keystone', 'ground_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'ground';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('ground_node_1')) hp += 8;
    if (hasNode('ground_node_2')) hp += 8;
    if (hasNode('ground_node_3')) hp += 8;
    if (hasNode('ground_node_5')) hp += 8;
    if (hasNode('ground_notable_2')) hp += 18;
    if (hasNode('ground_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('ground_node_4')) dmg += 3;
    if (hasNode('ground_node_6')) dmg += 3;
    if (hasNode('ground_notable_1')) dmg += 6;
    if (hasNode('ground_keystone')) dmg += 10;
    return dmg;
  }
};
