// =============================================
// TREE MATRIX: POISON CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-736, 425)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['poison'] = {
  id: 'poison',
  name: 'POISON CONSTELLATION',
  element: 'poison',
  centerX: -736,
  centerY: 425,
  themeColor: '#a55eea',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom poison silhouette)
    addNode('poison_origin', 'POISON STAR', 'origin', 'poison', -736, 425, 'The toxic beaker of Poison alchemy.', 'both', 'poison');
    addNode('poison_node_1', 'Flask Neck Left', 'minor', 'poison', -766, 370, '+3 ATK to Poison Pokémon.', 'atk');
    addNode('poison_node_2', 'Flask Neck Right', 'minor', 'poison', -706, 370, '+3 ATK to Poison Pokémon.', 'atk');
    addNode('poison_node_5', 'Flask Rim Left', 'minor', 'poison', -771, 330, '+3 ATK to Poison Pokémon.', 'atk');
    addNode('poison_node_6', 'Flask Rim Right', 'minor', 'poison', -701, 330, '+3 ATK to Poison Pokémon.', 'atk');
    addNode('poison_keystone', 'TOXIC CATACLYSM', 'keystone', 'poison', -736, 285, 'KEYSTONE: Poison damage stacks infinitely and spreads to all nearby enemies when an infected target perishes!', 'keystone');
    addNode('poison_node_3', 'Base Corner Left', 'minor', 'poison', -811, 480, '+8 Max HP to Poison Pokémon.', 'hp');
    addNode('poison_node_4', 'Base Corner Right', 'minor', 'poison', -661, 480, '+8 Max HP to Poison Pokémon.', 'hp');
    addNode('poison_notable_1', 'VENOMOUS FANGS', 'notable', 'poison', -776, 510, 'Poison Pokémon attacks poison targets for 3 damage per turn.', 'notable');
    addNode('poison_notable_2', 'CORROSIVE MIASMA', 'notable', 'poison', -696, 510, 'Poison Pokémon gain +18 Max HP and emit a deadly toxic miasma.', 'notable');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('poison_node_5', 'poison_node_6');
    addEdge('poison_node_6', 'poison_node_2');
    addEdge('poison_node_2', 'poison_origin');
    addEdge('poison_origin', 'poison_node_1');
    addEdge('poison_node_1', 'poison_node_5');
    addEdge('poison_node_5', 'poison_keystone');
    addEdge('poison_node_6', 'poison_keystone');
    addEdge('poison_node_1', 'poison_node_3');
    addEdge('poison_node_3', 'poison_notable_1');
    addEdge('poison_notable_1', 'poison_notable_2');
    addEdge('poison_notable_2', 'poison_node_4');
    addEdge('poison_node_4', 'poison_node_2');
    addEdge('poison_origin', 'poison_notable_1');
    addEdge('poison_origin', 'poison_notable_2');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('r_notable_5', 'poison_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'poison';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('poison_node_3')) hp += 8;
    if (hasNode('poison_node_4')) hp += 8;
    if (hasNode('poison_notable_2')) hp += 18;
    if (hasNode('poison_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('poison_node_1')) dmg += 3;
    if (hasNode('poison_node_2')) dmg += 3;
    if (hasNode('poison_node_5')) dmg += 3;
    if (hasNode('poison_node_6')) dmg += 3;
    if (hasNode('poison_notable_1')) dmg += 6;
    if (hasNode('poison_keystone')) dmg += 10;
    return dmg;
  }
};
