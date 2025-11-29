/* Ultra interactions & performance-minded JS
   - magnetic buttons
   - scroll-driven reveals
   - 3D hero parallax
   - morphing SVG blob
   - canvas particle field (background)
   - cursor trail (small particles)
   - lightbox/project modals
   - tilt effect for cards
   - sound-reactive visuals (mic or demo audio)
   - theme toggle (dark / ultra)
*/

/* UTILS */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* LOADER */
window.addEventListener('load', () => {
  const loader = $('#loader');
  setTimeout(() => {
    if (!loader) return;
    loader.style.opacity = 0;
    loader.style.pointerEvents = 'none';
    setTimeout(()=>loader.remove(), 700);
  }, 600);
});

/* THEME TOGGLE */
const themeToggle = $('#theme-toggle');
const modeToggle = $('#mode-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', ()=> {
    document.body.classList.toggle('theme-ultra');
  });
}
if (modeToggle) {
  modeToggle.addEventListener('click', ()=> {
    document.body.classList.toggle('theme-ultra');
    modeToggle.textContent = document.body.classList.contains('theme-ultra') ? 'Ultra' : 'Ultra';
  });
}

/* SMOOTH ANCHORS */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* REVEAL ON SCROLL (IntersectionObserver) */
if (!prefersReduce) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('reveal-visible');
        en.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.18 });

  $$('section.reveal, .reveal-item, .cards .card, .project-card, .team-card').forEach(n => io.observe(n));
} else {
  $$('section.reveal, .reveal-item, .cards .card, .project-card, .team-card').forEach(n => n.classList.add('revealed'));
}

/* MAGNETIC BUTTONS */
(function(){
  const magnets = $$('.magnetic');
  if (!magnets.length || prefersReduce) return;
  magnets.forEach(btn => {
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width/2;
      const my = e.clientY - rect.top - rect.height/2;
      btn.style.transform = `translate(${mx*0.12}px, ${my*0.08}px) rotate(${mx*0.02}deg)`;
    });
    btn.addEventListener('mouseleave', ()=> btn.style.transform = '');
  });
})();

/* HERO 3D PARALLAX (mouse) */
(function(){
  const hero = document.querySelector('.hero');
  const heroText = document.querySelector('.hero-3d');
  if (!hero || !heroText || prefersReduce) return;
  hero.addEventListener('mousemove', (e)=>{
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    const depth = parseFloat(heroText.dataset.depth || 20);
    heroText.style.transform = `perspective(900px) translateZ(${depth}px) rotateX(${dy* -6}deg) rotateY(${dx*8}deg)`;
  });
  hero.addEventListener('mouseleave', ()=> heroText.style.transform = '');
})();

/* MORPHING BLOB: smooth path interpolation (lightweight) */
(function(){
  if (prefersReduce) return;
  const path = document.getElementById('blobPath');
  if (!path) return;
  const t0 = Date.now();
  function morph() {
    const t = (Date.now()-t0)/2000;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // procedural blob using sine waves (keeps small & fast)
    const cx = 300 + Math.sin(t*0.6)*80;
    const cy = 200 + Math.cos(t*0.4)*40;
    const r1 = 120 + Math.sin(t*1.2)*28;
    const r2 = 80 + Math.cos(t*0.9)*20;
    const d = `M ${cx-r1}, ${cy}
      C ${cx-r1},${cy-r1*0.6} ${cx-r2},${cy-r2} ${cx},${cy-r2}
      C ${cx+r2},${cy-r2} ${cx+r1},${cy-r1*0.6} ${cx+r1},${cy}
      C ${cx+r1},${cy+r1*0.6} ${cx+r2},${cy+r2} ${cx},${cy+r2}
      C ${cx-r2},${cy+r2} ${cx-r1},${cy+r1*0.6} ${cx-r1},${cy} Z`;
    path.setAttribute('d', d);
    requestAnimationFrame(morph);
  }
  morph();
})();

