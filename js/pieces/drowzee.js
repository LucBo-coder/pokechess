// =============================================
// POKEMON #096: DROWZEE (PSYCHIC)
// =============================================

'use strict';

PIECES['96'] = {
  id: '96',
  num: '96',
  name: 'Drowzee',
  element: 'psychic',
  element2: null,
  asset: '96',
  rarity: 'common',
  stage: 1,
  nextEvo: '97',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 20,
  desc: "Drowzee: Tactical Pokémon battle unit.",

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
    "dr": 1,
    "dc": 1,
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
  },
  {
    "dr": 1,
    "dc": -1,
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
