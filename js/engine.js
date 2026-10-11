// =============================================
// CHESS+ ROGUELIKE: GAME ENGINE
// =============================================

'use strict';

class ChessGame {
  constructor() {
    this.board = new Array(64).fill(null);
    this.turn = W;
    this.halfmove = 0;
    this.fullmove = 1;
    this.history = [];
    this.collapsedSquares = new Set();
  }

  idx(r, c) { return r * 8 + c; }
  row(i) { return Math.floor(i / 8); }
  col(i) { return i % 8; }
  rc(i) { return [Math.floor(i / 8), i % 8]; }
  inBounds(r, c) {
    if (r < 0 || r >= 8 || c < 0 || c >= 8) return false;
    if (this.collapsedSquares && this.collapsedSquares.has(r * 8 + c)) return false;
    return true;
  }

  // Generate all legal moves for a piece at square i
  pseudoMoves(i) {
    const p = this.board[i];
    if (!p) return [];

    const r = this.row(i), c = this.col(i);

    const push = (moves, tr, tc, flags = {}) => {
      if (!this.inBounds(tr, tc)) return;
      const ti = this.idx(tr, tc);
      const t = this.board[ti];
      if (flags.moveOnly && t) return;
      if (t && t.color === p.color) return;
      moves.push({ from: i, to: ti, ...flags });
    };

    const slide = (moves, dirs, maxSteps = 8, flags = {}) => {
      for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc, steps = 0;
        while (this.inBounds(nr, nc) && steps < maxSteps) {
          const ti = this.idx(nr, nc);
          const t = this.board[ti];
          if (t) {
            if (t.color !== p.color && !flags.moveOnly) {
              moves.push({ from: i, to: ti, ...flags });
            }
            break;
          }
          moves.push({ from: i, to: ti, ...flags });
          nr += dr; nc += dc; steps++;
        }
      }
    };

    // 1. Check if custom moves configured for this Pokemon (supports Ditto transformType)
    const moveType = p.transformType || p.type;
    const effectivePiece = p.transformType ? { ...p, type: moveType } : p;
    if (typeof CustomMoveSystem !== 'undefined') {
      const hasMoves = typeof CustomMoveSystem.hasCustom === 'function' ? CustomMoveSystem.hasCustom(moveType) : true;
      if (hasMoves) {
        const baseMoves = CustomMoveSystem.getMoves(this, i, r, c, effectivePiece, push, slide) || [];
        if (typeof TalismanSystem !== 'undefined' && typeof TalismanSystem.extendMoves === 'function') {
          return TalismanSystem.extendMoves(this, i, r, c, effectivePiece, baseMoves, push, slide);
        }
        return baseMoves;
      }
    }

    // 2. Delegate to default piece definition
    const def = PIECES[moveType];
    if (def && typeof def.getMoves === 'function') {
      const baseMoves = def.getMoves(this, i, r, c, effectivePiece, push, slide) || [];
      if (typeof TalismanSystem !== 'undefined' && typeof TalismanSystem.extendMoves === 'function') {
        return TalismanSystem.extendMoves(this, i, r, c, effectivePiece, baseMoves, push, slide);
      }
      return baseMoves;
    }

    return [];
  }

  // In Roguelike (elimination rule), all pseudoMoves are legal moves
  legalMoves(color) {
    const legal = [];
    for (let i = 0; i < 64; i++) {
      if (this.board[i] && this.board[i].color === color) {
        const pm = this.pseudoMoves(i);
        for (let k = 0; k < pm.length; k++) {
          const m = pm[k];
          if (m.captureOnly) {
            const target = this.board[m.to];
            if (!target || target.color === color) continue;
          }
          legal.push(m);
        }
      }
    }
    return legal;
  }

  applyMove(m) {
    const p = this.board[m.from];
    if (!p) return false;

    this.history.push({
      move: m,
      captured: this.board[m.to],
      from: m.from,
      to: m.to,
      piece: { ...p }
    });

    if (m.promo) {
      this.board[m.to] = { color: p.color, type: m.promo };
    } else {
      this.board[m.to] = p;
    }
    this.board[m.from] = null;

    this.turn = this.turn === W ? B : W;
    if (this.turn === W) this.fullmove++;
    return true;
  }

  toAlgebraic(m) {
    const files = 'abcdefgh';
    const ranks = '87654321';
    const f1 = files[this.col(m.from)], r1 = ranks[this.row(m.from)];
    const f2 = files[this.col(m.to)],   r2 = ranks[this.row(m.to)];
    const p = this.board[m.from];
    const prefix = (p && p.type !== 'P') ? p.type : '';
    const cap = this.board[m.to] ? 'x' : '';
    const promo = m.promo ? `=${m.promo}` : '';
    return `${prefix}${cap ? (p.type === 'P' ? f1 : '') + cap : ''}${f2}${r2}${promo}`;
  }
}

(typeof window !== 'undefined' ? window : globalThis).ChessGame = ChessGame;
