
'use strict';

class HexRenderer {
    constructor(combat, options = {}) {
        this.combat = combat;

        this.boardElement = document.querySelector(
            options.boardSelector ?? '.board'
        );

        this.sprites = new Map();
        this.effectivenessFeedbackTicks = new Map();
        this.selectedUnitId = null;
        this.destroyed = false;
        this.retiring = new Set();
        this.textManager = window.FloatingCombatTextManager ? new FloatingCombatTextManager(this) : null;
        this.sheetVfx = window.HexVfxPlayer ? new HexVfxPlayer(this) : null;
        this.hoveredUnitId = null;
        this.tooltipEvent = null;
        this.reducedEffects = localStorage.getItem('pokechess_reduced_fx') === '1';
        let toggle = document.getElementById('hex-fx-toggle');
        if (!toggle) {
            toggle = document.createElement('button'); toggle.id = 'hex-fx-toggle'; toggle.type = 'button';
            document.querySelector('.phase-buttons')?.appendChild(toggle);
        }
        toggle.textContent = t(this.reducedEffects ? 'vfx.low' : 'vfx.full');
        toggle.onclick = () => {
            this.reducedEffects = !this.reducedEffects;
            localStorage.setItem('pokechess_reduced_fx', this.reducedEffects ? '1' : '0');
            toggle.textContent = t(this.reducedEffects ? 'vfx.low' : 'vfx.full');
        };
        this.fxToggle = toggle;
        this.onPresentationChange=()=>{if(this.destroyed)return;this.updateHP();for(const row of this.textManager?.labels.values()??[]){if(row.numeric&&!CombatPresentation.enabled('damage')||row.kind==='hex-float-skill-name'&&!CombatPresentation.enabled('skills')||row.kind==='hex-float-status'&&!CombatPresentation.enabled('status'))this.textManager.remove(row);}if(!CombatPresentation.enabled('effects'))this.sheetVfx?.destroy();};
        window.CombatPresentation?.listeners.add(this.onPresentationChange);

        this.originalOnEvent = combat.onEvent;
        this.originalOnTick = combat.onTick;

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'hex-unit-tooltip';
        this.tooltip.hidden = true;
        document.body.appendChild(this.tooltip);

        this.combat.onEvent = event => {
            if (typeof this.originalOnEvent === 'function') {
                this.originalOnEvent(event);
            }

            this.handleEvent(event);
        };

        this.combat.onTick = state => {
            if (this.destroyed) return;
            if (typeof this.originalOnTick === 'function') {
                this.originalOnTick(state);
            }

            this.updateHP();
            this.updateProjectiles();
            this.sheetVfx?.update();
            if (this.selectedUnitId && window.HexPreparationInfo?.panel?.classList.contains('visible')) window.HexPreparationInfo.showCombatUnit(this.selectedUnitId);
            if (this.hoveredUnitId && !this.tooltip.hidden) {
                this.showTooltip(this.hoveredUnitId, this.tooltipEvent);
            }
        };

        this.onBoardClick = event => {
            if (!event.target.closest('.hex-combat-unit')) {
                this.clearSelection();
            }
        };

        this.boardElement?.addEventListener(
            'click',
            this.onBoardClick
        );
    }

    getCell(square) {
        return this.boardElement?.querySelector(
            `.square[data-sq="${square}"]`
        );
    }

    allowEffect() {
        return !this.destroyed && !this.reducedEffects &&
            window.CombatPresentation?.enabled('effects')!==false &&
            !document.body.classList.contains('reduced-motion') && (this.boardElement?.querySelectorAll('.elemental-projectile,.elemental-impact,.pixel-impact,.hex-skill-burst,.hex-sheet-vfx').length ?? 0) < 80;
    }

    getCellPosition(square) {
        const cell = this.getCell(square);
        const board = this.boardElement;

        if (!cell || !board) return null;

        const boardRect = board.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();

        const scaleX =
            boardRect.width / board.offsetWidth || 1;

        const scaleY =
            boardRect.height / board.offsetHeight || 1;

        return {
            x: (
                cellRect.left - boardRect.left +
                cellRect.width / 2
            ) / scaleX,

            y: (
                cellRect.top - boardRect.top +
                cellRect.height / 2
            ) / scaleY
        };
    }

    getUnit(unitId) {
        return this.combat.units.get(unitId);
    }

