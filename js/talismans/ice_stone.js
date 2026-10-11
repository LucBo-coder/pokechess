// =============================================
// TALISMAN / ITEM: ICE STONE
// Official Icon: assets/items/ice-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['ice_stone'] = {
  id: 'ice_stone',
  name: "Ice Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('ice-stone.png') : 'assets/items/ice-stone.png',
  targetTypes: 'all',
  targetDesc: "Ice compatible Pokémon",
  desc: "A stone with a snowflake pattern that induces immediate frosty evolution. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['ice_stone'];
}
