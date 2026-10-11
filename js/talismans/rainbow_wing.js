// =============================================
// TALISMAN / ITEM: RAINBOW WING
// Official Icon: assets/items/rainbow-wing.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['rainbow_wing'] = {
  id: 'rainbow_wing',
  name: "Rainbow Wing",
  price: 8,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('rainbow-wing.png') : 'assets/items/rainbow-wing.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 12,
  desc: "Sacred phoenix feather (+12 Max HP). Revives holder once per battle with 25% Max HP.",
  hasRevive: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['rainbow_wing'];
}
