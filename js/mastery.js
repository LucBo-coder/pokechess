'use strict';

// Species progression belongs to a save profile; individual progression to a run.
// The separate receipt store protects already awarded XP when an older snapshot is loaded.
window.MasterySystem = {
    STORAGE_KEY: 'pokechess_mastery_profiles_v1',
    MAX_LEVEL: 30,
    MILESTONES: [5,10,15,20,25,30],
    RANKS: [{id:'novice',xp:0},{id:'trained',xp:100},{id:'veteran',xp:400},{id:'elite',xp:1000},{id:'ace',xp:2000}],
    capXP(value) { return Math.max(0, Math.min(this.threshold(30), Math.floor(Number(value) || 0))); },
    threshold(level) { return 50 * level * (level-1); },
    level(xp) { let level=1;while(level<30 && xp>=this.threshold(level+1))level++;return level; },
    rank(xp) { return this.RANKS.filter(rank=>xp>=rank.xp).at(-1)?.id ?? 'novice'; },
    readProfiles() { try { const parsed=JSON.parse(localStorage.getItem(this.STORAGE_KEY)||'{}');return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}; } catch (_) { return {}; } },
    fresh(profileId) { return {version:1,profileId,species:{},runBest:{},individuals:{},maxStage:0}; },
    speciesRecord(id,xp=0) {
        xp=this.capXP(xp);const level=this.level(xp);
        return {speciesId:String(id),xp,level,milestones:this.MILESTONES.filter(n=>level>=n),
            unlockedSpecializations:level>=5?['offense','defense']:[],unlockedSkillVariants:level>=20?['original','variant1','variant2']:level>=10?['original','variant1']:['original']};
    },
    merge(profileId, ...sources) {
        const result=this.fresh(profileId);
        for(const source of sources.filter(Boolean)) {
            result.maxStage=Math.max(result.maxStage,Number(source.maxStage)||0);
            for(const [id,row] of Object.entries(source.species??{})) {
                if(!Object.hasOwn(window.PIECES??{},id))continue;
                result.species[id]=this.speciesRecord(id,Math.max(result.species[id]?.xp??0,this.capXP(row?.xp)));
            }
            for(const [id,stage] of Object.entries(source.runBest??{}))result.runBest[id]=Math.max(result.runBest[id]??0,Math.max(0,Number(stage)||0));
            for(const [id,row] of Object.entries(source.individuals??{})) {
                const existing=result.individuals[id];
                if(!existing || (Number(row.xp)||0)>(Number(existing.xp)||0))result.individuals[id]=JSON.parse(JSON.stringify(row));
            }
        }
        return result;
    },
    ensure(ui) {
        ui.ensureRoguelikeState?.();
        if(!ui.runState)ui.runState=RoguelikeExpansion.createRun();
        if(!ui.masteryProfile) {
            const profileId=ui.currentSaveSlot?`slot:${ui.currentSaveSlot}`:`journey:${ui.runState.id}`;
            ui.masteryProfile=this.merge(profileId,this.readProfiles()[profileId]);
        }
        const seen=new Set();
        for(const item of ui.inventory??[]) {
            const expectedPrefix=`${ui.runState.id}:`;
            if(typeof item.instanceId!=='string' || !item.instanceId.startsWith(expectedPrefix) || seen.has(item.instanceId))item.instanceId=`${expectedPrefix}${item.id}`;
            seen.add(item.instanceId);
            const receipt=ui.masteryProfile.individuals[item.instanceId];
            const saved=item.individualMastery??{};
            const xp=Math.min(5000,Math.max(0,Number(saved.xp)||0,Number(receipt?.xp)||0));
            item.individualMastery={...saved,instanceId:item.instanceId,speciesId:String(item.type),xp,rank:this.rank(xp),
                selectedSpecialization:['offense','defense'].includes(saved.selectedSpecialization)?saved.selectedSpecialization:null,
                selectedSkillVariant:['original','variant1','variant2'].includes(saved.selectedSkillVariant)?saved.selectedSkillVariant:'original',
                unlockedEffects:this.RANKS.filter(rank=>xp>=rank.xp).map(rank=>rank.id),stats:{...(saved.stats??{})}};
        }
        return ui.masteryProfile;
    },
    persist(ui) {
        const profile=this.ensure(ui),profiles=this.readProfiles();
        for(const item of ui.inventory??[])profile.individuals[item.instanceId]=JSON.parse(JSON.stringify(item.individualMastery));
        profiles[profile.profileId]=this.merge(profile.profileId,profiles[profile.profileId],profile);
        ui.masteryProfile=profiles[profile.profileId];
        try {localStorage.setItem(this.STORAGE_KEY,JSON.stringify(profiles));return true;} catch (_) {return false;}
    },
    bindSlot(ui,slot) {
        const current=this.ensure(ui),profileId=`slot:${slot}`;
        ui.masteryProfile=this.merge(profileId,this.readProfiles()[profileId],current);
        this.persist(ui);
        return JSON.parse(JSON.stringify(ui.masteryProfile));
    },
    restore(ui,saved,slot) {
        const profileId=slot?`slot:${slot}`:saved.masteryProfile?.profileId??`journey:${ui.runState.id}`;
        if(!saved.runState?.id && slot)ui.runState.id=`legacy:${slot}:${saved.timeEpoch??saved.timestamp??saved.stage??1}`;
        ui.masteryProfile=this.merge(profileId,this.readProfiles()[profileId],saved.masteryProfile);
        this.ensure(ui);
    },
    snapshot(ui,piece,square) {
        if(piece.color!=='w')return null;
        const invId=piece.invId??ui.placedPieces?.find(p=>p.sq===square)?.invId;
        const item=ui.inventory?.find(item=>item.id===invId);
        if(!item?.individualMastery)return null;
        const species=this.speciesRecord(item.type,ui.masteryProfile?.species?.[item.type]?.xp??0);
        const individual=item.individualMastery;
        return {instanceId:item.instanceId,speciesId:String(item.type),speciesLevel:species.level,rank:individual.rank,
            specialization:species.level>=5&&individual.xp>=100?individual.selectedSpecialization:null,
            skillVariant:species.unlockedSkillVariants.includes(individual.selectedSkillVariant)?individual.selectedSkillVariant:'original',
            advancedTrait:species.level>=15&&['guardian','vampiric'].includes(individual.advancedTrait)?individual.advancedTrait:null};
    },
    select(ui,instanceId,specialization,variant='original',advancedTrait=null) {
        if(ui.phase!=='setup')return false;
        this.ensure(ui);const item=ui.inventory.find(item=>item.instanceId===instanceId);
        if(!item)return false;
        const species=this.speciesRecord(item.type,ui.masteryProfile.species[item.type]?.xp??0);
        if(!species.unlockedSpecializations.includes(specialization)||item.individualMastery.xp<100||!species.unlockedSkillVariants.includes(variant))return false;
        item.individualMastery.selectedSpecialization=specialization;item.individualMastery.selectedSkillVariant=variant;
        item.individualMastery.advancedTrait=species.level>=15&&['guardian','vampiric'].includes(advancedTrait)?advancedTrait:null;
        this.persist(ui);ui.saveRoguelikeProgress?.();window.HexPreparationInfo?.refresh();return true;
    },
    award(ui,combat) {
        if(!combat?.battleEnded || !combat.resultVerified || combat.tickCount<1 || !['w','b','draw'].includes(combat.winner))return null;
        const profile=this.ensure(ui),runId=combat.masteryRunId,stage=combat.masteryStage;
        if(!runId || runId!==ui.runState.id || stage!==ui.stage || stage<1 || (profile.runBest[runId]??0)>=stage)return null;
        const summary=combat.getSummary(),awards=[],speciesGains={};
        const outcome=combat.winner==='w'?1:combat.winner==='draw'?0.6:0.4;
        const farmMultiplier=stage<profile.maxStage*0.5?0.25:1;
        for(const row of summary.units.filter(row=>row.color==='w'&&row.instanceId&&row.invId!=null)) {
            const item=ui.inventory.find(item=>item.instanceId===row.instanceId);
            if(!item || String(item.type)!==row.speciesId)continue;
            const time=Math.min(1,(row.aliveTicks??0)/Math.max(1,combat.tickCount));
            const contribution=Math.min(20,(row.damageDealt+row.damageTaken+row.healingDone+(row.shieldProvided??0))/Math.max(1,row.maxHp)*10);
            const xp=Math.max(1,Math.floor((12+Math.min(30,stage)*0.6+time*8+contribution)*outcome*farmMultiplier));
            item.individualMastery.xp=Math.min(5000,item.individualMastery.xp+Math.min(60,xp));
            item.individualMastery.rank=this.rank(item.individualMastery.xp);
            for(const key of ['damageDealt','damageTaken','healingDone','skillsUsed','shieldProvided','aliveTicks'])
                item.individualMastery.stats[key]=(Number(item.individualMastery.stats[key])||0)+(Number(row[key])||0);
            speciesGains[row.speciesId]=Math.max(speciesGains[row.speciesId]??0,Math.min(45,xp));
            awards.push({instanceId:item.instanceId,speciesId:row.speciesId,xp});
        }
        for(const [id,xp] of Object.entries(speciesGains))profile.species[id]=this.speciesRecord(id,(profile.species[id]?.xp??0)+xp);
        profile.runBest[runId]=stage;profile.maxStage=Math.max(profile.maxStage,stage);
        this.persist(ui);ui.saveRoguelikeProgress?.();return awards;
    },
    inspector(ui,piece,square) {
        if(piece.color!=='w')return '';
        this.ensure(ui);
        const invId=piece.invId??ui.placedPieces?.find(p=>p.sq===square)?.invId;
        const item=ui.inventory?.find(item=>item.id===invId);
        if(!item)return '';
        const individual=item.individualMastery,species=this.speciesRecord(item.type,ui.masteryProfile.species[item.type]?.xp??0);
        const next=this.MILESTONES.find(level=>level>species.level),e=I18n.escape.bind(I18n);
        const options=(values,selected)=>values.map(id=>`<option value="${e(id)}" ${id===selected?'selected':''}>${e(t(`mastery.${id}`))}</option>`).join('');
        const unlocked=species.level>=5&&individual.xp>=100,disabled=ui.phase!=='setup'||!unlocked;
        const traitOptions=['',...(species.level>=15?['guardian','vampiric']:[])].map(id=>`<option value="${id}" ${id===(individual.advancedTrait??'')?'selected':''}>${e(id?t(`trait.${id}`):t('mastery.noTrait'))}</option>`).join('');
        return `<details class="hex-inspector-section mastery-section" data-instance-id="${e(item.instanceId)}">
            <summary>${e(t('mastery.species'))} · ${e(t('mastery.level',{level:species.level}))}</summary>
            <p>${e(t('mastery.xp',{xp:I18n.number(species.xp),next:I18n.number(this.threshold(Math.min(30,species.level+1)))}))}</p>
            <p>${e(next?t('mastery.milestone',{level:next,effect:t(`mastery.milestone${next}`)}):t('mastery.maxLevel'))}</p>
            ${species.level===30?`<strong>${e(t('mastery.title',{name:PIECES[item.type]?.name??item.type}))}</strong>`:''}
            <p>${e(t('mastery.individual'))}: ${e(t(`mastery.${individual.rank}`))} · ${e(t('mastery.xp',{xp:I18n.number(individual.xp),next:I18n.number(this.RANKS.find(rank=>rank.xp>individual.xp)?.xp??5000)}))}</p>
            <label>${e(t('mastery.specialization'))}<select class="mastery-specialization" ${disabled?'disabled':''}>
                <option value="">${e(t('pokemon.none'))}</option>${options(['offense','defense'],individual.selectedSpecialization)}</select></label>
            ${!unlocked?`<p>${e(t('mastery.locked'))}</p>`:''}
            <label>${e(t('pokemon.skill'))}<select class="mastery-variant" ${disabled?'disabled':''}>${options(species.unlockedSkillVariants,individual.selectedSkillVariant)}</select></label>
            <label>${e(t('mastery.advancedTrait'))}<select class="mastery-trait" ${disabled||species.level<15?'disabled':''}>${traitOptions}</select></label>
            ${individual.selectedSpecialization?`<p>${e(t(`mastery.${individual.selectedSpecialization}Description`))}</p>`:''}
            ${species.level>=25?`<p>${e(t('mastery.advancedDescription'))}</p>`:''}
        </details>`;
    },
    bindInspector(panel,ui) {
        const section=panel.querySelector('.mastery-section');if(!section)return;
        for(const select of section.querySelectorAll('select'))select.addEventListener('change',()=>{
            this.select(ui,section.dataset.instanceId,section.querySelector('.mastery-specialization').value,
                section.querySelector('.mastery-variant').value,section.querySelector('.mastery-trait').value);
            if(window.HexPreparationInfo)HexPreparationInfo.selectedId=null;
            window.HexPreparationInfo?.refresh();
        });
    },
    openCollection(ui) {
        this.ensure(ui);
        let modal=document.getElementById('masteryCollectionModal');
        if(!modal){modal=document.createElement('div');modal.id='masteryCollectionModal';modal.className='modal-overlay hidden';document.getElementById('app').appendChild(modal);}
        const e=I18n.escape.bind(I18n);
        modal.innerHTML=`<section class="modal-box mastery-collection-box" role="dialog" aria-modal="true" aria-label="${e(t('mastery.collection'))}"><h2>${e(t('mastery.collection'))}</h2><p>${e(t('mastery.collectionHint'))}</p><input class="mastery-search" placeholder="${e(t('mastery.search'))}"/><div class="mastery-collection-list"></div><button class="btn mastery-close">${e(t('menu.close'))}</button></section>`;
        const render=()=>{
            const query=modal.querySelector('.mastery-search').value.toLocaleLowerCase(I18n.language);
            modal.querySelector('.mastery-collection-list').innerHTML=Object.keys(PIECES).filter(id=>/^\d+$/.test(id)&&`${id} ${PIECES[id].name}`.toLocaleLowerCase(I18n.language).includes(query))
                .sort((a,b)=>(ui.masteryProfile.species[b]?.xp??0)-(ui.masteryProfile.species[a]?.xp??0)||Number(a)-Number(b))
                .map(id=>{
                    const species=this.speciesRecord(id,ui.masteryProfile.species[id]?.xp??0);
                    return `<details class="mastery-collection-entry"><summary class="mastery-collection-row"><strong>#${e(id)} ${e(PIECES[id].name)}</strong><span>${e(t('mastery.level',{level:species.level}))} · ${e(t('mastery.xp',{xp:I18n.number(species.xp),next:I18n.number(this.threshold(Math.min(30,species.level+1)))}))}</span></summary>
                        <p>${e(t('mastery.specialization'))}: ${e(species.unlockedSpecializations.map(spec=>t(`mastery.${spec}`)).join(', ')||t('pokemon.none'))}</p>
                        <p>${e(t('pokemon.skill'))}: ${e(species.unlockedSkillVariants.map(variant=>t(`mastery.${variant}`)).join(', '))}</p>
                        ${this.MILESTONES.map(level=>`<p>${species.level>=level?'✓':'🔒'} ${e(t('mastery.milestone',{level,effect:t(`mastery.milestone${level}`)}))}</p>`).join('')}
                    </details>`;
                }).join('');
        };
        modal.querySelector('.mastery-search').addEventListener('input',render);
        modal.querySelector('.mastery-close').onclick=()=>modal.classList.add('hidden');
        render();modal.classList.remove('hidden');modal.querySelector('.mastery-search').focus();
    },
    onSkill(combat,unit,targetId) {
        const mastery=unit.mastery;
        if(!mastery?.specialization || (unit.masteryNextTick??0)>combat.tickCount)return;
        unit.masteryNextTick=combat.tickCount+(mastery.skillVariant==='variant2'?10:12)*combat.tickRate;
        if(mastery.skillVariant==='variant1')combat.gainMana(unit,10);
        const allies=[...combat.units.values()].filter(ally=>ally.color===unit.color&&ally.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
        if(mastery.specialization==='defense') {
            if(mastery.speciesId==='6') {
                unit.statuses.masteryGuard={name:'masteryGuard',expiresAt:combat.tickCount+8*combat.tickRate};
            } else if(mastery.speciesId==='3' && allies[0])combat.healUnit(allies[0],unit.maxHp*0.08,false,unit);
            else {
                const protectedAllies=allies.filter(ally=>ally.id!==unit.id&&combat.hex.distance(ally.square,unit.square)<=2).slice(0,mastery.speciesLevel>=25?2:1);
                if(!protectedAllies.length)protectedAllies.push(unit);
                for(const ally of protectedAllies)combat.addShield(ally,unit.maxHp*0.1,unit,8);
            }
        } else {
            const target=combat.units.get(targetId);
            if(target && ['3','6'].includes(mastery.speciesId)) {
                const poison=mastery.speciesId==='3'||[unit.element,unit.element2].includes('poison');
                const id=poison?'poison':'burn';
                window.HexEffects?.dot(combat,unit,target,id,Math.max(1,unit.attackDamage*0.3),3);
                if(mastery.speciesId==='6'&&mastery.speciesLevel>=25) {
                    const neighbor=[...combat.units.values()].find(enemy=>enemy.id!==target.id&&enemy.color!==unit.color&&combat.hex.distance(enemy.square,target.square)<=1);
                    if(neighbor)window.HexEffects?.dot(combat,unit,neighbor,id,Math.max(1,unit.attackDamage*0.3),3);
                }
            } else unit.statuses.masteryFocus={name:'masteryFocus',expiresAt:combat.tickCount+4*combat.tickRate};
        }
    }
};

document.addEventListener('DOMContentLoaded',()=>{
    const buttons=document.querySelector('.main-menu-buttons');if(!buttons)return;
    const button=document.createElement('button');button.id='btnMasteryCollection';button.className='btn btn-menu-action';
    button.dataset.i18n='mastery.collection';button.textContent=t('mastery.collection');
    button.onclick=()=>MasterySystem.openCollection(window.roguelikeUI);buttons.appendChild(button);
    I18n.listeners.add(()=>{
        const modal=document.getElementById('masteryCollectionModal');
        if(modal&&!modal.classList.contains('hidden'))MasterySystem.openCollection(window.roguelikeUI);
    });
});
