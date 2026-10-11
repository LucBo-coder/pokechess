// =============================================
// POKEMON #140: KABUTO (ROCK / WATER)
// =============================================

'use strict';

PIECES['140'] = {
  id: '140',
  num: '140',
  name: 'Kabuto',
  element: 'rock',
  element2: 'water',
  asset: '140',
  rarity: 'common',
  stage: 1,
  nextEvo: '141',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 65,
  damage: 28,
  desc: "Kabuto: Tactical Pokémon battle unit.",

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
    "dc": -2,
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
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 1,
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
