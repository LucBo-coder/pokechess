// =============================================
// POKEMON #126: MAGMAR (FIRE)
// =============================================

'use strict';

PIECES['126'] = {
  id: '126',
  num: '126',
  name: 'Magmar',
  element: 'fire',
  element2: null,
  asset: '126',
  rarity: 'rare',
  stage: 2,
  nextEvo: '467',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 91,
  damage: 41,
  desc: "Magmar: Tactical Pokémon battle unit.",

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
    "dc": -2,
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
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": -3,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 3,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 2,
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
