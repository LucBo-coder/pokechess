// =============================================
// TALISMAN / ITEM: EXPERT BELT
// Official Icon: assets/items/expert-belt.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['expert_belt'] = {
  id: 'expert_belt',
  name: "Expert Belt",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('expert-belt.png') : 'assets/items/expert-belt.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "Tactical belt (+4 ATK, +12 Max HP) dealing +20% extra damage on Type Advantages.",
  bonusHp: 12,
  bonusAtk: 4,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['expert_belt'];
}
