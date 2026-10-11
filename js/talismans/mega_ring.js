// =============================================
// TALISMAN / ITEM: MEGA RING
// Official Icon: assets/items/mega-ring.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['mega_ring'] = {
  id: 'mega_ring',
  name: "Mega Ring",
  price: 12,
  maxUses: 1,
  isMega: true,
  category: 'mega',
  icon: typeof getItemIcon === 'function' ? getItemIcon('mega-ring.png') : 'assets/items/mega-ring.png',
  targetTypes: 'all',
  targetDesc: "Any Stage 3 or Legendary Pokémon",
  desc: "Occupies 1 Held Item slot. Channels Mega Evolution energy! Grants +75 Max HP, +25 Attack, and glowing Mega Aura.",
  bonusHp: 22,
  bonusAtk: 7,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['mega_ring'];
}
