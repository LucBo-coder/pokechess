// =============================================
// TALISMAN / ITEM: WEAKNESS POLICY
// Official Icon: assets/items/weakness-policy.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['weakness_policy'] = {
  id: 'weakness_policy',
  name: "Weakness Policy",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('weakness-policy.png') : 'assets/items/weakness-policy.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 12,
  desc: "Insurance contract (+12 Max HP). When holder is struck by a super-effective or critical hit, immediately gains +8 ATK for the rest of battle.",
  hasWeaknessPolicy: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['weakness_policy'];
}
