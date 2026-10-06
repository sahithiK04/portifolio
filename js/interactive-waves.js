/**
 * INTERACTIVE WAVE ANIMATIONS
 * Advanced wave effects with mouse interaction and smooth animations
 * Inspired by modern portfolio animations
 */

class InteractiveWaveManager {
  constructor() {
    this.waves = [];
    this.particles = [];
    this.time = 0;
    this.mouse = { x: 0, y: 0 };
    this.animationId = null;

    this.initMouseTracking();
    this.createWaveSections();
  }

  initMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  createWaveSections() {
    // Hero section wave DISABLED - using chatbot interface instead
    // const heroCanvas = this.createCanvasSection('hero', {
    //   type: 'liquid',
    //   color: 'rgba(255, 255, 255, 0.35)',
    //   waveCount: 2,
    //   height: window.innerHeight * 0.3,
    // });

    // Experience section with flowing waves
    const experienceCanvas = this.createCanvasSection('experience', {
      type: 'flowing',
      color: 'rgba(255, 255, 255, 0.28)',
      waveCount: 4,
      height: 150,
    });

    // Projects section with ripple effect
    const projectsCanvas = this.createCanvasSection('projects', {
      type: 'ripple',
      color: 'rgba(255, 200, 200, 0.25)',
      waveCount: 3,
      height: 120,
    });
  }

