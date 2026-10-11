// =============================================
// TALISMAN / ITEM: THUNDER STONE
// Official Icon: assets/items/thunder-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['thunder_stone'] = {
  id: 'thunder_stone',
  name: "Thunder Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('thunder-stone.png') : 'assets/items/thunder-stone.png',
  targetTypes: 'all',
  targetDesc: "Electric / Stone compatible Pokémon",
  desc: "A peculiar stone that makes certain Pokémon evolve immediately into electrifying forms. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['thunder_stone'];
}
