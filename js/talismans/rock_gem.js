// =============================================
// TALISMAN / ITEM: ROCK GEM
// Official Icon: assets/items/rock-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['rock_gem'] = {
  id: 'rock_gem',
  name: "Rock Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('rock-gem.png') : 'assets/items/rock-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'rock',
  bonusAtk: 2,
  bonusHp: 8,
  dmgReduction: 1,
  desc: "Jewel encrusted in Granite stone (+2 ATK, +8 HP, -1 DMG taken). Overrides or sets the Pokémon's 2nd Element (Type 2) to ROCK (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['rock_gem'];
}
