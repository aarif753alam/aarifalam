// main.js - ES5 Compatible Version

document.addEventListener('DOMContentLoaded', function() {
  // ======================
  // Mobile Menu Toggle
  // ======================
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var navLinks = document.getElementById('navLinks');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('show');
      var icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
      mobileMenuBtn.setAttribute('aria-expanded', navLinks.classList.contains('show'));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.header-container') && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ======================
  // Header & Love Banner Scroll Behavior
  // ======================
  var header = document.querySelector('.main-header');
  var loveBanner = document.querySelector('.love-banner');
  
  if (header && loveBanner) {
    var lastScroll = 0;
    var scrollThreshold = 10;
    
    window.addEventListener('scroll', function() {
      var currentScroll = window.pageYOffset;
      
      if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;
      
      if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
        // Scrolling down - hide both
        header.style.transform = 'translateY(-100%)';
        loveBanner.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up - show both
        header.style.transform = 'translateY(0)';
        loveBanner.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    });
  }

  // ======================
  // Testimonial Slider
  // ======================
  var testimonials = document.querySelectorAll('.testimonial');
  var dots = document.querySelectorAll('.slider-dot');
  var currentSlide = 0;
  var slideInterval;

  function showSlide(index) {
    if (!testimonials.length || !dots.length) return;
    
    testimonials.forEach(function(t) {
      t.classList.remove('active');
    });
    dots.forEach(function(d) {
      d.classList.remove('active');
    });
    
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function startSlider() {
    clearInterval(slideInterval);
    slideInterval = setInterval(function() {
      var nextSlide = (currentSlide + 1) % testimonials.length;
      showSlide(nextSlide);
    }, 5000);
  }

  if (testimonials.length && dots.length) {
    // Click handlers for dots
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        clearInterval(slideInterval);
        showSlide(index);
        startSlider();
      });
    });
    
    // Start the slider
    showSlide(0);
    startSlider();
  }

  // ======================
  // Back to Top Button
  // ======================
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ======================
  // Smooth Scrolling
  // ======================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      var targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navLinks && navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
          var icon = mobileMenuBtn.querySelector('i');
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  });

  // ======================
// ES5-Compatible EmailJS Form Submission
// ======================
(function() {
  emailjs.init('SMccSZnsGqNAjT-12');
})();

var form = document.getElementById('emailSignupForm');
if (form) {
  var submitBtn = form.querySelector('.btn-primary');
  
  // Create a reusable message container (hidden by default)
  var messageContainer = document.createElement('div');
  messageContainer.className = 'subscription-message';
  messageContainer.style.display = 'none';
  form.appendChild(messageContainer);
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    var emailInput = form.querySelector('input[type="email"]');
    var email = emailInput.value.trim();
    
    if (!email) return;
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    emailjs.send('service_4pjd1c3', 'template_xw7g5ib', {
      email: email,
      date: new Date().toLocaleString()
    })
    .then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
      
      // Create success message elements
      messageContainer.innerHTML = '';
      messageContainer.className = 'subscription-message success';
      
      var animationDiv = document.createElement('div');
      animationDiv.className = 'success-animation';
      
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'checkmark');
      svg.setAttribute('viewBox', '0 0 52 52');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'checkmark__circle');
      circle.setAttribute('cx', '26');
      circle.setAttribute('cy', '26');
      circle.setAttribute('r', '25');
      circle.setAttribute('fill', 'none');
      
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'checkmark__check');
      path.setAttribute('fill', 'none');
      path.setAttribute('d', 'M14.1 27.2l7.1 7.2 16.7-16.8');
      
      svg.appendChild(circle);
      svg.appendChild(path);
      animationDiv.appendChild(svg);
      
      var contentDiv = document.createElement('div');
      contentDiv.className = 'success-content';
      
      var h3 = document.createElement('h3');
      h3.textContent = 'Thank You!';
      
      var p = document.createElement('p');
      p.textContent = 'You\'ve successfully subscribed. Check your email for confirmation.';
      
      contentDiv.appendChild(h3);
      contentDiv.appendChild(p);
      animationDiv.appendChild(contentDiv);
      
      messageContainer.appendChild(animationDiv);
      messageContainer.style.display = 'block';
      
      form.reset();
    }, function(error) {
      console.log('FAILED...', error);
      
      // Create error message elements
      messageContainer.innerHTML = '';
      messageContainer.className = 'subscription-message error';
      
      var errorDiv = document.createElement('div');
      errorDiv.className = 'error-animation';
      
      var icon = document.createElement('i');
      icon.className = 'fas fa-exclamation-triangle';
      
      var contentDiv = document.createElement('div');
      contentDiv.className = 'error-content';
      
      var h3 = document.createElement('h3');
      h3.textContent = 'Oops!';
      
      var p = document.createElement('p');
      p.textContent = 'Something went wrong. Please try again later.';
      
      errorDiv.appendChild(icon);
      contentDiv.appendChild(h3);
      contentDiv.appendChild(p);
      errorDiv.appendChild(contentDiv);
      messageContainer.appendChild(errorDiv);
      messageContainer.style.display = 'block';
    })
    .finally(function() {
      submitBtn.classList.remove('loading');
      submitBtn.innerHTML = '<span class="btn-text">Join me 🩷</span><span class="btn-icon"><i class="fas fa-arrow-right"></i></span>';
      submitBtn.disabled = false;
      
      // Hide message after 5 seconds with fade effect
      setTimeout(function() {
        messageContainer.style.opacity = '0';
        setTimeout(function() {
          messageContainer.style.display = 'none';
          messageContainer.style.opacity = '1';
        }, 500);
      }, 5000);
    });
  });
}
  // ======================
  // Search Functionality
  // ======================
  var searchInput = document.getElementById('searchInput');
  var searchButton = document.getElementById('searchButton');
  var searchResults = document.getElementById('searchResults');

  if (searchInput && searchButton && searchResults) {
    var searchData = [
      { title: "Brain power", url: "truespeech.html", keywords: "brain power ,knowledge, truespeech, blog" },
      { title: "Game Zone", url: "Game/game-page.html", keywords: "Game, new game, aagame, aarif gamer, game zoon" },
      // Add all other search items here...
    ];

    function performSearch(query) {
      if (!query.trim()) {
        searchResults.style.display = 'none';
        return;
      }

      var lowerQuery = query.toLowerCase();
      var results = searchData.filter(function(item) {
        return item.title.toLowerCase().indexOf(lowerQuery) !== -1 || 
               item.keywords.toLowerCase().indexOf(lowerQuery) !== -1;
      });

      displayResults(results);
    }

    function displayResults(results) {
      searchResults.innerHTML = '';
      
      if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No results found</div>';
      } else {
        results.forEach(function(result) {
          var link = document.createElement('a');
          link.href = result.url;
          link.textContent = result.title;
          link.className = 'search-result-item';
          searchResults.appendChild(link);
        });
      }
      
      searchResults.style.display = 'block';
    }

    searchInput.addEventListener('input', function() {
      performSearch(searchInput.value);
    });
    searchButton.addEventListener('click', function() {
      performSearch(searchInput.value);
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.header-search')) {
        searchResults.style.display = 'none';
      }
    });
  }
});