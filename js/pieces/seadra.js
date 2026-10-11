// =============================================
// POKEMON #117: SEADRA (WATER)
// =============================================

'use strict';

PIECES['117'] = {
  id: '117',
  num: '117',
  name: 'Seadra',
  element: 'water',
  element2: null,
  asset: '117',
  rarity: 'rare',
  stage: 2,
  nextEvo: '230',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 94,
  damage: 37,
  desc: "Seadra: Tactical Pokémon battle unit.",

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
    "dr": 0,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "moveOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 2,
    "startDc": 0,
    "mode": "captureOnly",
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
