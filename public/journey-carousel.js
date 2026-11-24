/* Adapted from React Bits Circular Carousel by David Haz.
   Copyright (c) 2026 David Haz. See THIRD_PARTY_NOTICES.md. */
(() => {
  const carousel = document.querySelector('#journey-carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('#journey-viewport');
  const stage = carousel.querySelector('.journey-stage');
  const camera = carousel.querySelector('#journey-camera');
  const ring = carousel.querySelector('#journey-ring');
  const cards = [...ring.querySelectorAll('.journey-card')];
  const uniqueCards = cards.filter(card => card.dataset.copy === '0');
  const lightbox = document.querySelector('#journey-lightbox');
  const lightboxImage = lightbox?.querySelector('#journey-lightbox-image');
  const lightboxCaption = lightbox?.querySelector('#journey-lightbox-caption');
  const lightboxCount = lightbox?.querySelector('#journey-lightbox-count');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const gap = Number(carousel.dataset.gap) || 60;
  const perspective = Number(carousel.dataset.perspective) || 3200;
  const curve = Number(carousel.dataset.curve) || 0;
  const radians = Math.PI / 180;
  const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

  let openIndex = 0;
  let lastTrigger = null;
  function showImage(index) {
    if (!uniqueCards.length || !lightboxImage) return;
    openIndex = (index + uniqueCards.length) % uniqueCards.length;
    const tile = uniqueCards[openIndex].querySelector('.journey-tile');
    lightboxImage.src = tile.dataset.src;
    lightboxImage.alt = tile.dataset.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = tile.dataset.caption || tile.dataset.alt || '';
    if (lightboxCount) lightboxCount.textContent = String(openIndex + 1).padStart(2, '0') + ' / ' + String(uniqueCards.length).padStart(2, '0');
  }
  function openLightbox(index, trigger) {
    if (!lightbox || lightbox.open) return;
    lastTrigger = trigger;
    showImage(index);
    lightbox.showModal();
    document.documentElement.classList.add('is-lightbox-open');
  }
  lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
  lightbox?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showImage(openIndex - 1));
  lightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showImage(openIndex + 1));
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox?.addEventListener('close', () => {
    document.documentElement.classList.remove('is-lightbox-open');
    lightboxImage?.removeAttribute('src');
    if (lastTrigger?.tabIndex === 0) lastTrigger.focus({ preventScroll: true });
    else viewport.focus({ preventScroll: true });
    if (!carousel.classList.contains('is-static')) wake();
  });
  lightbox?.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showImage(openIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });

  if (reducedMotion.matches || cards.length < 3) {
    carousel.classList.add('is-static');
    uniqueCards.forEach(card => {
      card.removeAttribute('aria-hidden');
      const tile = card.querySelector('.journey-tile');
      tile.tabIndex = 0;
      tile.addEventListener('click', () => openLightbox(Number(card.dataset.index), tile));
    });
    return;
  }

  // React Bits uses a chord radius. Solve its chord equation for each pair
  // of unequal-width images so the requested 60px neighbor gap stays even.
  let bases = [];
  let radius = 1;
  let fit = 1;
  let activeIndex = -1;
  let visible = true;
  let frameId = 0;
  let lastFrame = 0;
  let wheelTimer = 0;
  let press = null;
  let suppressClickUntil = 0;
  const state = {
    angle: 0,
    velocity: 0,
    target: null,
    direction: -1,
    hover: false,
    drag: false,
    holdUntil: 0,
  };

  function nearestSlot(angle = state.angle) {
    let nearest = 0;
    let distance = Infinity;
    bases.forEach((base, index) => {
      const next = Math.abs(wrap(base + angle));
      if (next < distance) {
        nearest = index;
        distance = next;
      }
    });
    return nearest;
  }
  function targetFor(index, angle = state.angle) {
    return angle + wrap(-bases[index] - angle);
  }
  function focusSlot(index) {
    state.target = targetFor(index);
    state.holdUntil = performance.now() + 2800;
    wake();
  }
  function stepBy(direction) {
    if (!bases.length) return;
    const current = nearestSlot(state.target ?? state.angle);
    focusSlot((current + direction + cards.length) % cards.length);
  }

  function measure() {
    const tile = cards[0]?.querySelector('.journey-tile');
    const imageHeight = tile ? parseFloat(getComputedStyle(tile).height) : 0;
    if (!imageHeight || !viewport.clientWidth) return;

    const widths = cards.map(card => {
      const ratio = Number.parseFloat(card.style.getPropertyValue('--card-ratio')) || 1;
      const width = imageHeight * ratio;
      card.style.setProperty('--card-width', width + 'px');
      return width;
    });
    const pitches = widths.map((width, index) => (width + widths[(index + 1) % widths.length]) / 2 + gap);
    const arc = pitches.reduce((sum, pitch) => sum + pitch, 0) / (2 * Math.PI);
    let low = Math.max(...pitches) / 2 + .001;
    let high = Math.max(arc * 2, low * 2);
    const angleSum = value => pitches.reduce((sum, pitch) => sum + 2 * Math.asin(clamp(pitch / (2 * value), -1, 1)), 0);
    while (angleSum(high) > 2 * Math.PI) high *= 2;
    for (let i = 0; i < 40; i++) {
      const middle = (low + high) / 2;
      if (angleSum(middle) > 2 * Math.PI) low = middle;
      else high = middle;
    }
    const chord = high;
    radius = Math.max(chord + (arc - chord) * curve, Math.max(...widths) * .6);
    const steps = pitches.map(pitch => 2 * Math.asin(clamp(pitch / (2 * chord), -1, 1)) / radians);
    let base = 0;
    bases = steps.map((_, index) => {
      const current = base;
      base += steps[index];
      return current;
    });

    // The reference fits the projected cylinder into its view. Use the
    // widest image for this bound because the archive allows mixed ratios.
    const width = Math.max(...widths);
    const tilt = -5 * radians;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let degrees = -180; degrees <= 180; degrees += 7.5) {
      const angle = degrees * radians;
      for (const x of [-width / 2, width / 2]) {
        for (const y of [-imageHeight / 2, imageHeight / 2]) {
          const rx = x * Math.cos(angle) + radius * Math.sin(angle);
          const rz = radius * Math.cos(angle) - x * Math.sin(angle);
          const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
          const z = y * Math.sin(tilt) + rz * Math.cos(tilt) - radius;
          const projection = perspective / (perspective - z);
          minX = Math.min(minX, rx * projection);
          maxX = Math.max(maxX, rx * projection);
          minY = Math.min(minY, ry * projection);
          maxY = Math.max(maxY, ry * projection);
        }
      }
    }
    fit = Math.min(1, viewport.clientWidth * .94 / Math.max(maxX - minX, 1), viewport.clientHeight * .92 / Math.max(maxY - minY, 1));
    // On a narrow screen the full ring can crop; keep the front image legible.
    if (viewport.clientWidth < 700) fit = Math.max(fit, .74);
    const shift = -((minY + maxY) / 2) * fit;
    viewport.style.perspective = perspective + 'px';
    stage.style.transform = 'translate3d(0, ' + shift + 'px, 0) scale(' + fit + ')';
    camera.style.transform = 'translate3d(0, 0, ' + (-radius) + 'px) rotateX(-5deg)';
    cards.forEach((card, index) => {
      card.style.transform = 'rotateY(' + bases[index] + 'deg) translateZ(' + radius + 'px)';
    });
    carousel.classList.add('is-ready');
    render();
    wake();
  }

  function render() {
    if (!bases.length) return;
    ring.style.transform = 'rotateY(' + state.angle + 'deg)';
    cards.forEach((card, index) => {
      const facing = Math.cos(wrap(bases[index] + state.angle) * radians);
      const fade = .55 * Math.pow((1 - facing) / 2, 1.25);
      card.style.setProperty('--cc-depth', fade.toFixed(3));
    });
    const next = nearestSlot();
    if (next !== activeIndex) {
      if (activeIndex >= 0) {
        cards[activeIndex].setAttribute('aria-hidden', 'true');
        cards[activeIndex].querySelector('.journey-tile').tabIndex = -1;
      }
      activeIndex = next;
      cards[next].removeAttribute('aria-hidden');
      cards[next].querySelector('.journey-tile').tabIndex = 0;
    }
  }

  function advance(dt, now) {
    if (state.drag) return true;
    const keyboardFocus = viewport.matches(':focus-visible') || !!viewport.querySelector(':focus-visible');
    const paused = state.hover || document.hidden || !!lightbox?.open || keyboardFocus || now < state.holdUntil;
    const cruise = paused ? 0 : 14 * state.direction;
    if (state.target !== null) {
      let remaining = dt;
      while (remaining > 0) {
        const h = Math.min(remaining, 1 / 240);
        const acceleration = 118 * (state.target - state.angle) - 2 * Math.sqrt(118) * state.velocity;
        state.velocity += acceleration * h;
        state.angle += state.velocity * h;
        remaining -= h;
      }
      if (Math.abs(state.target - state.angle) < .004 && Math.abs(state.velocity) < .03) {
        state.angle = state.target;
        state.velocity = 0;
        state.target = null;
      }
      return true;
    }
    const tau = .18 + .6 * 1.5;
    state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
    state.angle += state.velocity * dt;
    if (cruise === 0 && Math.abs(state.velocity) < 9) {
      const nearest = targetFor(nearestSlot());
      if (Math.abs(nearest - state.angle) > .004) state.target = nearest;
      else state.velocity = 0;
    }
    if (Math.abs(state.angle) > 720 && state.target === null) state.angle = wrap(state.angle);
    return cruise !== 0 || Math.abs(state.velocity) > .01 || state.target !== null || now < state.holdUntil;
  }
  function frame(now) {
    frameId = 0;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 1 / 60;
    lastFrame = now;
    const busy = advance(dt, now);
    render();
    if (busy && visible && !document.hidden) frameId = requestAnimationFrame(frame);
    else lastFrame = 0;
  }
  function wake() {
    if (!frameId && visible && !document.hidden) frameId = requestAnimationFrame(frame);
  }

  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stepBy(event.key === 'ArrowRight' ? 1 : -1);
  });
  viewport.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    state.hover = true;
    wake();
  });
  viewport.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    state.hover = false;
    wake();
  });
  viewport.addEventListener('focusin', wake);
  viewport.addEventListener('focusout', wake);
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || press) return;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: state.angle, origin: 0, moved: false, samples: [] };
    state.target = null;
  });
  window.addEventListener('pointermove', event => {
    if (!press || press.id !== event.pointerId) return;
    const delta = event.clientX - press.x;
    const cross = event.clientY - press.y;
    if (!press.moved) {
      if (Math.abs(delta) < 5) return;
      if (Math.abs(cross) > Math.abs(delta) * 1.2 && event.pointerType !== 'mouse') {
        press = null;
        return;
      }
      press.moved = true;
      press.origin = delta;
      state.drag = true;
      state.velocity = 0;
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(event.pointerId); } catch {}
    }
    const perPixel = 180 / (Math.PI * radius * fit);
    state.angle = press.angle + (delta - press.origin) * perPixel;
    const now = performance.now();
    press.samples.push({ time: now, angle: state.angle });
    while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
    render();
    wake();
  });
  function releasePointer(event) {
    if (!press || press.id !== event.pointerId) return;
    const released = press;
    press = null;
    if (!released.moved) return;
    state.drag = false;
    suppressClickUntil = performance.now() + 250;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    const first = released.samples[0];
    const last = released.samples[released.samples.length - 1];
    const span = first && last ? (last.time - first.time) / 1000 : 0;
    const velocity = span > .008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
    state.velocity = velocity;
    if (Math.abs(velocity) > 60) state.direction = Math.sign(velocity);
    if (state.hover && event.pointerType === 'mouse') {
      const predicted = state.angle + velocity * (.18 + .6 * 1.5) * .55;
      state.target = targetFor(nearestSlot(predicted), predicted);
    }
    wake();
  }
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  viewport.addEventListener('click', event => {
    const tile = event.target.closest('.journey-tile');
    if (!tile) return;
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      return;
    }
    const card = tile.closest('.journey-card');
    const index = cards.indexOf(card);
    if (Math.abs(wrap(bases[index] + state.angle)) > 12) focusSlot(index);
    else openLightbox(Number(card.dataset.index), tile);
  });
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('wheel', event => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    if (!delta) return;
    event.preventDefault();
    const perPixel = 180 / (Math.PI * radius * fit);
    state.target = null;
    state.angle -= delta * perPixel;
    state.velocity = -delta * perPixel * 30;
    state.holdUntil = performance.now() + 1600;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      const predicted = state.angle + state.velocity * .12;
      state.target = targetFor(nearestSlot(predicted), predicted);
      wake();
    }, 140);
    wake();
  }, { passive: false });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) wake();
      else {
        cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrame = 0;
      }
    }).observe(carousel);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    } else wake();
  });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(viewport);
  window.addEventListener('resize', measure);
  measure();
  wake();
})();
