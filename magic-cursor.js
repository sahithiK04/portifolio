/**
 * MAGIC GLOWING WHITE LIGHT CURSOR WITH EMITTED PARTICLES
 * - Flowing, silky glowing white line trail that follows the cursor
 * - Multi-layer radiant glow with bright pure white core filament
 * - Continuously emits sparkling, twinkling luminous particles along the line
 * - Soft pulsing glowing white light orb when idle with gentle particle emissions
 * - Ultra-smooth curve interpolation and Retina/HiDPI support
 */

class MagicLightCursor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.id = 'magic-cursor-canvas';

    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999999;
      pointer-events: none;
      width: 100vw;
      height: 100vh;
    `;

    document.body.appendChild(this.canvas);

    // Coordinate & Movement tracking
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.isMoving = false;
    this.isVisible = false;
    this.moveTimer = null;

    // Trail & Particle state
    this.trailPoints = [];
    this.sparkles = [];
    this.time = 0;
    this.maxTrailLength = 36;
    this.trailAlpha = 0;

    // Device Pixel Ratio
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();

    this.initListeners();
    this.animate();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  initListeners() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    window.addEventListener('mousedown', (e) => {
      this.emitBurst(e.clientX, e.clientY, 14);
    });

    window.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.isMoving = false;
      this.trailAlpha = 0;
    });

    window.addEventListener('mouseenter', (e) => {
      this.isVisible = true;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
  }

  onMouseMove(e) {
    this.isVisible = true;
    const curX = e.clientX;
    const curY = e.clientY;

    const dx = curX - this.mouseX;
    const dy = curY - this.mouseY;
    const dist = Math.hypot(dx, dy);

    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.mouseX = curX;
    this.mouseY = curY;
    this.isMoving = true;
    this.trailAlpha = 1;

    // If mouse moved fast, interpolate intermediate points for a continuous silky line
    if (dist > 18) {
      const steps = Math.min(5, Math.floor(dist / 12));
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        this.trailPoints.push({
          x: this.lastMouseX + dx * t,
          y: this.lastMouseY + dy * t,
          life: 1,
          age: 0
        });
      }
    }

    // Add current trail point
    this.trailPoints.push({
      x: this.mouseX,
      y: this.mouseY,
      life: 1,
      age: 0
    });

    // Continuously emit glowing particles as the line flows
    const numParticles = dist > 20 ? 2 : 1;
    for (let k = 0; k < numParticles; k++) {
      if (Math.random() > 0.3) {
        const spread = 14;
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.5 + Math.random() * 1.6;
        this.sparkles.push({
          x: this.mouseX + (Math.random() - 0.5) * spread,
          y: this.mouseY + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * spd + (dx * 0.08),
          vy: Math.sin(angle) * spd + (dy * 0.08) - 0.35,
          life: 1.0,
          age: 0,
          maxLife: 0.6 + Math.random() * 0.5,
          size: 1.2 + Math.random() * 2.0,
          hasGlint: Math.random() > 0.6
        });
      }
    }

    // Limit trail length
    while (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }

    // Reset move timer
    clearTimeout(this.moveTimer);
    this.moveTimer = setTimeout(() => {
      this.isMoving = false;
    }, 90);
  }

  emitBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 1.2 + Math.random() * 2.6;
      this.sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 1.0,
        age: 0,
        maxLife: 0.7 + Math.random() * 0.5,
        size: 1.5 + Math.random() * 2.4,
        hasGlint: Math.random() > 0.5
      });
    }
  }

  updateTrail() {
    for (let i = 0; i < this.trailPoints.length; i++) {
      const point = this.trailPoints[i];
      point.age += 0.024;
      point.life = Math.max(0, 1 - point.age);
    }
    this.trailPoints = this.trailPoints.filter((p) => p.life > 0);
  }

  updateSparkles() {
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.age += 0.018;
      s.life = Math.max(0, 1 - s.age / s.maxLife);
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.96;
      s.vy = s.vy * 0.96 - 0.04; // Gentle upward stardust float
      if (s.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  drawTrail() {
    const pts = this.trailPoints;
    if (pts.length < 2) return;

    // 1. Broad outer soft glowing path
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) * 0.5;
      const yc = (pts[i].y + pts[i + 1].y) * 0.5;
      this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    this.ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * this.trailAlpha})`;
    this.ctx.lineWidth = 7.0;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = `rgba(255, 255, 255, ${0.9 * this.trailAlpha})`;
    this.ctx.shadowBlur = 18;
    this.ctx.stroke();
    this.ctx.restore();

    // 2. Mid radiant white light beam
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) * 0.5;
      const yc = (pts[i].y + pts[i + 1].y) * 0.5;
      this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    this.ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * this.trailAlpha})`;
    this.ctx.lineWidth = 3.2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = `rgba(255, 255, 255, ${0.75 * this.trailAlpha})`;
    this.ctx.shadowBlur = 10;
    this.ctx.stroke();
    this.ctx.restore();

    // 3. Ultra-crisp laser center core filament
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) * 0.5;
      const yc = (pts[i].y + pts[i + 1].y) * 0.5;
      this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    this.ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${1.0 * this.trailAlpha})`;
    this.ctx.lineWidth = 1.6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    this.ctx.restore();

    // 4. Subtle per-point radial halos for natural taper
    for (let i = 0; i < pts.length; i += 2) {
      const p = pts[i];
      const alpha = p.life * this.trailAlpha;
      const radius = (i / pts.length) * 9 * alpha + 2;

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.15})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawSparkles() {
    for (let i = 0; i < this.sparkles.length; i++) {
      const s = this.sparkles[i];
      const alpha = Math.max(0, s.life * 0.9);
      const size = s.size * (0.6 + 0.4 * s.life);

      // Soft glow halo
      const haloGrad = this.ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size * 3.2);
      haloGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.85})`);
      haloGrad.addColorStop(0.4, `rgba(240, 248, 255, ${alpha * 0.3})`);
      haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = haloGrad;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, size * 3.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Bright pure white center sparkle
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, Math.max(0.6, size * 0.6), 0, Math.PI * 2);
      this.ctx.fill();

      // 4-point micro-glint
      if (s.hasGlint && s.life > 0.4) {
        const flare = size * 1.8 * s.life;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
        this.ctx.lineWidth = 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(s.x - flare, s.y);
        this.ctx.lineTo(s.x + flare, s.y);
        this.ctx.moveTo(s.x, s.y - flare);
        this.ctx.lineTo(s.x, s.y + flare);
        this.ctx.stroke();
      }
    }
  }

  drawIdleDot() {
    if (!this.isVisible) return;

    // Glowing white pulsing light orb when stationary
    const pulse = Math.sin(this.time * 0.06) * 0.25 + 0.75;
    const dotSize = 4.5 * pulse;
    const alpha = Math.sin(this.time * 0.06) * 0.25 + 0.75;

    // Outer radiant halo
    const glowGrad = this.ctx.createRadialGradient(
      this.mouseX, this.mouseY, 0,
      this.mouseX, this.mouseY, dotSize * 4.5
    );
    glowGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.65})`);
    glowGrad.addColorStop(0.4, `rgba(240, 248, 255, ${alpha * 0.25})`);
    glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, dotSize * 4.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Bright solid white core
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, dotSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Gentle idle sparkle emission
    if (this.time % 18 === 0 && Math.random() > 0.4) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.3 + Math.random() * 0.6;
      this.sparkles.push({
        x: this.mouseX,
        y: this.mouseY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.4,
        life: 1.0,
        age: 0,
        maxLife: 0.7 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 1.6,
        hasGlint: Math.random() > 0.6
      });
    }
  }

  animate = () => {
    this.time++;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update
    this.updateTrail();
    this.updateSparkles();

    // Draw
    if (this.isMoving && this.trailPoints.length > 0) {
      this.drawTrail();
      this.drawSparkles();
    } else {
      if (this.trailAlpha > 0.02 && this.trailPoints.length > 0) {
        this.drawTrail();
      }
      this.drawSparkles();
      this.drawIdleDot();
    }

    // Fade trail alpha when stationary
    if (!this.isMoving) {
      this.trailAlpha = Math.max(0, this.trailAlpha - 0.05);
    }

    requestAnimationFrame(this.animate);
  };
}

// Initialize on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.magicCursorInstance = new MagicLightCursor();
  });
} else {
  window.magicCursorInstance = new MagicLightCursor();
}
