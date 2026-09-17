import '../styles/variables.css';
import '../styles/base.css';
import '../styles/navbar.css';
import '../styles/hero.css';
import '../styles/work.css';
import '../styles/lightbox.css';
import '../styles/sections.css';
import '../styles/footer.css';

import { initNavigation } from './navigation.js';
import { initVideoShowcase } from './videoShowcase.js';
import { initLightbox } from './lightbox.js';
import { initClipboard } from './clipboard.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initVideoShowcase();
  initLightbox();
  initClipboard();
  
  // Section reveal animations on scroll
  const revealElements = document.querySelectorAll('.section, .skill-card, .metric-pill, .tool-card');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  }
});
