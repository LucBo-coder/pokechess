// =============================================
// POKEMON #098: KRABBY (WATER)
// =============================================

'use strict';

PIECES['98'] = {
  id: '98',
  num: '98',
  name: 'Krabby',
  element: 'water',
  element2: null,
  asset: '98',
  rarity: 'common',
  stage: 1,
  nextEvo: '99',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 65,
  damage: 28,
  desc: "Krabby: Tactical Pokémon battle unit.",

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
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
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
