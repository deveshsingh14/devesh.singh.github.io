import { throttle } from '../utils/dom.js';

export function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    const hero = document.getElementById('hero');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouseX = null;
        let mouseY = null;
        const REPEL_RADIUS = 90;
        const CONNECT_RADIUS = 200;
        let canvasOffsetX = 0;
        let canvasOffsetY = 0;

        if (window.matchMedia('(pointer: fine)').matches && hero) {
            hero.addEventListener('mousemove', throttle((e) => {
                mouseX = e.pageX - canvasOffsetX;
                mouseY = e.pageY - canvasOffsetY;
            }));
            hero.addEventListener('mouseleave', () => {
                mouseX = null;
                mouseY = null;
            });
        }

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.getElementById('hero').offsetHeight;
            const rect = canvas.getBoundingClientRect();
            canvasOffsetX = rect.left + window.scrollX;
            canvasOffsetY = rect.top + window.scrollY;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                if (mouseX !== null) {
                    const dx = this.x - mouseX;
                    const dy = this.y - mouseY;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
                        const absX = dx < 0 ? -dx : dx;
                        const absY = dy < 0 ? -dy : dy;
                        const dist = absX > absY ? absX + 0.428 * absY : absY + 0.428 * absX;
                        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
                        this.x += (dx / dist) * force * 1.8;
                        this.y += (dy / dist) * force * 1.8;
                    }
                }
            }

            draw() {
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 87, 49, 0.75)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const numParticles = Math.min(Math.floor(window.innerWidth / 20), 100);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgb(255, 87, 49)';

            const len = particles.length;
            for (let i = 0; i < len; i++) {
                const pi = particles[i];
                pi.update();
                pi.draw();

                const pix = pi.x;
                const piy = pi.y;

                if (mouseX !== null) {
                    const mdx = pix - mouseX;
                    const mdy = piy - mouseY;
                    const mDistSq = mdx * mdx + mdy * mdy;
                    if (mDistSq < CONNECT_RADIUS * CONNECT_RADIUS) {
                        ctx.beginPath();
                        ctx.moveTo(pix, piy);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.globalAlpha = 0.65 * (1 - mDistSq / (CONNECT_RADIUS * CONNECT_RADIUS));
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                for (let j = i + 1; j < len; j++) {
                    const pj = particles[j];
                    const dx = pix - pj.x;
                    const dy = piy - pj.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 22500) {
                        ctx.beginPath();
                        ctx.moveTo(pix, piy);
                        ctx.lineTo(pj.x, pj.y);
                        ctx.globalAlpha = 0.4 * (1 - distSq / 22500);
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
}
document.addEventListener('DOMContentLoaded', initCanvas);
