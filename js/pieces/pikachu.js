// =============================================
// POKEMON #025: PIKACHU (ELECTRIC)
// =============================================

'use strict';

PIECES['25'] = {
  id: '25',
  num: '25',
  name: 'Pikachu',
  element: 'electric',
  element2: null,
  asset: '25',
  rarity: 'rare',
  stage: 2,
  nextEvo: '26',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 78,
  damage: 28,
  desc: "Pikachu: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "moveOnly"
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
