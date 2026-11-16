const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const typing = document.querySelector('#typing');
if (typing && !reduced) {
  const lines = JSON.parse(typing.dataset.lines || '[]'); let line = 0, pos = 0, deleting = false;
  const tick = () => { const phrase = lines[line] || ''; typing.textContent = phrase.slice(0,pos); let delay = deleting ? 48 : 90;
    if (!deleting && pos < phrase.length) pos++;
    else if (!deleting) { deleting = true; delay = 3000; }
    else if (pos > 0) pos--;
    else { deleting = false; line = (line+1)%lines.length; delay = 1000; }
    setTimeout(tick,delay);
  };
  if (document.documentElement.classList.contains('hero-intro')) {
    typing.textContent = '';
    setTimeout(tick, 740);
  } else {
    tick();
  }
}
const profile = document.querySelector('#floating-profile');
const profileButton = profile?.querySelector('.floating-trigger');
const profileMenu = profile?.querySelector('.floating-menu');

function closeProfile() {
  profile?.classList.remove('open');
  profileButton?.setAttribute('aria-expanded', 'false');
  profileMenu?.setAttribute('aria-hidden', 'true');
  profileMenu?.setAttribute('inert', '');
}

function syncProfile() {
  profile?.classList.toggle('visible', window.scrollY > window.innerHeight * .48);
  closeProfile();
}

addEventListener('scroll', syncProfile, { passive: true });
syncProfile();

profileButton?.addEventListener('click', event => {
  event.stopPropagation();
  const opened = profile.classList.toggle('open');
  profileButton.setAttribute('aria-expanded', String(opened));
  profileMenu.setAttribute('aria-hidden', String(!opened));
  if (opened) profileMenu.removeAttribute('inert');
  else profileMenu.setAttribute('inert', '');
});
document.addEventListener('pointerdown', event => {
  if (!profile?.contains(event.target)) closeProfile();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeProfile();
    profileButton?.focus({ preventScroll: true });
  }
});

let smoothScroll;
if (window.Lenis && !reduced) {
  smoothScroll = new window.Lenis({
    lerp: .1,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: true,
  });
  const frame = time => {
    smoothScroll.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
const marquee=document.querySelector('#work-marquee');
if(marquee){
  const viewport=marquee.querySelector('#marquee-viewport');
  const track=marquee.querySelector('#marquee-track');
  const sets=[...track.querySelectorAll('.marquee-set')];
  const prev=marquee.querySelector('#marquee-prev');
  const next=marquee.querySelector('#marquee-next');
  if(sets.length===2){
    const autoSpeed=reduced?0:44;
    let seam=0,x=0,velocity=0,factor=reduced?0:1,targetFactor=reduced?0:1;
    let dragging=false,dragStartX=0,dragStartPos=0,lastPointerX=0,lastPointerTime=0,travel=0;
    let dragPointer=null;
    let visible=true,lastTime=0,suppressClickUntil=0;
    const measure=()=>{seam=sets[1].offsetLeft-sets[0].offsetLeft;if(seam<=0)seam=sets[0].offsetWidth;if(seam>0){while(track.scrollWidth<viewport.clientWidth+seam){const copy=sets[0].cloneNode(true);copy.setAttribute('aria-hidden','true');copy.querySelectorAll('a').forEach(link=>link.tabIndex=-1);track.append(copy)}}wrap();apply()};
    const wrap=()=>{if(!seam)return;while(x<=-seam)x+=seam;while(x>0)x-=seam};
    const apply=()=>{track.style.transform=`translate3d(${x.toFixed(2)}px,0,0)`};
    const pause=()=>{targetFactor=0};
    const resume=()=>{if(!dragging)targetFactor=reduced?0:1};
    const tick=time=>{
      const dt=lastTime?Math.min(64,Math.max(0,time-lastTime)):16;lastTime=time;
      factor+=(targetFactor-factor)*(1-Math.exp(-dt/260));
      if(!dragging){
        if(Math.abs(velocity)>.001){x+=velocity*dt;velocity*=Math.exp(-dt/240)}else velocity=0;
        if(visible)x-=autoSpeed*factor*dt/1000;
        wrap();apply();
      }
      requestAnimationFrame(tick);
    };
    const nudge=direction=>{velocity=Math.max(-3,Math.min(3,velocity+direction*2.2));pause()};
    prev?.addEventListener('click',()=>nudge(1));
    next?.addEventListener('click',()=>nudge(-1));
    marquee.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')pause()});
    marquee.addEventListener('pointerleave',resume);
    marquee.addEventListener('focusin',pause);
    marquee.addEventListener('focusout',()=>{if(!marquee.contains(document.activeElement))resume()});
    viewport.addEventListener('pointerdown',e=>{
      if(e.button!==0||dragPointer!==null)return;
      dragPointer=e.pointerId;
      dragging=true;travel=0;dragStartX=e.clientX;dragStartPos=x;
      lastPointerX=e.clientX;lastPointerTime=e.timeStamp||performance.now();velocity=0;pause();
    });
    window.addEventListener('pointermove',e=>{
      if(e.pointerId!==dragPointer)return;
      const dx=e.clientX-dragStartX;
      if(travel<=7){
        if(Math.abs(dx)<=7)return;
        viewport.classList.add('dragging');
        viewport.setPointerCapture(e.pointerId);
      }
      travel=Math.max(travel,Math.abs(dx));x=dragStartPos+dx;
      const now=e.timeStamp||performance.now(),dt=Math.max(1,now-lastPointerTime);
      velocity=velocity*.65+((e.clientX-lastPointerX)/dt)*.35;
      lastPointerX=e.clientX;lastPointerTime=now;wrap();apply();
    });
    const endDrag=e=>{
      if(e.pointerId!==dragPointer)return;
      dragPointer=null;dragging=false;viewport.classList.remove('dragging');
      if(travel>7){velocity=Math.max(-3,Math.min(3,velocity));suppressClickUntil=performance.now()+220}else velocity=0;
      if(e.pointerType!=='mouse'||!marquee.matches(':hover'))resume();
    };
    window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
    viewport.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}},true);
    viewport.addEventListener('dragstart',e=>e.preventDefault());
    viewport.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();x-=e.deltaX;wrap();apply()},{passive:false});
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=!!entry?.isIntersecting},{rootMargin:'120px 0px'}).observe(marquee);
    document.addEventListener('visibilitychange',()=>{visible=!document.hidden;lastTime=0});
    if('ResizeObserver' in window)new ResizeObserver(measure).observe(track);
    addEventListener('resize',measure);document.fonts?.ready.then(measure);measure();requestAnimationFrame(tick);
  }
}
const photoStack = document.querySelector('.photo-stack');
const photoStage = document.querySelector('.photo-stage');
const cards = [...document.querySelectorAll('.photo-card')];
const photoCurrent = document.querySelector('#photo-current');
let previewIndex = -1;

