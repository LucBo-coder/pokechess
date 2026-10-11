// =============================================
// POKEMON #004: CHARMANDER (FIRE)
// =============================================

'use strict';

PIECES['4'] = {
  id: '4',
  num: '4',
  name: 'Charmander',
  element: 'fire',
  element2: null,
  asset: '4',
  rarity: 'rare',
  stage: 1,
  nextEvo: '5',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Charmander: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
  }
],
  slides: [],

  getMoves(game, i, r, c, p, push, slide) {
    if (typeof CustomMoveSystem !== 'undefined') {
      return CustomMoveSystem.getMoves(game, i, r, c, p, push, slide);
    }
    return [];
  }
};
