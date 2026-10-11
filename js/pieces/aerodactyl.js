// =============================================
// POKEMON #142: AERODACTYL (ROCK / FLYING)
// =============================================

'use strict';

PIECES['142'] = {
  id: '142',
  num: '142',
  name: 'Aerodactyl',
  element: 'rock',
  element2: 'flying',
  asset: '142',
  rarity: 'epic',
  stage: 1,
  nextEvo: null,
  battlesToEvolve: 0,
  evoItem: null,
  value: 10,
  maxHp: 112,
  damage: 40,
  desc: "Aerodactyl: Tactical Pokémon battle unit.",

  steps: [
  {
    "dr": -1,
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
    "dr": 1,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 2,
    "dc": 0,
    "mode": "all"
  },
  {
    "dr": 0,
    "dc": 2,
    "mode": "moveOnly"
  },
  {
    "dr": 0,
    "dc": -2,
    "mode": "moveOnly"
  },
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
    "dr": 3,
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
