// =============================================
// POKEMON #280: RALTS (PSYCHIC / FAIRY)
// Official Icon: assets/pokemon/icons/280.png
// =============================================

'use strict';

PIECES['280'] = {
  id: '280',
  num: '280',
  name: "Ralts",
  element: 'psychic',
  element2: 'fairy',
  asset: '280',
  rarity: 'common',
  stage: 1,
  nextEvo: '281',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 50,
  damage: 18,
  desc: "Ralts: Tactical Pokémon battle unit.",

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
      "dc": -1,
      "mode": "moveOnly"
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
