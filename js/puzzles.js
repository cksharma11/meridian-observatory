/**
 * puzzles.js — The 9 Fragment Puzzles for The Obsidian Signal
 *
 * Each puzzle is self-contained, checks progress before activating,
 * triggers a discovery animation on solve, and calls progress.discoverFragment().
 */

const FRAGMENT_TEXTS = [
  'ORIGIN: 34.2°N 118.7°W — THE SIGNAL BEGINS WHERE LIGHT FEARS TO TRAVEL',
  'FREQUENCY: 1420.405 MHz — THE HYDROGEN LINE SINGS IN REVERSE',
  'TIMESTAMP: 2019-03-14T03:14:15Z — PI DAY, THE LAST TRANSMISSION',
  'RECIPIENT: ANYONE WHO SEARCHES — THE UNIVERSE REWARDS THE CURIOUS',
  'COORDINATES: BETWEEN 1.524 AU AND 0.723 AU — THE VOID HAS A CENTER',
  'PATTERN: 7-5-3-1 — THE FIBONACCI OF SILENCE',
  'VECTOR: INWARD — THE SIGNAL POINTS TO US',
  'CIPHER: MIRROR — READ THE STARS BACKWARDS AND FIND YOUR NAME',
  'KEY: ↑↑↓↓←→←→ — SOME DOORS OPEN WITH MEMORY',
];

export class Puzzles {
  constructor(progress) {
    this.progress = progress;
    this._activeListeners = [];
  }

  init() {
    this._initFragment0();
    this._initFragment1();
    this._initFragment2();
    this._initFragment3();
    this._initFragment4();
    this._initFragment5();
    this._initFragment6();
    this._initFragment7();
    this._initFragment8();
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 0 — "The Flickering Star"
  // Click the flickering star 7 times
  // ═══════════════════════════════════════════════════════════

  _initFragment0() {
    if (this.progress.isFragmentFound(0)) return;

    const handler = (e) => {
      if (this.progress.isFragmentFound(0)) return;
      const { count } = e.detail;
      if (count >= 7) {
        document.removeEventListener('flickering-star-clicked', handler);
        this._discover(0);
      }
    };

    document.addEventListener('flickering-star-clicked', handler);
    this._activeListeners.push(['flickering-star-clicked', handler]);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 1 — "The Patient Observer"
  // Hover over a nebula element for 5 continuous seconds
  // ═══════════════════════════════════════════════════════════

  _initFragment1() {
    if (this.progress.isFragmentFound(1)) return;

    // Create nebula cloud element if it doesn't exist
    let nebula = document.querySelector('.nebula-cloud');
    if (!nebula) {
      const hero = document.getElementById('observatory');
      if (!hero) return;
      nebula = document.createElement('div');
      nebula.className = 'nebula-cloud';
      nebula.setAttribute('aria-hidden', 'true');

      // Inject nebula styles
      if (!document.getElementById('nebula-style')) {
        const style = document.createElement('style');
        style.id = 'nebula-style';
        style.textContent = `
          .nebula-cloud {
            position: absolute;
            bottom: 10%;
            right: 10%;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: radial-gradient(ellipse at center,
              rgba(100, 50, 180, 0.15) 0%,
              rgba(60, 30, 120, 0.08) 40%,
              transparent 70%
            );
            pointer-events: auto;
            cursor: default;
            transition: transform 1s ease, background 1s ease;
            z-index: 2;
          }
          .nebula-cloud:hover {
            transform: scale(1.1);
          }
          .nebula-cloud.revealed {
            background: radial-gradient(ellipse at center,
              rgba(243, 156, 18, 0.3) 0%,
              rgba(243, 100, 18, 0.15) 40%,
              transparent 70%
            );
            transform: scale(1.3);
          }
        `;
        document.head.appendChild(style);
      }

      hero.style.position = hero.style.position || 'relative';
      hero.appendChild(nebula);
    }

    let hoverTimer = null;

    const onEnter = () => {
      if (this.progress.isFragmentFound(1)) return;
      hoverTimer = setTimeout(() => {
        nebula.classList.add('revealed');
        this._discover(1);
      }, 5000);
    };

    const onLeave = () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    };

    nebula.addEventListener('mouseenter', onEnter);
    nebula.addEventListener('mouseleave', onLeave);

    // Touch support: touchstart = enter, touchend = leave
    nebula.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onEnter();
    }, { passive: false });
    nebula.addEventListener('touchend', onLeave);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 2 — "The Whispered Word"
  // Type "signal" anywhere on the page
  // ═══════════════════════════════════════════════════════════

