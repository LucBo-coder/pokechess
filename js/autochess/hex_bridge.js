
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
        const preview = { ...piece, talismans: [...(piece.talismans ?? [])], _battleBonusAtk: 0 };
        let startBonusAtk = 0;
        if (typeof TalismanSystem !== 'undefined') {
            if (TalismanSystem.hasToxicOrb?.(piece)) startBonusAtk += 6;
            const hex = new HexBoard();
            for (const neighbor of hex.isValidCell(square) ? hex.getNeighbors(square) : []) {
                const ally = this.ui.game.board[neighbor];
                if (ally?.color === piece.color && TalismanSystem.hasSootheBell?.(ally)) {
                    startBonusAtk += 3;
                }
            }
        }
        const classConfig = HexUnitConfig.getConfig(piece.type);
        const stats = this.ui.getEffectivePieceStats?.(preview, {
            classModifiers: classConfig,
            includeTemporary: false,
            startBonusAtk
        }) ?? {};
        // The legacy startBattle stores auras in the same field as temporary
        // ATK. They are already included above as Talisman bonuses.
        const temporaryAttack = this.ui.phase === 'battle'
            ? Number(piece._battleBonusAtk ?? startBonusAtk) - startBonusAtk
            : Number(piece._battleBonusAtk ?? 0);
        return {
            ...stats,
            classConfig,
            temporaryBonuses: {
                attack: Number.isFinite(temporaryAttack) ? temporaryAttack : 0,
                speed: stats.temporaryBonuses?.speed ?? 0
            }
        };
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

        const permanentSpeed = Number(
            stats.speed ??
            stats.baseSpeed ??
            piece.speed ??
            100
        );
        const pokemonSpeed = Math.max(10,
            (Number.isFinite(permanentSpeed) ? permanentSpeed : 100) + (stats.temporaryBonuses?.speed ?? 0)
        );

        // Chuyen Speed thanh toc do danh.
        const attackSpeed = Math.max(
            0.5,
            Math.min(2.5, pokemonSpeed / 100)
        );

        // Phan loai Pokemon theo 5 vai tro.
        const roleConfig =
            stats.classConfig ?? HexUnitConfig.getConfig(piece.type);

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
        // Class and equipment are calculated once by getEffectiveStats.
        // Keep the existing rounding and Stage/Boss multipliers unchanged.
        let finalHp = Math.max(
            1,
            Math.round(
                balancedHp *
                stageHpMultiplier *
                bossHpMultiplier
            )
        );

        let finalDamage = Math.max(
            1,
            Math.round(
                Math.round(balancedDamage * stageAttackMultiplier * bossAttackMultiplier) +
                (stats.temporaryBonuses?.attack ?? 0) * (balance?.ATTACK_DAMAGE_MULTIPLIER ?? 0.35)
            )
        );

        const elements = typeof TypeSystem !== 'undefined'
            ? TypeSystem.getEffectivePieceElements({ ...piece })
            : { element: stats.element ?? piece.element ?? 'normal', element2: stats.element2 ?? piece.element2 ?? null };
        const psychic = piece.color === 'w' ? window.SynergySystem?.getActiveSynergies(this.ui)?.psychic?.activeTier : null;
        const critChance = psychic?.teamCrit ?? (elements.element === 'psychic' || elements.element2 === 'psychic' ? psychic?.selfCrit ?? 0 : 0);
        const invId = piece.invId ?? this.ui.placedPieces?.find(placed=>placed.sq===square)?.invId;
        const inventoryItem = this.ui.inventory?.find(item => item.id === invId);
        const traits=window.HexTraits?.traitsFor(this.ui,piece)??[...(inventoryItem?.traits??piece.traits??[])];
        const mastery=window.MasterySystem?.snapshot(this.ui,piece,square);
        if(mastery?.advancedTrait&&!traits.includes(mastery.advancedTrait))traits.push(mastery.advancedTrait);
        const elite=window.HexTraits?.ELITES[piece.eliteType];
        if(elite && !isStageBoss){finalHp=Math.max(1,Math.round(finalHp*elite.hp));finalDamage=Math.max(1,Math.round(finalDamage*elite.attack));}
        const classBonus=window.HexTraits?.classBonus(this.ui,piece)??{};
        const mitigationPiece={...piece,talismans:[...(piece.talismans??[])]};
        const flatReduction=window.SynergySystem?.getDmgReduction(mitigationPiece,this.ui,0)??0;
        const percentReduction=((window.SynergySystem?.getDmgReduction(mitigationPiece,this.ui,100)??0)-flatReduction)/100;

        return {
            stage,
            isBoss: isStageBoss,
            bossType: isStageBoss ? bossConfig.bossType : null,
            bossSkills: isStageBoss ? bossConfig.bossSkills : [],

            type: piece.type,
            pokemonId: piece.transformType ?? piece.type,
            color: piece.color,
            talismans: [...(piece.talismans ?? [])],
            sourcePiece: { ...piece, invId, talismans: [...(piece.talismans ?? [])] },
            mastery,
            effects: window.HexEffects?.snapshot(this.ui, piece),
            statBreakdown: {
                base: { hp: window.PIECES?.[piece.type]?.maxHp, attack: window.PIECES?.[piece.type]?.damage },
                class: { role: roleConfig.role, hpMultiplier: roleConfig.hpMultiplier, attackMultiplier: roleConfig.damageMultiplier },
                effective: { hp: maxHp, attack: attackDamage, speed: permanentSpeed },
                hex: { hp: balancedHp, attack: balancedDamage },
                scaling: { stageHpMultiplier, stageAttackMultiplier, bossHpMultiplier, bossAttackMultiplier },
                temporary: { ...stats.temporaryBonuses },
                final: { hp: finalHp, attack: finalDamage, attackSpeed },
                modifiers: stats.modifierBreakdown
            },

            maxHp: finalHp,
            hp: piece.color === 'w' ? Math.max(1,Math.round(finalHp*(1-Math.max(0,Math.min(0.5,inventoryItem?.wounds??0))))) : finalHp,
            traits,
            eliteType: !isStageBoss ? piece.eliteType??null : null,
            moveCooldownTicks: traits.includes('swift') ? 12 : 15,
            damageReduction: Math.min(0.6,percentReduction+(elite?.reduction??0)+(classBonus.reduction??0)),
            flatDamageReduction: (flatReduction+(window.TalismanSystem?.getDmgReduction(piece)??0))*(balance?.ATTACK_DAMAGE_MULTIPLIER??0.35),
            lifesteal: Math.min(0.3,window.SynergySystem?.getLifestealRatio(mitigationPiece,this.ui)??0),
            critChance: Math.min(0.75, critChance + (classBonus.crit??0) + (window.MetaProgression?.getCritChanceBonus(piece) ?? 0) + (window.TalismanSystem?.hasScopeLens(piece) ? 0.2 : 0)),
            critMultiplier: psychic?.teamCritMult ?? psychic?.critMult ?? 1.5,
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
            mana: Math.min(balance?.MAX_MANA??100,(balance?.START_MANA ?? 30)+(classBonus.mana??0)),
            maxMana: balance?.MAX_MANA ?? 100,
            ...elements
        };
    }

    createCombat(options = {}) {
        window.MasterySystem?.ensure(this.ui);
        const hexBoard = new HexBoard();
        const combat = new HexCombat(hexBoard, options);
        const context = this.getStageContext();
        combat.masteryRunId = this.ui.runState?.id;
        combat.masteryStage = context.stage;
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

        combat.initialTeams = new Set([...combat.units.values()].map(unit=>unit.color));
        return combat;
    }
}

window.HexBridge = HexBridge;
