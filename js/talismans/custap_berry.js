// =============================================
// TALISMAN / ITEM: CUSTAP BERRY
// Official Icon: assets/items/custap-berry.png
// =============================================

if (typeof TALISMANS === 'undefined') {
  (typeof window !== 'undefined' ? window : globalThis).TALISMANS = {};
}

TALISMANS['custap_berry'] = {
  id: 'custap_berry',
  name: "Custap Berry",
  price: 6,
  maxUses: 1,
  category: 'held',
  icon: typeof getItemIcon === 'function' ? getItemIcon('custap-berry.png') : 'assets/items/custap-berry.png',
  targetTypes: 'all',
  targetDesc: "Any Pokémon",
  bonusHp: 8,
  desc: "Priority Ambush (+8 Max HP). When dropping below 30% HP, triggers an immediate retaliatory counter-strike dealing 10 true damage to the attacker (once per battle).",
  hasCustapBerry: true,
};

if (typeof module !== 'undefined') {
  module.exports = TALISMANS['custap_berry'];
}
