// =============================================
// POKEMON #118: GOLDEEN (WATER)
// =============================================

'use strict';

PIECES['118'] = {
  id: '118',
  num: '118',
  name: 'Goldeen',
  element: 'water',
  element2: null,
  asset: '118',
  rarity: 'common',
  stage: 1,
  nextEvo: '119',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 71,
  damage: 25,
  desc: "Goldeen: Tactical Pokémon battle unit.",

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
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
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
