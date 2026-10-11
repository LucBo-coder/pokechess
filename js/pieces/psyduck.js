// =============================================
// POKEMON #054: PSYDUCK (WATER)
// =============================================

'use strict';

PIECES['54'] = {
  id: '54',
  num: '54',
  name: 'Psyduck',
  element: 'water',
  element2: null,
  asset: '54',
  rarity: 'common',
  stage: 1,
  nextEvo: '55',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 72,
  damage: 26,
  desc: "Psyduck: Tactical Pokémon battle unit.",

  steps: [
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
    "dr": -1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "all"
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
