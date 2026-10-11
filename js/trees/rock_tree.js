// =============================================
// TREE MATRIX: ROCK CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (837, -148)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['rock'] = {
  id: 'rock',
  name: 'ROCK CONSTELLATION',
  element: 'rock',
  centerX: 837,
  centerY: -148,
  themeColor: '#c7ecee',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom rock silhouette)
    addNode('rock_origin', 'ROCK STAR', 'origin', 'rock', 837, -148, 'The solid bedrock of Rock permanence.', 'both', 'rock');
    addNode('rock_node_1', 'Facet Top-Left', 'minor', 'rock', 762, -198, '+10 Max HP to Rock Pokémon.', 'hp');
    addNode('rock_node_2', 'Facet Top-Right', 'minor', 'rock', 912, -198, '+10 Max HP to Rock Pokémon.', 'hp');
    addNode('rock_notable_1', 'SOLID STONE', 'notable', 'rock', 837, -243, 'Rock Pokémon gain +22 Max HP.', 'notable');
    addNode('rock_node_3', 'Facet West', 'minor', 'rock', 742, -133, '+10 Max HP to Rock Pokémon.', 'hp');
    addNode('rock_node_4', 'Facet East', 'minor', 'rock', 932, -133, '+2 ATK to Rock Pokémon.', 'atk');
    addNode('rock_notable_2', 'BOULDER CRUSH', 'notable', 'rock', 782, -73, 'Rock Pokémon deal +6 bonus ATK.', 'notable');
    addNode('rock_node_5', 'Facet South-East', 'minor', 'rock', 892, -73, '+10 Max HP to Rock Pokémon.', 'hp');
    addNode('rock_node_6', 'Facet South Apex', 'minor', 'rock', 837, -53, '+2 ATK to Rock Pokémon.', 'atk');
    addNode('rock_keystone', 'UNBREAKABLE GRANITE', 'keystone', 'rock', 837, -293, 'KEYSTONE: Rock Pokémon gain +35 Max HP and reflect 25% of all received damage back to attackers!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('rock_node_1', 'rock_notable_1');
    addEdge('rock_notable_1', 'rock_node_2');
    addEdge('rock_node_2', 'rock_node_4');
    addEdge('rock_node_4', 'rock_node_5');
    addEdge('rock_node_5', 'rock_node_6');
    addEdge('rock_node_6', 'rock_notable_2');
    addEdge('rock_notable_2', 'rock_node_3');
    addEdge('rock_node_3', 'rock_node_1');
    addEdge('rock_origin', 'rock_node_1');
    addEdge('rock_origin', 'rock_node_2');
    addEdge('rock_origin', 'rock_node_3');
    addEdge('rock_origin', 'rock_node_4');
    addEdge('rock_notable_1', 'rock_keystone');
    addEdge('rock_node_1', 'rock_keystone');
    addEdge('rock_node_2', 'rock_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('w_keystone', 'rock_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'rock';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('rock_node_1')) hp += 8;
    if (hasNode('rock_node_2')) hp += 8;
    if (hasNode('rock_node_3')) hp += 8;
    if (hasNode('rock_node_5')) hp += 8;
    if (hasNode('rock_notable_1')) hp += 18;
    if (hasNode('rock_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('rock_node_4')) dmg += 3;
    if (hasNode('rock_node_6')) dmg += 3;
    if (hasNode('rock_notable_2')) dmg += 6;
    if (hasNode('rock_keystone')) dmg += 10;
    return dmg;
  }
};
