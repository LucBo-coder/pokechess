// =============================================
// TALISMAN / ITEM: DUSK STONE
// Official Icon: assets/items/dusk-stone.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['dusk_stone'] = {
  id: 'dusk_stone',
  name: "Dusk Stone",
  price: 6,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('dusk-stone.png') : 'assets/items/dusk-stone.png',
  targetTypes: 'all',
  targetDesc: "Dark / Ghost compatible Pokémon",
  desc: "A dark stone that radiates eerie twilight power, triggering immediate evolution. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['dusk_stone'];
}
