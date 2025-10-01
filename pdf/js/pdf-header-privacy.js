  // Select all mobile dropdown buttons
  const mobileDropdowns = document.querySelectorAll('.header-0105-mobile-dropdown > button');

  mobileDropdowns.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle the active class on the button's parent div
      const dropdownMenu = button.nextElementSibling;
      dropdownMenu.classList.toggle('active');

      // Optional: rotate the chevron icon
      const chevron = button.querySelector('.fa-chevron-down');
      if (chevron) {
        chevron.classList.toggle('rotate');
      }
    });
  });
