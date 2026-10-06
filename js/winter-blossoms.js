/**
 * WINTER SPRING BLOSSOMS (UME & SAKURA DRIFT)
 * Elegant, high-performance ambient blossom & petal system
 * Activates seamlessly starting from Page 2 (Experience Section) downwards.
 * Features 5-petal blooms, tumbling petals, winter frost sparkles,
 * natural wind physics, and cursor air disturbance.
 */

(function () {
  'use strict';

  class WinterSpringBlossoms {
    constructor() {
      // Respect user's motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.reducedMotion = prefersReducedMotion;

      // Canvas setup
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'winter-blossoms-canvas';
      this.canvas.className = 'winter-blossoms-canvas';
      this.ctx = this.canvas.getContext('2d');

      // Style canvas fixed full-screen
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 22;
        opacity: 0;
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity;
      `;
      document.body.appendChild(this.canvas);

      // Sizing
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.resize();

      // State
      this.isActive = false;
      this.isAnimating = false;
      this.rafId = null;
      this.lastTime = performance.now();

      // Mouse tracking
      this.mouseX = -9999;
      this.mouseY = -9999;
      this.lastMouseX = -9999;
      this.lastMouseY = -9999;
      this.mouseVelX = 0;
      this.mouseVelY = 0;
      this.mouseActive = false;
      this.mouseTimer = null;

      // Particles
      this.particles = [];
      this.burstParticles = [];
      this.maxParticles = this.width < 768 ? 20 : 36;

      // Sprites (cached offscreen canvases for max FPS)
      this.sprites = {};
      this.initSprites();

      // Initialize particles
      this.initParticles();

      // Event listeners
      this.initListeners();

      // Check initial scroll
      this.checkScroll();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);

      this.maxParticles = this.width < 768 ? 20 : 36;
      if (this.particles.length > this.maxParticles) {
        this.particles.length = this.maxParticles;
      }
      this.checkScroll();
    }

    /**
     * Pre-render botanical blossom & petal sprites to offscreen canvases
     * Ensures consistent 60+ FPS zero-lag rendering.
     */
    initSprites() {
      // 1. Full 5-Petal Winter Blossom (Sakura / Plum hybrid)
      this.sprites.bloomPink = this.createBloomSprite({
        radius: 26,
        petalInner: '#ffffff',
        petalMid: '#ffe2e8',
        petalOuter: '#ff9ebb',
        petalEdge: '#f2688b',
        stamenColor: '#ffd166',
        coreColor: '#8a1d33',
        sparkleGlow: true
      });

      // 2. Pearlescent Snow-Kissed Blossom
      this.sprites.bloomWhite = this.createBloomSprite({
        radius: 24,
        petalInner: '#ffffff',
        petalMid: '#fff0f4',
        petalOuter: '#ffcad4',
        petalEdge: '#e58097',
        stamenColor: '#ffb703',
        coreColor: '#6a1224',
        sparkleGlow: true
      });

      // 3. Falling Petal - Standard Sakura Notched
      this.sprites.petalCurve = this.createPetalSprite({
        w: 18,
        h: 24,
        gradStart: 'rgba(255, 245, 248, 0.95)',
        gradMid: 'rgba(255, 185, 202, 0.90)',
        gradEnd: 'rgba(235, 100, 135, 0.85)',
        stroke: 'rgba(255, 255, 255, 0.4)'
      });

      // 4. Falling Petal - Slender Plum Petal
      this.sprites.petalSlender = this.createPetalSprite({
        w: 14,
        h: 20,
        gradStart: 'rgba(255, 250, 252, 0.95)',
        gradMid: 'rgba(255, 195, 210, 0.88)',
        gradEnd: 'rgba(240, 115, 145, 0.82)',
        stroke: 'rgba(255, 240, 245, 0.45)'
      });

      // 5. Winter Frost Crystal Sparkle
      this.sprites.frostSparkle = this.createFrostSparkleSprite(14);
    }

    createBloomSprite({ radius, petalInner, petalMid, petalOuter, petalEdge, stamenColor, coreColor, sparkleGlow }) {
      const c = document.createElement('canvas');
      const size = (radius * 2 + 14) * 2; // high-res 2x buffer
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const cx = size / 2;
      const cy = size / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Frost ambient aura
      if (sparkleGlow) {
        const aura = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.3);
        aura.addColorStop(0, 'rgba(255, 220, 235, 0.25)');
        aura.addColorStop(1, 'rgba(255, 180, 205, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw 5 botanical notched petals
      const numPetals = 5;
      for (let i = 0; i < numPetals; i++) {
        const angle = (i * 2 * Math.PI) / numPetals;
        ctx.save();
        ctx.rotate(angle);

        ctx.beginPath();
        const pLen = radius;
        const pWidth = radius * 0.62;

        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-pWidth * 0.6, -pLen * 0.35, -pWidth, -pLen * 0.82, -pWidth * 0.28, -pLen);
        // Signature cleft/notch at the petal crest
        ctx.lineTo(0, -pLen * 0.90);
        ctx.bezierCurveTo(pWidth * 0.28, -pLen, pWidth, -pLen * 0.82, pWidth * 0.6, -pLen * 0.35);
        ctx.closePath();

        // Shaded gradient from center to petal edge
        const grad = ctx.createRadialGradient(0, -pLen * 0.3, 1, 0, -pLen * 0.6, pLen);
        grad.addColorStop(0, petalInner);
        grad.addColorStop(0.35, petalMid);
        grad.addColorStop(0.78, petalOuter);
        grad.addColorStop(1, petalEdge);

        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle pearlescent edge stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      // Golden stamens with pollen tips
      const stamenCount = 10;
      for (let j = 0; j < stamenCount; j++) {
        const sAngle = (j * 2 * Math.PI) / stamenCount + 0.12;
        const sLen = radius * 0.44;
        ctx.save();
        ctx.rotate(sAngle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -sLen);
        ctx.strokeStyle = stamenColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pollen bead
        ctx.beginPath();
        ctx.arc(0, -sLen, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff4a3';
        ctx.fill();

        ctx.restore();
      }

      // Deep plum-velvet flower core
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.fill();

      // Pistil glowing center
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.11, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeaa7';
      ctx.fill();

      ctx.restore();
      return c;
    }

    createPetalSprite({ w, h, gradStart, gradMid, gradEnd, stroke }) {
      const c = document.createElement('canvas');
      const pad = 8;
      c.width = (w + pad) * 2;
      c.height = (h + pad) * 2;
      const ctx = c.getContext('2d');
      const cx = c.width / 2;
      const cy = c.height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.bezierCurveTo(-w * 0.55, h * 0.15, -w * 0.58, -h * 0.38, -w * 0.2, -h * 0.5);
      // Soft notch
      ctx.lineTo(0, -h * 0.43);
      ctx.bezierCurveTo(w * 0.2, -h * 0.5, w * 0.58, -h * 0.38, w * 0.55, h * 0.15);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, h * 0.5, 0, -h * 0.5);
      grad.addColorStop(0, gradStart);
      grad.addColorStop(0.45, gradMid);
      grad.addColorStop(1, gradEnd);

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
      return c;
    }

    createFrostSparkleSprite(radius) {
      const c = document.createElement('canvas');
      const size = (radius * 2 + 8) * 2;
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const cx = size / 2;
      const cy = size / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Glowing cross-diamond
      const r = radius;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, 'rgba(255, 235, 245, 0.95)');
      grad.addColorStop(1, 'rgba(255, 175, 205, 0)');

      ctx.fillStyle = grad;
      ctx.fill();

      // Tiny center point
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
      return c;
    }

    /**
     * Create fresh particle
     */
    createParticle(fromTop = false) {
      const typeRoll = Math.random();
      let type, sprite, baseSize;

      if (typeRoll < 0.28) {
        // Full 5-petal flower bloom
        type = 'bloom';
        sprite = Math.random() > 0.4 ? this.sprites.bloomPink : this.sprites.bloomWhite;
        baseSize = 16 + Math.random() * 12; // 16px - 28px
      } else if (typeRoll < 0.86) {
        // Individual falling petal
        type = 'petal';
        sprite = Math.random() > 0.5 ? this.sprites.petalCurve : this.sprites.petalSlender;
        baseSize = 10 + Math.random() * 8; // 10px - 18px
      } else {
        // Winter frost sparkle
        type = 'sparkle';
        sprite = this.sprites.frostSparkle;
        baseSize = 8 + Math.random() * 7; // 8px - 15px
      }

      return {
        type,
        sprite,
        x: Math.random() * (this.width + 120) - 60,
        y: fromTop ? -30 - Math.random() * 40 : Math.random() * this.height,
        size: baseSize,
        baseSpeedY: type === 'sparkle' ? 0.4 + Math.random() * 0.6 : 0.8 + Math.random() * 1.1,
        speedY: 0,
        swayAmp: type === 'bloom' ? 1.4 + Math.random() * 1.8 : 2.0 + Math.random() * 2.8,
        swayFreq: 0.012 + Math.random() * 0.02,
        swayPhase: Math.random() * Math.PI * 2,
        angle: Math.random() * Math.PI * 2,
        angSpeed: (Math.random() - 0.5) * 0.02,
        // 3D tumble simulation (scaling one axis to mimic rotation towards viewer)
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: 0.015 + Math.random() * 0.025,
        opacity: type === 'sparkle' ? 0.6 + Math.random() * 0.4 : 0.80 + Math.random() * 0.18,
        sparklePhase: Math.random() * Math.PI * 2,
        // Interactive velocity impulse
        vx: 0,
        vy: 0
      };
    }

    initParticles() {
      this.particles = [];
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push(this.createParticle(false));
      }
    }

    initListeners() {
      // Resize
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Scroll observer / listener
      window.addEventListener('scroll', () => this.checkScroll(), { passive: true });

      // Mouse tracking for breeze interaction
      window.addEventListener('mousemove', (e) => {
        if (!this.isActive) return;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.mouseVelX = this.mouseX - this.lastMouseX;
        this.mouseVelY = this.mouseY - this.lastMouseY;
        this.mouseActive = true;

        clearTimeout(this.mouseTimer);
        this.mouseTimer = setTimeout(() => {
          this.mouseActive = false;
        }, 120);
      }, { passive: true });

      // Mouse leave window
      window.addEventListener('mouseleave', () => {
        this.mouseActive = false;
        this.mouseX = -9999;
        this.mouseY = -9999;
      });

      // Interactive Click Flourish on Page 2
      window.addEventListener('click', (e) => {
        if (!this.isActive) return;
        // Don't burst if clicked inside hero
        const hero = document.getElementById('hero');
        if (hero) {
          const heroRect = hero.getBoundingClientRect();
          if (e.clientY < heroRect.bottom) return;
        }
        this.spawnClickFlourish(e.clientX, e.clientY);
      }, { passive: true });
    }

    /**
     * Spawn a burst of 5-7 tiny fluttering petals when clicking
     */
    spawnClickFlourish(x, y) {
      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count + (Math.random() - 0.5) * 0.6;
        const speed = 2.0 + Math.random() * 3.5;
        this.burstParticles.push({
          sprite: Math.random() > 0.4 ? this.sprites.petalCurve : this.sprites.bloomWhite,
          x: x,
          y: y,
          size: 11 + Math.random() * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          angle: Math.random() * Math.PI * 2,
          angSpeed: (Math.random() - 0.5) * 0.08,
          flipAngle: Math.random() * Math.PI * 2,
          flipSpeed: 0.05 + Math.random() * 0.05,
          life: 1.0,
          decay: 0.016 + Math.random() * 0.012
        });
      }
    }

    /**
     * Activate blossoms starting from Page 2 (#experience / #content-wrapper)
     */
    checkScroll() {
      const hero = document.getElementById('hero');
      const experience = document.getElementById('experience');

      let inPageTwo = false;
      const scrollY = window.scrollY || window.pageYOffset;

      if (experience) {
        const expRect = experience.getBoundingClientRect();
        // Activate as user scrolls near or past experience section
        inPageTwo = expRect.top <= window.innerHeight * 0.75;
      } else if (hero) {
        inPageTwo = scrollY >= hero.offsetHeight * 0.45;
      } else {
        inPageTwo = scrollY > 200;
      }

      if (inPageTwo && !this.isActive) {
        this.activate();
      } else if (!inPageTwo && this.isActive) {
        this.deactivate();
      }
    }

    activate() {
      this.isActive = true;
      this.canvas.style.opacity = '1';
      if (!this.isAnimating) {
        this.isAnimating = true;
        this.lastTime = performance.now();
        this.loop();
      }
    }

    deactivate() {
      this.isActive = false;
      this.canvas.style.opacity = '0';
      // Allow fade-out transition before pausing RAF
      setTimeout(() => {
        if (!this.isActive) {
          this.isAnimating = false;
          if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
          }
        }
      }, 850);
    }

    /**
     * Main 60fps render loop
     */
    loop = (currentTime = performance.now()) => {
      if (!this.isAnimating) return;

      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Global winter-spring breeze (gentle sine wave)
      const breeze = Math.sin(currentTime * 0.0007) * 0.75 + 0.45;

      // Update & render main ambient blossoms
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Sway motion
        p.swayPhase += p.swayFreq;
        const currentSway = Math.sin(p.swayPhase) * p.swayAmp;

        // Falling physics
        p.speedY = p.baseSpeedY + (this.reducedMotion ? 0 : Math.cos(p.swayPhase * 0.8) * 0.2);
        p.y += (p.speedY + p.vy);
        p.x += (breeze + currentSway + p.vx);

        // Rotation
        p.angle += p.angSpeed;
        p.flipAngle += p.flipSpeed;

        // Decay velocity impulses
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Cursor wind wave interaction (radius ~120px)
        if (this.mouseActive) {
          const dx = p.x - this.mouseX;
          const dy = p.y - this.mouseY;
          const distSq = dx * dx + dy * dy;
          const maxDist = 125;
          if (distSq < maxDist * maxDist && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 2.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force * 0.6;
            p.angSpeed += (Math.random() - 0.5) * 0.03;
          }
        }

        // Draw particle
        this.drawParticle(p, currentTime);

        // Recycle particle when exiting bottom or sides
        if (p.y > this.height + 40) {
          this.particles[i] = this.createParticle(true);
        } else if (p.x > this.width + 60) {
          p.x = -40;
        } else if (p.x < -60) {
          p.x = this.width + 40;
        }
      }

      // Update & render click burst particles
      for (let j = this.burstParticles.length - 1; j >= 0; j--) {
        const bp = this.burstParticles[j];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vy += 0.08; // subtle gravity
        bp.vx *= 0.97;
        bp.angle += bp.angSpeed;
        bp.flipAngle += bp.flipSpeed;
        bp.life -= bp.decay;

        if (bp.life <= 0) {
          this.burstParticles.splice(j, 1);
        } else {
          this.drawBurstParticle(bp);
        }
      }

      this.rafId = requestAnimationFrame(this.loop);
    };

    drawParticle(p, time) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);

      // 3D tumble flip scale: Math.cos(flipAngle) compresses height/width
      const flipScale = Math.cos(p.flipAngle);
      const scaleX = p.type === 'bloom' ? Math.max(Math.abs(flipScale), 0.25) : flipScale;
      const scaleY = 1.0;

      this.ctx.rotate(p.angle);
      this.ctx.scale(scaleX, scaleY);

      if (p.type === 'sparkle') {
        const pulse = 0.65 + Math.sin(time * 0.005 + p.sparklePhase) * 0.35;
        this.ctx.globalAlpha = p.opacity * pulse;
      } else {
        this.ctx.globalAlpha = p.opacity;
      }

      const drawSize = p.size;
      this.ctx.drawImage(
        p.sprite,
        -drawSize / 2,
        -drawSize / 2,
        drawSize,
        drawSize
      );

      this.ctx.restore();
    }

    drawBurstParticle(bp) {
      this.ctx.save();
      this.ctx.translate(bp.x, bp.y);
      this.ctx.rotate(bp.angle);
      this.ctx.scale(Math.cos(bp.flipAngle), 1.0);
      this.ctx.globalAlpha = Math.max(0, bp.life * 0.9);

      const s = bp.size;
      this.ctx.drawImage(bp.sprite, -s / 2, -s / 2, s, s);

      this.ctx.restore();
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.winterBlossoms = new WinterSpringBlossoms();
    });
  } else {
    window.winterBlossoms = new WinterSpringBlossoms();
  }
})();
