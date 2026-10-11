// =============================================
// POKEMON #257: BLAZIKEN (FIRE / FIGHTING)
// =============================================

'use strict';

PIECES['257'] = {
  id: '257',
  num: '257',
  name: 'Blaziken',
  element: 'fire',
  element2: 'fighting',
  asset: '257',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 113,
  damage: 49,
  desc: "Blaziken: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "moveOnly"
  },
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
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -2,
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
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -2,
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
