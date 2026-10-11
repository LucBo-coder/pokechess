// =============================================
// TREE MATRIX: ICE CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-291, 799)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['ice'] = {
  id: 'ice',
  name: 'ICE CONSTELLATION',
  element: 'ice',
  centerX: -291,
  centerY: 799,
  themeColor: '#70a1ff',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom ice silhouette)
    addNode('ice_origin', 'ICE STAR', 'origin', 'ice', -291, 799, 'The frozen epicenter of Ice crystals.', 'both', 'ice');
    addNode('ice_node_1', 'Crystal Spoke NE', 'minor', 'ice', -221, 759, '+10 Max HP to Ice Pokémon.', 'hp');
    addNode('ice_notable_1', 'FROST CARAPACE', 'notable', 'ice', -181, 734, 'Ice Pokémon gain +20 Max HP and take 3 flat less damage.', 'notable');
    addNode('ice_node_2', 'Crystal Spoke SE', 'minor', 'ice', -221, 839, '+2 ATK to Ice Pokémon.', 'atk');
    addNode('ice_node_5', 'Crystal Spoke South', 'minor', 'ice', -291, 884, '+10 Max HP to Ice Pokémon.', 'hp');
    addNode('ice_node_3', 'Crystal Spoke SW', 'minor', 'ice', -361, 839, '+2 ATK to Ice Pokémon.', 'atk');
    addNode('ice_node_4', 'Crystal Spoke NW', 'minor', 'ice', -361, 759, '+10 Max HP to Ice Pokémon.', 'hp');
    addNode('ice_notable_2', 'BLIZZARD SHARDS', 'notable', 'ice', -401, 734, 'Ice Pokémon attacks deal +4 bonus damage and chill enemy movement.', 'notable');
    addNode('ice_node_6', 'North Apex Spoke', 'minor', 'ice', -291, 749, '+6 Max HP & +2 ATK.', 'both');
    addNode('ice_keystone', 'GLACIAL FORTRESS', 'keystone', 'ice', -291, 674, 'KEYSTONE: Ice Pokémon take 30% reduced damage from all sources and freeze attackers for 1 turn!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('ice_origin', 'ice_node_6');
    addEdge('ice_node_6', 'ice_keystone');
    addEdge('ice_origin', 'ice_node_1');
    addEdge('ice_node_1', 'ice_notable_1');
    addEdge('ice_notable_1', 'ice_keystone');
    addEdge('ice_origin', 'ice_node_4');
    addEdge('ice_node_4', 'ice_notable_2');
    addEdge('ice_notable_2', 'ice_keystone');
    addEdge('ice_origin', 'ice_node_2');
    addEdge('ice_origin', 'ice_node_5');
    addEdge('ice_origin', 'ice_node_3');
    addEdge('ice_node_2', 'ice_node_5');
    addEdge('ice_node_5', 'ice_node_3');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('a_notable_4', 'ice_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'ice';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('ice_node_1')) hp += 8;
    if (hasNode('ice_node_4')) hp += 8;
    if (hasNode('ice_node_5')) hp += 8;
    if (hasNode('ice_node_6')) hp += 8;
    if (hasNode('ice_notable_1')) hp += 18;
    if (hasNode('ice_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('ice_node_2')) dmg += 3;
    if (hasNode('ice_node_3')) dmg += 3;
    if (hasNode('ice_node_6')) dmg += 3;
    if (hasNode('ice_notable_2')) dmg += 6;
    if (hasNode('ice_keystone')) dmg += 10;
    return dmg;
  }
};
