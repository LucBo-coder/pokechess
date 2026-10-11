// =============================================
// POKEMON #017: PIDGEOTTO (NORMAL / FLYING)
// =============================================

'use strict';

PIECES['17'] = {
  id: '17',
  num: '17',
  name: 'Pidgeotto',
  element: 'normal',
  element2: 'flying',
  asset: '17',
  rarity: 'rare',
  stage: 2,
  nextEvo: '18',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 89,
  damage: 28,
  desc: "Pidgeotto: Tactical Pokémon battle unit.",

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
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -2,
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
