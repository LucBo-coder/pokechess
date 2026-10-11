// =============================================
// POKEMON #253: GROVYLE (GRASS)
// =============================================

'use strict';

PIECES['253'] = {
  id: '253',
  num: '253',
  name: 'Grovyle',
  element: 'grass',
  element2: null,
  asset: '253',
  rarity: 'rare',
  stage: 2,
  nextEvo: '254',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 78,
  damage: 34,
  desc: "Grovyle: Tactical Pokémon battle unit.",

  steps: [
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
    "dr": -1,
    "dc": -1,
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
