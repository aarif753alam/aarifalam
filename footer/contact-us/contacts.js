// contacts.js - Optimized for Cloudflare static hosting
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var navLinks = document.getElementById('navLinks');
    
    function updateMenuIcon() {
        mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }
    
    function closeMobileMenu() {
        navLinks.classList.remove('active');
        updateMenuIcon();
    }
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            updateMenuIcon();
        });
        
        // Close mobile menu when clicking a link
        var navLinksItems = document.querySelectorAll('.nav-links a');
        navLinksItems.forEach(function(link) {
            link.addEventListener('click', closeMobileMenu);
        });
    }
    
    // Smooth scrolling for anchor links
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                var headerHeight = document.querySelector('.main-header') ? document.querySelector('.main-header').offsetHeight : 0;
                
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
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