// =============================================
// POKEMON #155: CYNDAQUIL (FIRE)
// =============================================

'use strict';

PIECES['155'] = {
  id: '155',
  num: '155',
  name: 'Cyndaquil',
  element: 'fire',
  element2: null,
  asset: '155',
  rarity: 'rare',
  stage: 1,
  nextEvo: '156',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Cyndaquil: Tactical Pokémon battle unit.",

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
    "dc": -1,
    "mode": "all"
  },
  {
    "dr": 1,
    "dc": 1,
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
