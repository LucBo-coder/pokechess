// =============================================
// TALISMAN / ITEM: SHINY STONE
// Official Icon: assets/items/shiny-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['shiny_stone'] = {
  id: 'shiny_stone',
  name: "Shiny Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('shiny-stone.png') : 'assets/items/shiny-stone.png',
  targetTypes: 'all',
  targetDesc: "Light / Special compatible Pokémon",
  desc: "A dazzling stone that shines with pure brilliant light, triggering immediate evolution. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['shiny_stone'];
}
