// =============================================
// TALISMAN / ITEM: SHED SHELL
// Official Icon: assets/items/shed-shell.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['shed_shell'] = {
  id: 'shed_shell',
  name: "Shed Shell",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('shed-shell.png') : 'assets/items/shed-shell.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Molted carapace (+10 Max HP). When holder's HP drops below 30%, instantly generates an emergency shield absorbing up to 12 HP damage (once per battle).",
  hasShedShell: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['shed_shell'];
}
