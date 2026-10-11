// =============================================
// POKEMON #248: TYRANITAR (ROCK / DARK)
// =============================================

'use strict';

PIECES['248'] = {
  id: '248',
  num: '248',
  name: 'Tyranitar',
  element: 'rock',
  element2: 'dark',
  asset: '248',
  rarity: 'epic',
  stage: 3,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 12,
  maxHp: 149,
  damage: 52,
  desc: "Tyranitar: Tactical Pokémon battle unit.",

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
    "dr": 0,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
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
    "dr": 1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "all"
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
    "dr": -2,
    "dc": -2,
    "mode": "captureOnly"
  },
  {
    "dr": -3,
    "dc": -3,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": -3,
    "dc": 3,
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
