'use strict';
// Event-bound additions share HexCombat's resolved damage pipeline. Proc damage
// never re-enters on-hit hooks; per-unit state is discarded with the battle.
window.EquipmentCombat = {
    has(unit,id){return unit.effects?.talismans?.includes(id);},
    ready(c,u,id,seconds=1){u.equipmentCooldowns??={};if((u.equipmentCooldowns[id]??0)>c.tickCount)return false;u.equipmentCooldowns[id]=c.tickCount+Math.ceil(seconds*c.tickRate);return true;},
    move(c,u,target){if(u.hp<=0||!c.units.has(u.id)||!c.hex.isValidCell(target)||c.hex.isOccupied(target))return false;
        const from=u.square;if(!c.hex.moveUnit(from,target))return false;u.square=target;u.nextMoveTick=c.tickCount+(u.moveCooldownTicks??15);c.emit({type:'move',unitId:u.id,from,to:target});return true;},
    hit(c,a,d,damage,source,options){
        if(!['attack','skill'].includes(source)||damage<=0)return;
        if(d.hp<=0&&this.has(d,'destiny_knot')&&!d.destinyUsed&&a.hp>0){d.destinyUsed=true;c.dealDamage(d,a,a.hp*.5,'equipment',{damageType:'true'});}
        if(d.hp>0){
            if(this.has(d,'air_balloon'))d.airBalloonPopped=true;
            if(this.has(d,'shed_shell')&&!d.shedShellUsed&&d.hp<d.maxHp*.3){d.shedShellUsed=true;c.addShield(d,HexEffects.flatHp(12),d,5);}
            if(this.has(d,'smoke_ball')&&!d.smokeUsed){d.smokeUsed=true;d.statuses.smoke={expiresAt:c.tickCount+c.tickRate*2};c.emit({type:'status',unitId:d.id,status:'smoke',duration:2});}
            if(this.has(d,'starf_berry')&&!d.starfUsed&&d.hp<d.maxHp*.35){d.starfUsed=true;const roll=Math.floor(c.random()*3);
                if(roll===0){d.bossBaseDamage+=HexEffects.flatAtk(10);HexTraits.refresh(d);}else if(roll===1)c.healUnit(d,HexEffects.flatHp(24));else d.starfEvasion=.35;
                c.emit({type:'status',unitId:d.id,status:'starf',duration:0});
            }
            if(a.hp>0&&this.has(d,'custap_berry')&&!d.custapUsed&&d.hp<d.maxHp*.3){d.custapUsed=true;c.dealDamage(d,a,HexEffects.flatAtk(10),'equipment',{damageType:'true'});}
            if(this.has(d,'eject_button')&&!d.ejectUsed){d.ejectUsed=true;const free=c.hex.board.map((u,sq)=>({u,sq})).filter(x=>!x.u&&(x.sq%7===0||x.sq%7===6));
                const target=free.sort((x,y)=>c.hex.distance(a.square,y.sq)-c.hex.distance(a.square,x.sq))[0]?.sq;if(target!=null)this.move(c,d,target);
            }
            if(a.hp>0&&source==='attack'&&this.has(a,'iron_ball')){
                const target=c.hex.getNeighbors(d.square).filter(sq=>!c.hex.isOccupied(sq)&&c.hex.distance(a.square,sq)>c.hex.distance(a.square,d.square))[0];
                if(target!=null&&!d.effects?.astral?.includes('ground_keystone'))this.move(c,d,target);
            }
        }
        if(a.hp>0&&this.has(d,'sticky_barb')&&this.ready(c,d,'barb',1))HexEffects.dot(c,d,a,'poison',HexEffects.flatHp(3),3);
        if(a.hp>0&&d.hp>0&&source==='attack'&&this.has(a,'quick_claw')&&this.ready(c,a,'quick',1)&&c.random()<.25)c.dealDamage(a,d,a.attackDamage,'equipment',{element:options.element});
    },
    update(c,u){if(this.has(u,'float_stone')&&u.nextMoveTick<=c.tickCount){const enemy=[...c.units.values()].filter(v=>v.color!==u.color&&v.hp>0).sort((a,b)=>c.hex.distance(u.square,a.square)-c.hex.distance(u.square,b.square))[0];
        if(enemy&&c.hex.distance(u.square,enemy.square)>u.attackRange){const target=c.hex.board.map((v,sq)=>({v,sq})).filter(x=>!x.v&&c.hex.distance(u.square,x.sq)===2&&c.hex.distance(x.sq,enemy.square)<c.hex.distance(u.square,enemy.square)).sort((a,b)=>c.hex.distance(a.sq,enemy.square)-c.hex.distance(b.sq,enemy.square))[0]?.sq;if(target!=null)this.move(c,u,target);}
    }}
};
const equipmentIncoming=HexEffects.incoming.bind(HexEffects),equipmentAfter=HexEffects.afterDamage.bind(HexEffects),equipmentUpdate=HexEffects.update.bind(HexEffects);
HexEffects.incoming=function(c,d,damage,source,attacker,matchup){
    if(['attack','skill'].includes(source)){
        if(EquipmentCombat.has(d,'air_balloon')&&!d.airBalloonPopped&&matchup?.element==='ground')return 0;
        const dodge=Math.min(.75,(d.starfEvasion??0)+((d.statuses.smoke?.expiresAt??0)>c.tickCount ? .5 : 0));
        if(dodge&&c.random()<dodge){c.emit({type:'status',unitId:d.id,status:'dodge',duration:0});return 0;}
    }return equipmentIncoming(c,d,damage,source,attacker,matchup);
};
HexEffects.afterDamage=function(c,a,d,damage,source,matchup,options={}){equipmentAfter(c,a,d,damage,source,matchup,options);EquipmentCombat.hit(c,a,d,damage,source,options);window.AstralRuntime?.afterDamage(c,a,d,damage,source,options);};
HexEffects.update=function(c,u){equipmentUpdate(c,u);EquipmentCombat.update(c,u);window.AstralRuntime?.update(c,u);};
