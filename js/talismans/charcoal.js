// =============================================
// TALISMAN / ITEM: CHARCOAL
// Official Icon: assets/items/charcoal.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['charcoal'] = {
  id: 'charcoal',
  name: "Charcoal",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('charcoal.png') : 'assets/items/charcoal.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 6,
  bonusAtk: 5,
  desc: "Smoldering combustible fuel (+5 ATK, +6 Max HP). Fire Pokémon or Fire-type attacks deal +4 bonus damage.",
  hasCharcoal: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['charcoal'];
}
