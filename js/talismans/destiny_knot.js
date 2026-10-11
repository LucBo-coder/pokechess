// =============================================
// TALISMAN / ITEM: DESTINY KNOT
// Official Icon: assets/items/destiny-knot.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['destiny_knot'] = {
  id: 'destiny_knot',
  name: "Destiny Knot",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('destiny-knot.png') : 'assets/items/destiny-knot.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Fate Bond (+10 Max HP). When defeated in combat, ties its killer's destiny, dealing payback true damage equal to 50% of the killer's current HP!",
  hasDestinyKnot: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['destiny_knot'];
}
