// =============================================
// TALISMAN / ITEM: SCOPE LENS
// Official Icon: assets/items/scope-lens.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['scope_lens'] = {
  id: 'scope_lens',
  name: "Scope Lens",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('scope-lens.png') : 'assets/items/scope-lens.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "A precision lens (+4 ATK) granting a +20% Critical Hit chance dealing 1.5x damage.",
  bonusAtk: 4,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['scope_lens'];
}
