// =============================================
// POKEMON #254: SCEPTILE (GRASS)
// =============================================

'use strict';

PIECES['254'] = {
  id: '254',
  num: '254',
  name: 'Sceptile',
  element: 'grass',
  element2: null,
  asset: '254',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 112,
  damage: 42,
  desc: "Sceptile: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": -1,
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
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
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
