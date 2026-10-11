// =============================================
// TALISMAN / ITEM: AIR BALLOON
// Official Icon: assets/items/air-balloon.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['air_balloon'] = {
  id: 'air_balloon',
  name: "Air Balloon",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('air-balloon.png') : 'assets/items/air-balloon.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  bonusSpeed: 20,
  desc: "Buoyant balloon (+8 Max HP, +20 SPD). Holder floats above hazards (+20 SPD, Ground & Thorns immunity) until struck by a direct attack.",
  hasAirBalloon: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['air_balloon'];
}
