// =============================================
// TALISMAN / ITEM: LEAF STONE
// Official Icon: assets/items/leaf-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['leaf_stone'] = {
  id: 'leaf_stone',
  name: "Leaf Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('leaf-stone.png') : 'assets/items/leaf-stone.png',
  targetTypes: 'all',
  targetDesc: "Grass / Stone compatible Pokémon",
  desc: "A peculiar stone that makes certain Pokémon evolve immediately into lush flora forms. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['leaf_stone'];
}
