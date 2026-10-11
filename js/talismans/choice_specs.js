// =============================================
// TALISMAN / ITEM: CHOICE SPECS
// Official Icon: assets/items/choice-specs.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['choice_specs'] = {
  id: 'choice_specs',
  name: "Choice Specs",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('choice-specs.png') : 'assets/items/choice-specs.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Distinctive lenses that enhance special attacks (+6 ATK, +8 Max HP, +15% trait damage).",
  bonusAtk: 6,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['choice_specs'];
}
