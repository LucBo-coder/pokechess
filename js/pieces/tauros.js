// =============================================
// POKEMON #128: TAUROS (NORMAL)
// =============================================

'use strict';

PIECES['128'] = {
  id: '128',
  num: '128',
  name: 'Tauros',
  element: 'normal',
  element2: null,
  asset: '128',
  rarity: 'common',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 28,
  desc: "Tauros: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
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
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "captureOnly"
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
