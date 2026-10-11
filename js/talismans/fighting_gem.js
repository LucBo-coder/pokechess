// =============================================
// TALISMAN / ITEM: FIGHTING GEM
// Official Icon: assets/items/fighting-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['fighting_gem'] = {
  id: 'fighting_gem',
  name: "Fighting Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('fighting-gem.png') : 'assets/items/fighting-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'fighting',
  bonusAtk: 4,
  bonusHp: 4,
  desc: "Jewel burning with Fighting spirit (+4 ATK, +4 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to FIGHTING (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['fighting_gem'];
}
