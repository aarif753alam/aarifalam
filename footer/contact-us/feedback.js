document.addEventListener('DOMContentLoaded', function() {
      // Initialize EmailJS with your User ID
      emailjs.init('fpmZg527D1_2Xy8QW');
      
      var cosmicBg = document.getElementById('cosmic-bg');
      if (!cosmicBg) return;

      // Function to create a single star
      function createStar(index) {
        var star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.opacity = Math.random();
        return star;
      }

      // Function to create rockets
      function createRocket() {
        var rocket = document.createElement('div');
        rocket.className = 'rocket';
        rocket.textContent = '🚀';
        rocket.style.left = Math.random() * 100 + '%';
        rocket.style.top = Math.random() * 100 + '%';
        rocket.style.animation = 'flyRocket ' + (8 + (Math.random() * 10)) + 's linear infinite';
        rocket.innerHTML += '<div class="rocket-fire"></div>';
        return rocket;
      }

      // Function to create aliens
      function createAlien() {
        var alien = document.createElement('div');
        alien.className = 'alien';
        alien.textContent = '👽';
        alien.style.left = Math.random() * 100 + '%';
        alien.style.top = Math.random() * 100 + '%';
        alien.style.animation = 'floatAlien ' + (10 + (Math.random() * 10)) + 's ease-in-out infinite';
        alien.style.fontSize = (30 + (Math.random() * 20)) + 'px';
        return alien;
      }

      // Function to create celebration stars
      function createCelebrationStar() {
        var star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDuration = (1 + (Math.random() * 2)) + 's';
        star.style.opacity = 1;
        cosmicBg.appendChild(star);
        
        setTimeout(function() {
          if (star.parentNode) {
            star.parentNode.removeChild(star);
          }
        }, 2000);
      }

      // Create cosmic elements
      function createCosmicElements() {
        cosmicBg.innerHTML = '';

        // Create shooting stars
        for (var i = 0; i < 5; i++) {
          cosmicBg.appendChild(createStar(i));
        }

        // Create rockets
        cosmicBg.appendChild(createRocket());

        // Create aliens
        for (var j = 0; j < 2; j++) {
          cosmicBg.appendChild(createAlien());
        }
      }

      // Create fireballs with cleanup
      function createFireballs() {
        var fireballInterval = setInterval(function() {
          if (document.hidden) return;
          
          var fireball = document.createElement('div');
          fireball.className = 'fireball';
          fireball.textContent = '☄️';
          fireball.style.left = Math.random() * 100 + '%';
          fireball.style.top = '-50px';
          fireball.style.setProperty('--direction', Math.random() > 0.5 ? 1 : -1);
          fireball.style.fontSize = (20 + (Math.random() * 30)) + 'px';
          fireball.style.animation = 'fallFireball ' + (2 + (Math.random() * 3)) + 's linear forwards';
          cosmicBg.appendChild(fireball);

          setTimeout(function() {
            if (fireball.parentNode) {
              fireball.parentNode.removeChild(fireball);
            }
          }, 5000);
        }, 2000);

        return fireballInterval;
      }

      // Initialize cosmic elements
      createCosmicElements();
      var fireballInterval = createFireballs();

      // Handle form submission with EmailJS
      var feedbackForm = document.getElementById('feedback-form');
      if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          var submitBtn = this.querySelector('button[type="submit"]');
          if (!submitBtn) return;
          
          var originalText = submitBtn.innerHTML;
          
          // Show loading state
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
          submitBtn.disabled = true;
          
          // Send email using EmailJS
          emailjs.sendForm('service_cnq8rxo', 'template_ls6mt0l', this)
            .then(function() {
              submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
              feedbackForm.reset();
              
              // Create celebration effect
              for (var k = 0; k < 5; k++) {
                createCelebrationStar();
              }
            }, function(error) {
              console.error('Failed to send feedback:', error);
              submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            })
            .finally(function() {
              setTimeout(function() {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
              }, 3000);
            });
        });
      }

      // Cleanup on page unload
      window.addEventListener('beforeunload', function() {
        if (fireballInterval) {
          clearInterval(fireballInterval);
        }
      });
    });
