// =============================================
// POKEMON #180: FLAAFFY (ELECTRIC)
// =============================================

'use strict';

PIECES['180'] = {
  id: '180',
  num: '180',
  name: 'Flaaffy',
  element: 'electric',
  element2: null,
  asset: '180',
  rarity: 'rare',
  stage: 2,
  nextEvo: '181',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 96,
  damage: 31,
  desc: "Flaaffy: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -3,
    "dc": 0,
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
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -2,
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
