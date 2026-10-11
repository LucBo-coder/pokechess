// =============================================
// POKEMON #252: TREECKO (GRASS)
// =============================================

'use strict';

PIECES['252'] = {
  id: '252',
  num: '252',
  name: 'Treecko',
  element: 'grass',
  element2: null,
  asset: '252',
  rarity: 'rare',
  stage: 1,
  nextEvo: '253',
  battlesToEvolve: 3,
  evoItem: null,
  value: 7,
  maxHp: 78,
  damage: 28,
  desc: "Treecko: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": 0,
    "dc": -1,
    "mode": "captureOnly"
  },
  {
    "dr": 0,
    "dc": 1,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": -1,
    "mode": "moveOnly"
  },
  {
    "dr": 1,
    "dc": 0,
    "mode": "captureOnly"
  },
  {
    "dr": 1,
    "dc": 1,
    "mode": "moveOnly"
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
