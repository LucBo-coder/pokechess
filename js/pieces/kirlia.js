// =============================================
// POKEMON #281: KIRLIA (PSYCHIC / FAIRY)
// Official Icon: assets/pokemon/icons/281.png
// =============================================

'use strict';

PIECES['281'] = {
  id: '281',
  num: '281',
  name: "Kirlia",
  element: 'psychic',
  element2: 'fairy',
  asset: '281',
  rarity: 'rare',
  stage: 2,
  nextEvo: '282',
  battlesToEvolve: 4,
  evoItem: null,
  evoBranches: ["282","475"],
  value: 8,
  maxHp: 78,
  damage: 28,
  desc: "Kirlia: Evolves into Gardevoir (Battles) or Gallade (Dawn Stone).",

  steps: [
    {
      "dr": -2,
      "dc": -1,
      "mode": "captureOnly"
    },
    {
      "dr": -2,
      "dc": 1,
      "mode": "captureOnly"
    },
    {
      "dr": -1,
      "dc": -1,
      "mode": "moveOnly"
    },
    {
      "dr": -1,
      "dc": 0,
      "mode": "captureOnly"
    },
    {
      "dr": -1,
      "dc": 1,
      "mode": "moveOnly"
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
      "dr": 2,
      "dc": -2,
      "mode": "captureOnly"
    },
    {
      "dr": 2,
      "dc": 2,
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
