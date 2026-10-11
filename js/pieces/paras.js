// =============================================
// POKEMON #046: PARAS (BUG / GRASS)
// =============================================

'use strict';

PIECES['46'] = {
  id: '46',
  num: '46',
  name: 'Paras',
  element: 'bug',
  element2: 'grass',
  asset: '46',
  rarity: 'common',
  stage: 1,
  nextEvo: '47',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 58,
  damage: 27,
  desc: "Paras: Tactical Pokémon battle unit.",

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
    "dc": 1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": -1,
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
