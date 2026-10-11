// =============================================
// POKEMON #249: LUGIA (PSYCHIC / FLYING)
// Official Icon: assets/pokemon/icons/249.png
// =============================================

'use strict';

PIECES['249'] = {
  id: '249',
  num: '249',
  name: "Lugia",
  element: 'psychic',
  element2: 'flying',
  asset: '249',
  rarity: 'legend',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 15,
  maxHp: 162,
  damage: 52,
  desc: "Lugia: Tactical Pokémon battle unit.",

  steps: [
    {
      "dr": -1,
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": -1,
      "dc": 0,
      "mode": "all"
    },
    {
      "dr": -1,
      "dc": 1,
      "mode": "captureOnly"
    },
    {
      "dr": 0,
      "dc": -1,
      "mode": "all"
    },
    {
      "dr": 0,
      "dc": 1,
      "mode": "all"
    },
    {
      "dr": 1,
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": 1,
      "dc": 0,
      "mode": "all"
    },
    {
      "dr": 1,
      "dc": 1,
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
  slides: [
    {
      "dr": 1,
      "dc": -1,
      "maxSteps": 8,
      "mode": "all"
    },
    {
      "dr": 1,
      "dc": 1,
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
