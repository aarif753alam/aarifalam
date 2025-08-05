        document.addEventListener('DOMContentLoaded', function() {
            // Header functionality
            const pdfMobileMenuBtn = document.getElementById('pdfMobileMenuBtn');
            const pdfNavLinks = document.getElementById('pdfNavLinks');
            const pdfMobileSearchBtn = document.getElementById('pdfMobileSearchBtn');
            const pdfHeaderSearch = document.querySelector('.pdf-header-search');
            const pdfSearchInput = document.getElementById('pdfSearchInput');
            const pdfSearchButton = document.getElementById('pdfSearchButton');
            const pdfSearchResults = document.getElementById('pdfSearchResults');
            const pdfHeader = document.querySelector('.pdf-header');
            const pdfScrollProgress = document.getElementById('pdfScrollProgress');

            // Mobile Menu Toggle
            pdfMobileMenuBtn.addEventListener('click', function() {
                const isExpanded = pdfNavLinks.classList.toggle('pdf-active');
                pdfMobileMenuBtn.setAttribute('aria-expanded', isExpanded);
                
                // Change icon
                const icon = pdfMobileMenuBtn.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
                
                // Close search if open
                if (pdfHeaderSearch.classList.contains('pdf-active')) {
                    pdfHeaderSearch.classList.remove('pdf-active');
                    pdfMobileSearchBtn.setAttribute('aria-expanded', false);
                }
            });

            // Close mobile menu when clicking a nav link
            document.querySelectorAll('.pdf-nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 992) {
                        pdfNavLinks.classList.remove('pdf-active');
                        pdfMobileMenuBtn.setAttribute('aria-expanded', false);
                        const menuIcon = pdfMobileMenuBtn.querySelector('i');
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
                pdfScrollProgress.style.width = scrollPercent + '%';
                
                // Header show/hide logic
                if (currentScroll <= 0) {
                    pdfHeader.style.transform = 'translateY(0)';
                } else if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                    pdfHeader.style.transform = 'translateY(-100%)';
                } else if (currentScroll < lastScroll) {
                    pdfHeader.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
            });

            // Mobile Search Toggle
            pdfMobileSearchBtn.addEventListener('click', function() {
                const isExpanded = pdfHeaderSearch.classList.toggle('pdf-active');
                pdfMobileSearchBtn.setAttribute('aria-expanded', isExpanded);
                
                // Close menu if open
                if (pdfNavLinks.classList.contains('pdf-active')) {
                    pdfNavLinks.classList.remove('pdf-active');
                    pdfMobileMenuBtn.setAttribute('aria-expanded', false);
                    const menuIcon = pdfMobileMenuBtn.querySelector('i');
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
                
                // Focus input when expanded
                if (isExpanded) {
                    setTimeout(() => {
                        pdfSearchInput.focus();
                    }, 300);
                }
            });

            // Search data
            const pdfSearchData = [
                { 
                    title: "PDF Split Tool", 
                    url: "/pdf/split-pdf", 
                    description: "Split your PDF files into separate pages or custom page ranges.",
                    keywords: "pdf, split, divide, pages, extract"
                },
                { 
                    title: "PDF Merge Tool", 
                    url: "/pdf/merge-pdf", 
                    description: "Combine multiple PDF files into one seamless document.",
                    keywords: "pdf, merge, combine, join, concatenate"
                },
                { 
                    title: "Image to pdf", 
                    url: "/pdf/jpg-to-pdf", 
                    description: "Free image to PDF converter.",
                    keywords: "pdf, image, pdf to image , jpg"
                },
                { 
                    title: "PDF to image", 
                    url: "/pdf/pdf-to-image", 
                    description: "Convert PDF documents to image",
                    keywords: "pdf, convert, pdf to image, image, export"
                },
                { 
                    title: "Image to Url", 
                    url: "/pdf/image-to-url", 
                    description: "Convert your image into url.",
                    keywords: "url, image, image to url, link"
                }
            ];

            // Debounced search function
            let pdfSearchTimeout;
            function performPdfSearch(query) {
                clearTimeout(pdfSearchTimeout);
                
                if (!query.trim()) {
                    pdfSearchResults.style.display = 'none';
                    pdfSearchResults.setAttribute('hidden', true);
                    return;
                }
                
                pdfSearchTimeout = setTimeout(() => {
                    const lowerQuery = query.toLowerCase();
                    const results = pdfSearchData.filter(item =>
                        item.title.toLowerCase().includes(lowerQuery) ||
                        item.description.toLowerCase().includes(lowerQuery) ||
                        item.keywords.toLowerCase().includes(lowerQuery)
                    );
                    
                    displayPdfResults(results);
                }, 300);
            }

            // Display search results
            function displayPdfResults(results) {
                pdfSearchResults.innerHTML = '';
                
                if (results.length === 0) {
                    pdfSearchResults.innerHTML = '<div class="pdf-no-results">No results found. Try different keywords.</div>';
                } else {
                    results.slice(0, 8).forEach(result => {
                        const link = document.createElement('a');
                        link.href = result.url;
                        link.className = 'pdf-search-result-item';
                        link.tabIndex = 0;
                        link.innerHTML = `
                            <h4>${result.title}</h4>
                            <p>${result.description}</p>
                            <small>${result.url}</small>
                        `;
                        pdfSearchResults.appendChild(link);
                    });
                }
                
                pdfSearchResults.style.display = 'block';
                pdfSearchResults.removeAttribute('hidden');
            }

            // Search input and button event listeners
            pdfSearchInput.addEventListener('input', () => {
                performPdfSearch(pdfSearchInput.value);
            });

            pdfSearchButton.addEventListener('click', (e) => {
                e.preventDefault();
                performPdfSearch(pdfSearchInput.value);
            });

            // Keyboard navigation for search results
            pdfSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const firstResult = pdfSearchResults.querySelector('.pdf-search-result-item');
                    if (firstResult) {
                        window.location.href = firstResult.href;
                    }
                }

                if (e.key === 'Escape') {
                    pdfSearchResults.style.display = 'none';
                    pdfSearchResults.setAttribute('hidden', true);
                }

                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    const items = pdfSearchResults.querySelectorAll('.pdf-search-result-item');
                    if (items.length === 0) return;

                    let currentIndex = -1;
                    items.forEach((item, i) => {
                        if (item === document.activeElement) {
                            currentIndex = i;
                        }
                    });

                    e.preventDefault();
                    if (e.key === 'ArrowDown') {
                        const nextIndex = (currentIndex + 1) % items.length;
                        items[nextIndex].focus();
                    } else if (e.key === 'ArrowUp') {
                        const prevIndex = (currentIndex - 1 + items.length) % items.length;
                        items[prevIndex].focus();
                    }
                }
            });

            // Close search results and mobile search on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.pdf-header-search') && !e.target.closest('#pdfMobileSearchBtn')) {
                    pdfSearchResults.style.display = 'none';
                    pdfSearchResults.setAttribute('hidden', true);
                    
                    if (window.innerWidth <= 992) {
                        pdfHeaderSearch.classList.remove('pdf-active');
                        pdfMobileSearchBtn.setAttribute('aria-expanded', false);
                    }
                }
            });

            // Reset menu and search states on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 992) {
                    // Reset mobile menu
                    pdfNavLinks.classList.remove('pdf-active');
                    pdfMobileMenuBtn.setAttribute('aria-expanded', false);
                    const menuIcon = pdfMobileMenuBtn.querySelector('i');
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                    
                    // Reset mobile search
                    pdfHeaderSearch.classList.remove('pdf-active');
                    pdfMobileSearchBtn.setAttribute('aria-expanded', false);
                    pdfSearchResults.style.display = 'none';
                    pdfSearchResults.setAttribute('hidden', true);
                }
            });
        });