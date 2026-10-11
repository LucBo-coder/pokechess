// =============================================
// TALISMAN / ITEM: SHELL BELL
// Official Icon: assets/items/shell-bell.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['shell_bell'] = {
  id: 'shell_bell',
  name: "Shell Bell",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('shell-bell.png') : 'assets/items/shell-bell.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  bonusAtk: 3,
  desc: "Marine chime (+3 ATK, +10 Max HP) granting 20% Lifesteal from attack damage dealt.",
  hasLifesteal: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['shell_bell'];
}
