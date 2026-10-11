// =============================================
// TALISMAN / ITEM: FAIRY GEM
// Official Icon: assets/items/fairy-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['fairy_gem'] = {
  id: 'fairy_gem',
  name: "Fairy Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('fairy-gem.png') : 'assets/items/fairy-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'fairy',
  bonusAtk: 2,
  bonusHp: 7,
  desc: "Jewel glowing with Pixie moonlight (+2 ATK, +7 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to FAIRY (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['fairy_gem'];
}
