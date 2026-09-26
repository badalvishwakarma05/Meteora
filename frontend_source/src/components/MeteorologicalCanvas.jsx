import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * MeteorologicalCanvas
 * High-performance HTML5 Canvas component rendering meteorological animations:
 * - Falling rain streaks & splash micro-ripples
 * - Flowing atmospheric wind streamlines & isobaric drift particles
 * - Lightweight, non-intrusive, theme-aware (light/dark mode)
 */
export default function MeteorologicalCanvas({
  mode = 'combo', // 'combo' | 'rain' | 'wind' | 'vortex'
  density = 'medium', // 'low' | 'medium' | 'high'
  speedMultiplier = 1,
  opacity = 0.85,
  className = '',
  windAngle = 65, // Angle in degrees for precipitation/wind drift (default ~65° down-right)
}) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Particle density calculation based on dimensions and setting
    const densityFactor = density === 'low' ? 0.4 : density === 'high' ? 1.6 : 1.0;
    const area = Math.max(width * height, 100000);
    const rainCount = Math.floor(Math.min(70, Math.max(15, (area / 18000) * densityFactor)));
    const windCount = Math.floor(Math.min(45, Math.max(12, (area / 24000) * densityFactor)));

    // Radian conversion for drift vectors
    const rad = (windAngle * Math.PI) / 180;
    const cosAngle = Math.cos(rad);
    const sinAngle = Math.sin(rad);

    // Color palettes for dark vs light mode
    const isDarkMode = isDark ?? (document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light'));
    
    const palette = isDarkMode
      ? {
          rainStreak: 'rgba(140, 220, 255, ',
          rainHighlight: 'rgba(210, 245, 255, ',
          windStream: 'rgba(0, 212, 255, ',
          windGlow: 'rgba(56, 189, 248, ',
          splash: 'rgba(125, 211, 252, ',
        }
      : {
          rainStreak: 'rgba(15, 118, 110, ',
          rainHighlight: 'rgba(3, 105, 161, ',
          windStream: 'rgba(2, 132, 199, ',
          windGlow: 'rgba(14, 165, 233, ',
          splash: 'rgba(56, 189, 248, ',
        };

    // Rain Particles
    class RainDrop {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = Math.random() * (width + 300) - 150;
        this.y = isInitial ? Math.random() * height : -20 - Math.random() * 50;
        this.length = 12 + Math.random() * 22;
        this.speed = (5 + Math.random() * 8) * speedMultiplier;
        this.thickness = 0.8 + Math.random() * 1.2;
        this.baseAlpha = (0.15 + Math.random() * 0.35) * opacity;
        this.alpha = this.baseAlpha;
      }

      update(splashes) {
        this.x += cosAngle * this.speed * 0.6;
        this.y += sinAngle * this.speed;

        // Ground splash check
        if (this.y >= height - 5) {
          if (Math.random() < 0.25) {
            splashes.push(new Splash(this.x, height - 2));
          }
          this.reset();
        } else if (this.x > width + 100 || this.x < -100) {
          this.reset();
        }
      }

      draw() {
        const endX = this.x - cosAngle * this.length;
        const endY = this.y - sinAngle * this.length;

        const grad = ctx.createLinearGradient(endX, endY, this.x, this.y);
        grad.addColorStop(0, `${palette.rainStreak}0)`);
        grad.addColorStop(0.7, `${palette.rainStreak}${this.alpha * 0.7})`);
        grad.addColorStop(1, `${palette.rainHighlight}${this.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
      }
    }

    // Ground Rain Splash Ripple
    class Splash {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1 + Math.random() * 2;
        this.maxRadius = 6 + Math.random() * 8;
        this.alpha = 0.4 * opacity;
        this.life = 0;
        this.maxLife = 18;
      }

      update() {
        this.life++;
        this.radius += (this.maxRadius - this.radius) * 0.15;
        this.alpha *= 0.88;
      }

      draw() {
        if (this.alpha <= 0.02) return;
        ctx.strokeStyle = `${palette.splash}${this.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 1.6, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      isDead() {
        return this.life >= this.maxLife || this.alpha <= 0.02;
      }
    }

    // Atmospheric Wind Streamlines (Isobaric Flow)
    class WindStream {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = isInitial ? Math.random() * width : -100 - Math.random() * 100;
        this.y = Math.random() * height;
        this.length = 40 + Math.random() * 90;
        this.speed = (1.5 + Math.random() * 3.5) * speedMultiplier;
        this.waveFreq = 0.005 + Math.random() * 0.008;
        this.waveAmp = 8 + Math.random() * 18;
        this.phase = Math.random() * Math.PI * 2;
        this.thickness = 1 + Math.random() * 1.5;
        this.baseAlpha = (0.12 + Math.random() * 0.3) * opacity;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.speed * 1.4;
        this.phase += 0.03;
        this.y += Math.sin(this.phase) * 0.35;

        if (this.x > width + 150) {
          this.reset();
        }
      }

      draw() {
        const segments = 10;
        const step = this.length / segments;

        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';

        for (let i = 0; i < segments; i++) {
          const segStartRatio = i / segments;
          const segEndRatio = (i + 1) / segments;

          const startX = this.x - (1 - segStartRatio) * this.length;
          const startY = this.y + Math.sin((startX * this.waveFreq) + this.phase) * this.waveAmp;

          const endX = this.x - (1 - segEndRatio) * this.length;
          const endY = this.y + Math.sin((endX * this.waveFreq) + this.phase) * this.waveAmp;

          const segAlpha = this.alpha * Math.sin(segEndRatio * Math.PI);
          ctx.strokeStyle = `${palette.windStream}${segAlpha})`;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Glowing particle head
        ctx.fillStyle = `${palette.windGlow}${this.alpha * 1.2})`;
        ctx.beginPath();
        const headY = this.y + Math.sin((this.x * this.waveFreq) + this.phase) * this.waveAmp;
        ctx.arc(this.x, headY, this.thickness * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize arrays
    const rainDrops = (mode === 'combo' || mode === 'rain') 
      ? Array.from({ length: rainCount }, () => new RainDrop(true))
      : [];
    const windStreams = (mode === 'combo' || mode === 'wind') 
      ? Array.from({ length: windCount }, () => new WindStream(true))
      : [];
    let splashes = [];

    // Resize handling
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas.parentElement || canvas);
    }
    window.addEventListener('resize', handleResize);

    // Main animation loop
    let isRunning = true;
    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      // Render & update wind streamlines
      if (windStreams.length > 0) {
        for (let i = 0; i < windStreams.length; i++) {
          windStreams[i].update();
          windStreams[i].draw();
        }
      }

      // Render & update rain drops
      if (rainDrops.length > 0) {
        for (let i = 0; i < rainDrops.length; i++) {
          rainDrops[i].update(splashes);
          rainDrops[i].draw();
        }
      }

      // Render & update splash rings
      for (let i = splashes.length - 1; i >= 0; i--) {
        splashes[i].update();
        splashes[i].draw();
        if (splashes[i].isDead()) {
          splashes.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Tab visibility handling to pause when hidden and save battery/GPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start loop
    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [mode, density, speedMultiplier, opacity, windAngle, isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${className}`}
    />
  );
}
