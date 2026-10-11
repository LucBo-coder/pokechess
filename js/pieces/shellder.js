// =============================================
// POKEMON #090: SHELLDER (WATER)
// =============================================

'use strict';

PIECES['90'] = {
  id: '90',
  num: '90',
  name: 'Shellder',
  element: 'water',
  element2: null,
  asset: '90',
  rarity: 'common',
  stage: 1,
  nextEvo: '91',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 68,
  damage: 25,
  desc: "Shellder: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "moveOnly"
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
