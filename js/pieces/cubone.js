// =============================================
// POKEMON #104: CUBONE (GROUND)
// =============================================

'use strict';

PIECES['104'] = {
  id: '104',
  num: '104',
  name: 'Cubone',
  element: 'ground',
  element2: null,
  asset: '104',
  rarity: 'common',
  stage: 1,
  nextEvo: '105',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 20,
  desc: "Cubone: Tactical Pokémon battle unit.",

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
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
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
