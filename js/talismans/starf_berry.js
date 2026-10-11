// =============================================
// TALISMAN / ITEM: STARF BERRY
// Official Icon: assets/items/starf-berry.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['starf_berry'] = {
  id: 'starf_berry',
  name: "Starf Berry",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('starf-berry.png') : 'assets/items/starf-berry.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Cosmic Gamble (+8 Max HP). When dropping below 35% HP, rolls a celestial jackpot: either gains +10 ATK, instantly heals +24 HP, or gains +35% Evasion!",
  hasStarfBerry: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['starf_berry'];
}
