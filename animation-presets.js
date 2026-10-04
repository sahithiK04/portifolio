/**
 * CUSTOM ANIMATION PRESETS
 * Copy and paste these configurations to customize your animations
 */

// ============================================================================
// PRESET 1: SUBTLE & MINIMAL WAVES
// ============================================================================
const PRESET_MINIMAL = {
  heroCanvas: {
    waveCount: 1,
    height: window.innerHeight * 0.15,
    color: 'rgba(255, 255, 255, 0.05)',
  },
  experienceCanvas: {
    waveCount: 2,
    height: 80,
    color: 'rgba(255, 255, 255, 0.05)',
  },
  projectsCanvas: {
    waveCount: 2,
    height: 60,
    color: 'rgba(255, 255, 255, 0.04)',
  },
};

// ============================================================================
// PRESET 2: VIBRANT & BOLD WAVES
// ============================================================================
const PRESET_VIBRANT = {
  heroCanvas: {
    waveCount: 4,
    height: window.innerHeight * 0.4,
    color: 'rgba(255, 255, 255, 0.25)',
  },
  experienceCanvas: {
    waveCount: 6,
    height: 200,
    color: 'rgba(255, 255, 255, 0.15)',
  },
  projectsCanvas: {
    waveCount: 5,
    height: 180,
    color: 'rgba(255, 200, 200, 0.12)',
  },
};

// ============================================================================
// PRESET 3: OCEAN-INSPIRED (BLUE WAVES)
// ============================================================================
const PRESET_OCEAN = {
  heroCanvas: {
    waveCount: 3,
    height: window.innerHeight * 0.3,
    color: 'rgba(100, 200, 255, 0.12)',
  },
  experienceCanvas: {
    waveCount: 4,
    height: 140,
    color: 'rgba(100, 200, 255, 0.1)',
  },
  projectsCanvas: {
    waveCount: 3,
    height: 120,
    color: 'rgba(50, 150, 255, 0.08)',
  },
};

// ============================================================================
// PRESET 4: FIRE-INSPIRED (RED/ORANGE WAVES)
// ============================================================================
const PRESET_FIRE = {
  heroCanvas: {
    waveCount: 3,
    height: window.innerHeight * 0.3,
    color: 'rgba(255, 150, 0, 0.15)',
  },
  experienceCanvas: {
    waveCount: 4,
    height: 140,
    color: 'rgba(255, 120, 0, 0.12)',
  },
  projectsCanvas: {
    waveCount: 3,
    height: 120,
    color: 'rgba(255, 100, 50, 0.1)',
  },
};

// ============================================================================
// PRESET 5: CYBERPUNK (NEON PURPLE & CYAN)
// ============================================================================
const PRESET_CYBERPUNK = {
  heroCanvas: {
    waveCount: 5,
    height: window.innerHeight * 0.35,
    color: 'rgba(200, 100, 255, 0.2)',
  },
  experienceCanvas: {
    waveCount: 5,
    height: 160,
    color: 'rgba(100, 200, 255, 0.15)',
  },
  projectsCanvas: {
    waveCount: 4,
    height: 140,
    color: 'rgba(255, 0, 200, 0.12)',
  },
};

// ============================================================================
// CUSTOMIZE PARTICLE COUNTS
// ============================================================================
const PARTICLE_PRESETS = {
  minimal: {
    about: 15,
    experience: 20,
    projects: 15,
    products: 10,
  },
  medium: {
    about: 30,
    experience: 40,
    projects: 30,
    products: 25,
  },
  abundant: {
    about: 50,
    experience: 70,
    projects: 60,
    products: 50,
  },
};

