import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
        // === Cursor Glow ===
        const handlePointerMove = (e) => {
            if (glowRef.current) {
                const x = e.clientX;
                const y = e.clientY;
                glowRef.current.style.transform = `translate3d(${x - 130}px, ${y - 130}px, 0)`;
            }
        };
        window.addEventListener('pointermove', handlePointerMove);

        // === Particle Background ===
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let particles = [];
        let width = window.innerWidth;
        let height = window.innerHeight;

        let isMobile = width < 768;
        let PARTICLE_COUNT = isMobile ? 45 : 110;
        let MAX_CONNECT_DISTANCE = isMobile ? 130 : 170;

        const mouse = {
            x: null,
            y: null,
            radius: isMobile ? 90 : 130
        };

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
            isMobile = width < 768;
            PARTICLE_COUNT = isMobile ? 45 : 110;
            MAX_CONNECT_DISTANCE = isMobile ? 130 : 170;
        }

        resizeCanvas();
        const handleResize = () => {
            resizeCanvas();
            initParticles();
        };
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        canvas.addEventListener('mousemove', handleMouseMove);

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };
        canvas.addEventListener('mouseleave', handleMouseLeave);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                const speedBase = isMobile ? 0.3 : 0.5;
                this.vx = (Math.random() - 0.5) * speedBase;
                this.vy = (Math.random() - 0.5) * speedBase;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x <= 0 || this.x >= width) this.vx *= -1;
                if (this.y <= 0 || this.y >= height) this.vy *= -1;

                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius && dist > 0) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const dirX = dx / dist;
                        const dirY = dy / dist;
                        this.x += dirX * force * 2;
                        this.y += dirY * force * 2;
                    }
                }
            }

            draw() {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 4
                );
                gradient.addColorStop(0, 'rgba(0, 220, 255, 0.9)');
                gradient.addColorStop(1, 'rgba(0, 220, 255, 0)');

                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = 'rgba(200, 245, 255, 0.95)';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MAX_CONNECT_DISTANCE) {
                        const alpha = 1 - dist / MAX_CONNECT_DISTANCE;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha * 0.6})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius) {
                        const alpha = 1 - dist / mouse.radius;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 255, 200, ${alpha * 0.7})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }

        let animationId;
        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.update();
                p.draw();
            }

            connectParticles();
            animationId = requestAnimationFrame(animate);
        }

        initParticles();
        animate();

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
            />
            <div
                ref={glowRef}
                className="fixed top-0 left-0 w-[260px] h-[260px] rounded-full pointer-events-none z-[9999] opacity-70"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 200, 255, 0.15) 0%, transparent 70%)'
                }}
            />
        </>
    );
};

export default ParticleBackground;
