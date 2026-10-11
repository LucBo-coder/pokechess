// =============================================
// TREE MATRIX: PSYCHIC CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-837, -148)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['psychic'] = {
  id: 'psychic',
  name: 'PSYCHIC CONSTELLATION',
  element: 'psychic',
  centerX: -837,
  centerY: -148,
  themeColor: '#ff6b81',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom psychic silhouette)
    addNode('psychic_origin', 'PSYCHIC STAR', 'origin', 'psychic', -837, -148, 'The radiant third eye of Psychic wisdom.', 'both', 'psychic');
    addNode('psychic_node_1', 'Upper Eyelid Left', 'minor', 'psychic', -892, -193, '+3 ATK to Psychic Pokémon.', 'atk');
    addNode('psychic_node_2', 'Upper Eyelid Right', 'minor', 'psychic', -782, -193, '+3 ATK to Psychic Pokémon.', 'atk');
    addNode('psychic_node_3', 'Lower Eyelid Left', 'minor', 'psychic', -892, -103, '+8 Max HP to Psychic Pokémon.', 'hp');
    addNode('psychic_node_4', 'Lower Eyelid Right', 'minor', 'psychic', -782, -103, '+8 Max HP to Psychic Pokémon.', 'hp');
    addNode('psychic_notable_1', 'PSYCHIC SURGE', 'notable', 'psychic', -952, -148, 'Psychic Pokémon deal +6 bonus ATK.', 'notable');
    addNode('psychic_notable_2', 'ASTRAL AEGIS', 'notable', 'psychic', -722, -148, 'Psychic Pokémon gain +20 Max HP and start combat with a +15 HP barrier.', 'notable');
    addNode('psychic_node_5', 'Brow Left', 'minor', 'psychic', -872, -233, '+3 ATK to Psychic Pokémon.', 'atk');
    addNode('psychic_node_6', 'Brow Right', 'minor', 'psychic', -802, -233, '+8 Max HP to Psychic Pokémon.', 'hp');
    addNode('psychic_keystone', 'COSMIC TELEKINESIS', 'keystone', 'psychic', -837, -283, 'KEYSTONE: Psychic Pokémon attacks bypass obstacles and grant a stacking +10 HP shield on hit!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('psychic_notable_1', 'psychic_node_1');
    addEdge('psychic_node_1', 'psychic_node_2');
    addEdge('psychic_node_2', 'psychic_notable_2');
    addEdge('psychic_notable_2', 'psychic_node_4');
    addEdge('psychic_node_4', 'psychic_node_3');
    addEdge('psychic_node_3', 'psychic_notable_1');
    addEdge('psychic_origin', 'psychic_node_1');
    addEdge('psychic_origin', 'psychic_node_2');
    addEdge('psychic_origin', 'psychic_node_3');
    addEdge('psychic_origin', 'psychic_node_4');
    addEdge('psychic_node_1', 'psychic_node_5');
    addEdge('psychic_node_5', 'psychic_keystone');
    addEdge('psychic_node_2', 'psychic_node_6');
    addEdge('psychic_node_6', 'psychic_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('r_keystone', 'psychic_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'psychic';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('psychic_node_3')) hp += 8;
    if (hasNode('psychic_node_4')) hp += 8;
    if (hasNode('psychic_node_6')) hp += 8;
    if (hasNode('psychic_notable_2')) hp += 18;
    if (hasNode('psychic_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('psychic_node_1')) dmg += 3;
    if (hasNode('psychic_node_2')) dmg += 3;
    if (hasNode('psychic_node_5')) dmg += 3;
    if (hasNode('psychic_notable_1')) dmg += 6;
    if (hasNode('psychic_keystone')) dmg += 10;
    return dmg;
  }
};
