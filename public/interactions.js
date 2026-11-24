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
const heroVideo = document.querySelector('.hero-media video');
if (heroVideo) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  const syncVideo = () => {
    if (motion.matches || !visible || document.hidden) heroVideo.pause();
    else heroVideo.play().catch(() => {});
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      syncVideo();
    }, { threshold: 0 }).observe(heroVideo);
  }
  motion.addEventListener('change', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  syncVideo();
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

