// =============================================
// TALISMAN / ITEM: CHARIZARDITE X
// Official Icon: assets/items/charizardite-x.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['charizardite_x'] = {
  id: 'charizardite_x',
  name: "Charizardite X",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('charizardite-x.png') : 'assets/items/charizardite-x.png',
  targetTypes: ["6"],
  targetDesc: "Charizard (#6) only",
  desc: "Mega Evolves Charizard into Mega Charizard X! Grants +70 Max HP, +30 Attack, and blazing blue dragon flames.",
  bonusHp: 24,
  bonusAtk: 10,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['charizardite_x'];
}
