// =============================================
// TALISMAN / ITEM: LIFE ORB
// Official Icon: assets/items/life-orb.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['life_orb'] = {
  id: 'life_orb',
  name: "Life Orb",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('life-orb.png') : 'assets/items/life-orb.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "High attack power (+10 ATK), but holder takes 2 HP recoil each time it strikes.",
  bonusAtk: 10,
  hasLifeOrb: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['life_orb'];
}
