// =============================================
// POKEMON #079: SLOWPOKE (WATER / PSYCHIC)
// =============================================

'use strict';

PIECES['79'] = {
  id: '79',
  num: '79',
  name: 'Slowpoke',
  element: 'water',
  element2: 'psychic',
  asset: '79',
  rarity: 'common',
  stage: 1,
  nextEvo: '80',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 25,
  desc: "Slowpoke: Evolves into Slowbro (Battles) or Slowking (King's Rock).",

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
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
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
