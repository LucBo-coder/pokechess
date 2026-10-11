// =============================================
// POKEMON #83: FARFETCH'D (NORMAL / FLYING)
// Official Icon: assets/pokemon/icons/83.png
// =============================================

'use strict';

PIECES['83'] = {
  id: '83',
  num: '83',
  name: "Farfetch'd",
  element: 'normal',
  element2: 'flying',
  asset: '83',
  rarity: 'common',
  stage: 1,
  nextEvo: '865',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 76,
  damage: 28,
  desc: "Farfetch'd: Tactical Pokémon battle unit.",

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
