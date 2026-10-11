// =============================================
// TALISMAN / ITEM: TOXIC ORB
// Official Icon: assets/items/toxic-orb.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['toxic_orb'] = {
  id: 'toxic_orb',
  name: "Toxic Orb",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('toxic-orb.png') : 'assets/items/toxic-orb.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 6,
  bonusAtk: 6,
  desc: "Poison Rush (+6 ATK, +6 Max HP). Holder self-inflicts mild poison (-2 HP each round), but gains an additional +6 Berserk ATK and 20% Lifesteal while poisoned!",
  hasToxicOrb: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['toxic_orb'];
}
