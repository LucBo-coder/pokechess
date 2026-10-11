// =============================================
// POKEMON #120: STARYU (WATER)
// =============================================

'use strict';

PIECES['120'] = {
  id: '120',
  num: '120',
  name: 'Staryu',
  element: 'water',
  element2: null,
  asset: '120',
  rarity: 'common',
  stage: 1,
  nextEvo: '121',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 52,
  damage: 27,
  desc: "Staryu: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 1,
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
