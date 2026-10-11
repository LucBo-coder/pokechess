// =============================================
// TALISMAN / ITEM: ASSAULT VEST
// Official Icon: assets/items/assault-vest.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['assault_vest'] = {
  id: 'assault_vest',
  name: "Assault Vest",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('assault-vest.png') : 'assets/items/assault-vest.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "Rugged tactical armor granting +18 Max HP and -3 flat damage reduction from attacks.",
  bonusHp: 18,
  dmgReduction: 3,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['assault_vest'];
}
