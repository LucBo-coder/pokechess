// =============================================
// POKEMON #011: METAPOD (BUG)
// =============================================

'use strict';

PIECES['11'] = {
  id: '11',
  num: '11',
  name: 'Metapod',
  element: 'bug',
  element2: null,
  asset: '11',
  rarity: 'rare',
  stage: 2,
  nextEvo: '12',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 78,
  damage: 28,
  desc: "Metapod: Tactical Pokémon battle unit.",

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
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
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
