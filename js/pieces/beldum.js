// =============================================
// POKEMON #374: BELDUM (STEEL / PSYCHIC)
// Official Icon: assets/pokemon/icons/374.png
// =============================================

'use strict';

PIECES['374'] = {
  id: '374',
  num: '374',
  name: "Beldum",
  element: 'steel',
  element2: 'psychic',
  asset: '374',
  rarity: 'rare',
  stage: 1,
  nextEvo: '375',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Beldum: Tactical Pokémon battle unit.",

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
