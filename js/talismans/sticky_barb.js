// =============================================
// TALISMAN / ITEM: STICKY BARB
// Official Icon: assets/items/sticky-barb.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['sticky_barb'] = {
  id: 'sticky_barb',
  name: "Sticky Barb",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('sticky-barb.png') : 'assets/items/sticky-barb.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Prickly Parasite (+10 Max HP). When struck by an enemy, transfers a barbed thorn onto the attacker that bleeds them for 3 true damage each round.",
  hasStickyBarb: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['sticky_barb'];
}
