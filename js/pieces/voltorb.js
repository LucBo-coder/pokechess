// =============================================
// POKEMON #100: VOLTORB (ELECTRIC)
// =============================================

'use strict';

PIECES['100'] = {
  id: '100',
  num: '100',
  name: 'Voltorb',
  element: 'electric',
  element2: null,
  asset: '100',
  rarity: 'common',
  stage: 1,
  nextEvo: '101',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 62,
  damage: 20,
  desc: "Voltorb: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "moveOnly"
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
