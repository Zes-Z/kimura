const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

function initChapters() {
  const chapters = Array.from(document.querySelectorAll('[data-chapter]'), section => ({
    section,
    heading: section.querySelector('h2'),
    media: section.querySelector('.journey-carousel, .ticket-grid, .closing-panel, .archive-empty'),
  }));
  let frame = 0;

  const between = (top, start, end, height) => {
    const progress = Math.max(0, Math.min(1, (height * start - top) / (height * (start - end))));
    return progress * progress * (3 - 2 * progress);
  };

  function render() {
    frame = 0;
    const height = window.innerHeight;
    const reduced = motionPreference.matches;

    // Read the untransformed section anchors before writing animated styles.
    const positions = chapters.map(({ heading, media }) => ({
      title: heading?.getBoundingClientRect().top ?? section.getBoundingClientRect().top,
      media: media?.getBoundingClientRect().top ?? section.getBoundingClientRect().top,
    }));

    chapters.forEach(({ section }, index) => {
      const position = positions[index];
      const progress = (top, start, end) => reduced ? 1 : between(top, start, end, height);
      section.style.setProperty('--title-open', progress(position.title, .94, .66));
      section.style.setProperty('--line-open', progress(position.title, .87, .56));
      section.style.setProperty('--copy-open', progress(position.title, .80, .52));
      section.style.setProperty('--media-open', progress(position.media, .94, .44));
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  motionPreference.addEventListener('change', schedule);
  document.fonts?.ready.then(schedule);
  render();
}

initChapters();
