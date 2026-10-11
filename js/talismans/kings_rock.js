// =============================================
// TALISMAN / ITEM: KING'S ROCK
// Official Icon: assets/items/kings-rock.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['kings_rock'] = {
  id: 'kings_rock',
  name: "King's Rock",
  price: 7,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('kings-rock.png') : 'assets/items/kings-rock.png',
  targetTypes: 'all',
  targetDesc: "Poliwhirl, Slowpoke",
  desc: "A crown-shaped rock that triggers royal evolution into Politoed or Slowking. Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['kings_rock'];
}
