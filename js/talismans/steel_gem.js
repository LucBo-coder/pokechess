// =============================================
// TALISMAN / ITEM: STEEL GEM
// Official Icon: assets/items/steel-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['steel_gem'] = {
  id: 'steel_gem',
  name: "Steel Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('steel-gem.png') : 'assets/items/steel-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'steel',
  bonusAtk: 2,
  bonusHp: 8,
  dmgReduction: 1,
  desc: "Jewel forged in Tempered titanium (+2 ATK, +8 HP, -1 DMG taken). Overrides or sets the Pokémon's 2nd Element (Type 2) to STEEL (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['steel_gem'];
}
