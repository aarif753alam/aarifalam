// main.js - Completely Header-Free Version
document.addEventListener('DOMContentLoaded', function() {
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
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        clearInterval(slideInterval);
        showSlide(index);
        startSlider();
      });
    });
    
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
      }
    });
  });

// ======================
// EmailJS Form Submission - Single Template
// ======================
document.addEventListener('DOMContentLoaded', function() {

  emailjs.init('24sxryXs3Nz3gt--f'); // Your EmailJS Public Key

  var form = document.getElementById('emailSignupForm');
  if (!form) return;

  var submitBtn = form.querySelector('.btn-primary');
  var messageContainer = document.createElement('div');
  messageContainer.className = 'subscription-message';
  messageContainer.style.display = 'none';
  form.appendChild(messageContainer);

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var emailInput = form.querySelector('input[type="email"]');
    var email = emailInput.value.trim();
    if (!email) return;

    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Send using single template (template_1ivgleo)
    emailjs.send('service_ro4kggr', 'template_1ivgleo', {
      user_email: email,                   // Subscriber email
      from_name: "Aarif Alam Life",        // Sender name visible
      from_email: "aarifalam0105@gmail.com",
      subject: "Welcome to Aarif Alam Life!",
      message: `Hello!

Thank you for subscribing to Aarif Alam Life! 🎉
Welcome to our website – https://aarifalam.life
You need anything, don’t hesitate to reach out.`
    })
    .then(function(response) {
      // Show success message
      messageContainer.className = 'subscription-message success';
      messageContainer.innerHTML = `
        <div class="success-animation">
          <svg class="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
          <div class="success-content">
            <h3>Thank You!</h3>
            <p>You've successfully subscribed. Check your email for confirmation.</p>
          </div>
        </div>
      `;
      messageContainer.style.display = 'block';
      form.reset();
    }, function(error) {
      // Show error message
      messageContainer.className = 'subscription-message error';
      messageContainer.innerHTML = `
        <div class="error-animation">
          <i class="fas fa-exclamation-triangle"></i>
          <div class="error-content">
            <h3>Oops!</h3>
            <p>Something went wrong. Please try again later.</p>
          </div>
        </div>
      `;
      messageContainer.style.display = 'block';
      console.error("EmailJS Error:", error);
    })
    .finally(function() {
      // Restore button
      submitBtn.classList.remove('loading');
      submitBtn.innerHTML = '<span class="btn-text"> Join me 🩷</span><span class="btn-icon"><i class="fas fa-arrow-right"></i></span>';
      submitBtn.disabled = false;

      // Hide message after 5 seconds
      setTimeout(function() {
        messageContainer.style.opacity = '0';
        setTimeout(function() {
          messageContainer.style.display = 'none';
          messageContainer.style.opacity = '1';
        }, 500);
      }, 5000);
    });

  });

});