    getSpritePosition(unitId) {
        const sprite = this.sprites.get(unitId)?.element;
        const board = this.boardElement;
        if (!sprite || !board) return null;
        const boardRect = board.getBoundingClientRect();
        const rect = sprite.getBoundingClientRect();
        // Use the visible sprite position during a movement transition and
        // undo the viewport scale before drawing in board coordinates.
        return {
            x: (rect.left + rect.width / 2 - boardRect.left) / (boardRect.width / board.offsetWidth || 1),
            y: (rect.top + rect.height / 2 - boardRect.top) / (boardRect.height / board.offsetHeight || 1)
        };
    }

    getRole(unit) {
        if (unit?.combatRole) {
            return unit.combatRole;
        }

        if (
            typeof HexUnitConfig !== 'undefined' &&
            typeof HexUnitConfig.getRole === 'function'
        ) {
            return HexUnitConfig.getRole(
                String(unit?.pokemonId ?? unit?.type)
            );
        }

        return 'fighter';
    }

    getPokemonName(unit) {
        const id = String(
            unit.pokemonId ?? unit.type
        );

        if (
            typeof PIECES !== 'undefined' &&
            PIECES[id]
        ) {
            return PIECES[id].name ?? id;
        }

        return id;
    }

    getSkillName(role) {
        const names = {
            tank: 'Iron Guard',
            fighter: 'Power Strike',
            assassin: 'Execution',
            mage: 'Arcane Burst',
            marksman: 'Precision Shot'
        };

        return names[role] ?? 'Special Skill';
    }

