// =============================================
// POKEMON #043: ODDISH (GRASS / POISON)
// =============================================

'use strict';

PIECES['43'] = {
  id: '43',
  num: '43',
  name: 'Oddish',
  element: 'grass',
  element2: 'poison',
  asset: '43',
  rarity: 'common',
  stage: 1,
  nextEvo: '44',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 69,
  damage: 28,
  desc: "Oddish: Tactical Pokémon battle unit.",

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
    "dr": 0,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "captureOnly"
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
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 0,
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
