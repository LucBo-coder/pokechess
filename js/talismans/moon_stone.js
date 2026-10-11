// =============================================
// TALISMAN / ITEM: MOON STONE
// Official Icon: assets/items/moon-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['moon_stone'] = {
  id: 'moon_stone',
  name: "Moon Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('moon-stone.png') : 'assets/items/moon-stone.png',
  targetTypes: 'all',
  targetDesc: "Moon / Fairy compatible Pokémon",
  desc: "A stone dark as the night sky that triggers immediate lunar evolution. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['moon_stone'];
}
