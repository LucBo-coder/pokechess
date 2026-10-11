// =============================================
// TALISMAN / ITEM: BLACK BELT
// Official Icon: assets/items/black-belt.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['black_belt'] = {
  id: 'black_belt',
  name: "Black Belt",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('black-belt.png') : 'assets/items/black-belt.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Martial belt (+5 ATK, +10 Max HP). When below 50% HP, enrages for +25% Berserk damage.",
  bonusAtk: 5,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['black_belt'];
}
