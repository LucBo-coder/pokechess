// =============================================
// POKEMON #021: SPEAROW (NORMAL / FLYING)
// =============================================

'use strict';

PIECES['21'] = {
  id: '21',
  num: '21',
  name: 'Spearow',
  element: 'normal',
  element2: 'flying',
  asset: '21',
  rarity: 'common',
  stage: 1,
  nextEvo: '22',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 55,
  damage: 22,
  desc: "Spearow: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
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
