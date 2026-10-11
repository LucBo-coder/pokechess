// =============================================
// TALISMAN / ITEM: SCIZORITE
// Official Icon: assets/items/scizorite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['scizorite'] = {
  id: 'scizorite',
  name: "Scizorite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('scizorite.png') : 'assets/items/scizorite.png',
  targetTypes: ["212"],
  targetDesc: "Scizor (#212) only",
  dmgReduction: 2,
  desc: "Mega Evolves Scizor into Mega Scizor! Grants +75 Max HP, +28 Attack, and heavy technician shears.",
  bonusHp: 24,
  bonusAtk: 9,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['scizorite'];
}
