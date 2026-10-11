// =============================================
// POKEMON #081: MAGNEMITE (ELECTRIC / STEEL)
// =============================================

'use strict';

PIECES['81'] = {
  id: '81',
  num: '81',
  name: 'Magnemite',
  element: 'electric',
  element2: 'steel',
  asset: '81',
  rarity: 'common',
  stage: 1,
  nextEvo: '82',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 52,
  damage: 28,
  desc: "Magnemite: Tactical Pokémon battle unit.",

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
