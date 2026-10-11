// =============================================
// POKEMON #109: KOFFING (POISON)
// =============================================

'use strict';

PIECES['109'] = {
  id: '109',
  num: '109',
  name: 'Koffing',
  element: 'poison',
  element2: null,
  asset: '109',
  rarity: 'common',
  stage: 1,
  nextEvo: '110',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 77,
  damage: 27,
  desc: "Koffing: Tactical Pokémon battle unit.",

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
    "dc": 0,
    "mode": "moveOnly"
  },
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
