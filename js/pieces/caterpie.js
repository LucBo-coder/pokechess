// =============================================
// POKEMON #010: CATERPIE (BUG)
// =============================================

'use strict';

PIECES['10'] = {
  id: '10',
  num: '10',
  name: 'Caterpie',
  element: 'bug',
  element2: null,
  asset: '10',
  rarity: 'common',
  stage: 1,
  nextEvo: '11',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 62,
  damage: 18,
  desc: "Caterpie: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "moveOnly"
  },
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
    "dr": -1,
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
