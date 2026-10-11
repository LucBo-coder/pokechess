// =============================================
// TALISMAN / ITEM: CHOICE BAND
// Official Icon: assets/items/choice-band.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['choice_band'] = {
  id: 'choice_band',
  name: "Choice Band",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('choice-band.png') : 'assets/items/choice-band.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "A tenacious headband that bolsters physical attack power (+8 ATK).",
  bonusAtk: 8,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['choice_band'];
}
