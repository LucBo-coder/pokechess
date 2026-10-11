// =============================================
// POKEMON #016: PIDGEY (NORMAL / FLYING)
// =============================================

'use strict';

PIECES['16'] = {
  id: '16',
  num: '16',
  name: 'Pidgey',
  element: 'normal',
  element2: 'flying',
  asset: '16',
  rarity: 'common',
  stage: 1,
  nextEvo: '17',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 58,
  damage: 18,
  desc: "Pidgey: Tactical Pokémon battle unit.",

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
    "dr": -1,
    "dc": 0,
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
