// =============================================
// TALISMAN / ITEM: SOOTHE BELL
// Official Icon: assets/items/soothe-bell.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['soothe_bell'] = {
  id: 'soothe_bell',
  name: "Soothe Bell",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('soothe-bell.png') : 'assets/items/soothe-bell.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Harmony Chime (+10 Max HP). Emits a comforting aura. At the start of each battle, confers +3 ATK and +8 Max HP to all adjacent friendly allies!",
  hasSootheBell: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['soothe_bell'];
}
