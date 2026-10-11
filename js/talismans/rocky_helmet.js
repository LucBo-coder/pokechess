// =============================================
// TALISMAN / ITEM: ROCKY HELMET
// Official Icon: assets/items/rocky-helmet.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['rocky_helmet'] = {
  id: 'rocky_helmet',
  name: "Rocky Helmet",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('rocky-helmet.png') : 'assets/items/rocky-helmet.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 12,
  desc: "Spiked armor (+12 Max HP) that reflects 4 damage back to attackers.",
  thornsDamage: 4,
  hasRockyHelmet: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['rocky_helmet'];
}
