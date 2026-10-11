// =============================================
// CHESS+ ROGUELIKE: POKEMON TYPE EFFECTIVENESS SYSTEM
// 18 Elements, Board square affinity & Dual-type Defense
// =============================================

'use strict';

const TYPE_CHART = {
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5
  },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5
  }
};

const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  steel: '#B8B8D0',
  dark: '#705848',
  fairy: '#EE99AC'
};

const TypeSystem = {
  // Đánh giá hệ của Pokémon khi xếp đội hình Hex.
  // Không sử dụng quy tắc ô trắng/đen của bàn cờ cũ.
  getHexTypeAdvantage(attacker, defender) {
    return this.getHexAttack(attacker, defender).multiplier;
  },

  getHexAttack(attacker, defender) {
    if (!attacker || !defender) return { element: 'normal', multiplier: 1 };

    const atk = this.getEffectivePieceElements(attacker);
    const def = this.getEffectivePieceElements(defender);

    const attackingTypes = [...new Set(
      [atk.element, atk.element2].filter(Boolean)
    )];

    const defendingTypes = [...new Set(
      [def.element, def.element2].filter(Boolean)
    )];

    let best = null;
    for (const element of attackingTypes) {
      const multiplier = this.getEffectiveness(element, defendingTypes);
      if (!best || multiplier > best.multiplier) best = { element, multiplier };
    }
    return best ?? { element: 'normal', multiplier: 1 };
  },

  // So sánh lợi thế tấn công và nguy cơ bị khắc hệ.
  getHexMatchupScore(attacker, defender) {
    const offense = this.getHexTypeAdvantage(attacker, defender);
    const defense = this.getHexTypeAdvantage(defender, attacker);

    return {
      offense,
      defense,
      score: offense - defense
    };
  },
  /**
   * Determine if square index is White or Black tile
   * In the game board, (row + col) % 2 === 0 is black tile (b_tile.png),
   * (row + col) % 2 !== 0 is white tile (w_tile.png).
   */
  isWhiteSquare(sq) {
    if (sq === undefined || sq === null || sq < 0) return true;
    const r = Math.floor(sq / 8);
    const c = sq % 8;
    return (r + c) % 2 !== 0;
  },

  /**
   * Helper to resolve effective element and element2 for any piece/info,
   * taking into account equipped Type Gem talismans (replaces 2nd element).
   */
  getEffectivePieceElements(pieceOrInfo) {
    if (!pieceOrInfo) return { element: 'normal', element2: null };
    const pType = pieceOrInfo.type || pieceOrInfo.id;
    const baseDef = (typeof PIECES !== 'undefined' && pType && PIECES[pType]) ? PIECES[pType] : pieceOrInfo;
    const t1 = (baseDef.element || 'normal').toLowerCase();
    let t2 = baseDef.element2 ? baseDef.element2.toLowerCase() : null;

    // Check if piece has an equipped talisman that overrides 2nd element
    const talismans = pieceOrInfo.talismans || [];
    if (Array.isArray(talismans) && typeof TalismanSystem !== 'undefined') {
      const overrideType = TalismanSystem.getTypeOverrideFromTalismans(talismans);
      if (overrideType) {
        t2 = overrideType.toLowerCase();
      }
    }

    if (typeof pieceOrInfo === 'object' && pieceOrInfo !== null) {
      pieceOrInfo.element = t1;
      pieceOrInfo.element2 = t2;
    }

    return { element: t1, element2: t2 };
  },

  /**
   * Rule:
   * - Standing on White square -> uses 1st Element (element)
   * - Standing on Black square -> uses 2nd Element (element2) if available, otherwise 1st Element
   */
  getAttackingType(piece, fromSq) {
    if (!piece) return 'normal';
    const { element: t1, element2: t2 } = this.getEffectivePieceElements(piece);

    const onWhite = this.isWhiteSquare(fromSq);
    if (onWhite) {
      return t1;
    } else {
      return t2 || t1;
    }
  },

  /**
   * Rule:
   * - Defender defends with both types (element and element2 if present)
   */
  getDefendingTypes(piece) {
    if (!piece) return ['normal'];
    const { element: t1, element2: t2 } = this.getEffectivePieceElements(piece);
    return t2 ? [t1, t2] : [t1];
  },

  /**
   * Get single or dual-type effectiveness multiplier
   */
  getEffectiveness(atkType, defTypes) {
    if (!atkType) return 1.0;
    const aType = atkType.toLowerCase();
    if (typeof defTypes === 'string') defTypes = [defTypes];

    let mult = 1.0;
    const chart = TYPE_CHART[aType] || {};
    for (const dt of defTypes) {
      if (!dt) continue;
      const dType = dt.toLowerCase();
      const factor = (chart[dType] !== undefined) ? chart[dType] : 1.0;
      mult *= factor;
    }
    return mult;
  },

  /**
   * Get text badge & descriptor for effectiveness
   */
  getDescriptor(mult) {
    if (mult === 0) {
      return { tag: 'immune', label: 'IMMUNE (x0)', popupText: 'IMMUNE!', mult: 0 };
    }
    if (mult >= 4.0) {
      return { tag: 'crit-4x', label: 'SUPER EFFECTIVE (x4)', popupText: 'x4 CRIT!', mult };
    }
    if (mult >= 2.0) {
      return { tag: 'crit-2x', label: 'SUPER EFFECTIVE (x2)', popupText: 'x2 SUPER!', mult };
    }
    if (mult <= 0.25) {
      return { tag: 'resist-4x', label: 'DOUBLE RESISTED (x0.25)', popupText: 'x0.25 RESIST', mult };
    }
    if (mult <= 0.5) {
      return { tag: 'resist-2x', label: 'NOT VERY EFFECTIVE (x0.5)', popupText: 'x0.5 RESIST', mult };
    }
    return { tag: 'neutral', label: 'NORMAL EFFECTIVE (x1)', popupText: null, mult: 1.0 };
  },

  /**
   * Calculate full combat damage with type effectiveness
   */
  calculateCombatDamage(attackerPiece, defenderPiece, fromSq, baseDamage) {
    const atkType = this.getAttackingType(attackerPiece, fromSq);
    const defTypes = this.getDefendingTypes(defenderPiece);
    const mult = this.getEffectiveness(atkType, defTypes);
    const descriptor = this.getDescriptor(mult);

    let finalDamage = Math.round(baseDamage * mult);
    if (mult > 0 && finalDamage < 1) finalDamage = 1;
    if (mult === 0) finalDamage = 0;

    return {
      damage: finalDamage,
      multiplier: mult,
      atkType,
      defTypes,
      descriptor,
      onWhiteSquare: this.isWhiteSquare(fromSq)
    };
  },

  /**
   * Return URL for 16x16 circular element badge
   */
  getIconUrl(type) {
    if (!type) type = 'normal';
    return `assets/elements/${type.toLowerCase()}.png`;
  },

  /**
   * Return HTML for element icon badge(s)
   */
  renderBadgeHtml(type, extraClass = '') {
    if (!type) return '';
    const t = type.toLowerCase();
    const url = this.getIconUrl(t);
    return `<img src="${url}" class="element-badge ${extraClass}" alt="${t.toUpperCase()}" title="Type: ${t.toUpperCase()}" />`;
  },

  /**
   * Return HTML for a piece's elements (1 or 2 badges)
   */
  renderPieceBadgesHtml(pieceOrInfo, extraClass = '') {
    if (!pieceOrInfo) return '';
    const { element: t1, element2: t2 } = this.getEffectivePieceElements(pieceOrInfo);
    let html = '';
    if (t1) html += this.renderBadgeHtml(t1, extraClass);
    if (t2) html += this.renderBadgeHtml(t2, extraClass);
    return html;
  }
};

if (typeof window !== 'undefined') {
  window.TypeSystem = TypeSystem;
  window.TYPE_CHART = TYPE_CHART;
  window.TYPE_COLORS = TYPE_COLORS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TypeSystem, TYPE_CHART, TYPE_COLORS };
}
