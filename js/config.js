// =============================================
// CHESS+ ROGUELIKE: CONFIGURATION & CONSTANTS
// POKEMON STARTER EDITION (1-9)
// =============================================

'use strict';

const W = (typeof window !== 'undefined' ? window : globalThis).W = 'w';
const B = (typeof window !== 'undefined' ? window : globalThis).B = 'b';
const ASSET_VERSION = (typeof window !== 'undefined' ? window : globalThis).ASSET_VERSION = '3.3.1791699025';

// Global piece registry where every pokemon registers its stats and moves
var PIECES = (typeof window !== 'undefined' ? window : globalThis).PIECES = (typeof window !== 'undefined' && window.PIECES) || (typeof globalThis !== 'undefined' && globalThis.PIECES) || {};

// Ordered piece keys: 1-9 (The 3 iconic Kanto starter evolution lines)
const ALL_PIECE_KEYS = (typeof window !== 'undefined' ? window : globalThis).ALL_PIECE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Stage enemy armies configuration with balanced early-game progression (Bugs & Normal units first)
const STAGE_CONFIGS = (typeof window !== 'undefined' ? window : globalThis).STAGE_CONFIGS = [
  { name: 'Viridian Forest Entrance', pieces: ['10', '13'] }, // Caterpie, Weedle (easy bugs)
  { name: 'Bug Catcher Outpost', pieces: ['10', '11', '13'] }, // Caterpie, Metapod, Weedle
  { name: 'Route 1 Meadow', pieces: ['16', '19', '19'] }, // Pidgey, 2x Rattata
  { name: 'Pewter Outskirts', pieces: ['11', '14', '21'] }, // Metapod, Kakuna, Spearow
  { name: 'Viridian Deep Woods', pieces: ['12', '15', '17'] }, // Butterfree, Beedrill, Pidgeotto
  { name: 'Mt. Moon Caverns', pieces: ['41', '74', '27', '35'] }, // Zubat, Geodude, Sandshrew, Clefairy
  { name: 'Cerulean Waterways', pieces: ['54', '60', '118', '120'] }, // Psyduck, Poliwag, Goldeen, Staryu
  { name: 'Vermilion Harbor', pieces: ['25', '81', '100', '58'] }, // Pikachu, Magnemite, Voltorb, Growlithe
  { name: 'Pokémon Tower Haunted', pieces: ['92', '93', '104', '105'] }, // Gastly, Haunter, Cubone, Marowak
  { name: 'Silph Co. Showdown', pieces: ['64', '82', '101', '137'] }, // Kadabra, Magneton, Electrode, Porygon
  { name: 'Seafoam Island Depths', pieces: ['86', '87', '90', '91', '131'] }, // Seel, Dewgong, Shellder, Cloyster, Lapras
  { name: 'Cinnabar Volcano', pieces: ['59', '77', '78', '126', '136'] }, // Arcanine, Ponyta, Rapidash, Magmar, Flareon
  { name: 'Victory Road Gauntlet', pieces: ['68', '76', '95', '112', '123'] }, // Machamp, Golem, Onix, Rhydon, Scyther
  { name: 'Elite Four League', pieces: ['130', '143', '149', '94', '65'] }, // Gyarados, Snorlax, Dragonite, Gengar, Alakazam
  { name: 'Indigo Plateau Champion', pieces: ['3', '6', '9', '149', '150'] } // Venusaur, Charizard, Blastoise, Dragonite, Mewtwo
];

// Helper to get Pokemon icon path
const getPieceIconUrl = (typeof window !== 'undefined' ? window : globalThis).getPieceIconUrl = function(type) {
  const asset = (typeof PIECES !== 'undefined' && PIECES[type]?.asset) || type || '1';
  if (typeof window !== 'undefined' && window.POKEMON_ICON_PACK) {
    const key = String(asset).replace(/\.png$/, '');
    if (window.POKEMON_ICON_PACK[key]) return window.POKEMON_ICON_PACK[key];
    if (window.POKEMON_ICON_PACK[asset]) return window.POKEMON_ICON_PACK[asset];
    if (window.POKEMON_ICON_PACK['egg']) return window.POKEMON_ICON_PACK['egg'];
  }
  const v = (typeof ASSET_VERSION !== 'undefined') ? ASSET_VERSION : '1';
  return `assets/pokemon/icons/${asset}.png?v=${v}`;
};

