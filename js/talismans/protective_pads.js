// =============================================
// TALISMAN / ITEM: PROTECTIVE PADS
// Official Icon: assets/items/protective-pads.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['protective_pads'] = {
  id: 'protective_pads',
  name: "Protective Pads",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('protective-pads.png') : 'assets/items/protective-pads.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  bonusAtk: 5,
  desc: "Cushioned combat pads (+5 ATK, +8 Max HP). Holder's attacks completely ignore enemy Damage Reduction, Rocky Helmet, and Thorns recoil.",
  hasProtectivePads: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['protective_pads'];
}
