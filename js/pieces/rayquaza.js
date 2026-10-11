// =============================================
// POKEMON #384: RAYQUAZA (DRAGON / FLYING)
// =============================================

'use strict';

PIECES['384'] = {
  id: '384',
  num: '384',
  name: 'Rayquaza',
  element: 'dragon',
  element2: 'flying',
  asset: '384',
  rarity: 'legend',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 15,
  maxHp: 147,
  damage: 63,
  desc: "Rayquaza: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": 3,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -3,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": -3,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 3,
    "dc": 0,
    "mode": "moveOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": -1,
    "startDr": 1,
    "startDc": -1,
    "mode": "all",
    "maxSteps": 8
  },
  {
    "dr": 1,
    "dc": 1,
    "startDr": 1,
    "startDc": 1,
    "mode": "all",
    "maxSteps": 8
  }
],

  getMoves(game, i, r, c, p, push, slide) {
    if (typeof CustomMoveSystem !== 'undefined') {
      return CustomMoveSystem.getMoves(game, i, r, c, p, push, slide);
    }
    return [];
  }
};
