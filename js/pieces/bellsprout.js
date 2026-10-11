// =============================================
// POKEMON #069: BELLSPROUT (GRASS / POISON)
// =============================================

'use strict';

PIECES['69'] = {
  id: '69',
  num: '69',
  name: 'Bellsprout',
  element: 'grass',
  element2: 'poison',
  asset: '69',
  rarity: 'common',
  stage: 1,
  nextEvo: '70',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 67,
  damage: 28,
  desc: "Bellsprout: Tactical Pokémon battle unit.",

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
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
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
