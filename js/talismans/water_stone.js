// =============================================
// TALISMAN / ITEM: WATER STONE
// Official Icon: assets/items/water-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['water_stone'] = {
  id: 'water_stone',
  name: "Water Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('water-stone.png') : 'assets/items/water-stone.png',
  targetTypes: 'all',
  targetDesc: "Water / Stone compatible Pokémon",
  desc: "A peculiar stone that makes certain Pokémon evolve immediately into aquatic forms. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['water_stone'];
}
