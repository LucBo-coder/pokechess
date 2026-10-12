
'use strict';

window.HexSkillInfo = {
    tank: {
        className: 'Tank',
        classDescription:
            'Tướng chống chịu, đứng tuyến trước và hấp thụ sát thương.',
        skillName: 'Iron Guard',
        skillDescription:
            'Tạo lá chắn bằng 30% HP tối đa. Lá chắn hấp thụ sát thương trước HP.',
        rangeDescription: 'Cận chiến',
        color: '#7edfff'
    },

    fighter: {
        element: 'active',
        damageMultiplier: 1.8,
        className: 'Fighter',
        classDescription:
            'Đấu sĩ cận chiến, gây sát thương ổn định ở tuyến trước.',
        skillName: 'Power Strike',
        skillDescription:
            'Tung đòn đánh mạnh vào một mục tiêu. Sát thương kỹ năng tính từ 180% sát thương tấn công.',
        rangeDescription: 'Cận chiến',
        color: '#ff986b'
    },

    assassin: {
        element: 'active',
        damageMultiplier: 2.2,
        className: 'Assassin',
        classDescription:
            'Sát thủ chuyên gây sát thương lớn lên một mục tiêu.',
        skillName: 'Execution',
        skillDescription:
            'Tấn công mục tiêu với hệ số sát thương kỹ năng 220%.',
        rangeDescription: 'Cận chiến',
        color: '#cb8aff'
    },

    mage: {
        element: 'active',
        damageMultiplier: 1.4,
        className: 'Mage',
        classDescription:
            'Pháp sư gây sát thương lên nhiều kẻ địch bằng kỹ năng diện rộng.',
        skillName: 'Arcane Burst',
        skillDescription:
            'Gây sát thương kỹ năng lên tối đa 3 kẻ địch trong bán kính 1 Hex quanh mục tiêu, với hệ số 140%.',
        rangeDescription: 'Đánh xa',
        color: '#83b8ff'
    },

    marksman: {
        element: 'active',
        damageMultiplier: 2,
        className: 'Marksman',
        classDescription:
            'Xạ thủ tấn công từ khoảng cách xa.',
        skillName: 'Precision Shot',
        skillDescription:
            'Bắn một phát đạn chính xác vào mục tiêu, với hệ số sát thương kỹ năng 200%.',
        rangeDescription: 'Đánh xa',
        color: '#ffe17b'
    },

    getDescription(role) {
        const skill = this[role];
        if (!skill) return '';
        const description = window.t ? t(`skill.${role}.description`) : skill.skillDescription;
        if (!skill.damageMultiplier) return description;
        const scale = window.HexBalance?.SKILL_DAMAGE_MULTIPLIER ?? 0.65;
        const percent = Math.round(skill.damageMultiplier * scale * 100);
        return `${description} ${window.t ? t('skill.balance',{percent}) : `Sau cân bằng kỹ năng: ${percent}% ATK trước tương khắc hệ và Sudden Death.`}`;
    }
};

// Metadata mirrors the existing auto-battler rules. Null range means no cast-distance gate.
for (const role of ['tank','fighter','assassin','mage','marksman']) {
    Object.assign(HexSkillInfo[role], {
        id:`role_${role}`, nameKey:`skill.${role}.name`, descriptionKey:`skill.${role}.description`,
        category:'active', targetMode:role === 'tank' ? 'self' : role === 'mage' ? 'enemy-area' : 'enemy',
        range:null, energyCost:'maxMana', cooldown:3, castTime:role==='tank'?0:6/30,
        effects:role === 'tank' ? [{kind:'shield',maxHpRatio:.3}] : [{kind:'damage',multiplier:HexSkillInfo[role].damageMultiplier,...(role === 'mage' ? {radius:1,maxTargets:3} : {})}],
        vfxId:role === 'tank' ? 'status_shield_01' : role === 'mage' ? 'aoe_{element}_01' : 'cast_{element}_01',
        sfxId:role === 'tank' ? 'reflect' : role === 'mage' ? 'magic' : role === 'marksman' ? 'arrow' : 'slash'
    });
}
HexSkillInfo.describe = function(role,unit = {},combat = null) {
    const skill = this[role] ?? this.fighter;
    return {...skill, energyCost:unit?.maxMana ?? 100,
        cooldown:combat ? combat.skillCooldownTicks/combat.tickRate : (window.HexBalance?.SKILL_COOLDOWN_SECONDS ?? skill.cooldown),
        castTime:role==='tank' || (combat && !combat.deferDamage) ? 0 : combat ? combat.getHitDelay(unit,'skill')/combat.tickRate : skill.castTime};
};
HexSkillInfo.basicAttack = unit => ({id:'basic_attack',nameKey:'skill.basic',category:'basic',element:'active',targetMode:'enemy',range:unit?.attackRange??1,energyCost:0,energyGain:window.HexBalance?.MANA_PER_ATTACK??15,effects:[{kind:'damage',multiplier:1}],vfxId:'hit_light_01',sfxId:'hit'});