function arrangeFan() {
  if (!photoStack || !cards.length) return;
  const middle = (cards.length - 1) / 2;
  const spread = Math.min(165, photoStack.clientWidth / (cards.length + 1));
  const tilt = Math.min(12, 60 / Math.max(1, cards.length - 1));
  cards.forEach((card, index) => {
    const slot = index - middle;
    card.style.setProperty('--fan-x', `${(slot * spread).toFixed(1)}px`);
    card.style.setProperty('--fan-y', `${(Math.abs(slot) * 18).toFixed(1)}px`);
    card.style.setProperty('--fan-tilt', `${(slot * tilt).toFixed(1)}deg`);
    card.style.setProperty('--fan-rank', String(20 - Math.round(Math.abs(slot))));
  });
}

function previewPhoto(index) {
  previewIndex = index;
  photoStack?.classList.toggle('is-peeking', index >= 0);
  cards.forEach((card, i) => {
    card.classList.toggle('is-peek', i === index);
    const video = card.querySelector('video');
    if (video) {
      if (i === index) video.play().catch(() => {});
      else video.pause();
    }
  });
  if (photoCurrent) photoCurrent.textContent = String(index < 0 ? 1 : index + 1).padStart(2, '0');
}

cards.forEach((card, index) => {
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') previewPhoto(index);
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch' && previewIndex === index) previewPhoto(-1);
  });
  card.addEventListener('focus', () => previewPhoto(index));
  card.addEventListener('click', () => openLightbox(index, card));
});
photoStage?.addEventListener('pointerleave', () => previewPhoto(-1));
photoStage?.addEventListener('focusout', () => {
  requestAnimationFrame(() => {
    if (!photoStage.contains(document.activeElement)) previewPhoto(-1);
  });
});
document.querySelector('#photo-prev')?.addEventListener('click', () => {
  const index = (previewIndex < 0 ? 0 : previewIndex - 1 + cards.length) % cards.length;
  cards[index]?.focus({ preventScroll: true });
});
document.querySelector('#photo-next')?.addEventListener('click', () => {
  const index = (previewIndex + 1) % cards.length;
  cards[index]?.focus({ preventScroll: true });
});
if ('ResizeObserver' in window && photoStack) new ResizeObserver(arrangeFan).observe(photoStack);
else window.addEventListener('resize', arrangeFan);
arrangeFan();

const lightbox = document.querySelector('#gallery-lightbox');
const lightboxMedia = document.querySelector('#lightbox-media');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxCount = document.querySelector('#lightbox-count');
let lightboxIndex = -1;
let lightboxTrigger = null;
let lightboxTimer = 0;

function fitLightboxMedia(element, ratio) {
  if (!element || !Number.isFinite(ratio) || ratio <= 0) return;
  element.dataset.ratio = String(ratio);
  const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth, window.visualViewport?.width || Infinity);
  const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight, window.visualViewport?.height || Infinity);
  const maxWidth = viewportWidth * .9;
  const maxHeight = Math.max(220, viewportHeight - (viewportWidth <= 700 ? 230 : 250));
  const width = Math.min(maxWidth, maxHeight * ratio);
  element.style.width = `${Math.round(width)}px`;
  element.style.height = `${Math.round(width / ratio)}px`;
}

