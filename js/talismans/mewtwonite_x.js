// =============================================
// TALISMAN / ITEM: MEWTWONITE X
// Official Icon: assets/items/mewtwonite-x.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['mewtwonite_x'] = {
  id: 'mewtwonite_x',
  name: "Mewtwonite X",
  price: 16,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('mewtwonite-x.png') : 'assets/items/mewtwonite-x.png',
  targetTypes: ["150"],
  targetDesc: "Mewtwo (#150) only",
  desc: "Mega Evolves Mewtwo into its ultimate physical battle form! Grants +95 Max HP and +35 Attack.",
  bonusHp: 32,
  bonusAtk: 12,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['mewtwonite_x'];
}
