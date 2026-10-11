// =============================================
// TALISMAN / ITEM: BIG ROOT
// Official Icon: assets/items/big-root.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['big_root'] = {
  id: 'big_root',
  name: "Big Root",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('big-root.png') : 'assets/items/big-root.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 14,
  desc: "Vigorous root (+14 Max HP). Amplifies all healing, Grass synergy lifesteal, Shell Bell recovery, and Leftovers by +50%.",
  hasBigRoot: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['big_root'];
}
