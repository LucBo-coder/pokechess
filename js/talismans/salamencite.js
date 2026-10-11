// =============================================
// TALISMAN / ITEM: SALAMENCITE
// Official Icon: assets/items/salamencite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['salamencite'] = {
  id: 'salamencite',
  name: "Salamencite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('salamencite.png') : 'assets/items/salamencite.png',
  targetTypes: ["373"],
  targetDesc: "Salamence (#373) only",
  desc: "Mega Evolves Salamence into Mega Salamence! Grants +75 Max HP, +30 Attack, and crescent sky blade wings.",
  bonusHp: 25,
  bonusAtk: 10,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['salamencite'];
}
