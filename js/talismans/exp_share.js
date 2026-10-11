// =============================================
// TALISMAN / ITEM: EXP. SHARE
// Official Icon: assets/items/exp-share.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['exp_share'] = {
  id: 'exp_share',
  name: "Exp. Share",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('exp-share.png') : 'assets/items/exp-share.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusAtk: 2,
  desc: "Growth antenna (+2 ATK, +12 Max HP) awarding +1 bonus evolution battle win credit per victory.",
  bonusHp: 12,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['exp_share'];
}
