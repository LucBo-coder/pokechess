// =============================================
// POKEMON #116: HORSEA (WATER)
// =============================================

'use strict';

PIECES['116'] = {
  id: '116',
  num: '116',
  name: 'Horsea',
  element: 'water',
  element2: null,
  asset: '116',
  rarity: 'common',
  stage: 1,
  nextEvo: '117',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 58,
  damage: 26,
  desc: "Horsea: Tactical Pokémon battle unit.",

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
