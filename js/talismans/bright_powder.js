// =============================================
// TALISMAN / ITEM: BRIGHT POWDER
// Official Icon: assets/items/bright-powder.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['bright_powder'] = {
  id: 'bright_powder',
  name: "Bright Powder",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('bright-powder.png') : 'assets/items/bright-powder.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Glittering powder (+8 Max HP) that casts a tricky glare, granting holder +18% Evasion chance to completely dodge attacks.",
  hasBrightPowder: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['bright_powder'];
}
