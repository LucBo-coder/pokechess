// =============================================
// TREE MATRIX: FLYING CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (-546, 651)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['flying'] = {
  id: 'flying',
  name: 'FLYING CONSTELLATION',
  element: 'flying',
  centerX: -546,
  centerY: 651,
  themeColor: '#7bed9f',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom flying silhouette)
    addNode('flying_origin', 'FLYING STAR', 'origin', 'flying', -546, 651, 'The soaring core of Flying gale.', 'both', 'flying');
    addNode('flying_node_1', 'Inner Wing Left', 'minor', 'flying', -601, 626, '+3 ATK to Flying Pokémon.', 'atk');
    addNode('flying_node_2', 'Mid Wing Left', 'minor', 'flying', -651, 601, '+3 ATK to Flying Pokémon.', 'atk');
    addNode('flying_notable_1', 'GALE FORCE', 'notable', 'flying', -696, 566, 'Flying Pokémon deal +7 bonus ATK.', 'notable');
    addNode('flying_node_3', 'Inner Wing Right', 'minor', 'flying', -491, 626, '+6 Max HP to Flying Pokémon.', 'hp');
    addNode('flying_node_4', 'Mid Wing Right', 'minor', 'flying', -441, 601, '+6 Max HP to Flying Pokémon.', 'hp');
    addNode('flying_notable_2', 'TAILWIND DRIFT', 'notable', 'flying', -396, 566, 'Flying Pokémon gain +15% dodge chance and +1 attack range.', 'notable');
    addNode('flying_node_5', 'Tail Feather Left', 'minor', 'flying', -571, 706, '+6 Max HP to Flying Pokémon.', 'hp');
    addNode('flying_node_6', 'Tail Feather Right', 'minor', 'flying', -521, 706, '+3 ATK to Flying Pokémon.', 'atk');
    addNode('flying_keystone', 'AERIAL SUPREMACY', 'keystone', 'flying', -546, 541, 'KEYSTONE: Flying Pokémon can fly over all pieces and barriers, gain +20% evasion, and deal double damage on first strike!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('flying_origin', 'flying_node_1');
    addEdge('flying_node_1', 'flying_node_2');
    addEdge('flying_node_2', 'flying_notable_1');
    addEdge('flying_notable_1', 'flying_keystone');
    addEdge('flying_origin', 'flying_node_3');
    addEdge('flying_node_3', 'flying_node_4');
    addEdge('flying_node_4', 'flying_notable_2');
    addEdge('flying_notable_2', 'flying_keystone');
    addEdge('flying_origin', 'flying_node_5');
    addEdge('flying_origin', 'flying_node_6');
    addEdge('flying_node_5', 'flying_node_6');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('a_elem_3', 'flying_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'flying';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('flying_node_3')) hp += 8;
    if (hasNode('flying_node_4')) hp += 8;
    if (hasNode('flying_node_5')) hp += 8;
    if (hasNode('flying_notable_2')) hp += 18;
    if (hasNode('flying_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('flying_node_1')) dmg += 3;
    if (hasNode('flying_node_2')) dmg += 3;
    if (hasNode('flying_node_6')) dmg += 3;
    if (hasNode('flying_notable_1')) dmg += 6;
    if (hasNode('flying_keystone')) dmg += 10;
    return dmg;
  }
};
