// Export actual registered contracts without browser state or save writes.
const fs=require('node:fs');
const path=require('node:path');
const {loadGame}=require('../tests/game-context.cjs');
const {run}=loadGame();
const result=run(`(()=>({astral:[...AstralModifiers.nodes.values()].map(record=>({...record,description:AstralModifiers.description(MetaProgression.nodes[record.sourceId])})),equipment:Object.keys(TALISMANS).map(id=>EquipmentSystem.definition(id))}))()`);
const folder=path.resolve(__dirname,'../docs/audits');
fs.writeFileSync(path.join(folder,'v43-modifier-catalog.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({nodes:result.astral.length,equipment:result.equipment.length,milestones:result.astral.filter(r=>r.milestone).map(r=>r.sourceId),classes:result.astral.reduce((a,r)=>(a[r.classification]=(a[r.classification]||0)+1,a),{})}));
