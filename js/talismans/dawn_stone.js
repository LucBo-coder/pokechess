// =============================================
// TALISMAN / ITEM: DAWN STONE
// Official Icon: assets/items/dawn-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['dawn_stone'] = {
  id: 'dawn_stone',
  name: "Dawn Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('dawn-stone.png') : 'assets/items/dawn-stone.png',
  targetTypes: 'all',
  targetDesc: "Psychic / Fairy compatible Pokémon",
  desc: "A sparkling stone as bright as the morning dawn that triggers immediate evolution. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['dawn_stone'];
}
