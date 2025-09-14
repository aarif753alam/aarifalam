 document.addEventListener('DOMContentLoaded', function() {
            // Header functionality
            const header0105MobileMenuBtn = document.getElementById('header0105MobileMenuBtn');
            const header0105NavLinks = document.getElementById('header0105NavLinks');
            const header0105MobileToolsBtn = document.getElementById('header0105MobileToolsBtn');
            const header0105MobileToolsMenu = document.getElementById('header0105MobileToolsMenu');
            const header0105 = document.querySelector('.header-0105');
            const header0105ScrollProgress = document.getElementById('header0105ScrollProgress');
            const dropdowns = document.querySelectorAll('.header-0105-dropdown');

            // Mobile Menu Toggle
            header0105MobileMenuBtn.addEventListener('click', function() {
                const isExpanded = header0105NavLinks.classList.toggle('header-0105-active');
                header0105MobileMenuBtn.setAttribute('aria-expanded', isExpanded);
                
                // Change icon
                const icon = header0105MobileMenuBtn.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
                
                // Close tools menu if open
                if (header0105MobileToolsMenu.classList.contains('header-0105-active')) {
                    header0105MobileToolsMenu.classList.remove('header-0105-active');
                    header0105MobileToolsBtn.setAttribute('aria-expanded', false);
                }
            });

            // Mobile Tools Toggle
            header0105MobileToolsBtn.addEventListener('click', function() {
                const isExpanded = header0105MobileToolsMenu.classList.toggle('header-0105-active');
                header0105MobileToolsBtn.setAttribute('aria-expanded', isExpanded);
                
                // Close nav menu if open
                if (header0105NavLinks.classList.contains('header-0105-active')) {
                    header0105NavLinks.classList.remove('header-0105-active');
                    header0105MobileMenuBtn.setAttribute('aria-expanded', false);
                    const menuIcon = header0105MobileMenuBtn.querySelector('i');
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            });

            // Close mobile menu when clicking a nav link
            document.querySelectorAll('.header-0105-nav-links a').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Handle dropdown toggle on mobile
                    if (window.innerWidth <= 1100) {
                        const dropdown = link.parentElement;
                        if (dropdown.classList.contains('header-0105-dropdown')) {
                            e.preventDefault();
                            dropdown.classList.toggle('active-0105');
                            return;
                        }
                    }
                    
                    if (window.innerWidth <= 1100) {
                        header0105NavLinks.classList.remove('header-0105-active');
                        header0105MobileMenuBtn.setAttribute('aria-expanded', false);
                        const menuIcon = header0105MobileMenuBtn.querySelector('i');
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                });
            });

            // Header hide/show on scroll with threshold
            let lastScroll = 0;
            const scrollThreshold = 100;
            
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;
                
                // Update scroll progress indicator
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (currentScroll / scrollHeight) * 100;
                header0105ScrollProgress.style.width = scrollPercent + '%';
                
                // Header show/hide logic
                if (currentScroll <= 0) {
                    header0105.style.transform = 'translateY(0)';
                } else if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                    header0105.style.transform = 'translateY(-100%)';
                } else if (currentScroll < lastScroll) {
                    header0105.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
            });

            // Reset menu state on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 1100) {
                    // Reset mobile menu
                    header0105NavLinks.classList.remove('header-0105-active');
                    header0105MobileMenuBtn.setAttribute('aria-expanded', false);
                    const menuIcon = header0105MobileMenuBtn.querySelector('i');
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                    
                    // Reset mobile tools menu
                    header0105MobileToolsMenu.classList.remove('header-0105-active');
                    header0105MobileToolsBtn.setAttribute('aria-expanded', false);
                    
                    // Reset dropdowns
                    dropdowns.forEach(dropdown => {
                        dropdown.classList.remove('active-0105');
                    });
                }
            });

            // Close menus when clicking outside
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 1100) {
                    // Close mobile menu if clicked outside
                    if (!e.target.closest('.header-0105-nav') && 
                        !e.target.closest('#header0105MobileMenuBtn') &&
                        header0105NavLinks.classList.contains('header-0105-active')) {
                        header0105NavLinks.classList.remove('header-0105-active');
                        header0105MobileMenuBtn.setAttribute('aria-expanded', false);
                        const menuIcon = header0105MobileMenuBtn.querySelector('i');
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                    
                    // Close mobile tools if clicked outside
                    if (!e.target.closest('#header0105MobileToolsBtn') && 
                        !e.target.closest('.header-0105-mobile-tools-menu') &&
                        header0105MobileToolsMenu.classList.contains('header-0105-active')) {
                        header0105MobileToolsMenu.classList.remove('header-0105-active');
                        header0105MobileToolsBtn.setAttribute('aria-expanded', false);
                    }
                }
            });
        });
