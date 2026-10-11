// =============================================
// POKEMON #049: VENOMOTH (BUG / POISON)
// =============================================

'use strict';

PIECES['49'] = {
  id: '49',
  num: '49',
  name: 'Venomoth',
  element: 'bug',
  element2: 'poison',
  asset: '49',
  rarity: 'rare',
  stage: 2,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 8,
  maxHp: 98,
  damage: 35,
  desc: "Venomoth: Tactical Pokémon battle unit.",

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
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": -2,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 2,
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
