// =============================================
// TALISMAN / ITEM: DRAGON FANG
// Official Icon: assets/items/dragon-fang.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['dragon_fang'] = {
  id: 'dragon_fang',
  name: "Dragon Fang",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('dragon-fang.png') : 'assets/items/dragon-fang.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Dragon fang (+5 ATK, +8 Max HP). Restores 15 HP upon eliminating an enemy.",
  bonusAtk: 5,
  hasLifesteal: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['dragon_fang'];
}
