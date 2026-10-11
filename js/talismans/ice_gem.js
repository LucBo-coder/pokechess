// =============================================
// TALISMAN / ITEM: ICE GEM
// Official Icon: assets/items/ice-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['ice_gem'] = {
  id: 'ice_gem',
  name: "Ice Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('ice-gem.png') : 'assets/items/ice-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'ice',
  bonusAtk: 3,
  bonusHp: 4,
  desc: "Jewel frozen with Ice energy (+3 ATK, +4 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to ICE (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['ice_gem'];
}
