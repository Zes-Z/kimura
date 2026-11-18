(() => {
  const gallery = document.querySelector('#notes-gallery');
  if (!gallery) return;

  const viewport = gallery.querySelector('.notes-gallery-viewport');
  const originals = [...viewport.querySelectorAll('.notes-gallery-card')];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const count = originals.length;
  if (!count) return;

  const wrap = value => ((value % count) + count) % count;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const sideSlots = Math.max(6, count * 2);
  const cards = [];
  for (let slot = -sideSlots; slot <= sideSlots + count; slot++) {
    const card = originals[wrap(slot)].cloneNode(true);
    card.dataset.slot = String(slot);
    card.tabIndex = -1;
    card.setAttribute('aria-hidden', 'true');
    card.addEventListener('dragstart', event => event.preventDefault());
    cards.push({ element: card, slot });
  }
  viewport.replaceChildren(...cards.map(card => card.element));
  gallery.classList.add('is-enhanced');

  let width = 1;
  let height = 1;
  let cardWidth = 1;
  let spacing = 1;
  let radius = 1;
  let position = 0;
  let target = 0;
  let activeElement = null;
  let frameId = 0;
  let lastTime = 0;
  let visible = true;
  let hovered = false;
  let keyboardFocus = false;
  let holdUntil = 0;
  let suppressClickUntil = 0;
  let drag = null;

  function measure() {
    const previous = spacing;
    width = Math.max(1, viewport.clientWidth);
    height = Math.max(1, viewport.clientHeight);
    cardWidth = cards[0].element.offsetWidth;
    spacing = cardWidth * (width < 700 ? 1.18 : 1.2);
    if (previous > 1) {
      position *= spacing / previous;
      target *= spacing / previous;
    }
    const depth = 3.2 * height / 16.57;
    const half = Math.max(width, height * 1.9) / 2;
    radius = (half * half + depth * depth) / (2 * depth);
    draw();
    wake();
  }

  function draw() {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const card of cards) {
      const x = card.slot * spacing - position;
      const distance = Math.abs(x);
      const reach = Math.min(distance, radius * .999);
      const arc = radius - Math.sqrt(radius * radius - reach * reach);
      const angle = Math.sign(x) * Math.asin(reach / radius);
      const scale = 1 - Math.min(.15, distance / spacing * .075);
      const edge = clamp((width * .5 + cardWidth * .5 - distance) / (cardWidth * .7), 0, 1);
      const element = card.element;

      element.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${arc.toFixed(2)}px), 0) rotate(${angle.toFixed(4)}rad) scale(${scale.toFixed(3)})`;
      element.style.opacity = String(edge);
      element.style.zIndex = String(Math.max(1, 1000 - Math.round(distance)));
      element.style.pointerEvents = edge < .08 ? 'none' : '';
      element.style.filter = `saturate(${(1 - Math.min(.22, distance / spacing * .11)).toFixed(3)})`;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = element;
      }
    }

    if (nearest !== activeElement) {
      const hadCardFocus = activeElement === document.activeElement;
      if (activeElement) {
        activeElement.tabIndex = -1;
        activeElement.setAttribute('aria-hidden', 'true');
        activeElement.removeAttribute('aria-current');
      }
      activeElement = nearest;
      if (activeElement) {
        activeElement.tabIndex = 0;
        activeElement.removeAttribute('aria-hidden');
        activeElement.setAttribute('aria-current', 'true');
        if (hadCardFocus) activeElement.focus({ preventScroll: true });
      }
    }
  }

  function wake() {
    if (!frameId && visible && !document.hidden) frameId = requestAnimationFrame(tick);
  }

  function tick(now) {
    frameId = 0;
    if (!visible || document.hidden) {
      lastTime = 0;
      return;
    }
    const dt = lastTime ? clamp((now - lastTime) / 1000, 0, .05) : 1 / 60;
    lastTime = now;
    const auto = !motionPreference.matches && !hovered && !keyboardFocus && !drag && now > holdUntil;
    if (auto) target += spacing * .2 * dt;
    position += (target - position) * (motionPreference.matches ? 1 : 1 - Math.exp(-dt / .18));
    if (Math.abs(target - position) < .05) position = target;

    // Shift by a whole cycle so the article covers repeat without a seam.
    if (!drag) {
      const cycle = count * spacing;
      while (position > cycle * 1.5) {
        position -= cycle;
        target -= cycle;
      }
      while (position < -cycle * .5) {
        position += cycle;
        target += cycle;
      }
    }
    draw();
    if (auto || position !== target || drag) wake();
    else lastTime = 0;
  }

  function step(direction) {
    target = (Math.round(target / spacing) + direction) * spacing;
    holdUntil = performance.now() + 2400;
    wake();
  }

  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    keyboardFocus = true;
    step(event.key === 'ArrowRight' ? 1 : -1);
  });
  gallery.addEventListener('focusin', event => {
    if (event.target.matches(':focus-visible')) keyboardFocus = true;
  });
  gallery.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      keyboardFocus = !!gallery.querySelector(':focus-visible');
      wake();
    });
  });
  viewport.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') hovered = true;
  });
  viewport.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') {
      hovered = false;
      wake();
    }
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: target,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
      touch: event.pointerType !== 'mouse',
    };
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (drag.touch && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        drag = null;
        return;
      }
      if (Math.abs(dx) < 6) return;
      drag.moved = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
    }
    target = drag.start - dx * 1.18;
    const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
    drag.velocity = (drag.lastX - event.clientX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    wake();
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) {
      target += clamp(drag.velocity, -2.5, 2.5) * 165;
      suppressClickUntil = performance.now() + 300;
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    }
    drag = null;
    holdUntil = performance.now() + 1800;
    wake();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  viewport.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
    event.preventDefault();
    target += (event.deltaX || event.deltaY) * .9;
    holdUntil = performance.now() + 1800;
    wake();
  }, { passive: false });

  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(viewport);
  else window.addEventListener('resize', measure);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      lastTime = 0;
      if (visible) wake();
    }, { rootMargin: '100px' }).observe(gallery);
  }
  document.addEventListener('visibilitychange', () => {
    lastTime = 0;
    if (!document.hidden) wake();
  });
  motionPreference.addEventListener('change', wake);
  measure();
})();
