// =============================================
// TALISMAN / ITEM: WISE GLASSES
// Official Icon: assets/items/wise-glasses.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['wise_glasses'] = {
  id: 'wise_glasses',
  name: "Wise Glasses",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('wise-glasses.png') : 'assets/items/wise-glasses.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  bonusAtk: 4,
  desc: "Scholarly spectacles (+4 ATK, +8 Max HP). Each attack landed permanently grants +1 ATK for the rest of battle (up to +4).",
  hasWiseGlasses: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['wise_glasses'];
}
