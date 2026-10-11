// =============================================
// POKEMON #137: PORYGON (NORMAL)
// =============================================

'use strict';

PIECES['137'] = {
  id: '137',
  num: '137',
  name: 'Porygon',
  element: 'normal',
  element2: null,
  asset: '137',
  rarity: 'common',
  stage: 1,
  nextEvo: '233',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 28,
  desc: "Porygon: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -3,
    "dc": 0,
    "mode": "captureOnly"
  },
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
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 3,
    "dc": 0,
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
