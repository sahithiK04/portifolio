/**
 * FULL-WINDOW EXPANSIVE SPIDERWEB & EMITTED GLOWING PARTICLES
 * - Distinct, unmistakable organic orb-spiderweb geometry
 * - Delicate, luminous silver-moonlight silk threads that are clearly visible
 * - Hairline-thin strokes (0.7px - 0.75px) and zero blinding hub glare so it NEVER dominates text
 * - Spans across the entire width and sides of the browser window
 * - Actively emits streams of tiny glowing stardust particles from spoke ends, rings, and dewdrops
 * - Active from Page 2 all the way to the end pages
 * - Strictly clipped at the top so it NEVER appears on Page 1 (Hero)
 */

(function () {
  'use strict';

  class FullWindowWebAtmosphere {
    constructor() {
      this.wrapper = document.getElementById('content-wrapper');
      this.wrap = document.getElementById('spiderweb-wrap');
      this.canvas = document.getElementById('spiderweb-canvas');
      if (!this.wrapper || !this.wrap || !this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.time = 0;
      this.isActive = false;
      this.rafId = null;

      // Mouse tracking
      this.mouseX = -9999;
      this.mouseY = -9999;
      this.isHovering = false;

      // Web Geometry (Authentic, unmistakable orb spiderweb)
      this.numSpokes = 24;
      this.numRings = 28;
      this.dewDrops = [];
      this.particles = [];
      this.maxParticles = 80;

      // Subtle outward energy pulses
      this.pulseWaves = [];

      this.init();
    }

    init() {
      this.resize();
      this.initDewDrops();

      window.addEventListener('resize', () => {
        this.resize();
        this.initDewDrops();
      });

      // Mouse interaction
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        const rect = this.wrapper.getBoundingClientRect();
        this.isHovering = e.clientY >= rect.top && e.clientY <= rect.bottom;
      });

      // Active across content-wrapper
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.start();
              } else {
                this.stop();
              }
            });
          },
          { threshold: 0.01 }
        );
        observer.observe(this.wrapper);
      } else {
        this.start();
      }
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    getWebCenter() {
      return {
        x: this.width * 0.5,
        y: this.height * 0.46
      };
    }

    getMaxWebRadius() {
      // Extends all the way past the window borders and corners
      return Math.hypot(this.width * 0.52, this.height * 0.52) * 1.08;
    }

    initDewDrops() {
      this.dewDrops = [];
      const maxR = this.getMaxWebRadius();

      for (let ring = 2; ring <= this.numRings; ring++) {
        const rRatio = ring / this.numRings;
        const radius = maxR * Math.pow(rRatio, 1.2);

        for (let spoke = 0; spoke < this.numSpokes; spoke++) {
          // Deterministic scatter of glistening morning dewdrops on intersections
          const hash = Math.sin(ring * 37.1 + spoke * 53.7) * 10000;
          const rand = hash - Math.floor(hash);

          // ~22% of intersections hold sparkling dewdrops
          if (rand > 0.78) {
            const angle = (spoke / this.numSpokes) * Math.PI * 2;
            this.dewDrops.push({
              angle: angle,
              radius: radius,
              baseSize: 1.2 + rand * 1.3,
              pulseSpeed: 0.03 + rand * 0.035,
              phase: rand * Math.PI * 2,
              ring: ring,
              spoke: spoke
            });
          }
        }
      }
    }

    start() {
      if (this.isActive) return;
      this.isActive = true;
      this.resize();
      this.loop();
    }

    stop() {
      this.isActive = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    emitParticle(originX, originY, vx, vy, size, alpha = 0.8, decayRate = 0.007) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const isWarm = Math.random() > 0.65;
      const color = isWarm ? '255, 244, 232' : '235, 245, 255';

      this.particles.push({
        x: originX,
        y: originY,
        vx: vx,
        vy: vy,
        size: size,
        alpha: alpha,
        life: 1.0,
        decay: decayRate,
        twinkleSpeed: 0.07 + Math.random() * 0.1,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: color,
        hasCrossGlint: Math.random() > 0.65,
        swaySpeed: 0.025 + Math.random() * 0.03,
        swayOffset: Math.random() * Math.PI * 2
      });
    }

    spawnActiveEmissions() {
      const center = this.getWebCenter();
      const maxR = this.getMaxWebRadius();
      const webPulse = Math.sin(this.time * 0.03) * 0.03 + 0.97;

      // 1. ACTIVE CONTINUOUS EMISSION AT THE SIDES & SPOKE ENDS
      // Streams tiny glowing stardust motes off the outer window edges
      if (this.time % 2 === 0) {
        const spokeIndex = Math.floor(Math.random() * this.numSpokes);
        const angle = (spokeIndex / this.numSpokes) * Math.PI * 2;
        const endR = maxR * webPulse;
        const endX = center.x + Math.cos(angle) * endR;
        const endY = center.y + Math.sin(angle) * endR;

        const sprayAngle = angle + (Math.random() - 0.5) * 0.55;
        const speed = 0.5 + Math.random() * 1.1;
        const vx = Math.cos(sprayAngle) * speed;
        const vy = Math.sin(sprayAngle) * speed - (0.15 + Math.random() * 0.3);
        const size = 0.9 + Math.random() * 1.5;

        this.emitParticle(endX, endY, vx, vy, size, 0.88, 0.006 + Math.random() * 0.006);
      }

      // Periodic sparkling wave along all outer spoke tips at the sides
      if (this.time % 65 === 0) {
        for (let i = 0; i < this.numSpokes; i += 2) {
          const a = (i / this.numSpokes) * Math.PI * 2;
          const endX = center.x + Math.cos(a) * (maxR * webPulse);
          const endY = center.y + Math.sin(a) * (maxR * webPulse);
          const spd = 0.6 + Math.random() * 1.0;
          this.emitParticle(
            endX,
            endY,
            Math.cos(a) * spd,
            Math.sin(a) * spd - 0.22,
            1.1 + Math.random() * 1.5,
            0.92,
            0.006 + Math.random() * 0.005
          );
        }
      }

      // 2. Delicate drift from web center (tiny stardust only, no bright spotlight)
      if (this.time % 4 === 0) {
        const hubA = Math.random() * Math.PI * 2;
        const hubR = Math.random() * 14;
        const spd = 0.3 + Math.random() * 0.6;
        this.emitParticle(
          center.x + Math.cos(hubA) * hubR,
          center.y + Math.sin(hubA) * hubR,
          Math.cos(hubA) * spd,
          Math.sin(hubA) * spd - 0.2,
          0.9 + Math.random() * 1.3,
          0.72,
          0.006 + Math.random() * 0.005
        );
      }

      // 3. Dewdrops emitting gentle radiant micro-sparks across the web
      if (this.time % 3 === 0 && this.dewDrops.length > 0) {
        const drop = this.dewDrops[Math.floor(Math.random() * this.dewDrops.length)];
        const dx = center.x + Math.cos(drop.angle) * (drop.radius * webPulse);
        const dy = center.y + Math.sin(drop.angle) * (drop.radius * webPulse);
        const randA = Math.random() * Math.PI * 2;
        const spd = 0.25 + Math.random() * 0.5;
        this.emitParticle(
          dx,
          dy,
          Math.cos(randA) * spd,
          Math.sin(randA) * spd - 0.22,
          1.0 + Math.random() * 1.4,
          0.82,
          0.007 + Math.random() * 0.006
        );
      }

      // 4. Stardust particles softly detaching from concentric web arches
      if (this.time % 4 === 0) {
        const rRatio = 0.15 + Math.random() * 0.85;
        const a = Math.random() * Math.PI * 2;
        const px = center.x + Math.cos(a) * (maxR * Math.pow(rRatio, 1.2) * webPulse);
        const py = center.y + Math.sin(a) * (maxR * Math.pow(rRatio, 1.2) * webPulse);
        this.emitParticle(
          px,
          py,
          (Math.random() - 0.5) * 0.4,
          -0.28 - Math.random() * 0.35,
          0.9 + Math.random() * 1.4,
          0.75,
          0.006 + Math.random() * 0.006
        );
      }

      // Outward energy ripple traveling along web threads
      if (this.time % 140 === 0) {
        this.pulseWaves.push({
          radius: 0,
          speed: 4.6,
          maxRadius: maxR * webPulse,
          alpha: 0.8
        });
      }
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx + Math.sin(this.time * p.swaySpeed + p.swayOffset) * 0.25;
        p.y += p.vy;
        p.vx *= 0.993;
        p.vy = p.vy * 0.993 - 0.012;
        p.life -= p.decay;

        // Interactive mouse breeze
        if (this.isHovering) {
          const dCursor = Math.hypot(this.mouseX - p.x, this.mouseY - p.y);
          if (dCursor < 140 && dCursor > 6) {
            const force = ((140 - dCursor) / 140) * 0.18;
            p.vx += ((p.x - this.mouseX) / dCursor) * force;
            p.vy += ((p.y - this.mouseY) / dCursor) * force;
          }
        }

        if (p.life <= 0 || p.y < -40 || p.x < -40 || p.x > this.width + 40) {
          this.particles.splice(i, 1);
        }
      }

      for (let i = this.pulseWaves.length - 1; i >= 0; i--) {
        const pw = this.pulseWaves[i];
        pw.radius += pw.speed;
        pw.alpha = Math.max(0, 1 - (pw.radius / pw.maxRadius));
        if (pw.radius >= pw.maxRadius || pw.alpha <= 0) {
          this.pulseWaves.splice(i, 1);
        }
      }
    }

    drawWeb() {
      const center = this.getWebCenter();
      const maxR = this.getMaxWebRadius();
      const webPulse = Math.sin(this.time * 0.03) * 0.03 + 0.97;

      // 1. RADIAL SPOKES (Unmistakable spiderweb foundation, hairline silk)
      for (let i = 0; i < this.numSpokes; i++) {
        const angle = (i / this.numSpokes) * Math.PI * 2;
        const outerX = center.x + Math.cos(angle) * (maxR * webPulse);
        const outerY = center.y + Math.sin(angle) * (maxR * webPulse);

        // Luminous celestial silver silk gradient: clearly recognizable spiderweb threads
        const grad = this.ctx.createLinearGradient(center.x, center.y, outerX, outerY);
        grad.addColorStop(0, 'rgba(235, 245, 255, 0.35)');
        grad.addColorStop(0.3, 'rgba(230, 242, 255, 0.26)');
        grad.addColorStop(0.7, 'rgba(220, 235, 255, 0.18)');
        grad.addColorStop(1, 'rgba(215, 230, 255, 0.10)');

        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = 0.75; // Crisp hairline silk thread
        this.ctx.beginPath();
        this.ctx.moveTo(center.x, center.y);
        this.ctx.lineTo(outerX, outerY);
        this.ctx.stroke();

        // Tip node at the outer window sides
        const tipGlow = Math.sin(this.time * 0.06 + i * 0.4) * 0.25 + 0.55;
        this.ctx.fillStyle = `rgba(235, 245, 255, ${tipGlow * 0.75})`;
        this.ctx.beginPath();
        this.ctx.arc(outerX, outerY, 1.4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 2. CONCENTRIC SPIRAL RINGS WITH AUTHENTIC CATENARY SAG
      // Real spiderwebs have distinct sagging curved bridges between spokes
      const sagFactor = 0.885; // 11.5% natural catenary sag of spider silk arches

      for (let ring = 1; ring <= this.numRings; ring++) {
        const rRatio = ring / this.numRings;
        const ringRipple = Math.sin(this.time * 0.04 - ring * 0.22) * 0.012;
        const radius = maxR * Math.pow(rRatio, 1.2) * (webPulse + ringRipple);

        // Clearly visible spiderweb silk arches
        const ringAlpha = Math.max(0.10, (1 - rRatio * 0.52) * 0.28);

        this.ctx.strokeStyle = `rgba(225, 238, 255, ${ringAlpha})`;
        this.ctx.lineWidth = 0.7; // Crisp hairline silk
        this.ctx.beginPath();

        for (let spoke = 0; spoke < this.numSpokes; spoke++) {
          const a1 = (spoke / this.numSpokes) * Math.PI * 2;
          const a2 = ((spoke + 1) / this.numSpokes) * Math.PI * 2;

          const p1x = center.x + Math.cos(a1) * radius;
          const p1y = center.y + Math.sin(a1) * radius;

          const p2x = center.x + Math.cos(a2) * radius;
          const p2y = center.y + Math.sin(a2) * radius;

          // Curve control point pulls inward toward center (iconic spiderweb curve)
          const amid = (a1 + a2) * 0.5;
          const cpRadius = radius * sagFactor;
          const cpX = center.x + Math.cos(amid) * cpRadius;
          const cpY = center.y + Math.sin(amid) * cpRadius;

          if (spoke === 0) {
            this.ctx.moveTo(p1x, p1y);
          }
          this.ctx.quadraticCurveTo(cpX, cpY, p2x, p2y);
        }
        this.ctx.stroke();
      }

      // 3. OUTWARD ENERGY RIPPLE traveling along the web
      for (let i = 0; i < this.pulseWaves.length; i++) {
        const pw = this.pulseWaves[i];
        if (pw.radius <= 0) continue;

        const pAlpha = pw.alpha * 0.16;
        const pGrad = this.ctx.createRadialGradient(
          center.x, center.y, Math.max(0, pw.radius - 22),
          center.x, center.y, pw.radius + 18
        );
        pGrad.addColorStop(0, 'rgba(235, 245, 255, 0)');
        pGrad.addColorStop(0.5, `rgba(235, 245, 255, ${pAlpha})`);
        pGrad.addColorStop(1, 'rgba(235, 245, 255, 0)');

        this.ctx.strokeStyle = pGrad;
        this.ctx.lineWidth = 2.0;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, pw.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // 4. DELICATE CENTER HUB SPIRAL (NO BLINDING SPOTLIGHT BEHIND TEXT)
      // Small silk anchor ring
      this.ctx.strokeStyle = 'rgba(235, 242, 255, 0.14)';
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
      this.ctx.stroke();

      // Subtle soft central glow
      const hubGrad = this.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 12);
      hubGrad.addColorStop(0, 'rgba(235, 242, 255, 0.06)');
      hubGrad.addColorStop(1, 'rgba(235, 242, 255, 0)');
      this.ctx.fillStyle = hubGrad;
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
    }

    drawDewDrops() {
      const center = this.getWebCenter();
      const webPulse = Math.sin(this.time * 0.03) * 0.03 + 0.97;

      for (let i = 0; i < this.dewDrops.length; i++) {
        const d = this.dewDrops[i];
        const x = center.x + Math.cos(d.angle) * (d.radius * webPulse);
        const y = center.y + Math.sin(d.angle) * (d.radius * webPulse);

        const pulse = Math.sin(this.time * d.pulseSpeed + d.phase);
        const glowAlpha = 0.22 + pulse * 0.22;
        const radius = d.baseSize * (0.85 + pulse * 0.16);

        // Soft halo
        const haloRadius = radius * 2.4;
        const haloGrad = this.ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
        haloGrad.addColorStop(0, `rgba(235, 245, 255, ${glowAlpha * 0.45})`);
        haloGrad.addColorStop(0.5, `rgba(220, 235, 255, ${glowAlpha * 0.12})`);
        haloGrad.addColorStop(1, 'rgba(220, 235, 255, 0)');

        this.ctx.fillStyle = haloGrad;
        this.ctx.beginPath();
        this.ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Glistening crystal core
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.75, glowAlpha + 0.25)})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, Math.max(0.7, radius * 0.5), 0, Math.PI * 2);
        this.ctx.fill();

        // 4-point diamond glint on peak pulse
        if (pulse > 0.68) {
          const flareLen = (radius * 1.5) * ((pulse - 0.68) / 0.32);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${(pulse - 0.68) * 1.6})`;
          this.ctx.lineWidth = 0.65;
          this.ctx.beginPath();
          this.ctx.moveTo(x - flareLen, y);
          this.ctx.lineTo(x + flareLen, y);
          this.ctx.moveTo(x, y - flareLen);
          this.ctx.lineTo(x, y + flareLen);
          this.ctx.stroke();
        }
      }
    }

    drawParticles() {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const twinkle = Math.sin(this.time * p.twinkleSpeed + p.twinkleOffset) * 0.25 + 0.75;
        const alpha = Math.max(0, p.life * p.alpha * twinkle * 0.65);
        if (alpha <= 0.01) continue;

        const size = p.size * (0.6 + 0.3 * p.life);
        const glowRadius = size * 2.0;

        // Particle halo
        const pGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        pGrad.addColorStop(0, `rgba(${p.color}, ${alpha * 0.4})`);
        pGrad.addColorStop(0.35, `rgba(${p.color}, ${alpha * 0.1})`);
        pGrad.addColorStop(1, `rgba(${p.color}, 0)`);

        this.ctx.fillStyle = pGrad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Particle core
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(0.55, size * 0.55), 0, Math.PI * 2);
        this.ctx.fill();

        // 4-point micro-glint on select particles
        if (p.hasCrossGlint && p.life > 0.4) {
          const flareLen = size * 1.7 * p.life;
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
          this.ctx.lineWidth = 0.55;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x - flareLen, p.y);
          this.ctx.lineTo(p.x + flareLen, p.y);
          this.ctx.moveTo(p.x, p.y - flareLen);
          this.ctx.lineTo(p.x + flareLen, p.y);
          this.ctx.stroke();
        }
      }
    }

    loop = () => {
      if (!this.isActive) return;
      this.time++;

      this.spawnActiveEmissions();
      this.update();

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Clip strictly to content-wrapper boundaries so Hero (Page 1) is 100% protected
      const rect = this.wrapper.getBoundingClientRect();
      const clipTop = Math.max(0, rect.top);
      const clipBottom = Math.min(this.height, rect.bottom);

      if (clipBottom > clipTop) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, clipTop, this.width, clipBottom - clipTop);
        this.ctx.clip();

        this.drawWeb();
        this.drawDewDrops();
        this.drawParticles();

        this.ctx.restore();
      }

      this.rafId = requestAnimationFrame(this.loop);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.spiderwebInstance = new FullWindowWebAtmosphere();
    });
  } else {
    window.spiderwebInstance = new FullWindowWebAtmosphere();
  }
})();
