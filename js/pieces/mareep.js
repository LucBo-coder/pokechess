// =============================================
// POKEMON #179: MAREEP (ELECTRIC)
// =============================================

'use strict';

PIECES['179'] = {
  id: '179',
  num: '179',
  name: 'Mareep',
  element: 'electric',
  element2: null,
  asset: '179',
  rarity: 'common',
  stage: 1,
  nextEvo: '180',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 75,
  damage: 25,
  desc: "Mareep: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -3,
    "dc": 0,
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
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
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
