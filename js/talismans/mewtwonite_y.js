// =============================================
// TALISMAN / ITEM: MEWTWONITE Y
// Official Icon: assets/items/mewtwonite-y.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['mewtwonite_y'] = {
  id: 'mewtwonite_y',
  name: "Mewtwonite Y",
  price: 16,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('mewtwonite-y.png') : 'assets/items/mewtwonite-y.png',
  targetTypes: ["150"],
  targetDesc: "Mewtwo (#150) only",
  desc: "Mega Evolves Mewtwo into its ultimate psychic form! Grants +80 Max HP and +40 Attack.",
  bonusHp: 28,
  bonusAtk: 14,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['mewtwonite_y'];
}
