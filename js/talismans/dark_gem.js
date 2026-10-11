// =============================================
// TALISMAN / ITEM: DARK GEM
// Official Icon: assets/items/dark-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['dark_gem'] = {
  id: 'dark_gem',
  name: "Dark Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('dark-gem.png') : 'assets/items/dark-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'dark',
  bonusAtk: 4,
  bonusHp: 4,
  desc: "Jewel shrouded in Malicious shadows (+4 ATK, +4 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to DARK (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['dark_gem'];
}
