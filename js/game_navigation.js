'use strict';

// Navigation derives the active mode from the existing controller. It never
// owns a second run, combat clock or save profile.
window.GameNavigation={
    ui(){return window.roguelikeUI;},
    mode(){return this.ui()?.expeditionRun?'expedition':'classic';},
    remember(mode,profile){localStorage.setItem('pokechess_navigation_v1',JSON.stringify({mode,profile}));},
    continue(){const ui=this.ui();if(ui.expeditionRun||ui.isGameActive){ui.closeMainMenu();return;}
        let preference;try{preference=JSON.parse(localStorage.getItem('pokechess_navigation_v1'));}catch{}
        if(preference?.mode==='expedition'){try{ExpeditionSession.enter(preference.profile);return;}catch(error){this.error(error.message);return;}}
        const slot=SaveSystem.getLatestSlot();if(slot)ui.loadGameSlot(slot);
    },
    error(message){this.ui()?.showToast(message,'warning');},
    play(){const cards=document.getElementById('game-mode-cards');if(cards){cards.hidden=false;cards.querySelector('button')?.focus();cards.scrollIntoView({block:'nearest'});}},
    classic(){const ui=this.ui();if(ui.expeditionRun&&ui.phase==='battle'){this.error('Hãy kết thúc trận trước khi chuyển chế độ.');return;}
        if(ui.expeditionRun)ExpeditionSession.leave();this.remember('classic',ui.currentSaveSlot);
        if(ui.isGameActive)ui.closeMainMenu();else {const slot=SaveSystem.getLatestSlot();if(slot)ui.loadGameSlot(slot);else {ui.resetRun();ui.closeMainMenu();}}this.hud();
    },
    expedition(){const ui=this.ui();if(ui.phase==='battle'){this.error('Tiếp tục trận hiện tại trước khi đổi chế độ.');return;}
        ui.closeMainMenu();ExpeditionSession.menu='setup';ExpeditionSession.render();
    },
    hud(){const ui=this.ui();if(!ui)return;const run=ui.expeditionRun;document.body.dataset.gameMode=run?'expedition':'classic';const pill=document.querySelector('.stage-pill');if(!pill)return;const label=pill.querySelector('.stat-label'),value=pill.querySelector('.stat-val');if(label)label.textContent=run?'ACT:':t('combat.stage');if(value)value.textContent=run?`${run.act+1} · ${Math.min(27,run.completed.length+1)}/27`:String(ui.stage);const enemy=document.getElementById('enemyName');if(run&&enemy&&ui.phase!=='battle')enemy.textContent=`Act ${run.act+1} · ${Expedition.node(run)?Expedition.nodeTypes[Expedition.node(run).type].label:'Chọn tuyến đường'}`;},
    init(){const box=document.querySelector('.main-menu-buttons');if(!box||this.initialized)return;this.initialized=true;
        const cards=document.createElement('section');cards.id='game-mode-cards';cards.hidden=true;cards.setAttribute('aria-label','Chọn chế độ chơi');
        for(const [mode,action]of [['classic',()=>this.classic()],['expedition',()=>this.expedition()]]){const b=document.createElement('button');b.type='button';b.className='btn game-mode-card';b.dataset.mode=mode;const title=document.createElement('strong'),text=document.createElement('span');title.dataset.i18n='nav.'+mode;text.dataset.i18n='nav.'+mode+'Description';title.textContent=t(title.dataset.i18n);text.textContent=t(text.dataset.i18n);b.append(title,text);b.onclick=action;cards.append(b);}document.getElementById('btnMenuNewRun').after(cards);
        document.getElementById('btnMenuNewRun').dataset.i18n='nav.play';document.getElementById('btnMenuNewRun').textContent=t('nav.play');
        const collection=document.getElementById('btnMasteryCollection');if(collection){collection.dataset.i18n='nav.collection';collection.textContent=t('nav.collection');}
        const settings=document.createElement('button');settings.id='btnMenuSettings';settings.type='button';settings.className='btn btn-menu-action';settings.dataset.i18n='nav.settings';settings.textContent=t('nav.settings');settings.onclick=()=>document.getElementById('btnSettings')?.click();box.append(settings);
        const extras=document.createElement('details'),summary=document.createElement('summary');extras.className='menu-classic-extras';summary.textContent='Tiện ích Cổ Điển / Classic';extras.append(summary);for(const id of ['btnMenuStarters','btnMenuSkillTree','btnMenuHowToPlay']){const b=document.getElementById(id);if(b)extras.append(b);}box.append(extras);
        const p=RoguelikeUI.prototype,open=p.openMainMenu,close=p.closeMainMenu,update=p.updateMainMenuState,stats=p.updateStats;
        p.updateStats=function(...args){const result=stats.apply(this,args);GameNavigation.hud();return result;};
        p.openMainMenu=function(){if(this.expeditionRun)ExpeditionSession.checkpoint();open.call(this);ExpeditionSession.render();};
        p.closeMainMenu=function(){close.call(this);cards.hidden=true;ExpeditionSession.render();};
        p.updateMainMenuState=function(){update.call(this);const b=document.getElementById('btnMenuContinue');if(this.expeditionRun){b.disabled=false;b.textContent=`Tiếp tục Viễn Chinh · Act ${this.expeditionRun.act+1}`;}else if(this.isGameActive){b.disabled=false;b.textContent=`Tiếp tục Cổ Điển · Ải ${this.stage}`;}else {try{const pref=JSON.parse(localStorage.getItem('pokechess_navigation_v1'));if(pref?.mode==='expedition'&&ExpeditionStore.read(pref.profile)?.run){b.disabled=false;b.textContent='Tiếp tục Viễn Chinh';}}catch{}}};
        this.ui()?.updateMainMenuState();this.hud();
    }
};
document.addEventListener('DOMContentLoaded',()=>GameNavigation.init());
