'use strict';
// One adapter over TALISMANS. Inventory and save continue to use the original string IDs.
window.EquipmentSystem = {
    definition(id){const item=TalismanSystem.get(id);if(!item)return null;
        const category=item.isSpell?'evolution':item.category==='mega'?'talisman':/gem|charcoal|mystic_water/.test(id)?'elemental':/glasses|claw|band|orb|fang|specs|belt/.test(id)?'offensive':/scarf|berry|balloon|stone|bell|button/.test(id)?'utility':'defensive';
        return {...item,category,legacyCategory:item.category,rarity:item.category==='mega'?'epic':item.price>=8?'epic':item.price>=6?'rare':'common',
            name:I18n.item(id,'name',item.name),description:I18n.item(id,'desc',item.desc),restrictions:item.targetTypes,
            modifiers:{hp:item.bonusHp??0,attack:item.bonusAtk??0,speed:item.bonusSpeed??0,reduction:item.dmgReduction??0},
            stackPolicy:'one-per-owner',caps:{crit:.75,evasion:.75,reduction:.75,shield:'maxHp',wise:4,metronome:3},
            triggers:Object.keys(item).filter(key=>key.startsWith('has')),saveMapping:item.id};
    },
    preview(ui,item,id){const placed=ui.placedPieces.find(p=>p.invId===item.id);const square=placed?.sq??-1;
        const source={...item,invId:item.id,color:'w',talismans:[...(item.talismans??[])]};
        const before=ui.getHexPieceStats(source,square);source.talismans.push(id);const after=ui.getHexPieceStats(source,square);
        return {hp:after.maxHp-before.maxHp,attack:after.damage-before.damage,speed:after.speed-before.speed};
    },
    unequip(ui,item,id){
        if(ui.phase!=='setup'||!item?.talismans?.includes(id))return false;
        item.talismans=item.talismans.filter(t=>t!==id);
        const nextId=Math.max(0,...ui.talismanInventory.map(t=>Number(t.id)||0))+1;
        ui.talismanInventory.push({id:nextId,talismanId:id,usesLeft:1,maxUses:1});
        this.sync(ui,item);return true;
    },
    sync(ui,item){for(const placed of ui.placedPieces.filter(p=>p.invId===item.id)){placed.talismans=[...item.talismans];const piece=ui.game.board[placed.sq];if(piece)piece.talismans=[...item.talismans];}
        ui.saveSetupFormation();ui.renderInventory();ui.renderBoard();ui.renderTalismans();ui.updateStats();
    },
    mount(panel,ui,item){if(!item)return;
        for(const id of item.talismans??[]){const def=this.definition(id);if(!def)continue;const row=document.createElement('div');row.className='equipment-row';
            const image=document.createElement('img');image.src=def.icon;image.alt='';const label=document.createElement('span');label.textContent=def.name+' · '+t('rarity.'+def.rarity);
            const action=document.createElement('button');action.textContent=t('equipment.unequip');action.disabled=ui.phase!=='setup';action.title=action.disabled?t('equipment.locked'):def.description;action.onclick=()=>{if(this.unequip(ui,item,id))HexPreparationInfo.showInventory(item);};row.append(image,label,action);panel.append(row);
        }
        const available=document.createElement('h4');available.textContent=t('shop.bag');panel.append(available);
        for(const entry of ui.talismanInventory){const def=this.definition(entry.talismanId);if(!def||def.isSpell)continue;
            const row=document.createElement('div');row.className='equipment-row';const text=document.createElement('span');text.textContent=def.name;
            const diff=this.preview(ui,item,entry.talismanId);const preview=document.createElement('small');preview.textContent=`${t('equipment.preview')}: HP ${diff.hp>=0?'+':''}${diff.hp} · ATK ${diff.attack>=0?'+':''}${I18n.number(diff.attack,{maximumFractionDigits:1})} · SPD ${diff.speed>=0?'+':''}${diff.speed}`;
            const action=document.createElement('button');action.textContent=t('equipment.equip');
            const max=(item.maxTalismans??3)+(MetaProgression.getExtraTalismanSlots()??0);
            action.disabled=ui.phase!=='setup'||(item.talismans??[]).length>=max||(item.talismans??[]).includes(entry.talismanId)||!TalismanSystem.isApplicable(entry.talismanId,item.type);
            action.title=def.description;action.onclick=()=>{ui.startApplyTalisman(entry);ui.applyTalismanToPiece(item);HexPreparationInfo.showInventory(item);};row.append(text,action,preview);panel.append(row);
        }
    }
};
window.PokeChessDiagnostics={
    trace(ui,item){const placed=ui.placedPieces.find(p=>p.invId===item.id),square=placed?.sq??-1;
        const piece={...item,color:'w',invId:item.id,talismans:[...(item.talismans??[])]};const base=PIECES[item.type];const effective=ui.getEffectivePieceStats(piece);const hex=ui.getHexPieceStats(piece,square);
        const unit=[...ui.hexCombat?.units.values()??[]].find(u=>u.sourcePiece?.invId===item.id);
        return {identity:{id:item.id,instanceId:item.instanceId,type:item.type},base:{hp:base.maxHp,attack:base.damage},form:item.type,
            class:HexUnitConfig.getConfig(item.type),equipment:(item.talismans??[]).map(id=>({sourceId:id,...EquipmentSystem.definition(id)?.modifiers,active:true,method:'flat before Hex scaling'})),
            astral:window.AstralModifiers?.trace(piece,ui.stage),mastery:unit?.mastery??item.individualMastery,
            levelScaling:unit?.statBreakdown?.scaling??{stage:ui.stage},synergy:effective.modifierBreakdown?.synergy,terrain:{square,attackElement:square>=0?TypeSystem.getHexAttackingType(piece,square):null},
            temporary:unit?{statuses:unit.statuses,shield:unit.shield}:effective.temporaryBonuses,final:unit?{hp:unit.maxHp,attack:unit.attackDamage,speed:unit.pokemonSpeed,mana:unit.mana}:hex};
    }
};
