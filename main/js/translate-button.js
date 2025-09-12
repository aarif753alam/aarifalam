document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".blog-lang-btn");
  const dropdown = document.querySelector(".blog-lang-dropdown-content");
  const arrow = document.querySelector(".blog-lang-btn .arrow");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    arrow.style.transform = dropdown.classList.contains("show")
      ? "rotate(180deg)"
      : "rotate(0)";
  });

  // Close dropdown if clicked outside
  window.addEventListener("click", () => {
    dropdown.classList.remove("show");
    arrow.style.transform = "rotate(0)";
  });
});
