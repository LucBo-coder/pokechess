// =============================================
// POKEMON #099: KINGLER (WATER)
// =============================================

'use strict';

PIECES['99'] = {
  id: '99',
  num: '99',
  name: 'Kingler',
  element: 'water',
  element2: null,
  asset: '99',
  rarity: 'rare',
  stage: 2,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 8,
  maxHp: 101,
  damage: 42,
  desc: "Kingler: Tactical Pokémon battle unit.",

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
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 2,
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
