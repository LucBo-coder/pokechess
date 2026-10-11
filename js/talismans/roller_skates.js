// =============================================
// TALISMAN / ITEM: ROLLER SKATES
// Official Icon: assets/items/roller-skates.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['roller_skates'] = {
  id: 'roller_skates',
  name: "Roller Skates",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('roller-skates.png') : 'assets/items/roller-skates.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "Agile roller wheels (+3 ATK, +8 Max HP, +25 SPD) granting 1-tile omnidirectional mobility and swift action.",
  bonusAtk: 3,
  bonusHp: 8,
  bonusSpeed: 25,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['roller_skates'];
}
