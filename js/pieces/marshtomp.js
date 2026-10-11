// =============================================
// POKEMON #259: MARSHTOMP (WATER / GROUND)
// =============================================

'use strict';

PIECES['259'] = {
  id: '259',
  num: '259',
  name: 'Marshtomp',
  element: 'water',
  element2: 'ground',
  asset: '259',
  rarity: 'rare',
  stage: 2,
  nextEvo: '260',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 102,
  damage: 33,
  desc: "Marshtomp: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
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
