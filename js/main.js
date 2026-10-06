/**
 * SAI SAHITHI KONTAM PORTFOLIO — 60 FPS ZERO-LAG INTERACTIVE HERO
 * CHARACTER TRACKING & SCROLLABLE LUXURY SECTIONS
 */

// 1. CONFIGURATION & CONSTANTS
const TOTAL_FRAMES = 64;
const BG_HEX = '#c7bbb7'; // Exact video backdrop tone
const FACE_NORM_X = 0.525; // Face center X in 1920x1080 source
const FACE_NORM_Y = 0.380; // Face center Y in 1920x1080 source
const LERP_FACTOR = 0.22;  // Fluid ~40ms tracking response

// 2. DOM ELEMENTS
const canvas = document.getElementById('character-canvas');
const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
const loadingScreen = document.getElementById('loading-screen');
const loaderProgress = document.getElementById('loader-progress');
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const heroSection = document.getElementById('hero');

// 3. STATE
const images = new Array(TOTAL_FRAMES);
const loadedFrames = new Set();
let centerImage = null;
let isReady = false;
let isHeroVisible = true;
let isModalOpen = false;

let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.433;
let targetMouseX = mouseX;
let targetMouseY = mouseY;
let ringX = mouseX;
let ringY = mouseY;
let isMouseActive = false;

let currentAngle = 0;
let inDeadzone = true;
let lastDrawnFrame = null;
let updateTimelineSpiderFn = null;

// Geometry variables
let canvasW = window.innerWidth;
let canvasH = window.innerHeight;
let renderW = 0;
let renderH = 0;
let offsetX = 0;
let offsetY = 0;
let faceCenterX = 0;
let faceCenterY = 0;
let deadzoneRadius = 0;

// Shortest-path angular circular interpolation
function lerpAngle(current, target, factor) {
  let diff = (target - current) % (2 * Math.PI);
  if (diff < -Math.PI) diff += 2 * Math.PI;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  return current + diff * factor;
}

// 4. FIND NEAREST LOADED FRAME (NEVER FREEZE, NEVER LAG, NEVER GET STUCK)
function getNearestLoadedFrame(targetIdx) {
  if (loadedFrames.has(targetIdx) && images[targetIdx]) {
    return images[targetIdx];
  }
  for (let offset = 1; offset < TOTAL_FRAMES / 2; offset++) {
    const next = (targetIdx + offset) % TOTAL_FRAMES;
    if (loadedFrames.has(next) && images[next]) return images[next];
    const prev = (targetIdx - offset + TOTAL_FRAMES) % TOTAL_FRAMES;
    if (loadedFrames.has(prev) && images[prev]) return images[prev];
  }
  return centerImage;
}

// 5. DRAW CANVAS (DIRTY-CHECKED: ONLY DRAWS WHEN FRAME CHANGES)
function drawFrame(frame) {
  if (!ctx || !isReady) return;
  const target = frame || centerImage;
  if (!target || !target.complete || target.naturalWidth === 0) return;

  ctx.fillStyle = BG_HEX;
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.drawImage(target, offsetX, offsetY, renderW, renderH);
  lastDrawnFrame = target;
}

