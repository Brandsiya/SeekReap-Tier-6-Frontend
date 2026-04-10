const el = document.getElementById('percentageCounter');
    const duration = 3000;
    const start = performance.now();

    (function tick(now) {
      const pct = Math.min(Math.floor(((now - start) / duration) * 100), 100);
      el.textContent = pct + '%';
      if (pct < 100) requestAnimationFrame(tick);
    })(start);

    setTimeout(() => {
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = 'home.html'; }, 600);
    }, 5000);
