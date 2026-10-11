// =============================================
// TALISMAN / ITEM: BLASTOISINITE
// Official Icon: assets/items/blastoisinite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['blastoisinite'] = {
  id: 'blastoisinite',
  name: "Blastoisinite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('blastoisinite.png') : 'assets/items/blastoisinite.png',
  targetTypes: ["9"],
  targetDesc: "Blastoise (#9) only",
  dmgReduction: 2,
  desc: "Mega Evolves Blastoise into Mega Blastoise! Grants +80 Max HP, +22 Attack, and giant heavy shell cannons.",
  bonusHp: 26,
  bonusAtk: 7,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['blastoisinite'];
}