// 6. RESIZE & GOLDEN RATIO GEOMETRY
function resize() {
  if (!canvas || !ctx) return;
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;

  // Cap DPR at 1 for 60-120fps hardware-accelerated zero-lag rendering
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  canvas.width = Math.round(canvasW * dpr);
  canvas.height = Math.round(canvasH * dpr);
  canvas.style.width = `${canvasW}px`;
  canvas.style.height = `${canvasH}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const videoAspect = 1920 / 1080;
  const isMobilePortrait = canvasW <= 768 && canvasH >= canvasW;

  if (isMobilePortrait) {
    renderH = canvasH;
    renderW = canvasH * videoAspect;
    offsetX = (canvasW * 0.5) - (renderW * FACE_NORM_X);
    offsetY = 0;
    faceCenterX = canvasW * 0.5;
    faceCenterY = renderH * FACE_NORM_Y;
    deadzoneRadius = Math.min(canvasW, canvasH) * 0.15;
  } else {
    // Desktop & Landscape: Golden Ratio Subject Placement (Subject on the 61.8% golden section)
    const baseScale = Math.max(canvasW / 1920, canvasH / 1080);
    renderW = Math.max(1920 * baseScale, canvasW * 1.15);
    renderH = renderW / videoAspect;
    if (renderH < canvasH) {
      renderH = canvasH;
      renderW = renderH * videoAspect;
    }

    const targetFaceX = canvasW * 0.618;
    let computedOffsetX = targetFaceX - (renderW * FACE_NORM_X);
    offsetX = Math.min(0, Math.max(canvasW - renderW, computedOffsetX));
    offsetY = Math.min(0, (canvasH - renderH) / 2);

    faceCenterX = offsetX + renderW * FACE_NORM_X;
    faceCenterY = offsetY + renderH * FACE_NORM_Y;
    deadzoneRadius = Math.min(canvasW, canvasH) * 0.12;
  }

  lastDrawnFrame = null;
  drawFrame(centerImage);
}

window.addEventListener('resize', resize);

// 7. DISMISS LOADING SCREEN
let loaderDismissed = false;
function dismissLoader() {
  if (loaderDismissed) return;
  loaderDismissed = true;
  if (loaderProgress) {
    loaderProgress.style.width = '100%';
  }
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 120);
}

// 8. ASSET PRELOADING & FAST CIRCULAR HYDRATION
function initCharacterAssets() {
  resize();

  centerImage = new Image();
  centerImage.src = 'frames/center.webp';

  const onCenterReady = () => {
    isReady = true;
    drawFrame(centerImage);
    dismissLoader();
    loadRemainingFrames();
  };

  centerImage.onload = () => {
    if (centerImage.decode) {
      centerImage.decode().then(onCenterReady).catch(onCenterReady);
    } else {
      onCenterReady();
    }
  };

  centerImage.onerror = () => {
    centerImage.src = 'public/frames/center.webp';
    centerImage.onload = onCenterReady;
    centerImage.onerror = () => {
      isReady = true;
      dismissLoader();
    };
  };

  // Fallback safety: never hang loader longer than 1.2s
  setTimeout(dismissLoader, 1200);
}

function loadRemainingFrames() {
  // Octant priority: load cardinal 8 directions first, then fill in 16, then 64
  const priorityOrder = [];
  [8, 4, 2, 1].forEach((step) => {
    for (let i = 0; i < TOTAL_FRAMES; i += step) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }
  });

  priorityOrder.forEach((idx) => {
    const img = new Image();
    img.src = `frames/frame_${idx}.webp`;

    const registerFrame = () => {
      images[idx] = img;
      loadedFrames.add(idx);
    };

    img.onload = () => {
      if (img.decode) {
        img.decode().then(registerFrame).catch(registerFrame);
      } else {
        registerFrame();
      }
    };

    img.onerror = () => {
      img.src = `public/frames/frame_${idx}.webp`;
      img.onload = registerFrame;
    };
  });
}

initCharacterAssets();

// 9. ANIMATION LOOP (DIRTY-CHECKED RENDERING FOR ZERO LAG)
function render() {
  // Smooth mouse interpolation
  mouseX += (targetMouseX - mouseX) * 0.45;
  mouseY += (targetMouseY - mouseY) * 0.45;

  // Smooth custom cursor trailing ring
  if (cursorRing) {
    ringX += (targetMouseX - ringX) * 0.22;
    ringY += (targetMouseY - ringY) * 0.22;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }

  if (isReady && isHeroVisible && ctx) {
    const dx = mouseX - faceCenterX;
    const dy = mouseY - faceCenterY;
    const dist = Math.hypot(dx, dy);

    if (!isMouseActive || dist < deadzoneRadius || isModalOpen || window.scrollY > 150) {
      inDeadzone = true;
    } else {
      inDeadzone = false;
      const targetAngle = Math.atan2(dy, dx);
      currentAngle = lerpAngle(currentAngle, targetAngle, LERP_FACTOR);
    }

    let frameToDraw = centerImage;
    if (!inDeadzone) {
      let norm = currentAngle % (2 * Math.PI);
      if (norm < 0) norm += 2 * Math.PI;
      const frameIdx = Math.round((norm / (2 * Math.PI)) * TOTAL_FRAMES) % TOTAL_FRAMES;
      frameToDraw = getNearestLoadedFrame(frameIdx);
    }

    if (frameToDraw && frameToDraw !== lastDrawnFrame) {
      drawFrame(frameToDraw);
    }
  }

  if (typeof updateTimelineSpiderFn === 'function') {
    updateTimelineSpiderFn();
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// 10. MOUSE & TOUCH EVENT LISTENERS
window.addEventListener('mousemove', (e) => {
  isMouseActive = true;
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = `${targetMouseX}px`;
    cursorDot.style.top = `${targetMouseY}px`;
  }
}, { passive: true });

window.addEventListener('mouseleave', () => {
  isMouseActive = false;
  targetMouseX = faceCenterX;
  targetMouseY = faceCenterY;
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    isMouseActive = true;
    targetMouseX = e.touches[0].clientX;
    targetMouseY = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  isMouseActive = false;
  targetMouseX = faceCenterX;
  targetMouseY = faceCenterY;
});

// Pause hero canvas rendering when scrolled past hero
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isHeroVisible = entry.isIntersecting;
  });
}, { threshold: 0.05 });

if (heroSection) {
  heroObserver.observe(heroSection);
}

// 8. MAGNETIC BUTTON & CURSOR HOVER EFFECTS
function attachMagneticEffects() {
  document.querySelectorAll('.magnetic-target').forEach((target) => {
    if (target.dataset.magneticAttached) return;
    target.dataset.magneticAttached = 'true';

    target.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hovering');
    });

    target.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hovering');
      target.style.transform = '';
    });

    target.addEventListener('mousemove', (e) => {
      const rect = target.getBoundingClientRect();
      const elemCenterX = rect.left + rect.width / 2;
      const elemCenterY = rect.top + rect.height / 2;
      const pullX = (e.clientX - elemCenterX) * 0.22;
      const pullY = (e.clientY - elemCenterY) * 0.22;

      target.style.transform = `translate(${pullX}px, ${pullY}px)`;
    });
  });
}

attachMagneticEffects();

// 9. IMMEDIATE DISPLAY OF ALL SECTIONS (NO DELAYS)
document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));

// 10. TOP-RIGHT HORIZONTAL NAV PILL HIGHLIGHT ON SCROLL & SMOOTH CLICK NAVIGATION
const navSections = [
  document.getElementById('about'),
  document.getElementById('experience'),
  document.getElementById('projects'),
  document.getElementById('products'),
  document.getElementById('skills'),
  document.getElementById('contact')
].filter(Boolean);

const pillLinks = document.querySelectorAll('.nav-pill .nav-link');

function syncActiveNav() {
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  // On first page / hero section: ABOUT is active
  if (scrollPosition < window.innerHeight * 0.45) {
    pillLinks.forEach(link => {
      if (link.getAttribute('href') === '#about' || link.getAttribute('href') === '#hero') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    return;
  }

  // Check if at the bottom of the page
  const atPageBottom = (window.innerHeight + scrollPosition) >= (document.documentElement.scrollHeight - 60);
  if (atPageBottom) {
    pillLinks.forEach(link => {
      if (link.getAttribute('href') === '#contact') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    return;
  }

  // Active section trigger zone: 140px down from viewport top
  const triggerY = 140;
  let activeSectionId = null;

  for (let i = 0; i < navSections.length; i++) {
    const sec = navSections[i];
    const rect = sec.getBoundingClientRect();
    if (rect.top <= triggerY && rect.bottom > triggerY) {
      activeSectionId = sec.getAttribute('id');
      break;
    }
  }

  // If between sections or top section is partially scrolled
  if (!activeSectionId && navSections.length > 0) {
    let closestDist = Infinity;
    navSections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const dist = Math.abs(rect.top - triggerY);
      if (dist < closestDist) {
        closestDist = dist;
        activeSectionId = sec.getAttribute('id');
      }
    });
  }

  if (activeSectionId) {
    pillLinks.forEach(link => {
      if (link.getAttribute('href') === `#${activeSectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

window.addEventListener('scroll', syncActiveNav, { passive: true });
window.addEventListener('resize', syncActiveNav, { passive: true });
window.addEventListener('load', syncActiveNav);
document.addEventListener('DOMContentLoaded', syncActiveNav);

// Smooth scroll click handler
document.querySelectorAll('.nav-link, a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId && targetId.startsWith('#') && targetId.length > 1) {
      // If clicking About / Hero: scroll to top smoothly
      if (targetId === '#about' || targetId === '#hero') {
        e.preventDefault();
        pillLinks.forEach(link => {
          if (link.getAttribute('href') === '#about' || link.getAttribute('href') === '#hero') {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();

        // Immediately update active pill for responsive instant feedback
        pillLinks.forEach(link => {
          if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        const headerOffset = 40;
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// 11. RESUME MODAL & PRINT ACTIONS
const resumeModal = document.getElementById('panel-resume');
const btnResume = document.getElementById('btn-resume');
const btnMobileResume = document.getElementById('btn-mobile-resume');
const modalCloseBtns = document.querySelectorAll('[data-close]');
const btnPrintResume = document.getElementById('btn-print-resume');

function openResume() {
  if (resumeModal) {
    resumeModal.classList.add('active');
    resumeModal.setAttribute('aria-hidden', 'false');
    isModalOpen = true;
  }
}

function closeResume() {
  if (resumeModal) {
    resumeModal.classList.remove('active');
    resumeModal.setAttribute('aria-hidden', 'true');
    isModalOpen = false;
  }
}

if (btnResume) {
  btnResume.addEventListener('click', openResume);
}
if (btnMobileResume) {
  btnMobileResume.addEventListener('click', openResume);
}
if (btnPrintResume) {
  btnPrintResume.addEventListener('click', () => {
    window.print();
  });
}

if (modalCloseBtns && modalCloseBtns.length > 0) {
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', closeResume);
  });
}

if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      closeResume();
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeResume();
  }
});

// =========================================================
// 12. PROJECTS LUXURY HORIZONTAL SLIDING CAROUSEL
// =========================================================
function initProjectsSlider() {
  const track = document.getElementById('projects-slider-track');
  const viewport = document.querySelector('.projects-slider-viewport');
  if (!track || !viewport) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  if (cards.length === 0) return;

  const prevBtns = [
    document.getElementById('proj-slider-prev'),
    document.getElementById('proj-side-prev')
  ].filter(Boolean);

  const nextBtns = [
    document.getElementById('proj-slider-next'),
    document.getElementById('proj-side-next')
  ].filter(Boolean);

  const dotsContainer = document.getElementById('proj-slider-dots');
  const tab1 = document.getElementById('proj-tab-1');
  const tab2 = document.getElementById('proj-tab-2');
  const switchBtn = document.getElementById('proj-switch-btn');
  const switchText = document.getElementById('proj-switch-text');

  let currentSlide = 0;

  function getCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }

  function getGap() {
    if (window.innerWidth <= 640) return 16;
    if (window.innerWidth <= 960) return 18;
    return 24;
  }

  function getTotalSlides() {
    return Math.ceil(cards.length / getCardsPerView());
  }

  function updateCardDimensions() {
    const cardsPerView = getCardsPerView();
    const gap = getGap();
    const vpWidth = viewport.clientWidth || viewport.getBoundingClientRect().width || window.innerWidth;
    const cardWidth = Math.max(260, (vpWidth - (cardsPerView - 1) * gap) / cardsPerView);
    track.style.setProperty('--project-card-w', `${cardWidth.toFixed(2)}px`);
    cards.forEach(c => {
      c.style.width = `${cardWidth.toFixed(2)}px`;
      c.style.flex = `0 0 ${cardWidth.toFixed(2)}px`;
    });
    return { cardWidth, gap, cardsPerView };
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const totalSlides = getTotalSlides();
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${i === currentSlide ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.setAttribute('type', 'button');
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateSlide() {
    const totalSlides = getTotalSlides();
    if (currentSlide >= totalSlides) currentSlide = totalSlides - 1;
    if (currentSlide < 0) currentSlide = 0;

    const { cardWidth, gap, cardsPerView } = updateCardDimensions();

    let offset = 0;
    if (currentSlide === 0) {
      offset = 0;
    } else {
      let targetIndex = currentSlide * cardsPerView;
      if (targetIndex > cards.length - cardsPerView) {
        targetIndex = Math.max(0, cards.length - cardsPerView);
      }
      offset = targetIndex * (cardWidth + gap);
    }

    track.style.transform = `translate3d(-${offset.toFixed(2)}px, 0, 0)`;

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    if (tab1 && tab2) {
      tab1.classList.toggle('active', currentSlide === 0);
      tab1.setAttribute('aria-selected', currentSlide === 0 ? 'true' : 'false');
      tab2.classList.toggle('active', currentSlide > 0);
      tab2.setAttribute('aria-selected', currentSlide > 0 ? 'true' : 'false');
    }

    if (switchText) {
      if (currentSlide === 0) {
        switchText.textContent = 'Slide to view next 3 projects (Meeting Summarizer, Foodie, Prescripto) →';
      } else {
        switchText.textContent = '← Slide back to first 3 projects (AcaRAG-Pro, Transac-NOVA, Code Reviewer)';
      }
    }

    const counterPill = document.getElementById('proj-counter-pill');
    if (counterPill) {
      counterPill.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }

    prevBtns.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('disabled');
    });
    nextBtns.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('disabled');
    });

    if (typeof attachMagneticEffects === 'function') {
      attachMagneticEffects();
    }
  }

  function goToSlide(slideIdx) {
    const totalSlides = getTotalSlides();
    currentSlide = (slideIdx + totalSlides) % totalSlides;
    updateSlide();
  }

  function nextSlide() {
    const totalSlides = getTotalSlides();
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
  }

  function prevSlide() {
    const totalSlides = getTotalSlides();
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide();
  }

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    });
  });

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
    });
  });

  // Delegated global click listener for bulletproof button interaction
  document.addEventListener('click', (e) => {
    const prevBtn = e.target.closest('#proj-slider-prev, #proj-side-prev');
    if (prevBtn) {
      e.preventDefault();
      prevSlide();
      return;
    }

    const nextBtn = e.target.closest('#proj-slider-next, #proj-side-next');
    if (nextBtn) {
      e.preventDefault();
      nextSlide();
      return;
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
    }
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping || !e.changedTouches || e.changedTouches.length === 0) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isSwiping = false;
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderDots();
      updateSlide();
    }, 100);
  });

  renderDots();
  updateSlide();

  // Expose for external access and tests
  window.portfolioProjectsSlider = {
    goToSlide,
    nextSlide,
    prevSlide,
    updateSlide,
    getCurrentSlide: () => currentSlide,
    getTotalSlides
  };
}

