document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const headerSearch = document.querySelector('.header-search');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const searchResults = document.getElementById('searchResults');
  const header = document.querySelector('.main-header');
  const scrollProgress = document.getElementById('scrollProgress');

  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener('click', function() {
    const isExpanded = navLinks.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    
    // Change icon
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
    
    // Close search if open
    if (headerSearch.classList.contains('active')) {
      headerSearch.classList.remove('active');
      mobileSearchBtn.setAttribute('aria-expanded', false);
    }
  });

  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', false);
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
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
    scrollProgress.style.width = scrollPercent + '%';
    
    // Header show/hide logic
    if (currentScroll <= 0) {
      header.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
      header.style.transform = 'translateY(-100%)';
    } else if (currentScroll < lastScroll) {
      header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });

  // Mobile Search Toggle
  mobileSearchBtn.addEventListener('click', function() {
    const isExpanded = headerSearch.classList.toggle('active');
    mobileSearchBtn.setAttribute('aria-expanded', isExpanded);
    
    // Close menu if open
    if (navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', false);
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
    
    // Focus input when expanded
    if (isExpanded) {
      setTimeout(() => {
        searchInput.focus();
      }, 300);
    }
  });

  // Search data
  const searchData = [
    { 
      title: "PDF Split Tool", 
      url: "pdf-split.html", 
      description: "Split your PDF files into separate pages or custom page ranges.",
      keywords: "pdf, split, divide, pages, extract"
    },
    { 
      title: "PDF Merge Tool", 
      url: "pdf-merge.html", 
      description: "Combine multiple PDF files into one seamless document.",
      keywords: "pdf, merge, combine, join, concatenate"
    },
    { 
      title: "PDF Compress", 
      url: "pdf-compress.html", 
      description: "Reduce PDF file size without losing quality.",
      keywords: "pdf, compress, reduce size, optimize"
    },
    { 
      title: "PDF to Word Converter", 
      url: "pdf-to-word.html", 
      description: "Convert PDF documents to editable Word files.",
      keywords: "pdf, convert, word, editable, export"
    },
    { 
      title: "PDF Editor", 
      url: "pdf-editor.html", 
      description: "Edit PDF files directly in your browser with ease.",
      keywords: "pdf, edit, modify, annotate"
    },
    { 
      title: "PDF Viewer", 
      url: "pdf-viewer.html", 
      description: "View your PDF files quickly and securely online.",
      keywords: "pdf, view, read, open"
    }
  ];

  // Debounced search function
  let searchTimeout;
  function performSearch(query) {
    clearTimeout(searchTimeout);
    
    if (!query.trim()) {
      searchResults.style.display = 'none';
      searchResults.setAttribute('hidden', true);
      return;
    }
    
    searchTimeout = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results = searchData.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.keywords.toLowerCase().includes(lowerQuery)
      );
      
      displayResults(results);
    }, 300);
  }

  // Display search results
  function displayResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No results found. Try different keywords.</div>';
    } else {
      results.slice(0, 8).forEach(result => {
        const link = document.createElement('a');
        link.href = result.url;
        link.className = 'search-result-item';
        link.tabIndex = 0;
        link.innerHTML = `
          <h4>${result.title}</h4>
          <p>${result.description}</p>
          <small>${result.url}</small>
        `;
        searchResults.appendChild(link);
      });
    }
    
    searchResults.style.display = 'block';
    searchResults.removeAttribute('hidden');
  }

  // Search input and button event listeners
  searchInput.addEventListener('input', () => {
    performSearch(searchInput.value);
  });

  searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    performSearch(searchInput.value);
  });

  // Keyboard navigation for search results
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const firstResult = searchResults.querySelector('.search-result-item');
      if (firstResult) {
        window.location.href = firstResult.href;
      }
    }

    if (e.key === 'Escape') {
      searchResults.style.display = 'none';
      searchResults.setAttribute('hidden', true);
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = searchResults.querySelectorAll('.search-result-item');
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
    if (!e.target.closest('.header-search') && !e.target.closest('#mobileSearchBtn')) {
      searchResults.style.display = 'none';
      searchResults.setAttribute('hidden', true);
      
      if (window.innerWidth <= 992) {
        headerSearch.classList.remove('active');
        mobileSearchBtn.setAttribute('aria-expanded', false);
      }
    }
  });

  // Reset menu and search states on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      // Reset mobile menu
      navLinks.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', false);
      const menuIcon = mobileMenuBtn.querySelector('i');
      menuIcon.classList.remove('fa-times');
      menuIcon.classList.add('fa-bars');
      
      // Reset mobile search
      headerSearch.classList.remove('active');
      mobileSearchBtn.setAttribute('aria-expanded', false);
      searchResults.style.display = 'none';
      searchResults.setAttribute('hidden', true);
    }
  });

  // Add animation class when header comes into view
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1 });

  headerObserver.observe(header);
});