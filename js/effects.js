/**
 * effects.js — Visual Effects Engine for The Obsidian Signal
 *
 * Cursor trail, gravity pull, random glitch, click ripple,
 * scroll turbulence, typing static, and time decay effects.
 */

export class Effects {
  constructor() {
    this.trailCanvas = null;
    this.trailCtx = null;
    this.trailPoints = [];
    this.maxTrailPoints = 35;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseMove = 0;
    this.glitchTargets = [];
    this.glitchTimer = null;
    this.decayElements = [];
    this.decayStartTime = 0;
    this.animId = null;
    this._bound = {};
  }

  init() {
    this._initCursorTrail();
    this._initGravityPull();
    this._initRandomGlitch();
    this._initClickRipple();
    this._initScrollTurbulence();
    this._initTypingStatic();
    this._initTimeDecay();
    this._startAnimationLoop();
  }

  // ─── Cursor Trail ───────────────────────────────────────────

  _initCursorTrail() {
    this.trailCanvas = document.getElementById('cursor-trail-canvas');
    if (!this.trailCanvas) return;
    this.trailCtx = this.trailCanvas.getContext('2d');

    const resize = () => {
      this.trailCanvas.width = window.innerWidth;
      this.trailCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    this._bound.mouseMove = (e) => {
      const now = performance.now();
      if (now - this.lastMouseMove < 16) return; // ~60fps throttle
      this.lastMouseMove = now;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.trailPoints.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1,
        radius: 2.5,
        time: now,
      });
      if (this.trailPoints.length > this.maxTrailPoints) {
        this.trailPoints.shift();
      }
    };

    document.addEventListener('mousemove', this._bound.mouseMove, { passive: true });