function showLightboxMedia(index) {
  lightboxIndex = (index + cards.length) % cards.length;
  const card = cards[lightboxIndex];
  const source = card?.querySelector('img, video');
  if (!source || !lightboxMedia) return;
  lightboxMedia.replaceChildren();
  if (source.tagName === 'VIDEO') {
    const video = document.createElement('video');
    video.src = source.currentSrc || source.src;
    video.poster = source.poster || '';
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    video.autoplay = true;
    lightboxMedia.appendChild(video);
    fitLightboxMedia(video, source.videoWidth && source.videoHeight ? source.videoWidth / source.videoHeight : 4 / 3);
    video.addEventListener('loadedmetadata', () => fitLightboxMedia(video, video.videoWidth / video.videoHeight), { once: true });
    video.play().catch(() => {});
  } else {
    const image = document.createElement('img');
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || '';
    image.decoding = 'async';
    lightboxMedia.appendChild(image);
    fitLightboxMedia(image, source.naturalWidth && source.naturalHeight ? source.naturalWidth / source.naturalHeight : 4 / 3);
    image.addEventListener('load', () => fitLightboxMedia(image, image.naturalWidth / image.naturalHeight), { once: true });
  }
  if (lightboxCaption) lightboxCaption.textContent = card.querySelector('span')?.textContent || source.alt || '';
  if (lightboxCount) lightboxCount.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
}

window.addEventListener('resize', () => {
  if (lightbox?.hidden) return;
  const media = lightboxMedia?.firstElementChild;
  fitLightboxMedia(media, Number(media?.dataset.ratio));
});

function openLightbox(index, trigger) {
  if (!lightbox || !cards.length) return;
  clearTimeout(lightboxTimer);
  lightboxTrigger = trigger;
  showLightboxMedia(index);
  lightbox.hidden = false;
  lightbox.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('is-lightbox-open');
  document.querySelector('main')?.setAttribute('inert', '');
  profile?.setAttribute('inert', '');
  closeProfile();
  smoothScroll?.stop();
  requestAnimationFrame(() => lightbox.classList.add('is-open'));
  lightbox.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.classList.remove('is-open');
  const finish = () => {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxMedia?.replaceChildren();
    document.documentElement.classList.remove('is-lightbox-open');
    document.querySelector('main')?.removeAttribute('inert');
    profile?.removeAttribute('inert');
    smoothScroll?.start();
    lightboxTrigger?.focus({ preventScroll: true });
    previewPhoto(-1);
  };
  if (reduced) finish();
  else lightboxTimer = setTimeout(finish, 340);
}

lightbox?.querySelectorAll('[data-lightbox-close]').forEach(element => element.addEventListener('click', closeLightbox));
document.querySelector('#lightbox-prev')?.addEventListener('click', () => showLightboxMedia(lightboxIndex - 1));
document.querySelector('#lightbox-next')?.addEventListener('click', () => showLightboxMedia(lightboxIndex + 1));
document.addEventListener('keydown', event => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); closeLightbox(); }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); showLightboxMedia(lightboxIndex - 1); }
  else if (event.key === 'ArrowRight') { event.preventDefault(); showLightboxMedia(lightboxIndex + 1); }
  else if (event.key === 'Tab') {
    const focusable = [...lightbox.querySelectorAll('button')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === lightbox)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  }
});
if(!reduced && 'IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));

const heroArt=document.querySelector('.hero-art');
if (heroArt && !reduced) {
  let frame = 0;
  let lastTime = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  const animate = time => {
    frame = 0;
    const dt = lastTime ? Math.min(40, time - lastTime) : 16;
    lastTime = time;
    const ease = 1 - Math.exp(-dt / 210);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    heroArt.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
    heroArt.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .08) frame = requestAnimationFrame(animate);
    else lastTime = 0;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(animate); };
  heroArt.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = heroArt.getBoundingClientRect();
    targetX = (event.clientX - rect.left - rect.width / 2) / rect.width * 36;
    targetY = (event.clientY - rect.top - rect.height / 2) / rect.height * 28;
    schedule();
  });
  heroArt.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
    schedule();
  });
}

const copyEmail = document.querySelector('.copy-email');
copyEmail?.addEventListener('click', async () => {
  const address = copyEmail.dataset.copyEmail;
  const label = copyEmail.querySelector('.copy-label');
  if (!address || !label) return;
  let copied = false;
  try {
    await navigator.clipboard.writeText(address);
    copied = true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = address;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    try { copied = document.execCommand('copy'); }
    catch { copied = false; }
    helper.remove();
  }
  if (copied) {
    label.textContent = '已复制';
    copyEmail.classList.add('is-copied');
    clearTimeout(copyEmail.restoreTimer);
    copyEmail.restoreTimer = setTimeout(() => {
      label.textContent = '复制邮箱';
      copyEmail.classList.remove('is-copied');
    }, 2200);
  } else {
    label.textContent = address;
  }
});