  createCanvasSection(sectionId, options) {
    const section = document.getElementById(sectionId);
    if (!section) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 1;
      mix-blend-mode: screen;
    `;

    section.style.position = 'relative';
    section.insertBefore(canvas, section.firstChild);

    const wave = {
      canvas,
      ctx,
      section,
      ...options,
      amplitude: [],
      frequency: [],
      phase: [],
    };

    // Initialize wave properties
    for (let i = 0; i < options.waveCount; i++) {
      wave.amplitude.push(20 + Math.random() * 40);
      wave.frequency.push(0.003 + Math.random() * 0.005);
      wave.phase.push((Math.PI * 2 / options.waveCount) * i);
    }

    this.waves.push(wave);
    this.resizeCanvas(wave);
    window.addEventListener('resize', () => this.resizeCanvas(wave));

    return wave;
  }

  resizeCanvas(wave) {
    wave.canvas.width = wave.section.offsetWidth;
    wave.canvas.height = wave.height;
  }

  drawLiquidWave(wave) {
    const { ctx, canvas, amplitude, frequency, phase, color } = wave;

    // Create clipping path for liquid effect
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helper to build rgba color with specific opacity
    const buildRgbaColor = (baseColor, opacity) => {
      const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
      return baseColor;
    };

    for (let waveIndex = 0; waveIndex < amplitude.length; waveIndex++) {
      const path = new Path2D();
      let firstPoint = true;

      for (let x = 0; x <= canvas.width; x += 5) {
        const y = canvas.height * 0.6 +
          Math.sin(x * frequency[waveIndex] + this.time * 0.02 + phase[waveIndex]) *
          amplitude[waveIndex] * (waveIndex + 1) / (amplitude.length);

        if (firstPoint) {
          path.moveTo(x, y);
          firstPoint = false;
        } else {
          path.lineTo(x, y);
        }
      }

      path.lineTo(canvas.width, canvas.height);
      path.lineTo(0, canvas.height);
      path.closePath();

      // Create gradient for depth
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      gradient.addColorStop(0, buildRgbaColor(color, 0.6 + waveIndex * 0.15));
      gradient.addColorStop(1, buildRgbaColor(color, 0.15));

      ctx.fillStyle = gradient;
      ctx.fill(path);

      // Add wave outline
      ctx.strokeStyle = buildRgbaColor(color, 0.8 + waveIndex * 0.15);
      ctx.lineWidth = 2;
      ctx.stroke(path);
    }
  }

  drawFlowingWave(wave) {
    const { ctx, canvas, amplitude, frequency, phase, color } = wave;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helper to build rgba color with specific opacity
    const buildRgbaColor = (baseColor, opacity) => {
      const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
      return baseColor;
    };

    for (let waveIndex = 0; waveIndex < amplitude.length; waveIndex++) {
      const yOffset = (canvas.height / (amplitude.length + 1)) * (waveIndex + 1);
      const path = new Path2D();

      for (let x = 0; x <= canvas.width; x += 3) {
        const y = yOffset +
          Math.sin((x * frequency[waveIndex]) + this.time * 0.03 + phase[waveIndex]) *
          amplitude[waveIndex];

        if (x === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }

      ctx.strokeStyle = buildRgbaColor(color, 0.7 + waveIndex * 0.2);
      ctx.lineWidth = 3 + waveIndex;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add glow effect
      ctx.shadowColor = buildRgbaColor(color, 0.6);
      ctx.shadowBlur = 12 + waveIndex * 3;
      ctx.stroke(path);
      ctx.shadowBlur = 0;
    }
  }

  drawRippleWave(wave) {
    const { ctx, canvas, color } = wave;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helper to build rgba color with specific opacity
    const buildRgbaColor = (baseColor, opacity) => {
      const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
      return baseColor;
    };

    const centerX = this.mouse.x - wave.canvas.getBoundingClientRect().left;
    const centerY = wave.canvas.getBoundingClientRect().top + canvas.height / 2;

    for (let i = 0; i < 3; i++) {
      const radius = ((this.time * 0.5 + i * 40) % (canvas.width * 1.5));
      const alpha = Math.max(0, 1 - (radius / (canvas.width * 1.5)));

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

      ctx.strokeStyle = buildRgbaColor(color, alpha * 0.9);
      ctx.lineWidth = 3;
      ctx.shadowColor = buildRgbaColor(color, alpha * 0.7);
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Add wave underneath
    const path = new Path2D();
    for (let x = 0; x <= canvas.width; x += 4) {
      const distance = Math.abs(x - centerX);
      const wave = Math.sin((distance * 0.005) - this.time * 0.02) * 20 * Math.max(0, 1 - (distance / canvas.width));
      const y = canvas.height * 0.5 + wave;

      if (x === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    ctx.strokeStyle = buildRgbaColor(color, 0.8);
    ctx.lineWidth = 2.5;
    ctx.stroke(path);
  }

  animate = () => {
    this.time++;

    this.waves.forEach((wave) => {
      switch (wave.type) {
        case 'liquid':
          this.drawLiquidWave(wave);
          break;
        case 'flowing':
          this.drawFlowingWave(wave);
          break;
        case 'ripple':
          this.drawRippleWave(wave);
          break;
      }
    });

    this.animationId = requestAnimationFrame(this.animate);
  };

  start() {
    this.animate();
  }

  stop() {
    cancelAnimationFrame(this.animationId);
  }
}

// ============================================================================
// EXPERIENCE SECTION CARD ANIMATOR
// ============================================================================
class ExperienceCardAnimator {
  constructor() {
    this.cards = document.querySelectorAll('.timeline-item.glass-card');
    this.initAnimations();
  }

  initAnimations() {
    this.cards.forEach((card, index) => {
      // Add staggered entrance animation
      card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.15}s both`;

      // Add interactive effects
      const header = card.querySelector('.timeline-header');

      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = `
          0 20px 50px rgba(255, 255, 255, 0.2),
          inset 0 1px 1px rgba(255, 255, 255, 0.4)
        `;
        card.style.background = 'rgba(255, 255, 255, 0.1)';
        card.style.backdropFilter = 'blur(20px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
        card.style.background = 'rgba(255, 255, 255, 0.04)';
        card.style.backdropFilter = 'blur(16px)';
      });

      // Add underline animation on header
      if (header) {
        const underline = document.createElement('div');
        underline.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0));
          opacity: 0;
          transition: width 0.3s ease, opacity 0.3s ease;
          width: 0;
        `;
        header.style.position = 'relative';
        header.appendChild(underline);

        card.addEventListener('mouseenter', () => {
          underline.style.width = '100%';
          underline.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
          underline.style.width = '0';
          underline.style.opacity = '0';
        });
      }
    });
  }
}

// ============================================================================
// SECTION PARALLAX EFFECT
// ============================================================================
class SectionParallax {
  constructor() {
    this.sections = document.querySelectorAll('.page-section');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    this.sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

      if (scrollPercent > 0 && scrollPercent < 1) {
        const offset = scrollPercent * 20;
        section.style.backgroundPosition = `0 ${offset}px`;
      }
    });
  }
}

// ============================================================================
// INITIALIZE ALL ANIMATIONS ON DOM READY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Start interactive waves
  const waveManager = new InteractiveWaveManager();
  waveManager.start();

  // Animate experience cards
  new ExperienceCardAnimator();

  // Add section parallax
  new SectionParallax();

  // Add smooth reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.classList.contains('reveal-on-scroll')) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    observer.observe(el);
  });
});
