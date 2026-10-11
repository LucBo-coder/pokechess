
'use strict';

class HexCombat extends HexSimulation {
    constructor(hexBoard, options = {}) {
        super(hexBoard, options);

        this.tickRate = window.HexBalance?.TICK_RATE ?? 30;
        this.tickDuration = 1000 / this.tickRate;

        this.battleEnded = false;
        this.winner = null;

        // Thoi gian tran dau.
        this.maxBattleTicks = this.tickRate * (window.HexBalance?.BATTLE_DURATION ?? 180);

        // Sudden Death bat dau sau 120 giay.
        this.suddenDeathTick = this.tickRate * (window.HexBalance?.SUDDEN_DEATH_START ?? 120);

        // Skill cooldown: 3 giay.
        this.skillCooldownTicks = this.tickRate * (window.HexBalance?.SKILL_COOLDOWN_SECONDS ?? 3);
    }

    // =========================================
    // UNIT SYSTEM
    // =========================================

    addUnit(square, unit) {
        const maxHp = Math.max(
            1,
            unit.maxHp ?? 100
        );

        const attackDamage = Math.max(
            0,
            unit.attackDamage ?? 10
        );

        const attackSpeed = Math.max(
            0.1,
            unit.attackSpeed ?? 1
        );

        return super.addUnit(square, {
            ...unit,

            hp: Math.min(
                maxHp,
                Math.max(0, unit.hp ?? maxHp)
            ),

            maxHp,
            attackDamage,
            attackSpeed,

            attackRange: unit.attackRange ?? 1,

            // Mana System
            mana: unit.mana ?? window.HexBalance?.START_MANA ?? 30,
            maxMana: unit.maxMana ?? window.HexBalance?.MAX_MANA ?? 100,

            // Shield System
            shield: 0,

            // Skill System
            skillCasts: 0,
            nextSkillTick: 0,

            // Attack System
            nextAttackTick: 0,

            // Boss Phase System
            bossPhase: 1,
            bossEnraged: false,
            bossFinalPhase: false,
            bossBaseDamage: attackDamage,
            bossBaseAttackSpeed: attackSpeed
        });
    }

    getAttackCooldown(unit) {
        return Math.max(
            1,
            Math.ceil(
                this.tickRate / unit.attackSpeed
            )
        );
    }

    getUnitAt(square) {
        return this.hex.board[square] ?? null;
    }

    // =========================================
    // MANA SYSTEM
    // =========================================

    gainMana(unit, amount) {
        if (!unit || unit.hp <= 0) return;

        unit.maxMana = Math.max(
            1,
            Number(unit.maxMana) || 100
        );

        unit.mana = Math.min(
            unit.maxMana,

            Math.max(
                0,
                Number(unit.mana) || 0
            ) +

            Math.max(
                0,
                Number(amount) || 0
            )
        );

        this.emit({
            type: 'mana-change',
            unitId: unit.id,
            mana: unit.mana,
            maxMana: unit.maxMana
        });
    }

    // =========================================
    // SKILL SYSTEM
    // =========================================

