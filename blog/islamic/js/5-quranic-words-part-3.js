// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Section animation on scroll with enhanced effects
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add sequential animation delay for multiple elements
                if (entry.target.classList.contains('concept-section')) {
                    const conceptIcon = entry.target.querySelector('.concept-icon');
                    const conceptContent = entry.target.querySelector('.concept-content');
                    
                    if (conceptIcon) {
                        conceptIcon.style.animation = 'iconPop 0.2s ease-out forwards';
                    }
                    if (conceptContent) {
                        conceptContent.style.animation = 'fadeInUp 0.3s ease-out forwards';
                    }
                }
                
                // Update floating navigation
                const sectionId = entry.target.id;
                const navDots = document.querySelectorAll('.nav-dot');
                navDots.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('data-section') === sectionId) {
                        dot.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Observe all concept sections and conclusion
    document.querySelectorAll('.concept-section, .intro-section, .conclusion').forEach(section => {
        observer.observe(section);
    });

    // Floating navigation click handler with enhanced feedback
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                // Add click animation to dot
                this.style.transform = 'scale(1.6)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.4)';
                }, 200);
                
                window.scrollTo({
                    top: targetSection.offsetTop - 30,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced scroll handling with throttle for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function() {
                const sections = document.querySelectorAll('.concept-section, .intro-section, .conclusion');
                const navDots = document.querySelectorAll('.nav-dot');
                const scrollPosition = window.scrollY + 100;
                
                let currentSection = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentSection = section.getAttribute('id');
                    }
                });
                
                navDots.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('data-section') === currentSection) {
                        dot.classList.add('active');
                    }
                });
                
                scrollTimeout = null;
            }, 50);
        }
    });

    // Enhanced hover effects with color transitions
    document.querySelectorAll('.concept-section').forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(10, 92, 54, 0.2)';
            
            // Add subtle background color shift
            const borderColor = window.getComputedStyle(this).borderTopColor;
            this.style.background = `linear-gradient(135deg, #ffffff 0%, ${borderColor}15 100%)`;
        });
        
        section.addEventListener('mouseleave', function() {
            if (this.classList.contains('visible')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.background = 'linear-gradient(135deg, #ffffff 0%, #fafffa 100%)';
                this.style.boxShadow = '0 12px 35px rgba(10, 92, 54, 0.1)';
            } else {
                this.style.transform = 'translateY(30px)';
            }
        });
    });

    // Add click effects to CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Button press animation
            this.style.transform = 'translateY(-2px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-5px) scale(1)';
            }, 150);
        });
    }

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--islamic-green), var(--gold));
        width: 0%;
        z-index: 1000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const navDots = document.querySelectorAll('.nav-dot');
        const activeDot = document.querySelector('.nav-dot.active');
        let currentIndex = Array.from(navDots).indexOf(activeDot);
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % navDots.length;
            navDots[nextIndex].click();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + navDots.length) % navDots.length;
            navDots[prevIndex].click();
        }
    });

    // Add loading animation for images (if any)
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Enhanced conclusion grid animations
    const conclusionItems = document.querySelectorAll('.conclusion-item');
    conclusionItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        const conclusionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `fadeInUp 0.6s ease-out ${entry.target.style.animationDelay} forwards`;
                }
            });
        }, { threshold: 0.3 });
        
        conclusionObserver.observe(item);
    });
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes iconPop {
        0% {
            transform: scale(0.5) rotate(-10deg);
            opacity: 0;
        }
        70% {
            transform: scale(1.1) rotate(5deg);
        }
        100% {
            transform: scale(1) rotate(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeInUp {
        0% {
            opacity: 0;
            transform: translateY(30px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .concept-icon {
        opacity: 0;
    }
    
    .concept-content {
        opacity: 0;
    }
    
    .conclusion-item {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScroll = (target, duration = 1000) => {
        const targetPosition = target.offsetTop - 30;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    };

    // Replace native smooth scroll with polyfill
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) smoothScroll(targetSection);
        });
    });
}