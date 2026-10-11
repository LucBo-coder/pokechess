// =============================================
// TREE MATRIX: DRAGON CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (546, -651)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['dragon'] = {
  id: 'dragon',
  name: 'DRAGON CONSTELLATION',
  element: 'dragon',
  centerX: 546,
  centerY: -651,
  themeColor: '#6c5ce7',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom dragon silhouette)
    addNode('dragon_origin', 'DRAGON STAR', 'origin', 'dragon', 546, -651, 'The mythical heart of Dragon sovereignty.', 'both', 'dragon');
    addNode('dragon_node_1', 'Draco Crest Left', 'minor', 'dragon', 501, -721, '+4 ATK to Dragon Pokémon.', 'atk');
    addNode('dragon_node_2', 'Draco Crest Right', 'minor', 'dragon', 591, -721, '+4 ATK to Dragon Pokémon.', 'atk');
    addNode('dragon_notable_1', 'DRACO METEOR', 'notable', 'dragon', 456, -766, 'Dragon Pokémon deal +8 bonus ATK.', 'notable');
    addNode('dragon_notable_2', 'DRAGON SCALE', 'notable', 'dragon', 636, -766, 'Dragon Pokémon gain +25 Max HP and take 20% reduced damage.', 'notable');
    addNode('dragon_node_3', 'Wyrm Wing Left', 'minor', 'dragon', 421, -671, '+10 Max HP to Dragon Pokémon.', 'hp');
    addNode('dragon_node_4', 'Wyrm Wing Right', 'minor', 'dragon', 671, -671, '+10 Max HP to Dragon Pokémon.', 'hp');
    addNode('dragon_node_5', 'Dragon Claw Left', 'minor', 'dragon', 501, -586, '+3 ATK to Dragon Pokémon.', 'atk');
    addNode('dragon_node_6', 'Dragon Claw Right', 'minor', 'dragon', 591, -586, '+3 ATK to Dragon Pokémon.', 'atk');
    addNode('dragon_keystone', 'APEX DRAGON LORD', 'keystone', 'dragon', 546, -801, 'KEYSTONE: Dragon Pokémon gain +15 ATK, +30 Max HP, and execute enemies below 20% HP instantly!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('dragon_origin', 'dragon_node_1');
    addEdge('dragon_node_1', 'dragon_notable_1');
    addEdge('dragon_notable_1', 'dragon_keystone');
    addEdge('dragon_origin', 'dragon_node_2');
    addEdge('dragon_node_2', 'dragon_notable_2');
    addEdge('dragon_notable_2', 'dragon_keystone');
    addEdge('dragon_origin', 'dragon_node_3');
    addEdge('dragon_node_3', 'dragon_node_1');
    addEdge('dragon_origin', 'dragon_node_4');
    addEdge('dragon_node_4', 'dragon_node_2');
    addEdge('dragon_origin', 'dragon_node_5');
    addEdge('dragon_origin', 'dragon_node_6');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('w_gold_3', 'dragon_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'dragon';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('dragon_node_3')) hp += 8;
    if (hasNode('dragon_node_4')) hp += 8;
    if (hasNode('dragon_notable_2')) hp += 18;
    if (hasNode('dragon_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('dragon_node_1')) dmg += 3;
    if (hasNode('dragon_node_2')) dmg += 3;
    if (hasNode('dragon_node_5')) dmg += 3;
    if (hasNode('dragon_node_6')) dmg += 3;
    if (hasNode('dragon_notable_1')) dmg += 6;
    if (hasNode('dragon_keystone')) dmg += 10;
    return dmg;
  }
};
