// =============================================
// POKEMON #052: MEOWTH (NORMAL)
// =============================================

'use strict';

PIECES['52'] = {
  id: '52',
  num: '52',
  name: 'Meowth',
  element: 'normal',
  element2: null,
  asset: '52',
  rarity: 'common',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 56,
  damage: 18,
  desc: "Meowth: Tactical Pokémon battle unit.",

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
