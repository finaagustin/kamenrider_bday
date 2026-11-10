const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const FACE="assets/akbar-head.webp";
$('#faceimg').setAttribute('href',FACE);

$('#titleText').textContent=CONFIG.title;
let cur=1, typing=null, photos={};

function go(n){
  $$('.scene').forEach(s=>s.classList.remove('on'));
  $('#s'+n).classList.add('on'); cur=n;
  if(n===1) stopBirthday();
  if(n===3) typeLetter();
  if(n===4) finale();
  if(n===5) cakeStart();
}
$('#s1').onclick=()=>{ startAudio(); go(3) };
$('#next').onclick=e=>{e.stopPropagation();go(5)};
$('#again').onclick=e=>{e.stopPropagation();go(1)};

/* efek ketik */
function typeLetter(){
  const box=$('#letter'); box.innerHTML=''; $('#next').classList.remove('on');
  const ps=CONFIG.paragraphs.map(t=>{const p=document.createElement('p');box.appendChild(p);return{p,t,c:Array.from(t),i:0}});
  const sign=document.createElement('div');sign.className='sign';sign.textContent=CONFIG.signature;box.appendChild(sign);
  let k=0; clearInterval(typing);
  const done=()=>{clearInterval(typing);ps.forEach(o=>o.p.textContent=o.t);sign.classList.add('on');$('#next').classList.add('on')};
  typing=setInterval(()=>{
    const o=ps[k]; if(!o) return done();
    o.p.textContent=o.c.slice(0,++o.i).join('');
    if(o.i>=o.c.length) k++;
  },26);
  $('#s3').onclick=()=>done();
}

/* tiup lilin: mikrofon, atau ketuk api sebagai cadangan */
let stream=null,ac=null,raf=null;
function cakeStart(){
  initAudio();
  $$('#cake .fl').forEach(f=>f.classList.remove('off'));
  $('#blower').onpointerdown=blowAll; $('#blower').onclick=blowAll; blowing=false;
  $('#wish').classList.remove('on');
  $('#cakehint').textContent='Buat permintaan dulu… lalu ketuk Kamen Rider untuk meniup lilin 🎂';
  if(CONFIG.micBlow) micStart();
}
function snuff(f){
  if(f.classList.contains('off')) return;
  f.classList.add('off');
  if(!$$('#cake .fl:not(.off)').length){
    stopMic(); setTimeout(()=>{ if(cur!==5) return; $('#wish').classList.add('on'); confetti();
      setTimeout(()=>{ if(cur===5) go(4) },3500) },1500);
  }
}
/* jeda lilin = pengaturan di config.js, atau lebih besar jika HP melaporkan keterlambatan suara */
function candleWait(){
  const lat=actx?((actx.outputLatency||0)+(actx.baseLatency||0))*1000:0;
  return Math.max(CONFIG.candleDelay||0,lat+60);
}
let blowing=false;
function blowAll(){
  if(blowing) return; blowing=true; startBirthday(); stopMic();
  $$('#cake .fl:not(.off)').forEach((f,i)=>setTimeout(()=>snuff(f),i*600+candleWait()));
}
function stopMic(){
  cancelAnimationFrame(raf);
  if(stream) stream.getTracks().forEach(t=>t.stop());
  if(ac) ac.close().catch(()=>{});
  stream=ac=null;
}
async function micStart(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(cur!==5){stopMic();return}
    ac=new (window.AudioContext||window.webkitAudioContext)();
    const an=ac.createAnalyser(); an.fftSize=1024;
    ac.createMediaStreamSource(stream).connect(an);
    const buf=new Uint8Array(an.fftSize); let loud=0;
    $('#cakehint').textContent='Tiup ke mikrofon 🎤 atau ketuk Kamen Rider';
    (function loop(){
      an.getByteTimeDomainData(buf);
      let s=0; for(const v of buf){const d=(v-128)/128; s+=d*d}
      const rms=Math.sqrt(s/buf.length);
      loud = rms>0.1 ? loud+1 : Math.max(0,loud-2);
      if(loud>8) blowAll();
      raf=requestAnimationFrame(loop);
    })();
  }catch(e){
    $('#cakehint').textContent='Ketuk Kamen Rider untuk meniup lilin 💨';
  }
}

