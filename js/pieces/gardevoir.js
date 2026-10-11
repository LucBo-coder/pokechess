// =============================================
// POKEMON #282: GARDEVOIR (PSYCHIC / FAIRY)
// Official Icon: assets/pokemon/icons/282.png
// =============================================

'use strict';

PIECES['282'] = {
  id: '282',
  num: '282',
  name: "Gardevoir",
  element: 'psychic',
  element2: 'fairy',
  asset: '282',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 112,
  damage: 46,
  desc: "Gardevoir: Tactical Pokémon battle unit.",

  steps: [
    {
      "dr": -2,
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": -2,
      "dc": 1,
      "mode": "captureOnly"
    },
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
      "dc": 0,
      "mode": "captureOnly"
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
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": 0,
      "dc": 1,
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
      "dr": 2,
      "dc": -2,
      "mode": "captureOnly"
    },
    {
      "dr": 2,
      "dc": 2,
      "mode": "captureOnly"
    },
    {
      "dr": 3,
      "dc": 0,
      "mode": "captureOnly"
    }
  ],
  slides: [
    {
      "dr": 1,
      "dc": 0,
      "maxSteps": 8,
      "mode": "all"
    }
  ],

  getMoves(game, i, r, c, p, push, slide) {
    if (typeof CustomMoveSystem !== 'undefined') {
      return CustomMoveSystem.getMoves(game, i, r, c, p, push, slide);
    }
    return [];
  }
};
