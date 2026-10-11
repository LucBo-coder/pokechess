// =============================================
// POKEMON #112: RHYDON (GROUND / ROCK)
// =============================================

'use strict';

PIECES['112'] = {
  id: '112',
  num: '112',
  name: 'Rhydon',
  element: 'ground',
  element2: 'rock',
  asset: '112',
  rarity: 'rare',
  stage: 2,
  nextEvo: '464',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 115,
  damage: 42,
  desc: "Rhydon: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 1,
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
