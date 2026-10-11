// =============================================
// POKEMON #375: METANG (STEEL / PSYCHIC)
// Official Icon: assets/pokemon/icons/375.png
// =============================================

'use strict';

PIECES['375'] = {
  id: '375',
  num: '375',
  name: "Metang",
  element: 'steel',
  element2: 'psychic',
  asset: '375',
  rarity: 'rare',
  stage: 2,
  nextEvo: '376',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 101,
  damage: 29,
  desc: "Metang: Tactical Pokémon battle unit.",

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
