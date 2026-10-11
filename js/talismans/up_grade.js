// =============================================
// TALISMAN / ITEM: UP-GRADE
// Official Icon: assets/items/up-grade.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['up_grade'] = {
  id: 'up_grade',
  name: "Up-Grade",
  price: 7,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('up-grade.png') : 'assets/items/up-grade.png',
  targetTypes: 'all',
  targetDesc: "Porygon",
  desc: "A transparent device containing all sorts of data that evolves Porygon into Porygon2. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['up_grade'];
}
