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
  
  // Sample search data - replace with your actual content
  var searchData = [
    { 
      title: "The Power of True Speech", 
      url: "blogs.html", 
      description: "Discover the transformative power of true speech and authentic communication",
      keywords: "honesty, integrity, communication, truth" 
    },
    { 
      title: "Contact Us", 
      url: "../footer/contact-us/contact.html", 
      description: "Get in touch with Aarif Alam",
      keywords: "contact, email, message, reach out" 
    },
    { 
      title: "Game Zone", 
      url: "../Game/game-page.html", 
      description: "Fun games and interactive experiences",
      keywords: "games, play, fun, entertainment" 
    },
    { 
      title: "Greeting Cards", 
      url: "../GreetingCard/greeting-card.html", 
      description: "Create beautiful digital greeting cards",
      keywords: "cards, greetings, messages, digital" 
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