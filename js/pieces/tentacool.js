// =============================================
// POKEMON #072: TENTACOOL (WATER / POISON)
// =============================================

'use strict';

PIECES['72'] = {
  id: '72',
  num: '72',
  name: 'Tentacool',
  element: 'water',
  element2: 'poison',
  asset: '72',
  rarity: 'common',
  stage: 1,
  nextEvo: '73',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 56,
  damage: 20,
  desc: "Tentacool: Tactical Pokémon battle unit.",

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
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
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
