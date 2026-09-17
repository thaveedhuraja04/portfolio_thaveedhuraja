export function initLightbox() {
  const lightbox = document.getElementById('videoLightbox');
  if (!lightbox) return;

  const container = lightbox.querySelector('.lightbox-video-container');
  const video = lightbox.querySelector('.lightbox-video');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');
  const muteBtn = lightbox.querySelector('#lightboxMuteBtn');
  const muteText = muteBtn?.querySelector('.lightbox-mute-text');
  const titleEl = lightbox.querySelector('.lightbox-title');
  const videoCards = document.querySelectorAll('.video-card');

  let currentTriggerCard = null;

  function updateMuteState(isMuted) {
    if (!muteBtn) return;
    if (isMuted) {
      muteBtn.classList.remove('is-unmuted');
      muteBtn.setAttribute('aria-label', 'Unmute video');
      muteBtn.setAttribute('title', 'Click to unmute');
      if (muteText) muteText.textContent = 'Muted';
    } else {
      muteBtn.classList.add('is-unmuted');
      muteBtn.setAttribute('aria-label', 'Mute video');
      muteBtn.setAttribute('title', 'Click to mute');
      if (muteText) muteText.textContent = 'Sound On';
    }
  }

  function openLightbox(card) {
    currentTriggerCard = card;
    const videoSrc = card.getAttribute('data-video-src');
    const videoRatio = card.getAttribute('data-ratio'); // '9-16' or '16-9'
    const videoNumber = card.getAttribute('data-number');
    const videoTitle = card.getAttribute('data-title') || `Project ${videoNumber}`;

    if (!videoSrc) return;

    // Set aspect ratio container class
    if (container) {
      container.classList.remove('ratio-9-16', 'ratio-16-9');
      if (videoRatio === '9-16') {
        container.classList.add('ratio-9-16');
      } else {
        container.classList.add('ratio-16-9');
      }
    }

    if (titleEl) {
      titleEl.textContent = `${videoNumber} • ${videoTitle}`;
    }

    if (video) {
      // Default: MUST BE MUTED
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.src = videoSrc;
      video.currentTime = 0;
      updateMuteState(true);
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          video.muted = true;
          video.defaultMuted = true;
          video.play().catch(() => {});
        });
      }
    }

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('active')) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (video) {
      video.pause();
      video.muted = true;
      video.defaultMuted = true;
      video.removeAttribute('src'); // clear buffer and stop audio
      video.load();
      updateMuteState(true);
    }

    currentTriggerCard?.focus();
  }

  // Toggle mute on click of lightbox mute button
  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!video) return;

    const willMute = !video.muted;
    video.muted = willMute;
    video.defaultMuted = willMute;
    if (!willMute) {
      try { video.volume = 1; } catch (_) {}
      video.play().catch(() => {});
    }
    updateMuteState(video.muted);
  });

  // Touch isolation to avoid ghost clicks on touchscreens
  muteBtn?.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  closeBtn?.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

  // Sync state if user changes volume using native player controls
  video?.addEventListener('volumechange', () => {
    updateMuteState(video.muted || video.volume === 0);
  });

  // Click card to open
  videoCards.forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  // Close handlers
  closeBtn?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    // Close if clicked on the overlay outside the video container or dialog
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}
