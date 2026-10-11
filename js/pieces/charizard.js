// =============================================
// POKEMON #006: CHARIZARD (FIRE / FLYING)
// =============================================

'use strict';

PIECES['6'] = {
  id: '6',
  num: '6',
  name: 'Charizard',
  element: 'fire',
  element2: 'flying',
  asset: '6',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 113,
  damage: 43,
  desc: "Charizard: Tactical Pokémon battle unit.",

  steps: [
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
    "dr": -2,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 2,
    "startDc": 0,
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
