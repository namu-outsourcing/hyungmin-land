const root = document.documentElement;
const header = document.querySelector('.site-header');
const nav = document.querySelector('.main-nav');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const revealTargets = document.querySelectorAll('.scroll-reveal');
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

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

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();
