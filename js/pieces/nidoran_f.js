// =============================================
// POKEMON #29: NIDORAN♀ (POISON)
// Official Icon: assets/pokemon/icons/29.png
// =============================================

'use strict';

PIECES['29'] = {
  id: '29',
  num: '29',
  name: "Nidoran♀",
  element: 'poison',
  element2: null,
  asset: '29',
  rarity: 'common',
  stage: 1,
  nextEvo: '30',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 79,
  damage: 19,
  desc: "Nidoran♀: Tactical Pokémon battle unit.",

  steps: [
    {
      "dr": -1,
      "dc": -2,
      "mode": "captureOnly"
    },
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
      "dr": -1,
      "dc": 2,
      "mode": "captureOnly"
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
