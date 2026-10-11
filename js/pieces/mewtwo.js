// =============================================
// POKEMON #150: MEWTWO (PSYCHIC)
// =============================================

'use strict';

PIECES['150'] = {
  id: '150',
  num: '150',
  name: 'Mewtwo',
  element: 'psychic',
  element2: null,
  asset: '150',
  rarity: 'legend',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 15,
  maxHp: 148,
  damage: 60,
  desc: "Mewtwo: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": -2,
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
    "dr": -1,
    "dc": 2,
    "mode": "captureOnly"
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
    "dr": -2,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": -2,
    "dc": -1,
    "mode": "captureOnly"
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
    "dr": 1,
    "dc": 2,
    "mode": "captureOnly"
  },
  {
    "dr": 2,
    "dc": 1,
    "mode": "captureOnly"
  }
],
  slides: [
  {
    "dr": 1,
    "dc": 0,
    "startDr": 2,
    "startDc": 0,
    "mode": "all",
    "maxSteps": 8
  },
  {
    "dr": -1,
    "dc": 0,
    "startDr": -2,
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
