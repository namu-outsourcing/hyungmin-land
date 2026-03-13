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

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1080) {
    closeMenu();
  }
});

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
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.1,
  }
);

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

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();
