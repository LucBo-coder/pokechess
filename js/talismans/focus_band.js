// =============================================
// TALISMAN / ITEM: FOCUS BAND
// Official Icon: assets/items/focus-band.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['focus_band'] = {
  id: 'focus_band',
  name: "Focus Band",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('focus-band.png') : 'assets/items/focus-band.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 12,
  desc: "Resolute headband (+12 Max HP). When receiving lethal damage, has 35% chance to endure with 1 HP.",
  hasFocusBand: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['focus_band'];
}
