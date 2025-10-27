document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('pdfToolsContent');
    const btn = document.getElementById('togglePdfTools');
    const icon = btn ? btn.querySelector('.icon') : null;

    // Always show blog content and make toggle button look active
    if (content) content.style.display = 'block';
    if (btn) btn.classList.add('active');
    if (icon) {
        icon.classList.remove('fa-arrow-down');
        icon.classList.add('fa-arrow-up');
    }

    // Disable toggle behavior (no hiding allowed)
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent collapsing
            content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
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
