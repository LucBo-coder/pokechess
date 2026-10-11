// =============================================
// TALISMAN / ITEM: FLOAT STONE
// Official Icon: assets/items/float-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['float_stone'] = {
  id: 'float_stone',
  name: "Float Stone",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('float-stone.png') : 'assets/items/float-stone.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 6,
  bonusAtk: 3,
  bonusSpeed: 30,
  desc: "Zero Gravity (+3 ATK, +6 Max HP, +30 SPD). Makes the holder weightless (+30 SPD), allowing it to leap directly over obstacles and other units like a Knight!",
  hasFloatStone: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['float_stone'];
}
