// =============================================
// POKEMON #063: ABRA (PSYCHIC)
// =============================================

'use strict';

PIECES['63'] = {
  id: '63',
  num: '63',
  name: 'Abra',
  element: 'psychic',
  element2: null,
  asset: '63',
  rarity: 'common',
  stage: 1,
  nextEvo: '64',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 50,
  damage: 28,
  desc: "Abra: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 2,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 2,
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
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
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
