// =============================================
// TALISMAN / ITEM: SAFETY GOGGLES
// Official Icon: assets/items/safety-goggles.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['safety_goggles'] = {
  id: 'safety_goggles',
  name: "Safety Goggles",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('safety-goggles.png') : 'assets/items/safety-goggles.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 14,
  desc: "Protective eyewear (+14 Max HP). Holder is immune to splash/cleave damage (Razor Claw) and environmental field damage.",
  hasSafetyGoggles: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['safety_goggles'];
}
