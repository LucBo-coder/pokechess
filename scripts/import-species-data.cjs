// Factual data only. Never scrape prose or execute downloaded code.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {loadGame}=require('../tests/game-context.cjs');
const REVISION='c80757193bd0889054e36f4209762360bdaa4b95';
const BASE=`https://raw.githubusercontent.com/PokeAPI/pokeapi/${REVISION}/data/v2/csv/`;
const FILES=['pokemon.csv','pokemon_stats.csv','moves.csv','move_names.csv','pokemon_moves.csv','types.csv','version_groups.csv'];
// These particular tables contain no multiline prose. Handle quoted commas.
function csv(text){const lines=text.trim().split(/\r?\n/),split=line=>{const cells=[];let value='',quote=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quote&&line[i+1]==='"'){value+='"';i++;}else quote=!quote;}else if(c===','&&!quote){cells.push(value);value='';}else value+=c;}cells.push(value);return cells;};const header=split(lines.shift());return lines.map(line=>Object.fromEntries(split(line).map((value,i)=>[header[i],value])));}
async function main(){
 const tables={},sources=[];
 await Promise.all(FILES.map(async file=>{const response=await fetch(BASE+file);if(!response.ok)throw Error(`${file}: HTTP ${response.status}`);const text=await response.text();tables[file]=csv(text);sources.push({file,url:BASE+file,sha256:crypto.createHash('sha256').update(text).digest('hex'),bytes:Buffer.byteLength(text)});console.log(`Downloaded ${file}: ${tables[file].length} rows`);}));
 const {run}=loadGame(),pieces=JSON.parse(run('JSON.stringify(PIECES)'));
 const pokemon=tables['pokemon.csv'],bySpecies=new Map(pokemon.filter(p=>p.is_default==='1').map(p=>[p.species_id,p])),bySlug=new Map(pokemon.map(p=>[p.identifier,p]));
 const stats=new Map();for(const row of tables['pokemon_stats.csv']){if(!stats.has(row.pokemon_id))stats.set(row.pokemon_id,{});stats.get(row.pokemon_id)[['','hp','attack','defense','specialAttack','specialDefense','speed'][+row.stat_id]]=+row.base_stat;}
 const types=new Map(tables['types.csv'].map(r=>[r.id,r.identifier]));
 const names=new Map(tables['move_names.csv'].filter(r=>r.local_language_id==='9').map(r=>[r.move_id,r.name]));
 const moves=new Map(tables['moves.csv'].map(r=>[r.id,{id:+r.id,slug:r.identifier,name:names.get(r.id)??r.identifier,type:types.get(r.type_id),category:['','status','physical','special'][+r.damage_class_id],power:r.power?+r.power:null,accuracy:r.accuracy?+r.accuracy:null,priority:+r.priority,targetId:+r.target_id,effectId:+r.effect_id}]));
 const learnsets=new Map();for(const r of tables['pokemon_moves.csv']){if(!learnsets.has(r.pokemon_id))learnsets.set(r.pokemon_id,new Map());const groups=learnsets.get(r.pokemon_id);if(!groups.has(r.version_group_id))groups.set(r.version_group_id,new Set());groups.get(r.version_group_id).add(r.move_id);}
 const species={},used=new Set(),missing=[];for(const [id,piece]of Object.entries(pieces)){
   const national=id.split('-')[0],base=bySpecies.get(national),p=/^\d+$/.test(id)?base:bySlug.get(`${base?.identifier}${id.slice(national.length)}`);
   if(!p||!stats.has(p.id)){missing.push(id);continue;}
   const statsRow=stats.get(p.id);if(Object.keys(statsRow).length!==6||Object.values(statsRow).some(n=>!Number.isFinite(n)||n<1))throw Error(`Incomplete stats: ${id}`);
   const learnsetFrom=learnsets.has(p.id)?p.id:base.id,groups=learnsets.get(learnsetFrom);if(!groups?.size)throw Error(`Missing learnset: ${id}`);
   const version=Math.max(...groups.keys().map(Number)),available=[...groups.get(String(version))].map(id=>moves.get(id)).filter(Boolean);
   // A damaging signature is a supported Auto Chess adaptation, not the full
   // main-series move effect. Exclude OHKO, variable-power and delayed moves.
   const candidates=available.filter(m=>['physical','special'].includes(m.category)&&m.power>=30&&m.power<=120&&![38,39,40,76,91,101,120,153,248,353].includes(m.id));
   const preferred=statsRow.specialAttack>statsRow.attack?'special':'physical';
   const score=m=>([piece.element,piece.element2].includes(m.type)?1000:0)+(m.category===preferred?200:0)+m.power+(m.accuracy??100)*.1;
   candidates.sort((a,b)=>score(b)-score(a)||a.id-b.id);
   const chosen=[];if(candidates[0])chosen.push(candidates[0]);for(const category of ['physical','special']){const option=candidates.find(m=>m.category===category&&!chosen.includes(m));if(option)chosen.push(option);}for(const m of candidates)if(chosen.length<3&&!chosen.includes(m))chosen.push(m);
   if(!chosen.length){const status=available.filter(m=>m.category==='status').sort((a,b)=>a.id-b.id)[0];if(!status)throw Error(`No moves: ${id}`);chosen.push(status);}
   for(const m of chosen)used.add(String(m.id));species[id]={pokemonId:+p.id,speciesId:+national,slug:p.identifier,stats:statsRow,learnsetPokemonId:+learnsetFrom,versionGroup:version,skills:chosen.map(m=>m.id)};
 }
 if(missing.length)throw Error(`Unmapped forms: ${missing.join(', ')}`);
 const catalog={version:1,source:{provider:'PokeAPI',revision:REVISION,documentation:'https://pokeapi.co/docs/v2',files:sources.sort((a,b)=>a.file.localeCompare(b.file))},species,moves:Object.fromEntries([...used].sort((a,b)=>+a-+b).map(id=>[id,moves.get(id)]))};
 const destination=path.resolve(__dirname,'../js/data/species_catalog.js');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,`'use strict';\n// Generated factual snapshot. Rebuild with scripts/import-species-data.cjs.\nwindow.SpeciesCatalog=${JSON.stringify(catalog)};\n`);
 console.log(`Validated ${Object.keys(species).length} forms, ${used.size} moves; wrote ${destination}`);
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={csv};
