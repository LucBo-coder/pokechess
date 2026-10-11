// =============================================
// POKEMON #127: PINSIR (BUG)
// =============================================

'use strict';

PIECES['127'] = {
  id: '127',
  num: '127',
  name: 'Pinsir',
  element: 'bug',
  element2: null,
  asset: '127',
  rarity: 'common',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 28,
  desc: "Pinsir: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": -1,
    "mode": "captureOnly"
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
    "dr": 1,
    "dc": 0,
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
