/**
 * SAI SAHITHI KONTAM PORTFOLIO — HIGH PERFORMANCE ZERO-LAG
 * FLORAL PORTRAIT & SCROLLABLE LUXURY SECTIONS
 */

// 1. DOM ELEMENTS
const loadingScreen = document.getElementById('loading-screen');
const loaderProgress = document.getElementById('loader-progress');
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

// 2. DISMISS LOADING SCREEN (Instant, silky smooth)
function dismissLoader() {
  if (loaderProgress) {
    loaderProgress.style.width = '100%';
  }
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', dismissLoader);
} else {
  dismissLoader();
}

// 3. SMOOTH CUSTOM CURSOR
let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.5;
let targetMouseX = mouseX;
let targetMouseY = mouseY;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener('mousemove', (e) => {
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = `${targetMouseX}px`;
    cursorDot.style.top = `${targetMouseY}px`;
  }
}, { passive: true });

function updateCursorRing() {
  if (cursorRing) {
    ringX += (targetMouseX - ringX) * 0.22;
    ringY += (targetMouseY - ringY) * 0.22;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  requestAnimationFrame(updateCursorRing);
}
requestAnimationFrame(updateCursorRing);

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

modalCloseBtns.forEach(btn => {
  btn.addEventListener('click', closeResume);
});

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

// 12. PROJECTS NAVIGATION (DESKTOP BATCHES + MOBILE 1 CARD AT A TIME)
const batch1 = document.getElementById('projects-batch-1');
const batch2 = document.getElementById('projects-batch-2');
const btnBatchPrev = document.getElementById('btn-batch-prev');
const btnBatchNext = document.getElementById('btn-batch-next');

// Mobile project controls
const allProjectCards = Array.from(document.querySelectorAll('.projects-carousel-track .project-card'));
const btnMobileProjPrev = document.getElementById('btn-mobile-project-prev');
const btnMobileProjNext = document.getElementById('btn-mobile-project-next');
const mobileProjCurrent = document.getElementById('mobile-project-current');
const mobileProjTotal = document.getElementById('mobile-project-total');
const carouselTrack = document.querySelector('.projects-carousel-track');

let currentBatch = 1;
let mobileProjectIndex = 0;

function showBatch(batchNum) {
  if (batchNum < 1) batchNum = 1;
  if (batchNum > 2) batchNum = 2;
  currentBatch = batchNum;

  if (currentBatch === 1) {
    if (batch1) batch1.classList.add('active');
    if (batch2) batch2.classList.remove('active');
    if (btnBatchPrev) {
      btnBatchPrev.classList.add('disabled');
      btnBatchPrev.setAttribute('disabled', 'true');
    }
    if (btnBatchNext) {
      btnBatchNext.classList.remove('disabled');
      btnBatchNext.removeAttribute('disabled');
    }
  } else {
    if (batch1) batch1.classList.remove('active');
    if (batch2) batch2.classList.add('active');
    if (btnBatchPrev) {
      btnBatchPrev.classList.remove('disabled');
      btnBatchPrev.removeAttribute('disabled');
    }
    if (btnBatchNext) {
      btnBatchNext.classList.add('disabled');
      btnBatchNext.setAttribute('disabled', 'true');
    }
  }

  attachMagneticEffects();
}

if (btnBatchPrev) {
  btnBatchPrev.addEventListener('click', () => {
    if (currentBatch > 1) showBatch(currentBatch - 1);
  });
}

if (btnBatchNext) {
  btnBatchNext.addEventListener('click', () => {
    if (currentBatch < 2) showBatch(currentBatch + 1);
  });
}

// Mobile Single Project Display Logic (1 Card at a Time)
function showMobileProject(index) {
  if (!allProjectCards || allProjectCards.length === 0) return;
  if (index < 0) index = 0;
  if (index >= allProjectCards.length) index = allProjectCards.length - 1;
  mobileProjectIndex = index;

  allProjectCards.forEach((card, i) => {
    if (i === mobileProjectIndex) {
      card.classList.add('mobile-active');
    } else {
      card.classList.remove('mobile-active');
    }
  });

  if (mobileProjCurrent) {
    mobileProjCurrent.textContent = mobileProjectIndex + 1;
  }
  if (mobileProjTotal) {
    mobileProjTotal.textContent = allProjectCards.length;
  }

  if (btnMobileProjPrev) {
    btnMobileProjPrev.disabled = (mobileProjectIndex === 0);
    btnMobileProjPrev.classList.toggle('disabled', mobileProjectIndex === 0);
  }
  if (btnMobileProjNext) {
    btnMobileProjNext.disabled = (mobileProjectIndex === allProjectCards.length - 1);
    btnMobileProjNext.classList.toggle('disabled', mobileProjectIndex === allProjectCards.length - 1);
  }
}

if (btnMobileProjPrev) {
  btnMobileProjPrev.addEventListener('click', () => {
    if (mobileProjectIndex > 0) showMobileProject(mobileProjectIndex - 1);
  });
}

if (btnMobileProjNext) {
  btnMobileProjNext.addEventListener('click', () => {
    if (mobileProjectIndex < allProjectCards.length - 1) showMobileProject(mobileProjectIndex + 1);
  });
}

// Touch swipe support on mobile projects track
if (carouselTrack) {
  let touchStartX = 0;
  let touchEndX = 0;

  carouselTrack.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  carouselTrack.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 45) {
        if (diffX < 0) {
          // Swipe left -> Next project
          if (mobileProjectIndex < allProjectCards.length - 1) {
            showMobileProject(mobileProjectIndex + 1);
          }
        } else {
          // Swipe right -> Previous project
          if (mobileProjectIndex > 0) {
            showMobileProject(mobileProjectIndex - 1);
          }
        }
      }
    }
  }, { passive: true });
}

