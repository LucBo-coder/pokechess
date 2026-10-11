// =============================================
// POKEMON #035: CLEFAIRY (FAIRY)
// =============================================

'use strict';

PIECES['35'] = {
  id: '35',
  num: '35',
  name: 'Clefairy',
  element: 'fairy',
  element2: null,
  asset: '35',
  rarity: 'rare',
  stage: 2,
  nextEvo: '36',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 94,
  damage: 28,
  desc: "Clefairy: Tactical Pokémon battle unit.",

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
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -2,
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
