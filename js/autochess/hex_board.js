
'use strict';

class HexBoard {
    constructor() {
        this.rows = 8;
        this.cols = 7;
        this.size = this.rows * this.cols;

        this.board = new Array(this.size).fill(null);
        this.collapsedSquares = new Set();
    }

    // Chuyển row, col thành chỉ số ô 0–55
    idx(row, col) {
        return row * this.cols + col;
    }

    row(index) {
        return Math.floor(index / this.cols);
    }

    col(index) {
        return index % this.cols;
    }

    rc(index) {
        return [this.row(index), this.col(index)];
    }

    inBounds(row, col) {
        if (
            row < 0 || row >= this.rows ||
            col < 0 || col >= this.cols
        ) {
            return false;
        }

        return !this.collapsedSquares.has(this.idx(row, col));
    }

    // Offset coordinates -> axial coordinates
    // Hàng lẻ lệch sang phải nửa ô (odd-r)
    toAxial(row, col) {
        return {
            q: col - Math.floor((row - (row & 1)) / 2),
            r: row
        };
    }

    // Axial -> cube
    toCube(row, col) {
        const { q, r } = this.toAxial(row, col);

        return {
            x: q,
            z: r,
            y: -q - r
        };
    }

    distance(indexA, indexB) {
        const a = this.toCube(
            this.row(indexA),
            this.col(indexA)
        );

        const b = this.toCube(
            this.row(indexB),
            this.col(indexB)
        );

        return Math.max(
            Math.abs(a.x - b.x),
            Math.abs(a.y - b.y),
            Math.abs(a.z - b.z)
        );
    }

    getNeighbors(index) {
        const row = this.row(index);
        const col = this.col(index);

        const evenDirections = [
            [-1, -1], [-1, 0],
            [0, -1], [0, 1],
            [1, -1], [1, 0]
        ];

        const oddDirections = [
            [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, 0], [1, 1]
        ];

        const directions =
            row % 2 === 0 ? evenDirections : oddDirections;

        const neighbors = [];

        for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;

            if (this.inBounds(nr, nc)) {
                neighbors.push(this.idx(nr, nc));
            }
        }

        return neighbors;
    }

    isOccupied(index) {
        return this.board[index] !== null;
    }

    canMoveTo(index) {
        if (index < 0 || index >= this.size) {
            return false;
        }

        return !this.collapsedSquares.has(index) &&
            !this.isOccupied(index);
    }

    moveUnit(from, to) {
        if (
            !this.board[from] ||
            !this.canMoveTo(to)
        ) {
            return false;
        }

        this.board[to] = this.board[from];
        this.board[from] = null;

        return true;
    }

    isValidCell(index) {
        return Number.isInteger(index)
            && index >= 0
            && index < this.size
            && !this.collapsedSquares.has(index);
    }

    isValidStep(from, to) {
        if (!this.isValidCell(from) || !this.isValidCell(to)) {
            return false;
        }

        return this.getNeighbors(from).includes(to);
    }

}

window.HexBoard = HexBoard;
