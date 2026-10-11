// =============================================
// TALISMAN / ITEM: BUG GEM
// Official Icon: assets/items/bug-gem.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['bug_gem'] = {
  id: 'bug_gem',
  name: "Bug Gem",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('bug-gem.png') : 'assets/items/bug-gem.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  overrideElement2: 'bug',
  bonusAtk: 2,
  bonusHp: 5,
  bonusSpeed: 8,
  desc: "Jewel infused with Chitinous instinct (+2 ATK, +5 HP, +8 SPD). Overrides or sets the Pokémon's 2nd Element (Type 2) to BUG (persists through evolution).",
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['bug_gem'];
}
