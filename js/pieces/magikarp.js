// =============================================
// POKEMON #129: MAGIKARP (WATER)
// =============================================

'use strict';

PIECES['129'] = {
  id: '129',
  num: '129',
  name: 'Magikarp',
  element: 'water',
  element2: null,
  asset: '129',
  rarity: 'common',
  stage: 1,
  nextEvo: '130',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 50,
  damage: 18,
  desc: "Magikarp: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
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
