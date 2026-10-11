// =============================================
// POKEMON #156: QUILAVA (FIRE)
// =============================================

'use strict';

PIECES['156'] = {
  id: '156',
  num: '156',
  name: 'Quilava',
  element: 'fire',
  element2: null,
  asset: '156',
  rarity: 'rare',
  stage: 2,
  nextEvo: '157',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 84,
  damage: 32,
  desc: "Quilava: Tactical Pokémon battle unit.",

  steps: [
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
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 0,
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
