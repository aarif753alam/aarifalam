document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var navLinks = document.getElementById('navLinks');
  
  mobileMenuBtn.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ?
      '<i class="fas fa-times"></i>' : 
      '<i class="fas fa-bars"></i>';
  });
  
  // Close mobile menu when clicking on a link - fixed loop issue
  var navLinksAll = document.querySelectorAll('.nav-links a');
  var closeMenuHandler = function() {
    if (window.innerWidth <= 992) {
      navLinks.classList.remove('active');
      mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  };
  
  for (var i = 0; i < navLinksAll.length; i++) {
    navLinksAll[i].addEventListener('click', closeMenuHandler);
  }
  
  // Header hide/show on scroll
  var header = document.querySelector('.main-header');
  var lastScroll = 0;
  
  window.addEventListener('scroll', function() {
    var currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      header.style.transform = 'translateY(0)';
    }
    
    if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
      header.style.transform = 'translateY(-100%)';
    } else if (currentScroll < lastScroll) {
      header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
  
  // Enhanced Search Functionality
  var searchInput = document.getElementById('searchInput');
  var searchButton = document.getElementById('searchButton');
  var searchResults = document.getElementById('searchResults');
  var mobileSearchBtn = document.getElementById('mobileSearchBtn');
  var headerSearch = document.querySelector('.header-search');
  
// Updated search data including all PDF tools, games, blog, and contact
var searchData = [
  // Blog & Contact
  { 
    title: "Blog", 
    url: "/blog/index.html", 
    description: "Discover the latest blogs and articles on Aarif Alam's platform",
    keywords: "blog, articles, writing, insights" 
  },
  { 
    title: "Contact Us", 
    url: "/footer/contact-us/contact.html", 
    description: "Get in touch with Aarif Alam",
    keywords: "contact, email, message, reach out" 
  },
  { 
    title: "Feedback", 
    url: "/footer/contact-us/feedback.html", 
    description: "Share your feedback with Aarif Alam",
    keywords: "feedback, comment, suggestions" 
  },

  // Game Tools
  { 
    title: "Game Zone", 
    url: "/Game/index.html", 
    description: "Fun games and interactive experiences",
    keywords: "games, play, fun, entertainment" 
  },
  { 
    title: "Word Meaning Game", 
    url: "/Game/word-meaning-page.html", 
    description: "Enhance your vocabulary with interactive word games",
    keywords: "vocabulary, words, game, learning" 
  },
  { 
    title: "ABCD Brain Game", 
    url: "/Game/abcd-brain-game.html", 
    description: "Solve fun ABCD puzzles and give your brain a little workout",
    keywords: "abcd, brain, puzzle, educational" 
  },
  { 
    title: "Heart-touching Game", 
    url: "/Game/Heart-Touch-game.html", 
    description: "Move the ball to touch all hearts without touching enemies",
    keywords: "heart, touching, fun, game" 
  },
  { 
    title: "1–25 Numbers Game", 
    url: "/Game/numbergame.html", 
    description: "Play with two players to complete numbers from 1 to 25",
    keywords: "numbers, game, math, multiplayer" 
  },

  // Image & Greeting Tools
  { 
    title: "Image to URL", 
    url: "/tools/image-to-url.html", 
    description: "Convert your images into shareable URLs",
    keywords: "image, url, convert, share" 
  },
  { 
    title: "Greeting Card", 
    url: "/tools/greeting-card.html", 
    description: "Create beautiful digital greeting cards",
    keywords: "cards, greetings, messages, digital" 
  },

  // PDF Tools - High Priority
  { 
    title: "Image to PDF", 
    url: "/pdf/image-to-pdf", 
    description: "Convert JPG/PNG images into PDF",
    keywords: "image, pdf, convert, jpg, png" 
  },
  { 
    title: "PDF to PNG/JPG", 
    url: "/pdf/pdf-to-image", 
    description: "Convert PDF to high-quality PNG or JPG",
    keywords: "pdf, png, jpg, convert" 
  },
  { 
    title: "Merge PDF", 
    url: "/pdf/merge-pdf", 
    description: "Combine multiple PDFs into one document",
    keywords: "pdf, merge, combine, document" 
  },
  { 
    title: "Split PDF", 
    url: "/pdf/split-pdf", 
    description: "Divide PDF into multiple files",
    keywords: "pdf, split, divide, pages" 
  },
  { 
    title: "Remove PDF Pages", 
    url: "/pdf/remove-pdf-page", 
    description: "Delete unwanted pages from PDF",
    keywords: "pdf, remove, delete, pages" 
  },

  // PDF Tools - Medium Priority
  { 
    title: "PDF Reorder Pages", 
    url: "/pdf/pdf-reorder", 
    description: "Rearrange PDF pages",
    keywords: "pdf, reorder, pages, arrange" 
  },
  { 
    title: "Text to PDF", 
    url: "/pdf/text-to-pdf", 
    description: "Transform text files into PDF documents",
    keywords: "text, pdf, convert, document" 
  },
  { 
    title: "PDF Image Watermark", 
    url: "/pdf/pdf-image-watermark", 
    description: "Add image watermarks to PDF",
    keywords: "pdf, watermark, image, protection" 
  },
  { 
    title: "PDF Text Watermark", 
    url: "/pdf/pdf-text-watermark", 
    description: "Add text watermarks to PDF",
    keywords: "pdf, watermark, text, protection" 
  }
];

  // Mobile search toggle
  mobileSearchBtn.addEventListener('click', function() {
    headerSearch.classList.toggle('active');
    if (headerSearch.classList.contains('active')) {
      searchInput.focus();
    }
  });
  
  // Function to perform search with debounce
  var searchTimeout;
  function performSearch(query) {
    clearTimeout(searchTimeout);
    
    if (!query.trim()) {
      searchResults.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(function() {
      var lowerQuery = query.toLowerCase();
      var results = searchData.filter(function(item) {
        return item.title.toLowerCase().indexOf(lowerQuery) !== -1 || 
               item.description.toLowerCase().indexOf(lowerQuery) !== -1 ||
               item.keywords.toLowerCase().indexOf(lowerQuery) !== -1;
      });
      
      displayResults(results);
    }, 300);
  }
  
  // Function to display results
  function displayResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No results found. Try different keywords.</div>';
    } else {
      for (var j = 0; j < results.length; j++) {
        var result = results[j];
        var link = document.createElement('a');
        link.href = result.url;
        link.className = 'search-result-item';
        link.innerHTML = 
          '<h4>' + result.title + '</h4>' +
          '<p>' + result.description + '</p>' +
          '<small>' + result.url + '</small>';
        searchResults.appendChild(link);
      }
    }
    
    searchResults.style.display = 'block';
  }
  
  // Event listeners
  searchInput.addEventListener('input', function() {
    performSearch(searchInput.value);
  });
  
  searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    performSearch(searchInput.value);
  });
  
  // Keyboard navigation
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var results = Array.prototype.slice.call(searchResults.querySelectorAll('.search-result-item'));
      if (results.length > 0) {
        window.location.href = results[0].href;
      }
    }
    
    if (e.key === 'Escape') {
      searchResults.style.display = 'none';
    }
    
    // Arrow key navigation through results
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var items = searchResults.querySelectorAll('.search-result-item');
      if (items.length === 0) return;
      
      var currentIndex = -1;
      for (var k = 0; k < items.length; k++) {
        if (items[k] === document.activeElement) {
          currentIndex = k;
          break;
        }
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        } else {
          items[0].focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        } else {
          items[items.length - 1].focus();
        }
      }
    }
  });
  
  // Close results when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.header-search') && !e.target.closest('#mobileSearchBtn')) {
      searchResults.style.display = 'none';
      if (window.innerWidth <= 992) {
        headerSearch.classList.remove('active');
      }
    }
  });

});
