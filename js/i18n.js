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
