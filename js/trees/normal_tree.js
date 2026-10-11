// =============================================
// TREE MATRIX: NORMAL CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (546, 651)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['normal'] = {
  id: 'normal',
  name: 'NORMAL CONSTELLATION',
  element: 'normal',
  centerX: 546,
  centerY: 651,
  themeColor: '#a4b0be',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom normal silhouette)
    addNode('normal_origin', 'NORMAL STAR', 'origin', 'normal', 546, 651, 'The balanced center of Normal versatility.', 'both', 'normal');
    addNode('normal_node_1', 'North Cardinal Ray', 'minor', 'normal', 546, 576, '+4 Max HP & +1 ATK.', 'both');
    addNode('normal_node_2', 'South Cardinal Ray', 'minor', 'normal', 546, 726, '+4 Max HP & +1 ATK.', 'both');
    addNode('normal_notable_1', 'ADAPTIVE INSTINCT', 'notable', 'normal', 451, 651, 'Normal Pokémon gain +12 Max HP and +3 ATK.', 'notable');
    addNode('normal_notable_2', 'ENDURING SPIRIT', 'notable', 'normal', 641, 651, 'Normal Pokémon survive lethal hits once with 1 HP.', 'notable');
    addNode('normal_node_3', 'Diamond Ray NW', 'minor', 'normal', 491, 596, '+6 Max HP to Normal Pokémon.', 'hp');
    addNode('normal_node_4', 'Diamond Ray NE', 'minor', 'normal', 601, 596, '+2 ATK to Normal Pokémon.', 'atk');
    addNode('normal_node_5', 'Diamond Ray SW', 'minor', 'normal', 491, 706, '+6 Max HP to Normal Pokémon.', 'hp');
    addNode('normal_node_6', 'Diamond Ray SE', 'minor', 'normal', 601, 706, '+2 ATK to Normal Pokémon.', 'atk');
    addNode('normal_keystone', 'PRIMAL POTENTIAL', 'keystone', 'normal', 546, 511, 'KEYSTONE: Normal Pokémon copy the highest stat buff among all team members and gain +20% all stats!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('normal_origin', 'normal_node_1');
    addEdge('normal_origin', 'normal_node_2');
    addEdge('normal_origin', 'normal_notable_1');
    addEdge('normal_origin', 'normal_notable_2');
    addEdge('normal_node_1', 'normal_node_4');
    addEdge('normal_node_4', 'normal_notable_2');
    addEdge('normal_notable_2', 'normal_node_6');
    addEdge('normal_node_6', 'normal_node_2');
    addEdge('normal_node_2', 'normal_node_5');
    addEdge('normal_node_5', 'normal_notable_1');
    addEdge('normal_notable_1', 'normal_node_3');
    addEdge('normal_node_3', 'normal_node_1');
    addEdge('normal_node_3', 'normal_keystone');
    addEdge('normal_node_4', 'normal_keystone');
    addEdge('normal_node_1', 'normal_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('a_mana_3', 'normal_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'normal';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('normal_node_1')) hp += 8;
    if (hasNode('normal_node_2')) hp += 8;
    if (hasNode('normal_node_3')) hp += 8;
    if (hasNode('normal_node_5')) hp += 8;
    if (hasNode('normal_notable_1')) hp += 18;
    if (hasNode('normal_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('normal_node_1')) dmg += 3;
    if (hasNode('normal_node_2')) dmg += 3;
    if (hasNode('normal_node_4')) dmg += 3;
    if (hasNode('normal_node_6')) dmg += 3;
    if (hasNode('normal_notable_1')) dmg += 6;
    if (hasNode('normal_keystone')) dmg += 10;
    return dmg;
  }
};
