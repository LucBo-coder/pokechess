// =============================================
// TALISMAN / ITEM: EJECT BUTTON
// Official Icon: assets/items/eject-button.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['eject_button'] = {
  id: 'eject_button',
  name: "Eject Button",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('eject-button.png') : 'assets/items/eject-button.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Panic Switch (+8 Max HP). When holder is struck by an attack, it instantly emergency-teleports to an empty edge square to avoid further danger (once per battle).",
  hasEjectButton: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['eject_button'];
}
