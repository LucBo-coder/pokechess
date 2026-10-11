// =============================================
// POKEMON #061: POLIWHIRL (WATER)
// =============================================

'use strict';

PIECES['61'] = {
  id: '61',
  num: '61',
  name: 'Poliwhirl',
  element: 'water',
  element2: null,
  asset: '61',
  rarity: 'rare',
  stage: 2,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 8,
  maxHp: 94,
  damage: 28,
  desc: "Poliwhirl: Evolves into Poliwrath (Water Stone) or Politoed (King's Rock).",

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
  },
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
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
