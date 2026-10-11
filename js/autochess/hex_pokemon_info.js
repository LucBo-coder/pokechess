
'use strict';

window.HexPokemonInfo = {

    get(pokemonId) {
        const id = String(pokemonId);

        const piece = typeof PIECES !== 'undefined'
            ? PIECES[id]
            : null;

        if (!piece) return null;

        const config =
            typeof HexUnitConfig !== 'undefined'
                ? HexUnitConfig.getConfig(id)
                : {};

        const role = config.combatRole ??
            config.role ??
            (typeof HexUnitConfig !== 'undefined'
                ? HexUnitConfig.getRole(id)
                : 'fighter');

        const skill = window.HexSkillInfo?.[role] ?? {};

        return {
            id,
            name: piece.name ?? `Pokemon #${id}`,
            rarity: piece.rarity ?? 'common',
            element: piece.element ?? 'normal',
            element2: piece.element2 ?? null,
            stage: piece.stage ?? 1,

            hp: Number(piece.maxHp ?? 100),
            damage: Number(piece.damage ?? 10),

            speed: Number(
                config.pokemonSpeed ??
                piece.speed ??
                100
            ),

            role,
            className: skill.className ?? role,
            classDescription:
                skill.classDescription ?? '',

            attackRange: Number(
                config.attackRange ?? 1
            ),

            maxMana: Number(
                config.maxMana ?? 100
            ),

            skillName:
                skill.skillName ?? 'Unknown Skill',

            skillDescription:
                window.HexSkillInfo?.getDescription(role) ?? skill.skillDescription ?? ''
        };
    },

    getBattleStats(piece, square, ui) {
        if (!piece || !ui) return null;

        const stats = new HexBridge(ui).getUnitStats(piece, square);
        return { ...stats, damage: stats.attackDamage, speed: stats.pokemonSpeed };
    }
};
