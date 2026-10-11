// =============================================
// TALISMAN / ITEM: EVIOLITE
// Official Icon: assets/items/eviolite.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['eviolite'] = {
  id: 'eviolite',
  name: "Eviolite",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('eviolite.png') : 'assets/items/eviolite.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 12,
  dmgReduction: 2,
  desc: "Mysterious lump of rock (+12 Max HP, -2 Damage Reduction). If holder is capable of evolving, bonuses double to +24 Max HP and -4 Damage Reduction!",
  hasEviolite: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['eviolite'];
}
