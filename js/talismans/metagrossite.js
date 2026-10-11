// =============================================
// TALISMAN / ITEM: METAGROSSITE
// Official Icon: assets/items/metagrossite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['metagrossite'] = {
  id: 'metagrossite',
  name: "Metagrossite",
  price: 14,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('metagrossite.png') : 'assets/items/metagrossite.png',
  targetTypes: ["376"],
  targetDesc: "Metagross (#376) only",
  dmgReduction: 2,
  desc: "Mega Evolves Metagross into Mega Metagross! Grants +85 Max HP, +28 Attack, and supercomputer iron claws.",
  bonusHp: 26,
  bonusAtk: 9,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['metagrossite'];
}
