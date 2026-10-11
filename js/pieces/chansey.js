// =============================================
// POKEMON #113: CHANSEY (NORMAL)
// =============================================

'use strict';

PIECES['113'] = {
  id: '113',
  num: '113',
  name: 'Chansey',
  element: 'normal',
  element2: null,
  asset: '113',
  rarity: 'rare',
  stage: 2,
  nextEvo: '242',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 210,
  damage: 18,
  desc: "Chansey: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
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
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
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
