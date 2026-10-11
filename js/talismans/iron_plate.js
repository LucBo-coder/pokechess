// =============================================
// TALISMAN / ITEM: IRON PLATE
// Official Icon: assets/items/iron-plate.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['iron_plate'] = {
  id: 'iron_plate',
  name: "Iron Plate",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('iron-plate.png') : 'assets/items/iron-plate.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  desc: "Heavy metal armor (+14 Max HP) granting Divine Shield, completely blocking the 1st hit in battle.",
  bonusHp: 14,
  hasDivineShield: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['iron_plate'];
}
