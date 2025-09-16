document.getElementById('togglePdfTools').addEventListener('click', function() {
    const content = document.getElementById('pdfToolsContent');
    const btn = this;
    const icon = btn.querySelector('.icon');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        btn.classList.add('active');
        icon.classList.remove('fa-arrow-down');
        icon.classList.add('fa-arrow-up');
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        content.style.display = 'none';
        btn.classList.remove('active');
        icon.classList.remove('fa-arrow-up');
        icon.classList.add('fa-arrow-down');
    }
});

// -------- Share Blog Buttons --------
document.querySelectorAll('.share-prompt').forEach(shareBtn => {
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: "World Fastest PDF Tools - Blog",
            text: "Check out these amazing FREE PDF tools!",
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log("Blog shared successfully!");
            } catch (err) {
                console.log("Share canceled:", err);
            }
        } else {
            // fallback for unsupported browsers
            prompt("Copy this link to share:", window.location.href);
        }
    });
});

// -------- PDF Tools CTA Buttons --------
const toolLinks = {
    "image-to-pdf": "https://aarifalam.life/pdf/image-to-pdf",
    "pdf-to-image": "https://aarifalam.life/pdf/pdf-to-image",
    "merge-pdf": "https://aarifalam.life/pdf/merge-pdf",
    "split-pdf": "https://aarifalam.life/pdf/split-pdf",
    "delete-pages": "https://aarifalam.life/pdf/remove-pdf-page",
    "rearrange-pages": "https://aarifalam.life/pdf/pdf-reorder",
    "text-to-pdf": "https://aarifalam.life/pdf/text-to-pdf",
    "image-watermark": "https://aarifalam.life/pdf/pdf-image-watermark",
    "text-watermark": "https://aarifalam.life/pdf/pdf-text-watermark"
};

document.querySelectorAll('.tool-section .cta-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.parentElement.id;
        const url = toolLinks[sectionId];
        if (url) window.open(url, "_blank");
    });
});
