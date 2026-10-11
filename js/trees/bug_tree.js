// =============================================
// TREE MATRIX: BUG CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-837, 148)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['bug'] = {
  id: 'bug',
  name: 'BUG CONSTELLATION',
  element: 'bug',
  centerX: -837,
  centerY: 148,
  themeColor: '#badc58',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom bug silhouette)
    addNode('bug_origin', 'BUG STAR', 'origin', 'bug', -837, 148, 'The hive thorax of Bug tenacity.', 'both', 'bug');
    addNode('bug_node_1', 'Antenna Base Left', 'minor', 'bug', -872, 88, '+3 ATK to Bug Pokémon.', 'atk');
    addNode('bug_node_2', 'Antenna Base Right', 'minor', 'bug', -802, 88, '+3 ATK to Bug Pokémon.', 'atk');
    addNode('bug_notable_1', 'SWARM FEROCITY', 'notable', 'bug', -907, 38, 'Bug Pokémon gain +2 ATK for each deployed ally.', 'notable');
    addNode('bug_notable_2', 'CARAPACE HARDENING', 'notable', 'bug', -767, 38, 'Bug Pokémon gain +15 Max HP and 10% damage reflection.', 'notable');
    addNode('bug_keystone', 'HIVE OVERMIND', 'keystone', 'bug', -837, 13, 'KEYSTONE: Bug Pokémon cost 1 less gold, and when any Bug attacks, all other deployed Bugs gain +2 ATK for 1 round!', 'keystone');
    addNode('bug_node_3', 'Left Leg Joint', 'minor', 'bug', -922, 148, '+6 Max HP to Bug Pokémon.', 'hp');
    addNode('bug_node_4', 'Right Leg Joint', 'minor', 'bug', -752, 148, '+6 Max HP to Bug Pokémon.', 'hp');
    addNode('bug_node_5', 'Abdomen Left', 'minor', 'bug', -882, 203, '+6 Max HP to Bug Pokémon.', 'hp');
    addNode('bug_node_6', 'Abdomen Right', 'minor', 'bug', -792, 203, '+6 Max HP to Bug Pokémon.', 'hp');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('bug_origin', 'bug_node_1');
    addEdge('bug_node_1', 'bug_notable_1');
    addEdge('bug_node_1', 'bug_keystone');
    addEdge('bug_origin', 'bug_node_2');
    addEdge('bug_node_2', 'bug_notable_2');
    addEdge('bug_node_2', 'bug_keystone');
    addEdge('bug_origin', 'bug_node_3');
    addEdge('bug_origin', 'bug_node_4');
    addEdge('bug_origin', 'bug_node_5');
    addEdge('bug_origin', 'bug_node_6');
    addEdge('bug_node_5', 'bug_node_6');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('r_keystone', 'bug_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'bug';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('bug_node_3')) hp += 8;
    if (hasNode('bug_node_4')) hp += 8;
    if (hasNode('bug_node_5')) hp += 8;
    if (hasNode('bug_node_6')) hp += 8;
    if (hasNode('bug_notable_2')) hp += 18;
    if (hasNode('bug_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('bug_node_1')) dmg += 3;
    if (hasNode('bug_node_2')) dmg += 3;
    if (hasNode('bug_notable_1')) dmg += 6;
    if (hasNode('bug_keystone')) dmg += 10;
    return dmg;
  }
};
