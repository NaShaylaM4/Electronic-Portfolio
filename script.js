const root = document.documentElement;
const navLinks = document.querySelector('.nav-links');
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.toggle-theme');
const yearEl = document.getElementById('year');

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    setTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

function initMobileNav() {
  if (!menuToggle || !navLinks) {
    return;
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) {
      return;
    }

    link.classList.toggle('active', href === current);
  });
}

function initRevealAnimation() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) {
    return;
  }

  const STAGGER_STEP_MS = 70;
  const MAX_STAGGER_MS = 280;

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      visibleEntries.forEach((entry, index) => {
        const staggerDelay = Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS);
        entry.target.style.transitionDelay = `${staggerDelay}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initSmoothInternalLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initCounterAnimation() {
  const stats = document.querySelectorAll('.stat h3');
  if (!stats.length) {
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          const el = entry.target;
          const text = el.textContent.trim();
          const numMatch = text.match(/\d+/);

          if (!numMatch) {
            return;
          }

          const target = parseInt(numMatch[0], 10);
          const duration = 1200;
          const increment = target / (duration / 16);
          let current = 0;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            current = Math.floor(progress * target);
            el.textContent = current + (text.includes('+') ? '+' : text.includes('CS') ? ' CS Senior' : '');

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = text;
              el.dataset.counted = 'true';
              counterObserver.unobserve(el);
            }
          };

          animate();
        }
      });
    },
    { threshold: 0.2 }
  );

  stats.forEach((stat) => counterObserver.observe(stat));
}

function initParallaxGallery() {
  const galleryImages = document.querySelectorAll('.gallery-image-wrap img, .thumbnail-card img');
  if (!galleryImages.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  window.addEventListener('scroll', () => {
    galleryImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const yOffset = (scrollPercent - 0.5) * 20;
      img.style.transform = `translateY(${yOffset}px)`;
    });
  });
}

function initScrollToTop() {
  const scrollBtn = document.querySelector('.scroll-to-top');
  if (!scrollBtn) {
    return;
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

function initContactFormMessage() {
  const form = document.querySelector('.contact-form');
  const status = document.querySelector('.form-status');
  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('https://formspree.io/f/mvzdkqjg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          name: data.name || 'Guest',
          email: data.email || 'no-email',
          subject: data.subject || 'No subject',
          message: data.message || 'No message',
     }),
      });

      if (response.ok) {
        status.textContent = 'Thank you! Your message has been sent successfully. I\'ll get back to you within 24-48 hours.';
        status.style.color = 'var(--accent)';
        form.reset();
      } else {
        status.textContent = 'There was an issue sending your message. Please try again or contact me directly.';
        status.style.color = 'var(--accent)';
        form.reset();
      }
    } catch (error) {
      status.textContent = 'Unable to send at the moment. Please try again later or reach out directly.';
      status.style.color = 'var(--accent)';
      form.reset();
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

initTheme();
initMobileNav();
setActiveNav();
initRevealAnimation();
initCounterAnimation();
initParallaxGallery();
initScrollToTop();
initSmoothInternalLinks();
initContactFormMessage();

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}
