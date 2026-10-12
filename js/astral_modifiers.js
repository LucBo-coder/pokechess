'use strict';
// Canonical audit/trace wraps existing getters; no render mutates base stats.
window.AstralModifiers = {
    nodes:new Map(),
    utility:new Set(['w_gold_1','w_gold_2','w_gold_3','w_notable_1','w_slot_1','w_slot_2','w_notable_5','w_reroll_1','w_notable_3','w_notable_2','w_card_1','w_keystone','m_crit_1','m_notable_3','m_keystone','r_notable_2','r_keystone','a_keystone']),
    triggered:new Set(['fire_keystone','fire_notable_2','fairy_keystone']),
    init(){MetaProgression.buildSkillTreeGraph();
        for(const node of Object.values(MetaProgression.nodes)){
            const tree=TREE_REGISTRY[node.quad]??TREE_REGISTRY.core;
            const type=Object.keys(PIECES).find(id=>tree.isMatchingPiece?tree.isMatchingPiece({type:id}):id==='1')??'1';
            const piece={type,color:'w',starterSpeciesId:type,talismans:[]};
            const hp=tree.getBonusHp?.(piece,1,id=>id===node.id,[type])??0,attack=tree.getBonusAtk?.(piece,1,id=>id===node.id,[type])??0;
            const connector=node.type==='origin';
            const known=hp!==0||attack!==0||connector||this.utility.has(node.id)||this.triggered.has(node.id);
            // Previously disconnected modifiers become a bounded stat milestone;
            // this explicitly replaces unsupported legacy promises in the UI.
            const milestone=!known ? {hp:node.statKey==='atk'?0:4,attack:node.statKey==='atk'?1:0}:null;
            this.nodes.set(node.id,{sourceId:node.id,branch:node.quad,cost:node.id==='origin'?0:1,
                prerequisites:MetaProgression.edges.filter(e=>e.from===node.id||e.to===node.id).map(e=>e.from===node.id?e.to:e.from),
                scope:TREE_REGISTRY[node.quad]?node.quad:node.quad==='relics'?'starter':'team',
                classification:connector?'connector':this.utility.has(node.id)?'utility':this.triggered.has(node.id)?'triggered':milestone?'milestone':'passive',
                modifiers:{hp,attack},milestone,method:'flat before class-independent Hex conversion',timing:'stat calculation',
                stackGroup:node.id,stackLimit:1,expiration:'allocation lifetime',legacyDescription:node.desc});
        }
        const originalHp=MetaProgression.getBonusMaxHp.bind(MetaProgression),originalAtk=MetaProgression.getBonusDamage.bind(MetaProgression);
        MetaProgression.getBonusMaxHp=(piece,stage)=>originalHp(piece,stage)+this.extra(piece,'hp');
        MetaProgression.getBonusDamage=(piece,stage)=>originalAtk(piece,stage)+this.extra(piece,'attack');
    },
    matches(record,piece){if(piece.color!=='w')return false;
        if(record.scope==='starter')return MetaProgression.getSelectedStarters().includes(piece.starterSpeciesId??piece.type);
        return record.scope==='team'||!!TREE_REGISTRY[record.scope]?.isMatchingPiece(piece);
    },
    extra(piece,stat){let value=0;for(const id of new Set(MetaProgression.getAllocatedNodes())){const record=this.nodes.get(id);if(record?.milestone&&this.matches(record,piece))value+=record.milestone[stat]??0;}return value;},
    trace(piece,stage){const rows=[];
        for(const record of this.nodes.values()){
            const tree=TREE_REGISTRY[record.branch]??TREE_REGISTRY.core;
            const hp=tree.getBonusHp?.(piece,stage,id=>id===record.sourceId,MetaProgression.getSelectedStarters())??0;
            const attack=tree.getBonusAtk?.(piece,stage,id=>id===record.sourceId,MetaProgression.getSelectedStarters())??0;
            rows.push({...record,active:MetaProgression.hasNode(record.sourceId)&&this.matches(record,piece),applied:{hp:hp+(record.milestone?.hp??0),attack:attack+(record.milestone?.attack??0)},capped:false});
        }return rows;
    },
    description(node){const record=this.nodes.get(node.id);if(!record)return I18n.tree(node,'desc');
        if(record.classification==='connector')return t('astral.connector');
        const values=record.milestone??record.modifiers;
        let text=values.hp||values.attack?`${record.scope==='team'?t('astral.team'):record.scope==='starter'?t('astral.starter'):t('type.'+record.scope,{defaultValue:record.scope})}: +${values.hp} HP · +${values.attack} ATK (${t('astral.flat')})`:'';
        if(record.classification==='utility'||record.classification==='triggered')text+=(text?' · ':'')+I18n.tree(node,'desc');
        return text;
    }
};
AstralModifiers.init();

