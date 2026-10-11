// =============================================
// TALISMAN / ITEM: ELECTRIC GEM
// Official Icon: assets/items/electric-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['electric_gem'] = {
  id: 'electric_gem',
  name: "Electric Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('electric-gem.png') : 'assets/items/electric-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'electric',
  bonusAtk: 3,
  bonusHp: 4,
  bonusSpeed: 10,
  desc: "Jewel crackling with Electric energy (+3 ATK, +4 HP, +10 SPD). Overrides or sets the Pokémon's 2nd Element (Type 2) to ELECTRIC (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['electric_gem'];
}
