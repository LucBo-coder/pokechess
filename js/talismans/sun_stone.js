// =============================================
// TALISMAN / ITEM: SUN STONE
// Official Icon: assets/items/sun-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['sun_stone'] = {
  id: 'sun_stone',
  name: "Sun Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('sun-stone.png') : 'assets/items/sun-stone.png',
  targetTypes: 'all',
  targetDesc: "Sun / Grass compatible Pokémon",
  desc: "A stone red like the blazing sun that induces immediate solar evolution. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['sun_stone'];
}
