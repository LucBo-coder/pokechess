// =============================================
// TALISMAN / ITEM: LEFTOVERS
// Official Icon: assets/items/leftovers.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['leftovers'] = {
  id: 'leftovers',
  name: "Leftovers",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('leftovers.png') : 'assets/items/leftovers.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 12,
  desc: "Restores 4 HP at the end of each round (+12 Max HP).",
  hasLeftovers: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['leftovers'];
}
