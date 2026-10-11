// =============================================
// TALISMAN / ITEM: NORMAL GEM
// Official Icon: assets/items/normal-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['normal_gem'] = {
  id: 'normal_gem',
  name: "Normal Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('normal-gem.png') : 'assets/items/normal-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'normal',
  bonusAtk: 2,
  bonusHp: 6,
  desc: "Jewel charged with Normal energy (+2 ATK, +6 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to NORMAL (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['normal_gem'];
}