    castSkill(unit) {
        if (!unit || unit.hp <= 0) {
            return false;
        }

        const maxMana = Math.max(
            1,
            Number(unit.maxMana) || 100
        );

        if ((unit.mana ?? 0) < maxMana) {
            return false;
        }

        // Khong dung skill khi dang cooldown.
        if (
            this.tickCount <
            (unit.nextSkillTick ?? 0)
        ) {
            return false;
        }

        const enemies = [
            ...this.units.values()
        ].filter(enemy =>
            enemy.hp > 0 &&
            enemy.color !== unit.color
        );

        if (enemies.length === 0) {
            return false;
        }

        // Uu tien muc tieu da khoa.
        // Neu khong co thi tim ke dich gan nhat.
        const target = enemies.find(
            enemy => enemy.id === unit.targetId
        ) ?? enemies.reduce(
            (best, enemy) => {
                if (!best) return enemy;

                const currentDistance =
                    this.hex.distance(
                        unit.square,
                        enemy.square
                    );

                const bestDistance =
                    this.hex.distance(
                        unit.square,
                        best.square
                    );

                return currentDistance < bestDistance
                    ? enemy
                    : best;
            },
            null
        );

        if (!target) {
            return false;
        }

        const role =
            unit.combatRole ?? 'fighter';

        const skill = window.HexSkillInfo?.[role];
        const attackElement = typeof TypeSystem !== 'undefined'
            ? TypeSystem.getHexAttack(unit, target).element
            : unit.element;
        const affectedIds = [];

        let skillName = '';

        switch (role) {
            // ---------------------------------
            // TANK: TAO LA CHAN
            // ---------------------------------

            case 'tank': {
                skillName = 'Iron Guard';

                const shieldAmount = Math.round(
                    unit.maxHp * 0.3
                );

                unit.shield =
                    (unit.shield ?? 0) +
                    shieldAmount;

                break;
            }

            // ---------------------------------
            // FIGHTER: SAT THUONG MANH
            // ---------------------------------

            case 'fighter': {
                skillName = 'Power Strike';

                this.dealDamage(
                    unit,
                    target,
                    unit.attackDamage * (skill?.damageMultiplier ?? 1.8),
                    'skill'
                );

                break;
            }

            // ---------------------------------
            // ASSASSIN: EXECUTION
            // ---------------------------------

            case 'assassin': {
                skillName = 'Execution';

                this.dealDamage(
                    unit,
                    target,
                    unit.attackDamage * (skill?.damageMultiplier ?? 2.2),
                    'skill'
                );

                break;
            }

            // ---------------------------------
            // MAGE: SAT THUONG LAN
            // ---------------------------------

            case 'mage': {
                skillName = 'Arcane Burst';

                const affected = enemies
                    .filter(enemy =>
                        this.hex.distance(
                            target.square,
                            enemy.square
                        ) <= 1
                    )
                    .slice(0, 3);

                for (const enemy of affected) {
                    if (enemy.hp <= 0) continue;
                    affectedIds.push(enemy.id);

                    this.dealDamage(
                        unit,
                        enemy,
                        unit.attackDamage * (skill?.damageMultiplier ?? 1.4),
                        'skill'
                    );
                }

                break;
            }

            // ---------------------------------
            // MARKSMAN: PRECISION SHOT
            // ---------------------------------

            case 'marksman': {
                skillName = 'Precision Shot';

                this.dealDamage(
                    unit,
                    target,
                    unit.attackDamage * (skill?.damageMultiplier ?? 2),
                    'skill'
                );

                break;
            }

            default:
                return false;
        }

        // Reset Mana sau khi tung skill.
        unit.mana = 0;

        // Dat cooldown skill.
        unit.nextSkillTick =
            this.tickCount +
            this.skillCooldownTicks;

        unit.skillCasts =
            (unit.skillCasts ?? 0) + 1;

        this.emit({
            type: 'skill-cast',

            unitId: unit.id,
            targetId: target.id,

            skillName,
            role,
            element: attackElement,
            affectedIds: role === 'tank' ? [] : affectedIds.length ? affectedIds : [target.id],

            mana: unit.mana
        });

        return true;
    }

    // =========================================
    // DAMAGE SYSTEM
    // =========================================
    getBossPhase(unit) {
        if (!unit || !unit.isBoss || unit.hp <= 0) {
            return 1;
        }

        const hpPercent = unit.hp / Math.max(1, unit.maxHp);
        const isMainBoss = unit.bossType === 'boss';

        if (isMainBoss && hpPercent <= 0.20) {
            return 3;
        }

        if (hpPercent <= 0.50) {
            return 2;
        }

        return 1;
    }

    updateBossPhase(unit) {
        if (!unit || !unit.isBoss || unit.hp <= 0) {
            return false;
        }

        const nextPhase = this.getBossPhase(unit);
        const currentPhase = unit.bossPhase ?? 1;

        if (nextPhase <= currentPhase) {
            return false;
        }

        const baseDamage = unit.bossBaseDamage ?? unit.attackDamage;
        const baseSpeed = unit.bossBaseAttackSpeed ?? unit.attackSpeed;

        unit.bossPhase = nextPhase;

        if (nextPhase >= 2) {
            unit.bossEnraged = true;

            unit.attackDamage = Math.round(baseDamage * 1.25);
            unit.attackSpeed = baseSpeed * 1.20;
        }

        if (nextPhase === 3) {
            unit.bossFinalPhase = true;

            unit.attackDamage = Math.round(baseDamage * 1.50);
            unit.attackSpeed = baseSpeed * 1.50;

            // Cho phép Boss tung kỹ năng sớm ở Phase cuối.
            unit.mana = unit.maxMana;
            unit.nextSkillTick = Math.min(
                unit.nextSkillTick ?? this.tickCount,
                this.tickCount
            );
        }

        this.emit({
            type: 'boss-phase-change',
            unitId: unit.id,
            bossType: unit.bossType,
            phase: nextPhase,
            hp: unit.hp,
            maxHp: unit.maxHp,
            attackDamage: unit.attackDamage,
            attackSpeed: unit.attackSpeed
        });

        console.log(
            `[BOSS PHASE] ${unit.id} -> Phase ${nextPhase}`
        );

        return true;
    }

