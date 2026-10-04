/**
 * ENHANCED PORTFOLIO ANIMATIONS
 * Wave animations, particles, and interactive elements
 */

// ============================================================================
// 1. ANIMATED WAVE BACKGROUND FOR SECTIONS
// ============================================================================
class AnimatedWaveBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.className = 'wave-background-canvas';
    this.container.style.position = 'relative';
    this.container.prepend(this.canvas);

    // Options
    this.waveCount = options.waveCount || 3;
    this.waveHeight = options.waveHeight || 80;
    this.waveSpeed = options.waveSpeed || 0.5;
    this.waveColor = options.waveColor || 'rgba(255, 255, 255, 0.05)';
    this.glowColor = options.glowColor || 'rgba(255, 255, 255, 0.1)';

    // State
    this.time = 0;
    this.waves = [];
    this.isAnimating = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize waves
    for (let i = 0; i < this.waveCount; i++) {
      this.waves.push({
        amp: 30 + Math.random() * 50,
        freq: 0.005 + Math.random() * 0.008,
        phase: (Math.PI * 2 / this.waveCount) * i,
        yOffset: (this.canvas.height / (this.waveCount + 1)) * (i + 1),
        speed: this.waveSpeed * (0.8 + Math.random() * 0.4),
        opacity: 0.15 + Math.random() * 0.15,
      });
    }

    this.animate();
  }

  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '1';
    this.canvas.style.pointerEvents = 'none';
  }

  drawWave(wave) {
    const path = new Path2D();
    path.moveTo(0, wave.yOffset);

    for (let x = 0; x <= this.canvas.width; x += 10) {
      const y = wave.yOffset + Math.sin((x * wave.freq) + this.time * wave.speed + wave.phase) * wave.amp;
      path.lineTo(x, y);
    }

    path.lineTo(this.canvas.width, this.canvas.height);
    path.lineTo(0, this.canvas.height);
    path.closePath();

    // Fill with gradient
    const gradient = this.ctx.createLinearGradient(0, wave.yOffset - wave.amp, 0, wave.yOffset + wave.amp);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${wave.opacity * 0.5})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${wave.opacity})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${wave.opacity * 0.3})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fill(path);

    // Glow effect
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity * 0.7})`;
    this.ctx.lineWidth = 1;
    this.ctx.stroke(path);
  }

  animate = () => {
    if (!this.isAnimating || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let wave of this.waves) {
      this.drawWave(wave);
    }

    this.time += 0.05;
    requestAnimationFrame(this.animate);
  };

  start() {
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
  }
}

// ============================================================================
// 2. FLOATING PARTICLES
// ============================================================================
class FloatingParticles {
  constructor(containerId, particleCount = 50) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.particleCount = particleCount;
    this.particles = [];
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';

    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';

      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      const opacity = Math.random() * 0.7 + 0.5;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255,255,255,${opacity}), rgba(255,255,255,0));
        border-radius: 50%;
        left: ${left}%;
        bottom: -20px;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px rgba(255,255,255,${opacity * 1.2});
        animation: float-up ${duration}s ease-in infinite;
        animation-delay: ${delay}s;
        z-index: 2;
        filter: blur(0px);
      `;

      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }
}

// ============================================================================
// 3. ANIMATED EXPERIENCE CARDS (INTERACTIVE FLOW)
// ============================================================================
class AnimatedExperienceCards {
  constructor() {
    this.cards = document.querySelectorAll('.timeline-item');
    this.initCards();
  }

  initCards() {
    this.cards.forEach((card, index) => {
      card.style.position = 'relative';
      card.style.overflow = 'hidden';

      // Add flowing background
      const background = document.createElement('div');
      background.className = 'card-flow-background';
      background.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.05) 50%,
          rgba(255,255,255,0) 100%
        );
        animation: card-flow ${3 + index * 0.5}s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      `;

      card.prepend(background);
      card.style.zIndex = this.cards.length - index;

      // Add hover effect
      card.addEventListener('mouseenter', (e) => {
        background.style.animationPlayState = 'paused';
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 20px 40px rgba(255,255,255,0.15), inset 0 1px 1px rgba(255,255,255,0.3)';
      });

      card.addEventListener('mouseleave', () => {
        background.style.animationPlayState = 'running';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
      });

      // Make content relative to background
      const content = card.querySelectorAll('.timeline-header, .bullet-list');
      content.forEach(el => {
        el.style.position = 'relative';
        el.style.zIndex = '2';
      });
    });
  }
}

// ============================================================================
// 4. SMOOTH SCROLL-TRIGGERED ANIMATIONS
// ============================================================================
class ScrollTriggerAnimations {
  constructor() {
    this.elements = document.querySelectorAll('[data-scroll-animate]');
    this.observer = null;
    this.init();
  }

  init() {
    const options = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const type = entry.target.dataset.scrollAnimate;
          this.applyAnimation(entry.target, type);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.elements.forEach((el) => this.observer.observe(el));
  }

  applyAnimation(el, type) {
    el.style.opacity = '1';
    switch (type) {
      case 'fade-up':
        el.style.animation = 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        break;
      case 'fade-left':
        el.style.animation = 'fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        break;
      case 'fade-right':
        el.style.animation = 'fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        break;
      case 'scale-up':
        el.style.animation = 'scaleInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        break;
    }
  }
}

// ============================================================================
// 5. INITIALIZATION ON DOM READY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize wave backgrounds for specific sections
  const experienceWave = new AnimatedWaveBackground('experience', {
    waveCount: 4,
    waveHeight: 100,
    waveSpeed: 0.6,
    waveColor: 'rgba(255, 255, 255, 0.08)',
  });
  experienceWave.start();

  const projectsWave = new AnimatedWaveBackground('projects', {
    waveCount: 3,
    waveHeight: 80,
    waveSpeed: 0.5,
    waveColor: 'rgba(255, 255, 255, 0.06)',
  });
  projectsWave.start();

  // Add floating particles to sections
  new FloatingParticles('experience', 40);
  new FloatingParticles('projects', 30);

  // Animate experience cards with flow effect
  new AnimatedExperienceCards();

  // Initialize scroll-triggered animations
  new ScrollTriggerAnimations();
});

// Add animation keyframes dynamically if not in CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes float-up {
    0% {
      bottom: -20px;
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    90% {
      opacity: 0.2;
    }
    100% {
      bottom: calc(100vh + 20px);
      opacity: 0;
    }
  }

  @keyframes card-flow {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleInUp {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(30px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .floating-particle {
    filter: blur(0.5px);
  }

  .wave-background-canvas {
    opacity: 0.8;
  }

  .card-flow-background {
    backdrop-filter: blur(1px);
  }
`;

document.head.appendChild(style);
