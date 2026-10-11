// =============================================
// TALISMAN / ITEM: RED CARD
// Official Icon: assets/items/red-card.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['red_card'] = {
  id: 'red_card',
  name: "Red Card",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('red-card.png') : 'assets/items/red-card.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Mysterious referee card (+10 Max HP). When holder is struck by an enemy attack, retaliates by dealing 5 true damage back to the attacker (once per battle).",
  hasRedCard: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['red_card'];
}
