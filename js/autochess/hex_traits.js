'use strict';

window.HexTraits = {
    CONFIG: {
        berserker:{name:'Berserker',trigger:'below 50% HP',duration:8,cooldown:12,stacks:1,description:'+20% ATK for 8s when hurt.'},
        guardian:{name:'Guardian',trigger:'nearby ally below 50% HP',duration:0,cooldown:8,stacks:1,description:'Shield an adjacent wounded ally for 12% of your Max HP.'},
        vampiric:{name:'Vampiric',trigger:'damage dealt',duration:0,cooldown:1,stacks:1,description:'Heal for 15% of damage dealt, once per second.'},
        arcane:{name:'Arcane',trigger:'every second',duration:0,cooldown:1,stacks:1,description:'Recover 5 Mana each second.'},
        swift:{name:'Swift',trigger:'battle start',duration:0,cooldown:0,stacks:1,description:'+20 Speed; move 20% faster.'},
        laststand:{name:'Last Stand',trigger:'lethal damage',duration:0,cooldown:0,stacks:1,description:'Survive once per battle with 20% HP.'}
    },
    ELITES: {
        armored:{hp:1.25,attack:0.9,reduction:0.2},
        summoner:{hp:1,attack:0.9,reduction:0},
        berserker:{hp:1.1,attack:1.1,reduction:0,traits:['berserker']},
        elemental:{hp:1.1,attack:1.15,reduction:0}
    },
    CLASS_TIERS: [2,4,6],
    classSynergies(ui) {
        const groups={}, seen=new Set();
        if((ui.stage??1)<3)return groups;
        for(const deployed of ui.placedPieces??[]){
            const piece=ui.game.board[deployed.sq];
            if(!piece || piece.color!=='w' || seen.has(piece.type))continue;
            seen.add(piece.type);const role=HexUnitConfig.getRole(piece.type);groups[role]=(groups[role]??0)+1;
        }
        return Object.fromEntries(Object.entries(groups).map(([role,count])=>[role,{count,tier:this.CLASS_TIERS.filter(n=>count>=n).length}]));
    },
    classBonus(ui,piece) {
        if(piece.color!=='w')return {hp:0,attack:0,speed:0,mana:0,crit:0,reduction:0};
        const role=HexUnitConfig.getRole(piece.type),tier=this.classSynergies(ui)[role]?.tier??0;
        const diversity=this.elementDiversity(ui).tier;
        return {hp:(role==='tank'?tier*8:0)+diversity*5,attack:role==='fighter'?tier*2:0,
            speed:(role==='assassin'?tier*10:role==='marksman'?tier*8:0)+diversity*4,
            mana:role==='mage'?tier*5:0,crit:role==='assassin'?tier*0.05:0,reduction:role==='tank'?tier*0.03:0};
    },
    elementDiversity(ui) {
        const types=new Set();
        if((ui.stage??1)>=3)for(const placed of ui.placedPieces??[]){
            const piece=ui.game.board[placed.sq];
            if(piece?.color!=='w')continue;
            const elements=TypeSystem.getEffectivePieceElements({...piece});
            for(const type of [elements.element,elements.element2])if(type)types.add(type);
        }
        return {count:types.size,tier:[6,8].filter(n=>types.size>=n).length};
    },
    traitsFor(ui,piece) {
        const item=ui.inventory?.find(i=>i.id===piece.invId);
        return [...new Set([...(item?.traits??piece.traits??[]),...(this.ELITES[piece.eliteType]?.traits??[])])]
            .filter(id=>this.CONFIG[id]).slice(0,2);
    },
    eliteFor(stage, square, firstEnemySquare) {
        if(stage<3 || stage%5===0 || stage%3!==0 || square!==firstEnemySquare)return null;
        return Object.keys(this.ELITES)[Math.floor(stage/3-1)%4];
    },
    cooldown(combat,unit,id) {
        if((unit.traitCooldowns[id]??0)>combat.tickCount)return false;
        unit.traitCooldowns[id]=combat.tickCount+this.CONFIG[id].cooldown*combat.tickRate;return true;
    },
    status(combat,unit,id) {
        const config=this.CONFIG[id];
        unit.statuses[id]={name:config.name,expiresAt:combat.tickCount+config.duration*combat.tickRate};
        combat.emit({type:'status',unitId:unit.id,status:id,duration:config.duration});
    },
    refresh(unit) {
        const phase=unit.isBoss?(unit.bossPhase===3?1.5:unit.bossPhase===2?1.25:1):1;
        unit.attackDamage=Math.round(unit.bossBaseDamage*phase*(unit.statuses.berserker?1.2:1));
    },
    update(combat,unit) {
        for(const [id,status] of Object.entries(unit.statuses))if(status.expiresAt<=combat.tickCount){delete unit.statuses[id];this.refresh(unit);}
        if(unit.traits.includes('arcane') && this.cooldown(combat,unit,'arcane'))combat.gainMana(unit,5);
        if(unit.traits.includes('berserker') && unit.hp/unit.maxHp<=0.5 && this.cooldown(combat,unit,'berserker')){
            this.status(combat,unit,'berserker');this.refresh(unit);
        }
        if(unit.traits.includes('guardian')){
            const ally=[...combat.units.values()].find(other=>other.id!==unit.id && other.color===unit.color && other.hp/other.maxHp<0.5 && combat.hex.distance(unit.square,other.square)<=1);
            if(ally && this.cooldown(combat,unit,'guardian')){
                combat.addShield(ally,Math.max(0,Math.min(ally.maxHp*0.5-ally.shield,Math.round(unit.maxHp*0.12))),unit);
                combat.emit({type:'status',unitId:ally.id,status:'guardian',duration:0});
            }
        }
    },
    afterDamage(combat,attacker,defender,damage) {
        if(defender.hp<=0 && defender.traits.includes('laststand') && !defender.lastStandUsed){
            defender.lastStandUsed=true;combat.healUnit(defender,Math.round(defender.maxHp*0.2),true);
            combat.emit({type:'status',unitId:defender.id,status:'laststand',duration:0});
        }
        if(attacker.hp>0 && damage>0 && attacker.traits.includes('vampiric') && this.cooldown(combat,attacker,'vampiric'))
            combat.healUnit(attacker,Math.round(damage*0.15));
    },
    summon(combat,unit) {
        if(unit.eliteType!=='summoner' || (unit.summonsMade??0)>=2)return;
        const square=combat.hex.getNeighbors(unit.square).find(sq=>!combat.getUnitAt(sq));
        if(square===undefined)return;
        unit.summonsMade=(unit.summonsMade??0)+1;
        const id=`summon_${unit.id}_${unit.summonsMade}`;
        const success=combat.addUnit(square,{id,type:unit.type,pokemonId:unit.pokemonId,color:unit.color,
            maxHp:Math.max(1,Math.round(unit.maxHp*0.35)),attackDamage:Math.max(1,Math.round(unit.bossBaseDamage*0.6)),
            attackSpeed:unit.attackSpeed,attackRange:unit.attackRange,combatRole:unit.combatRole,talismans:[],traits:[]});
        if(success)combat.emit({type:'spawn',unitId:id});
    },
    renderSynergies(ui,container) {
        const diversity=this.elementDiversity(ui),row=document.createElement('div');
        row.className='hex-class-synergy';
        row.textContent=t('synergy.diversity',{count:diversity.count,next:diversity.count<6?6:8,hp:diversity.tier*5,speed:diversity.tier*4});
        container.appendChild(row);
        for(const [role,{count,tier}] of Object.entries(this.classSynergies(ui))){
            const row=document.createElement('div');row.className='hex-class-synergy';
            const next=this.CLASS_TIERS.find(n=>n>count)??6;
            const descriptions={tank:`+${tier*8} HP, ${tier*3}% ${t('synergy.reduction')}`,fighter:`+${tier*2} ${t('pokemon.attack')}`,assassin:`+${tier*10} ${t('pokemon.speed')}, ${tier*5}% ${t('synergy.crit')}`,mage:`+${tier*5} ${t('synergy.startMana')}`,marksman:`+${tier*8} ${t('pokemon.speed')}`};
            row.textContent=`${t('role.'+role)} ${count}/${next} · ${tier?t('synergy.tier',{tier})+' · '+descriptions[role]:t('synergy.inactive')}`;container.appendChild(row);
        }
    }
};
for(const [id,trait] of Object.entries(HexTraits.CONFIG))Object.assign(trait,{id:`trait_${id}`,nameKey:`trait.${id}`,descriptionKey:`trait.${id}.description`,category:'passive'});
