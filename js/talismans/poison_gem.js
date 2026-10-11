// =============================================
// TALISMAN / ITEM: POISON GEM
// Official Icon: assets/items/poison-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['poison_gem'] = {
  id: 'poison_gem',
  name: "Poison Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('poison-gem.png') : 'assets/items/poison-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'poison',
  bonusAtk: 2,
  bonusHp: 6,
  desc: "Jewel dripping with Toxic venom (+2 ATK, +6 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to POISON (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['poison_gem'];
}
