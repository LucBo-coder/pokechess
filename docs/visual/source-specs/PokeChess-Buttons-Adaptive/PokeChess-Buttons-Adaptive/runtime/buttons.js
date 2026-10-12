/* UI-only nine-slice renderer. No gameplay state or handlers are replaced. */
(() => {
 const root = new URL('../assets/', document.currentScript.src);
 const defs = {
  primary: {file:'button-primary.png',crop:[68,120,2037,470],slice:[128,96,128,96]},
  danger: {file:'button-danger.png',crop:[65,115,2043,483],slice:[128,96,128,96]}
 };
 const cache = new Map();
 function load(kind) {
  if (!cache.has(kind)) cache.set(kind,new Promise((resolve,reject)=>{
   const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject;
   img.src=new URL(defs[kind].file,root).href;
  })); return cache.get(kind);
 }
 function setup(button) {
  if(button.dataset.skinned)return;
  button.dataset.skinned='true';
  const kind=button.dataset.pixelButton in defs ? button.dataset.pixelButton : 'primary';
  const canvas=document.createElement('canvas');canvas.className='button-skin';canvas.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.className='button-content';
  while(button.firstChild)label.append(button.firstChild);
  button.append(canvas,label);
  load(kind).then(img=>{
   const draw=()=>{
    const w=button.clientWidth,h=button.clientHeight;if(!w||!h)return;
    const dpr=window.devicePixelRatio||1;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.imageSmoothingEnabled=false;
    const [x,y,sw,sh]=defs[kind].crop,[l,t,r,b]=defs[kind].slice;
    const cap=8;const sx=[x,x+l,x+sw-r,x+sw],sy=[y,y+t,y+sh-b,y+sh];
    const dx=[0,cap,w-cap,w],dy=[0,cap,h-cap,h];
    for(let row=0;row<3;row++)for(let col=0;col<3;col++)ctx.drawImage(img,sx[col],sy[row],sx[col+1]-sx[col],sy[row+1]-sy[row],dx[col],dy[row],dx[col+1]-dx[col],dy[row+1]-dy[row]);
    button.dataset.skinReady='true';
   };
   const observer=new ResizeObserver(draw);observer.observe(button);draw();
   window.addEventListener('resize',draw);
  }).catch(()=>{button.dataset.skinReady='false';});
 }
 window.PokeButtons={init:(scope=document)=>scope.querySelectorAll('button[data-pixel-button]').forEach(setup)};
 window.PokeButtons.init();
})();
