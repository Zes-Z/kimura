(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.tear-ticket').forEach(ticket => {
    const stub = ticket.querySelector('.tear-ticket-stub');
    if (!stub) return;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let pull = 0;

    function setTilt(event) {
      if (reduced.matches || pointerId !== null || ticket.classList.contains('is-torn')) return;
      const bounds = ticket.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      ticket.style.setProperty('--tilt-x', `${(-y * 18).toFixed(2)}deg`);
      ticket.style.setProperty('--tilt-y', `${(x * 18).toFixed(2)}deg`);
    }
    function resetTilt() {
      ticket.style.setProperty('--tilt-x', '0deg');
      ticket.style.setProperty('--tilt-y', '0deg');
    }
    function tear() {
      ticket.classList.remove('is-pulling');
      ticket.classList.add('is-torn');
      stub.style.removeProperty('--stub-x');
      stub.style.removeProperty('--stub-y');
      stub.style.removeProperty('--stub-rotate');
      ticket.style.setProperty('--pull', '24px');
      resetTilt();
    }
    function settle() {
      ticket.classList.remove('is-pulling');
      stub.style.removeProperty('--stub-x');
      stub.style.removeProperty('--stub-y');
      stub.style.removeProperty('--stub-rotate');
      ticket.style.setProperty('--pull', '0px');
      resetTilt();
    }

    ticket.addEventListener('pointermove', setTilt);
    ticket.addEventListener('pointerleave', resetTilt);
    ticket.addEventListener('focusout', () => {
      if (!ticket.contains(document.activeElement)) resetTilt();
    });
    stub.addEventListener('pointerdown', event => {
      if (event.button !== 0 || ticket.classList.contains('is-torn')) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      pull = 0;
      stub.setPointerCapture(event.pointerId);
      ticket.classList.add('is-pulling');
      event.preventDefault();
    });
    stub.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;
      const dx = Math.max(0, event.clientX - startX);
      const dy = event.clientY - startY;
      pull = Math.hypot(dx, dy * .55);
      const resistedX = dx * .62;
      const resistedY = dy * .35;
      stub.style.setProperty('--stub-x', `${resistedX.toFixed(1)}px`);
      stub.style.setProperty('--stub-y', `${resistedY.toFixed(1)}px`);
      stub.style.setProperty('--stub-rotate', `${Math.max(-3, Math.min(3, dy / 24)).toFixed(2)}deg`);
      ticket.style.setProperty('--pull', `${Math.min(24, resistedX).toFixed(1)}px`);
    });
    const finish = event => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (stub.hasPointerCapture(event.pointerId)) stub.releasePointerCapture(event.pointerId);
      if (pull >= 24 && event.clientX >= startX + 16) tear();
      else settle();
    };
    stub.addEventListener('pointerup', finish);
    stub.addEventListener('pointercancel', finish);
    stub.addEventListener('click', event => {
      if (event.detail === 0 && !ticket.classList.contains('is-torn')) tear();
    });
  });
})();