  _initFragment2() {
    if (this.progress.isFragmentFound(4)) return;

    const targetWord = 'signal';
    let buffer = '';

    const handler = (e) => {
      if (this.progress.isFragmentFound(4)) return;
      // Ignore modifier keys, function keys, etc.
      if (e.key.length !== 1) return;
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      buffer += e.key.toLowerCase();
      // Keep only last 6 characters
      if (buffer.length > targetWord.length) {
        buffer = buffer.slice(-targetWord.length);
      }

      if (buffer === targetWord) {
        document.removeEventListener('keydown', handler);
        this._triggerSignalGlitch();
        this._discover(4);
      }
    };

    document.addEventListener('keydown', handler);
    this._activeListeners.push(['keydown', handler]);
  }

  _triggerSignalGlitch() {
    const freqReveal = document.getElementById('frequency-reveal');
    if (freqReveal) {
      freqReveal.style.opacity = '1';
      freqReveal.style.transition = 'opacity 0.5s ease';
      freqReveal.textContent = '► 1420.405 MHz DETECTED';
    }

    // Brief full-page glitch
    document.body.classList.add('glitching');
    setTimeout(() => document.body.classList.remove('glitching'), 400);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 3 — "The Alignment"
  // Scroll to the constellation alignment zone
  // ═══════════════════════════════════════════════════════════

  _initFragment3() {
    if (this.progress.isFragmentFound(5)) return;

    const handler = () => {
      if (this.progress.isFragmentFound(5)) return;
      document.removeEventListener('constellation-aligned', handler);
      this._discover(5);
    };

    document.addEventListener('constellation-aligned', handler);
    this._activeListeners.push(['constellation-aligned', handler]);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 4 — "The Sequence"
  // Click planet cards: Venus → Mars → Void (in order)
  // ═══════════════════════════════════════════════════════════

  _initFragment4() {
    if (this.progress.isFragmentFound(2)) return;

    const correctOrder = ['venus', 'void', 'mars'];
    let clickSequence = [];
    let hintInterval = null;

    const venusCard = document.querySelector('.planet-card[data-planet="venus"]');
    const marsCard = document.querySelector('.planet-card[data-planet="mars"]');
    const voidCard = document.querySelector('.planet-card[data-planet="void"]');
    const cards = [venusCard, marsCard, voidCard].filter(Boolean);

    if (cards.length < 3) return;

    const handleCardClick = (e) => {
      if (this.progress.isFragmentFound(2)) return;

      const card = e.currentTarget;
      const planet = card.dataset.planet;
      clickSequence.push(planet);

      // Check sequence so far
      for (let i = 0; i < clickSequence.length; i++) {
        if (clickSequence[i] !== correctOrder[i]) {
          // Wrong order — reset with glitch
          this._glitchCards(cards);
          clickSequence = [];
          return;
        }
      }

      // Correct so far — visual feedback
      card.style.borderColor = '#00ff88';
      card.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.3)';

      if (clickSequence.length === correctOrder.length) {
        // All correct!
        if (hintInterval) clearInterval(hintInterval);
        cards.forEach((c) => c.removeEventListener('click', handleCardClick));

        // Fill void card with fragment indicator
        if (voidCard) {
          const voidFragment = document.getElementById('void-fragment');
          if (voidFragment) {
            voidFragment.style.opacity = '1';
            voidFragment.textContent = '◆ FRAGMENT DETECTED ◆';
          }
        }

        this._discover(2);
      }
    };

    cards.forEach((card) => {
      card.addEventListener('click', handleCardClick);
      card.style.cursor = 'pointer';
    });

    // Hint: pulse borders in correct order every 30s
    hintInterval = setInterval(() => {
      if (this.progress.isFragmentFound(2)) {
        clearInterval(hintInterval);
        return;
      }
      this._pulseHint(cards, correctOrder);
    }, 30000);
  }

  _glitchCards(cards) {
    cards.forEach((card) => {
      card.classList.add('glitching');
      card.style.borderColor = '';
      card.style.boxShadow = '';
      // Scatter effect
      const rx = (Math.random() - 0.5) * 20;
      const ry = (Math.random() - 0.5) * 20;
      card.style.transform = `translate(${rx}px, ${ry}px)`;
      setTimeout(() => {
        card.classList.remove('glitching');
        card.style.transform = '';
      }, 400);
    });
  }

  _pulseHint(cards, order) {
    order.forEach((planet, i) => {
      setTimeout(() => {
        const card = cards.find(
          (c) => c.dataset.planet === planet
        );
        if (!card) return;
        card.style.borderColor = 'rgba(100, 200, 255, 0.6)';
        setTimeout(() => {
          card.style.borderColor = '';
        }, 600);
      }, i * 800);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 5 — "The Redaction"
  // Triple-click on a redacted element
  // ═══════════════════════════════════════════════════════════

  _initFragment5() {
    if (this.progress.isFragmentFound(3)) return;

    // Find the first .redacted element with a data-secret attribute
    const redacted = document.querySelector('.redacted[data-secret]');
    if (!redacted) return;
    this._attachRedactionHandler(redacted);
  }

  _attachRedactionHandler(el) {
    const handler = (e) => {
      if (this.progress.isFragmentFound(3)) return;
      // detail gives click count: 3 = triple-click
      if (e.detail >= 3) {
        el.removeEventListener('click', handler);

        // Reveal text
        el.style.backgroundColor = 'transparent';
        el.style.color = '#00ff88';
        el.style.transition = 'all 0.5s ease';
        el.style.userSelect = 'text';
        el.textContent = FRAGMENT_TEXTS[3];

        this._discover(3);
      }
    };

    el.addEventListener('click', handler);
    this._activeListeners.push(['click', handler, el]);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 6 — "The Displaced Element"
  // Chase and corner the satellite icon
  // ═══════════════════════════════════════════════════════════

  _initFragment6() {
    if (this.progress.isFragmentFound(6)) return;

    const satellite = document.getElementById('satellite-icon');
    if (!satellite) return;

    // Inject satellite trail styles
    if (!document.getElementById('satellite-style')) {
      const style = document.createElement('style');
      style.id = 'satellite-style';
      style.textContent = `
        #satellite-icon {
          position: fixed;
          z-index: 1000;
          font-size: 24px;
          cursor: pointer;
          transition: none;
          pointer-events: auto;
          user-select: none;
        }
        .satellite-trail {
          position: fixed;
          font-size: 20px;
          opacity: 0.15;
          pointer-events: none;
          z-index: 999;
          transition: opacity 1.5s ease;
        }
        .satellite-trail.fading {
          opacity: 0;
        }
      `;
      document.head.appendChild(style);
    }

    let satX = window.innerWidth * 0.7;
    let satY = window.innerHeight * 0.3;
    satellite.style.left = satX + 'px';
    satellite.style.top = satY + 'px';

    let ticking = false;
    let lastTrailTime = 0;

    const moveHandler = (e) => {
      if (this.progress.isFragmentFound(6)) return;
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const mx = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
        const my = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

        const dx = satX - mx;
        const dy = satY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Only flee if cursor is within 200px
        if (dist < 200 && dist > 1) {
          const fleeForce = Math.min(40, 3000 / dist);
          const ndx = dx / dist;
          const ndy = dy / dist;

          satX += ndx * fleeForce;
          satY += ndy * fleeForce;

          // Clamp to viewport
          const margin = 5;
          const vw = window.innerWidth - 30;
          const vh = window.innerHeight - 30;
          satX = Math.max(margin, Math.min(vw, satX));
          satY = Math.max(margin, Math.min(vh, satY));

          satellite.style.left = satX + 'px';
          satellite.style.top = satY + 'px';

          // Leave a faint trail
          const now = performance.now();
          if (now - lastTrailTime > 150) {
            lastTrailTime = now;
            this._createSatelliteTrail(satX, satY, satellite.textContent || '🛰️');
          }

          // Check if cornered (within 20px of viewport edge on 2+ sides)
          let corneredSides = 0;
          if (satX <= 20) corneredSides++;
          if (satX >= vw - 20) corneredSides++;
          if (satY <= 20) corneredSides++;
          if (satY >= vh - 20) corneredSides++;

          if (corneredSides >= 2) {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('touchmove', moveHandler);
            satellite.style.transition = 'transform 0.5s ease';
            satellite.style.transform = 'scale(1.5) rotate(360deg)';
            this._discover(6);
          }
        }

        ticking = false;
      });
    };

    document.addEventListener('mousemove', moveHandler, { passive: true });
    document.addEventListener('touchmove', moveHandler, { passive: true });
    this._activeListeners.push(['mousemove', moveHandler]);
    this._activeListeners.push(['touchmove', moveHandler]);
  }

  _createSatelliteTrail(x, y, emoji) {
    const trail = document.createElement('span');
    trail.className = 'satellite-trail';
    trail.textContent = emoji;
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    requestAnimationFrame(() => trail.classList.add('fading'));
    setTimeout(() => trail.remove(), 1600);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 7 — "The Reverse Signal"
  // Right-click waveform, select "Reverse" from custom menu
  // ═══════════════════════════════════════════════════════════

  _initFragment7() {
    if (this.progress.isFragmentFound(7)) return;

    const container = document.getElementById('waveform-container');
    const menu = document.getElementById('custom-context-menu');
    if (!container || !menu) return;

    // Inject menu styles if needed
    if (!document.getElementById('context-menu-style')) {
      const style = document.createElement('style');
      style.id = 'context-menu-style';
      style.textContent = `
        #custom-context-menu {
          position: fixed;
          z-index: 10000;
          background: rgba(10, 12, 18, 0.95);
          border: 1px solid rgba(100, 200, 255, 0.3);
          border-radius: 4px;
          padding: 4px 0;
          min-width: 180px;
          display: none;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        #custom-context-menu.visible {
          display: block;
        }
        .context-item {
          display: block;
          width: 100%;
          padding: 8px 16px;
          color: #8ecae6;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
          background: none;
          border: none;
          text-align: left;
        }
        .context-item:hover {
          background: rgba(100, 200, 255, 0.1);
          color: #fff;
        }
      `;
      document.head.appendChild(style);
    }

    // Show menu on right-click
    const contextHandler = (e) => {
      if (this.progress.isFragmentFound(7)) return;
      e.preventDefault();
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.classList.add('visible');
    };

    container.addEventListener('contextmenu', contextHandler);

    // Handle menu clicks
    const menuClickHandler = (e) => {
      const item = e.target.closest('.context-item') || e.target.closest('[data-action]');
      if (!item) return;
      menu.classList.remove('visible');

      const action = item.dataset.action;
      if (action === 'reverse') {
        this._reverseWaveform();
        this._discover(7);
      } else {
        // Other options do nothing meaningful, just a brief flash
        const canvas = document.getElementById('waveform-canvas');
        if (canvas) {
          canvas.style.filter = action === 'amplify'
            ? 'brightness(2)'
            : 'blur(2px)';
          setTimeout(() => { canvas.style.filter = ''; }, 500);
        }
      }
    };

    menu.addEventListener('click', menuClickHandler);

    // Close menu on click elsewhere
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.classList.remove('visible');
      }
    };
    document.addEventListener('click', closeMenu);

    this._activeListeners.push(['contextmenu', contextHandler, container]);
    this._activeListeners.push(['click', menuClickHandler, menu]);
    this._activeListeners.push(['click', closeMenu]);
  }

  _reverseWaveform() {
    const canvas = document.getElementById('waveform-canvas');
    if (!canvas) return;

    canvas.style.transition = 'transform 1s ease';
    canvas.style.transform = 'scaleX(-1)';
    canvas.style.filter = 'hue-rotate(180deg)';

    setTimeout(() => {
      canvas.style.transition = '';
    }, 1200);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment 8 — "The Konami Gate"
  // ↑↑↓↓←→←→BA
  // ═══════════════════════════════════════════════════════════

  _initFragment8() {
    if (this.progress.isFragmentFound(8)) return;

    const konamiSequence = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA',
    ];
    // Also accept e.key values
    const konamiKeys = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a',
    ];
    let konamiIndex = 0;

    const handler = (e) => {
      if (this.progress.isFragmentFound(8)) return;

      const key = e.key;
      const code = e.code;

      // Check against both key and code
      if (
        key === konamiKeys[konamiIndex] ||
        code === konamiSequence[konamiIndex]
      ) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          document.removeEventListener('keydown', handler);
          this._triggerSystemOverride();
          this._discover(8);
        }
      } else {
        konamiIndex = 0;
        // Check if this key starts the sequence
        if (key === konamiKeys[0] || code === konamiSequence[0]) {
          konamiIndex = 1;
        }
      }
    };

