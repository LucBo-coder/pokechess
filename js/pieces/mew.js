// =============================================
// POKEMON #151: MEW (PSYCHIC)
// =============================================

'use strict';

PIECES['151'] = {
  id: '151',
  num: '151',
  name: 'Mew',
  element: 'psychic',
  element2: null,
  asset: '151',
  rarity: 'legend',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 15,
  maxHp: 145,
  damage: 52,
  desc: "Mew: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": -1,
    "dc": 1,
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
    "dr": 1,
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 0,
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
  },
  {
    "dr": -2,
    "dc": 2,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": -2,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 2,
    "mode": "all"
  },
  {
    "dr": -2,
    "dc": -2,
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
