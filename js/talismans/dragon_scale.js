// =============================================
// TALISMAN / ITEM: DRAGON SCALE
// Official Icon: assets/items/dragon-scale.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['dragon_scale'] = {
  id: 'dragon_scale',
  name: "Dragon Scale",
  price: 7,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('dragon-scale.png') : 'assets/items/dragon-scale.png',
  targetTypes: 'all',
  targetDesc: "Seadra",
  desc: "A thick, tough scale that causes Seadra to evolve immediately into Kingdra. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['dragon_scale'];
}