/* PARTICLES CANVAS (background) */
(function(){
  const canvas = document.getElementById('bg-particles');
  if (!canvas || prefersReduce) return;
  const ctx = canvas.getContext('2d');
  let w=0,h=0,dpr=Math.max(1, window.devicePixelRatio||1);
  const particles = [];
  const COUNT = 80;

  function resize(){
    dpr = Math.max(1, window.devicePixelRatio||1);
    w = canvas.width = Math.round(window.innerWidth * dpr);
    h = canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth+'px';
    canvas.style.height = window.innerHeight+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  function rand(a,b){return Math.random()*(b-a)+a}
  for (let i=0;i<COUNT;i++) particles.push({x:rand(0,innerWidth), y:rand(0,innerHeight), r:rand(2,9), vx:rand(-0.14,0.14), vy:rand(-0.09,0.09), hue:rand(220,320), life:rand(0,360)});

  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    // subtle backdrop blend
    const g = ctx.createLinearGradient(0,0,0,innerHeight);
    g.addColorStop(0,'rgba(12,10,18,0.02)'); g.addColorStop(1,'rgba(12,10,18,0.25)');
    ctx.fillStyle = g; ctx.fillRect(0,0,innerWidth,innerHeight);

    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      p.vx += Math.sin(Date.now()/500 + p.life)*0.0006;
      p.vy += Math.cos(Date.now()/700 + p.life)*0.0004;
      p.life+=0.02;
      if (p.x<-50) p.x = innerWidth+50;
      if (p.x>innerWidth+50) p.x = -50;
      if (p.y<-50) p.y = innerHeight+50;
      if (p.y>innerHeight+50) p.y = -50;

      const rad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);
      rad.addColorStop(0,`hsla(${p.hue},90%,70%,0.12)`);
      rad.addColorStop(0.5,`hsla(${p.hue-40},80%,60%,0.06)`);
      rad.addColorStop(1,'rgba(10,10,10,0)');
      ctx.fillStyle = rad; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*8,0,Math.PI*2); ctx.fill();

      ctx.fillStyle = `hsla(${p.hue},90%,70%,0.95)`; ctx.beginPath();
      ctx.arc(p.x,p.y,p.r*0.8,0,Math.PI*2); ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // repulse on mouse for subtle effect
  let mx=-9999,my=-9999;
  window.addEventListener('mousemove', e=>{mx=e.clientX; my=e.clientY});
  window.addEventListener('mouseleave', ()=>{mx=my=-9999});
})();

