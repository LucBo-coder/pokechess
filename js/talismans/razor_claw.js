// =============================================
// TALISMAN / ITEM: RAZOR CLAW
// Official Icon: assets/items/razor-claw.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['razor_claw'] = {
  id: 'razor_claw',
  name: "Razor Claw",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('razor-claw.png') : 'assets/items/razor-claw.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "A hooked claw (+4 ATK) dealing 25% splash damage to all adjacent enemies around target.",
  bonusAtk: 4,
  hasSplash: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['razor_claw'];
}
