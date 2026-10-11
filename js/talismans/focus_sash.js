// =============================================
// TALISMAN / ITEM: FOCUS SASH
// Official Icon: assets/items/focus-sash.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['focus_sash'] = {
  id: 'focus_sash',
  name: "Focus Sash",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('focus-sash.png') : 'assets/items/focus-sash.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Cheat Death! (+10 Max HP) When receiving fatal damage, endures with 1 HP (1 time per battle).",
  hasFocusSash: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['focus_sash'];
}
