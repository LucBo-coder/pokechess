// =============================================
// POKEMON #160: FERALIGATR (WATER)
// =============================================

'use strict';

PIECES['160'] = {
  id: '160',
  num: '160',
  name: 'Feraligatr',
  element: 'water',
  element2: null,
  asset: '160',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 129,
  damage: 41,
  desc: "Feraligatr: Tactical Pokémon battle unit.",

  steps: [
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
    "dc": 0,
    "mode": "moveOnly"
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
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
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
