
'use strict';

class HexPathfinding {
    constructor(hexBoard) {
        this.hex = hexBoard;
    }

    /**
     * Tìm đường từ start đến goal.
     * Trả về danh sách các ô, bao gồm start và goal.
     * Trả về [] nếu không tìm được đường.
     */
    findPath(start, goal, options = {}) {
        const hex = this.hex;

        if (!hex.isValidCell(start) || !hex.isValidCell(goal)) {
            return [];
        }

        if (start === goal) {
            return [start];
        }

        const allowOccupiedGoal = options.allowOccupiedGoal === true;

        if (hex.isOccupied(goal) && !allowOccupiedGoal) {
            return [];
        }

        const openSet = new Set([start]);
        const cameFrom = new Map();

        const gScore = new Map([[start, 0]]);
        const fScore = new Map([
            [start, hex.distance(start, goal)]
        ]);

        while (openSet.size > 0) {
            let current = null;
            let lowestF = Infinity;

            for (const sq of openSet) {
                const score = fScore.get(sq) ?? Infinity;

                if (score < lowestF) {
                    lowestF = score;
                    current = sq;
                }
            }

            if (current === goal) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.delete(current);

            for (const neighbor of hex.getNeighbors(current)) {
                if (
                    hex.isOccupied(neighbor) &&
                    !(allowOccupiedGoal && neighbor === goal)
                ) {
                    continue;
                }

                const tentativeG = (gScore.get(current) ?? Infinity) + 1;

                if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeG);

                    fScore.set(
                        neighbor,
                        tentativeG + hex.distance(neighbor, goal)
                    );

                    openSet.add(neighbor);
                }
            }
        }

        return [];
    }

    reconstructPath(cameFrom, current) {
        const path = [current];

        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }

        return path;
    }

    /**
     * Tìm đường đến một ô trống trong tầm đánh mục tiêu.
     * attackRange = 1: cận chiến.
     * attackRange > 1: đánh xa.
     */
    findPathToAttackRange(start, target, attackRange = 1) {
        const hex = this.hex;

        if (!hex.isValidCell(start) || !hex.isValidCell(target)) {
            return [];
        }

        if (hex.distance(start, target) <= attackRange) {
            return [start];
        }

        const candidates = [];

        for (let sq = 0; sq < hex.size; sq++) {
            if (
                sq !== start &&
                hex.isOccupied(sq)
            ) {
                continue;
            }

            if (hex.distance(sq, target) <= attackRange) {
                candidates.push(sq);
            }
        }

        let bestPath = [];

        for (const goal of candidates) {
            const path = this.findPath(start, goal);

            if (
                path.length > 0 &&
                (bestPath.length === 0 || path.length < bestPath.length)
            ) {
                bestPath = path;
            }
        }

        return bestPath;
    }
}

window.HexPathfinding = HexPathfinding;