// Base speed scaling: 80 (slowest tank) -> 200 (fastest speedster)
const POKEMON_BASE_SPEEDS = (typeof window !== 'undefined' ? window : globalThis).POKEMON_BASE_SPEEDS = {
  // Iconic / User-requested Pokémon
  '135': 185, // Jolteon (Fast electric speedster)
  '6':   155, // Charizard (Fast fire flyer)
  '3':   105, // Venusaur (Balanced grass/poison)
  '208':  85, // Steelix (Massive heavy steel tank)
  
  // Starters & lines
  '1':    90, // Bulbasaur
  '2':   100, // Ivysaur
  '4':   110, // Charmander
  '5':   130, // Charmeleon
  '7':    90, // Squirtle
  '8':   100, // Wartortle
  '9':   105, // Blastoise
  
  // Speedsters
  '291': 200, // Ninjask (Max speed)
  '101': 195, // Electrode
  '142': 185, // Aerodactyl
  '150': 185, // Mewtwo
  '65':  175, // Alakazam
  '94':  170, // Gengar
  '123': 165, // Scyther
  '26':  165, // Raichu
  '18':  160, // Pidgeot
  '25':  150, // Pikachu
  '151': 150, // Mew
  '149': 135, // Dragonite
  '130': 140, // Gyarados
  '136': 120, // Flareon
  '134': 110, // Vaporeon
  
  // Heavy Tanks / Slow
  '143':  85, // Snorlax
  '95':   85, // Onix
  '76':   85, // Golem
  '80':   85, // Slowbro
  '199':  85, // Slowking
  '213':  80, // Shuckle (Minimum base speed)
  '91':   95, // Cloyster
  '112':  90, // Rhydon
  '464':  85, // Rhyperior
  '131': 110, // Lapras
};

const getPokemonBaseSpeed = (typeof window !== 'undefined' ? window : globalThis).getPokemonBaseSpeed = function(pDef) {
  if (!pDef) return 100;
  if (pDef.speed !== undefined && pDef.speed !== null) {
    return Math.max(80, Math.min(200, Math.round(pDef.speed)));
  }
  const id = String(pDef.id || pDef.num || '');
  if (POKEMON_BASE_SPEEDS[id]) {
    return POKEMON_BASE_SPEEDS[id];
  }
  
  // Derived speed from elements, stage and archetype
  const elem = (pDef.element || '').toLowerCase();
  let base = 110;
  if (['electric', 'flying'].includes(elem)) base = 160;
  else if (['ghost', 'dark', 'psychic'].includes(elem)) base = 145;
  else if (['fire', 'dragon', 'bug', 'normal'].includes(elem)) base = 130;
  else if (['fighting', 'water', 'fairy'].includes(elem)) base = 115;
  else if (['grass', 'poison', 'ice'].includes(elem)) base = 105;
  else if (['ground', 'rock', 'steel'].includes(elem)) base = 88;
  
  const stage = pDef.stage || 1;
  base += (stage - 1) * 6;
  
  let hash = 0;
  const str = String(pDef.name || id || 'poke');
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 37;
  base += (hash % 21) - 10;
  
  return Math.max(80, Math.min(200, Math.round(base)));
};

// Backward-compatibility proxies so existing code/HTML works seamlessly
const gScope = typeof window !== 'undefined' ? window : globalThis;
gScope.PIECE_TYPES = new Proxy({}, { get: (t, k) => PIECES[k]?.asset || k || '1' });
gScope.PIECE_NAMES = new Proxy({}, { get: (t, k) => PIECES[k]?.name || k });
gScope.PIECE_VALUES = new Proxy({}, { get: (t, k) => PIECES[k]?.value || 100 });
gScope.PIECE_STATS = new Proxy({}, { get: (t, k) => PIECES[k] || PIECES['1'] });
gScope.PIECE_INFO = new Proxy({}, { get: (t, k) => PIECES[k] || PIECES['1'] });

const PIECE_TYPES = gScope.PIECE_TYPES;
const PIECE_NAMES = gScope.PIECE_NAMES;
const PIECE_VALUES = gScope.PIECE_VALUES;
const PIECE_STATS = gScope.PIECE_STATS;
const PIECE_INFO = gScope.PIECE_INFO;

