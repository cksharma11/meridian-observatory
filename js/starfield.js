/**
 * starfield.js — 3-Layer Parallax Starfield for The Obsidian Signal
 *
 * Renders ~300 stars across 3 depth layers with parallax scrolling,
 * twinkling, a special flickering star (Fragment 0), and a constellation
 * alignment zone (Fragment 3).
 */

const STAR_COUNT = 300;
const LAYER_COUNT = 3;
const FLICKERING_STAR_COLOR = '#f39c12';
const FLICKERING_STAR_RADIUS = 3.5;
const CONSTELLATION_SCROLL_TOLERANCE = 60;

// Layer configs: [speed multiplier, min radius, max radius, min opacity, max opacity]
const LAYER_CONFIG = [
  { speed: 0.02, minR: 0.4, maxR: 1.0, minO: 0.2, maxO: 0.5 },   // Far
  { speed: 0.05, minR: 0.8, maxR: 1.8, minO: 0.4, maxO: 0.7 },   // Mid
  { speed: 0.10, minR: 1.2, maxR: 2.5, minO: 0.6, maxO: 1.0 },   // Near
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

class Star {
  constructor(layer, canvasW, canvasH) {
    this.layer = layer;
    const cfg = LAYER_CONFIG[layer];
    this.x = Math.random() * canvasW;
    this.y = Math.random() * canvasH;
    this.baseY = this.y;
    this.radius = rand(cfg.minR, cfg.maxR);
    this.baseOpacity = rand(cfg.minO, cfg.maxO);
    this.opacity = this.baseOpacity;
    this.twinkleSpeed = rand(0.002, 0.008);
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.color = `rgba(200, 210, 255, ${this.opacity})`;
  }

  update(time) {
    this.opacity = this.baseOpacity + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.15;
    this.opacity = Math.max(0.05, Math.min(1, this.opacity));
  }
}

class FlickeringStar {
  constructor(canvasW, canvasH) {
    // Upper-right quadrant
    this.x = canvasW * rand(0.65, 0.85);
    this.y = canvasH * rand(0.08, 0.25);
    this.baseY = this.y;
    this.radius = FLICKERING_STAR_RADIUS;
    this.opacity = 1;
    this.color = FLICKERING_STAR_COLOR;
    this.clickCount = 0;
    this.hitRadius = 18;
    this.flickerTimer = 0;
    this.flickerState = true;
    this.nextFlicker = rand(200, 800);
    this.layer = 2; // Near layer
    this.glowPhase = 0;
  }

  update(time) {
    this.flickerTimer += 16;
    if (this.flickerTimer > this.nextFlicker) {
      this.flickerTimer = 0;
      this.flickerState = !this.flickerState;
      this.nextFlicker = this.flickerState ? rand(300, 1200) : rand(50, 200);
    }
    this.opacity = this.flickerState ? rand(0.7, 1.0) : rand(0.1, 0.35);
    this.glowPhase = time * 0.003;
  }

  isHit(cx, cy) {
    const dx = cx - this.x;
    const dy = cy - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.hitRadius;
  }
}

export class Starfield {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.flickeringStar = null;
    this.width = 0;
    this.height = 0;
    this.scrollY = 0;
    this.animId = null;
    this.constellationStars = [];
    this.constellationVisible = false;
    this.constellationAlpha = 0;
    this.alignmentScrollY = 0;
    this._resizeHandler = null;
    this._clickHandler = null;
  }

  init() {
    this.canvas = document.getElementById('starfield-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this._resize();
    this._resizeHandler = () => this._resize();
    window.addEventListener('resize', this._resizeHandler, { passive: true });

    this._clickHandler = (e) => this._handleClick(e);
    this.canvas.addEventListener('click', this._clickHandler);

    this._animate(0);
  }

  _resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this._generateStars();

    // Alignment zone: roughly where the catalog section is (~2.5 viewport heights down)
    this.alignmentScrollY = this.height * 2.5;
  }

  _generateStars() {
    this.stars = [];
    const starsPerLayer = Math.floor(STAR_COUNT / LAYER_COUNT);

    for (let layer = 0; layer < LAYER_COUNT; layer++) {
      for (let i = 0; i < starsPerLayer; i++) {
        this.stars.push(new Star(layer, this.width, this.height * 3));
      }
    }

    // Create flickering star
    this.flickeringStar = new FlickeringStar(this.width, this.height);

    // Pick 3 stars from the mid layer for constellation
    const midStars = this.stars.filter((s) => s.layer === 1);
    this.constellationStars = [];
    if (midStars.length >= 3) {
      // Choose 3 stars that form a visible triangle in the catalog area
      const catalogY = this.height * 2.2;
      const candidates = midStars
        .filter((s) => s.y > catalogY && s.y < catalogY + this.height)
        .slice(0, 10);

      if (candidates.length >= 3) {
        this.constellationStars = [candidates[0], candidates[1], candidates[2]];
      } else {
        // Create constellation stars manually
        for (let i = 0; i < 3; i++) {
          const s = new Star(1, this.width, this.height * 3);
          s.x = this.width * (0.3 + i * 0.2) + rand(-30, 30);
          s.y = catalogY + rand(50, this.height * 0.5);
          s.baseY = s.y;
          this.constellationStars.push(s);
          this.stars.push(s);
        }
      }
    }
  }

  onScroll(scrollY) {
    this.scrollY = scrollY;

    // Check constellation alignment
    const dist = Math.abs(scrollY - this.alignmentScrollY);
    if (dist < CONSTELLATION_SCROLL_TOLERANCE) {
      if (!this.constellationVisible) {
        this.constellationVisible = true;
        document.dispatchEvent(new CustomEvent('constellation-aligned'));
      }
    } else {
      this.constellationVisible = false;
    }
  }

  getFlickeringStar() {
    return this.flickeringStar;
  }

  _handleClick(e) {
    if (!this.flickeringStar) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Adjust for scroll parallax offset
    const starScreenY =
      this.flickeringStar.baseY - this.scrollY * LAYER_CONFIG[2].speed;

    const dx = cx - this.flickeringStar.x;
    const dy = cy - starScreenY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.flickeringStar.hitRadius) {
      this.flickeringStar.clickCount++;
      document.dispatchEvent(
        new CustomEvent('flickering-star-clicked', {
          detail: { count: this.flickeringStar.clickCount },
        })
      );
    }
  }

  _animate(time) {
    this.animId = requestAnimationFrame((t) => this._animate(t));
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // Draw stars layer by layer
    for (const star of this.stars) {
      star.update(time);
      const cfg = LAYER_CONFIG[star.layer];
      const parallaxY = star.baseY - this.scrollY * cfg.speed;

      // Wrap vertically
      const totalH = this.height * 3;
      let drawY = ((parallaxY % totalH) + totalH) % totalH;
      if (drawY > this.height + 5) continue;
      if (drawY < -5) continue;

      ctx.beginPath();
      ctx.arc(star.x, drawY, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 255, ${star.opacity})`;
      ctx.fill();
    }

    // Draw constellation lines
    if (this.constellationStars.length === 3) {
      const targetAlpha = this.constellationVisible ? 0.35 : 0;
      this.constellationAlpha += (targetAlpha - this.constellationAlpha) * 0.05;

      if (this.constellationAlpha > 0.01) {
        ctx.save();
        ctx.strokeStyle = `rgba(100, 200, 255, ${this.constellationAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();

        const pts = this.constellationStars.map((s) => ({
          x: s.x,
          y: s.baseY - this.scrollY * LAYER_CONFIG[s.layer].speed,
        }));

        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.closePath();
        ctx.stroke();

        // Glow dots on constellation vertices
        for (const pt of pts) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 200, 255, ${this.constellationAlpha * 1.5})`;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Draw flickering star
    if (this.flickeringStar) {
      this.flickeringStar.update(time);
      const fs = this.flickeringStar;
      const fY = fs.baseY - this.scrollY * LAYER_CONFIG[2].speed;

      if (fY > -20 && fY < this.height + 20) {
        // Outer glow
        const glowRadius = fs.radius * (3 + Math.sin(fs.glowPhase) * 0.5);
        const grad = ctx.createRadialGradient(fs.x, fY, 0, fs.x, fY, glowRadius);
        grad.addColorStop(0, `rgba(243, 156, 18, ${fs.opacity * 0.5})`);
        grad.addColorStop(1, 'rgba(243, 156, 18, 0)');
        ctx.beginPath();
        ctx.arc(fs.x, fY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(fs.x, fY, fs.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 156, 18, ${fs.opacity})`;
        ctx.fill();
      }
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    if (this._clickHandler && this.canvas) {
      this.canvas.removeEventListener('click', this._clickHandler);
    }
  }
}
