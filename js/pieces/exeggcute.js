// =============================================
// POKEMON #102: EXEGGCUTE (GRASS / PSYCHIC)
// =============================================

'use strict';

PIECES['102'] = {
  id: '102',
  num: '102',
  name: 'Exeggcute',
  element: 'grass',
  element2: 'psychic',
  asset: '102',
  rarity: 'common',
  stage: 1,
  nextEvo: '103',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 23,
  desc: "Exeggcute: Tactical Pokémon battle unit.",

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
    "dr": -1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 1,
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
