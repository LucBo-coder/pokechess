// =============================================
// POKEMON #074: GEODUDE (ROCK / GROUND)
// =============================================

'use strict';

PIECES['74'] = {
  id: '74',
  num: '74',
  name: 'Geodude',
  element: 'rock',
  element2: 'ground',
  asset: '74',
  rarity: 'common',
  stage: 1,
  nextEvo: '75',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 79,
  damage: 28,
  desc: "Geodude: Tactical Pokémon battle unit.",

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
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
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
