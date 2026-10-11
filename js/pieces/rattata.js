// =============================================
// POKEMON #019: RATTATA (NORMAL)
// =============================================

'use strict';

PIECES['19'] = {
  id: '19',
  num: '19',
  name: 'Rattata',
  element: 'normal',
  element2: null,
  asset: '19',
  rarity: 'common',
  stage: 1,
  nextEvo: '20',
  battlesToEvolve: 3,
  evoItem: null,
  value: 5,
  maxHp: 50,
  damage: 20,
  desc: "Rattata: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
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
    "dr": 1,
    "dc": 0,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
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
