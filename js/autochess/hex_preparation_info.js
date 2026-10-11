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
            '.arena-center .board-wrapper'
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

        panel.innerHTML = `
            <div class="hex-inspector-header">
                <span data-i18n="pokemon.info">${window.t ? t('pokemon.info') : 'POKÉMON INFO'}</span>
                <button type="button"
                    class="hex-inspector-close">×</button>
            </div>
            <div class="hex-inspector-body"></div>
        `;

        wrapper.insertAdjacentElement(
            'afterend',
            panel
        );

        panel.setAttribute('aria-label', 'Pokémon information');
        panel.querySelector(
            '.hex-inspector-close'
        ).addEventListener('click', () => {
            this.getUI()?.hexRenderer?.clearSelection();
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
        this.panel?.classList.remove('visible');
        this.selectedId = null;
        this.selectedUnitId = null;
        this.selectedSquare = null;
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
        if (ui.phase === 'battle' && ui.hexCombat) {
            // Resolve the selected identity, never an occupied setup square.
            const id = this.selectedUnitId ?? `hex_${this.selectedSquare}`;
            this.showCombatUnit(id);
        } else {
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
            !!ui.hexCombat;

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

        this.panel.classList.add('visible');
        window.MasterySystem?.bindInspector(this.panel,ui);
        this.panel.dataset.unitId = unit?.id ?? '';
        this.panel.dataset.square = String(square);
    },

    init() {
        if (this.initialized) return;

        this.createPanel();

        document.addEventListener(
            'pointerover',
            event => {
                const ui = this.getUI();
                if (ui?.phase === 'battle') {
                    const sprite = event.target.closest?.('.hex-combat-unit[data-unit-id]');
                    if (sprite && !ui.hexRenderer?.selectedUnitId) {
                        this.showCombatUnit(sprite.dataset.unitId);
                    }
                    return;
                }
                const cell = event.target.closest?.(
                    '.board .square[data-sq]'
                );

                if (!cell) return;

                const square = Number(cell.dataset.sq);
                const piece = this.getUI()?.game?.board?.[square];

                if (!piece) return;

                this.showInfo(piece, square);
            },
            true
        );

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
