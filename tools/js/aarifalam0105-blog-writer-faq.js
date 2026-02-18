// ============================================
// FAQ SECTION - BLOG WRITER STUDIO
// Complete functionality for FAQ accordion
// ============================================

(function() {
    // Initialize FAQ when DOM is ready
    function initFaq() {
        const faqToggle = document.getElementById('faqToggleBlog');
        const faqContent = document.getElementById('faqContentBlog');
        const faqItems = document.querySelectorAll('#faqContentBlog .faq-item-advanced input[type="checkbox"]');

        if (!faqToggle || !faqContent) return;

        // Toggle FAQ section visibility
        faqToggle.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            faqContent.classList.toggle('active');
            
            // Smooth scroll when opening
            if (faqContent.classList.contains('active')) {
                setTimeout(() => {
                    faqContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
                
                // Track event (optional)
                console.log('FAQ section opened');
            }
        });

        // FAQ items accordion logic (only one open at a time)
        faqItems.forEach(item => {
            item.addEventListener('change', function(e) {
                if (this.checked) {
                    // Close all other FAQs
                    faqItems.forEach(otherItem => {
                        if (otherItem !== this) {
                            otherItem.checked = false;
                        }
                    });
                    
                    // Get the FAQ item container
                    const faqItem = this.closest('.faq-item-advanced');
                    
                    // Smooth scroll to opened FAQ
                    setTimeout(() => {
                        if (faqItem) {
                            faqItem.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                                inline: 'nearest'
                            });
                            
                            // Add highlight effect
                            faqItem.style.transition = 'all 0.3s ease';
                            faqItem.style.backgroundColor = '#f0f9ff';
                            faqItem.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                            
                            // Remove highlight after 1.5 seconds
                            setTimeout(() => {
                                faqItem.style.backgroundColor = '';
                                faqItem.style.boxShadow = '';
                            }, 1500);
                        }
                    }, 300);
                    
                    // Track opened FAQ
                    const question = this.nextElementSibling?.textContent?.trim() || 'FAQ opened';
                    console.log('FAQ opened:', question.substring(0, 50));
                }
            });
        });

        // Keyboard navigation support
        document.addEventListener('keydown', function(e) {
            // Only if FAQ section is active
            if (!faqContent.classList.contains('active')) return;
            
            const activeFaq = document.querySelector('#faqContentBlog .faq-item-advanced input[type="checkbox"]:checked');
            
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
                    
                    // Close current
                    if (activeFaq) {
                        activeFaq.checked = false;
                    }
                    
                    // Open next
                    faqItems[nextIndex].checked = true;
                    
                    // Trigger change event
                    const event = new Event('change');
                    faqItems[nextIndex].dispatchEvent(event);
                }
            } else if (e.key === 'Escape' && activeFaq) {
                // Close with Escape key
                activeFaq.checked = false;
            } else if (e.key === 'Home' && faqItems.length > 0) {
                // Go to first FAQ
                e.preventDefault();
                if (activeFaq) activeFaq.checked = false;
                faqItems[0].checked = true;
                faqItems[0].dispatchEvent(new Event('change'));
            } else if (e.key === 'End' && faqItems.length > 0) {
                // Go to last FAQ
                e.preventDefault();
                if (activeFaq) activeFaq.checked = false;
                faqItems[faqItems.length - 1].checked = true;
                faqItems[faqItems.length - 1].dispatchEvent(new Event('change'));
            }
        });

        // Touch device optimizations
        if ('ontouchstart' in window) {
            const questions = document.querySelectorAll('#faqContentBlog .faq-question');
            questions.forEach(question => {
                question.style.minHeight = '48px';
                question.style.paddingTop = '14px';
                question.style.paddingBottom = '14px';
            });
        }

        // Intersection Observer for viewport detection
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        const faqObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-viewport');
                    
                    // Optional: track FAQ view
                    console.log('FAQ section in viewport');
                    
                    // Remove class after animation
                    setTimeout(() => {
                        entry.target.classList.remove('in-viewport');
                    }, 1000);
                }
            });
        }, observerOptions);

        // Observe FAQ container
        const faqContainer = document.querySelector('.faq-container-advanced');
        if (faqContainer) {
            faqObserver.observe(faqContainer);
        }

        // Handle window resize (adjust max-height for responsive)
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (faqContent.classList.contains('active')) {
                    // Refresh to ensure proper height on resize
                    faqContent.style.maxHeight = 'none';
                    setTimeout(() => {
                        faqContent.style.maxHeight = '2500px';
                    }, 10);
                }
            }, 250);
        });

        // Add click outside to close (optional)
        document.addEventListener('click', function(e) {
            const isClickInside = e.target.closest('.faq-container-advanced');
            const isToggle = e.target.closest('.faq-toggle-btn');
            
            // If click is outside and FAQ is open, close it? 
            // (Commented out by default - uncomment if you want this behavior)
            /*
            if (!isClickInside && faqContent.classList.contains('active') && !isToggle) {
                faqToggle.classList.remove('active');
                faqContent.classList.remove('active');
            }
            */
        });

        // Initialize with first FAQ maybe? (optional)
        // Uncomment to open first FAQ by default
        /*
        setTimeout(() => {
            if (faqItems.length > 0) {
                faqItems[0].checked = true;
            }
        }, 500);
        */
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFaq);
    } else {
        initFaq(); // DOM already loaded
    }

})();