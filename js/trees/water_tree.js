// =============================================
// TREE MATRIX: WATER CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (0, 850)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['water'] = {
  id: 'water',
  name: 'WATER CONSTELLATION',
  element: 'water',
  centerX: 0,
  centerY: 850,
  themeColor: '#1e90ff',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom water silhouette)
    addNode('water_origin', 'WATER STAR', 'origin', 'water', 0, 850, 'The oceanic wellspring of Water power.', 'both', 'water');
    addNode('water_node_1', 'Droplet Curve SW', 'minor', 'water', -45, 890, '+10 Max HP to Water Pokémon.', 'hp');
    addNode('water_node_2', 'Droplet Curve SE', 'minor', 'water', 45, 890, '+10 Max HP to Water Pokémon.', 'hp');
    addNode('water_node_5', 'Droplet Bottom Point', 'minor', 'water', 0, 915, '+10 Max HP to Water Pokémon.', 'hp');
    addNode('water_node_3', 'Droplet Shoulder Left', 'minor', 'water', -60, 840, '+2 ATK to Water Pokémon.', 'atk');
    addNode('water_node_4', 'Droplet Shoulder Right', 'minor', 'water', 60, 840, '+2 ATK to Water Pokémon.', 'atk');
    addNode('water_notable_1', 'TIDAL SURGE', 'notable', 'water', -35, 780, 'Water Pokémon deal +6 bonus ATK.', 'notable');
    addNode('water_notable_2', 'ABYSSAL SHELL', 'notable', 'water', 35, 780, 'Water Pokémon gain +18 Max HP and 10% dodge chance.', 'notable');
    addNode('water_node_6', 'Droplet Core Stream', 'minor', 'water', 0, 805, '+8 Max HP & +2 ATK.', 'both');
    addNode('water_keystone', 'OCEANIC MAJESTY', 'keystone', 'water', 0, 720, 'KEYSTONE: Water Pokémon gain +25% Max HP and heal adjacent allies for 10% of their damage dealt!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('water_node_1', 'water_node_5');
    addEdge('water_node_5', 'water_node_2');
    addEdge('water_node_1', 'water_node_3');
    addEdge('water_node_3', 'water_notable_1');
    addEdge('water_notable_1', 'water_keystone');
    addEdge('water_node_2', 'water_node_4');
    addEdge('water_node_4', 'water_notable_2');
    addEdge('water_notable_2', 'water_keystone');
    addEdge('water_origin', 'water_node_1');
    addEdge('water_origin', 'water_node_2');
    addEdge('water_origin', 'water_node_5');
    addEdge('water_origin', 'water_node_6');
    addEdge('water_node_6', 'water_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('a_keystone', 'water_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'water';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('water_node_1')) hp += 8;
    if (hasNode('water_node_2')) hp += 8;
    if (hasNode('water_node_5')) hp += 8;
    if (hasNode('water_node_6')) hp += 8;
    if (hasNode('water_notable_2')) hp += 18;
    if (hasNode('water_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('water_node_3')) dmg += 3;
    if (hasNode('water_node_4')) dmg += 3;
    if (hasNode('water_node_6')) dmg += 3;
    if (hasNode('water_notable_1')) dmg += 6;
    if (hasNode('water_keystone')) dmg += 10;
    return dmg;
  }
};
