const counter = document.getElementById('percentageCounter');
const fill    = document.querySelector('.progress-fill');
const DURATION = 3000;
const start    = performance.now();

// Replicates CSS keyframes: t=0→0%, t=0.5→65%, t=1→100%
function ease(t) {
  return t < 0.5 ? t * 1.3 : 0.65 + (t - 0.5) * 0.7;
}

requestAnimationFrame(function tick(now) {
  const t   = Math.min((now - start) / DURATION, 1);
  const pct = Math.round(ease(t) * 100);

  counter.textContent = pct + '%';
  if (fill) fill.style.width = pct + '%';   // JS owns width; no CSS animation

  if (t < 1) {
    requestAnimationFrame(tick);
  } else {
    setTimeout(() => {
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = 'home.html'; }, 500);
    }, 200);
  }
});
