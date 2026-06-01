import { resize, animate } from './rubix-cube.js';

window.addEventListener('resize', () => {
  resize();
});

animate();