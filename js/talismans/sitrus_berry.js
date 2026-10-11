// =============================================
// TALISMAN / ITEM: SITRUS BERRY
// Official Icon: assets/items/sitrus-berry.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['sitrus_berry'] = {
  id: 'sitrus_berry',
  name: "Sitrus Berry",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('sitrus-berry.png') : 'assets/items/sitrus-berry.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Nutritious yellow berry (+8 Max HP). When holder's HP falls below 50%, immediately restores +16 HP (once per battle).",
  hasSitrusBerry: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['sitrus_berry'];
}
