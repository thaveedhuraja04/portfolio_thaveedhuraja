export function initClipboard() {
  const copyButtons = document.querySelectorAll('[data-copy-target]');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy-target');
      const feedbackEl = btn.parentElement?.querySelector('.copy-feedback');

      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        if (feedbackEl) {
          feedbackEl.textContent = 'Copied!';
          feedbackEl.classList.add('show');
          setTimeout(() => {
            feedbackEl.classList.remove('show');
          }, 2000);
        }
      } catch (err) {
        // Fallback using execCommand
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          if (feedbackEl) {
            feedbackEl.textContent = 'Copied!';
            feedbackEl.classList.add('show');
            setTimeout(() => {
              feedbackEl.classList.remove('show');
            }, 2000);
          }
        } catch (e) {
          console.error('Failed to copy', e);
        }
        document.body.removeChild(textArea);
      }
    });
  });
}
