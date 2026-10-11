// =============================================
// POKEMON #067: MACHOKE (FIGHTING)
// =============================================

'use strict';

PIECES['67'] = {
  id: '67',
  num: '67',
  name: 'Machoke',
  element: 'fighting',
  element2: null,
  asset: '67',
  rarity: 'rare',
  stage: 2,
  nextEvo: '68',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 113,
  damage: 37,
  desc: "Machoke: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
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
