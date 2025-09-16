
document.getElementById("togglePdfTools").addEventListener("click", function () {
  const content = document.getElementById("pdfToolsContent");
  const icon = this.querySelector(".icon");

  if (content.style.display === "none" || content.style.display === "") {
    content.style.display = "block";
    icon.classList.remove("fa-arrow-down");
    icon.classList.add("fa-arrow-up");
  } else {
    content.style.display = "none";
    icon.classList.remove("fa-arrow-up");
    icon.classList.add("fa-arrow-down");
  }
});

function shareBlog() {
  const shareData = {
    title: "9 Extremely Useful PDF Tools",
    text: "Check out this blog with 9 amazing FREE PDF tools that work right in your browser!",
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link copied to clipboard ✅");
    });
  }
}

document.querySelectorAll(".share-prompt").forEach(el => {
  el.style.cursor = "pointer";
  el.style.color = "#0077cc";
  el.style.textDecoration = "underline";
  el.addEventListener("click", shareBlog);
});

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
    btn.style.cursor = "pointer";
    btn.style.background = "#0077cc";
    btn.style.color = "#fff";
    btn.style.padding = "10px 15px";
    btn.style.borderRadius = "6px";
    btn.style.display = "inline-block";
    btn.addEventListener("click", () => {
      window.open(toolLinks[text], "_blank");
    });
  }
});
