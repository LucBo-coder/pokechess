
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
        if (!skill.damageMultiplier) return skill.skillDescription;
        const scale = window.HexBalance?.SKILL_DAMAGE_MULTIPLIER ?? 0.65;
        const percent = Math.round(skill.damageMultiplier * scale * 100);
        return `${skill.skillDescription} Sau cân bằng kỹ năng: ${percent}% ATK trước tương khắc hệ và Sudden Death.`;
    }
};
