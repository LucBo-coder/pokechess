
'use strict';

window.HexBalance = Object.freeze({
    TICK_RATE: 30,

    // Battle duration
    BATTLE_DURATION: 180,
    PHASE_2_START: 60,
    SUDDEN_DEATH_START: 120,

    // Stats
    HP_MULTIPLIER: 4.0,
    ATTACK_DAMAGE_MULTIPLIER: 0.35,
    SKILL_DAMAGE_MULTIPLIER: 0.65,

    // Mana
    START_MANA: 30,
    MAX_MANA: 100,
    MANA_PER_ATTACK: 15,
    MANA_PER_HIT: 5,

    // Skill cooldown
    SKILL_COOLDOWN_SECONDS: 3,

    // Battle phases
    PHASE_2_MANA_MULTIPLIER: 1.25,
    // Existing combat ramps from x1 at 120s to x3.5 at 180s.
    SUDDEN_DEATH_DAMAGE_MULTIPLIER: 3.5
});
