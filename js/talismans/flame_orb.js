// =============================================
// TALISMAN / ITEM: FLAME ORB
// Official Icon: assets/items/flame-orb.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['flame_orb'] = {
  id: 'flame_orb',
  name: "Flame Orb",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('flame-orb.png') : 'assets/items/flame-orb.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusAtk: 6,
  desc: "Thermal Flare (+6 ATK). Each attack ignites target with Burn (-3 HP/round) and radiates a heat wave dealing 3 true damage to all adjacent enemies around holder.",
  hasFlameOrb: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['flame_orb'];
}