    dealDamage(
        attacker,
        defender,
        amount,
        source = 'attack'
    ) {
        if (
            !attacker ||
            !defender ||
            defender.hp <= 0
        ) {
            return 0;
        }

        // Skill damage multiplier.
        const skillMultiplier =
            source === 'skill'
                ? window.HexBalance?.SKILL_DAMAGE_MULTIPLIER ?? 0.65
                : 1;

        // Sudden Death tang sat thuong
        // dan tu giay 120 den giay 180.
        const suddenProgress = Math.max(
            0,
            Math.min(
                1,
                (
                    this.tickCount -
                    this.suddenDeathTick
                ) /
                (
                    this.maxBattleTicks -
                    this.suddenDeathTick
                )
            )
        );

        const suddenMultiplier =
            1 + ((window.HexBalance?.SUDDEN_DEATH_DAMAGE_MULTIPLIER ?? 3.5) - 1) * suddenProgress;

        const matchup = typeof TypeSystem !== 'undefined'
            ? TypeSystem.getHexAttack(attacker, defender)
            : { element: attacker.element ?? 'normal', multiplier: 1 };

        const damage = Math.max(
            0,
            Math.round(
                amount *
                skillMultiplier *
                suddenMultiplier *
                matchup.multiplier
            )
        );

        // La chan hap thu sat thuong truoc.
        const currentShield = Math.max(
            0,
            Number(defender.shield) || 0
        );

        const absorbed = Math.min(
            currentShield,
            damage
        );

        defender.shield =
            currentShield - absorbed;

        // Phan sat thuong con lai tru vao HP.
        const hpDamage = Math.min(
            defender.hp,
            damage - absorbed
        );

        defender.hp = Math.max(
            0,
            defender.hp - hpDamage
        );
        // Kiem tra Boss Phase sau khi nhan sat thuong.
        if (defender.isBoss && defender.hp > 0) {
            this.updateBossPhase(defender);
        }

        this.emit({
            type: 'damage',

            attackerId: attacker.id,
            defenderId: defender.id,

            damage: hpDamage,
            absorbed,
            source,
            element: matchup.element,
            effectiveness: matchup.multiplier,

            remainingHp: defender.hp
        });

        // Nhan Mana khi bi danh.
        if (
            defender.hp > 0 &&
            hpDamage > 0
        ) {
            this.gainMana(
                defender,
                window.HexBalance?.MANA_PER_HIT ?? 5
            );
        }

        // Xu ly Pokemon chet.
        if (defender.hp <= 0) {
            this.killUnit(defender);
        }

        return hpDamage;
    }

    // =========================================
    // BASIC ATTACK
    // =========================================

    attack(attacker, targetSquare) {
        const defender =
            this.getUnitAt(targetSquare);

        if (
            !defender ||
            defender.hp <= 0 ||
            defender.color === attacker.color
        ) {
            return false;
        }

        // Kiem tra tam danh.
        if (
            this.hex.distance(
                attacker.square,
                targetSquare
            ) > attacker.attackRange
        ) {
            return false;
        }

        const damage = attacker.attackDamage;
        const element = typeof TypeSystem !== 'undefined'
            ? TypeSystem.getHexAttack(attacker, defender).element
            : attacker.element;

        this.dealDamage(
            attacker,
            defender,
            damage,
            'attack'
        );

        // Nhan Mana khi danh thuong.
        this.gainMana(
            attacker,
            window.HexBalance?.MANA_PER_ATTACK ?? 15
        );

        // Attack cooldown theo Speed.
        attacker.nextAttackTick =
            this.tickCount +
            this.getAttackCooldown(attacker);

        this.emit({
            type: 'attack',

            attackerId: attacker.id,
            defenderId: defender.id,

            from: attacker.square,
            target: targetSquare,

            damage,
            element,
            remainingHp: defender.hp
        });

        return true;
    }

    // =========================================
    // DEATH SYSTEM
    // =========================================

    killUnit(unit) {
        const square = unit.square;

        if (
            this.hex.board[square] === unit
        ) {
            this.hex.board[square] = null;
        }

        this.units.delete(unit.id);

        this.emit({
            type: 'death',

            unitId: unit.id,
            square,
            team: unit.color
        });
    }

    // =========================================
    // BATTLE END
    // =========================================

