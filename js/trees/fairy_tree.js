// =============================================
// TREE MATRIX: FAIRY CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-291, -799)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['fairy'] = {
  id: 'fairy',
  name: 'FAIRY CONSTELLATION',
  element: 'fairy',
  centerX: -291,
  centerY: -799,
  themeColor: '#fd79a8',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom fairy silhouette)
    addNode('fairy_origin', 'FAIRY STAR', 'origin', 'fairy', -291, -799, 'The starlight essence of Fairy magic.', 'both', 'fairy');
    addNode('fairy_node_1', 'Upper Wing Left Inner', 'minor', 'fairy', -346, -844, '+8 Max HP to Fairy Pokémon.', 'hp');
    addNode('fairy_notable_1', 'MOONLIGHT SHIELD', 'notable', 'fairy', -406, -874, 'Fairy Pokémon start with a +20 HP barrier and give +10 HP to allies.', 'notable');
    addNode('fairy_node_2', 'Upper Wing Right Inner', 'minor', 'fairy', -236, -844, '+2 ATK to Fairy Pokémon.', 'atk');
    addNode('fairy_notable_2', 'PIXIE DUST', 'notable', 'fairy', -176, -874, 'Fairy Pokémon deal +6 bonus ATK.', 'notable');
    addNode('fairy_node_3', 'Lower Wing Left Tip', 'minor', 'fairy', -376, -749, '+8 Max HP to Fairy Pokémon.', 'hp');
    addNode('fairy_node_4', 'Lower Wing Right Tip', 'minor', 'fairy', -206, -749, '+2 ATK to Fairy Pokémon.', 'atk');
    addNode('fairy_node_5', 'Lower Wing Left Inner', 'minor', 'fairy', -331, -769, '+8 Max HP to Fairy Pokémon.', 'hp');
    addNode('fairy_node_6', 'Lower Wing Right Inner', 'minor', 'fairy', -251, -769, '+2 ATK to Fairy Pokémon.', 'atk');
    addNode('fairy_keystone', 'MYSTICAL BLESSING', 'keystone', 'fairy', -291, -934, 'KEYSTONE: Fairy Pokémon heal the entire team for 5 HP each turn and are immune to status conditions!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('fairy_origin', 'fairy_node_1');
    addEdge('fairy_node_1', 'fairy_notable_1');
    addEdge('fairy_notable_1', 'fairy_keystone');
    addEdge('fairy_origin', 'fairy_node_2');
    addEdge('fairy_node_2', 'fairy_notable_2');
    addEdge('fairy_notable_2', 'fairy_keystone');
    addEdge('fairy_origin', 'fairy_node_5');
    addEdge('fairy_node_5', 'fairy_node_3');
    addEdge('fairy_origin', 'fairy_node_6');
    addEdge('fairy_node_6', 'fairy_node_4');
    addEdge('fairy_node_1', 'fairy_node_5');
    addEdge('fairy_node_2', 'fairy_node_6');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('m_notable_5', 'fairy_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'fairy';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('fairy_node_1')) hp += 8;
    if (hasNode('fairy_node_3')) hp += 8;
    if (hasNode('fairy_node_5')) hp += 8;
    if (hasNode('fairy_notable_1')) hp += 18;
    if (hasNode('fairy_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('fairy_node_2')) dmg += 3;
    if (hasNode('fairy_node_4')) dmg += 3;
    if (hasNode('fairy_node_6')) dmg += 3;
    if (hasNode('fairy_notable_2')) dmg += 6;
    if (hasNode('fairy_keystone')) dmg += 10;
    return dmg;
  }
};
