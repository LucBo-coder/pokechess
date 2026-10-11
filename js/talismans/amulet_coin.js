// =============================================
// TALISMAN / ITEM: AMULET COIN
// Official Icon: assets/items/amulet-coin.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['amulet_coin'] = {
  id: 'amulet_coin',
  name: "Amulet Coin",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('amulet-coin.png') : 'assets/items/amulet-coin.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "Lucky coin (+10 Max HP) that rewards +1 bonus Gold upon each stage victory.",
  bonusHp: 10,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['amulet_coin'];
}
