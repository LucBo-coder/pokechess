// =============================================
// POKEMON #033: NIDORINO (POISON)
// =============================================

'use strict';

PIECES['33'] = {
  id: '33',
  num: '33',
  name: 'Nidorino',
  element: 'poison',
  element2: null,
  asset: '33',
  rarity: 'rare',
  stage: 2,
  nextEvo: '34',
  battlesToEvolve: 4,
  evoItem: null,
  value: 8,
  maxHp: 87,
  damage: 28,
  desc: "Nidorino: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
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
    "dr": 0,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": -1,
    "dc": 0,
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
