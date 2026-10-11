// =============================================
// POKEMON #115: KANGASKHAN (NORMAL)
// =============================================

'use strict';

PIECES['115'] = {
  id: '115',
  num: '115',
  name: 'Kangaskhan',
  element: 'normal',
  element2: null,
  asset: '115',
  rarity: 'common',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 28,
  desc: "Kangaskhan: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
    "dc": 1,
    "mode": "moveOnly"
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
    "dr": 1,
    "dc": 0,
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
    "dr": -1,
    "dc": -1,
    "mode": "moveOnly"
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
