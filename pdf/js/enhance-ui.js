document.addEventListener('DOMContentLoaded', () => {
  const downloadSection = document.querySelector('.download-section');
  const convertButton = document.querySelector('.convert-button'); // Update this selector

  // 1. Enhanced scroll function that doesn't take full page
  const smoothScrollToDownload = () => {
    const elementRect = downloadSection.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
    
    window.scrollTo({
      top: middle,
      behavior: 'smooth'
    });
  };

  // 2. Observe changes to download section visibility
  const originalDisplay = downloadSection.style.display;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'style') {
        const currentDisplay = downloadSection.style.display;
        if (currentDisplay !== originalDisplay && currentDisplay !== 'none') {
          smoothScrollToDownload();
        }
      }
    });
  });

  observer.observe(downloadSection, { 
    attributes: true, 
    attributeFilter: ['style'] 
  });

  // 3. Optional: Direct convert button click handler
  if (convertButton) {
    convertButton.addEventListener('click', () => {
      // Your conversion logic here
      // Then show download section (if not automatically shown)
      // downloadSection.style.display = 'block';
    });
  }

  // 4. Enhanced styles with better scroll behavior
  const style = document.createElement('style');
  style.textContent = `
    .download-section {
      margin: 20px 0;
      padding: 20px 0;
      border-top: 1px solid #eee;
    }
    #download-pdf-button { /* Target your actual download button */
      display: inline-block;
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 10px 0;
    }
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