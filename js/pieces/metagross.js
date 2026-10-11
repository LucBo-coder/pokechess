// =============================================
// POKEMON #376: METAGROSS (STEEL / PSYCHIC)
// Official Icon: assets/pokemon/icons/376.png
// =============================================

'use strict';

PIECES['376'] = {
  id: '376',
  num: '376',
  name: "Metagross",
  element: 'steel',
  element2: 'psychic',
  asset: '376',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 134,
  damage: 53,
  desc: "Metagross: Tactical Pokémon battle unit.",

  steps: [
    {
      "dr": -2,
      "dc": -2,
      "mode": "captureOnly"
    },
    {
      "dr": -2,
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": -2,
      "dc": 0,
      "mode": "captureOnly"
    },
    {
      "dr": -2,
      "dc": 1,
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
      "mode": "moveOnly"
    },
    {
      "dr": -1,
      "dc": 0,
      "mode": "captureOnly"
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
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": 0,
      "dc": 1,
      "mode": "captureOnly"
    },
    {
      "dr": 0,
      "dc": 2,
      "mode": "captureOnly"
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
      "dc": 0,
      "mode": "captureOnly"
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
      "dr": 2,
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": 2,
      "dc": 0,
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
