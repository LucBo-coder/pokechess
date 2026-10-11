// =============================================
// POKEMON #037: VULPIX (FIRE)
// =============================================

'use strict';

PIECES['37'] = {
  id: '37',
  num: '37',
  name: 'Vulpix',
  element: 'fire',
  element2: null,
  asset: '37',
  rarity: 'common',
  stage: 1,
  nextEvo: '38',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 56,
  damage: 20,
  desc: "Vulpix: Tactical Pokémon battle unit.",

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
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
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
