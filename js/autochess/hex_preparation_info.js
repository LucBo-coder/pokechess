'use strict';

window.HexPreparationInfo = {
    initialized: false,
    panel: null,
    selectedId: null,
    selectedUnitId: null,
    selectedSquare: null,

    getUI() {
        return window.roguelikeUI;
    },

    escapeHTML(value) {
        return String(value ?? '').replace(
            /[&<>"']/g,
            char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[char]
        );
    },

    createPanel() {
        document.getElementById(
            'hex-pokemon-inspector'
        )?.remove();

        const wrapper = document.querySelector(
            '#app'
        );

        if (!wrapper) {
            console.warn(
                'Không tìm thấy board-wrapper'
            );
            return;
        }

        const panel = document.createElement('aside');

        panel.id = 'hex-pokemon-inspector';
        panel.className = 'hex-pokemon-inspector';
        panel.setAttribute('role', 'region'); panel.tabIndex = -1;
        this.activeTab = 'overview';

        panel.innerHTML = `
            <div class="hex-inspector-header">
                <span data-i18n="pokemon.info">${window.t ? t('pokemon.info') : 'POKÉMON INFO'}</span>
                <button type="button"
                    class="hex-inspector-close" data-i18n="shop.backRecruit">${t('shop.backRecruit')}</button>
            </div>
            <nav class="inspector-tabs" aria-label="${t('pokemon.info')}">
                ${['overview','skills','equipment','passive'].map(tab => `<button type="button" data-info-tab="${tab}" aria-pressed="${tab === 'overview'}">${t('info.' + tab)}</button>`).join('')}
            </nav>
            <div class="hex-inspector-body"></div>
        `;

        wrapper.appendChild(panel);

        panel.setAttribute('aria-label', t('pokemon.info'));
        panel.querySelector('.hex-inspector-close').textContent = t('menu.close');
        panel.querySelector('.hex-inspector-close').dataset.i18n = 'menu.close';
        panel.querySelectorAll('[data-info-tab]').forEach(button => button.addEventListener('click', () => this.setTab(button.dataset.infoTab)));
        panel.querySelector(
            '.hex-inspector-close'
        ).addEventListener('click', () => {
            this.hide();
        });

        this.panel = panel;
    },

    getCombatUnit(square) {
        const ui = this.getUI();
        const units = ui?.hexCombat?.units;

        if (!units) return null;

        return ui.hexCombat.getUnitAt(square);
    },

    hide() {
        const wasVisible = this.panel?.classList.contains('visible');
        this.panel?.classList.remove('visible');
        this.selectedId = null;
        this.selectedUnitId = null;
        this.selectedSquare = null;
        this.selectedInventoryId = null;
        if (wasVisible && this.panel?.contains(document.activeElement)) this.returnFocus?.focus();
    },

    setTab(tab) {
        this.activeTab = tab;
        this.panel?.querySelectorAll('[data-info-tab]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.infoTab === tab));
            button.textContent = t('info.' + button.dataset.infoTab);
        });
        this.panel?.querySelectorAll('[data-info-section]').forEach(section => section.hidden = section.dataset.infoSection !== tab);
    },

    showInventory(item) {
        const ui = this.getUI(); if (!item || !ui) return;
        const placed = ui.placedPieces.find(p => p.invId === item.id);
        if (ui.phase === 'battle' && placed) { this.showCombatUnit(`hex_${placed.sq}`, true); return; }
        this.showInfo(placed ? ui.game.board[placed.sq] : {...item, invId:item.id, color:'w'}, placed?.sq ?? -1);
        this.selectedInventoryId = item.id; this.reveal();
    },

    showCombatUnit(unitId, reveal = false) {
        const unit = this.getUI()?.hexCombat?.units.get(unitId);
        if (!unit || unit.hp <= 0) {
            if (this.selectedUnitId === unitId) this.hide();
            return;
        }
        this.showInfo(unit.sourcePiece ?? unit, unit.square, unit);
        if (reveal) this.reveal();
    },

    reveal() {
        this.returnFocus = document.activeElement;
        this.panel?.focus({preventScroll:true});
        const view = this.panel?.closest('.board-view');
        if (!view) return;
        const viewRect = view.getBoundingClientRect();
        const panelRect = this.panel.getBoundingClientRect();
        const scale = viewRect.height / view.offsetHeight || 1;
        if (panelRect.bottom > viewRect.bottom) {
            // Scroll only the arena, keeping the surrounding panels still.
            view.scrollTo({ top: view.scrollTop + (panelRect.bottom - viewRect.bottom) / scale + 4, behavior: 'smooth' });
        }
    },

    refresh() {
        if (!this.panel?.classList.contains('visible')) return;
        const ui = this.getUI();
        if (!ui) return;
        if(ui.phase==='battle' && this.selectedInventoryId != null && !this.selectedUnitId) {
            const item=ui.inventory.find(i=>i.id===this.selectedInventoryId);
            if(item)this.showInfo({...item,invId:item.id,color:'w'},-1);else this.hide();
            return;
        }
        if (ui.phase === 'battle' && ui.hexCombat) {
            // Resolve the selected identity, never an occupied setup square.
            const id = this.selectedUnitId ?? `hex_${this.selectedSquare}`;
            this.showCombatUnit(id);
        } else {
            if (this.selectedInventoryId != null) {
                const item = ui.inventory.find(i => i.id === this.selectedInventoryId);
                if (item) { const placed = ui.placedPieces.find(p => p.invId === item.id); this.showInfo(placed ? ui.game.board[placed.sq] : {...item,invId:item.id,color:'w'},placed?.sq ?? -1); }
                else this.hide();
                return;
            }
            const piece = ui.game?.board?.[this.selectedSquare];
            if (piece) this.showInfo(piece, this.selectedSquare);
            else this.hide();
        }
    },

    showInfo(piece, square, combatUnit = null) {
        const ui = this.getUI();

        if (!piece || !ui || !this.panel) return;

        const data = window.HexPokemonInfo?.get(
            String(combatUnit?.pokemonId ?? piece.transformType ?? piece.type)
        );

        if (!data) return;

        const combatActive =
            ui.phase === 'battle' &&
            !!ui.hexCombat && square >= 0;

        const unit = combatActive
            ? combatUnit ?? this.getCombatUnit(square)
            : null;

        const predicted = !combatActive
            ? HexPokemonInfo.getBattleStats(
                piece,
                square,
                ui
            )
            : null;

        // Không hiển thị chỉ số gốc giả làm
        // chỉ số chiến đấu khi chưa tìm thấy unit.
        if (combatActive && !unit) return;
        const actualRole=unit?.combatRole??predicted?.combatRole??data.role;
        if(actualRole!==data.role) {
            data.className=t(`role.${actualRole}`);
            data.classDescription=t(`role.${actualRole}.description`);
            data.skillName=t(`skill.${actualRole}.name`);
            data.skillDescription=window.HexSkillInfo?.getDescription(actualRole)??'';
        }

        const maxHp = unit
            ? unit.maxHp
            : predicted?.maxHp;

        const hp = unit
            ? unit.hp
            : predicted?.hp ?? maxHp;

        const damage = unit
            ? unit.attackDamage
            : predicted?.damage;

        const speed = unit
            ? unit.pokemonSpeed
            : predicted?.speed;

        const attackSpeed = unit
            ? unit.attackSpeed
            : predicted?.attackSpeed;

        const range = unit
            ? unit.attackRange
            : predicted?.attackRange ?? data.attackRange;

        const mana = unit
            ? `${Math.round(unit.mana ?? 0)}/${unit.maxMana ?? data.maxMana}`
            : `${predicted?.mana ?? 30}/${predicted?.maxMana ?? data.maxMana}`;

        const isBoss = unit
            ? !!unit.isBoss
            : !!predicted?.isBoss;

        const e = value => this.escapeHTML(value);

        const stat = (label, value) => `
            <div class="hex-inspector-stat">
                <small>${e(label)}</small>
                <strong>${e(value ?? '—')}</strong>
            </div>
        `;

        const elements = unit ?? predicted ?? data;
        const elementText = [
            elements.element,
            elements.element2
        ].filter(Boolean).map(id=>window.t ? t(`type.${id}`,{defaultValue:id}) : id).join(' / ');
        const activeElement = typeof TypeSystem !== 'undefined'
            ? TypeSystem.getHexAttackingType(unit ?? { ...piece }, square)
            : elements.element;

        const bossType = unit?.bossType ?? predicted?.bossType;
        const bossLabel = isBoss
            ? `${bossType === 'miniBoss' ? '◆ ' + t('combat.miniBoss') : '♛ ' + t('combat.boss')}${unit ? ' · ' + t('combat.phase',{phase:unit.bossPhase}) : ''}`
            : '';
        const shield = Math.round(unit?.shield ?? 0);
        const movementSpeed = (ui.hexCombat?.tickRate ?? 30) / (unit?.moveCooldownTicks ?? predicted?.moveCooldownTicks ?? ui.hexCombat?.moveCooldownTicks ?? 15);
        const eliteType = unit?.eliteType ?? predicted?.eliteType;
        const hasBlast = (unit?.bossSkills ?? predicted?.bossSkills ?? []).includes('areaBlast');
        const skillName = isBoss ? t(unit?.bossPhase >= 2 && hasBlast ? 'skill.boss.blast' : 'skill.boss.strike') : data.skillName;
        const skillDescription = isBoss ? `${t('skill.boss.description')} ${hasBlast ? t('skill.boss.area') : ''}` : data.skillDescription;
        const traitDescription = (unit?.traits ?? predicted?.traits ?? []).map(id => t(`trait.${id}.description`,{defaultValue:window.HexTraits?.CONFIG[id]?.description??id})).join(' ');
        const traits = (unit?.traits ?? predicted?.traits ?? []).map(id => t(`trait.${id}`,{defaultValue:id})).join(', ') || t('pokemon.none');
        const statuses = Object.entries(unit?.statuses ?? {}).map(([id,status]) => `${t(`status.${id}`,{defaultValue:t(`trait.${id}`,{defaultValue:status.name})})} (${I18n.number(Math.max(0, (status.expiresAt - (ui.hexCombat?.tickCount ?? 0)) / 30),{maximumFractionDigits:1})}s)`).join(', ') || t('pokemon.none');
        this.selectedUnitId = unit?.id ?? null;
        this.selectedSquare = square;

        const signature = [
            window.I18n?.language,
            square,
            combatActive,
            hp,
            maxHp,
            damage,
            mana,
            attackSpeed,
            speed,
            range,
            data.id,
            elementText,
            activeElement,
            bossLabel,
            shield, movementSpeed, traits, statuses, eliteType, skillName,
            ui.masteryProfile?.species?.[piece.type]?.xp,
            JSON.stringify(ui.inventory?.find(item=>item.id===piece.invId)?.individualMastery??null)
        ].join('|');

        if (
            signature === this.selectedId &&
            this.panel.classList.contains('visible')
        ) return;

        this.selectedId = signature;

        const expanded = [...this.panel.querySelectorAll('details')].map(detail => detail.open);
        this.panel.querySelector(
            '.hex-inspector-body'
        ).innerHTML = `
            <div class="hex-inspector-name">
                ${e(data.name)}
                ${e(bossLabel)}
            </div>

            <div class="hex-inspector-subtitle">
                #${e(data.id)} ·
                ${e(t(`rarity.${data.rarity}`,{defaultValue:data.rarity}))} ·
                ${e(elementText)} · ${e(t('pokemon.attack'))}: ${e(t(`type.${activeElement}`,{defaultValue:activeElement}))}
            </div>

            <div class="hex-inspector-class">
                ${e(data.className)}
                <span>
                    ${e(t(combatActive ? 'combat.battle' : 'combat.setup'))}
                    · ${e(range)} HEX
                </span>
            </div>

            <div class="hex-inspector-stats">
                ${stat('HP', `${Math.round(hp)}/${Math.round(maxHp)}`)}
                ${stat(t('pokemon.attack'), damage)}
                ${stat(t('pokemon.speed'), speed)}
                ${stat(t('pokemon.attackSpeed'), I18n.number(attackSpeed,{minimumFractionDigits:2,maximumFractionDigits:2}))}
                ${stat(t('pokemon.mana'), mana)}
                ${stat(t('pokemon.range'), range)}
            </div>

            <div class="hex-inspector-shield">${e(t('combat.shield'))} ${e(shield)}</div>
            <div class="hex-inspector-shield">${e(t('pokemon.move'))} ${e(I18n.number(movementSpeed,{maximumFractionDigits:2}))} HEX/s ${eliteType ? '· '+e(t('combat.elite'))+' '+ e(eliteType) : ''}</div>

            <details class="hex-inspector-section">
                <summary class="hex-inspector-title">${e(t('pokemon.role'))}</summary>
                <strong>${e(data.className)}</strong>
                <p>${e(data.classDescription)}</p>
            </details>

            <details class="hex-inspector-section">
                <summary class="hex-inspector-title">${e(t('pokemon.skill'))} · ${e(skillName)}</summary>
                <strong>${e(skillName)}</strong>
                <p>${e(skillDescription)}</p>
            </details>
            <details class="hex-inspector-section">
                <summary class="hex-inspector-title">${e(t('pokemon.traits'))}</summary>
                <p>${e(traits)}</p><p>${e(traitDescription)}</p><p>${e(statuses)}</p>
            </details>
            ${window.MasterySystem?.inspector(ui,piece,square)??''}
        `;
        this.panel.querySelectorAll('details').forEach((detail, index) => {
            detail.open = expanded[index] ?? false;
        });
        const body = this.panel.querySelector('.hex-inspector-body');
        [...body.children].forEach(node => node.dataset.infoSection = 'overview');
        const sections = body.querySelectorAll('.hex-inspector-section');
        if (sections[1]) { sections[1].dataset.infoSection = 'skills'; sections[1].open = true; }
        if (sections[2]) { sections[2].dataset.infoSection = 'passive'; sections[2].open = true; }
        if (sections[2]) for(const id of unit?.traits ?? predicted?.traits ?? []) {
            const trait=window.HexTraits?.CONFIG[id];if(!trait)continue;
            const row=document.createElement('p');row.textContent=`${t('trait.'+id,{defaultValue:id})} · ${t('skill.passive')} · ${t('skill.cooldown')}: ${trait.cooldown}s · ${t('skill.duration')}: ${trait.duration}s`;
            sections[2].append(row);
        }
        const metadata = window.HexSkillInfo?.describe(actualRole, unit ?? predicted, ui.hexCombat);
        if (metadata && sections[1]) {
            const extra = document.createElement('div'); extra.className = 'skill-metadata';
            extra.innerHTML = `<p>⚔ ${e(t('skill.basic'))}: ${e(range)} Hex · ${e(t('pokemon.attack'))} ${e(damage)}</p><p>✦ ${e(t('skill.active'))} · ${e(t(`type.${activeElement}`,{defaultValue:activeElement}))}</p><p>${e(t('pokemon.mana'))}: ${e(metadata.energyCost)} · ${e(t('skill.cooldown'))}: ${e(metadata.cooldown)}s</p><p>${e(t('pokemon.range'))}: ${e(t('skill.unlimited'))} · ${e(t('skill.windup'))}: ${e(I18n.number(metadata.castTime,{maximumFractionDigits:2}))}s</p>`;
            sections[1].append(extra);
            const status=document.createElement('p');status.className='skill-state';
            const remaining=combatActive?Math.max(0,((unit?.nextSkillTick??0)-(ui.hexCombat?.tickCount??0))/(ui.hexCombat?.tickRate??30)):0;
            status.textContent=t(!combatActive?'skill.preview':remaining>0?'skill.cooling':(unit?.mana??0)>=metadata.energyCost?'skill.ready':'skill.charging')+(remaining>0?' · '+I18n.number(remaining,{maximumFractionDigits:1})+'s':'');
            const icon=document.createElement('img');icon.src='assets/visual/combat/unit-selection-ring.png';icon.alt='';icon.className='skill-icon';extra.prepend(icon);sections[1].append(status);
            const amount=document.createElement('p');
            amount.textContent=actualRole==='tank' ? `${t('combat.shield')}: ${Math.round(maxHp*.3)}` : `${t('skill.baseDamage')}: ${I18n.number(damage*(metadata.damageMultiplier??1)*(window.HexBalance?.SKILL_DAMAGE_MULTIPLIER??.65),{maximumFractionDigits:1})}`;
            sections[1].append(amount);
        }
        const equipment = document.createElement('section'); equipment.dataset.infoSection = 'equipment';
        const item = ui.inventory?.find(i => i.id === (piece.invId ?? piece.id));
        const ids = item?.talismans ?? piece.talismans ?? [];
        equipment.innerHTML = `<h3>${e(t('info.equipment'))} (${ids.length}/${(item?.maxTalismans ?? piece.maxTalismans ?? 3)+(window.MetaProgression?.getExtraTalismanSlots()??0)})</h3>`;
        if (!ids.length) equipment.append(document.createTextNode(t('pokemon.none')));
        for (const id of ids) {
            const def = window.TALISMANS?.[id]; const row = document.createElement('p');
            row.textContent = `${I18n.item(id,'name',def?.name ?? id)}: ${I18n.item(id,'desc',def?.desc ?? def?.description ?? '')}`; equipment.append(row);
        }
        window.EquipmentSystem?.mount(equipment,ui,item);
        body.append(equipment); this.setTab(this.activeTab);
        const heading = this.panel.querySelector('.hex-inspector-name');
        if (window.UnitHealthBar && heading) heading.after(UnitHealthBar.create(hp, maxHp));

        this.panel.classList.add('visible');
        window.MasterySystem?.bindInspector(this.panel,ui);
        this.panel.dataset.unitId = unit?.id ?? '';
        this.panel.dataset.square = String(square);
    },

    init() {
        if (this.initialized) return;

        this.createPanel();

        document.addEventListener('click', event => {
            const cell = event.target.closest?.('.board .square[data-sq]');
            if (!cell || this.getUI()?.phase === 'battle') return;
            const square = Number(cell.dataset.sq);
            const piece = this.getUI()?.game?.board?.[square];
            if (piece && !this.getUI()?.activeApplyingTalisman) { this.selectedInventoryId = null; this.showInfo(piece, square); this.reveal(); }
        });
        document.addEventListener('focusin', event => {
            const cell = event.target.closest?.('.board .square[data-sq]');
            if (!cell || this.getUI()?.phase === 'battle') return;
            const square = Number(cell.dataset.sq), piece = this.getUI()?.game?.board?.[square];
            if (piece) this.showInfo(piece, square);
        });

        // Cập nhật chỉ số Pokémon đang xem
        // trong trận đấu.
        setInterval(() => this.refresh(), 200);

        this.initialized = true;
        console.log('Pokémon Inspector V2 ready');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        () => HexPreparationInfo.init()
    );
} else {
    HexPreparationInfo.init();
}
