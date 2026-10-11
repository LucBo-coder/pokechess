// =============================================
// POKEMON #084: DODUO (NORMAL / FLYING)
// =============================================

'use strict';

PIECES['84'] = {
  id: '84',
  num: '84',
  name: 'Doduo',
  element: 'normal',
  element2: 'flying',
  asset: '84',
  rarity: 'common',
  stage: 1,
  nextEvo: '85',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 54,
  damage: 28,
  desc: "Doduo: Tactical Pokémon battle unit.",

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
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
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
