// =============================================
// POKEMON #041: ZUBAT (POISON / FLYING)
// =============================================

'use strict';

PIECES['41'] = {
  id: '41',
  num: '41',
  name: 'Zubat',
  element: 'poison',
  element2: 'flying',
  asset: '41',
  rarity: 'common',
  stage: 1,
  nextEvo: '42',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 56,
  damage: 18,
  desc: "Zubat: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -1,
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
