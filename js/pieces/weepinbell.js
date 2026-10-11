// =============================================
// POKEMON #070: WEEPINBELL (GRASS / POISON)
// =============================================

'use strict';

PIECES['70'] = {
  id: '70',
  num: '70',
  name: 'Weepinbell',
  element: 'grass',
  element2: 'poison',
  asset: '70',
  rarity: 'rare',
  stage: 2,
  nextEvo: '71',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 89,
  damage: 37,
  desc: "Weepinbell: Tactical Pokémon battle unit.",

  steps: [
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
    "dc": 0,
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
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
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
