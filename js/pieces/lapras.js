// =============================================
// POKEMON #131: LAPRAS (WATER / ICE)
// =============================================

'use strict';

PIECES['131'] = {
  id: '131',
  num: '131',
  name: 'Lapras',
  element: 'water',
  element2: 'ice',
  asset: '131',
  rarity: 'epic',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 10,
  maxHp: 155,
  damage: 40,
  desc: "Lapras: Tactical Pokémon battle unit.",

  steps: [
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
    "dr": -1,
    "dc": 0,
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
    "dc": -1,
    "startDr": 1,
    "startDc": 0,
    "mode": "all",
    "maxSteps": 8
  },
  {
    "dr": 1,
    "dc": 1,
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
