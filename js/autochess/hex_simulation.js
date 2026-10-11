
'use strict';

class HexSimulation {
    constructor(hexBoard, options = {}) {
        this.hex = hexBoard;
        this.ai = new HexAI(hexBoard);

        this.tickRate = window.HexBalance?.TICK_RATE ?? 30;
        this.tickDuration = 1000 / this.tickRate;

        // Mỗi Pokémon di chuyển tối đa một ô mỗi 0.5 giây
        this.moveCooldownTicks = options.moveCooldownTicks ?? 15;
        this.baseAttackIntervalTicks = options.baseAttackIntervalTicks ?? 30;

        this.tickCount = 0;
        this.running = false;
        this.timer = null;

        this.units = new Map();
        this.events = [];

        this.onTick = options.onTick ?? null;
        this.onEvent = options.onEvent ?? null;
    }

    addUnit(square, unit) {
        if (!this.hex.isValidCell(square)) {
            return false;
        }

        if (this.hex.isOccupied(square)) {
            return false;
        }

        const id = unit.id ?? `unit_${square}`;

        if (this.units.has(id)) {
            return false;
        }

        const speed = Math.max(
            1,
            Number(unit.pokemonSpeed ?? unit.speed ?? 100) || 100
        );

        const attackIntervalTicks = Math.max(
            6,
            Math.round(this.baseAttackIntervalTicks * 100 / speed)
        );

        const newUnit = {
            ...unit,
            id,
            square,
            attackRange: Math.max(1, Number(unit.attackRange) || 1),
            pokemonSpeed: speed,
            attackIntervalTicks,
            nextMoveTick: 0,
            nextAttackTick: 0,
            targetId: null
        };

        this.units.set(id, newUnit);
        this.hex.board[square] = newUnit;

        return true;
    }

    emit(event) {
        const data = {
            tick: this.tickCount,
            ...event
        };

        this.events.push(data);

        if (typeof this.onEvent === 'function') {
            this.onEvent(data);
        }
    }


    step() {
        this.tickCount++;

        const unitIds = [...this.units.keys()];

        for (const id of unitIds) {
            const unit = this.units.get(id);
            if (!unit) continue;

            if (unit.hp !== undefined && unit.hp <= 0) continue;
            if (this.hex.board[unit.square] !== unit) continue;

            const action = this.ai.decideAction(
                unit.square,
                unit.attackRange
            );

            if (action.type === 'move') {
                if (this.tickCount < unit.nextMoveTick) continue;

                const from = unit.square;
                const moved = this.hex.moveUnit(from, action.to);

                if (moved) {
                    unit.square = action.to;
                    unit.nextMoveTick =
                        this.tickCount + this.moveCooldownTicks;

                    this.emit({
                        type: 'move',
                        unitId: unit.id,
                        from,
                        to: action.to
                    });
                }
            }

            if (action.type === 'attack') {
                if (this.tickCount < unit.nextAttackTick) continue;

                const target = this.hex.board[action.target];

                if (!target ||
                    target.color === unit.color ||
                    (target.hp !== undefined && target.hp <= 0)) {
                    unit.targetId = null;
                    continue;
                }

                // Giữ nguyên sự kiện để hệ thống combat xử lý sát thương.
                this.emit({
                    type: 'attack-ready',
                    unitId: unit.id,
                    from: unit.square,
                    target: action.target
                });

                unit.nextAttackTick =
                    this.tickCount + unit.attackIntervalTicks;
            }
        }

        if (typeof this.onTick === 'function') {
            this.onTick({
                tick: this.tickCount,
                units: [...this.units.values()]
            });
        }
    }


    start() {
        if (this.running) return;

        this.running = true;

        this.timer = setInterval(() => {
            this.step();
        }, this.tickDuration);
    }

    stop() {
        this.running = false;

        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    reset() {
        this.stop();

        this.tickCount = 0;
        this.units.clear();
        this.events = [];

        this.hex.board.fill(null);
    }
}

window.HexSimulation = HexSimulation;
