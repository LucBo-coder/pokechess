'use strict';

// Canonical facts stay in SpeciesCatalog. These explicit conversion rules are
// Auto Chess balance rules, not the main-series damage formula.
window.SpeciesCombat={
    VERSION:1,
    tuning:Object.freeze({attackMin:.65,attackMax:1.5,defenseCenter:85,defenseWeight:.35,defenseMin:.65,defenseMax:1.25,powerCenter:90,powerMin:.6,powerMax:1.25,statusSeconds:6}),
    clamp(value,min,max){return Math.max(min,Math.min(max,value));},
    data(id){return window.SpeciesCatalog?.species[String(id)]??null;},
    move(unit){const info=unit?.speciesCombat;if(!info||unit.isBoss)return null;return SpeciesCatalog.moves[info.copiedMoveId??info.moveId]??null;},
    snapshot(ui,piece,stats){if(ui.expeditionRun?.speciesCombatVersion!==this.VERSION)return;
        const data=this.data(stats.pokemonId);if(!data)return;
        const item=ui.inventory?.find(p=>p.id===stats.sourcePiece?.invId),selected=item?.selectedSpeciesMoveId;
        stats.speciesCombat={version:this.VERSION,speciesKey:String(stats.pokemonId),stats:{...data.stats},moveId:data.skills.includes(selected)?selected:data.skills[0]};
    },
    attackRatio(unit,category){const stats=unit.speciesCombat?.stats;if(!stats)return 1;const value=category==='special'?stats.specialAttack:stats.attack;return this.clamp(value/Math.max(1,(stats.attack+stats.specialAttack)/2),this.tuning.attackMin,this.tuning.attackMax);},
    defenseRatio(unit,category){const stats=unit.speciesCombat?.stats;if(!stats)return 1;const buff=unit.statuses?.speciesDefense;const value=(category==='special'?stats.specialDefense:stats.defense)*((buff?.category===category||buff?.category==='both')?1.3:1);return this.clamp(1/(1+this.tuning.defenseWeight*(value/this.tuning.defenseCenter-1)),this.tuning.defenseMin,this.tuning.defenseMax);},
    scaleDamage(attacker,defender,amount,source,options){if(!attacker.speciesCombat||!['attack','skill'].includes(source)||options.damageType==='true')return amount;const category=options.damageCategory??'physical';return amount*this.attackRatio(attacker,category)*this.defenseRatio(defender,category);},
    castRole(unit,fallback){const move=this.move(unit);if(!move||move.category==='status')return fallback;return [6,11].includes(move.targetId)?'mage':fallback==='tank'||fallback==='mage'?'fighter':fallback;},
    skill(unit,role){const move=this.move(unit);if(!move||move.category==='status')return null;const base=HexSkillInfo[unit.combatRole]??HexSkillInfo[role];const multiplier=(base?.damageMultiplier??1.4)*this.clamp(move.power/this.tuning.powerCenter,this.tuning.powerMin,this.tuning.powerMax);return {...base,canonicalMove:move,skillName:move.name,element:move.type,damageCategory:move.category,damageMultiplier:multiplier,targetMode:role==='mage'?'enemy-area':'enemy',effects:[{kind:'damage',multiplier,...(role==='mage'?{radius:1,maxTargets:3}:{})}]};},
    options(unit,source){if(!unit.speciesCombat)return null;const move=source==='skill'?this.move(unit):null;return {element:move?.type??'active',damageType:'elemental',damageCategory:move?.category??(unit.isBoss&&source==='skill'&&unit.bossPhase>=2&&unit.bossSkills?.includes('areaBlast')?'special':'physical'),moveId:move?.id??null};},
    castStatus(combat,unit,target){const move=this.move(unit);if(move?.category!=='status')return false;const seconds=this.tuning.statusSeconds;
        switch(move.slug){
            case 'harden':case 'amnesia':case 'cosmic-power':unit.statuses.speciesDefense={expiresAt:combat.tickCount+seconds*combat.tickRate,category:move.slug==='cosmic-power'?'both':move.slug==='amnesia'?'special':'physical'};combat.emit({type:'status',unitId:unit.id,status:'speciesDefense',duration:seconds});break;
            case 'toxic':HexEffects.dot(combat,unit,target,'poison',Math.max(1,Math.round(unit.attackDamage*.12)),seconds);break;
            case 'string-shot':{
                const previous=target.statuses.speciesSlow,base=previous?.base??target.moveCooldownTicks??combat.moveCooldownTicks;
                target.statuses.speciesSlow={expiresAt:combat.tickCount+seconds*combat.tickRate,base};target.moveCooldownTicks=Math.ceil(base*1.3);combat.emit({type:'status',unitId:target.id,status:'speciesSlow',duration:seconds});break;
            }
            case 'teleport':{
                const free=combat.hex.getNeighbors(unit.square).filter(sq=>!combat.hex.isOccupied(sq)).sort((a,b)=>combat.hex.distance(b,target.square)-combat.hex.distance(a,target.square));if(free.length)EquipmentCombat.move(combat,unit,free[0]);break;
            }
            case 'transform':case 'sketch':{
                const copy=target.speciesCombat;if(copy){unit.speciesCombat.copiedMoveId=copy.copiedMoveId??copy.moveId;if(move.slug==='transform')unit.speciesCombat.stats={...copy.stats,hp:unit.speciesCombat.stats.hp};}break;
            }
            default:throw Error(`Unsupported status move: ${move.slug}`);
        }
        unit.mana=0;unit.nextSkillTick=combat.tickCount+combat.skillCooldownTicks;unit.skillCasts=(unit.skillCasts??0)+1;
        window.HexTraits?.summon(combat,unit);
        combat.emit({type:'skill-cast',unitId:unit.id,targetId:target.id,skillName:move.name,role:unit.combatRole,element:move.type,moveId:move.id,damageCategory:'status',affectedIds:[target.id],delayTicks:0,mana:0});return true;
    },
    select(ui,item,moveId){const data=this.data(item.type);if(!ui.expeditionRun||ui.expeditionRun.speciesCombatVersion!==1||ui.phase!=='setup'||ui.expeditionRun.status!=='preparation'||!data?.skills.includes(moveId))return false;item.selectedSpeciesMoveId=moveId;ui.saveRoguelikeProgress();window.HexPreparationInfo?.refresh();return true;},
    describe(unit){const move=this.move(unit);if(!move)return null;return `${move.name} · ${t('species.'+move.category)} · ${t('type.'+move.type)}${move.power?` · Power ${move.power}`:''}`;},
    description(unit){const move=this.move(unit);if(!move)return '';const description=move.category==='status'?t('species.effect.'+move.slug):t([6,11].includes(move.targetId)?'species.area':'species.single');return `${this.describe(unit)}. ${description} ${t('species.adapted')}`;},
    mountInfo(inspector,ui,piece,unit){const data=this.data(unit?.pokemonId??piece.transformType??piece.type);if(!data)return;
        const body=inspector.panel.querySelector('.hex-inspector-body'),overview=document.createElement('section');overview.className='hex-inspector-section species-stats';overview.dataset.infoSection='overview';
        const heading=document.createElement('h3');heading.textContent=t('species.baseStats');overview.append(heading);
        const row=document.createElement('p');row.textContent=`HP ${data.stats.hp} · ATK ${data.stats.attack} · DEF ${data.stats.defense} · Sp.ATK ${data.stats.specialAttack} · Sp.DEF ${data.stats.specialDefense} · SPD ${data.stats.speed}`;overview.append(row);
        if(unit?.speciesCombat){const actual=document.createElement('p');actual.textContent=`${t('species.physical')}: ${I18n.number((unit.attackDamage??unit.damage)*this.attackRatio(unit,'physical'),{maximumFractionDigits:1})} · ${t('species.special')}: ${I18n.number((unit.attackDamage??unit.damage)*this.attackRatio(unit,'special'),{maximumFractionDigits:1})}`;overview.append(actual);}
        body.append(overview);
        const item=ui.inventory?.find(p=>p.id===(piece.invId??piece.id));if(ui.expeditionRun?.speciesCombatVersion===1&&item&&!unit?.isBoss){const section=document.createElement('section');section.className='hex-inspector-section species-skill-choices';section.dataset.infoSection='skills';const title=document.createElement('h3');title.textContent=t('species.chooseSkill');section.append(title);const source=this.data(item.type);
            for(const id of source?.skills??[]){const move=SpeciesCatalog.moves[id],button=document.createElement('button');button.type='button';button.textContent=`${id===(item.selectedSpeciesMoveId??source.skills[0])?'✓ ':''}${move.name} · ${t('species.'+move.category)} · ${t('type.'+move.type)}`;button.disabled=ui.phase!=='setup'||ui.expeditionRun.status!=='preparation';button.onclick=()=>{if(this.select(ui,item,id)){inspector.selectedId=null;inspector.showInfo(piece,inspector.selectedSquare);}};section.append(button);}body.append(section);}
        inspector.setTab(inspector.activeTab);
    }
};