// ============================================================================
// ANIMATION SPEED PRESETS
// ============================================================================
const SPEED_PRESETS = {
  slow: {
    waveSpeed: 0.01,      // Very slow waves
    particleSpeed: 15,    // Longer particle animation
  },
  normal: {
    waveSpeed: 0.03,      // Normal speed
    particleSpeed: 10,    // Normal particle speed
  },
  fast: {
    waveSpeed: 0.08,      // Fast waves
    particleSpeed: 5,     // Quick particle animation
  },
};

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
  TO USE THESE PRESETS:
  
  1. Open interactive-waves.js
  2. Find the createWaveSections() method
  3. Replace wave configuration with preset values
  
  Example:
  
  createWaveSections() {
    const heroCanvas = this.createCanvasSection('hero', PRESET_OCEAN.heroCanvas);
    const experienceCanvas = this.createCanvasSection('experience', PRESET_OCEAN.experienceCanvas);
    const projectsCanvas = this.createCanvasSection('projects', PRESET_OCEAN.projectsCanvas);
  }
  
  TO CUSTOMIZE COLORS:
  
  Modify the color property in any preset:
  'rgba(255, 255, 255, 0.15)' means RGB(255, 255, 255) with 15% opacity
  
  Examples:
  - White: rgba(255, 255, 255, opacity)
  - Red: rgba(255, 0, 0, opacity)
  - Green: rgba(0, 255, 0, opacity)
  - Blue: rgba(0, 0, 255, opacity)
  - Purple: rgba(200, 100, 255, opacity)
  - Pink: rgba(255, 100, 200, opacity)
  
  TO ADJUST PARTICLE COUNT:
  
  In animations.js, find the initialization:
  new FloatingParticles('experience', 40);  // Change 40 to desired count
*/

// ============================================================================
// QUICK COLOR PALETTE GENERATOR
// ============================================================================
class ColorPaletteGenerator {
  static randomColor(minOpacity = 0.05, maxOpacity = 0.2) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const opacity = (Math.random() * (maxOpacity - minOpacity) + minOpacity).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  static createPalette(baseColor, variations = 5) {
    const colors = [baseColor];
    const [r, g, b, _] = baseColor.match(/\d+/g);

    for (let i = 1; i < variations; i++) {
      const variation = i * 0.15;
      const newR = Math.max(0, Math.min(255, parseInt(r) + variation * 50));
      const newG = Math.max(0, Math.min(255, parseInt(g) + variation * 50));
      const newB = Math.max(0, Math.min(255, parseInt(b) + variation * 50));
      colors.push(`rgba(${newR}, ${newG}, ${newB}, ${(0.1 - i * 0.02).toFixed(2)})`);
    }

    return colors;
  }
}

// ============================================================================
// ANIMATION DURATION CUSTOMIZATION
// ============================================================================
const DURATION_PRESETS = {
  quick: {
    cardAnimation: '0.4s',
    scrollAnimation: '0.5s',
    waveAnimation: '2s',
  },
  normal: {
    cardAnimation: '0.6s',
    scrollAnimation: '0.8s',
    waveAnimation: '3s',
  },
  cinematic: {
    cardAnimation: '1s',
    scrollAnimation: '1.2s',
    waveAnimation: '5s',
  },
};

/*
  TO APPLY ANIMATION DURATIONS:
  
  1. Find @keyframes in style.css
  2. Update duration values:
     animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
     
  3. Change 0.8s to desired duration from DURATION_PRESETS
*/

// ============================================================================
// EASING FUNCTION PRESETS
// ============================================================================
const EASING_PRESETS = {
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

// ============================================================================
// RESPONSIVE ANIMATION SETTINGS
// ============================================================================
const RESPONSIVE_PRESETS = {
  mobile: {
    waveCount: 2,
    particleCount: 15,
    animationDuration: '1s',
  },
  tablet: {
    waveCount: 3,
    particleCount: 30,
    animationDuration: '0.8s',
  },
  desktop: {
    waveCount: 4,
    particleCount: 50,
    animationDuration: '0.6s',
  },
};

console.log('Animation presets loaded! Use PRESET_* constants to customize.');
