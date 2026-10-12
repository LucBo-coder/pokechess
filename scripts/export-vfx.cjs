// Rebuild approved procedural artwork using Chromium's Canvas, without npm dependencies.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const sources = [
 ['master','97aa6e0f-3752-404c-b1d7-cd9826570b50'],
 ['batch2','12390876-231f-449a-b5c4-b087e259ad87'],
 ['batch1','94b8ec83-5c19-46b7-bc25-360e14f42056']
];
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
let browser,socket,send;
const profile = fs.mkdtempSync(path.join(os.tmpdir(),'pokechess-vfx-'));
(async()=>{
 const sourceDir=path.join(root,'asset-packs','vfx-source');fs.mkdirSync(sourceDir,{recursive:true});
 for(const [name,id] of sources) {
  const target=path.join(sourceDir,name+'.html');
  if(!fs.existsSync(target)) fs.copyFileSync(path.join('C:/Users/pc/.codex/attachments',id,'Pasted text.txt'),target);
 }
 browser=spawn(process.env.POKECHESS_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'
 ],{windowsHide:true,stdio:'ignore'});
 const portFile=path.join(profile,'DevToolsActivePort');
 for(let i=0;i<100&&!fs.existsSync(portFile);i++)await sleep(100);
 if(!fs.existsSync(portFile))throw Error('Chromium debugging port unavailable');
 const port=fs.readFileSync(portFile,'utf8').split('\n')[0];
 const pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let serial=0;const pending=new Map();
 socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const req=pending.get(data.id);pending.delete(data.id);data.error?req.reject(Error(JSON.stringify(data.error))):req.resolve(data.result);}};
 send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const assets=[];const quality=[];
 for(const [name] of sources){
  await send('Page.navigate',{url:'about:blank'});await sleep(100);
  const html=fs.readFileSync(path.join(sourceDir,name+'.html'),'utf8');
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const prefix=script.slice(0,script.indexOf('/* ================= UI ================= */'));
  const expression=prefix+`\n(() => {
   const all=typeof ALL!=='undefined'?ALL:EFFECTS;
   return all.map(a=>{
    const count=a.n||8,frames=Array.from({length:count},(_,i)=>renderFrame(a,i));
    const w=frames[0].width,h=frames[0].height;
    const sheet=document.createElement('canvas');sheet.width=w*count;sheet.height=h;
    frames.forEach((frame,i)=>sheet.getContext('2d').drawImage(frame,i*w,0));
    const checks=qc(a,frames);
    return {assetId:a.id,path:'assets/visual/vfx/'+a.dir+'/'+a.id+'.png',frameSize:[w,h],frameCount:count,fps:a.fps||12,loop:!!a.loop,
      anchor:a.id.startsWith('proj_')?[64,32]:a.id.startsWith('aoe_')?[64,84]:[w/2,h/2],
      notes:a.note,source:'${name}',qc:checks,png:sheet.toDataURL('image/png').split(',')[1]};
   });
  })()`;
  const result=await send('Runtime.evaluate',{expression,returnByValue:true});
  if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
  for(const item of result.result.value){
   const target=path.join(root,item.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,Buffer.from(item.png,'base64'));delete item.png;
   quality.push({assetId:item.assetId,checks:item.qc});delete item.qc;assets.push(item);
  }
  // Retain source QC, then render with a transparent safety margin. All pixel primitives
  // share P, so offset there also captures artwork formerly clipped by source frame bounds.
  const padded = await send('Runtime.evaluate',{returnByValue:true,expression:`(() => {
    const nativePen=pen;
    pen=eval('('+nativePen.toString().replace('x>=0&&y>=0&&x<W&&y<H','x>=-32&&y>=-32&&x<W&&y<H').replace('ctx.fillRect(x,y,1,1)','ctx.fillRect(x+32,y+32,1,1)')+')');
    const all=typeof ALL!=='undefined'?ALL:EFFECTS;
    return all.map(a=>{
      const w=a.W||a.fw||96,h=a.H||a.fh||96,n=a.n||8;
      const frames=Array.from({length:n},(_,f)=>{
        const cv=document.createElement('canvas');cv.width=w+64;cv.height=h+64;
        const ctx=cv.getContext('2d'),p=pen(ctx,cv.width,cv.height),S=rng((strHash(a.id)+f*2654435761)>>>0);
        if('${name}'==='batch1')a.draw(f,p,S,a.pal);else a.draw(f,p,S,kit(p,S),a.pal);
        if(a.out||a.outline)p.OUT(a.out||a.outline);return cv;
      });
      if(!a.loop){const blank=document.createElement('canvas');blank.width=w+64;blank.height=h+64;frames.push(blank);}
      const sheet=document.createElement('canvas');sheet.width=(w+64)*frames.length;sheet.height=h+64;
      frames.forEach((frame,i)=>sheet.getContext('2d').drawImage(frame,i*(w+64),0));
      let edge=false;for(const frame of frames){const data=frame.getContext('2d').getImageData(0,0,w+64,h+64).data;
        for(let x=0;x<w+64;x++)if(data[x*4+3]||data[((h+63)*(w+64)+x)*4+3])edge=true;
        for(let y=0;y<h+64;y++)if(data[(y*(w+64))*4+3]||data[(y*(w+64)+w+63)*4+3])edge=true;
      }
      return {id:a.id,png:sheet.toDataURL('image/png').split(',')[1],frameSize:[w+64,h+64],frameCount:frames.length,edge};
    });
  })()`});
  if(padded.exceptionDetails)throw Error(padded.exceptionDetails.exception?.description||padded.exceptionDetails.text);
  for(const item of padded.result.value){
    if(item.edge)throw Error('Padded VFX still clips: '+item.id);
    const meta=assets.find(a=>a.assetId===item.id);meta.originalFrameSize=meta.frameSize;meta.frameSize=item.frameSize;meta.frameCount=item.frameCount;
    meta.anchor=meta.anchor.map(value=>value+32);meta.padding=32;
    fs.writeFileSync(path.join(root,meta.path),Buffer.from(item.png,'base64'));
  }
 }
 if(new Set(assets.map(a=>a.assetId)).size!==assets.length)throw Error('Duplicate VFX IDs');
 const manifest={version:1,status:'User-approved artwork; exported from Canvas sources',layout:'horizontal-strip',assets};
 fs.writeFileSync(path.join(root,'assets/visual/combat-vfx.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(root,'js/vfx_manifest.js'),'window.CombatVfxManifest = '+JSON.stringify(manifest)+';\n');
 fs.mkdirSync(path.join(root,'docs/audits'),{recursive:true});
 fs.writeFileSync(path.join(root,'docs/audits/vfx-quality.json'),JSON.stringify(quality,null,2)+'\n');
 const failures=quality.filter(a=>a.checks.some(c=>!c[1]));
 console.log(JSON.stringify({exported:assets.length,qcFailures:failures.map(a=>({id:a.assetId,failed:a.checks.filter(c=>!c[1]).map(c=>c[0])}))}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
 if(send&&socket?.readyState===WebSocket.OPEN)await Promise.race([send('Browser.close').catch(()=>{}),sleep(2000)]);
 socket?.close();if(browser&&browser.exitCode===null)browser.kill();
 // Temporary profile is left to OS cleanup; no project or user profile is deleted.
});