initProjectsSlider();



// 13. INITIALIZATION
if (typeof preloadAssets === 'function') {
  preloadAssets();
}

// 14. CONTACT FORM EMAIL SENDER
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const msgInput = document.getElementById('contact-msg');
    const feedback = document.getElementById('contact-form-feedback');
    const submitBtn = document.getElementById('btn-submit-contact');

    const name = nameInput ? nameInput.value.trim() : '';
    const senderEmail = emailInput ? emailInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!message) return;

    const subject = encodeURIComponent(`Portfolio Message from ${name || 'Visitor'}`);
    const body = encodeURIComponent(
      `Hi Sai Sahithi,\n\n${message}\n\n───────────────────────────\nFrom: ${name}\nEmail: ${senderEmail}`
    );

    const mailtoUrl = `mailto:sahitikontam@gmail.com?subject=${subject}&body=${body}`;

    // Trigger user's mail client
    window.location.href = mailtoUrl;

    if (feedback) {
      feedback.style.display = 'block';
      feedback.innerHTML = `Opening your email client to send to <strong>sahitikontam@gmail.com</strong>.<br><small style="opacity: 0.9;">If your mail app did not open automatically, <a href="${mailtoUrl}" style="color: #ffffff; text-decoration: underline; font-weight: 600;">click here to send directly</a>.</small>`;
    }

    if (submitBtn) {
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Email Client Opened ✓</span>`;
      setTimeout(() => {
        submitBtn.innerHTML = originalContent;
      }, 3500);
    }
  });
}

// =========================================================
// 14. GLOWING SPIDER TIMELINE COMPANION (Smooth Scroll Rail Rider)
// =========================================================
function initTimelineSpider() {
  const spider = document.getElementById('timeline-spider') || document.getElementById('timeline-cat');
  const container = document.querySelector('.timeline-container');
  if (!spider || !container) return;

  let currentY = 0;
  let targetY = 0;
  let isCrawling = false;
  let crawlStopTimeout = null;

  function updateTargetFromClientY(clientY) {
    const rect = container.getBoundingClientRect();
    const maxY = Math.max(0, container.offsetHeight - 52);
    // Align spider vertically with cursor position relative to timeline container
    const computedY = clientY - rect.top - 24;
    targetY = Math.max(0, Math.min(computedY, maxY));
    isCrawling = true;
    spider.classList.add('is-scrolling');

    clearTimeout(crawlStopTimeout);
    crawlStopTimeout = setTimeout(() => {
      isCrawling = false;
      spider.classList.remove('is-scrolling');
    }, 220);
  }

  // Active cursor tracking when mouse moves
  window.addEventListener('mousemove', (e) => {
    updateTargetFromClientY(e.clientY);
  }, { passive: true });

  // Touch tracking for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updateTargetFromClientY(e.touches[0].clientY);
    }
  }, { passive: true });

  // Keep responsive when scrolling
  window.addEventListener('scroll', () => {
    const rect = container.getBoundingClientRect();
    const focalPoint = window.innerHeight * 0.42;
    const computedY = focalPoint - rect.top - 24;
    const maxY = Math.max(0, container.offsetHeight - 52);
    targetY = Math.max(0, Math.min(computedY, maxY));
    isCrawling = true;
    spider.classList.add('is-scrolling');

    clearTimeout(crawlStopTimeout);
    crawlStopTimeout = setTimeout(() => {
      isCrawling = false;
      spider.classList.remove('is-scrolling');
    }, 200);
  }, { passive: true });

  // 60FPS continuous smooth crawl loop
  function crawlAnimationLoop() {
    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.4) {
      currentY += diff * 0.16;
      spider.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      spider.classList.add('is-scrolling');
    } else {
      if (!isCrawling) {
        spider.classList.remove('is-scrolling');
      }
    }
    requestAnimationFrame(crawlAnimationLoop);
  }

  crawlAnimationLoop();

  // Playful click interaction: silk bungee hop
  spider.addEventListener('click', (e) => {
    e.stopPropagation();
    spider.classList.add('spider-jump');
    setTimeout(() => {
      spider.classList.remove('spider-jump');
    }, 450);
  });
}

// =========================================================
// 14B. CONTACT COPY BUTTONS INTERACTION
// =========================================================
function initContactCopyButtons() {
  document.querySelectorAll('.contact-copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const textToCopy = btn.dataset.copy || '';
      if (!textToCopy) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const ta = document.createElement('textarea');
          ta.value = textToCopy;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        btn.classList.add('copied');
        const tooltip = btn.querySelector('.copy-tooltip');
        if (tooltip) tooltip.textContent = 'Copied!';

        setTimeout(() => {
          btn.classList.remove('copied');
          if (tooltip) tooltip.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initProjectsSlider();
    initTimelineSpider();
    initContactCopyButtons();
    initProjectPopout();
    initMobileNavigation();
  });
} else {
  initProjectsSlider();
  initTimelineSpider();
  initContactCopyButtons();
  initProjectPopout();
  initMobileNavigation();
}

// =========================================================
// 15. PROJECT CARD CLICK POPOUT MODAL & EXPAND ANIMATION
// =========================================================
function initProjectPopout() {
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-popout-modal');
  const modalClose = document.getElementById('project-modal-close');
  const modalCloseBtn = document.getElementById('project-modal-close-btn');
  const modalImg = document.getElementById('project-modal-img');
  const modalYear = document.getElementById('project-modal-year');
  const modalType = document.getElementById('project-modal-type');
  const modalTitle = document.getElementById('project-modal-title');
  const modalDesc = document.getElementById('project-modal-desc');
  const modalHighlight = document.getElementById('project-modal-highlight');
  const modalTags = document.getElementById('project-modal-tags');
  const modalGithub = document.getElementById('project-modal-github');

  if (!modal) return;

  function openProjectModal(card) {
    const img = card.querySelector('.project-img');
    const year = card.querySelector('.project-year');
    const title = card.querySelector('.card-title');
    const type = card.querySelector('.project-type');
    const desc = card.querySelector('.project-desc');
    const highlight = card.querySelector('.project-highlight');
    const tags = card.querySelector('.project-tags');
    const link = card.querySelector('.project-link');

    if (modalImg && img) {
      modalImg.src = img.src;
      modalImg.alt = img.alt || 'Project Showcase';
    }
    if (modalYear && year) modalYear.textContent = year.textContent.trim();
    if (modalTitle && title) modalTitle.textContent = title.textContent.trim();
    if (modalType && type) modalType.textContent = type.textContent.trim();
    if (modalDesc && desc) modalDesc.textContent = desc.textContent.trim();
    if (modalHighlight && highlight) {
      modalHighlight.innerHTML = highlight.innerHTML;
      modalHighlight.style.display = 'block';
    } else if (modalHighlight) {
      modalHighlight.style.display = 'none';
    }
    if (modalTags && tags) modalTags.innerHTML = tags.innerHTML;
    if (modalGithub && link) {
      modalGithub.href = link.href;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If user directly clicked the small 'Source Code' link on card, don't open modal
      if (e.target.closest('.project-link')) {
        return;
      }
      openProjectModal(card);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProjectModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });
}

// =========================================================
// 16. MOBILE NAVIGATION DRAWER & ACCESSIBLE TOUCH CONTROLS
// =========================================================
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');
  const mobileResumeBtn = document.getElementById('btn-mobile-resume');
  const mobileTalkBtn = document.getElementById('btn-mobile-talk');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeDrawer();
    });
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  if (mobileResumeBtn) {
    mobileResumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
      if (typeof openResume === 'function') {
        openResume();
      }
    });
  }

  if (mobileTalkBtn) {
    mobileTalkBtn.addEventListener('click', () => {
      closeDrawer();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// -------------------------------------------------------------
// MOBILE UI: TIMELINE READ MORE / READ LESS EXPANSION
// -------------------------------------------------------------
function initMobileTimelineReadMore() {
  document.querySelectorAll('.timeline-read-more').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.timeline-item');
      if (!item) return;

      const isExpanded = item.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      const textSpan = btn.querySelector('.read-more-text');
      if (textSpan) {
        textSpan.textContent = isExpanded ? 'Read less' : 'Read more';
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileTimelineReadMore);
} else {
  initMobileTimelineReadMore();
}




