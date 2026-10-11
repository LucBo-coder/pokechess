// =============================================
// TALISMAN / ITEM: CHARIZARDITE Y
// Official Icon: assets/items/charizardite-y.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['charizardite_y'] = {
  id: 'charizardite_y',
  name: "Charizardite Y",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('charizardite-y.png') : 'assets/items/charizardite-y.png',
  targetTypes: ["6"],
  targetDesc: "Charizard (#6) only",
  desc: "Mega Evolves Charizard into Mega Charizard Y! Grants +65 Max HP, +35 Attack, and intense drought heat.",
  bonusHp: 22,
  bonusAtk: 11,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['charizardite_y'];
}
