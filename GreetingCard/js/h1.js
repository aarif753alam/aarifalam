// === Mobile Menu Toggle ===
var mobileMenuBtn = document.getElementById('mobileMenuBtn');
var navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', function() {
  navLinks.classList.toggle('active');
  mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ?
    '<i class="fas fa-times"></i>' :
    '<i class="fas fa-bars"></i>';
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.classList.remove('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// === Hide Header on Scroll Down, Show on Scroll Up ===
var lastScrollTop = 0;
var header = document.querySelector('.main-header');

window.addEventListener('scroll', function() {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down
    header.style.top = "-100px";
  } else {
    // Scrolling up
    header.style.top = "0";
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Prevent negative values
});