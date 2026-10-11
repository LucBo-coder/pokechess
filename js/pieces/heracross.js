// =============================================
// POKEMON #214: HERACROSS (BUG / FIGHTING)
// =============================================

'use strict';

PIECES['214'] = {
  id: '214',
  num: '214',
  name: 'Heracross',
  element: 'bug',
  element2: 'fighting',
  asset: '214',
  rarity: 'epic',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 10,
  maxHp: 114,
  damage: 44,
  desc: "Heracross: Tactical Pokémon battle unit.",

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
    "mode": "moveOnly"
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
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 1,
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
