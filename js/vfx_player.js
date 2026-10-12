'use strict';

// Sprite playback belongs to the renderer and advances with combat ticks, including pause.
window.CombatVfx = {
    assets:new Map((window.CombatVfxManifest?.assets ?? []).map(asset=>[asset.assetId,asset])),
    images:new Map(),
    image(id) {
        const asset=this.assets.get(id); if(!asset)return null;
        if(!this.images.has(id)){const image=new Image();image.src=asset.path;this.images.set(id,image);}
        return this.images.get(id);
    }
};
class HexVfxPlayer {
    constructor(renderer) { this.renderer=renderer;this.effects=new Set();this.recent=new Map(); }
    play(id,unitId,{duration,fromId,scale=.65}={}) {
        const r=this.renderer,a=CombatVfx.assets.get(id),image=CombatVfx.image(id);
        if(!a||!image?.complete||!image.naturalWidth||r.destroyed||r.reducedEffects||window.CombatPresentation?.enabled('effects')===false||document.body.classList.contains('reduced-motion')||this.effects.size>=24)return false;
        const key=id+':'+unitId, tick=r.combat.tickCount;
        if(tick-(this.recent.get(key)??-Infinity)<3)return false;
        this.recent.set(key,tick);if(this.recent.size>200)this.recent.delete(this.recent.keys().next().value);
        const el=document.createElement('div');el.className='hex-sheet-vfx';el.dataset.vfxId=id;el.setAttribute('aria-hidden','true');
        const [w,h]=a.frameSize;
        el.style.width=w*scale+'px';el.style.height=h*scale+'px';el.style.backgroundImage=`url("${a.path}")`;
        el.style.backgroundSize=`${w*a.frameCount*scale}px ${h*scale}px`;
        r.boardElement.append(el);
        const effect={a,el,unitId,fromId,scale,start:tick,duration:duration??a.frameCount/a.fps};
        this.effects.add(effect);this.update();return true;
    }
    update() {
        const r=this.renderer;
        for(const effect of this.effects){
            const {a,el,unitId,fromId,scale}=effect;
            const elapsed=(r.combat.tickCount-effect.start)/r.combat.tickRate;
            const unit=r.getUnit(unitId),target=unit&&r.getCellPosition(unit.square);
            if(!target||elapsed>=effect.duration||r.destroyed||r.reducedEffects||document.body.classList.contains('reduced-motion')){el.remove();this.effects.delete(effect);continue;}
            let x=target.x,y=target.y;
            if(fromId){const source=r.getUnit(fromId),start=source&&r.getCellPosition(source.square);if(start){const t=Math.min(1,elapsed/effect.duration);x=start.x+(x-start.x)*t;y=start.y+(y-start.y)*t;
                el.style.transformOrigin=`${a.anchor[0]*scale}px ${a.anchor[1]*scale}px`;el.style.transform=`rotate(${Math.atan2(target.y-start.y,target.x-start.x)}rad)`;
            }}
            el.style.left=x-a.anchor[0]*scale+'px';el.style.top=y-a.anchor[1]*scale+'px';
            const frame=Math.floor(elapsed*a.fps);el.style.backgroundPosition=`${-(a.loop?frame%a.frameCount:Math.min(a.frameCount-1,frame))*a.frameSize[0]*scale}px 0`;
        }
    }
    event(event) {
        const r=this.renderer,c=r.combat;
        const type=event.element??r.getVfxElement(event.unitId??event.attackerId)??'normal';
        if(event.type==='skill-cast'){
            const played=this.play(`cast_${type}_01`,event.unitId,{duration:Math.max(.2,(event.delayTicks||6)/c.tickRate)});
            if(event.role==='tank')this.play('status_shield_01',event.unitId);
            else if(event.role==='mage')this.play(`aoe_${type}_01`,event.targetId);
            else if(event.role==='marksman')this.play(`proj_${type}_01`,event.targetId,{fromId:event.unitId,duration:Math.max(.2,(event.delayTicks||6)/c.tickRate)});
            const target=r.sprites.get(event.targetId)?.element;
            if(target){target.classList.add('hex-skill-target');setTimeout(()=>target.classList.remove('hex-skill-target'),250);}
            window.soundManager?.playSfx(window.HexSkillInfo?.[event.role]?.sfxId??'magic');
            return played;
        } else if(event.type==='damage'&&(event.damage>0||event.absorbed>0)){
            const id=event.critical?'crit_hit_01':({water:'water_splash_01',grass:'grass_vine_01'})[type]??`${type}_impact_01`;
            return this.play(id,event.defenderId)||this.play('hit_light_01',event.defenderId);
        } else if(event.type==='heal')this.play('status_heal_01',event.unitId);
        else if(event.type==='status')this.play(`status_${event.status}_01`,event.unitId,{duration:1});
        else if(event.type==='boss-phase-change')return this.play('boss_phase_01',event.unitId);
        else if(event.type==='spawn'&&r.getUnit(event.unitId)?.isBoss)this.play('boss_aura_01',event.unitId,{duration:1});
        else if(event.type==='death'&&r.getUnit(event.unitId)?.isBoss)this.play('boss_defeat_01',event.unitId);
        return false;
    }
    removeUnit(id){for(const effect of this.effects)if(effect.unitId===id||effect.fromId===id){effect.el.remove();this.effects.delete(effect);}}
    destroy(){for(const effect of this.effects)effect.el.remove();this.effects.clear();this.recent.clear();}
}
window.HexVfxPlayer=HexVfxPlayer;
// Preload all approved sheets, without changing any ability definition or adding status rules.
for(const id of CombatVfx.assets.keys())CombatVfx.image(id);
