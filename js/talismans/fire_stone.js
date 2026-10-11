// =============================================
// TALISMAN / ITEM: FIRE STONE
// Official Icon: assets/items/fire-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['fire_stone'] = {
  id: 'fire_stone',
  name: "Fire Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('fire-stone.png') : 'assets/items/fire-stone.png',
  targetTypes: 'all',
  targetDesc: "Fire / Stone compatible Pokémon",
  desc: "A peculiar stone that makes certain Pokémon evolve immediately into fiery forms. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['fire_stone'];
}
