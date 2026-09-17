export function initVideoShowcase() {
  const cards = Array.from(document.querySelectorAll('.video-card'));
  if (!cards.length) return;

  const allVideos = cards.map(c => c.querySelector('video')).filter(Boolean);

  // Configure every video element for seamless continuous loop autoplay (default: MUTED)
  allVideos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
  });

  // Track if lightbox modal is active
  let isLightboxActive = false;

  // Helper to update a mute button's UI state
  function updateCardMuteBtn(card, isMuted) {
    const btn = card.querySelector('.card-mute-btn');
    if (!btn) return;
    if (isMuted) {
      btn.classList.remove('is-unmuted');
      btn.setAttribute('aria-label', 'Unmute video');
      btn.setAttribute('title', 'Unmute audio');
    } else {
      btn.classList.add('is-unmuted');
      btn.setAttribute('aria-label', 'Mute video');
      btn.setAttribute('title', 'Mute audio');
    }
  }

  // Helper to mute all videos on the page
  function muteAllVideos() {
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (video) {
        video.muted = true;
        video.defaultMuted = true;
      }
      updateCardMuteBtn(card, true);
    });
  }

  // Setup mute button toggle handlers on every card
  cards.forEach(card => {
    const video = card.querySelector('video');
    const muteBtn = card.querySelector('.card-mute-btn');
    if (!video || !muteBtn) return;

    // Default state is always muted
    updateCardMuteBtn(card, true);

    const handleToggleMute = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent opening lightbox

      const currentlyMuted = video.muted;
      if (currentlyMuted) {
        // Mute any other video currently unmuted so audio does not clash
        cards.forEach(otherCard => {
          const otherVideo = otherCard.querySelector('video');
          if (otherVideo && otherVideo !== video) {
            otherVideo.muted = true;
            otherVideo.defaultMuted = true;
            updateCardMuteBtn(otherCard, true);
          }
        });

        // Unmute target video
        video.muted = false;
        video.defaultMuted = false;
        try { video.volume = 1; } catch (_) {}
        updateCardMuteBtn(card, false);

        if (video.paused) {
          const p = video.play();
          if (p !== undefined) {
            p.catch(() => {
              // Revert to muted if browser blocks unmuted play
              video.muted = true;
              video.defaultMuted = true;
              updateCardMuteBtn(card, true);
              video.play().catch(() => {});
            });
          }
        }
      } else {
        // Mute target video
        video.muted = true;
        video.defaultMuted = true;
        updateCardMuteBtn(card, true);
      }
    };

    muteBtn.addEventListener('click', handleToggleMute);
    muteBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    muteBtn.addEventListener('touchend', (e) => e.stopPropagation());
    muteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleToggleMute(e);
      }
    });
  });

  function playVisibleVideos() {
    if (isLightboxActive) return;

    cards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;

      const rect = card.getBoundingClientRect();
      const inViewport = (rect.top < window.innerHeight + 150) && (rect.bottom > -150);

      if (inViewport && video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            video.defaultMuted = true;
            updateCardMuteBtn(card, true);
            video.play().catch(() => {});
          });
        }
      } else if (!inViewport) {
        if (!video.paused) video.pause();
        if (!video.muted) {
          video.muted = true;
          video.defaultMuted = true;
          updateCardMuteBtn(card, true);
        }
      }
    });
  }

  // IntersectionObserver for hardware-accelerated viewport-aware playback
  if ('IntersectionObserver' in window) {
    const isMobile = window.innerWidth <= 768;
    const cardObserver = new IntersectionObserver((entries) => {
      if (isLightboxActive) return;

      entries.forEach(entry => {
        const card = entry.target;
        const video = card.querySelector('video');
        if (!video) return;

        if (entry.isIntersecting) {
          if (video.paused) {
            const p = video.play();
            if (p !== undefined) {
              p.catch(() => {
                video.muted = true;
                video.defaultMuted = true;
                updateCardMuteBtn(card, true);
                video.play().catch(() => {});
              });
            }
          }
        } else {
          video.pause();
          if (!video.muted) {
            video.muted = true;
            video.defaultMuted = true;
            updateCardMuteBtn(card, true);
          }
        }
      });
    }, {
      rootMargin: isMobile ? '80px 0px' : '180px 0px',
      threshold: 0.05
    });

    cards.forEach(card => cardObserver.observe(card));
  } else {
    window.addEventListener('scroll', playVisibleVideos, { passive: true });
    playVisibleVideos();
  }

  // Pause & mute background videos when Lightbox is active, resume when closed
  const lightbox = document.getElementById('videoLightbox');
  if (lightbox) {
    const observer = new MutationObserver(() => {
      if (lightbox.classList.contains('active')) {
        isLightboxActive = true;
        muteAllVideos();
        allVideos.forEach(v => v.pause());
      } else {
        isLightboxActive = false;
        playVisibleVideos();
      }
    });
    observer.observe(lightbox, { attributes: true, attributeFilter: ['class'] });
  }

  // Handle document tab visibility (pause when switching browser tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      allVideos.forEach(v => v.pause());
    } else {
      if (!isLightboxActive) {
        playVisibleVideos();
      }
    }
  });

  // User gesture kickstart to unlock mobile/browser strict autoplay policies
  const kickstartAutoplay = () => {
    if (!isLightboxActive) {
      cards.forEach(card => {
        const video = card.querySelector('video');
        if (video && video.paused) {
          video.muted = true;
          video.defaultMuted = true;
          updateCardMuteBtn(card, true);
          video.play().catch(() => {});
        }
      });
    }
    window.removeEventListener('click', kickstartAutoplay);
    window.removeEventListener('scroll', kickstartAutoplay);
    window.removeEventListener('touchstart', kickstartAutoplay);
    window.removeEventListener('touchend', kickstartAutoplay);
  };

  window.addEventListener('click', kickstartAutoplay, { once: true });
  window.addEventListener('scroll', kickstartAutoplay, { once: true, passive: true });
  window.addEventListener('touchstart', kickstartAutoplay, { once: true, passive: true });
  window.addEventListener('touchend', kickstartAutoplay, { once: true, passive: true });
}
