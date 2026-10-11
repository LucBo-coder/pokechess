'use strict';

// All runtime modifiers stay inside HexCombat's damage/healing pipeline.
// Flat legacy ATK/HP values use the same conversion as HexBridge.
window.HexEffects = {
    snapshot(ui, piece) {
        const source = { ...piece, talismans: [...(piece.talismans ?? [])] };
        const flags = {};
        for (const key of Object.keys(window.TalismanSystem ?? {})) {
            if (key.startsWith('has') && typeof TalismanSystem[key] === 'function') flags[key] = !!TalismanSystem[key](source);
        }
        const astral = piece.color === 'w' ? [...(window.MetaProgression?.getAllocatedNodes() ?? [])] : [];
        const synergies = piece.color === 'w' ? window.SynergySystem?.getActiveSynergies(ui) ?? {} : {};
        const elements = TypeSystem.getEffectivePieceElements(source);
        const tiers = {};
        for (const [id, entry] of Object.entries(synergies)) if (entry.isActive) tiers[id] = { ...entry.activeTier };
        const starterSpeciesId=ui.inventory?.find(item=>item.id===(piece.invId??piece.id))?.starterSpeciesId??piece.type;
        return { flags, astral, tiers, elements, talismans: source.talismans, starter: piece.color === 'w' && (window.MetaProgression?.getSelectedStarters() ?? []).includes(starterSpeciesId) };
    },
    has(unit, key) { return !!unit.effects?.flags?.[key]; },
    node(unit, id) { return !!unit.effects?.astral?.includes(id); },
    matches(unit, type) { return [unit.effects?.elements?.element, unit.effects?.elements?.element2].includes(type); },
    tier(unit, type, teamKey, selfKey) {
        const tier = unit.effects?.tiers?.[type];
        return tier?.[teamKey] ?? (this.matches(unit, type) ? tier?.[selfKey] ?? 0 : 0);
    },
    flatAtk(value) { return value * (window.HexBalance?.ATTACK_DAMAGE_MULTIPLIER ?? 0.35); },
    flatHp(value) { return value * (window.HexBalance?.HP_MULTIPLIER ?? 4); },
    outgoing(combat, attacker, defender, damage, source, matchup) {
        if (source !== 'attack' && source !== 'skill') return damage;
        if (this.has(attacker, 'hasExpertBelt') && matchup.multiplier > 1) damage *= 1.2;
        if (this.has(attacker, 'hasChoiceSpecs')) damage *= 1.15;
        if (this.has(attacker, 'hasBlackBelt') && attacker.hp <= attacker.maxHp * 0.5) damage *= 1.25;
        if (this.matches(attacker, 'fire') && this.node(attacker, 'fire_keystone') && attacker.hp > attacker.maxHp * 0.5) damage *= 1.5;
        const dark = attacker.effects?.tiers?.dark;
        if (dark) {
            if (defender.hp < defender.maxHp * 0.5) damage *= 1 + (dark.executeBonus ?? 0);
            if (this.matches(attacker, 'dark') && Math.floor(attacker.square / 7) >= Math.floor(defender.square / 7)) damage *= 1 + (dark.flankBonus ?? 0);
        }
        if (source === 'attack') {
            if(attacker.statuses.masteryFocus){damage*=1.15;delete attacker.statuses.masteryFocus;}
            if (this.has(attacker, 'hasMuscleBand')) damage += Math.max(1, Math.round(defender.hp * 0.04));
            if (this.has(attacker, 'hasMetronome')) {
                attacker.metronomeStacks = Math.min(3, (attacker.metronomeStacks ?? 0) + 1);
                damage += this.flatAtk(attacker.metronomeStacks * 2);
            }
            if (this.has(attacker, 'hasCharcoal') && this.matches(attacker, 'fire')) damage += this.flatAtk(4);
            if (this.has(attacker, 'hasMysticWater') && this.matches(attacker, 'water')) damage += this.flatAtk(3);
            if (this.has(attacker, 'hasFlameOrb')) damage += this.flatAtk(4);
            if (this.has(attacker, 'hasToxicOrb')) damage += this.flatAtk(2);
        }
        // Type immunity remains absolute, including HP based item bonuses.
        return matchup.multiplier === 0 ? 0 : damage;
    },
    incoming(combat, defender, damage, source) {
        if (source !== 'attack' && source !== 'skill') return damage;
        if(defender.statuses.masteryGuard && defender.hp<=defender.maxHp*0.5)damage*=0.85;
        const rockShield = this.tier(defender, 'rock', 'teamShield', 'selfShield');
        if (!defender.firstShieldUsed && (this.has(defender, 'hasDivineShield') || rockShield)) {
            defender.firstShieldUsed = true;
            combat.emit({ type: 'status', unitId: defender.id, status: 'shield', duration: 0 });
            return 0;
        }
        const ghostDodge = this.tier(defender, 'ghost', 'teamFirstDodge', 'selfFirstDodge');
        const flyingDodge = this.tier(defender, 'flying', 'teamDodge', 'selfDodge');
        const dodgeChance=Math.min(0.75, flyingDodge + (this.has(defender, 'hasBrightPowder') ? 0.18 : 0));
        if ((!defender.ghostDodgeUsed && ghostDodge) || (dodgeChance>0 && combat.random() < dodgeChance)) {
            defender.ghostDodgeUsed = true;
            combat.emit({ type: 'status', unitId: defender.id, status: 'dodge', duration: 0 });
            return 0;
        }
        return damage;
    },
    lethal(combat, defender, hpDamage) {
        if (hpDamage < defender.hp || defender.survivalUsed) return hpDamage;
        if(defender.mastery?.speciesId==='6' && defender.mastery.specialization==='defense' && (defender.masterySurviveTick??0)<=combat.tickCount) {
            defender.masterySurviveTick=combat.tickCount+60*combat.tickRate;
            return Math.max(0,defender.hp-1);
        }
        if (this.has(defender, 'hasFocusSash') || this.node(defender, 'm_keystone') ||
            (this.has(defender, 'hasFocusBand') && combat.random() < 0.35)) {
            defender.survivalUsed = true;
            combat.emit({ type: 'status', unitId: defender.id, status: 'survive', duration: 0 });
            return Math.max(0, defender.hp - 1);
        }
        return hpDamage;
    },
    afterDamage(combat, attacker, defender, damage, source, matchup, options = {}) {
        if (defender.hp <= 0 && !defender.reviveUsed && (this.has(defender, 'hasRevive') ||
            (defender.effects?.starter && this.node(defender, 'r_keystone')))) {
            defender.reviveUsed = true;
            combat.healUnit(defender, defender.maxHp * 0.5, true);
        }
        if (damage <= 0 || (source !== 'attack' && source !== 'skill')) return;
        const healMultiplier = this.has(attacker, 'hasBigRoot') ? 1.5 : 1;
        if (attacker.hp > 0 && attacker.effects?.talismans?.includes('shell_bell')) combat.healUnit(attacker, damage * 0.2 * healMultiplier);
        if (attacker.hp > 0 && defender.hp <= 0 && this.has(attacker, 'hasDragonFang')) combat.healUnit(attacker, this.flatHp(15) * healMultiplier);
        if (attacker.hp > 0 && source === 'attack' && this.has(attacker, 'hasWiseGlasses') && (attacker.wiseStacks ?? 0) < 4) {
            attacker.wiseStacks = (attacker.wiseStacks ?? 0) + 1;
            attacker.bossBaseDamage += this.flatAtk(1); window.HexTraits?.refresh(attacker);
        }
        if (attacker.hp > 0 && this.has(attacker, 'hasToxicOrb')) combat.healUnit(attacker, damage * 0.15 * healMultiplier);
        if (this.has(defender, 'hasSitrusBerry') && !defender.sitrusUsed && defender.hp > 0 && defender.hp <= defender.maxHp * 0.5) {
            defender.sitrusUsed = true; combat.healUnit(defender, defender.maxHp * 0.25);
        }
        if (this.has(defender, 'hasWeaknessPolicy') && !defender.weaknessUsed && defender.hp > 0 && (matchup.multiplier > 1 || options.critical)) {
            defender.weaknessUsed = true; defender.bossBaseDamage += this.flatAtk(8); window.HexTraits?.refresh(defender);
        }
        const fairyHeal = attacker.effects?.tiers?.fairy?.allyHealOnAttack ?? 0;
        if (fairyHeal && source === 'attack') {
            const ally = [...combat.units.values()].filter(unit => unit.color === attacker.color && unit.hp > 0)
                .sort((a,b) => a.hp/a.maxHp-b.hp/b.maxHp)[0];
            if (ally) combat.healUnit(ally, this.flatHp(fairyHeal), false, attacker);
        }
        if (source === 'attack' && defender.hp > 0 && this.has(attacker, 'hasFlameOrb')) this.dot(combat, attacker, defender, 'burn', this.flatHp(3), 3);
        if (source === 'attack' && defender.hp > 0 && this.matches(attacker, 'fire') && this.node(attacker, 'fire_keystone')) this.dot(combat, attacker, defender, 'burn', this.flatHp(3), 3);
        let reflect = this.tier(defender, 'ground', 'teamThorns', 'selfThorns');
        const itemReflect = window.TalismanSystem?.getThornsDmg(defender, damage / (window.HexBalance?.ATTACK_DAMAGE_MULTIPLIER ?? 0.35)) ?? 0;
        if (attacker.hp>0 && this.matches(defender, 'fire') && this.node(defender, 'fire_notable_2') && !this.has(attacker,'hasProtectivePads'))
            combat.dealDamage(defender,attacker,this.flatAtk(4),'reflect',{element:'fire',damageType:'elemental'});
        if (attacker.hp > 0 && (reflect || itemReflect) && !this.has(attacker, 'hasProtectivePads')) combat.dealDamage(defender, attacker, this.flatAtk(reflect + itemReflect), 'reflect', {damageType:'true'});
        if (attacker.hp > 0 && this.has(attacker, 'hasLifeOrb')) combat.dealDamage(attacker, attacker, this.flatHp(2), 'recoil', {damageType:'true'});
        if (attacker.hp > 0 && this.has(defender, 'hasRedCard') && !defender.redCardUsed) {
            defender.redCardUsed = true; combat.dealDamage(defender, attacker, this.flatAtk(5), 'reflect', {damageType:'true'});
        }
    },
    dot(combat, owner, target, id, damage, seconds) {
        if(this.has(target,'hasLumBerry') || (this.matches(target,'fairy')&&this.node(target,'fairy_keystone')))return;
        target.statuses[id] = { name:id, ownerId:owner.id, owner:{id:owner.id,color:owner.color,element:owner.element,element2:owner.element2,square:owner.square,hp:0}, damage, expiresAt:combat.tickCount+seconds*combat.tickRate, nextTick:combat.tickCount+combat.tickRate };
        combat.emit({type:'status',unitId:target.id,status:id,duration:seconds});
    },
    update(combat, unit) {
        if (combat.tickCount % combat.tickRate === 0 && this.has(unit, 'hasLeftovers'))
            combat.healUnit(unit, this.flatHp(4) * (this.has(unit, 'hasBigRoot') ? 1.5 : 1));
        for (const [id,status] of Object.entries(unit.statuses)) {
            if (!['burn','poison'].includes(id) || status.nextTick > combat.tickCount || status.expiresAt < combat.tickCount) continue;
            status.nextTick += combat.tickRate;
            const owner = combat.units.get(status.ownerId) ?? status.owner;
            combat.dealDamage(owner, unit, status.damage, 'status', {damageType:'non-elemental'});
        }
    }
};
