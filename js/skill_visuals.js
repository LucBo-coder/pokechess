'use strict';
window.SkillVisualDefinitions={
    moves:{
        flamethrower:{category:'beam',projectile:'flamethrower_01',impact:'fire_impact_01'},
        'water-gun':{category:'projectile',projectile:'water_gun_01',impact:'water_splash_01'},
        thunderbolt:{category:'strike',projectile:null,impact:'thunderbolt_01'},
        'solar-beam':{category:'beam',projectile:'proj_grass_01',impact:'grass_vine_01'},
        earthquake:{category:'area',projectile:null,impact:'earthquake_01'},
        'vine-whip':{category:'melee',projectile:null,impact:'vine_whip_01'},
        'shadow-ball':{category:'projectile',projectile:'shadow_ball_01',impact:'ghost_impact_01'},
        'ice-beam':{category:'beam',projectile:'ice_beam_01',impact:'ice_impact_01'},
        psychic:{category:'pulse',projectile:null,impact:'psychic_01'},
        'hyper-beam':{category:'beam',projectile:'hyper_beam_01',impact:'normal_impact_01'},
        harden:{status:'status_defup_01'},amnesia:{status:'status_defup_01'},'cosmic-power':{status:'status_defup_01'},
        toxic:{status:'status_poison_01'},'string-shot':{status:'status_stun_01'},teleport:{status:'cast_psychic_01'},transform:{status:'cast_normal_01'},sketch:{status:'cast_normal_01'}
    },
    resolve(event,renderer){const move=window.SpeciesCatalog?.moves[event.moveId],type=event.element??move?.type??renderer?.getVfxElement(event.unitId??event.attackerId)??'normal',category=event.damageCategory??move?.category;
        const impact=({water:'water_splash_01',grass:'grass_vine_01'})[type]??`${type}_impact_01`;
        const custom=event.role==='tank'&&!move?{status:'status_shield_01',projectile:null}:{};
        const physical=category==='physical'?{projectile:null,impact:/(slash|claw|cut|scratch)/.test(move?.slug??'')?'slash_claw_01':impact}:{};
        return {skillId:move?`move:${move.id}`:`custom:${event.role??event.source??'attack'}`,moveType:type,category:category??event.role,cast:`cast_${type}_01`,projectile:category==='status'?null:`proj_${type}_01`,impact,area:event.role==='mage'?`aoe_${type}_01`:null,priority:renderer?.getUnit(event.unitId??event.attackerId)?.isBoss?5:3,...physical,...custom,...this.moves[move?.slug]};
    }
};