window.AstralRuntime={
    has(u,id){return u.color==='w'&&u.effects?.astral?.includes(id)&&(!TREE_REGISTRY[id.split('_')[0]]||HexEffects.matches(u,id.split('_')[0]));},
    ready(c,u,id,seconds=1){u.astralCooldowns??={};if((u.astralCooldowns[id]??0)>c.tickCount)return false;u.astralCooldowns[id]=c.tickCount+Math.ceil(seconds*c.tickRate);return true;},
    status(c,u,id,seconds){u.statuses[id]={expiresAt:c.tickCount+c.tickRate*seconds};c.emit({type:'status',unitId:u.id,status:id,duration:seconds});},
    update(c,u){
        if(!u.astralStarted){u.astralStarted=true;
            if(this.has(u,'psychic_notable_2'))c.addShield(u,HexEffects.flatHp(15),u,30);
            if(this.has(u,'fairy_notable_1'))c.addShield(u,HexEffects.flatHp(20),u,30);
            if(this.has(u,'a_notable_3')&&Math.floor(u.square/7)===4)c.addShield(u,HexEffects.flatHp(15),u,30);
            if(this.has(u,'a_notable_4')&&Object.keys(u.effects?.tiers??{}).length>=3)c.addShield(u,HexEffects.flatHp(10),u,30);
            if(this.has(u,'flying_notable_2'))u.attackRange+=1;
        }
        if(c.tickCount%c.tickRate)return;
        if(this.has(u,'grass_notable_2'))c.healUnit(u,u.maxHp*.04);
        if(this.has(u,'grass_keystone')){const missing=u.maxHp-u.hp,amount=u.maxHp*.1;c.healUnit(u,amount);
            const gain=Math.min(Math.max(0,amount-missing),Math.max(0,(u.astralBaseHp??=u.maxHp)*.25-(u.astralGrowth??0)));u.astralGrowth=(u.astralGrowth??0)+gain;u.maxHp+=gain;u.hp+=gain;
        }
        if(this.has(u,'fairy_keystone'))for(const ally of c.units.values())if(ally.color===u.color&&ally.hp>0)c.healUnit(ally,HexEffects.flatHp(5),false,u);
        if(this.has(u,'poison_notable_2'))for(const enemy of c.units.values())if(enemy.color!==u.color&&enemy.hp>0&&c.hex.distance(u.square,enemy.square)<=1)HexEffects.dot(c,u,enemy,'poison',HexEffects.flatHp(3),3);
        for(const id of ['smoke','frozen','paralyzed','chilled','hexed','swarm'])if((u.statuses[id]?.expiresAt??Infinity)<=c.tickCount){delete u.statuses[id];if(id==='swarm')u.swarmStacks=0;}
    },
    afterDamage(c,a,d,damage,source,options){
        if(source==='status'&&d.hp<=0&&this.has(a,'poison_keystone')&&d.statuses.poison){for(const enemy of c.units.values())if(enemy.id!==d.id&&enemy.color===d.color&&c.hex.distance(d.square,enemy.square)<=1)HexEffects.dot(c,a,enemy,'poison',d.statuses.poison.damage,3);return;}
        if(!['attack','skill'].includes(source))return;
        const hit=source==='attack'&&damage>0;
        if(hit&&a.hp>0){
            if(this.has(a,'grass_notable_1'))c.healUnit(a,HexEffects.flatHp(2));
            if(this.has(a,'ghost_keystone'))c.healUnit(a,HexEffects.flatHp(5));
            if(this.has(a,'water_keystone'))for(const ally of c.units.values())if(ally.hp>0&&ally.color===a.color&&c.hex.distance(a.square,ally.square)<=1)c.healUnit(ally,damage*.1,false,a);
            if(this.has(a,'psychic_keystone'))c.addShield(a,HexEffects.flatHp(10),a,10);
            if(this.has(a,'poison_notable_1')&&d.hp>0){d.poisonStacks=this.has(a,'poison_keystone')?Math.min(5,(d.poisonStacks??0)+1):1;HexEffects.dot(c,a,d,'poison',HexEffects.flatHp(3)*d.poisonStacks,3);}
            if(this.has(a,'electric_keystone')&&options.critical&&this.ready(c,a,'chain',1))for(const enemy of [...c.units.values()].filter(u=>u.color!==a.color&&u.id!==d.id&&c.hex.distance(d.square,u.square)<=1).slice(0,2))c.dealDamage(a,enemy,damage*.5,'astral',{element:'electric'});
            if(this.has(a,'bug_keystone')&&this.ready(c,a,'swarm',1))for(const ally of c.units.values())if(ally.color===a.color&&HexEffects.matches(ally,'bug')){ally.swarmStacks=Math.min(3,(ally.swarmStacks??0)+1);ally.statuses.swarm={expiresAt:c.tickCount+c.tickRate};}
        }
        if(d.hp>0&&damage>0){
            if(this.has(d,'electric_notable_2')&&a.hp>0&&this.ready(c,d,'paralyze',3))this.status(c,a,'paralyzed',1);
            if(this.has(d,'ice_keystone')&&a.hp>0&&this.ready(c,d,'freeze',3))this.status(c,a,'frozen',1);
            if(this.has(d,'ghost_notable_2')&&a.hp>0)this.status(c,a,'hexed',2);
            if(this.has(a,'ice_notable_2')){d.nextMoveTick=Math.max(d.nextMoveTick,c.tickCount+c.tickRate);this.status(c,d,'chilled',1);}
        }
        if(a.hp>0){let reflect=0;
            if(this.has(d,'steel_keystone')&&options.shieldBefore>0)reflect+=options.shieldAbsorbed;
            if(this.has(d,'rock_keystone'))reflect+=damage*.25;
            if(this.has(d,'bug_notable_2'))reflect+=damage*.1;
            if(this.has(d,'fighting_notable_2')&&this.ready(c,d,'counter',1))reflect+=damage*.5;
            if(reflect>0)c.dealDamage(d,a,reflect,'astral',{damageType:'true'});
        }
        if(d.hp<=0&&this.has(a,'poison_keystone')&&d.statuses.poison)for(const enemy of c.units.values())if(enemy.id!==d.id&&enemy.color===d.color&&c.hex.distance(d.square,enemy.square)<=1)HexEffects.dot(c,a,enemy,'poison',d.statuses.poison.damage,3);
    }
};
const astralOutgoing=HexEffects.outgoing.bind(HexEffects),astralIncoming=HexEffects.incoming.bind(HexEffects);
HexEffects.outgoing=function(c,a,d,damage,source,matchup){let value=astralOutgoing(c,a,d,damage,source,matchup);if(!['attack','skill'].includes(source))return value;
    if((a.statuses.hexed?.expiresAt??0)>c.tickCount)value*=.75;
    if(AstralRuntime.has(a,'dark_keystone')&&d.hp/d.maxHp<.4)value*=2;
    if(AstralRuntime.has(a,'flying_keystone')&&!a.astralFirstUsed&&source==='attack'){a.astralFirstUsed=true;value*=2;}
    if(AstralRuntime.has(a,'ice_notable_2')&&source==='attack')value+=HexEffects.flatAtk(4);
    if((a.statuses.swarm?.expiresAt??0)>c.tickCount)value+=HexEffects.flatAtk(2*Math.min(3,a.swarmStacks??0));
    return value;
};
HexEffects.incoming=function(c,d,damage,source,attacker,matchup){let value=astralIncoming(c,d,damage,source,attacker,matchup);if(!['attack','skill'].includes(source))return value;
    let chance=0;for(const [id,p]of [['water_notable_2',.1],['flying_notable_2',.15],['flying_keystone',.2],['ghost_keystone',.25],['dark_notable_2',.15]])if(AstralRuntime.has(d,id))chance+=p;
    if(chance&&c.random()<Math.min(.75,chance)){c.emit({type:'status',unitId:d.id,status:'dodge',duration:0});return 0;}
    if(AstralRuntime.has(d,'dragon_notable_2'))value*=.8;
    if(AstralRuntime.has(d,'ground_notable_2')&&source==='attack')value*=.85;
    if(AstralRuntime.has(d,'ice_keystone'))value*=.7;
    if(AstralRuntime.has(d,'steel_notable_1')||AstralRuntime.has(d,'ice_notable_1'))value=Math.max(0,value-HexEffects.flatAtk(3));
    return value;
};
// Registry reflects supported, bounded runtime contracts rather than promises
// of infinite stacking or mechanics the engine does not implement.
const astralContracts={
    grass_notable_1:['Đánh trúng hồi 2 HP quy đổi Hex.','Hits heal 2 converted HP.'],
    grass_notable_2:['Hồi 4% Max HP mỗi giây.','Heal 4% Max HP per second.'],
    water_notable_2:['10% né đòn trực tiếp.','10% direct damage dodge.'],
    poison_notable_1:['Đánh trúng gây Poison 3 HP quy đổi Hex mỗi giây trong 3 giây.','Hits apply 3 converted HP poison per second for 3 seconds.'],
    poison_notable_2:['Kẻ địch liền kề nhận Poison 3 HP quy đổi Hex mỗi giây, 3 giây.','Adjacent enemies receive 3 converted HP poison per second for 3 seconds.'],
    electric_notable_2:['Bị đánh gây tê liệt người đánh 1 giây; hồi 3 giây.','Taking damage paralyzes attacker for 1 second; 3 second cooldown.'],
    ice_notable_1:['Giảm damage trực tiếp 3 ATK quy đổi Hex.','Reduce direct damage by 3 converted ATK.'],
    ice_notable_2:['Đòn đánh +4 ATK quy đổi Hex; trì hoãn di chuyển mục tiêu 1 giây.','Attacks gain 4 converted ATK and delay target movement for 1 second.'],
    fighting_notable_2:['Phản 50% damage trực tiếp; hồi 1 giây.','Reflect 50% direct damage; 1 second cooldown.'],
    ground_notable_2:['Giảm 15% damage đòn đánh thường.','Reduce basic attack damage by 15%.'],
    flying_notable_2:['+1 tầm đánh; 15% né đòn trực tiếp.','+1 attack range; 15% direct damage dodge.'],
    psychic_notable_2:['Đầu trận nhận shield 15 HP quy đổi Hex, 30 giây.','Start with 15 converted HP shield for 30 seconds.'],
    bug_notable_2:['Phản 10% damage trực tiếp.','Reflect 10% direct damage.'],
    ghost_notable_2:['Bị đánh làm người đánh giảm 25% damage trong 2 giây.','Taking damage reduces attacker damage by 25% for 2 seconds.'],
    dragon_notable_2:['Giảm 20% damage trực tiếp.','Reduce direct damage by 20%.'],
    dark_notable_2:['15% né đòn trực tiếp.','15% direct damage dodge.'],
    steel_notable_1:['Giảm damage trực tiếp 3 ATK quy đổi Hex.','Reduce direct damage by 3 converted ATK.'],
    fairy_notable_1:['Đầu trận nhận shield 20 HP quy đổi Hex, 30 giây.','Start with 20 converted HP shield for 30 seconds.'],
    a_notable_3:['Hàng trước nhận shield 15 HP quy đổi Hex, 30 giây.','Front row starts with 15 converted HP shield for 30 seconds.'],
    a_notable_4:['Có ít nhất 3 hệ cộng hưởng: đầu trận nhận shield 10 HP quy đổi Hex, 30 giây.','With at least 3 active synergies, start with 10 converted HP shield for 30 seconds.'],
    steel_keystone:['Phản xạ 100% sát thương shield hấp thụ.','Reflect 100% of absorbed shield damage.'],
    grass_keystone:['Hồi 10% HP mỗi giây; HP cộng thêm từ overheal tối đa 25% HP đầu trận.','Heal 10% HP per second; overheal growth capped at 25% starting HP.'],
    poison_keystone:['Poison tối đa 5 tầng, 3 giây; lan một lần khi mục tiêu gục.','Poison caps at 5 stacks for 3 seconds; spreads when the target falls.'],
    electric_keystone:['Critical lan 50% damage tới tối đa 2 mục tiêu liền kề, hồi 1 giây.','Critical chains 50% damage to up to 2 neighbors, 1 second cooldown.'],
    ice_keystone:['Giảm 30% damage trực tiếp; đóng băng người đánh 1 giây, hồi 3 giây.','Reduce direct damage by 30%; freeze attacker for 1 second, 3 second cooldown.'],
    psychic_keystone:['Đòn đánh thêm shield 10 HP quy đổi Hex, tồn tại 10 giây; cap Max HP.','Attacks add 10 converted HP shield for 10 seconds, capped at Max HP.'],
    bug_keystone:['Đòn đánh tăng 2 ATK cho đồng minh Bug trong 1 giây, tối đa 3 tầng; hồi 1 giây.','Attacks grant Bugs 2 ATK for 1 second, max 3 stacks, 1 second cooldown.'],
    ghost_keystone:['25% né; hồi 5 HP quy đổi Hex khi đánh trúng.','25% dodge; heal 5 converted HP on hit.'],
    flying_keystone:['20% né; đòn đánh đầu x2 damage.','20% dodge; first attack deals double damage.'],
    water_keystone:['Đánh trúng hồi đồng minh liền kề 10% damage.','Hits heal adjacent allies for 10% damage.'],
    fairy_keystone:['Hồi cả đội 5 HP quy đổi Hex mỗi giây; miễn Burn/Poison.','Heal team 5 converted HP per second; immune to Burn/Poison.'],
    dark_keystone:['Damage x2 khi mục tiêu dưới 40% HP.','Double damage against targets below 40% HP.']
};
const additional=['grass_notable_1','grass_notable_2','water_notable_2','poison_notable_1','poison_notable_2','electric_notable_2','ice_notable_1','ice_notable_2','fighting_notable_2','ground_notable_2','flying_notable_2','psychic_notable_2','bug_notable_2','ghost_notable_2','dragon_notable_2','dark_notable_2','steel_notable_1','fairy_notable_1','a_notable_3','a_notable_4'];
for(const id of [...Object.keys(astralContracts),...additional]){const record=AstralModifiers.nodes.get(id);if(record){record.classification='triggered';record.milestone=null;record.timing='resolved combat event';}}
const baseDescription=AstralModifiers.description.bind(AstralModifiers);
AstralModifiers.description=function(node){const contract=astralContracts[node.id];if(!contract)return baseDescription(node);
    const record=this.nodes.get(node.id),v=record.modifiers;return `+${v.hp} HP · +${v.attack} ATK · `+contract[I18n.language==='vi-VN'?0:1];};
