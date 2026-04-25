// Floating Particles Canvas Animation
(function() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animFrame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -Math.random() * 0.5 - 0.1;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
      this.color = Math.random() > 0.6 ? '#00dcc8' : '#5ef5e6';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      const progress = this.life / this.maxLife;
      this.currentOpacity = this.opacity * (1 - progress) * Math.sin(progress * Math.PI);
      if (this.life >= this.maxLife || this.y < -10) {
        this.reset();
        this.y = canvas.height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentOpacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.life = Math.floor(Math.random() * p.maxLife); // stagger initial positions
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  }

  animate();
})();
