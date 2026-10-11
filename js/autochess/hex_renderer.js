
'use strict';

class HexRenderer {
    constructor(combat, options = {}) {
        this.combat = combat;

        this.boardElement = document.querySelector(
            options.boardSelector ?? '.board'
        );

        this.sprites = new Map();
        this.selectedUnitId = null;
        this.destroyed = false;
        this.hoveredUnitId = null;
        this.tooltipEvent = null;

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
            if (this.selectedUnitId) window.HexPreparationInfo?.showCombatUnit(this.selectedUnitId);
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
        if (!this.boardElement) return;

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
        sprite.setAttribute('role', 'button');
        sprite.tabIndex = 0;
        sprite.setAttribute('aria-label', `Inspect ${this.getPokemonName(unit)}`);

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
                ? '⚔ BOSS XUẤT HIỆN'
                : '◆ MINI BOSS';

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

            case 'skill-cast':
                this.showSkill(event);
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
                    this.spawnFloatingText(sprite.element, `PHASE ${event.phase}`, 'hex-float-skill-name');
                    this.createBurst(sprite.element, 'fighter');
                }
                this.updateHP();
                break;
            }

            case 'battle-timer': {
                const label = document.getElementById('enemyName');
                const ui = window.roguelikeUI;
                if (label && ui?.hexCombat === this.combat) {
                    label.textContent = `STAGE ${ui.stage} · ${event.remainingSeconds}s`;
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

        if (this.selectedUnitId === unitId) {
            this.highlightUnitRange(unitId);
        }
    }

    playAnimation(element, className) {
        if (!element) return;

        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
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

    createElementalImpact(parent, element = 'normal') {
        if (!parent || this.destroyed) return;

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

    createElementalProjectile(fromId, toId, element = 'normal') {
        if (!this.boardElement || this.destroyed) return;

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

        projectile.style.left = `${startX}px`;
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
            this.playAnimation(
                defender.element,
                'hex-hit'
            );

            const element = event.element ?? this.getVfxElement(event.attackerId);

            const attackerUnit = this.getUnit(event.attackerId);

            if ((attackerUnit?.attackRange ?? 1) > 1) {
                this.createElementalProjectile(
                    event.attackerId,
                    event.defenderId,
                    element
                );
            }
        }

        this.updateHP();
    }

    showDamage(event) {
        const defender = this.sprites.get(event.defenderId);

        if (!defender) return;

        this.createPixelImpact(
            defender.element,
            event.source === 'skill' ? 'skill' : 'attack'
        );
        this.createElementalImpact(defender.element, event.element ?? 'normal');
        if (event.effectiveness !== undefined && event.effectiveness !== 1) {
            this.spawnFloatingText(
                defender.element,
                event.effectiveness === 0 ? 'IMMUNE' : `×${event.effectiveness}`,
                'hex-float-effectiveness'
            );
        }


        const amount = Number(event.damage) || 0;
        const absorbed = Number(event.absorbed) || 0;

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

    showSkill(event) {
        const caster = this.sprites.get(event.unitId);
        const target = this.sprites.get(event.targetId);

        const role = event.role ??
            this.getRole(this.getUnit(event.unitId));

        const skillName = event.skillName ??
            this.getSkillName(role);

        if (caster) {
            this.playAnimation(
                caster.element,
                'hex-casting'
            );

            this.spawnFloatingText(
                caster.element,
                skillName,
                'hex-float-skill-name'
            );

            this.createBurst(
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
        } else if (target) {
            const element = event.element ?? this.getVfxElement(event.unitId);

            if (
                role === 'marksman' ||
                role === 'mage'
            ) {
                this.createElementalProjectile(
                    event.unitId,
                    event.targetId,
                    element
                );
            }
        }
    }

    spawnFloatingText(parent, value, className) {
        if (!parent || this.destroyed) return;

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
        if (!parent || this.destroyed) return;

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
        if (!parent) return;

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

            const hpPercent = unit.maxHp > 0
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

            sprite.hpFill.style.width =
                `${hpPercent}%`;

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
        classTitle.textContent = 'CLASS';

        const classText = document.createElement('div');
        classText.className = 'hex-info-description';
        classText.textContent = classDescription;

        const skillTitle = document.createElement('div');
        skillTitle.className = 'hex-info-section';
        skillTitle.textContent = `SKILL — ${skillName}`;

        const skillText = document.createElement('div');
        skillText.className = 'hex-info-description';
        skillText.textContent = skillDescription;

        const hint = document.createElement('div');
        hint.className = 'hex-info-hint';
        hint.textContent =
            'Nhấp Pokémon để xem vùng tầm đánh.';

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
        const sprite = this.sprites.get(unitId);
        if (!sprite) return;

        if (this.selectedUnitId === unitId) {
            this.clearSelection();
        }

        sprite.element.classList.add('hex-dead');

        sprite.element.addEventListener(
            'animationend',
            () => sprite.element.remove(),
            { once: true }
        );

        this.sprites.delete(unitId);
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;

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

        this.boardElement?.querySelectorAll(
            ':scope > .hex-combat-unit, :scope > .hex-projectile, ' +
            ':scope > .elemental-projectile, :scope > .pixel-bullet'
        ).forEach(element => element.remove());
    }
}

window.HexRenderer = HexRenderer;
