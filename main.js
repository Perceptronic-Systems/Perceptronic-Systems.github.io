document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-in, .fade-in-left, .fade-in-right");

  const observer = new IntersectionObserver((entries) => {
    let index = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
            entry.target.classList.add("active");
        }, index * 150);
        // Stops observing once animated
        observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.1 // Triggers when 10% of the element is visible
  });

  fadeElements.forEach((element) => observer.observe(element));
});