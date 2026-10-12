'use strict';

// One presentation service for existing showToast/addLog callers. Never persisted in journey saves.
window.NotificationCenter = {
    entries: [], limit: 200, recent: new Map(), sequence: 0,
    category(message) {
        if (/boss|trùm/i.test(message)) return 'boss';
        if (/evol|tiến hóa/i.test(message)) return 'evolution';
        if (/talisman|trang bị|equipp|bùa/i.test(message)) return 'equipment';
        if (/recruit|bought|sold|reroll|tuyển|mua|bán|làm mới/i.test(message)) return 'recruit';
        if (/battle|combat|chiến đấu|trận/i.test(message)) return 'combat';
        return 'system';
    },
    record(message, category = this.category(message), dedupe = true) {
        const text = I18n.legacy(message), key = category + ':' + text, now = Date.now();
        if (dedupe && now - (this.recent.get(key) ?? 0) < 1500) return false;
        this.recent.set(key, now);
        if (this.recent.size > this.limit) this.recent.delete(this.recent.keys().next().value);
        this.entries.push({id:++this.sequence, time:now, original:String(message), text, category});
        if (this.entries.length > this.limit) this.entries.splice(0, this.entries.length - this.limit);
        if(!document.getElementById('eventLog')?.hidden && !this.renderTimer)this.renderTimer=setTimeout(()=>{this.renderTimer=null;this.render();},100);
        return true;
    },
    render() {
        const list = document.getElementById('moveList'); if (!list) return;
        const fragment = document.createDocumentFragment();
        for (const entry of [...this.entries].reverse()) {
            const row = document.createElement('div'); row.className = 'move-entry';
            const label = document.createElement('small');
            label.textContent = `${new Date(entry.time).toLocaleTimeString(I18n.language)} · ${t('log.' + entry.category)} · #${entry.id}`;
            row.append(label,document.createTextNode(I18n.legacy(entry.original??entry.text))); fragment.append(row);
        }
        list.replaceChildren(fragment);
    },
    dismiss() {
        clearTimeout(this.timer); document.getElementById('gameToast')?.classList.add('hidden');
    },
    toast(message, type = 'warning') {
        const text = I18n.legacy(message);
        const key='toast:'+text,now=Date.now();
        if(now-(this.recent.get(key)??0)<1500)return;
        this.recent.set(key,now);this.record(message);
        this.dismiss(); const toast = document.getElementById('gameToast'); if (!toast) return;
        type = ['success','info','warning','error'].includes(type) ? type : 'success';
        toast.className = `retro-toast toast-${type}`;
        toast.setAttribute('role',type === 'error' ? 'alert' : 'status');
        document.getElementById('toastIcon').textContent = ({success:'✓',info:'ℹ',warning:'⚠',error:'!'})[type];
        document.getElementById('toastMessage').textContent = text;
        this.timer = setTimeout(() => this.dismiss(), type === 'error' || text.length > 100 ? 6500 : 4000);
    },
    open() {
        this.focus = document.activeElement; document.getElementById('eventLog').hidden = false;
        document.getElementById('closeEventLog').focus(); this.render();
    },
    close() {
        const panel = document.getElementById('eventLog'); if (!panel || panel.hidden) return;
        panel.hidden = true; this.focus?.focus();
    },
    init() {
        const toast = document.getElementById('gameToast');
        document.querySelector('.game-header').after(toast);
        toast.setAttribute('aria-live','polite'); toast.setAttribute('aria-atomic','true'); toast.removeAttribute('title');
        const close = document.createElement('button'); close.className = 'toast-close'; close.type = 'button';
        close.textContent = '×'; close.setAttribute('aria-label',t('menu.close')); close.onclick = () => this.dismiss(); toast.append(close);
        const button = document.createElement('button'); button.className = 'btn'; button.dataset.i18n = 'log.title'; button.type = 'button';
        button.onclick = () => this.open(); document.querySelector('.header-controls').append(button);
        const panel = document.createElement('section'); panel.id = 'eventLog'; panel.className = 'event-log'; panel.hidden = true;
        panel.setAttribute('role','region'); panel.setAttribute('aria-label',t('log.title'));
        panel.innerHTML = '<div class="event-log-header"><h2 data-i18n="log.title"></h2><button id="closeEventLog" class="toast-close" data-i18n="menu.close"></button></div><div id="moveList"></div>';
        document.getElementById('app').append(panel); document.getElementById('closeEventLog').onclick = () => this.close();
        I18n.updateDOM(panel); I18n.listeners.add(() => this.render());
    }
};
NotificationCenter.init();
