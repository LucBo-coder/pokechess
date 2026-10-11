// =============================================
// TALISMAN / ITEM: WATER GEM
// Official Icon: assets/items/water-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['water_gem'] = {
  id: 'water_gem',
  name: "Water Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('water-gem.png') : 'assets/items/water-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'water',
  bonusAtk: 2,
  bonusHp: 6,
  desc: "Jewel imbued with Water energy (+2 ATK, +6 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to WATER (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['water_gem'];
}
