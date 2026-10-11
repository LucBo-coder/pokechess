// =============================================
// POKEMON #065: ALAKAZAM (PSYCHIC)
// =============================================

'use strict';

PIECES['65'] = {
  id: '65',
  num: '65',
  name: 'Alakazam',
  element: 'psychic',
  element2: null,
  asset: '65',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 112,
  damage: 48,
  desc: "Alakazam: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 2,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 2,
    "mode": "moveOnly"
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
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 3,
    "mode": "captureOnly"
  },
  {
    "dr": 3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -3,
    "mode": "captureOnly"
  },
  {
    "dr": -3,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "all"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 2,
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
