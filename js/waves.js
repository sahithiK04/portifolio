/**
 * PORTFOLIO — Luminous Ribbon Wave Animation
 * Thin glowing wave ribbons + scattered bokeh particles
 * Style: bright white/crimson light streams on deep black
 */
(function () {
  "use strict";

  const cvs = document.getElementById("waves-canvas");
  if (!cvs) return;
  const ctx = cvs.getContext("2d");

  let W = 0, H = 0;

  // ─── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // ─── Wave ribbon definitions ───────────────────────────────────────────────
  // Each ribbon = a flowing sine path drawn in 3 layers (glow → mid → bright center)
  const RIBBONS = [
    { amp: 0.18, freq: 0.9,  speed: 0.28, yFrac: 0.28, phase: 0.0,  color: [255,255,255] },
    { amp: 0.14, freq: 1.1,  speed: 0.22, yFrac: 0.45, phase: 1.2,  color: [255,255,255] },
    { amp: 0.20, freq: 0.75, speed: 0.18, yFrac: 0.62, phase: 2.5,  color: [255,220,220] },
    { amp: 0.10, freq: 1.4,  speed: 0.35, yFrac: 0.35, phase: 0.8,  color: [255,200,200] },
    { amp: 0.16, freq: 0.6,  speed: 0.15, yFrac: 0.72, phase: 3.1,  color: [255,255,255] },
    { amp: 0.12, freq: 1.6,  speed: 0.42, yFrac: 0.20, phase: 1.7,  color: [255,240,240] },
  ];

  // ─── Particle (bokeh dot) definitions ─────────────────────────────────────
  const PARTICLE_COUNT = 120;
  let particles = [];

  function spawnParticle() {
    // Spawn near one of the ribbon paths
    const r = RIBBONS[Math.floor(Math.random() * RIBBONS.length)];
    const t = Math.random();
    const x = t * W;
    const y = r.yFrac * H + Math.sin(r.freq * t * Math.PI * 2 + r.phase) * r.amp * H;
    return {
      x, y,
      ox: x, oy: y,             // origin for drift
      r:  1.5 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: 0.3 + Math.random() * 0.7,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.04,
      life: 0,
      maxLife: 180 + Math.random() * 240,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, spawnParticle);
  }
  initParticles();

  // ─── Draw a single ribbon ─────────────────────────────────────────────────
  function drawRibbon(rb, t) {
    const y0 = rb.yFrac * H;
    const amp = rb.amp * H;
    const [cr, cg, cb] = rb.color;

    // Build path
    const pts = [];
    const segs = Math.ceil(W / 3);
    for (let i = 0; i <= segs; i++) {
      const x = (i / segs) * W;
      const y = y0 + Math.sin(rb.freq * (x / W) * Math.PI * 2 + t * rb.speed + rb.phase) * amp;
      pts.push([x, y]);
    }

    function stroke(lw, alpha, blur) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
      ctx.lineWidth   = lw;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.shadowColor = `rgba(${cr},${cg},${cb},${alpha * 0.8})`;
      ctx.shadowBlur  = blur;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    // Layer 1: wide outer glow
    stroke(90, 0.035, 60);
    // Layer 2: mid glow
    stroke(28, 0.12,  22);
    // Layer 3: inner glow
    stroke(8,  0.45,  10);
    // Layer 4: bright center ribbon
    stroke(1.8, 0.95, 4);
  }

  // ─── Draw particles ───────────────────────────────────────────────────────
  function updateParticles(dt) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life++;
      p.pulse += p.pulseSpeed * dt * 60;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      if (p.life >= p.maxLife) {
        particles[i] = spawnParticle();
        continue;
      }

      // Fade in / fade out
      const progress = p.life / p.maxLife;
      const fade = progress < 0.15
        ? progress / 0.15
        : progress > 0.75
        ? (1 - progress) / 0.25
        : 1;

      const pulsedR = p.r * (0.8 + 0.2 * Math.sin(p.pulse));
      const a = p.alpha * fade;

      // Outer bokeh glow
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedR * 5);
      g.addColorStop(0,    `rgba(255,255,255,${a})`);
      g.addColorStop(0.25, `rgba(255,230,230,${a * 0.5})`);
      g.addColorStop(0.6,  `rgba(255,200,200,${a * 0.15})`);
      g.addColorStop(1,    `rgba(255,200,200,0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulsedR * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Bright dot core
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulsedR * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.shadowColor = `rgba(255,220,220,${a})`;
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }
  }

  // ─── Render loop ──────────────────────────────────────────────────────────
  let last = 0, elapsed = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    // Pure dark background
    ctx.fillStyle = "#050000";
    ctx.fillRect(0, 0, W, H);

    // Draw ribbons with screen blend
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const rb of RIBBONS) drawRibbon(rb, elapsed);
    ctx.restore();

    // Draw particles with screen blend
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    updateParticles(dt);
    ctx.restore();
  }
  requestAnimationFrame(frame);

  // ─── Show/hide based on hero visibility ───────────────────────────────────
  const heroEl = document.getElementById("hero");
  if (heroEl) {
    const obs = new IntersectionObserver(([entry]) => {
      cvs.style.opacity = entry.isIntersecting ? "0" : "1";
    }, { threshold: 0.08 });
    obs.observe(heroEl);
  }

})();
