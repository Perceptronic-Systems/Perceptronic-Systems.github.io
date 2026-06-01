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



// 1. Create a single, permanent canvas on page load
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9999';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
const masterParticles = []; // One master list for all particles

// Resize canvas dynamically
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 2. Particle Class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 2; 
    this.speedX = (Math.random() - 0.5) * 8; 
    this.speedY = (Math.random() - 0.5) * 8;
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.015;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.1; // Gravity
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha); // Ensure alpha never goes below 0
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 3. One continuous animation loop
function mainAnimationLoop() {
  // Clear the entire canvas smoothly every frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = masterParticles.length - 1; i >= 0; i--) {
    masterParticles[i].update();
    masterParticles[i].draw();

    // Remove particles cleanly when they fade out
    if (masterParticles[i].alpha <= 0) {
      masterParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(mainAnimationLoop);
}

// Start the loop immediately
requestAnimationFrame(mainAnimationLoop);

// 4. Click Event Listener
document.querySelectorAll('[data-particle]').forEach(element => {
  element.addEventListener('click', (e) => {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      // Just push new particles into the master array!
      masterParticles.push(new Particle(e.clientX, e.clientY));
    }
  });
});