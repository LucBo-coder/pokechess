// =============================================
// TREE MATRIX: GHOST CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-736, -425)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['ghost'] = {
  id: 'ghost',
  name: 'GHOST CONSTELLATION',
  element: 'ghost',
  centerX: -736,
  centerY: -425,
  themeColor: '#a29bfe',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom ghost silhouette)
    addNode('ghost_origin', 'GHOST STAR', 'origin', 'ghost', -736, -425, 'The phantom heart of Ghost shadows.', 'both', 'ghost');
    addNode('ghost_node_1', 'Head Curve Left', 'minor', 'ghost', -786, -480, '+3 ATK to Ghost Pokémon.', 'atk');
    addNode('ghost_node_2', 'Head Curve Right', 'minor', 'ghost', -686, -480, '+3 ATK to Ghost Pokémon.', 'atk');
    addNode('ghost_keystone', 'SHADOW INCORPOREAL', 'keystone', 'ghost', -736, -560, 'KEYSTONE: Ghost Pokémon phase through pieces, gain 25% evasion, and drain 5 HP on hit!', 'keystone');
    addNode('ghost_notable_1', 'SPECTRAL HAUNT', 'notable', 'ghost', -841, -445, 'Ghost Pokémon deal +6 bonus ATK.', 'notable');
    addNode('ghost_notable_2', 'CURSED ESSENCE', 'notable', 'ghost', -631, -445, 'Enemies striking Ghost Pokémon are hexed, dealing 25% less damage.', 'notable');
    addNode('ghost_node_3', 'Tail Wave Left', 'minor', 'ghost', -796, -365, '+6 Max HP to Ghost Pokémon.', 'hp');
    addNode('ghost_node_4', 'Tail Wave Right', 'minor', 'ghost', -676, -365, '+6 Max HP to Ghost Pokémon.', 'hp');
    addNode('ghost_node_5', 'Tail Curl Mid', 'minor', 'ghost', -751, -330, '+6 Max HP to Ghost Pokémon.', 'hp');
    addNode('ghost_node_6', 'Spirit Wisp Tip', 'minor', 'ghost', -711, -305, '+6 Max HP to Ghost Pokémon.', 'hp');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('ghost_node_1', 'ghost_keystone');
    addEdge('ghost_node_2', 'ghost_keystone');
    addEdge('ghost_node_1', 'ghost_notable_1');
    addEdge('ghost_notable_1', 'ghost_origin');
    addEdge('ghost_node_2', 'ghost_notable_2');
    addEdge('ghost_notable_2', 'ghost_origin');
    addEdge('ghost_origin', 'ghost_node_1');
    addEdge('ghost_origin', 'ghost_node_2');
    addEdge('ghost_origin', 'ghost_node_3');
    addEdge('ghost_node_3', 'ghost_node_5');
    addEdge('ghost_node_5', 'ghost_node_6');
    addEdge('ghost_origin', 'ghost_node_4');
    addEdge('ghost_node_4', 'ghost_node_6');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('r_notable_4', 'ghost_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'ghost';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('ghost_node_3')) hp += 8;
    if (hasNode('ghost_node_4')) hp += 8;
    if (hasNode('ghost_node_5')) hp += 8;
    if (hasNode('ghost_node_6')) hp += 8;
    if (hasNode('ghost_notable_2')) hp += 18;
    if (hasNode('ghost_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('ghost_node_1')) dmg += 3;
    if (hasNode('ghost_node_2')) dmg += 3;
    if (hasNode('ghost_notable_1')) dmg += 6;
    if (hasNode('ghost_keystone')) dmg += 10;
    return dmg;
  }
};
