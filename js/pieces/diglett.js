// =============================================
// POKEMON #050: DIGLETT (GROUND)
// =============================================

'use strict';

PIECES['50'] = {
  id: '50',
  num: '50',
  name: 'Diglett',
  element: 'ground',
  element2: null,
  asset: '50',
  rarity: 'common',
  stage: 1,
  nextEvo: '51',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 50,
  damage: 21,
  desc: "Diglett: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
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
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 1,
    "startDc": 0,
    "mode": "moveOnly",
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
