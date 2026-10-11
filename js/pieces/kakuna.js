// =============================================
// POKEMON #014: KAKUNA (BUG / POISON)
// =============================================

'use strict';

PIECES['14'] = {
  id: '14',
  num: '14',
  name: 'Kakuna',
  element: 'bug',
  element2: 'poison',
  asset: '14',
  rarity: 'rare',
  stage: 2,
  nextEvo: '15',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 78,
  damage: 28,
  desc: "Kakuna: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": -1,
    "mode": "moveOnly"
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
