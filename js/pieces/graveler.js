// =============================================
// POKEMON #075: GRAVELER (ROCK / GROUND)
// =============================================

'use strict';

PIECES['75'] = {
  id: '75',
  num: '75',
  name: 'Graveler',
  element: 'rock',
  element2: 'ground',
  asset: '75',
  rarity: 'rare',
  stage: 2,
  nextEvo: '76',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 101,
  damage: 35,
  desc: "Graveler: Tactical Pokémon battle unit.",

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
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
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
