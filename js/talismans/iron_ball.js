// =============================================
// TALISMAN / ITEM: IRON BALL
// Official Icon: assets/items/iron-ball.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['iron_ball'] = {
  id: 'iron_ball',
  name: "Iron Ball",
  price: 7,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('iron-ball.png') : 'assets/items/iron-ball.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 45,
  bonusAtk: 8,
  bonusSpeed: -35,
  desc: "Heavy Demolition (+8 ATK, +45 Max HP, -35 SPD). Heavy lead sphere knocking defenders back 1 square upon attack, but slows combat speed by 35.",
  hasIronBall: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['iron_ball'];
}
