// =============================================
// TALISMAN / ITEM: GHOST GEM
// Official Icon: assets/items/ghost-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['ghost_gem'] = {
  id: 'ghost_gem',
  name: "Ghost Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('ghost-gem.png') : 'assets/items/ghost-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'ghost',
  bonusAtk: 3,
  bonusHp: 4,
  desc: "Jewel haunted by Spectral apparitions (+3 ATK, +4 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to GHOST (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['ghost_gem'];
}
