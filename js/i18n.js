'use strict';

window.I18n = {
    STORAGE_KEY: 'pokechess_language',
    language: 'vi-VN',
    listeners: new Set(),
    init() {
        try { this.language = this.validLanguage(localStorage.getItem(this.STORAGE_KEY)); } catch (_) {}
        this.updateDOM();
    },
    validLanguage(language) { return ['vi-VN','en-US'].includes(language) ? language : 'vi-VN'; },
    t(key, params = {}) {
        const fallback = window.PokeChessLocales?.['en-US']?.[key];
        const value = window.PokeChessLocales?.[this.language]?.[key] ?? fallback ?? params.defaultValue ?? '';
        return String(value).replace(/\{([a-zA-Z][\w]*)\}/g, (_, name) => String(params[name] ?? '—'));
    },
    escape(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); },
    html(key, params = {}) { return this.escape(this.t(key, params)); },
    item(id,field,fallback='') {
        if(this.language==='vi-VN') {
            const def=window.TALISMANS?.[id];
            if(def?.overrideElement2) {
                if(field==='name')return `Ngọc ${t('type.'+def.overrideElement2)}`;
                if(field==='desc')return `Thay hệ thứ hai thành ${t('type.'+def.overrideElement2)}, giữ qua tiến hóa. ${this.itemBonuses(def)}`;
            }
            if(def?.isMega) {
                if(field==='name')return id==='mega_ring'?'Nhẫn Mega':id==='mega_bracelet'?'Vòng tay Mega':`Đá ${fallback}`;
                if(field==='desc')return `Chiếm một ô trang bị và kích hoạt dạng Mega cho Pokémon phù hợp. ${this.itemBonuses(def)}`;
            }
            if(def?.isSpell && /stone|metal_coat|kings_rock|dragon_scale|up_grade/.test(id)) {
                if(field==='name')return ({fire_stone:'Đá Lửa',water_stone:'Đá Nước',thunder_stone:'Đá Sấm',leaf_stone:'Đá Lá',moon_stone:'Đá Trăng',sun_stone:'Đá Mặt Trời',dusk_stone:'Đá Hoàng Hôn',dawn_stone:'Đá Bình Minh',shiny_stone:'Đá Sáng',ice_stone:'Đá Băng',metal_coat:'Áo Kim Loại',kings_rock:'Đá Vua',dragon_scale:'Vảy Rồng',up_grade:'Bộ Nâng Cấp'})[id]??fallback;
                if(field==='desc')return 'Tiến hóa ngay Pokémon tương thích. Dùng một lần.';
            }
        }
        return this.t(`item.${id}.${field}`,{defaultValue:this.legacy(fallback)});
    },
    itemBonuses(def) {
        return [['bonusHp','HP tối đa'],['bonusAtk','công'],['bonusSpeed','tốc độ'],['dmgReduction','giảm sát thương nhận']].filter(([key])=>def[key]).map(([key,name])=>`+${def[key]} ${name}`).join(', ')+'.';
    },
    itemDefinition(id) {
        const def=typeof TalismanSystem !== 'undefined' ? TalismanSystem.get(id) : window.TALISMANS?.[id]; if(!def)return def;
        return {...def,name:this.item(id,'name',def.name),desc:this.item(id,'desc',def.desc??def.description),targetDesc:this.legacy(def.targetDesc)};
    },
    tree(node,field) {
        if(this.language !== 'vi-VN')return node[field]??'';
        const entry=window.PokeChessTreeVi?.[node.id];
        if(entry)return entry[field==='label'?0:1];
        const element=t('type.'+node.quad,{defaultValue:'Tinh Tú'});
        if(node.type==='origin')return field==='label'?`Sao ${element}`:`Khởi nguyên chòm ${element}.`;
        if(field==='label')return `${({hp:'Sinh lực',atk:'Sức mạnh',both:'Cường hóa'})[node.statKey]??'Thiên phú'} ${node.id.match(/\d+$/)?.[0]??''} · ${element}`;
        return this.legacy(node.desc);
    },
    legacy(message) {
        if(this.language !== 'vi-VN')return String(message ?? '');
        const text=String(message ?? '');
        if(window.PokeChessVietnameseText?.[text])return PokeChessVietnameseText[text];
        let value=text;
        for(const [pattern,replacement] of window.PokeChessVietnamesePatterns??[])value=value.replace(pattern,replacement);
        return value;
    },
    number(value, options = {}) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? new Intl.NumberFormat(this.language,options).format(numeric) : '—';
    },
    setLanguage(language) {
        this.language = this.validLanguage(language);
        try { localStorage.setItem(this.STORAGE_KEY, this.language); } catch (_) {}
        this.updateDOM();
        for (const listener of this.listeners) listener(this.language);
        const ui = window.roguelikeUI;
        ui?.updateMainMenuState?.();
        ui?.updateStats?.();
        ui?.renderShop?.();
        ui?.renderInventory?.();
        ui?.renderTalismans?.();
        window.soundManager?.updateUI?.();
        ui?.hexRenderer?.localize?.();
        if(ui?.isTutorialActive)ui.renderTutorialStep();
        if (window.HexPreparationInfo) HexPreparationInfo.selectedId = null;
        window.HexPreparationInfo?.refresh?.();
    },
    updateDOM(root = document) {
        if (document.documentElement) document.documentElement.lang = this.language;
        for (const element of root.querySelectorAll('[data-i18n]')) element.textContent = this.t(element.dataset.i18n);
        for (const element of root.querySelectorAll('[data-i18n-title]')) element.title = this.t(element.dataset.i18nTitle);
        for (const element of root.querySelectorAll('[data-i18n-placeholder]')) element.setAttribute('placeholder',this.t(element.dataset.i18nPlaceholder));
        const selector = document.getElementById('languageSelect');
        if (selector) { selector.value = this.language; selector.setAttribute('aria-label',this.t('menu.language')); }
    }
};
window.t = (key, params) => I18n.t(key, params);
I18n.init();
document.addEventListener('DOMContentLoaded', () => {
    const bindings = {
        '#btnMenuNewRun':'menu.newJourney','#btnMenuStarters':'menu.starterSelection',
        '#btnMenuSkillTree':'menu.astralTree','#btnMenuSaves':'menu.saveProfiles','#btnMenuHowToPlay':'menu.tacticalGuide',
        '#btnNewRun':'menu.newRun','#btnOpenMenu':'menu.open','#btnStartBattle':'combat.battle',
        '#btnRecallAll':'shop.recall','#btnResumeGame':'menu.resume','#btnInGameRestart':'menu.restart',
        '#btnReturnToMainMenu':'menu.main','#btnInGameHowToPlay':'menu.tacticalGuide',
        '#btnOpenSaveSlots':'menu.saveProfiles','#btnRestartRun':'menu.newJourney',
        '#btnRetryStage':'combat.retry','#btnNextStage':'combat.next','#btnCancelConfirm':'menu.cancel',
        '#btnAcceptConfirm':'menu.confirm','#btnCancelApplyTalisman':'menu.cancel','#btnCloseHowToPlay':'menu.understood',
        '#btnCloseSaveSlots':'menu.close','#btnCloseStarterModal':'menu.close','#btnCloseSkillTree':'menu.close',
        '#btnExportSaves':'menu.export','#btnImportSaves':'menu.import','#btnResetSkillTree':'tree.reset',
        '#btnCenterSkillTree':'tree.center','.skill-tree-main-title':'menu.astralTree',
        '#saveSlotsModal .modal-title':'save.vault','#saveSlotsModal .modal-subtitle':'save.manage',
        '#howToPlayModal .modal-title':'menu.tacticalGuide','#starterSelectModal .modal-title':'menu.starterSelection',
        '#victoryModal .modal-title':'combat.victory','#defeatModal .modal-title':'combat.defeat',
        '#drawModal .modal-title':'combat.draw','#inGameMenuModal .modal-title':'menu.controlPanel',
        '#btnTutorialSkip':'tutorial.skip','#btnTutorialPrev':'tutorial.back',
        '.stage-pill .stat-label':'combat.stage','.gold-pill .stat-label':'combat.gold','.slot-pill .stat-label':'combat.slots'
    };
    for (const [selector,key] of Object.entries(bindings)) {
        const element = document.querySelector(selector);
        if (element) element.dataset.i18n = key;
    }
    document.querySelectorAll('#howToPlayModal .intel-item').forEach((item,index) => {
        const text = item.children[1];
        if (text) text.dataset.i18n = ['guide.deploy','guide.types','guide.evolve','guide.synergy','guide.combat'][index];
    });
    I18n.updateDOM();
    document.getElementById('languageSelect')?.addEventListener('change',event=>I18n.setLanguage(event.target.value));
});
