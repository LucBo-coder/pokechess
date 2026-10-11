// =============================================
// TALISMAN / ITEM: QUICK CLAW
// Official Icon: assets/items/quick-claw.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['quick_claw'] = {
  id: 'quick_claw',
  name: "Quick Claw",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('quick-claw.png') : 'assets/items/quick-claw.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "A razor-sharp claw (+5 ATK, +25 SPD). Grants Strike First (+1000 SPD in Round 1) and a 25% chance to trigger a swift second strike.",
  bonusAtk: 5,
  bonusSpeed: 25,
  hasStrikeFirst: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['quick_claw'];
}
