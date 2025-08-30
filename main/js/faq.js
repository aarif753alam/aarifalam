 // Toggle FAQ section visibility
        document.getElementById('faqToggle').addEventListener('click', function() {
            this.classList.toggle('active');
            document.getElementById('faqContent').classList.toggle('active');
        });
        
        const faqItems = document.querySelectorAll('.faq-item-advanced input[type="checkbox"]');
        faqItems.forEach(item => {
            item.addEventListener('change', function() {
                if (this.checked) {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== this) {
                            otherItem.checked = false;
                        }
                    });
                }
            });
        });
