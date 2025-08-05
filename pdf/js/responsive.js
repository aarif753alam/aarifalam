/**
 * PDF Nexus Pro - Responsive Enhancements
 * Handles device-specific behaviors and optimizations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Detect device type and orientation
    const deviceType = detectDeviceType();
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    
    // Apply device-specific classes
    document.body.classList.add(deviceType);
    document.body.classList.add(isPortrait ? 'portrait' : 'landscape');
    
    // Setup responsive behaviors
    setupResponsiveCards();
    setupOrientationChange();
    setupPerformanceOptimizations();
    
    // Handle viewport units on mobile
    fixViewportUnits();
    
    // Touch device optimizations
    if ('ontouchstart' in window) {
        setupTouchOptimizations();
    }
    
    // Safari/iOS specific fixes
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        setupIOSOptimizations();
    }
    
    // Mac specific enhancements
    if (navigator.userAgent.match(/Macintosh/i)) {
        setupMacOptimizations();
    }
});

// Device detection
function detectDeviceType() {
    const ua = navigator.userAgent;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// Responsive card behaviors
function setupResponsiveCards() {
    const cards = document.querySelectorAll('.tool-card');
    const grid = document.getElementById('toolsContainer');
    
    // Adjust card sizes based on container width
    function adjustCards() {
        const containerWidth = grid.offsetWidth;
        const cardCount = cards.length;
        
        // For very small screens
        if (containerWidth < 400) {
            cards.forEach(card => {
                card.style.minHeight = '90px';
            });
        }
    }
    
    // Initial adjustment
    adjustCards();
    
    // Adjust on resize
    window.addEventListener('resize', debounce(adjustCards, 100));
    
    // Click handlers with responsive feedback
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const toolId = this.dataset.tool;
            
            // Visual feedback based on device
            if (window.innerWidth < 768) {
                this.style.transform = 'scale(0.95)';
            } else {
                this.style.transform = 'translateY(-5px) scale(1.03)';
            }
            
            setTimeout(() => {
                this.style.transform = '';
                alert(`Opening ${toolId.replace(/-/g, ' ')} tool...\n\nIn a real application, this would load the specific tool interface.`);
            }, 200);
        });
    });
}

// Handle orientation changes
function setupOrientationChange() {
    function handleOrientationChange() {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        
        document.body.classList.remove('portrait', 'landscape');
        document.body.classList.add(isPortrait ? 'portrait' : 'landscape');
        
        // Adjust layout for orientation
        if (isPortrait) {
            // Portrait-specific adjustments
        } else {
            // Landscape-specific adjustments
        }
    }
    
    // Initial check
    handleOrientationChange();
    
    // Add listener
    window.addEventListener('orientationchange', debounce(handleOrientationChange, 100));
}

// Performance optimizations
function setupPerformanceOptimizations() {
    // Use passive event listeners where appropriate
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });
    
    // Optimize animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.tool-card').forEach(card => {
            observer.observe(card);
        });
    }
}

// Fix viewport units on mobile
function fixViewportUnits() {
    function setViewportProperty() {
        let vh = window.innerHeight * 0.01;
        let vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--vw', `${vw}px`);
    }
    
    setViewportProperty();
    window.addEventListener('resize', debounce(setViewportProperty, 100));
}

// Touch device optimizations
function setupTouchOptimizations() {
    const cards = document.querySelectorAll('.tool-card');
    
    cards.forEach(card => {
        // Prevent double-tap zoom
        card.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Better hover states for touch
        card.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        card.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

// iOS specific optimizations
function setupIOSOptimizations() {
    // Fix for iOS viewport height
    document.documentElement.style.setProperty('--full-height', `${window.innerHeight}px`);
    
    // Prevent elastic scrolling
    document.body.addEventListener('touchmove', function(e) {
        if (this.scrollTop === 0) {
            this.scrollTop = 1;
        } else if (this.scrollHeight === this.scrollTop + this.offsetHeight) {
            this.scrollTop -= 1;
        }
    }, { passive: false });
    
    // Fix for :active state on iOS
    document.body.addEventListener('touchstart', function() {}, { passive: true });
}

// Mac specific enhancements
function setupMacOptimizations() {
    // Smooth scrolling for Mac trackpads
    if ('scrollBehavior' in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Enhance hover states for trackpad users
    const cards = document.querySelectorAll('.tool-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('mac-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('mac-hover');
        });
    });
    
    // Better font rendering
    document.body.style.fontSmoothing = 'antialiased';
}

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}