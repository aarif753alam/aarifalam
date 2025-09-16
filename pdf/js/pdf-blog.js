// === Share Blog Button ===
function shareBlog() {
  const shareData = {
    title: document.title,
    text: "Check out this useful blog with free PDF tools!",
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("🔗 Blog link copied to clipboard!");
    });
  }
}

document.querySelectorAll(".share-prompt").forEach(el => {
  el.addEventListener("click", shareBlog);
});

// === CTA Buttons → Correct Tool Links ===
const toolLinks = {
  "Convert Images to PDF Now": "https://aarifalam.life/pdf/image-to-pdf",
  "Convert PDF to Images": "https://aarifalam.life/pdf/pdf-to-image",
  "Merge your PDF files now.": "https://aarifalam.life/pdf/merge-pdf",
  "Split PDF files here.": "https://aarifalam.life/pdf/split-pdf",
  "Delete pages now.": "https://aarifalam.life/pdf/remove-pdf-page",
  "Rearrange your PDF files.": "https://aarifalam.life/pdf/pdf-reorder",
  "Create PDF from text.": "https://aarifalam.life/pdf/text-to-pdf",
  "Add an image watermark.": "https://aarifalam.life/pdf/pdf-image-watermark",
  "Add a text watermark.": "https://aarifalam.life/pdf/pdf-text-watermark"
};

document.querySelectorAll(".cta-button").forEach(btn => {
  const text = btn.innerText.trim();
  if (toolLinks[text]) {
    btn.addEventListener("click", () => {
      window.open(toolLinks[text], "_blank");
    });
  }
});