// Initialize desktop and mobile project states
showBatch(1);
showMobileProject(0);

// =========================================================
// MOBILE PRODUCTS NAVIGATION (1 PRODUCT AT A TIME ON MOBILE)
// =========================================================
const allProductItems = Array.from(document.querySelectorAll('.ambient-showcase .ambient-item'));
const btnMobileProdPrev = document.getElementById('btn-mobile-product-prev');
const btnMobileProdNext = document.getElementById('btn-mobile-product-next');
const mobileProdCurrent = document.getElementById('mobile-product-current');
const mobileProdTotal = document.getElementById('mobile-product-total');
const ambientShowcase = document.querySelector('.ambient-showcase');

let mobileProductIndex = 0;

function showMobileProduct(index) {
  if (!allProductItems || allProductItems.length === 0) return;
  if (index < 0) index = 0;
  if (index >= allProductItems.length) index = allProductItems.length - 1;
  mobileProductIndex = index;

  allProductItems.forEach((item, i) => {
    if (i === mobileProductIndex) {
      item.classList.add('mobile-active');
    } else {
      item.classList.remove('mobile-active');
    }
  });

  if (mobileProdCurrent) {
    mobileProdCurrent.textContent = mobileProductIndex + 1;
  }
  if (mobileProdTotal) {
    mobileProdTotal.textContent = allProductItems.length;
  }

  if (btnMobileProdPrev) {
    btnMobileProdPrev.disabled = (mobileProductIndex === 0);
    btnMobileProdPrev.classList.toggle('disabled', mobileProductIndex === 0);
  }
  if (btnMobileProdNext) {
    btnMobileProdNext.disabled = (mobileProductIndex === allProductItems.length - 1);
    btnMobileProdNext.classList.toggle('disabled', mobileProductIndex === allProductItems.length - 1);
  }
}

if (btnMobileProdPrev) {
  btnMobileProdPrev.addEventListener('click', () => {
    if (mobileProductIndex > 0) showMobileProduct(mobileProductIndex - 1);
  });
}

if (btnMobileProdNext) {
  btnMobileProdNext.addEventListener('click', () => {
    if (mobileProductIndex < allProductItems.length - 1) showMobileProduct(mobileProductIndex + 1);
  });
}

// Touch swipe support on ambient showcase
if (ambientShowcase) {
  let prodTouchStartX = 0;
  let prodTouchEndX = 0;

  ambientShowcase.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      prodTouchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  ambientShowcase.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      prodTouchEndX = e.changedTouches[0].clientX;
      const diffX = prodTouchEndX - prodTouchStartX;
      if (Math.abs(diffX) > 45) {
        if (diffX < 0) {
          // Swipe left -> Next product
          if (mobileProductIndex < allProductItems.length - 1) {
            showMobileProduct(mobileProductIndex + 1);
          }
        } else {
          // Swipe right -> Previous product
          if (mobileProductIndex > 0) {
            showMobileProduct(mobileProductIndex - 1);
          }
        }
      }
    }
  }, { passive: true });
}

showMobileProduct(0);

// 13. INITIALIZATION
preloadAssets();
requestAnimationFrame(render);

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

  let scrollStopTimeout = null;
  let isTicking = false;
  let currentY = 0;
  let targetY = 0;

  function updateSpiderPosition() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Focus target: roughly 42% down the viewport (where reader's eye level rests)
    const focalPoint = windowHeight * 0.42;
    const computedY = focalPoint - rect.top;

    // Clamp between top (0) and bottom of timeline (container height - spider height)
    const maxY = Math.max(0, container.offsetHeight - 52);
    targetY = Math.max(0, Math.min(computedY, maxY));

    // Smooth physics lerp
    currentY += (targetY - currentY) * 0.28;
    if (Math.abs(targetY - currentY) < 0.3) {
      currentY = targetY;
    }

    spider.style.transform = `translate3d(0, ${currentY}px, 0)`;

    if (Math.abs(targetY - currentY) >= 0.3) {
      requestAnimationFrame(updateSpiderPosition);
    } else {
      isTicking = false;
    }
  }

  function handleScroll() {
    // While scrolling, spider plays active crawling animation
    spider.classList.add('is-scrolling');

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateSpiderPosition);
    }

    // Debounce scroll stop: when user stops scrolling, settle
    clearTimeout(scrollStopTimeout);
    scrollStopTimeout = setTimeout(() => {
      spider.classList.remove('is-scrolling');
    }, 200);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    updateSpiderPosition();
  }, { passive: true });

  // Initial placement calculation
  updateSpiderPosition();

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
    initTimelineSpider();
    initContactCopyButtons();
    initProjectPopout();
    initMobileNavigation();
  });
} else {
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