const speciesBridgeStats=HexBridge.prototype.getUnitStats;
HexBridge.prototype.getUnitStats=function(...args){const stats=speciesBridgeStats.apply(this,args);SpeciesCombat.snapshot(this.ui,args[0],stats);return stats;};
const speciesStatusUpdate=HexEffects.update;
HexEffects.update=function(combat,unit){const slow=unit.statuses.speciesSlow;if(slow&&slow.expiresAt<=combat.tickCount)unit.moveCooldownTicks=slow.base;return speciesStatusUpdate.call(this,combat,unit);};
const speciesSkillDescribe=HexSkillInfo.describe;
HexSkillInfo.describe=function(role,unit,combat){const base=speciesSkillDescribe.call(this,role,unit,combat),skill=SpeciesCombat.skill(unit,SpeciesCombat.castRole(unit,role)),move=SpeciesCombat.move(unit);return move?{...base,...skill,castTime:combat?(combat.deferDamage?combat.getHitDelay(unit,'skill')/combat.tickRate:0):6/30,...(move.category==='status'?{castTime:0,damageMultiplier:0,effects:[{kind:'status',id:move.slug}]}:{}),canonicalMove:move,damageCategory:move.category,skillName:move.name,element:move.type,energyCost:unit?.maxMana??100}:base;};
