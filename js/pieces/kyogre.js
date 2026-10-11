// =============================================
// POKEMON #382: KYOGRE (WATER)
// =============================================

'use strict';

PIECES['382'] = {
  id: '382',
  num: '382',
  name: 'Kyogre',
  element: 'water',
  element2: null,
  asset: '382',
  rarity: 'legend',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 15,
  maxHp: 142,
  damage: 58,
  desc: "Kyogre: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -2,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": 1,
    "mode": "captureOnly"
  },
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
    "dc": -2,
    "mode": "captureOnly"
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
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "moveOnly"
  },
  {
    "dr": 2,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "moveOnly"
  },
  {
    "dr": -2,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "moveOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 1,
    "startDc": 0,
    "mode": "all",
    "maxSteps": 8
  }
],

  getMoves(game, i, r, c, p, push, slide) {
    if (typeof CustomMoveSystem !== 'undefined') {
      return CustomMoveSystem.getMoves(game, i, r, c, p, push, slide);
    }
    return [];
  }
};
