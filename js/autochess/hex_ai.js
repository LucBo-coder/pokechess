
'use strict';

class HexAI {
    constructor(hexBoard) {
        this.hex = hexBoard;
        this.pathfinder = new HexPathfinding(hexBoard);
    }

    isValidEnemy(unit, target) {
        return !!(
            target &&
            target !== unit &&
            target.color !== unit.color &&
            (target.hp === undefined || target.hp > 0)
        );
    }

    getTarget(unit) {
        if (unit.targetId == null) return null;

        for (let sq = 0; sq < this.hex.size; sq++) {
            const target = this.hex.board[sq];

            if (target?.id === unit.targetId &&
                this.isValidEnemy(unit, target)) {
                return {
                    square: sq,
                    unit: target,
                    distance: this.hex.distance(unit.square, sq)
                };
            }
        }

        return null;
    }


    getTargetScore(unit, target, distance) {
        const role = unit.combatRole ?? 'fighter';
        const hp = Math.max(0, Number(target.hp) || 0);
        const maxHp = Math.max(1, Number(target.maxHp) || hp || 1);
        const hpRatio = Math.min(1, hp / maxHp);
        const targetRole = target.combatRole ?? 'fighter';

        // Điểm càng thấp càng được ưu tiên.
        switch (role) {
            case 'assassin': {
                const backlineBonus =
                    targetRole === 'mage' ||
                        targetRole === 'marksman' ? 6 : 0;

                return distance * 2
                    + hpRatio * 4
                    - backlineBonus;
            }

            case 'tank': {
                let threatBonus = 0;

                // Ưu tiên kẻ địch đang đứng gần đồng đội tuyến sau.
                for (let sq = 0; sq < this.hex.size; sq++) {
                    const ally = this.hex.board[sq];

                    if (!ally || ally === unit) continue;
                    if (ally.color !== unit.color) continue;
                    if (ally.hp !== undefined && ally.hp <= 0) continue;

                    if (
                        ally.combatRole === 'mage' ||
                        ally.combatRole === 'marksman'
                    ) {
                        const allyDistance =
                            this.hex.distance(target.square, sq);

                        if (allyDistance <= 2) {
                            threatBonus = Math.max(
                                threatBonus,
                                5 - allyDistance
                            );
                        }
                    }
                }

                return distance * 3 - threatBonus;
            }

            case 'mage':
                return distance * 3 + hpRatio;

            case 'marksman':
                return distance * 3 + hpRatio * 2;

            case 'fighter':
            default:
                return distance * 3;
        }
    }

    findNearestEnemy(unitSq) {
        if (!this.hex.isValidCell(unitSq)) return null;

        const unit = this.hex.board[unitSq];
        if (!unit) return null;

        let best = null;
        let bestScore = Infinity;

        for (let sq = 0; sq < this.hex.size; sq++) {
            const target = this.hex.board[sq];

            if (!this.isValidEnemy(unit, target)) continue;

            const distance = this.hex.distance(unitSq, sq);

            const score = this.getTargetScore(
                unit,
                target,
                distance
            );

            if (score < bestScore) {
                bestScore = score;
                best = {
                    square: sq,
                    unit: target,
                    distance
                };
            }
        }

        return best;
    }


    decideAction(unitSq, attackRange = 1) {
        const unit = this.hex.board[unitSq];

        if (!unit || !this.hex.isValidCell(unitSq)) {
            return { type: 'idle', reason: 'invalid-unit' };
        }

        let target = this.getTarget(unit);

        if (!target) {
            unit.targetId = null;
            target = this.findNearestEnemy(unitSq);
        }

        if (!target) {
            return { type: 'idle', reason: 'no-enemy' };
        }

        const range = Math.max(1, Number(attackRange) || 1);

        if (target.distance <= range) {
            unit.targetId = target.unit.id;

            return {
                type: 'attack',
                from: unitSq,
                target: target.square
            };
        }

        let path = this.pathfinder.findPathToAttackRange(
            unitSq,
            target.square,
            range
        );

        // Nếu mục tiêu bị chặn, thử các kẻ địch khác.
        if (!path || path.length <= 1) {
            const alternatives = [];

            for (let sq = 0; sq < this.hex.size; sq++) {
                const enemy = this.hex.board[sq];

                if (!this.isValidEnemy(unit, enemy)) continue;
                if (sq === target.square) continue;

                alternatives.push({
                    square: sq,
                    unit: enemy,
                    distance: this.hex.distance(unitSq, sq)
                });
            }

            alternatives.sort((a, b) => a.distance - b.distance);

            for (const alternative of alternatives) {
                if (alternative.distance <= range) {
                    target = alternative;
                    path = null;
                    break;
                }

                const candidate = this.pathfinder.findPathToAttackRange(
                    unitSq,
                    alternative.square,
                    range
                );

                if (candidate && candidate.length > 1) {
                    target = alternative;
                    path = candidate;
                    break;
                }
            }
        }

        unit.targetId = target.unit.id;

        if (target.distance <= range) {
            return {
                type: 'attack',
                from: unitSq,
                target: target.square
            };
        }

        if (path && path.length > 1) {
            return {
                type: 'move',
                from: unitSq,
                to: path[1],
                target: target.square,
                path
            };
        }

        return {
            type: 'idle',
            reason: 'no-path',
            target: target.square
        };
    }
}

window.HexAI = HexAI;
