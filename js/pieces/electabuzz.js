// =============================================
// POKEMON #125: ELECTABUZZ (ELECTRIC)
// =============================================

'use strict';

PIECES['125'] = {
  id: '125',
  num: '125',
  name: 'Electabuzz',
  element: 'electric',
  element2: null,
  asset: '125',
  rarity: 'rare',
  stage: 2,
  nextEvo: '466',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 91,
  damage: 39,
  desc: "Electabuzz: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
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
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 2,
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
