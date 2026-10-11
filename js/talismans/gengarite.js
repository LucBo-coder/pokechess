// =============================================
// TALISMAN / ITEM: GENGARITE
// Official Icon: assets/items/gengarite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['gengarite'] = {
  id: 'gengarite',
  name: "Gengarite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('gengarite.png') : 'assets/items/gengarite.png',
  targetTypes: ["94"],
  targetDesc: "Gengar (#94) only",
  desc: "Mega Evolves Gengar into Mega Gengar! Grants +55 Max HP, +32 Attack, and ghostly shadow realm dominance.",
  bonusHp: 20,
  bonusAtk: 11,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['gengarite'];
}
