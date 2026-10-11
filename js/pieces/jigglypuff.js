// =============================================
// POKEMON #039: JIGGLYPUFF (NORMAL / FAIRY)
// =============================================

'use strict';

PIECES['39'] = {
  id: '39',
  num: '39',
  name: 'Jigglypuff',
  element: 'normal',
  element2: 'fairy',
  asset: '39',
  rarity: 'rare',
  stage: 2,
  nextEvo: '40',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 115,
  damage: 28,
  desc: "Jigglypuff: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
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
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
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
