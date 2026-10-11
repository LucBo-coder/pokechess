// =============================================
// TALISMAN / ITEM: VENUSAURITE
// Official Icon: assets/items/venusaurite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['venusaurite'] = {
  id: 'venusaurite',
  name: "Venusaurite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('venusaurite.png') : 'assets/items/venusaurite.png',
  targetTypes: ["3"],
  targetDesc: "Venusaur (#3) only",
  desc: "Mega Evolves Venusaur into Mega Venusaur! Grants +85 Max HP, +18 Attack, and thick impenetrable flower defense.",
  bonusHp: 28,
  bonusAtk: 6,
  dmgReduction: 3,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['venusaurite'];
}