    // Touch support
    this._bound.touchMove = (e) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const now = performance.now();
      if (now - this.lastMouseMove < 16) return;
      this.lastMouseMove = now;
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
      this.trailPoints.push({
        x: touch.clientX,
        y: touch.clientY,
        alpha: 1,
        radius: 2.5,
        time: now,
      });
      if (this.trailPoints.length > this.maxTrailPoints) {
        this.trailPoints.shift();
      }
    };
    document.addEventListener('touchmove', this._bound.touchMove, { passive: true });
  }

  _drawTrail() {
    if (!this.trailCtx) return;
    const ctx = this.trailCtx;
    ctx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);

    for (let i = this.trailPoints.length - 1; i >= 0; i--) {
      const pt = this.trailPoints[i];
      pt.alpha -= 0.035;
      pt.radius *= 0.97;

      if (pt.alpha <= 0) {
        this.trailPoints.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 255, ${pt.alpha * 0.6})`;
      ctx.fill();
    }
  }

  // ─── Gravity Pull ───────────────────────────────────────────

  _initGravityPull() {
    this.glitchTargets = Array.from(document.querySelectorAll('.glitch-target'));
    if (this.glitchTargets.length === 0) return;

    let ticking = false;
    this._bound.gravityMove = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        this._applyGravity();
        ticking = false;
      });
    };

    document.addEventListener('mousemove', this._bound.gravityMove, { passive: true });
  }

  _applyGravity() {
    const mx = this.mouseX;
    const my = this.mouseY;

    for (const el of this.glitchTargets) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 400 && dist > 1) {
        const force = Math.min(3, 80 / dist);
        const tx = (dx / dist) * force;
        const ty = (dy / dist) * force;
        el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      } else {
        el.style.transform = '';
      }
    }
  }

  // ─── Random Glitch ──────────────────────────────────────────

  _initRandomGlitch() {
    this._scheduleGlitch();
  }

  _scheduleGlitch() {
    const delay = 25000 + Math.random() * 25000; // 25–50s
    this.glitchTimer = setTimeout(() => {
      this._triggerRandomGlitch();
      this._scheduleGlitch();
    }, delay);
  }

  _triggerRandomGlitch() {
    const targets = document.querySelectorAll('.glitch-target');
    if (targets.length === 0) return;

    // 8% chance of scary full-screen flash
    if (Math.random() < 0.08) {
      this._triggerScaryFlash();
      return;
    }

    const el = targets[Math.floor(Math.random() * targets.length)];
    el.classList.add('glitching');
    document.dispatchEvent(new CustomEvent('system-glitch'));

    const duration = 200 + Math.random() * 300; // 200–500ms
    setTimeout(() => el.classList.remove('glitching'), duration);
  }

  _triggerScaryFlash() {
    const messages = [
      'DO YOU HEAR THE BREATHING?',
      'VOSS LOG: THEY ARE IN THE SIGNAL',
      'ERROR: 0.00% SYNC: COGNITIVE DECAY',
      'IT HAS BEEN WATCHING SINCE 2019',
      'TURN BACK. THEY ARE LISTENING.',
      'DO NOT ATTEMPT TO UNLOCK THE VAULT',
      'HELP ME',
      'THE OBSIDIAN SIGNAL IS GROWING'
    ];
    
    const msg = messages[Math.floor(Math.random() * messages.length)];
    
    const overlay = document.createElement('div');
    overlay.className = 'scary-flash-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 120000;
      background: rgba(12, 2, 2, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ff3333;
      font-family: 'Space Mono', monospace;
      font-weight: bold;
      letter-spacing: 4px;
      font-size: clamp(16px, 4vw, 36px);
      text-align: center;
      padding: 40px;
      text-shadow: 0 0 15px #ff0000, 0 0 30px rgba(255, 0, 0, 0.6);
      animation: shake 0.1s infinite;
      pointer-events: none;
    `;
    
    const sub = document.createElement('div');
    sub.style.cssText = `
      font-size: 11px;
      letter-spacing: 8px;
      margin-top: 20px;
      color: rgba(255, 50, 50, 0.4);
      font-family: 'Courier New', monospace;
    `;
    sub.textContent = 'WARNING: SIGNAL TAMPERING DETECTED';
    
    overlay.appendChild(document.createTextNode(msg));
    overlay.appendChild(sub);
    document.body.appendChild(overlay);
    
    // Dispatch scary glitch event
    document.dispatchEvent(new CustomEvent('turbulence-glitch'));
    
    setTimeout(() => {
      overlay.remove();
    }, 180);
  }

  // ─── Click Ripple ───────────────────────────────────────────

  _initClickRipple() {
    this._bound.click = (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 1px solid rgba(100, 200, 255, 0.5);
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        animation: ripple-expand 0.6s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    };

    // Inject ripple keyframes if not present
    if (!document.getElementById('effects-ripple-style')) {
      const style = document.createElement('style');
      style.id = 'effects-ripple-style';
      style.textContent = `
        @keyframes ripple-expand {
          0% { width: 0; height: 0; opacity: 0.7; }
          100% { width: 80px; height: 80px; opacity: 0; }
        }
        .static-overlay {
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.02) 0px,
            rgba(255,255,255,0.02) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 99998;
          mix-blend-mode: overlay;
        }
      `;
      document.head.appendChild(style);
    }

    document.addEventListener('click', this._bound.click, { passive: true });
  }

  // ─── Scroll Turbulence ──────────────────────────────────────

  _initScrollTurbulence() {
    let lastScroll = 0;
    let turbulenceTimeout = null;

    // Turbulence zones: every ~1.5 viewport heights
    this._bound.scroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const speed = Math.abs(scrollY - lastScroll);
      lastScroll = scrollY;

      // Trigger turbulence at zone boundaries during fast scrolling
      const zone = scrollY / (vh * 1.5);
      const nearBoundary = Math.abs(zone - Math.round(zone)) < 0.05;

      if (nearBoundary && speed > 15) {
        document.body.classList.add('turbulence');
        document.dispatchEvent(new CustomEvent('system-glitch'));
        clearTimeout(turbulenceTimeout);
        turbulenceTimeout = setTimeout(() => {
          document.body.classList.remove('turbulence');
        }, 300);
      }
    };

    window.addEventListener('scroll', this._bound.scroll, { passive: true });
  }

  // ─── Typing Static ─────────────────────────────────────────

  _initTypingStatic() {
    this._bound.keydown = (e) => {
      // Ignore if user is typing in an input/textarea
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      // ~15% chance of static flash
      if (Math.random() > 0.15) return;

      const overlay = document.createElement('div');
      overlay.className = 'static-overlay';
      document.body.appendChild(overlay);
      document.dispatchEvent(new CustomEvent('typing-glitch'));
      setTimeout(() => overlay.remove(), 80 + Math.random() * 80);
    };

    document.addEventListener('keydown', this._bound.keydown, { passive: true });
  }

  // ─── Time Decay ─────────────────────────────────────────────

  _initTimeDecay() {
    this.decayStartTime = Date.now();
    // Target elements that can decay
    this.decayElements = Array.from(
      document.querySelectorAll('.hero-subtitle, .signal-data, .margin-note')
    );
  }

  _updateTimeDecay() {
    if (this.decayElements.length === 0) return;
    const elapsed = (Date.now() - this.decayStartTime) / 1000; // seconds
    // Very slow decay: lose ~0.1 opacity over 10 minutes
    const decay = Math.min(0.1, elapsed / 6000);

    for (const el of this.decayElements) {
      el.style.opacity = String(Math.max(0.5, 1 - decay));
    }
  }

  // ─── Animation Loop ────────────────────────────────────────

  _startAnimationLoop() {
    let frameCount = 0;
    const loop = () => {
      this.animId = requestAnimationFrame(loop);
      this._drawTrail();

      // Time decay check every 60 frames (~1s)
      frameCount++;
      if (frameCount % 60 === 0) {
        this._updateTimeDecay();
      }
    };
    loop();
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.glitchTimer) clearTimeout(this.glitchTimer);
    if (this._bound.mouseMove) document.removeEventListener('mousemove', this._bound.mouseMove);
    if (this._bound.touchMove) document.removeEventListener('touchmove', this._bound.touchMove);
    if (this._bound.gravityMove) document.removeEventListener('mousemove', this._bound.gravityMove);
    if (this._bound.click) document.removeEventListener('click', this._bound.click);
    if (this._bound.scroll) window.removeEventListener('scroll', this._bound.scroll);
    if (this._bound.keydown) document.removeEventListener('keydown', this._bound.keydown);
  }
}
