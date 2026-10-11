// =============================================
// POKEMON #77: PONYTA (FIRE)
// Official Icon: assets/pokemon/icons/77.png
// =============================================

'use strict';

PIECES['77'] = {
  id: '77',
  num: '77',
  name: "Ponyta",
  element: 'fire',
  element2: null,
  asset: '77',
  rarity: 'common',
  stage: 1,
  nextEvo: '78',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 74,
  damage: 28,
  desc: "Ponyta: Tactical Pokémon battle unit.",

  steps: [
    {
      "dr": -1,
      "dc": 0,
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
      "dc": 0,
      "mode": "moveOnly"
    },
    {
      "dr": 2,
      "dc": 0,
      "mode": "captureOnly"
    },
    {
      "dr": 3,
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
