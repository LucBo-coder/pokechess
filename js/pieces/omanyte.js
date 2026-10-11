// =============================================
// POKEMON #138: OMANYTE (ROCK / WATER)
// =============================================

'use strict';

PIECES['138'] = {
  id: '138',
  num: '138',
  name: 'Omanyte',
  element: 'rock',
  element2: 'water',
  asset: '138',
  rarity: 'common',
  stage: 1,
  nextEvo: '139',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 74,
  damage: 28,
  desc: "Omanyte: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
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
