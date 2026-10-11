// =============================================
// TALISMAN / ITEM: MYSTIC WATER
// Official Icon: assets/items/mystic-water.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['mystic_water'] = {
  id: 'mystic_water',
  name: "Mystic Water",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('mystic-water.png') : 'assets/items/mystic-water.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  bonusAtk: 4,
  desc: "Teardrop gem (+4 ATK, +10 Max HP). Water Pokémon attacks deal +3 bonus damage and splash-heals adjacent allies for +3 HP.",
  hasMysticWater: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['mystic_water'];
}