/* Happy Birthday */
function finale(){
  const hb=$('#hb'); hb.innerHTML='';
  ['HAPPY','BIRTHDAY'].forEach((w,r)=>{
    const row=document.createElement('div');row.className='row';
    [...w].forEach((c,i)=>{const s=document.createElement('span');s.textContent=c;
      s.style.transform=`rotate(${(Math.random()*14-7).toFixed(1)}deg) translateY(${(Math.random()*8-4).toFixed(0)}px)`;
      s.style.animationDelay=(r*.5+i*.07)+'s';row.appendChild(s)});
    hb.appendChild(row);
  });
  confetti();
}
$('#s4').onclick=e=>{ if(!e.target.closest('.pol,.again')) confetti() };

/* confetti */
function confetti(){
  const c=$('#conf'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const cols=['#d90f14','#2b4fa8','#ffd400','#fff','#c9ced6'];
  const ps=Array.from({length:110},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,
    vx:Math.random()*2-1,vy:2+Math.random()*3,s:5+Math.random()*7,r:Math.random()*6,vr:Math.random()*.2-.1,c:cols[Math.random()*5|0]}));
  let f=0;(function tick(){
    x.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
    if(++f<260) requestAnimationFrame(tick); else x.clearRect(0,0,c.width,c.height);
  })();
}

/* ===== musik & suara ===== */
const BGM_VOL=.5;
let actx=null, master=null, muted=false, bgm=null, bgmOK=false, duckTimer=null;
function initAudio(){
  if(!actx){
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    actx=new AC(); master=actx.createGain(); master.gain.value=muted?0:1; master.connect(actx.destination);
    /* nada senyap yang terus berjalan: menjaga speaker HP tetap 'bangun' agar lagu tidak telat */
    const w=actx.createOscillator(), wg=actx.createGain(); wg.gain.value=0.0001; w.connect(wg); wg.connect(actx.destination); w.start();
  }
  if(actx.state==='suspended') actx.resume();
}
function tone(freq,t,dur,type,vol,dest){
  const o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+.012);
  g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g); g.connect(dest||master); o.start(t); o.stop(t+dur+.05);
}
/* bunyi "5-5-5 lalu Enter" ala ponsel Faiz (dibuat sendiri dengan nada sederhana) */
function beep555(){
  if(!actx) return; const t=actx.currentTime+.05;
  [0,.17,.34].forEach(d=>tone(880,t+d,.11,'square',.07)); tone(1318.5,t+.58,.4,'square',.07);
}
/* melodi "Happy Birthday" (lagu tradisional) dimainkan dengan nada kotak musik */
const HB=[[392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],
  [392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],
  [392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,2],
  [698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]];
let hbOn=false, hbTimer=null, hbGain=null;
function playHB(){
  if(!actx||!hbOn) return;
  hbGain=actx.createGain(); hbGain.gain.value=1; hbGain.connect(master);
  const beat=.52; let t=actx.currentTime+.02, total=0;
  HB.forEach(([f,b])=>{ tone(f,t,b*beat*1.5,'triangle',.26,hbGain); tone(f*2,t,b*beat*.9,'sine',.07,hbGain); t+=b*beat; total+=b*beat; });
  hbTimer=setTimeout(playHB,(total+1.5)*1000);          /* diulang sampai layar "ulangi" ditekan */
}
function startBirthday(){
  if(hbOn) return; hbOn=true; initAudio();
  if(bgm&&bgmOK) bgm.volume=.1;                          /* lagu latar dikecilkan */
  playHB();
}
function stopBirthday(){
  hbOn=false; clearTimeout(hbTimer);
  if(hbGain&&actx){ const g=hbGain; try{ g.gain.setTargetAtTime(0,actx.currentTime,.05) }catch(e){} setTimeout(()=>{try{g.disconnect()}catch(e){}},500); }
  hbGain=null;
  if(bgm) bgm.volume=BGM_VOL;
}
function startAudio(){
  initAudio(); beep555();
  if(CONFIG.music && !bgm){
    bgm=new Audio(CONFIG.music); bgm.loop=true; bgm.volume=BGM_VOL; bgm.muted=muted;
    bgm.addEventListener('playing',()=>{bgmOK=true});
    bgm.addEventListener('error',()=>{bgm=null;bgmOK=false});
    const p=bgm.play(); if(p&&p.catch) p.catch(()=>{});
  }
  $('#mute').classList.add('on');
}
$('#mute').onclick=e=>{
  e.stopPropagation(); muted=!muted;
  if(master) master.gain.value=muted?0:1;
  if(bgm) bgm.muted=muted;
  $('#mute').textContent=muted?'🔇':'🔊';
};
