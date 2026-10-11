// =============================================
// TALISMAN / ITEM: METAL COAT
// Official Icon: assets/items/metal-coat.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['metal_coat'] = {
  id: 'metal_coat',
  name: "Metal Coat",
  price: 7,
  maxUses: 1,
  isSpell: true,
  category: 'stone',
  icon: typeof getItemIcon === 'function' ? getItemIcon('metal-coat.png') : 'assets/items/metal-coat.png',
  targetTypes: 'all',
  targetDesc: "Onix, Scyther",
  desc: "A special metallic film that triggers immediate steel evolution (Steelix, Scizor). Single use.",
  cast(ui, pieceOrItem) {
    if (typeof castEvolutionStone === 'function') {
      return castEvolutionStone(this, ui, pieceOrItem);
    }
    return false;
  }
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['metal_coat'];
}
