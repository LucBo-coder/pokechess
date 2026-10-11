// =============================================
// TALISMAN / ITEM: RING TARGET
// Official Icon: assets/items/ring-target.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['ring_target'] = {
  id: 'ring_target',
  name: "Ring Target",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('ring-target.png') : 'assets/items/ring-target.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  bonusAtk: 4,
  desc: "Zero Immunity (+4 ATK, +8 Max HP). Strips all elemental immunities from opposing targets, allowing all moves to land at minimum standard effectiveness.",
  hasRingTarget: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['ring_target'];
}
