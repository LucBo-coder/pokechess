// =============================================
// TALISMAN / ITEM: GROUND GEM
// Official Icon: assets/items/ground-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['ground_gem'] = {
  id: 'ground_gem',
  name: "Ground Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('ground-gem.png') : 'assets/items/ground-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'ground',
  bonusAtk: 2,
  bonusHp: 8,
  desc: "Jewel reinforced with Earthen bedrock (+2 ATK, +8 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to GROUND (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['ground_gem'];
}
