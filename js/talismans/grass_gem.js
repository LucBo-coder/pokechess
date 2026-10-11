// =============================================
// TALISMAN / ITEM: GRASS GEM
// Official Icon: assets/items/grass-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['grass_gem'] = {
  id: 'grass_gem',
  name: "Grass Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('grass-gem.png') : 'assets/items/grass-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'grass',
  bonusAtk: 2,
  bonusHp: 6,
  desc: "Jewel blossoming with Grass energy (+2 ATK, +6 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to GRASS (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['grass_gem'];
}
