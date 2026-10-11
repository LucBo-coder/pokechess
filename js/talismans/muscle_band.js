// =============================================
// TALISMAN / ITEM: MUSCLE BAND
// Official Icon: assets/items/muscle-band.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['muscle_band'] = {
  id: 'muscle_band',
  name: "Muscle Band",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('muscle-band.png') : 'assets/items/muscle-band.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 6,
  bonusAtk: 5,
  desc: "Woven headband (+5 ATK, +6 Max HP). Attacks deal extra bonus damage equal to 4% of target's current HP.",
  hasMuscleBand: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['muscle_band'];
}
