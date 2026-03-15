// Lock hero height on mobile to prevent resize jitter from address bar
function updateMobileHeroHeight() {
  if (window.innerWidth <= 1080) {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--hero-h', vh + 'px');
  } else {
    document.documentElement.style.removeProperty('--hero-h');
  }
}
updateMobileHeroHeight();

const root = document.documentElement;
const header = document.querySelector('.site-header');
const nav = document.querySelector('.main-nav');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const revealTargets = document.querySelectorAll('.scroll-reveal');
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const aboutSlider = document.querySelector('[data-about-slider]');

function setHeaderState() {
  const isScrolled = window.scrollY > 24;
  header.classList.toggle('is-scrolled', isScrolled);
}

function closeMenu() {
  root.classList.remove('menu-open');
  if (menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
  }
}

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const opened = root.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(opened));
  });
}

const closeButton = document.querySelector('.main-nav__close');
if (closeButton) {
  closeButton.addEventListener('click', () => {
    closeMenu();
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

// Consolidated resize handler at the bottom

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const currentId = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === currentId);
      });
    });
  },
  {
    rootMargin: '-40% 0px -50% 0px',
    threshold: 0.02,
  }
);

sections.forEach((section) => activeObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      
      const target = entry.target;
      target.classList.add('is-visible');
      
      // 하위 stagger-item들 순차적 딜레이 부여
      const staggers = target.querySelectorAll('.stagger-item');
      staggers.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.12}s`;
      });
      
      observer.unobserve(target);
    });
  },
  {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1,
  }
);

// hero-circle parallax code removed (dead code as elements missing)

revealTargets.forEach((target) => revealObserver.observe(target));

if (aboutSlider) {
  const track = aboutSlider.querySelector('.about-slider-track');
  const slides = Array.from(aboutSlider.querySelectorAll('.about-slide'));
  const dotsWrap = aboutSlider.querySelector('.about-slider-dots');
  const prevButton = aboutSlider.querySelector('.about-slider-btn.prev');
  const nextButton = aboutSlider.querySelector('.about-slider-btn.next');
  let currentIndex = 0;
  let autoPlayId = null;
  let slidesPerView = 3;
  let maxIndex = 0;

  if (track && dotsWrap && slides.length > 0) {
    let dots = [];

    function getSlidesPerView() {
      if (window.innerWidth <= 760) return 1;
      if (window.innerWidth <= 1080) return 2;
      return 3;
    }

    function createDots() {
      dotsWrap.innerHTML = '';
      const count = maxIndex + 1;
      dots = Array.from({ length: count }, (_, index) => {
        const dot = document.createElement('span');
        dot.className = 'about-slider-dot';
        dot.setAttribute('aria-hidden', 'true');
        dot.addEventListener('click', () => {
          goToSlide(index);
          restartAutoPlay();
        });
        dotsWrap.appendChild(dot);
        return dot;
      });
    }

    function renderSlider() {
      slidesPerView = getSlidesPerView();
      maxIndex = Math.max(0, slides.length - slidesPerView);

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      if (dots.length !== maxIndex + 1) {
        createDots();
      }

      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).gap || '0');
      const offset = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(${-offset}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
      });

      if (prevButton) prevButton.disabled = maxIndex === 0;
      if (nextButton) nextButton.disabled = maxIndex === 0;
    }

    function goToSlide(index) {
      if (maxIndex === 0) {
        currentIndex = 0;
      } else {
        currentIndex = (index + maxIndex + 1) % (maxIndex + 1);
      }
      renderSlider();
    }

    function startAutoPlay() {
      autoPlayId = window.setInterval(() => {
        goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
      }, 4200);
    }

    function stopAutoPlay() {
      if (autoPlayId) {
        window.clearInterval(autoPlayId);
        autoPlayId = null;
      }
    }

    function restartAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
        restartAutoPlay();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        restartAutoPlay();
      });
    }

    aboutSlider.addEventListener('mouseenter', stopAutoPlay);
    aboutSlider.addEventListener('mouseleave', startAutoPlay);
    aboutSlider.addEventListener('focusin', stopAutoPlay);
    aboutSlider.addEventListener('focusout', startAutoPlay);
    window.addEventListener('resize', renderSlider);

    renderSlider();
    startAutoPlay();
  }
}

// Lightbox
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');

  const slides = Array.from(document.querySelectorAll('.about-slide'));
  let currentLightboxIndex = 0;
  let touchStartX = 0;

  function updateLightboxImage() {
    const img = slides[currentLightboxIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentLightboxIndex = (currentLightboxIndex - 1 + slides.length) % slides.length;
    updateLightboxImage();
  }

  function showNext() {
    currentLightboxIndex = (currentLightboxIndex + 1) % slides.length;
    updateLightboxImage();
  }

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showNext();
      else showPrev();
    }
  }, { passive: true });
})();

window.addEventListener('resize', () => {
  updateMobileHeroHeight();
  if (window.innerWidth > 1080) {
    closeMenu();
  }
});

window.addEventListener('scroll', setHeaderState, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(updateMobileHeroHeight, 100);
});
setHeaderState();
