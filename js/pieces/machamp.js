// =============================================
// POKEMON #068: MACHAMP (FIGHTING)
// =============================================

'use strict';

PIECES['68'] = {
  id: '68',
  num: '68',
  name: 'Machamp',
  element: 'fighting',
  element2: null,
  asset: '68',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 127,
  damage: 48,
  desc: "Machamp: Tactical Pokémon battle unit.",

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
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": -1,
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
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": -2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
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
