// =============================================
// POKEMON #372: SHELGON (DRAGON)
// Official Icon: assets/pokemon/icons/372.png
// =============================================

'use strict';

PIECES['372'] = {
  id: '372',
  num: '372',
  name: "Shelgon",
  element: 'dragon',
  element2: null,
  asset: '372',
  rarity: 'rare',
  stage: 2,
  nextEvo: '373',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 107,
  damage: 36,
  desc: "Shelgon: Tactical Pokémon battle unit.",

  steps: [
    {
      "dr": -2,
      "dc": -2,
      "mode": "captureOnly"
    },
    {
      "dr": -2,
      "dc": 2,
      "mode": "captureOnly"
    },
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
      "dc": -2,
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
    },
    {
      "dr": 2,
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
