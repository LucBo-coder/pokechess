// =============================================
// POKEMON #371: BAGON (DRAGON)
// Official Icon: assets/pokemon/icons/371.png
// =============================================

'use strict';

PIECES['371'] = {
  id: '371',
  num: '371',
  name: "Bagon",
  element: 'dragon',
  element2: null,
  asset: '371',
  rarity: 'rare',
  stage: 1,
  nextEvo: '372',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Bagon: Tactical Pokémon battle unit.",

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
      "dc": -2,
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
      "dr": 0,
      "dc": 2,
      "mode": "captureOnly"
    },
    {
      "dr": 1,
      "dc": -1,
      "mode": "captureOnly"
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
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": 2,
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
