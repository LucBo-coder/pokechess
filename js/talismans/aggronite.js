// =============================================
// TALISMAN / ITEM: AGGRONITE
// Official Icon: assets/items/aggronite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['aggronite'] = {
  id: 'aggronite',
  name: "Aggronite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('aggronite.png') : 'assets/items/aggronite.png',
  targetTypes: ["306"],
  targetDesc: "Aggron (#306) only",
  desc: "Mega Evolves Aggron into Mega Aggron! Grants +30 Max HP, +7 Attack, and -4 damage reduction.",
  bonusHp: 30,
  bonusAtk: 7,
  dmgReduction: 4,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['aggronite'];
}
