// =============================================
// POKEMON #144: ARTICUNO (ICE / FLYING)
// =============================================

'use strict';

PIECES['144'] = {
  id: '144',
  num: '144',
  name: 'Articuno',
  element: 'ice',
  element2: 'flying',
  asset: '144',
  rarity: 'legend',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 15,
  maxHp: 140,
  damage: 52,
  desc: "Articuno: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 2,
    "mode": "captureOnly"
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
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": -1,
    "maxSteps": 8,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "maxSteps": 8,
    "mode": "all"
  }
],

  getMoves(game, i, r, c, p, push, slide) {
    if (typeof CustomMoveSystem !== 'undefined') {
      return CustomMoveSystem.getMoves(game, i, r, c, p, push, slide);
    }
    return [];
  }
};
