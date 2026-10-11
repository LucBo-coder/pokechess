// =============================================
// TREE MATRIX: DARK CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-546, -651)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['dark'] = {
  id: 'dark',
  name: 'DARK CONSTELLATION',
  element: 'dark',
  centerX: -546,
  centerY: -651,
  themeColor: '#636e72',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom dark silhouette)
    addNode('dark_origin', 'DARK STAR', 'origin', 'dark', -546, -651, 'The obsidian core of Dark deceit.', 'both', 'dark');
    addNode('dark_node_1', 'Upper Moon Cusp', 'minor', 'dark', -581, -751, '+3 ATK to Dark Pokémon.', 'atk');
    addNode('dark_node_2', 'Outer Arc Upper', 'minor', 'dark', -631, -711, '+3 ATK to Dark Pokémon.', 'atk');
    addNode('dark_notable_1', 'AMBUSH STRIKE', 'notable', 'dark', -656, -651, 'Dark Pokémon deal +7 bonus ATK.', 'notable');
    addNode('dark_node_3', 'Outer Arc Lower', 'minor', 'dark', -631, -591, '+6 Max HP to Dark Pokémon.', 'hp');
    addNode('dark_node_4', 'Lower Moon Cusp', 'minor', 'dark', -581, -551, '+6 Max HP to Dark Pokémon.', 'hp');
    addNode('dark_notable_2', 'SHADOW VEIL', 'notable', 'dark', -591, -686, 'Dark Pokémon gain +15 Max HP and 15% dodge chance.', 'notable');
    addNode('dark_node_5', 'Inner Sickle Lower', 'minor', 'dark', -591, -616, '+6 Max HP to Dark Pokémon.', 'hp');
    addNode('dark_node_6', 'Shadow Umbra Focus', 'minor', 'dark', -506, -651, '+3 ATK to Dark Pokémon.', 'atk');
    addNode('dark_keystone', 'MIDNIGHT PREDATOR', 'keystone', 'dark', -546, -796, 'KEYSTONE: Dark Pokémon deal double damage against enemies below 40% HP and strike first in battle!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('dark_keystone', 'dark_node_1');
    addEdge('dark_node_1', 'dark_node_2');
    addEdge('dark_node_2', 'dark_notable_1');
    addEdge('dark_notable_1', 'dark_node_3');
    addEdge('dark_node_3', 'dark_node_4');
    addEdge('dark_node_1', 'dark_notable_2');
    addEdge('dark_notable_2', 'dark_origin');
    addEdge('dark_origin', 'dark_node_5');
    addEdge('dark_node_5', 'dark_node_4');
    addEdge('dark_origin', 'dark_node_6');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('r_starter_3', 'dark_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'dark';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('dark_node_3')) hp += 8;
    if (hasNode('dark_node_4')) hp += 8;
    if (hasNode('dark_node_5')) hp += 8;
    if (hasNode('dark_notable_2')) hp += 18;
    if (hasNode('dark_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('dark_node_1')) dmg += 3;
    if (hasNode('dark_node_2')) dmg += 3;
    if (hasNode('dark_node_6')) dmg += 3;
    if (hasNode('dark_notable_1')) dmg += 6;
    if (hasNode('dark_keystone')) dmg += 10;
    return dmg;
  }
};
