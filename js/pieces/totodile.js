// =============================================
// POKEMON #158: TOTODILE (WATER)
// =============================================

'use strict';

PIECES['158'] = {
  id: '158',
  num: '158',
  name: 'Totodile',
  element: 'water',
  element2: null,
  asset: '158',
  rarity: 'rare',
  stage: 1,
  nextEvo: '159',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Totodile: Tactical Pokémon battle unit.",

  steps: [
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
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
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
    "dr": -1,
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