/* CURSOR TRAIL (tiny dots) */
(function(){
  const canvas = document.getElementById('cursor-trail');
  if (!canvas || prefersReduce) return;
  const ctx = canvas.getContext('2d');
  let w=0,h=0,dpr=Math.max(1,devicePixelRatio||1);
  function resize(){dpr=Math.max(1,devicePixelRatio||1); w=canvas.width=Math.round(innerWidth*dpr); h=canvas.height=Math.round(innerHeight*dpr); canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; ctx.setTransform(dpr,0,0,dpr,0,0);}
  window.addEventListener('resize', resize, {passive:true}); resize();
  const dots = [];
  function addDot(x,y){
    dots.push({x,y,life:1,r:rand(1,5),h:rand(220,320)});
    if (dots.length>40) dots.shift();
  }
  function rand(a,b){return Math.random()*(b-a)+a}
  let px=-9999,py=-9999;
  document.addEventListener('mousemove', e=>{ px=e.clientX; py=e.clientY; addDot(px,py); });
  function frame(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for (let i=0;i<dots.length;i++){
      const p = dots[i];
      p.life *= 0.96;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.h},90%,70%,${p.life*0.45})`;
      ctx.arc(p.x, p.y, p.r*p.life, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* TILT EFFECT (lightweight) */
(function(){
  if (prefersReduce) return;
  const tilts = Array.from(document.querySelectorAll('.tilt'));
  tilts.forEach(el=>{
    el.addEventListener('mousemove', ev=>{
      const rect = el.getBoundingClientRect();
      const px = (ev.clientX - rect.left)/rect.width;
      const py = (ev.clientY - rect.top)/rect.height;
      const rx = (py-0.5)*10;
      const ry = (px-0.5)*-10;
      el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      el.style.boxShadow = `${-ry*1.5}px ${rx*1.5}px 30px rgba(30,10,90,0.18)`;
    });
    el.addEventListener('mouseleave', ()=>{el.style.transform=''; el.style.boxShadow='';});
  });
})();

/* LIGHTBOX & PROJECT MODALS */
(function(){
  const lightbox = document.getElementById('lightbox');
  const lbContent = lightbox.querySelector('.lb-content');
  const lbClose = lightbox.querySelector('.lb-close');

  function openImage(src, title=''){
    lbContent.innerHTML = `<img src="${src}" alt="${title}">`;
    lightbox.classList.add('active'); lightbox.setAttribute('aria-hidden','false');
  }
  function openVideo(src, title=''){
    lbContent.innerHTML = `<video controls autoplay playsinline src="${src}" style="max-width:90vw;max-height:80vh;border-radius:8px"></video>`;
    lightbox.classList.add('active'); lightbox.setAttribute('aria-hidden','false');
  }
  lbClose.addEventListener('click', ()=>{ lightbox.classList.remove('active'); lightbox.setAttribute('aria-hidden','true'); lbContent.innerHTML=''; });

  // gallery thumbs
  document.querySelectorAll('.gallery-thumb').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const src = btn.dataset.src;
      if (!src) return;
      openImage(src);
    });
  });

  // project preview buttons & click full card
  document.querySelectorAll('.project-card').forEach(card=>{
    const btn = card.querySelector('.view-project');
    const video = card.dataset.video;
    const thumb = card.dataset.thumb;
    const title = card.dataset.title || '';
    const onOpen = () => {
      if (video) return openVideo(video, title);
      if (thumb) return openImage(thumb, title);
    };
    if (btn) btn.addEventListener('click', (e)=>{ e.stopPropagation(); onOpen(); });
    card.addEventListener('click', ()=> onOpen());
  });

  lightbox.addEventListener('click', (e)=>{ if (e.target === lightbox) { lightbox.classList.remove('active'); lightbox.setAttribute('aria-hidden','true'); lbContent.innerHTML=''; }});
})();

/* CONTACT FORM (REPLACED BY EMAILJS HANDLER LATER)
   The original stub is intentionally removed/replaced by the EmailJS handler below.
*/

/* SOUND-REACTIVE ORBS (Uses WebAudio) */
(function(){
  const micBtn = document.getElementById('mic-enable');
  const demoBtn = document.getElementById('audio-demo');
  let audioCtx = null, analyser = null, source = null, dataArr = null, rafId = null;
  const orbs = document.querySelectorAll('.orb');

  function initAnalyserFromAudio(audioEl){
    if (audioCtx) audioCtx.close();
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    dataArr = new Uint8Array(analyser.frequencyBinCount);
    source = audioCtx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    run();
  }

  function initAnalyserFromStream(stream){
    if (audioCtx) audioCtx.close();
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    dataArr = new Uint8Array(analyser.frequencyBinCount);
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    run();
  }

  function run(){
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArr);
    const avg = dataArr.reduce((s,v)=>s+v,0)/(dataArr.length||1);
    const level = avg/255; // 0..1
    // scale orbs
    orbs.forEach((o,i)=>{
      const scl = 1 + level*(0.4 + i*0.15);
      o.style.transform = `scale(${scl}) translateZ(0)`;
      o.style.opacity = 0.6 + level*0.6;
    });
    rafId = requestAnimationFrame(run);
  }

  // demo audio: small internal audio element
  if (demoBtn){
    const demoAudio = document.createElement('audio');
    demoAudio.src = 'demo-audio.mp3'; // replace or remove; if not provided remains silent
    demoAudio.crossOrigin = 'anonymous';
    demoBtn.addEventListener('click', ()=>{
      demoAudio.play().catch(()=>{});
      initAnalyserFromAudio(demoAudio);
    });
  }

  if (micBtn){
    micBtn.addEventListener('click', async ()=>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        initAnalyserFromStream(stream);
      }catch(e){
        console.warn('Microphone permission denied or unavailable', e);
      }
    });
  }
})();

/* PREFERS-REDUCED-MOTION handled earlier */

/* HELPER rand used in few places */
function rand(a,b){return Math.random()*(b-a)+a}

