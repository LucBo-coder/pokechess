// =============================================
// TREE MATRIX: ELECTRIC CONSTELLATION
// Motif: Custom Geometric Shape (10 nodes)
// Unified Map Coordinates: (291, -799)
// =============================================

'use strict';

if (typeof TREE_REGISTRY === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TREE_REGISTRY = {};
}

TREE_REGISTRY['electric'] = {
  id: 'electric',
  name: 'ELECTRIC CONSTELLATION',
  element: 'electric',
  centerX: 291,
  centerY: -799,
  themeColor: '#ffa502',

  buildGraph(addNode, addEdge) {
    // 1. CONSTELLATION NODES (Forming custom electric silhouette)
    addNode('electric_origin', 'ELECTRIC STAR', 'origin', 'electric', 291, -799, 'The thunderous nexus of Electric power.', 'both', 'electric');
    addNode('electric_node_1', 'Thunder Bar I', 'minor', 'electric', 246, -909, '+3 ATK to Electric Pokémon.', 'atk');
    addNode('electric_node_2', 'Thunder Bar II', 'minor', 'electric', 336, -909, '+3 ATK to Electric Pokémon.', 'atk');
    addNode('electric_notable_1', 'HIGH VOLTAGE', 'notable', 'electric', 311, -854, 'Electric Pokémon gain +6 ATK and +10% Critical Strike Chance.', 'notable');
    addNode('electric_node_3', 'Volt Step I', 'minor', 'electric', 256, -819, '+6 Max HP & +2 ATK.', 'both');
    addNode('electric_node_4', 'Volt Step II', 'minor', 'electric', 336, -784, '+3 ATK to Electric Pokémon.', 'atk');
    addNode('electric_notable_2', 'STATIC AURA', 'notable', 'electric', 271, -744, 'Electric Pokémon paralyze attackers for 1 turn upon taking damage.', 'notable');
    addNode('electric_node_5', 'Ground Discharge', 'minor', 'electric', 236, -714, '+8 Max HP to Electric Pokémon.', 'hp');
    addNode('electric_node_6', 'Flux Capacitor', 'minor', 'electric', 291, -769, '+6 Max HP to Electric Pokémon.', 'hp');
    addNode('electric_keystone', 'VOLTAIC OVERLOAD', 'keystone', 'electric', 301, -664, 'KEYSTONE: Electric Pokémon gain +25% Critical Strike Chance and critical hits chain lightning to adjacent enemies!', 'keystone');

    // 2. INTERNAL CONSTELLATION EDGES
    addEdge('electric_node_1', 'electric_node_2');
    addEdge('electric_node_2', 'electric_notable_1');
    addEdge('electric_notable_1', 'electric_origin');
    addEdge('electric_origin', 'electric_node_3');
    addEdge('electric_node_3', 'electric_node_4');
    addEdge('electric_node_4', 'electric_notable_2');
    addEdge('electric_notable_2', 'electric_node_5');
    addEdge('electric_notable_2', 'electric_keystone');
    addEdge('electric_origin', 'electric_node_6');
    addEdge('electric_node_6', 'electric_notable_2');

    // 3. CELESTIAL BRIDGE: Connects from Core Tree into this Elemental Origin
    addEdge('m_notable_3', 'electric_origin');
  },

  isMatchingPiece(piece) {
    if (!piece) return false;
    const pDef = (typeof PIECES !== 'undefined') ? PIECES[piece.type] : null;
    if (!pDef) return false;
    const t = 'electric';
    return (pDef.element && pDef.element.toLowerCase() === t) ||
           (pDef.element2 && pDef.element2.toLowerCase() === t);
  },

  getBonusHp(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let hp = 0;
    if (hasNode('electric_node_3')) hp += 8;
    if (hasNode('electric_node_5')) hp += 8;
    if (hasNode('electric_node_6')) hp += 8;
    if (hasNode('electric_notable_2')) hp += 18;
    if (hasNode('electric_keystone')) hp += 25;
    return hp;
  },

  getBonusAtk(piece, stage, hasNode) {
    if (!this.isMatchingPiece(piece)) return 0;
    let dmg = 0;
    if (hasNode('electric_node_1')) dmg += 3;
    if (hasNode('electric_node_2')) dmg += 3;
    if (hasNode('electric_node_3')) dmg += 3;
    if (hasNode('electric_node_4')) dmg += 3;
    if (hasNode('electric_notable_1')) dmg += 6;
    if (hasNode('electric_keystone')) dmg += 10;
    return dmg;
  }
};
