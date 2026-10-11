// =============================================
// POKEMON #1: BULBASAUR (GRASS / POISON)
// Official Icon: assets/pokemon/icons/1.png
// =============================================

'use strict';

PIECES['1'] = {
  id: '1',
  num: '1',
  name: "Bulbasaur",
  element: 'grass',
  element2: 'poison',
  asset: '1',
  rarity: 'rare',
  stage: 1,
  nextEvo: '2',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Bulbasaur: Tactical Pokémon battle unit.",

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
      "dc": -1,
      "mode": "moveOnly"
    },
    {
      "dr": 0,
      "dc": 1,
      "mode": "moveOnly"
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
