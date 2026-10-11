// =============================================
// TALISMAN / ITEM: METRONOME
// Official Icon: assets/items/metronome.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['metronome'] = {
  id: 'metronome',
  name: "Metronome",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('metronome.png') : 'assets/items/metronome.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusAtk: 4,
  desc: "Rhythmic pendulum (+4 ATK). Consecutive attacks increase in power, dealing +2 extra damage per consecutive hit (up to +6 bonus damage).",
  hasMetronome: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['metronome'];
}