    document.addEventListener('keydown', handler);
    this._activeListeners.push(['keydown', handler]);
  }

  _triggerSystemOverride() {
    // Full-screen override animation
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 100000;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      animation: override-flash 0.3s ease 3;
    `;

    const text = document.createElement('div');
    text.style.cssText = `
      color: #ff0044;
      font-family: 'Courier New', monospace;
      font-size: clamp(24px, 5vw, 60px);
      font-weight: bold;
      letter-spacing: 8px;
      text-transform: uppercase;
      text-shadow: 0 0 20px #ff0044, 0 0 60px rgba(255, 0, 68, 0.5);
    `;
    text.textContent = 'SYSTEM OVERRIDE';

    const sub = document.createElement('div');
    sub.style.cssText = `
      color: #00ff88;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      margin-top: 20px;
      letter-spacing: 4px;
      opacity: 0;
      animation: override-sub-in 0.5s ease 0.8s forwards;
    `;
    sub.textContent = '► KONAMI PROTOCOL ACCEPTED';

    overlay.appendChild(text);
    overlay.appendChild(sub);

    // Inject animation styles
    if (!document.getElementById('override-style')) {
      const style = document.createElement('style');
      style.id = 'override-style';
      style.textContent = `
        @keyframes override-flash {
          0%, 100% { background: #000; }
          50% { background: #110008; }
        }
        @keyframes override-sub-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 900);
    }, 2500);
  }

  // ═══════════════════════════════════════════════════════════
  // Fragment Discovery Animation
  // ═══════════════════════════════════════════════════════════

  _discover(index) {
    // Prevent double-discovery
    if (this.progress.isFragmentFound(index)) return;

    this.progress.discoverFragment(index);
    this._showRevealAnimation(index);
  }

  _showRevealAnimation(index) {
    const overlay = document.getElementById('fragment-reveal-overlay');
    const textEl = document.getElementById('fragment-text');
    if (!overlay || !textEl) return;

    // Inject reveal styles if needed
    if (!document.getElementById('reveal-style')) {
      const style = document.createElement('style');
      style.id = 'reveal-style';
      style.textContent = `
        #fragment-reveal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50000;
          background: rgba(0, 0, 0, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.6s ease;
          backdrop-filter: blur(4px);
        }
        #fragment-reveal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        .reveal-header {
          color: #f39c12;
          font-family: 'Courier New', monospace;
          font-size: clamp(12px, 2.5vw, 18px);
          letter-spacing: 6px;
          text-transform: uppercase;
          margin-bottom: 24px;
          text-shadow: 0 0 15px rgba(243, 156, 18, 0.5);
        }
        #fragment-text {
          color: #00ff88;
          font-family: 'Courier New', monospace;
          font-size: clamp(14px, 3vw, 20px);
          max-width: 700px;
          text-align: center;
          line-height: 1.6;
          padding: 0 20px;
          letter-spacing: 1px;
        }
      `;
      document.head.appendChild(style);
    }

    // Clear previous content
    overlay.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'reveal-header';
    header.textContent = `FRAGMENT ${index + 1}/9 DECODED`;

    const difficulties = [
      'EASY',
      'NOT SO EASY',
      'MEDIUM',
      'MEDIUM-HARD',
      'HARD',
      'HARDER',
      'SUPERHARD',
      'EXTREMELY HARD',
      'INSANE'
    ];

    const diffBadge = document.createElement('div');
    diffBadge.className = 'reveal-difficulty';
    diffBadge.textContent = `DIFFICULTY: ${difficulties[index]}`;
    diffBadge.style.cssText = `
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: -15px;
      margin-bottom: 25px;
      text-transform: uppercase;
    `;

    const fragText = document.createElement('div');
    fragText.id = 'fragment-text';

    overlay.appendChild(header);
    overlay.appendChild(diffBadge);
    overlay.appendChild(fragText);

    // Fade in
    overlay.classList.add('active');

    // Typewriter effect
    const fullText = FRAGMENT_TEXTS[index];
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        fragText.textContent += fullText[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 35);

    // Fade out after 4 seconds
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        clearInterval(typeInterval);
        overlay.innerHTML = '';
      }, 700);
    }, 4000);
  }

  destroy() {
    for (const [event, handler, target] of this._activeListeners) {
      (target || document).removeEventListener(event, handler);
    }
    this._activeListeners = [];
  }
}
