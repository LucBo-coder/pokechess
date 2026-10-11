// =============================================
// POKEMON #086: SEEL (WATER)
// =============================================

'use strict';

PIECES['86'] = {
  id: '86',
  num: '86',
  name: 'Seel',
  element: 'water',
  element2: null,
  asset: '86',
  rarity: 'common',
  stage: 1,
  nextEvo: '87',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 80,
  damage: 19,
  desc: "Seel: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 1,
    "dc": 0,
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
    "dr": -1,
    "dc": 0,
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
