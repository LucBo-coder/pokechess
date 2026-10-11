// =============================================
// POKEMON #082: MAGNETON (ELECTRIC / STEEL)
// =============================================

'use strict';

PIECES['82'] = {
  id: '82',
  num: '82',
  name: 'Magneton',
  element: 'electric',
  element2: 'steel',
  asset: '82',
  rarity: 'rare',
  stage: 2,
  nextEvo: '462',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 88,
  damage: 42,
  desc: "Magneton: Tactical Pokémon battle unit.",

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
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 3,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": -3,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 0,
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