    finishBattle(
        winner,
        reason = 'elimination'
    ) {
        if (this.battleEnded) return;

        this.battleEnded = true;
        this.winner = winner;

        this.emit({
            type: 'battle-end',

            winner,
            reason,
            tick: this.tickCount
        });

        this.stop();
    }

    // =========================================
    // TIMEOUT SYSTEM
    // =========================================

    resolveTimeout() {
        const scores = new Map();

        // Tinh tong ty le HP con lai
        // cua moi doi.
        for (const unit of this.units.values()) {
            if (unit.hp <= 0) continue;

            const score =
                unit.hp /
                Math.max(1, unit.maxHp);

            scores.set(
                unit.color,
                (scores.get(unit.color) ?? 0) +
                score
            );
        }

        const w = scores.get('w') ?? 0;
        const b = scores.get('b') ?? 0;

        let winner = 'draw';

        if (Math.abs(w - b) >= 0.000001) {
            winner = w > b ? 'w' : 'b';
        }

        this.finishBattle(
            winner,
            'timeout'
        );
    }

    // =========================================
    // CHECK BATTLE END
    // =========================================

    checkBattleEnd() {
        const teams = new Set(
            [...this.units.values()]
                .map(unit => unit.color)
        );

        if (teams.size <= 1) {
            const winner =
                teams.size === 1
                    ? [...teams][0]
                    : 'draw';

            this.finishBattle(winner);

            return true;
        }

        return false;
    }

    // =========================================
    // MAIN BATTLE LOOP
    // =========================================

    step() {
        if (this.battleEnded) return;

        this.tickCount++;

        // Moi Pokemon hanh dong toi da
        // mot lan trong mot tick.
        const unitIds = [...this.units.keys()];

        for (const id of unitIds) {
            const unit = this.units.get(id);

            if (!unit || unit.hp <= 0) {
                continue;
            }

            // Tu dong dung skill khi du Mana.
            // Neu skill dang cooldown,
            // Pokemon van danh va di chuyen.
            if (
                unit.mana >= unit.maxMana &&
                this.castSkill(unit)
            ) {
                continue;
            }

            // AI quyet dinh hanh dong.
            const action = this.ai.decideAction(
                unit.square,
                unit.attackRange
            );

            if (action.type === 'attack') {
                if (
                    this.tickCount >=
                    unit.nextAttackTick
                ) {
                    this.attack(
                        unit,
                        action.target
                    );
                }
            } else if (action.type === 'move') {
                if (
                    this.tickCount <
                    unit.nextMoveTick
                ) {
                    continue;
                }

                const moved = this.hex.moveUnit(
                    action.from,
                    action.to
                );

                if (moved) {
                    const from = unit.square;

                    unit.square = action.to;

                    unit.nextMoveTick =
                        this.tickCount +
                        this.moveCooldownTicks;

                    this.emit({
                        type: 'move',

                        unitId: unit.id,
                        from,
                        to: action.to
                    });
                }
            }
        }

        // Kiem tra doi nao da bi tieu diet.
        if (!this.battleEnded) {
            this.checkBattleEnd();
        }

        // Het 180 giay thi phan dinh.
        if (
            !this.battleEnded &&
            this.tickCount >= this.maxBattleTicks
        ) {
            this.resolveTimeout();
        }

        // Gui su kien dong ho moi giay.
        if (
            this.tickCount % this.tickRate === 0
        ) {
            this.emit({
                type: 'battle-timer',

                elapsedSeconds:
                    Math.floor(
                        this.tickCount /
                        this.tickRate
                    ),

                remainingSeconds:
                    Math.max(
                        0,
                        this.maxBattleTicks / this.tickRate -
                        Math.floor(
                            this.tickCount /
                            this.tickRate
                        )
                    ),

                suddenDeath:
                    this.tickCount >=
                    this.suddenDeathTick
            });
        }

        // Cap nhat Renderer.
        if (
            typeof this.onTick === 'function'
        ) {
            this.onTick({
                tick: this.tickCount,
                units: [...this.units.values()]
            });
        }
    }

    // =========================================
    // START BATTLE
    // =========================================

    start() {
        if (
            this.running ||
            this.battleEnded
        ) {
            return;
        }

        const teams = new Set(
            [...this.units.values()]
                .map(unit => unit.color)
        );

        if (teams.size < 2) {
            console.warn(
                'Can it nhat hai phe de bat dau tran dau.'
            );

            return;
        }

        super.start();
    }

    // =========================================
    // RESET BATTLE
    // =========================================

    reset() {
        super.reset();

        this.battleEnded = false;
        this.winner = null;
    }
}

window.HexCombat = HexCombat;
