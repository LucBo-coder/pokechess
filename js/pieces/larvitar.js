// =============================================
// POKEMON #246: LARVITAR (ROCK / GROUND)
// Official Icon: assets/pokemon/icons/246.png
// =============================================

'use strict';

PIECES['246'] = {
  id: '246',
  num: '246',
  name: "Larvitar",
  element: 'rock',
  element2: 'ground',
  asset: '246',
  rarity: 'rare',
  stage: 1,
  nextEvo: '247',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Larvitar: Tactical Pokémon battle unit.",

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
      "dc": -3,
      "mode": "captureOnly"
    },
    {
      "dr": 3,
      "dc": 3,
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
