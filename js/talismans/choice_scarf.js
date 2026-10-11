// =============================================
// TALISMAN / ITEM: CHOICE SCARF
// Official Icon: assets/items/choice-scarf.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['choice_scarf'] = {
  id: 'choice_scarf',
  name: "Choice Scarf",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('choice-scarf.png') : 'assets/items/choice-scarf.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  bonusAtk: 5,
  bonusSpeed: 40,
  desc: "A focused scarf that greatly bolsters combat speed (+5 ATK, +10 Max HP, +40 SPD). Accelerates unit in the action queue.",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['choice_scarf'];
}
