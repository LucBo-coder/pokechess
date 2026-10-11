// =============================================
// POKEMON #133: EEVEE (NORMAL)
// =============================================

'use strict';

PIECES['133'] = {
  id: '133',
  num: '133',
  name: 'Eevee',
  element: 'normal',
  element2: null,
  asset: '133',
  rarity: 'rare',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Eevee: Evolves into Vaporeon (Water), Jolteon (Thunder), Flareon (Fire), Espeon (Sun), or Umbreon (Moon) using Evolution Stones.",

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
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 1,
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