    createSprite(unit) {
        if (!this.boardElement || this.destroyed || !unit || unit.hp <= 0 || this.getUnit(unit.id) !== unit) return;

        const position = this.getCellPosition(unit.square);
        if (!position) return;

        if (this.sprites.has(unit.id)) return;

        const sprite = document.createElement('div');
        if (unit.isBoss) {
            const bossType = unit.bossType === 'boss'
                ? 'boss'
                : 'miniBoss';

            sprite.classList.add(
                'hex-boss-unit',
                bossType === 'boss'
                    ? 'hex-main-boss'
                    : 'hex-mini-boss'
            );

            sprite.dataset.bossType = bossType;

            const aura = document.createElement('div');
            aura.className = 'hex-boss-aura';

            const ring = document.createElement('div');
            ring.className = 'hex-boss-ring';

            sprite.append(aura, ring);
        }
        sprite.classList.add('hex-combat-unit');
        sprite.dataset.unitId = unit.id;
        sprite.dataset.lifecycle = 'ALIVE';
        if(unit.eliteType)sprite.dataset.elite=unit.eliteType;
        if(unit.traits?.length){
            const badge=document.createElement('div');badge.className='hex-trait-indicator';
            badge.textContent=unit.traits.map(id=>t(`trait.${id}`,{defaultValue:id})).join(' / ');
            badge.title=unit.traits.map(id=>window.HexTraits?.CONFIG[id]?.description??id).join('\n');
            sprite.appendChild(badge);
        }
        sprite.setAttribute('role', 'button');
        sprite.tabIndex = 0;
        sprite.setAttribute('aria-label', `${t('pokemon.info')} ${this.getPokemonName(unit)}`);

        const role = this.getRole(unit);
        sprite.dataset.role = role;

        const image = document.createElement('img');
        image.className = 'hex-combat-sprite';

        const pokemonId = unit.pokemonId ?? unit.type;

        if (unit.sprite) {
            image.src = unit.sprite;
        } else if (pokemonId != null) {
            image.src = typeof getPieceIconUrl === 'function'
                ? getPieceIconUrl(pokemonId)
                : `assets/pokemon/icons/${pokemonId}.png`;
        } else {
            image.style.display = 'none';
        }

        image.onerror = () => {
            console.warn(
                'Không tìm thấy sprite:',
                image.src
            );
            image.style.display = 'none';
        };

        image.alt = this.getPokemonName(unit);

        const roleBadge = document.createElement('div');
        roleBadge.className = 'hex-combat-role';
        roleBadge.textContent = ({
            tank: 'T',
            fighter: 'F',
            assassin: 'A',
            mage: 'M',
            marksman: 'R'
        })[role] ?? 'F';

        const hpWrap = document.createElement('div');
        hpWrap.className = 'hex-combat-hp';

        const hpFill = document.createElement('div');
        hpFill.className = 'hex-combat-hp-fill';
        hpWrap.appendChild(hpFill);

        const manaWrap = document.createElement('div');
        manaWrap.className = 'hex-combat-mana';

        const manaFill = document.createElement('div');
        manaFill.className = 'hex-combat-mana-fill';
        manaWrap.appendChild(manaFill);

        const shieldBar = document.createElement('div');
        shieldBar.className = 'hex-combat-shield';

        const shieldFill = document.createElement('div');
        shieldFill.className = 'hex-combat-shield-fill';
        shieldBar.appendChild(shieldFill);

        if (unit.isBoss) {
            const crown = document.createElement('div');
            crown.className = 'hex-boss-crown';
            crown.textContent =
                unit.bossType === 'boss' ? '♛' : '◆';

            sprite.appendChild(crown);
        }

        sprite.append(
            image,
            roleBadge,
            hpWrap,
            manaWrap,
            shieldBar
        );

        sprite.style.left = `${position.x}px`;
        sprite.style.top = `${position.y}px`;

        // Chi sprite moi nhan hover va click.
        sprite.addEventListener('mouseenter', event => {
            this.hoveredUnitId = unit.id;
            this.tooltipEvent = event;
            if (window.HexPreparationInfo?.panel) {
                if (!this.selectedUnitId) window.HexPreparationInfo.showCombatUnit(unit.id);
            } else {
                this.showTooltip(unit.id, event);
            }
        });

        sprite.addEventListener('mousemove', event => {
            this.tooltipEvent = event;
            this.positionTooltip(event);
        });

        sprite.addEventListener('mouseleave', () => {
            this.hoveredUnitId = null;
            this.hideTooltip();
        });

        sprite.addEventListener('click', event => {
            event.stopPropagation();
            this.selectUnit(unit.id);
        });
        sprite.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.selectUnit(unit.id);
            }
        });

        this.boardElement.appendChild(sprite);

        this.sprites.set(unit.id, {
            element: sprite,
            hpFill,
            manaFill,
            shieldFill,
            shieldBar
        });
    }

    renderInitialUnits() {
        for (const unit of this.combat.units.values()) {
            this.createSprite(unit);
        }

        this.updateHP();

        const bosses = [...this.combat.units.values()]
            .filter(unit => unit.isBoss && unit.hp > 0);

        for (const boss of bosses) {
            const sprite = this.sprites.get(boss.id);
            if (!sprite) continue;

            sprite.element.classList.add('hex-boss-spawning');

            const label = document.createElement('div');
            label.className = 'hex-boss-intro-label';

            label.textContent = boss.bossType === 'boss'
                ? '⚔ '+t('combat.arrival')
                : '◆ '+t('combat.miniBoss');

            sprite.element.appendChild(label);

            label.addEventListener(
                'animationend',
                () => label.remove(),
                { once: true }
            );
        }
    }

    handleEvent(event) {
        if (this.destroyed || !event) return;
        window.CombatPresentation?.record(this.combat,event);
        const sheetPlayed = event.type !== 'damage' ? this.sheetVfx?.event(event) : false;
        if (['battle-end','boss-phase-change'].includes(event.type)) window.NotificationCenter?.record(event.type === 'battle-end' ? t(event.winner === 'w' ? 'combat.victory' : event.winner === 'b' ? 'combat.defeat' : 'combat.draw') : t('combat.phase',{phase:event.phase}),event.type === 'battle-end' ? 'combat' : 'boss');

        switch (event.type) {
            case 'move':
                this.moveSprite(event.unitId, event.to);
                break;

            case 'attack':
                this.showAttack(event);
                break;

            case 'damage':
                this.showDamage(event);
                this.updateHP();
                break;

            case 'mana-change':
                this.updateHP();
                break;

            case 'spawn':
                if(this.getUnit(event.unitId))this.createSprite(this.getUnit(event.unitId));
                this.updateHP();
                break;

            case 'heal': {
                const sprite=this.sprites.get(event.unitId);
                if(sprite)this.spawnFloatingText(sprite.element,`+${event.amount}`,'hex-float-heal');
                this.updateHP();
                break;
            }

            case 'status': {
                const sprite=this.sprites.get(event.unitId);
                if(sprite && ['dodge','survive','laststand'].includes(event.status))this.spawnFloatingText(sprite.element,t(`status.${event.status}`,{defaultValue:t(`trait.${event.status}`,{defaultValue:event.status})}),'hex-float-status');
                this.updateHP();
                break;
            }

            case 'skill-cast':
                this.showSkill(event, sheetPlayed);
                this.updateHP();
                break;

            case 'death':
                if (window.HexPreparationInfo?.selectedUnitId === event.unitId) {
                    window.HexPreparationInfo.hide();
                }
                this.removeSprite(event.unitId);
                break;

            case 'boss-phase-change': {
                const sprite = this.sprites.get(event.unitId);
                if (sprite) {
                    sprite.element.dataset.bossPhase = String(event.phase);
                    this.spawnFloatingText(sprite.element, t('combat.phase',{phase:event.phase}), 'hex-float-skill-name');
                    if(!sheetPlayed)this.createBurst(sprite.element, 'fighter');
                }
                this.updateHP();
                break;
            }

            case 'battle-timer': {
                const label = document.getElementById('enemyName');
                const ui = window.roguelikeUI;
                if (label && ui?.hexCombat === this.combat) {
                    label.textContent = t('combat.time',{stage:ui.stage,seconds:event.remainingSeconds});
                }
                break;
            }

            case 'battle-end':
                console.log(
                    'Hex Battle Winner:',
                    event.winner
                );

                this.hideTooltip();
                this.clearSelection();

                const ui = window.roguelikeUI;

                if (
                    ui?.hexCombat === this.combat &&
                    typeof ui.finishHexBattle === 'function'
                ) {
                    ui.finishHexBattle(event.winner);
                }
                break;
        }
    }

    moveSprite(unitId, square) {
        const sprite = this.sprites.get(unitId);
        const position = this.getCellPosition(square);

        if (!sprite || !position) return;

        sprite.element.style.left = `${position.x}px`;
        sprite.element.style.top = `${position.y}px`;
        this.playAnimation(sprite.element, 'hex-moving');

        if (this.selectedUnitId === unitId) {
            this.highlightUnitRange(unitId);
        }
    }

    playAnimation(element, className) {
        if (!element) return;

        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
        element.addEventListener('animationend', () => element.classList.remove(className), { once: true });
    }
    getVfxElement(unitId) {
        const unit = this.getUnit(unitId);
        const raw = unit?.element;

        const elements = Array.isArray(raw)
            ? raw
            : String(raw ?? '').split(/[\/,\s]+/);

        const supported = [
            'fire', 'water', 'electric',
            'grass', 'ice', 'psychic',
            'ghost', 'dark', 'dragon',
            'poison', 'fairy', 'rock',
            'ground', 'steel', 'fighting',
            'flying', 'bug', 'normal'
        ];

        const element = elements
            .map(e => String(e).toLowerCase())
            .find(e => supported.includes(e));

        return element || 'normal';
    }

    localize() {
        if(this.fxToggle)this.fxToggle.textContent=t(this.reducedEffects?'vfx.low':'vfx.full');
        for(const [id,sprite] of this.sprites) {
            const unit=this.getUnit(id);if(!unit)continue;
            const badge=sprite.element.querySelector('.hex-trait-indicator');
            if(badge)badge.textContent=unit.traits.map(trait=>t(`trait.${trait}`,{defaultValue:trait})).join(' / ');
            const role=sprite.element.querySelector('.hex-combat-role');
            if(role)role.title=t(`role.${this.getRole(unit)}`);
        }
    }

    createElementalImpact(parent, element = 'normal') {
        if (!parent || !this.allowEffect()) return;

        const impact = document.createElement('div');

        impact.className =
            `elemental-impact elemental-${element}`;

        parent.appendChild(impact);

        impact.addEventListener(
            'animationend',
            () => impact.remove(),
            { once: true }
        );
    }

    createElementalProjectile(fromId, toId, element = 'normal', duration = 0.267) {
        if (!this.boardElement || !this.allowEffect()) return;

        const from = this.sprites.get(fromId);
        const to = this.sprites.get(toId);

        if (!from || !to) return;

        const start = this.getSpritePosition(fromId);
        const end = this.getSpritePosition(toId);
        if (!start || !end) return;
        const { x: startX, y: startY } = start;
        const { x: endX, y: endY } = end;

        if (![startX, startY, endX, endY].every(Number.isFinite)) {
            return;
        }

        const projectile = document.createElement('div');

        projectile.className =
            `elemental-projectile elemental-${element}`;
        projectile.dataset.attackerId = fromId;
        projectile.dataset.defenderId = toId;

        projectile.style.left = `${startX}px`;
        projectile.style.setProperty('--vfx-duration', `${duration}s`);
        projectile.style.top = `${startY}px`;

        projectile.style.setProperty(
            '--vfx-dx',
            `${endX - startX}px`
        );

        projectile.style.setProperty(
            '--vfx-dy',
            `${endY - startY}px`
        );

        this.boardElement.appendChild(projectile);

        projectile.addEventListener(
            'animationend',
            () => projectile.remove(),
            { once: true }
        );
    }

    updateProjectiles() {
        for(const projectile of this.boardElement?.querySelectorAll('.elemental-projectile')??[]){
            const from=this.getUnit(projectile.dataset.attackerId),to=this.getUnit(projectile.dataset.defenderId);
            if(!from||!to){projectile.remove();continue;}
            const end=this.getSpritePosition(to.id);
            if(end){
                projectile.style.setProperty('--vfx-dx',`${end.x-parseFloat(projectile.style.left)}px`);
                projectile.style.setProperty('--vfx-dy',`${end.y-parseFloat(projectile.style.top)}px`);
            }
        }
    }

    showAttack(event) {
        const attacker = this.sprites.get(event.attackerId);
        const defender = this.sprites.get(event.defenderId);

        if (attacker) {
            this.playAnimation(
                attacker.element,
                'hex-attacking'
            );
        }

        if (defender) {
            const element = event.element === null ? 'normal' : event.element ?? this.getVfxElement(event.attackerId);

            const attackerUnit = this.getUnit(event.attackerId);

            if ((attackerUnit?.attackRange ?? 1) > 1) {
                this.createElementalProjectile(
                    event.attackerId,
                    event.defenderId,
                    element, (event.delayTicks || 8) / this.combat.tickRate
                );
            }
        }

        this.updateHP();
    }

    showDamage(event) {
        const defender = this.sprites.get(event.defenderId);

        if (!defender) return;

        this.showEffectiveness(event, defender.element);
        const amount = Number(event.damage) || 0;
        const absorbed = Number(event.absorbed) || 0;
        // An immune target receives feedback, but no hit reaction or impact.
        if (amount <= 0 && absorbed <= 0) return;
        if (event.critical) this.spawnFloatingText(defender.element, t('combat.critPopup'), 'hex-float-effective');

        if (!this.sheetVfx?.event(event)) {
            this.createPixelImpact(defender.element,event.source === 'skill' ? 'skill' : 'attack');
            if(event.element)this.createElementalImpact(defender.element,event.element);
        }

        if (amount > 0) {
            this.spawnFloatingText(
                defender.element,
                `-${Math.round(amount)}`,
                event.source === 'skill'
                    ? 'hex-float-skill'
                    : 'hex-float-damage'
            );
        }

        if (absorbed > 0) {
            this.spawnFloatingText(
                defender.element,
                `🛡 ${Math.round(absorbed)}`,
                'hex-float-shield'
            );
        }

        this.playAnimation(
            defender.element,
            'hex-hit'
        );
    }

    showEffectiveness(event, parent) {
        const multiplier = event.effectiveness;
        if (multiplier === undefined || multiplier === 1) return;
        const tick = event.tick ?? this.combat.tickCount;
        const last = this.effectivenessFeedbackTicks.get(event.defenderId);
        if (last !== undefined && tick - last < this.combat.tickRate) return;
        this.effectivenessFeedbackTicks.set(event.defenderId, tick);
        parent.querySelectorAll('.hex-float-effectiveness').forEach(label => label.remove());
        const kind = multiplier === 0 ? 'immune' : multiplier > 1 ? 'effective' : 'resisted';
        const text = multiplier === 0 ? t('combat.immune') : `${t(multiplier > 1 ? 'combat.super' : 'combat.resist')} ×${I18n.number(multiplier)}`;
        this.spawnFloatingText(parent, text, `hex-float-effectiveness hex-float-${kind}`);
    }

    showSkill(event, sheetPlayed = false) {
        const caster = this.sprites.get(event.unitId);
        const target = this.sprites.get(event.targetId);

        const role = event.role ??
            this.getRole(this.getUnit(event.unitId));

        const casterUnit=this.getUnit(event.unitId);
        const skillName = casterUnit?.isBoss ? t(event.skillName==='Boss Area Blast'?'skill.boss.blast':'skill.boss.strike') : t(`skill.${role}.name`,{defaultValue:event.skillName??this.getSkillName(role)});

        if (caster) {
            this.playAnimation(
                caster.element,
                'hex-casting'
            );

            caster.element.querySelectorAll('.hex-float-skill-name').forEach(label => label.remove());
            this.spawnFloatingText(
                caster.element,
                skillName,
                'hex-float-skill-name'
            );

            if (!sheetPlayed) this.createBurst(
                caster.element,
                role
            );
        }

        if (role === 'tank') {
            if (caster) {
                this.playAnimation(
                    caster.element,
                    'hex-shield-active'
                );
            }
        } else if (target && !sheetPlayed) {
            const element = event.element === null ? 'normal' : event.element ?? this.getVfxElement(event.unitId);

            if (
                role === 'marksman' ||
                role === 'mage'
            ) {
                this.createElementalProjectile(
                    event.unitId,
                    event.targetId,
                    element, (event.delayTicks || 6) / this.combat.tickRate
                );
            }
        }
    }

    spawnFloatingText(parent, value, className) {
        if (!parent || this.destroyed) return;
        if(this.textManager){this.textManager.push(parent,value,className);return;}

        const isDamage =
            className === 'hex-float-damage' ||
            className === 'hex-float-skill';

        if (isDamage) {
            const oldLabels = parent.querySelectorAll(
                '.hex-float-damage, .hex-float-skill'
            );

            // Chỉ giữ tối đa một số sát thương cũ.
            if (oldLabels.length >= 1) {
                oldLabels.forEach(label => label.remove());
            }
        }

        const label = document.createElement('div');
        label.className = `hex-floating-text ${className}`;
        label.textContent = String(value);

        parent.appendChild(label);

        label.addEventListener(
            'animationend',
            () => label.remove(),
            { once: true }
        );
    }
    createPixelImpact(parent, type = 'attack') {
        if (!parent || !this.allowEffect()) return;

        const impact = document.createElement('div');
        impact.className = `pixel-impact pixel-impact-${type}`;

        parent.appendChild(impact);

        impact.addEventListener(
            'animationend',
            () => impact.remove(),
            { once: true }
        );
    }

    createBurst(parent, role) {
        if (!parent || !this.allowEffect()) return;

        const burst = document.createElement('div');

        burst.className =
            `hex-skill-burst hex-burst-${role}`;

        parent.appendChild(burst);

        burst.addEventListener(
            'animationend',
            () => burst.remove(),
            { once: true }
        );
    }

    createProjectile(fromId, toId, role) {
        if (!this.boardElement || this.destroyed) return;

        const from = this.sprites.get(fromId);
        const to = this.sprites.get(toId);

        if (!from || !to) return;

        const startX = parseFloat(from.element.style.left);
        const startY = parseFloat(from.element.style.top);
        const endX = parseFloat(to.element.style.left);
        const endY = parseFloat(to.element.style.top);

        if (![startX, startY, endX, endY].every(Number.isFinite)) {
            return;
        }

        const projectile = document.createElement('div');
        projectile.className = `pixel-bullet pixel-bullet-${role}`;

        projectile.style.left = `${startX}px`;
        projectile.style.top = `${startY}px`;

        projectile.style.setProperty('--bullet-x', `${endX - startX}px`);
        projectile.style.setProperty('--bullet-y', `${endY - startY}px`);

        this.boardElement.appendChild(projectile);

        projectile.addEventListener('animationend', () => {
            projectile.remove();
        }, { once: true });
    }

    updateHP() {
        for (const unit of this.combat.units.values()) {
            const sprite = this.sprites.get(unit.id);
            if (!sprite) continue;
            window.CombatPresentation?.indicators(this,unit,sprite);
            sprite.element.classList.toggle('hex-berserker-active',!!unit.statuses?.berserker);

            const hpPercent = Number.isFinite(unit.hp) && Number.isFinite(unit.maxHp) && unit.maxHp > 0
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        unit.hp / unit.maxHp * 100
                    )
                )
                : 0;

            const manaPercent = unit.maxMana > 0
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        (unit.mana ?? 0) /
                        unit.maxMana * 100
                    )
                )
                : 0;

            const shield = Math.max(
                0,
                Number(unit.shield) || 0
            );

            const shieldPercent = unit.maxHp > 0
                ? Math.min(
                    100,
                    shield / unit.maxHp * 100
                )
                : 0;

            sprite.hpFill.style.clipPath = `inset(0 ${100 - hpPercent}% 0 0)`;

            sprite.manaFill.style.width =
                `${manaPercent}%`;

            sprite.shieldFill.style.width =
                `${shieldPercent}%`;

            sprite.shieldBar.style.display =
                shield > 0 ? 'block' : 'none';

            sprite.element.classList.toggle(
                'hex-mana-ready',
                manaPercent >= 100
            );
            if (unit.isBoss) sprite.element.dataset.bossPhase = String(unit.bossPhase);
        }
    }

    
    showTooltip(unitId, event) {
        const unit = this.getUnit(unitId);
        if (!unit || !this.tooltip) return;

        const role = this.getRole(unit);
        const info = window.HexSkillInfo?.[role];

        const name = this.getPokemonName(unit);
        const className = info?.className ?? role;
        const range = Number(unit.attackRange ?? 1);

        const hp = Math.max(0, Math.ceil(unit.hp ?? 0));
        const maxHp = Math.ceil(unit.maxHp ?? 0);
        const mana = Math.floor(unit.mana ?? 0);
        const maxMana = unit.maxMana ?? 100;
        const shield = Math.ceil(unit.shield ?? 0);

        const damage = Math.round(unit.attackDamage ?? 0);
        const attackSpeed = Number(
            unit.attackSpeed ?? 1
        );

        const cooldown = attackSpeed > 0
            ? (1 / attackSpeed).toFixed(2)
            : '-';

        const skillName =
            info?.skillName ?? 'Chưa có kỹ năng';

        const skillDescription =
            window.HexSkillInfo?.getDescription(role) ?? info?.skillDescription ??
            'Chưa có mô tả kỹ năng cho Class này.';

        const classDescription =
            info?.classDescription ?? '';

        const pokemonId = unit.pokemonId ?? unit.type;

        this.tooltip.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'hex-info-name';
        title.textContent = name;

        const subtitle = document.createElement('div');
        subtitle.className = 'hex-info-class';
        subtitle.textContent =
            `${className} • ${info?.rangeDescription ?? ''}`;

        const stats = document.createElement('div');
        stats.className = 'hex-info-stats';

        const statLines = [
            ['Pokémon ID', pokemonId],
            ['HP', `${hp} / ${maxHp}`],
            ['Mana', `${mana} / ${maxMana}`],
            ['Lá chắn', shield],
            ['Sát thương', damage],
            ['Tốc độ đánh', `${attackSpeed.toFixed(2)} đòn/giây`],
            ['Chu kỳ đánh', `${cooldown} giây`],
            ['Tầm đánh', `${range} Hex`],
            ['Số lần dùng Skill', unit.skillCasts ?? 0]
        ];

        for (const [label, value] of statLines) {
            const row = document.createElement('div');
            row.className = 'hex-info-stat-row';

            const left = document.createElement('span');
            left.textContent = label;

            const right = document.createElement('strong');
            right.textContent = String(value);

            row.append(left, right);
            stats.appendChild(row);
        }

        const classTitle = document.createElement('div');
        classTitle.className = 'hex-info-section';
        classTitle.textContent = t('pokemon.role');

        const classText = document.createElement('div');
        classText.className = 'hex-info-description';
        classText.textContent = classDescription;

        const skillTitle = document.createElement('div');
        skillTitle.className = 'hex-info-section';
        skillTitle.textContent = `${t('pokemon.skill')} — ${skillName}`;

        const skillText = document.createElement('div');
        skillText.className = 'hex-info-description';
        skillText.textContent = skillDescription;

        const hint = document.createElement('div');
        hint.className = 'hex-info-hint';
        hint.textContent =
            t('pokemon.rangeHint');

        this.tooltip.append(
            title,
            subtitle,
            stats,
            classTitle,
            classText,
            skillTitle,
            skillText,
            hint
        );

        this.tooltip.hidden = false;
        this.positionTooltip(event);
    }
    


    positionTooltip(event) {
        if (!this.tooltip || this.tooltip.hidden) return;

        const padding = 12;

        const width = this.tooltip.offsetWidth;
        const height = this.tooltip.offsetHeight;

        let x = event.clientX + 18;
        let y = event.clientY + 18;

        if (x + width + padding > window.innerWidth) {
            x = event.clientX - width - 18;
        }

        if (y + height + padding > window.innerHeight) {
            y = event.clientY - height - 18;
        }

        this.tooltip.style.left =
            `${Math.max(padding, x)}px`;

        this.tooltip.style.top =
            `${Math.max(padding, y)}px`;
    }


    hideTooltip() {
        this.tooltip.hidden = true;
    }

    selectUnit(unitId) {
        const unit = this.getUnit(unitId);
        if (!unit) return;

        this.clearSelection();

        this.selectedUnitId = unitId;

        const sprite = this.sprites.get(unitId);
        sprite?.element.classList.add(
            'hex-unit-selected'
        );

        this.highlightUnitRange(unitId);
        window.HexPreparationInfo?.showCombatUnit(unitId, true);
    }

    highlightUnitRange(unitId) {
        const unit = this.getUnit(unitId);
        if (!unit) return;

        if (
            typeof HexView !== 'undefined' &&
            typeof HexView.highlightRange === 'function'
        ) {
            HexView.highlightRange(
                unit.square,
                unit.attackRange ?? 1,
                this.combat.hex
            );
        }
    }

    clearSelection() {
        this.selectedUnitId = null;
        window.HexPreparationInfo?.hide();

        for (const sprite of this.sprites.values()) {
            sprite.element.classList.remove(
                'hex-unit-selected'
            );
        }

        if (
            typeof HexView !== 'undefined' &&
            typeof HexView.clearRange === 'function'
        ) {
            HexView.clearRange();
        }
    }

    removeSprite(unitId) {
        this.sheetVfx?.removeUnit(unitId);
        this.textManager?.removeUnit(unitId);
        for(const projectile of this.boardElement?.querySelectorAll('.elemental-projectile')??[])
            if(projectile.dataset.attackerId===unitId||projectile.dataset.defenderId===unitId)projectile.remove();
        const sprite = this.sprites.get(unitId);
        if (!sprite) return;

        if (this.selectedUnitId === unitId) {
            this.clearSelection();
        }

        sprite.element.classList.add('hex-dead');
        sprite.element.dataset.lifecycle='FAINTING';
        sprite.element.querySelectorAll('.hex-combat-hp,.hex-combat-mana,.hex-combat-shield,.hex-status-icons,.hex-floating-text').forEach(el=>el.remove());
        const retiring={element:sprite.element,timer:null,done:false};this.retiring.add(retiring);
        const cleanup=()=>{if(retiring.done)return;retiring.done=true;clearTimeout(retiring.timer);sprite.element.dataset.lifecycle='REMOVED';sprite.element.remove();this.retiring.delete(retiring);};
        sprite.element.addEventListener('animationend',event=>{if(event.target===sprite.element && event.animationName==='hex-death')cleanup();});
        retiring.timer=setTimeout(cleanup,450);

        this.sprites.delete(unitId);
        this.effectivenessFeedbackTicks.delete(unitId);
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        window.CombatPresentation?.listeners.delete(this.onPresentationChange);
        this.textManager?.destroy();
        for(const entry of this.retiring){clearTimeout(entry.timer);entry.element.remove();}this.retiring.clear();
        this.sheetVfx?.destroy();
        if (this.fxToggle) this.fxToggle.onclick = null;

        this.combat.onEvent = this.originalOnEvent;
        this.combat.onTick = this.originalOnTick;

        this.boardElement?.removeEventListener(
            'click',
            this.onBoardClick
        );

        this.clearSelection();
        this.tooltip.remove();

        for (const sprite of this.sprites.values()) {
            sprite.element.remove();
        }

        this.sprites.clear();
        this.effectivenessFeedbackTicks.clear();

        this.boardElement?.querySelectorAll(
            ':scope > .hex-combat-unit, :scope > .hex-projectile, ' +
            ':scope > .elemental-projectile, :scope > .pixel-bullet'
        ).forEach(element => element.remove());
    }
}

window.HexRenderer = HexRenderer;
