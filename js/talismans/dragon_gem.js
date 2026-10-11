// =============================================
// TALISMAN / ITEM: DRAGON GEM
// Official Icon: assets/items/dragon-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['dragon_gem'] = {
  id: 'dragon_gem',
  name: "Dragon Gem",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('dragon-gem.png') : 'assets/items/dragon-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'dragon',
  bonusAtk: 4,
  bonusHp: 6,
  desc: "Jewel radiating Ancient Draconic fury (+4 ATK, +6 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to DRAGON (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['dragon_gem'];
}
