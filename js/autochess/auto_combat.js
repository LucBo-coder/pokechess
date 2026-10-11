'use strict';

const AutoCombatV01 = {
    getUI() {
        return window.roguelikeUI;
    },

    status() {
        const ui = this.getUI();

        if (!ui || !ui.game) {
            return { error: "Game chưa khởi tạo" };
        }

        const units = [];

        for (let sq = 0; sq < 64; sq++) {
            const piece = ui.game.board[sq];
            if (!piece) continue;

            const stats = ui.getEffectivePieceStats(piece);

            units.push({
                square: sq,
                name: PIECE_NAMES[piece.type] || piece.type,
                team: piece.color === W ? "Player" : "Enemy",
                hp: ui.pieceHP[sq] ?? stats.maxHp,
                damage: stats.damage,
                speed: stats.speed
            });
        }

        return {
            phase: ui.phase,
            totalUnits: units.length,
            units
        };
    },

    print() {
        const result = this.status();

        if (result.error) {
            console.error(result.error);
            return;
        }

        console.log("=== AUTO CHESS V0.1 ===");
        console.log("Phase:", result.phase);
        console.log("Units:", result.totalUnits);
        console.table(result.units);
    }
};

window.autoCombatV01 = AutoCombatV01;