
'use strict';

// Role va attack range lay tu HexUnitConfig.
// Khong can danh sach Pokemon danh xa thu cong.

class HexBridge {
    constructor(ui) {
        this.ui = ui;
    }

    getDeployedUnits() {
        const ui = this.ui;
        const result = [];

        // Doc 56 vi tri tren ban Hex.
        for (let sq = 0; sq < 56; sq++) {
            const piece = ui.game.board[sq];

            if (!piece) continue;

            const stats = this.getEffectiveStats(piece, sq);

            result.push({
                square: sq,
                piece,
                stats
            });
        }

        return result;
    }

    getEffectiveStats(piece, square) {
        // Predict start-of-battle ATK without changing the setup pieces or
        // counting the same aura again after startBattle has applied it.
        const preview = { ...piece, _battleBonusAtk: 0 };
        if (typeof TalismanSystem !== 'undefined') {
            if (TalismanSystem.hasToxicOrb?.(piece)) preview._battleBonusAtk += 6;
            const hex = new HexBoard();
            for (const neighbor of hex.isValidCell(square) ? hex.getNeighbors(square) : []) {
                const ally = this.ui.game.board[neighbor];
                if (ally?.color === piece.color && TalismanSystem.hasSootheBell?.(ally)) {
                    preview._battleBonusAtk += 3;
                }
            }
        }
        return this.ui.getEffectivePieceStats?.(preview) ?? {};
    }

    getStageContext() {
        const stage = Number(this.ui.stage || 1);
        // Enemy scaling: tăng sức mạnh địch theo Stage
        const stageScaling =
            typeof this.ui.getEnemyStageScaling === 'function'
                ? this.ui.getEnemyStageScaling(stage)
                : {
                    hpMultiplier: 1 + Math.max(0, stage - 1) * 0.06,
                    attackMultiplier: 1 + Math.max(0, stage - 1) * 0.0315
                };

        const bossConfig =
            typeof this.ui.createStageBoss === 'function'
                ? this.ui.createStageBoss(stage)
                : null;

        const isBossStage = Boolean(bossConfig?.isBoss);

        // Ưu tiên Boss đã được đánh dấu từ SETUP.
        // Chỉ dùng Pokémon đầu tiên nếu chưa có đánh dấu.
        const board = this.ui.game.board.slice(0, 56);
        let bossSquare = isBossStage
            ? board.findIndex(piece => piece?.color === 'b' && piece.isBoss === true)
            : -1;
        if (isBossStage && bossSquare < 0) {
            bossSquare = board.findIndex(piece => piece?.color === 'b');
        }
        return { stage, stageScaling, bossConfig, bossSquare };
    }

    getUnitStats(piece, square, stats = this.getEffectiveStats(piece, square), context = this.getStageContext()) {
        const { stage, stageScaling, bossConfig, bossSquare } = context;
        const balance = window.HexBalance;

        const maxHp = Number(
            stats.maxHp ??
            stats.hp ??
            piece.maxHp ??
            100
        );

        const attackDamage = Number(
            stats.damage ??
            piece.damage ??
            10
        );

        const pokemonSpeed = Number(
            stats.speed ??
            stats.baseSpeed ??
            piece.speed ??
            100
        );

        // Chuyen Speed thanh toc do danh.
        const attackSpeed = Math.max(
            0.5,
            Math.min(2.5, pokemonSpeed / 100)
        );

        // Phan loai Pokemon theo 5 vai tro.
        const roleConfig =
            HexUnitConfig.getConfig(piece.type);

        const attackRange = Number(
            roleConfig.attackRange ?? 1
        );

        // Can bang rieng cho Auto Chess.
        // Khong thay doi du lieu PIECES goc.
        const balancedHp = Math.max(
            1,
            Math.round(
                (Number.isFinite(maxHp) ? maxHp : 100) * (balance?.HP_MULTIPLIER ?? 4)
            )
        );

        const balancedDamage = Math.max(
            1,
            Math.round(
                (Number.isFinite(attackDamage)
                    ? attackDamage
                    : 10) * (balance?.ATTACK_DAMAGE_MULTIPLIER ?? 0.35)
            )
        );
        // Chỉ Pokémon địch mới nhận hệ số tăng theo Stage
        const isEnemy = piece.color === 'b';

        const isStageBoss =
            Boolean(bossConfig?.isBoss) &&
            isEnemy &&
            square === bossSquare;

        // Hệ số tăng sức mạnh theo Stage
        const stageHpMultiplier = isEnemy
            ? Number(stageScaling.hpMultiplier ?? 1)
            : 1;

        const stageAttackMultiplier = isEnemy
            ? Number(stageScaling.attackMultiplier ?? 1)
            : 1;

        // Hệ số riêng của Boss / Mini Boss
        const bossHpMultiplier = isStageBoss
            ? Number(bossConfig.hpMultiplier ?? 1)
            : 1;

        const bossAttackMultiplier = isStageBoss
            ? Number(bossConfig.attackMultiplier ?? 1)
            : 1;

        // Công thức:
        // Base Auto Chess × Stage Scaling × Boss Scaling
        const finalHp = Math.max(
            1,
            Math.round(
                balancedHp *
                stageHpMultiplier *
                bossHpMultiplier
            )
        );

        const finalDamage = Math.max(
            1,
            Math.round(
                balancedDamage *
                stageAttackMultiplier *
                bossAttackMultiplier
            )
        );

        const elements = typeof TypeSystem !== 'undefined'
            ? TypeSystem.getEffectivePieceElements({ ...piece })
            : { element: stats.element ?? piece.element ?? 'normal', element2: stats.element2 ?? piece.element2 ?? null };

        return {
            stage,
            isBoss: isStageBoss,
            bossType: isStageBoss ? bossConfig.bossType : null,
            bossSkills: isStageBoss ? bossConfig.bossSkills : [],

            type: piece.type,
            pokemonId: piece.transformType ?? piece.type,
            color: piece.color,
            talismans: [...(piece.talismans ?? [])],
            sourcePiece: { ...piece, talismans: [...(piece.talismans ?? [])] },

            maxHp: finalHp,
            attackDamage: finalDamage,

            attackSpeed: Number.isFinite(attackSpeed)
                ? attackSpeed
                : 1,

            attackRange: Number.isFinite(attackRange)
                ? attackRange
                : 1,

            combatRole: roleConfig.role,
            preferredDistance:
                roleConfig.preferredDistance,

            pokemonSpeed: Number.isFinite(pokemonSpeed) ? Math.max(1, pokemonSpeed) : 100,
            mana: balance?.START_MANA ?? 30,
            maxMana: balance?.MAX_MANA ?? 100,
            ...elements
        };
    }

    createCombat(options = {}) {
        const hexBoard = new HexBoard();
        const combat = new HexCombat(hexBoard, options);
        const context = this.getStageContext();
        for (const { square, piece, stats } of this.getDeployedUnits()) {
            const success = combat.addUnit(square, {
                ...this.getUnitStats(piece, square, stats, context),
                id: `hex_${square}`
            });

            if (!success) {
                console.warn(
                    'Khong the them Pokemon vao HexCombat:',
                    square,
                    piece
                );
            }
        }

        return combat;
    }
}

window.HexBridge = HexBridge;
