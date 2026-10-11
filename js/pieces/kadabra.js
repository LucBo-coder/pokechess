// =============================================
// POKEMON #064: KADABRA (PSYCHIC)
// =============================================

'use strict';

PIECES['64'] = {
  id: '64',
  num: '64',
  name: 'Kadabra',
  element: 'psychic',
  element2: null,
  asset: '64',
  rarity: 'rare',
  stage: 2,
  nextEvo: '65',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 78,
  damage: 41,
  desc: "Kadabra: Tactical Pokémon battle unit.",

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
    "dr": 2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 2,
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
