// =============================================
// POKEMON #060: POLIWAG (WATER)
// =============================================

'use strict';

PIECES['60'] = {
  id: '60',
  num: '60',
  name: 'Poliwag',
  element: 'water',
  element2: null,
  asset: '60',
  rarity: 'common',
  stage: 1,
  nextEvo: '61',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 58,
  damage: 20,
  desc: "Poliwag: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -3,
    "dc": 0,
    "mode": "captureOnly"
  },
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
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 3,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -3,
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
