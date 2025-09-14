// Toggle FAQ section visibility with smooth scrolling
document.getElementById('faqToggle').addEventListener('click', function() {
    this.classList.toggle('active');
    const faqContent = document.getElementById('faqContent');
    faqContent.classList.toggle('active');
    
    // If opening the FAQ, scroll to center it
    if (faqContent.classList.contains('active')) {
        setTimeout(() => {
            faqContent.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100); // Small delay to allow the content to expand
    }
});

// Close all other FAQs when one is opened and center the opened FAQ
const faqItems = document.querySelectorAll('.faq-item-advanced input[type="checkbox"]');
faqItems.forEach(item => {
    item.addEventListener('change', function() {
        if (this.checked) {
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== this) {
                    otherItem.checked = false;
                }
            });
            
            // Scroll to center the opened FAQ item
            setTimeout(() => {
                const faqItem = this.closest('.faq-item-advanced');
                if (faqItem) {
                    faqItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                    
                    // Add highlight effect
                    faqItem.style.transition = 'all 0.5s ease';
                    faqItem.style.boxShadow = '0 0 15px rgba(106, 17, 203, 0.2)';
                    faqItem.style.background = '#f8f9fa';
                    
                    // Remove highlight after 2 seconds
                    setTimeout(() => {
                        faqItem.style.boxShadow = '';
                        faqItem.style.background = '';
                    }, 2000);
                }
            }, 300); // Delay to allow the answer to expand
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    const activeFaq = document.querySelector('.faq-item-advanced input[type="checkbox"]:checked');
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (faqItems.length > 0) {
            let currentIndex = activeFaq ? Array.from(faqItems).indexOf(activeFaq) : -1;
            let nextIndex;
            
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < faqItems.length - 1 ? currentIndex + 1 : 0;
            } else { // ArrowUp
                nextIndex = currentIndex > 0 ? currentIndex - 1 : faqItems.length - 1;
            }
            
            // Close current FAQ if any is open
            if (activeFaq) {
                activeFaq.checked = false;
            }
            
            // Open the next FAQ
            faqItems[nextIndex].checked = true;
            
            // Trigger the change event manually
            faqItems[nextIndex].dispatchEvent(new Event('change'));
        }
    } else if (e.key === 'Escape' && activeFaq) {
        // Close FAQ when Escape is pressed
        activeFaq.checked = false;
    }
});

// Add touch-friendly improvements for mobile devices
if ('ontouchstart' in window) {
    // Increase touch target size for FAQ questions
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.style.minHeight = '44px'; // Minimum recommended touch target size
        question.style.paddingTop = '12px';
        question.style.paddingBottom = '12px';
    });
}

// Add intersection observer to highlight FAQ section when in viewport
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const faqObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-viewport');
        } else {
            entry.target.classList.remove('in-viewport');
        }
    });
}, observerOptions);

// Observe the FAQ container
const faqContainer = document.querySelector('.faq-container-advanced');
if (faqContainer) {
    faqObserver.observe(faqContainer);
}

// Add CSS for in-viewport highlighting
const style = document.createElement('style');
style.textContent = `
    .faq-container-advanced.in-viewport {
        box-shadow: 0 0 30px rgba(106, 17, 203, 0.15);
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }
`;
document.head.appendChild(style);