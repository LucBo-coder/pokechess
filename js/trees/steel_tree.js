// =============================================
// TREE MATRIX: STEEL CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (736, 425)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['steel'] = {
  id: 'steel',
  name: 'STEEL CONSTELLATION',
  element: 'steel',
  centerX: 736,
  centerY: 425,
  themeColor: '#718093',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom steel silhouette)
    addNode('steel_origin', 'STEEL STAR', 'origin', 'steel', 736, 425, 'The fortified boss of Steel impenetrable armor.', 'both', 'steel');
    addNode('steel_node_1', 'Shield Rim Left', 'minor', 'steel', 661, 370, '+12 Max HP to Steel Pokémon.', 'hp');
    addNode('steel_node_2', 'Shield Rim Right', 'minor', 'steel', 811, 370, '+12 Max HP to Steel Pokémon.', 'hp');
    addNode('steel_node_6', 'Shield Rim Center', 'minor', 'steel', 736, 370, '+2 ATK to Steel Pokémon.', 'atk');
    addNode('steel_notable_1', 'TEMPERED ALLOY', 'notable', 'steel', 651, 435, 'Steel Pokémon gain +20 Max HP and take 3 flat less damage.', 'notable');
    addNode('steel_notable_2', 'STEEL BULWARK', 'notable', 'steel', 821, 435, 'Steel Pokémon grant +8 Max HP to adjacent allies.', 'notable');
    addNode('steel_node_3', 'Shield Taper Left', 'minor', 'steel', 686, 495, '+12 Max HP to Steel Pokémon.', 'hp');
    addNode('steel_node_4', 'Shield Taper Right', 'minor', 'steel', 786, 495, '+2 ATK to Steel Pokémon.', 'atk');
    addNode('steel_node_5', 'Shield Point', 'minor', 'steel', 736, 540, '+12 Max HP to Steel Pokémon.', 'hp');
    addNode('steel_keystone', 'TITANIUM FORTRESS', 'keystone', 'steel', 736, 295, 'KEYSTONE: Steel Pokémon gain +40 Max HP and reflect 100% of damage taken while shielding!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('steel_node_1', 'steel_node_6');
    addEdge('steel_node_6', 'steel_node_2');
    addEdge('steel_node_2', 'steel_notable_2');
    addEdge('steel_notable_2', 'steel_node_4');
    addEdge('steel_node_4', 'steel_node_5');
    addEdge('steel_node_5', 'steel_node_3');
    addEdge('steel_node_3', 'steel_notable_1');
    addEdge('steel_notable_1', 'steel_node_1');
    addEdge('steel_origin', 'steel_node_6');
    addEdge('steel_origin', 'steel_notable_1');
    addEdge('steel_origin', 'steel_notable_2');
    addEdge('steel_origin', 'steel_node_5');
    addEdge('steel_node_1', 'steel_keystone');
    addEdge('steel_node_2', 'steel_keystone');
    addEdge('steel_node_6', 'steel_keystone');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('w_notable_5', 'steel_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'steel';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('steel_node_1')) hp += 8;
    if (hasNode('steel_node_2')) hp += 8;
    if (hasNode('steel_node_3')) hp += 8;
    if (hasNode('steel_node_5')) hp += 8;
    if (hasNode('steel_notable_1')) hp += 18;
    if (hasNode('steel_notable_2')) hp += 18;
    if (hasNode('steel_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('steel_node_4')) dmg += 3;
    if (hasNode('steel_node_6')) dmg += 3;
    if (hasNode('steel_keystone')) dmg += 10;
    return dmg;
  }
};
