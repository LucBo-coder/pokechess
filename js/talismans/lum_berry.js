// =============================================
// TALISMAN / ITEM: LUM BERRY
// Official Icon: assets/items/lum-berry.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['lum_berry'] = {
  id: 'lum_berry',
  name: "Lum Berry",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('lum-berry.png') : 'assets/items/lum-berry.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Miraculous curative green berry (+10 Max HP). Cleanses and completely neutralizes the first burn, poison, or paralysis afflicted in battle.",
  hasLumBerry: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['lum_berry'];
}
