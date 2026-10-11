
'use strict';

class HexUnitConfig {
    static ROLES = {
        tank: {
            attackRange: 1,
            preferredDistance: 1,
            hpMultiplier: 1.35,
            damageMultiplier: 0.8
        },
        fighter: {
            attackRange: 1,
            preferredDistance: 1,
            hpMultiplier: 1.1,
            damageMultiplier: 1
        },
        assassin: {
            attackRange: 1,
            preferredDistance: 1,
            hpMultiplier: 0.85,
            damageMultiplier: 1.3
        },
        mage: {
            attackRange: 3,
            preferredDistance: 3,
            hpMultiplier: 0.9,
            damageMultiplier: 1.2
        },
        marksman: {
            attackRange: 4,
            preferredDistance: 4,
            hpMultiplier: 0.85,
            damageMultiplier: 1.15
        }
    };

    // Cấu hình thủ công cho Pokémon đặc biệt.
    // Có thể mở rộng mà không sửa file gốc.
    static ROLE_OVERRIDES = {
        '143': 'tank',       // Snorlax
        '448': 'fighter',    // Lucario
        '658': 'assassin',   // Greninja
        '282': 'mage',       // Gardevoir
        '724': 'marksman',   // Decidueye
        '65': 'mage',        // Alakazam
        '445': 'fighter',    // Garchomp
        '376': 'tank'        // Metagross
    };

    static getPokemon(id) {
        if (typeof PIECES === 'undefined') return null;
        return PIECES[String(id)] ?? null;
    }

    static getRole(id) {
        const pokemon = this.getPokemon(id);

        if (!pokemon) return 'fighter';

        // Ưu tiên vai trò được định nghĩa trực tiếp.
        if (this.ROLES[pokemon.combatRole]) {
            return pokemon.combatRole;
        }

        // Ưu tiên cấu hình ghi đè.
        const override = this.ROLE_OVERRIDES[String(id)];

        if (override) return override;

        const hp = Number(pokemon.maxHp ?? 70);
        const damage = Number(pokemon.damage ?? 20);

        const primary = pokemon.element;
        const secondary = pokemon.element2;

        const types = [primary, secondary];

        // Phân loại sơ bộ theo đặc điểm dữ liệu.
        if (hp >= 120 && hp > damage * 3) {
            return 'tank';
        }

        if (
            types.includes('psychic') ||
            types.includes('ghost') ||
            types.includes('fairy')
        ) {
            return 'mage';
        }

        if (
            types.includes('dark') ||
            (damage >= 35 && hp <= 80)
        ) {
            return 'assassin';
        }

        if (
            types.includes('flying') ||
            types.includes('electric')
        ) {
            return 'marksman';
        }

        return 'fighter';
    }

    static getConfig(id) {
        const role = this.getRole(id);
        const pokemon = this.getPokemon(id);
        const base = this.ROLES[role];

        const customRange = Number(pokemon?.attackRange);

        return {
            role,
            attackRange:
                pokemon?.attackRange != null &&
                    Number.isFinite(customRange)
                    ? Math.max(1, Math.min(4, customRange))
                    : base.attackRange,
            preferredDistance: base.preferredDistance,
            hpMultiplier: base.hpMultiplier,
            damageMultiplier: base.damageMultiplier
        };
    }
}

window.HexUnitConfig = HexUnitConfig;
