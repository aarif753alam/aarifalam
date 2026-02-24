// contacts.js - Optimized for Cloudflare static hosting
// Complete enhanced version with modern interactions, animations, and performance
//powered by aarifalam0105
// © 2026 Aarif Alam. All rights reserved. — Built with By @AarifAlam0105
// contacts.js - Enhanced with NO conflicts with header.js
// All functionality is additive and checks for existing implementations

(function() {
  'use strict';

  function initWhenReady() {
    const headerExists = typeof initializeHeader !== 'undefined' || 
                         document.querySelector('.main-header')?._headerInitialized;
    
    initScrollProgress();
    initSmoothScroll();
    initFloatingAnimations();
    initContactForm();
    initCardInteractions();
    initScrollReveal();
    initLazyLoading();
    initBackToTop();
    initSocialHoverEffects();
    
    if (!document.querySelector('.main-header')?.classList.contains('header-ready')) {
      initMobileMenuFallback(); 
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }

  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar || progressBar._initialized) return;
    progressBar._initialized = true;

    window.addEventListener('scroll', function() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  function initSmoothScroll() {
    if (document.body.classList.contains('smooth-scroll-enabled')) return;
    
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    links.forEach(link => {
      link.removeEventListener('click', handleSmoothScroll);
      link.addEventListener('click', handleSmoothScroll);
    });
    
    document.body.classList.add('smooth-scroll-enabled');
  }

  function handleSmoothScroll(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      history.pushState(null, null, targetId);
    }
  }

  function initFloatingAnimations() {
    const floatingElements = document.querySelectorAll('.floating:not(.animated)');
    
    floatingElements.forEach(element => {
      element.classList.add('animated');
      
      const duration = 5 + Math.random() * 4;
      const yOffset = 15 + Math.random() * 15;
      
      element.style.animation = `floatCustom ${duration}s ease-in-out infinite`;
      
      if (!document.querySelector('#float-keyframes')) {
        const style = document.createElement('style');
        style.id = 'float-keyframes';
        style.textContent = `
          @keyframes floatCustom {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-${yOffset}px) rotate(${Math.random() * 2 - 1}deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  function initContactForm() {
    const contactForm = document.getElementById('feedback-form') || 
                       document.querySelector('.contact-form') ||
                       document.getElementById('contactForm');
    
    if (!contactForm || contactForm._initialized) return;
    contactForm._initialized = true;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      clearErrors(contactForm);
      
      const nameInput = contactForm.querySelector('#user-name, #name, input[name="name"]');
      const emailInput = contactForm.querySelector('#user-email, #email, input[name="email"]');
      const messageInput = contactForm.querySelector('#user-message, #message, textarea');
      
      if (nameInput && !validateField(nameInput, 'Name is required')) isValid = false;
      if (emailInput && !validateEmail(emailInput)) isValid = false;
      if (messageInput && !validateField(messageInput, 'Message cannot be empty')) isValid = false;
      
      if (isValid && submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          showNotification('Message sent successfully! We\'ll respond within 24 hours.', 'success');
          contactForm.reset();
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }, 1500);
      }
    });
  }

  function validateField(input, errorMsg) {
    if (!input.value.trim()) {
      showFieldError(input, errorMsg);
      return false;
    }
    return true;
  }

  function validateEmail(input) {
    const email = input.value.trim();
    if (!email) {
      showFieldError(input, 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFieldError(input, 'Please enter a valid email address');
      return false;
    }
    return true;
  }

  function showFieldError(input, message) {
    input.classList.add('error');
    
    const errorId = input.id + '-error';
    let errorEl = document.getElementById(errorId);
    
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      errorEl.id = errorId;
      input.parentNode.appendChild(errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.classList.add('show');
    
    input.addEventListener('input', function onInput() {
      this.classList.remove('error');
      const err = document.getElementById(this.id + '-error');
      if (err) err.classList.remove('show');
      this.removeEventListener('input', onInput);
    }, { once: true });
  }

  function clearErrors(form) {
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
  }

  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#00b894' : type === 'error' ? '#ff7675' : '#6c5ce7'};
      color: white;
      padding: 15px 25px;
      border-radius: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1rem;
      animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    `;
    
    if (!document.querySelector('#notif-keyframes')) {
      const style = document.createElement('style');
      style.id = 'notif-keyframes';
      style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { to { opacity: 0; transform: translateX(100%); } }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
  }

  function initCardInteractions() {
    const cards = document.querySelectorAll('.contact-card:not(.interaction-enabled)');
    
    cards.forEach(card => {
      card.classList.add('interaction-enabled');
      
      card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  function initScrollReveal() {
    if (window._scrollRevealInitialized) return;
    
    const elements = document.querySelectorAll('.contact-card, .social-section, .about-section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    elements.forEach(el => {
      if (!el.classList.contains('revealed')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
      }
    });
    
    window._scrollRevealInitialized = true;
  }

  function initMobileMenuFallback() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (!mobileMenuBtn || !navLinks) return;
    if (navLinks.classList.contains('active') || mobileMenuBtn._handlerAttached) return;
    
    mobileMenuBtn._handlerAttached = true;
    
    // Only attach if not already working
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      this.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
  }

  function initLazyLoading() {
    if (window._lazyLoadingInitialized) return;
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
    
    window._lazyLoadingInitialized = true;
  }

  function initBackToTop() {
    if (document.getElementById('backToTop')) return;
    
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6c5ce7, #ff79c6);
      color: white;
      border: none;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 5px 20px rgba(108, 92, 231, 0.4);
      z-index: 999;
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', function() {
      btn.style.display = window.scrollY > 500 ? 'flex' : 'none';
    });
    
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initSocialHoverEffects() {
    const socialIcons = document.querySelectorAll('.social-icon:not(.enhanced)');
    
    socialIcons.forEach(icon => {
      icon.classList.add('enhanced');
      
      icon.addEventListener('mouseenter', function() {
        for (let i = 0; i < 3; i++) {
          const particle = document.createElement('span');
          particle.className = 'social-particle';
          particle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            animation: particleFly 0.8s ease-out forwards;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
          `;
          this.appendChild(particle);
          setTimeout(() => particle.remove(), 800);
        }
      });
    });
    
    if (!document.querySelector('#particle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle-keyframes';
      style.textContent = `
        @keyframes particleFly {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: translate(${Math.random() * 40 - 20}px, -40px) scale(0); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  const copyrightEl = document.querySelector('.copyright p');
  if (copyrightEl && !copyrightEl.innerHTML.includes(new Date().getFullYear())) {
    const currentYear = new Date().getFullYear();
    copyrightEl.innerHTML = copyrightEl.innerHTML.replace(/2025/g, currentYear);
  }

})()
