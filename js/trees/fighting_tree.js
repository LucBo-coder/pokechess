// =============================================
// TREE MATRIX: FIGHTING CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (736, -425)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['fighting'] = {
  id: 'fighting',
  name: 'FIGHTING CONSTELLATION',
  element: 'fighting',
  centerX: 736,
  centerY: -425,
  themeColor: '#e84118',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom fighting silhouette)
    addNode('fighting_origin', 'FIGHTING STAR', 'origin', 'fighting', 736, -425, 'The iron palm of Fighting discipline.', 'both', 'fighting');
    addNode('fighting_node_1', 'Index Knuckle', 'minor', 'fighting', 671, -480, '+3 ATK to Fighting Pokémon.', 'atk');
    addNode('fighting_node_2', 'Middle Knuckle', 'minor', 'fighting', 716, -500, '+3 ATK to Fighting Pokémon.', 'atk');
    addNode('fighting_notable_1', 'MARTIAL PROWESS', 'notable', 'fighting', 756, -500, 'Fighting Pokémon deal +7 bonus ATK.', 'notable');
    addNode('fighting_node_5', 'Pinky Knuckle', 'minor', 'fighting', 801, -480, '+8 Max HP to Fighting Pokémon.', 'hp');
    addNode('fighting_notable_2', 'BATTLE HARDENED', 'notable', 'fighting', 641, -440, 'Fighting Pokémon gain +15 Max HP and counter-attack for 50% damage.', 'notable');
    addNode('fighting_node_3', 'Outer Palm Ridge', 'minor', 'fighting', 821, -425, '+8 Max HP to Fighting Pokémon.', 'hp');
    addNode('fighting_node_4', 'Wrist Left', 'minor', 'fighting', 696, -360, '+8 Max HP to Fighting Pokémon.', 'hp');
    addNode('fighting_node_6', 'Wrist Right', 'minor', 'fighting', 776, -360, '+3 ATK to Fighting Pokémon.', 'atk');
    addNode('fighting_keystone', 'WARRIOR ASCENDANCY', 'keystone', 'fighting', 736, -560, 'KEYSTONE: Fighting Pokémon gain +25 Max HP and +10 bonus ATK!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('fighting_node_1', 'fighting_node_2');
    addEdge('fighting_node_2', 'fighting_notable_1');
    addEdge('fighting_notable_1', 'fighting_node_5');
    addEdge('fighting_origin', 'fighting_node_1');
    addEdge('fighting_node_1', 'fighting_notable_2');
    addEdge('fighting_notable_2', 'fighting_origin');
    addEdge('fighting_origin', 'fighting_node_3');
    addEdge('fighting_node_5', 'fighting_node_3');
    addEdge('fighting_origin', 'fighting_node_4');
    addEdge('fighting_origin', 'fighting_node_6');
    addEdge('fighting_node_4', 'fighting_node_6');
    addEdge('fighting_node_2', 'fighting_keystone');
    addEdge('fighting_notable_1', 'fighting_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('w_notable_4', 'fighting_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'fighting';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('fighting_node_3')) hp += 8;
    if (hasNode('fighting_node_4')) hp += 8;
    if (hasNode('fighting_node_5')) hp += 8;
    if (hasNode('fighting_notable_2')) hp += 18;
    if (hasNode('fighting_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('fighting_node_1')) dmg += 3;
    if (hasNode('fighting_node_2')) dmg += 3;
    if (hasNode('fighting_node_6')) dmg += 3;
    if (hasNode('fighting_notable_1')) dmg += 6;
    if (hasNode('fighting_keystone')) dmg += 10;
    return dmg;
  }
};
