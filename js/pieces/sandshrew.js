// =============================================
// POKEMON #027: SANDSHREW (GROUND)
// =============================================

'use strict';

PIECES['27'] = {
  id: '27',
  num: '27',
  name: 'Sandshrew',
  element: 'ground',
  element2: null,
  asset: '27',
  rarity: 'common',
  stage: 1,
  nextEvo: '28',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 26,
  desc: "Sandshrew: Tactical Pokémon battle unit.",

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
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
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
