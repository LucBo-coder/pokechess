// =============================================
// POKEMON #030: NIDORINA (POISON)
// =============================================

'use strict';

PIECES['30'] = {
  id: '30',
  num: '30',
  name: 'Nidorina',
  element: 'poison',
  element2: null,
  asset: '30',
  rarity: 'rare',
  stage: 2,
  nextEvo: '31',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 100,
  damage: 28,
  desc: "Nidorina: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
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
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
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
