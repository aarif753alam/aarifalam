document.addEventListener('DOMContentLoaded', () => {
  const downloadSection = document.querySelector('.download-section');

  // 1. Auto-scroll to download section when it's shown
  const originalDisplay = downloadSection.style.display;
  const observer = new MutationObserver(() => {
    if (downloadSection.style.display !== originalDisplay && downloadSection.style.display !== 'none') {
      downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  observer.observe(downloadSection, { attributes: true, attributeFilter: ['style'] });

  // 2. Enhance thumbnail actions visibility and size
  const style = document.createElement('style');
  style.textContent = `
    .thumbnail-actions {
      opacity: 1 !important;
      justify-content: space-between;
      width: 100%;
      padding: 4px;
      top: 4px;
      left: 4px;
      right: 4px;
    }

    .thumbnail-btn {
      width: 26px !important;
      height: 26px !important;
      font-size: 14px !important;
      background: rgba(0, 0, 0, 0.6) !important;
    }

    .rotate-btn::after {
      content: "↻";
    }

    .delete-btn::after {
      content: "×";
    }
  `;
  document.head.appendChild(style);
});
