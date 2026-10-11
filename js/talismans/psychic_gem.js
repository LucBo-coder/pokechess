// =============================================
// TALISMAN / ITEM: PSYCHIC GEM
// Official Icon: assets/items/psychic-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['psychic_gem'] = {
  id: 'psychic_gem',
  name: "Psychic Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('psychic-gem.png') : 'assets/items/psychic-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'psychic',
  bonusAtk: 3,
  bonusHp: 5,
  desc: "Jewel pulsing with Psychic telekinesis (+3 ATK, +5 HP). Overrides or sets the Pokémon's 2nd Element (Type 2) to PSYCHIC (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['psychic_gem'];
}
