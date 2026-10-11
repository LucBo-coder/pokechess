// =============================================
// POKEMON #005: CHARMELEON (FIRE)
// =============================================

'use strict';

PIECES['5'] = {
  id: '5',
  num: '5',
  name: 'Charmeleon',
  element: 'fire',
  element2: null,
  asset: '5',
  rarity: 'rare',
  stage: 2,
  nextEvo: '6',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 84,
  damage: 32,
  desc: "Charmeleon: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 0,
    "mode": "all"
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
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
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
