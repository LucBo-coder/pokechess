
'use strict';

const HexView = {
    enabled: false,
    hex: null,
    originalHTML: null,

    enable() {
        const board = document.querySelector('.board');

        if (!board) {
            console.error('Không tìm thấy .board');
            return false;
        }

        if (typeof HexBoard === 'undefined') {
            console.error('HexBoard chưa được nạp');
            return false;
        }

        const hex = new HexBoard();

        if (!this.enabled) {
            this.originalHTML = board.innerHTML;
        }

        board.innerHTML = '';

        const width = 36;
        const stepY = 31.5;
        const offsetX = 18;

        for (let row = 0; row < hex.rows; row++) {
            for (let col = 0; col < hex.cols; col++) {
                const sq = hex.idx(row, col);
                const cell = document.createElement('div');

                cell.className = 'square ' +
                    (row < 4 ? 'hex-enemy' : 'hex-player');

                cell.dataset.sq = String(sq);
                cell.dataset.row = String(row);
                cell.dataset.col = String(col);

                cell.style.left =
                    (col * width + (row % 2) * offsetX) + 'px';

                cell.style.top = (row * stepY) + 'px';
                cell.title = `Hex ${sq} (${row}, ${col})`;

                board.appendChild(cell);
            }
        }

        document.body.classList.add('hex-mode');

        this.enabled = true;
        this.hex = hex;

        console.log(
            'Hex View enabled:',
            board.children.length,
            'cells'
        );

        return true;
    },

    clearRange() {
        document.querySelectorAll(
            '.board .hex-range-cell, ' +
            '.board .hex-range-origin'
        ).forEach(cell => {
            cell.classList.remove(
                'hex-range-cell',
                'hex-range-origin'
            );
        });
    },

    highlightRange(square, range, hexBoard = null) {
        this.clearRange();

        const hex = hexBoard ?? this.hex;
        if (!hex || typeof hex.distance !== 'function') {
            return;
        }

        const origin = Number(square);
        const radius = Math.max(1, Number(range) || 1);

        document.querySelectorAll(
            '.board .square[data-sq]'
        ).forEach(cell => {
            const target = Number(cell.dataset.sq);

            if (!Number.isInteger(target)) return;

            const distance = hex.distance(origin, target);

            if (distance === 0) {
                cell.classList.add('hex-range-origin');
            } else if (distance <= radius) {
                cell.classList.add('hex-range-cell');
            }
        });
    },

    disable() {
        const board = document.querySelector('.board');

        if (!board || !this.enabled) {
            return false;
        }

        this.clearRange();

        board.innerHTML = this.originalHTML ?? '';
        document.body.classList.remove('hex-mode');

        this.enabled = false;
        this.hex = null;

        console.log('Original board HTML restored.');

        return true;
    },

    status() {
        return {
            enabled: this.enabled,
            cells: document.querySelectorAll(
                '.board .square'
            ).length
        };
    }
};

window.HexView = HexView;
