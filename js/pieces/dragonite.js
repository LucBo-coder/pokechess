// =============================================
// POKEMON #149: DRAGONITE (DRAGON / FLYING)
// =============================================

'use strict';

PIECES['149'] = {
  id: '149',
  num: '149',
  name: 'Dragonite',
  element: 'dragon',
  element2: 'flying',
  asset: '149',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 133,
  damage: 53,
  desc: "Dragonite: Tactical Pokémon battle unit.",

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
    "dr": 1,
    "dc": 0,
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
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 0,
    "dc": 1,
    "startDr": 0,
    "startDc": 2,
    "mode": "all",
    "maxSteps": 8
  },
  {
    "dr": 0,
    "dc": -1,
    "startDr": 0,
    "startDc": -2,
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
