'use strict';

// Run state is stored in the existing save slots. Choices are deterministic
// for a run/stage and are persisted before any choice can be applied.
window.RoguelikeExpansion = {
    REWARDS: { gold: 28, pokemon: 18, talisman: 16, upgrade: 16, healing: 10, reroll: 8, evolution: 5, trait: 8 },
    RARITIES: [
        { stage: 1, weights: { common: 75, rare: 25 } },
        { stage: 5, weights: { common: 45, rare: 40, epic: 15 } },
        { stage: 10, weights: { common: 25, rare: 40, epic: 30, legendary: 5 } }
    ],
    CAPS: { hp: 40, attack: 12, speed: 60 },
    EVENTS: ['merchant', 'shrine', 'wild', 'cursed', 'training', 'treasure'],
    createRun() {
        return { version: 3, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,
            seed: Math.floor(Math.random()*0x7fffffff), upgrades: {hp:0,attack:0,speed:0}, freeRerolls: 0,
            lastVictoryStage: 0, pendingReward: null, pendingEvent: null, eventStages: [], lastSummary: null };
    },
    restore(saved) {
        const defaults=this.createRun();
        if (!saved || typeof saved!=='object') return defaults;
        const state={...defaults,...JSON.parse(JSON.stringify(saved))};
        state.upgrades={...defaults.upgrades,...state.upgrades};
        for (const key of Object.keys(this.CAPS)) state.upgrades[key]=Math.max(0,Math.min(this.CAPS[key],Number(state.upgrades[key])||0));
        state.eventStages=Array.isArray(state.eventStages)?state.eventStages:[];
        state.freeRerolls=Math.max(0,Math.min(20,Number(state.freeRerolls)||0));
        return state;
    },
    random(state, stage, tag) {
        let seed=state.seed|0;
        for (const ch of `${stage}:${tag}`) seed=Math.imul(seed^ch.charCodeAt(0),16777619);
        return () => { seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296; };
    },
    pick(list, random) { return list[Math.min(list.length-1,Math.floor(random()*list.length))]; },
    displayChoice(choice,ui,eventKind=null) {
        const attribute=t(`pokemon.${choice.attribute}`,{defaultValue:choice.attribute});
        const itemName=t(`item.${choice.talisman}.name`,{defaultValue:TALISMANS[choice.talisman]?.name??choice.title});
        let title=choice.title,text=choice.text;
        switch(choice.kind) {
            case 'gold':title=t(eventKind?'event.openChest':'reward.gold');text=t('reward.goldText',{amount:choice.amount});break;
            case 'pokemon':title=eventKind?t('event.befriend'):PIECES[choice.pokemon]?.name; text=eventKind?PIECES[choice.pokemon]?.name:t('reward.pokemonText');break;
            case 'talisman':title=eventKind?t(eventKind==='merchant'?'event.buy':'event.supplies'):itemName;text=eventKind?itemName:t('reward.talismanText');break;
            case 'evolution':title=itemName;text=t('reward.evolutionText');break;
            case 'upgrade':title=eventKind?t('event.train'):t('reward.upgrade',{attribute});text=t('reward.upgradeText',{amount:choice.amount,attribute});break;
            case 'healing':title=t(eventKind?'event.restore':'reward.healing');text=t('reward.healingText',{percent:Math.round(choice.amount*100)});break;
            case 'reroll':title=t('reward.reroll');text=t('reward.rerollText');break;
            case 'trait':title=t(`trait.${choice.trait}`);text=t('reward.traitText',{name:PIECES[ui.inventory?.find(item=>item.id===choice.invId)?.type]?.name??'Pokémon'});break;
            case 'risk':title=t('event.risk');text=t('event.riskText');break;
            case 'curse':title=t('event.curse');text=t('event.curseText');break;
            case 'leave':title=t('event.leave');text=t('event.leaveText');break;
        }
        return {title,text};
    },
    weighted(entries, random) {
        let value=random()*entries.reduce((sum,e)=>sum+e[1],0);
        for (const [key,weight] of entries) { value-=weight;if(value<0)return key; }
        return entries.at(-1)[0];
    },
    roster(stage, rarity) {
        return Object.keys(PIECES).filter(id=>/^\d+$/.test(id) && PIECES[id].stage<=Math.min(3,1+Math.floor(stage/5)) &&
            (!rarity || (PIECES[id].rarity==='legend'?'legendary':PIECES[id].rarity)===rarity));
    },
    heldItems() {
        return Object.keys(TALISMANS).filter(id=>{
            const item=TALISMANS[id];
            return item.category==='held' && (item.bonusHp>0 || item.bonusAtk>0 || item.bonusSpeed>0 || item.dmgReduction>0 || item.overrideElement2);
        });
    },
    offers(ui) {
        const state=ui.ensureRoguelikeState(),random=this.random(state,ui.stage,'reward');
        const tier=this.RARITIES.filter(t=>t.stage<=ui.stage).at(-1);
        const rarity=this.weighted(Object.entries(tier.weights),random);
        const pokemon=this.pick(this.roster(ui.stage,rarity).length?this.roster(ui.stage,rarity):this.roster(ui.stage),random);
        const talisman=this.pick(this.heldItems(),random);
        const attribute=this.pick(Object.keys(this.CAPS).filter(key=>state.upgrades[key]<this.CAPS[key]),random);
        const evolution=(ui.inventory??[]).map(item=>PIECES[item.type]?.evoItem).find(id=>TALISMANS[id]);
        const traitTarget=(ui.inventory??[]).find(item=>(item.traits??[]).length<2);
        const trait=window.HexTraits ? this.pick(Object.keys(HexTraits.CONFIG).filter(id=>!traitTarget?.traits?.includes(id)),random) : null;
        const candidates=[
            {kind:'gold',title:'Gold Cache',text:`+${Math.min(20,4+ui.stage)} gold`,amount:Math.min(20,4+ui.stage),rarity:'common'},
            pokemon&&{kind:'pokemon',title:PIECES[pokemon].name,text:'Join your Bench',pokemon,rarity},
            talisman&&{kind:'talisman',title:TALISMANS[talisman].name,text:'Add held item to your bag',talisman,rarity:'rare'},
            attribute&&{kind:'upgrade',title:`Squad ${attribute.toUpperCase()}`,text:`Permanent +${attribute==='hp'?4:attribute==='speed'?5:1} ${attribute}`,attribute,amount:attribute==='hp'?4:attribute==='speed'?5:1,rarity:'rare'},
            (ui.inventory??[]).some(item=>item.wounds>0)&&{kind:'healing',title:'Pokémon Center',text:'Remove 25% wounds from every Pokémon',amount:0.25,rarity:'common'},
            state.freeRerolls<20&&{kind:'reroll',title:'Free Reroll',text:'One free Recruit roll',rarity:'common'},
            evolution&&{kind:'evolution',title:TALISMANS[evolution].name,text:'Evolution item for your squad',talisman:evolution,rarity:'epic'},
            ui.stage>=3&&traitTarget&&trait&&{kind:'trait',title:HexTraits.CONFIG[trait].name,text:`Teach ${PIECES[traitTarget.type].name} a combat trait`,trait,invId:traitTarget.id,rarity:'epic'}
        ].filter(Boolean);
        const result=[];
        while (result.length<3 && candidates.length) {
            const kind=this.weighted(candidates.map(c=>[c.kind,this.REWARDS[c.kind]]),random);
            const index=candidates.findIndex(c=>c.kind===kind),offer=candidates.splice(index,1)[0];
            result.push({...offer,id:`${state.id}:${ui.stage}:${kind}`});
        }
        return result;
    },
    event(ui, nextStage) {
        const state=ui.ensureRoguelikeState();
        if(nextStage%5===0 || state.eventStages.includes(nextStage))return null;
        const random=this.random(state,nextStage,'event');
        if(random()>0.4)return null;
        const kind=this.pick(this.EVENTS,random),pokemon=this.pick(this.roster(nextStage),random),talisman=this.pick(this.heldItems(),random);
        const choices={
            merchant:[{title:'Buy held item',text:TALISMANS[talisman]?.name,cost:5,kind:'talisman',talisman}],
            shrine:[{title:'Restore squad',text:'Remove 35% wounds',cost:4,kind:'healing',amount:0.35}],
            wild:[{title:'Befriend Pokémon',text:PIECES[pokemon]?.name,cost:3,kind:'pokemon',pokemon},
                {title:'Brave the encounter',text:'+8 gold; every Pokémon gains 10% wounds',kind:'risk',amount:8,wounds:0.1}],
            cursed:[{title:'Accept the curse',text:'+2 squad ATK; every Pokémon gains 15% wounds',kind:'curse',wounds:0.15}],
            training:[{title:'Train speed',text:'+5 permanent squad Speed',cost:5,kind:'upgrade',attribute:'speed',amount:5}],
            treasure:[{title:'Open the chest',text:`+${Math.min(15,3+nextStage)} gold`,kind:'gold',amount:Math.min(15,3+nextStage)},
                {title:'Search for supplies',text:'A held item',kind:'talisman',talisman}]
        }[kind];
        for(let i=choices.length-1;i>=0;i--){
            const choice=choices[i];
            if((choice.kind==='upgrade'&&state.upgrades[choice.attribute]>=this.CAPS[choice.attribute]) ||
                (choice.kind==='curse'&&state.upgrades.attack>=this.CAPS.attack))choices.splice(i,1);
        }
        choices.push({title:'Continue safely',text:'Leave without cost',kind:'leave'});
        return {id:`${state.id}:event:${nextStage}`,stage:nextStage,kind,choices:choices.map((choice,i)=>({...choice,id:`${state.id}:event:${nextStage}:${i}`}))};
    },
    apply(ui, choice) {
        const state=ui.ensureRoguelikeState();
        if((choice.cost??0)>ui.gold)return false;
        if(choice.kind==='trait' && !(ui.inventory??[]).some(i=>i.id===choice.invId && (i.traits??[]).length<2 && !i.traits?.includes(choice.trait)))return false;
        if(choice.kind==='upgrade' && (!Object.hasOwn(this.CAPS,choice.attribute) || state.upgrades[choice.attribute]>=this.CAPS[choice.attribute]))return false;
        if(choice.kind==='curse' && state.upgrades.attack>=this.CAPS.attack)return false;
        if(choice.kind==='pokemon' && !PIECES[choice.pokemon])return false;
        if(['talisman','evolution'].includes(choice.kind) && !TALISMANS[choice.talisman])return false;
        ui.gold-=choice.cost??0;
        switch(choice.kind) {
            case 'gold':ui.gold+=choice.amount;break;
            case 'pokemon':ui.inventory.push({id:ui.invNextId++,type:choice.pokemon,battlesFought:0,talismans:[],maxTalismans:3,traits:[],wounds:0});break;
            case 'talisman':case 'evolution': {
                const def=TALISMANS[choice.talisman];
                ui.talismanInventory.push({id:ui.talismanNextId++,talismanId:choice.talisman,usesLeft:def.maxUses,maxUses:def.maxUses});break;
            }
            case 'upgrade':state.upgrades[choice.attribute]=Math.min(this.CAPS[choice.attribute],state.upgrades[choice.attribute]+choice.amount);break;
            case 'healing':for(const item of ui.inventory)item.wounds=Math.max(0,(item.wounds??0)-choice.amount);break;
            case 'reroll':state.freeRerolls=Math.min(20,state.freeRerolls+1);break;
            case 'trait': {const item=ui.inventory.find(i=>i.id===choice.invId);item.traits=[...new Set([...(item.traits??[]),choice.trait])].slice(0,2);break;}
            case 'risk':ui.gold+=choice.amount;for(const item of ui.inventory)item.wounds=Math.min(0.5,(item.wounds??0)+choice.wounds);break;
            case 'curse':state.upgrades.attack=Math.min(this.CAPS.attack,state.upgrades.attack+2);for(const item of ui.inventory)item.wounds=Math.min(0.5,(item.wounds??0)+choice.wounds);break;
        }
        return true;
    },
    escape(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
};

Object.assign(RoguelikeUI.prototype, {
    ensureRoguelikeState() { return this.runState??(this.runState=RoguelikeExpansion.createRun()); },
    saveRoguelikeProgress() { if(this.currentSaveSlot)SaveSystem.saveToSlot(this.currentSaveSlot,this); },
    beginRoguelikeReward(totalGold) {
        const state=this.ensureRoguelikeState();
        state.lastVictoryStage=this.stage;
        state.lastSummary=this.hexCombat?.getSummary?.()??null;
        if(state.lastSummary)state.lastSummary.goldEarned=totalGold;
        if(this.hexCombat?.statistics)for(const row of this.hexCombat.statistics.values()) {
            const piece=this.game.board.slice(0,56).find(p=>p?.invId===row.invId);
            const item=this.inventory.find(i=>i.id===(row.invId??piece?.invId));
            if(item && row.color==='w')item.wounds=Math.min(0.5,Math.max(0,1-(row.hp??0)/Math.max(1,row.maxHp??1)));
        }
        state.pendingReward={stage:this.stage,choices:RoguelikeExpansion.offers(this)};
        this.phase='reward';
        this.renderCombatSummary();this.saveRoguelikeProgress();this.showRoguelikeChoices();
    },
    showRoguelikeChoices() {
        const state=this.ensureRoguelikeState(),pending=state.pendingReward??state.pendingEvent;
        if(!pending)return;
        let modal=document.getElementById('roguelikeModal');
        if(!modal){modal=document.createElement('div');modal.id='roguelikeModal';modal.className='modal-overlay hidden';document.getElementById('app').appendChild(modal);}
        const escape=RoguelikeExpansion.escape;
        const heading=state.pendingReward?t('reward.choose'):t(`event.${pending.kind}`);
        modal.innerHTML=`<section class="roguelike-choice-panel" role="dialog" aria-modal="true" aria-label="${escape(heading)}"><h2>${escape(heading)}</h2><p>${escape(t('reward.stageGold',{stage:pending.stage,gold:this.gold}))}</p><div class="roguelike-choices"></div></section>`;
        const grid=modal.querySelector('.roguelike-choices');
        for(const choice of pending.choices){
            const button=document.createElement('button');button.type='button';button.className=`roguelike-card rarity-${choice.rarity??'common'}`;
            button.dataset.choiceId=choice.id;button.disabled=(choice.cost??0)>this.gold;
            const display=RoguelikeExpansion.displayChoice(choice,this,state.pendingEvent?.kind);
            button.innerHTML=`<strong>${escape(display.title)}</strong><span>${escape(display.text)}</span>${choice.cost?`<small>${choice.cost} ${escape(t('summary.gold'))}</small>`:''}`;
            button.onclick=()=>state.pendingReward?this.claimRoguelikeReward(choice.id):this.claimRoguelikeEvent(choice.id);grid.appendChild(button);
        }
        modal.classList.remove('hidden');
        grid.querySelector('button:not(:disabled)')?.focus();
    },
    claimRoguelikeReward(id) {
        const state=this.ensureRoguelikeState(),pending=state.pendingReward;
        const choice=pending?.choices.find(c=>c.id===id);
        if(!choice || pending.stage!==this.stage || !RoguelikeExpansion.apply(this,choice))return false;
        state.pendingReward=null;
        if(state.lastSummary){state.lastSummary.reward=choice.title;state.lastSummary.rewardChoice={...choice};}
        document.getElementById('roguelikeModal')?.classList.add('hidden');
        document.getElementById('victoryModal')?.classList.remove('hidden');
        this.updateStats();this.renderInventory();this.renderTalismans();this.renderCombatSummary();this.saveRoguelikeProgress();return true;
    },
    claimRoguelikeEvent(id) {
        const state=this.ensureRoguelikeState(),pending=state.pendingEvent;
        const choice=pending?.choices.find(c=>c.id===id);
        if(!choice || !RoguelikeExpansion.apply(this,choice))return false;
        state.eventStages.push(pending.stage);state.pendingEvent=null;
        document.getElementById('roguelikeModal')?.classList.add('hidden');
        this.saveRoguelikeProgress();this.advanceRoguelikeStage();return true;
    },
    advanceRoguelikeStage() {
        const state=this.ensureRoguelikeState();
        if(state.pendingReward||state.pendingEvent){this.showRoguelikeChoices();return false;}
        if(state.lastVictoryStage!==this.stage)return false;
        const event=RoguelikeExpansion.event(this,this.stage+1);
        if(event){state.pendingEvent=event;this.saveRoguelikeProgress();this.showRoguelikeChoices();return false;}
        document.getElementById('victoryModal')?.classList.add('hidden');
        this.stage++;this.cardChoices=[];this.talismanChoices=[];this.setupNewStage();this.setPokemonTab('recruit');this.saveRoguelikeProgress();return true;
    },
    renderCombatSummary() {
        const summary=this.runState?.lastSummary,modal=document.getElementById(summary?.winner==='b'?'defeatModal':summary?.winner==='draw'?'drawModal':'victoryModal');
        if(!summary||!modal)return;
        let panel=modal.querySelector('.hex-combat-summary');
        if(!panel){panel=document.createElement('details');panel.className='hex-combat-summary';modal.querySelector('.modal-box')?.appendChild(panel);}
        const escape=RoguelikeExpansion.escape,mvp=summary.units.find(u=>u.id===summary.mvp);
        const rewardTitle=summary.rewardChoice?RoguelikeExpansion.displayChoice(summary.rewardChoice,this).title:summary.reward;
        panel.innerHTML=`<summary>${escape(t('summary.title'))} · MVP ${escape(mvp?.name??'—')}</summary><p>${escape(t(summary.winner==='w'?'combat.victory':summary.winner==='b'?'combat.defeat':'summary.draw'))} · ${I18n.number(summary.seconds,{maximumFractionDigits:1})}s · +${summary.goldEarned??0} ${escape(t('summary.gold'))} · ${escape(rewardTitle??t(summary.winner==='w'?'reward.pending':'reward.none'))}</p><div><table><thead><tr><th>Pokémon</th><th>${escape(t('summary.dealt'))}</th><th>${escape(t('summary.taken'))}</th><th>${escape(t('summary.heal'))}</th><th>${escape(t('summary.skills'))}</th></tr></thead><tbody>${summary.units.map(row=>`<tr><td>${escape(row.name)} ${row.id===summary.mvp?'★':''}</td><td>${row.damageDealt}</td><td>${row.damageTaken}</td><td>${row.healingDone}</td><td>${row.skillsUsed}</td></tr>`).join('')}</tbody></table></div>`;
    }
});
window.I18n?.listeners.add(()=>{
    const ui=window.roguelikeUI;if(!ui)return;
    if(ui.runState?.pendingReward||ui.runState?.pendingEvent)ui.showRoguelikeChoices();
    ui.renderCombatSummary();
});
