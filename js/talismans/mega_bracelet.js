// =============================================
// TALISMAN / ITEM: MEGA BRACELET
// Official Icon: assets/items/mega-bracelet.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['mega_bracelet'] = {
  id: 'mega_bracelet',
  name: "Mega Bracelet",
  price: 12,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('mega-bracelet.png') : 'assets/items/mega-bracelet.png',
  targetTypes: 'all',
  targetDesc: "Any Stage 3 or Legendary Pokémon",
  desc: "Occupies 1 Held Item slot. Unleashes Mega Evolution! Grants massive +75 Max HP, +25 Attack, and radiant Mega Aura.",
  bonusHp: 22,
  bonusAtk: 7,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['mega_bracelet'];
}
