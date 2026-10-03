(() => {
  const slides = [...document.querySelectorAll('.world-slide')];
  const controls = document.querySelector('.world-carousel-controls');
  if (slides.length < 2 || !controls) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.getElementById('world-pause');
  const next = document.getElementById('world-next');
  const label = document.getElementById('world-character');
  let index = 0;
  let paused = motion.matches;
  let timer;
  function advance() {
    const upcoming = (index + 1) % slides.length;
    const image = slides[upcoming];
    if (!image.complete || !image.naturalWidth) return;
    slides[index].classList.remove('is-active');
    index = upcoming;
    image.classList.add('is-active');
    label.textContent = image.dataset.character;
  }
  function sync() {
    clearInterval(timer);
    pause.textContent = paused ? 'Spustit střídání' : 'Pozastavit střídání';
    if (!paused && !document.hidden) timer = setInterval(advance, 6500);
  }
  slides.forEach(image => { image.loading = 'eager'; });
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  next.addEventListener('click', () => { advance(); sync(); });
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  controls.hidden = false;
  sync();
})();
