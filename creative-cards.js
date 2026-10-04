/**
 * CREATIVE CARD ANIMATION STYLES
 * Unique, modern, cute card designs with animations
 * No traditional boxes - fresh and engaging!
 */

class CreativeCardAnimations {
  constructor() {
    this.initEducationCards();
    this.initCertificationCards();
    this.initExperienceCards();
    this.initSkillsPills();
  }

  // ========================================================================
  // EDUCATION CARDS - Circular Progress Style
  // ========================================================================
  initEducationCards() {
    const educationCards = document.querySelectorAll('.grid-2-col .glass-card');
    educationCards.forEach((card, index) => {
      // Remove old styles
      card.style.cssText = '';
      
      // Add new circular container
      card.innerHTML = `
        <div class="education-card-modern">
          <div class="education-card-visual">
            <div class="education-icon">
              <svg viewBox="0 0 100 100" class="education-svg">
                <circle cx="50" cy="50" r="45" class="circle-bg"/>
                <path d="M 30 45 L 50 35 L 70 45 L 70 65 Q 70 75 60 75 L 40 75 Q 30 75 30 65 Z" class="cap-path"/>
              </svg>
              <div class="education-glow"></div>
            </div>
          </div>
          <div class="education-card-content">
            ${card.innerHTML}
          </div>
        </div>
      `;
      
      card.style.background = 'transparent';
      card.style.border = 'none';
      card.style.padding = '0';
      card.classList.add('education-card-wrapper');
      
      // Add animation on scroll
      this.addScrollAnimation(card);
    });
  }

  // ========================================================================
  // CERTIFICATION CARDS - Tag/Badge Style
  // ========================================================================
  initCertificationCards() {
    const certCards = document.querySelectorAll('.grid-2-col .glass-card');
    const cleanListItems = document.querySelectorAll('.clean-list li');
    
    cleanListItems.forEach((li, index) => {
      const text = li.textContent;
      li.innerHTML = `
        <div class="cert-badge-modern">
          <div class="cert-badge-shine"></div>
          <div class="cert-badge-content">
            <span class="cert-icon">✓</span>
            <span class="cert-text">${text}</span>
          </div>
        </div>
      `;
    });
  }

  // ========================================================================
  // EXPERIENCE CARDS - Timeline Dot & Line Style
  // ========================================================================
  initExperienceCards() {
    const experienceCards = document.querySelectorAll('.timeline-item');
    experienceCards.forEach((card, index) => {
      // Add timeline visual
      const timeline = document.createElement('div');
      timeline.className = 'timeline-visual';
      timeline.innerHTML = `
        <div class="timeline-dot"></div>
        ${index < experienceCards.length - 1 ? '<div class="timeline-line"></div>' : ''}
      `;
      card.style.position = 'relative';
      card.style.paddingLeft = '40px';
      card.insertBefore(timeline, card.firstChild);
      
      // Update card style
      card.style.background = 'transparent';
      card.style.border = 'none';
      card.style.borderLeft = '2px dashed rgba(255,255,255,0.3)';
      card.style.paddingLeft = '30px';
      
      this.addScrollAnimation(card);
    });
  }

  // ========================================================================
  // SKILLS PILLS - Modern Tag Cloud Style
  // ========================================================================
  initSkillsPills() {
    const skillPills = document.querySelectorAll('.skill-pill');
    skillPills.forEach((pill, index) => {
      // Add wrapper for animation
      const wrapper = document.createElement('div');
      wrapper.className = 'skill-pill-wrapper';
      wrapper.style.animation = `fadeInScale 0.6s ease-out ${index * 0.05}s both`;
      
      const content = pill.textContent;
      pill.textContent = '';
      
      const newPill = document.createElement('div');
      newPill.className = 'skill-pill-modern';
      newPill.innerHTML = `
        <span class="skill-label">${content}</span>
        <div class="skill-underline"></div>
      `;
      
      pill.appendChild(newPill);
      pill.style.background = 'transparent';
      pill.style.border = 'none';
      pill.style.padding = '0';
    });
  }

  // ========================================================================
  // SCROLL ANIMATION HELPER
  // ========================================================================
  addScrollAnimation(element) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.classList.add('visible');
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(element);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CreativeCardAnimations();
});
