// =============================================
// TALISMAN / ITEM: FLYING GEM
// Official Icon: assets/items/flying-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['flying_gem'] = {
  id: 'flying_gem',
  name: "Flying Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('flying-gem.png') : 'assets/items/flying-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'flying',
  bonusAtk: 2,
  bonusHp: 4,
  bonusSpeed: 15,
  desc: "Jewel blessed with Zephyr wind (+2 ATK, +4 HP, +15 SPD). Overrides or sets the Pokémon's 2nd Element (Type 2) to FLYING (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['flying_gem'];
}
