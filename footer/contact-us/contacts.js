// contacts.js - Optimized for Cloudflare static hosting
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation class to floating elements
    var floatingElements = document.querySelectorAll('.floating');
    floatingElements.forEach(function(element) {
        element.style.animation = 'float 6s ease-in-out infinite';
    });

    // Contact form validation (simulated for static site)
    var contactForm = document.getElementById('feedback-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var isValid = true;
            var nameInput = document.getElementById('user-name');
            var emailInput = document.getElementById('user-email');
            var messageInput = document.getElementById('user-message');
            var submitBtn = contactForm.querySelector('button[type="submit"]');
            
            // Reset errors
            var errorElements = document.querySelectorAll('.error-message');
            errorElements.forEach(function(errorElement) {
                errorElement.classList.remove('show');
            });
            
            // Validate name
            if (!nameInput.value.trim()) {
                document.getElementById('name-error').classList.add('show');
                isValid = false;
            }
            
            // Validate email
            if (!emailInput.value.trim()) {
                document.getElementById('email-error').classList.add('show');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                document.getElementById('email-error').textContent = 'Please enter a valid email';
                document.getElementById('email-error').classList.add('show');
                isValid = false;
            }
            
            // Validate message
            if (!messageInput.value.trim()) {
                document.getElementById('message-error').classList.add('show');
                isValid = false;
            }
            
            if (isValid) {
                // Show loading state
                var originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Simulate form submission (for static site)
                setTimeout(function() {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                    contactForm.reset();
                    
                    // Reset button after 3 seconds
                    setTimeout(function() {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 3000);
                }, 1500);
            }
        });
    }
    
    // Add hover effects to contact cards
    var contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});
