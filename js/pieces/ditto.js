// =============================================
// POKEMON #132: DITTO (NORMAL)
// =============================================

'use strict';

PIECES['132'] = {
  id: '132',
  num: '132',
  name: 'Ditto',
  element: 'normal',
  element2: null,
  asset: '132',
  rarity: 'common',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 5,
  maxHp: 70,
  damage: 20,
  desc: "Ditto: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
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
    "dc": 0,
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
