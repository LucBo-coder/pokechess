// =============================================
// TALISMAN / ITEM: FIRE GEM
// Official Icon: assets/items/fire-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['fire_gem'] = {
  id: 'fire_gem',
  name: "Fire Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('fire-gem.png') : 'assets/items/fire-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'fire',
  bonusAtk: 3,
  bonusHp: 4,
  desc: "Jewel blazing with Fire energy (+3 ATK, +4 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to FIRE (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['fire_gem'];
}
