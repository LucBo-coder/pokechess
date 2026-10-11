// =============================================
// POKEMON #013: WEEDLE (BUG / POISON)
// =============================================

'use strict';

PIECES['13'] = {
  id: '13',
  num: '13',
  name: 'Weedle',
  element: 'bug',
  element2: 'poison',
  asset: '13',
  rarity: 'common',
  stage: 1,
  nextEvo: '14',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 55,
  damage: 18,
  desc: "Weedle: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
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
