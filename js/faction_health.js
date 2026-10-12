'use strict';
window.FactionHealth={
    colors:Object.freeze({ally:'#27C76F',enemy:'#EF4444',shield:'#38BDF8'}),
    faction(unit){return unit?.color==='w'?'ally':unit?.color==='b'?'enemy':'unknown';},
    apply(track,unit){if(!track)return;const faction=this.faction(unit);if(track.dataset.faction===faction)return;track.dataset.faction=faction;track.title=faction==='ally'?'Đồng minh':faction==='enemy'?'Đối thủ':'Chưa xác định phe';const fill=track.querySelector('.hex-combat-hp-fill');fill?.style.setProperty('background',this.colors[faction]??'#8993a5','important');},
    update(renderer){for(const [id,sprite]of renderer.sprites){const unit=renderer.getUnit(id);if(unit){this.apply(sprite.element.querySelector('.hex-combat-hp'),unit);if(sprite.element.dataset.faction!==this.faction(unit)){sprite.element.dataset.faction=this.faction(unit);sprite.shieldFill.style.setProperty('background',this.colors.shield,'important');}}}}
};
