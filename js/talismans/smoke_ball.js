// =============================================
// TALISMAN / ITEM: SMOKE BALL
// Official Icon: assets/items/smoke-ball.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['smoke_ball'] = {
  id: 'smoke_ball',
  name: "Smoke Ball",
  price: 5,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('smoke-ball.png') : 'assets/items/smoke-ball.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 10,
  desc: "Ninja Vanish (+10 Max HP). When struck by an attack, holder detonates a dense smoke shroud, gaining +50% Evasion for the next 2 turns (once per battle).",
  hasSmokeBall: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['smoke_ball'];
}
