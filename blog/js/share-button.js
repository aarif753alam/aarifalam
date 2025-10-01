document.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.getElementById('shareButton');
    const shareOptions = document.getElementById('shareOptions');
    const tooltip = document.getElementById('tooltip');
    const copyLink = document.getElementById('copyLink');
    
    // Toggle share options
    shareButton.addEventListener('click', function() {
        shareOptions.classList.toggle('active');
        shareButton.classList.toggle('active');
    });
    
    // Close share options when clicking outside
    document.addEventListener('click', function(event) {
        if (!shareButton.contains(event.target) && !shareOptions.contains(event.target)) {
            shareOptions.classList.remove('active');
            shareButton.classList.remove('active');
        }
    });
    
    // Set up share URLs
    const currentUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    
    document.getElementById('facebookShare').href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    document.getElementById('twitterShare').href = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${pageTitle}`;
    document.getElementById('linkedinShare').href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
    document.getElementById('whatsappShare').href = `https://api.whatsapp.com/send?text=${pageTitle}%20${currentUrl}`;
    
    // Copy link functionality
    copyLink.addEventListener('click', function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            tooltip.classList.add('show');
            setTimeout(function() {
                tooltip.classList.remove('show');
            }, 2000);
        });
    });
    
    // Open share links in a new window
    document.querySelectorAll('.share-option').forEach(option => {
        if (option.id !== 'copyLink') {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(this.href, 'share', 'width=600,height=400');
            });
        }
    });
});