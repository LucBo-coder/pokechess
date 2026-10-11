// =============================================
// POKEMON #047: PARASECT (BUG / GRASS)
// =============================================

'use strict';

PIECES['47'] = {
  id: '47',
  num: '47',
  name: 'Parasect',
  element: 'bug',
  element2: 'grass',
  asset: '47',
  rarity: 'rare',
  stage: 2,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 8,
  maxHp: 94,
  damage: 36,
  desc: "Parasect: Tactical Pokémon battle unit.",

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
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "all"
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
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 2,
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
