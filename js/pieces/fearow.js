// =============================================
// POKEMON #022: FEAROW (NORMAL / FLYING)
// =============================================

'use strict';

PIECES['22'] = {
  id: '22',
  num: '22',
  name: 'Fearow',
  element: 'normal',
  element2: 'flying',
  asset: '22',
  rarity: 'rare',
  stage: 2,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 8,
  maxHp: 94,
  damage: 35,
  desc: "Fearow: Tactical Pokémon battle unit.",

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
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 2,
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
    "dr": -1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
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
