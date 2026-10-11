// =============================================
// POKEMON #023: EKANS (POISON)
// =============================================

'use strict';

PIECES['23'] = {
  id: '23',
  num: '23',
  name: 'Ekans',
  element: 'poison',
  element2: null,
  asset: '23',
  rarity: 'common',
  stage: 1,
  nextEvo: '24',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 54,
  damage: 23,
  desc: "Ekans: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -2,
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
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -3,
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
