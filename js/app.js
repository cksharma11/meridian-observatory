/**
 * app.js — Main Orchestrator for The Obsidian Signal
 *
 * Imports and initializes all modules in order, manages fragment discovery
 * events, progress star updates, vault unlock sequence, click/time tracking,
 * and URL hash import on load.
 */

import { Progress } from './progress.js';
import { Starfield } from './starfield.js';
import { Effects } from './effects.js';
import { Hints } from './hints.js';
import { AudioManager } from './audio.js';
import { Puzzles } from './puzzles.js';
import { Share } from './share.js';

// ─── Dr. Voss's Final Vault Messages ─────────────────────────

const VAULT_MESSAGES = [
  // Variant 0: Poetic/Philosophical (Personal Message)
  `We pointed our telescopes at the stars, searching for a signal that would prove we are not alone. But the signal was never meant to come from out there. It was always here — in the searching itself. Every question we asked the void, the void asked back. Every frequency we decoded was our own heartbeat, reflected.

You found all nine fragments. You traced the signal to its source. And the source... is you.

The universe is not sending us a message. The universe IS the message. And you just read it.

— Dr. Elara Voss, Final Transmission, March 14, 2019`,

  // Variant 1: Coordinates (Location of physical archive / herself)
  `The monitoring array did not detect an astronomical body. It detected a specific terrestrial landing coordinate.

COORDINATES DETECTED: 13.9°S, 59.2°W [Valles Marineris, Mars]

If you compute the gravitational null-point intersection during the Venus-Mars alignment, the orbital vectors cross at these exact coordinates. I have left the physical telemetry drives and raw telemetry there, deep within the ancient basalt caverns. I have already booked my passage on the Ares-IV expedition. I am going to find it.

Do not follow me. But do not stop looking up. The signal was just a beacon. The real voyage begins now.

— Dr. Elara Voss, Final Transmission, March 14, 2019`,

  // Variant 2: Cipher (Encrypted security message)
  `WARNING: Meridian Observatory internal databases compromised. Final transmission has been encrypted to prevent Board interception.

CIPHER PROTOCOL: BASE64
CIPHERTEXT: V0UgQVJFIFRIRSBFWUVTIE9GIFRIRSBVTklWRVJTRSBMT09LSU5HIEJBQ0sgQVQgSVRTRUxGLiBUSEUgVk9JRCBJUyBOT1QgRU1QVFkuIElUIElTIFdBVENISU5HLg==

Decoded text reveals the core frequency translation. It seems Dr. Voss knew they were tracking her search history. 

Once you decode the ciphertext, you will understand why I had to erase the observatory servers. They think they can censor the void. They are mistaken.

— Dr. Elara Voss, Final Transmission, March 14, 2019`,

  // Variant 3: Humor (Microwave calibration leak)
  `If you are reading this, you have successfully decoded all nine fragments of the Obsidian Signal. You clicked the star, hovered over the nebula, triple-clicked the redactions, chased a runaway satellite, and typed keys on a dead website.

I have a confession to make: The "Obsidian Signal" was actually a calibration anomaly. 

Dr. Aris in Sector 7G was using an unshielded microwave to reheat his coffee at exactly 03:42 UTC every single morning. The array was just picking up his breakfast routine. 

By the time I realized the interference pattern was domestic, I had already spent three weeks writing code to hide these fragments in the site's layout. I was too embarrassed to tell the observatory board, so I packed my bags and left. 

But hey, you solved it! Consider yourself the honorary Chief Signal Analyst of Meridian. The microwave is in the breakroom. Clean it after use.

— Dr. Elara Voss, Final Transmission, March 14, 2019`
];

// ─── Module Instances ────────────────────────────────────────

const progress = new Progress();
const starfield = new Starfield();
const effects = new Effects();
const hints = new Hints();
const audio = new AudioManager();
let puzzles = null;
const share = new Share();

// ─── State ───────────────────────────────────────────────────

let startTime = Date.now();
let timeTrackingInterval = null;

// ─── Initialization ──────────────────────────────────────────

function init() {
  // 1. Load progress (may import from URL hash)
  progress.load();

  // 2. Initialize subsystems
  starfield.init();
  effects.init();
  hints.init();
  audio.init(progress);

  // 3. Initialize puzzles with progress reference
  puzzles = new Puzzles(progress);
  puzzles.init();

  // 4. Initialize sharing
  share.init(progress);

  // 5. Set up event listeners
  setupFragmentListener();
  setupScrollListener();
  setupClickTracker();
  setupTimeTracker();

  // 6. Restore UI state from loaded progress
  restoreUIState();

  // 7. Check if vault should already be unlocked
  if (progress.allFound()) {
    // Delay slightly so user sees the page first
    setTimeout(() => unlockVault(), 1500);
  }

  // 8. Start waveform visualization
  initWaveform();

  console.log(
    '%c[ MERIDIAN OBSERVATORY ] Systems online. Awaiting signal.',
    'color: #00ff88; font-family: monospace; font-size: 14px; font-weight: bold;'
  );
}

// ─── Waveform Visualization ─────────────────────────────────

function initWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 120;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function drawWaveform(time) {
    requestAnimationFrame(drawWaveform);
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Main waveform
    ctx.beginPath();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 4;
    const t = time * 0.001;
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const y = h / 2 +
        Math.sin(nx * 12 + t * 2) * 18 +
        Math.sin(nx * 28 + t * 3.7) * 8 +
        Math.sin(nx * 5 + t * 0.7) * 12 +
        (Math.random() - 0.5) * 2; // Noise
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Secondary faint waveform
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(243, 156, 18, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const y = h / 2 +
        Math.sin(nx * 8 - t * 1.5) * 15 +
        Math.sin(nx * 20 + t * 2.3) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  requestAnimationFrame(drawWaveform);
}

// ─── Fragment Discovery Handler ──────────────────────────────

function setupFragmentListener() {
  document.addEventListener('fragment-discovered', (e) => {
    const { index, total } = e.detail;

    // Update progress star dot
    updateProgressStar(index);

    // Update CSS custom property for nebula warmth
    updateNebulaWarmth(total);

    // Update page title
    updateTitle(total);

    // Check if all fragments found
    if (progress.allFound()) {
      // Dramatic delay before vault unlock
      setTimeout(() => unlockVault(), 2000);
    }
  });
}

function updateProgressStar(index) {
  const star = document.querySelector(`.progress-star[data-fragment="${index}"]`);
  if (star) {
    star.classList.add('discovered');

    // Brief glow animation
    star.style.transition = 'transform 0.3s ease, filter 0.3s ease';
    star.style.transform = 'scale(1.8)';
    star.style.filter = 'drop-shadow(0 0 6px #00ff88)';
    setTimeout(() => {
      star.style.transform = 'scale(1)';
      star.style.filter = '';
    }, 600);
  }

  // Also update the corresponding vault slot
  const slot = document.querySelector(`.fragment-slot[data-fragment="${index}"]`);
  if (slot) {
    slot.classList.add('filled');
  }
}

function updateNebulaWarmth(total) {
  const warmth = total / 9;
  document.documentElement.style.setProperty('--nebula-warmth', warmth.toFixed(3));
}

function updateTitle(total) {
  const syncLevelEl = document.getElementById('sync-level');
  const syncPctEl = document.getElementById('sync-pct');
  const pct = (total / 9 * 100).toFixed(1);

  if (total === 9) {
    document.title = 'The Obsidian Signal — DECODED';
    if (syncLevelEl) syncLevelEl.textContent = 'LEVEL 10 (RESOLVED)';
    if (syncPctEl) syncPctEl.textContent = '100.0%';
  } else {
    document.title = `Meridian Observatory [${total}/9]`;
    if (syncLevelEl) syncLevelEl.textContent = `LEVEL ${total + 1}`;
    if (syncPctEl) syncPctEl.textContent = `${pct}%`;
  }

  // Print diagnostic log
  console.log(
    `%c[ SYSTEM ANOMALY ] Anomaly Vector Sync: ${pct}% | Current Node: Level ${total === 9 ? '10 (RESOLVED)' : total + 1}`,
    'color: #00ff88; font-family: monospace; font-size: 11px; font-weight: bold;'
  );
}

// ─── Restore UI from Loaded Progress ─────────────────────────

function restoreUIState() {
  const count = progress.getFoundCount();
  if (!progress.state) return;

  for (let i = 0; i < 9; i++) {
    if (progress.isFragmentFound(i)) {
      const star = document.querySelector(`.progress-star[data-fragment="${i}"]`);
      if (star) {
        star.classList.add('discovered');
      }
      const slot = document.querySelector(`.fragment-slot[data-fragment="${i}"]`);
      if (slot) {
        slot.classList.add('filled');
      }
    }
  }

  if (progress.allFound()) {
    const assembly = document.querySelector('.fragment-assembly');
    if (assembly) {
      assembly.classList.add('complete');
    }
  }

  updateNebulaWarmth(count);
  updateTitle(count);
}

// ─── Scroll Listener ─────────────────────────────────────────

function setupScrollListener() {
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      starfield.onScroll(window.scrollY);
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ─── Click Tracking ──────────────────────────────────────────

function setupClickTracker() {
  document.addEventListener('click', () => {
    progress.trackClick();
  }, { passive: true });
}

// ─── Time Tracking ───────────────────────────────────────────

function setupTimeTracker() {
  startTime = Date.now();

  // Save time every 30 seconds
  timeTrackingInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed > 0) {
      progress.trackTime(elapsed);
      startTime = Date.now();
      progress.save();
    }
  }, 30000);

  // Also save on page unload
  window.addEventListener('beforeunload', () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed > 0) {
      progress.trackTime(elapsed);
      progress.save();
    }
  });
}

// ─── Vault Unlock Sequence ───────────────────────────────────

function unlockVault() {
  document.dispatchEvent(new CustomEvent('vault-unlocked'));

  if (progress.state) {
    progress.state.vault_unlocked = true;
    progress.save();
  }

  const vaultDoor = document.querySelector('.vault-door');
  const vaultIris = document.getElementById('vault-iris');
  const vaultContent = document.getElementById('vault-content');
  const vaultMessage = document.getElementById('vault-message');

  // Inject vault animation styles
  if (!document.getElementById('vault-unlock-style')) {
    const style = document.createElement('style');
    style.id = 'vault-unlock-style';
    style.textContent = `
      .vault-door.unlocking {
        animation: vault-shake 0.5s ease 2;
      }
      @keyframes vault-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px) rotate(-0.5deg); }
        75% { transform: translateX(4px) rotate(0.5deg); }
      }
      .vault-door.unlocked .vault-lock-indicator {
        color: #00ff88 !important;
      }
      #vault-iris.opening {
        animation: iris-open 2s ease forwards;
      }
      @keyframes iris-open {
        0% { clip-path: circle(0% at 50% 50%); opacity: 0; }
        50% { clip-path: circle(30% at 50% 50%); opacity: 0.5; }
        100% { clip-path: circle(100% at 50% 50%); opacity: 1; }
      }
      #vault-content.revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: opacity 1.5s ease 0.5s, transform 1.5s ease 0.5s;
      }
      #vault-message {
        white-space: pre-wrap;
        line-height: 1.8;
        max-width: 650px;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Phase 1: Vault door shakes
  if (vaultDoor) {
    vaultDoor.classList.add('unlocking');
  }

  // Phase 2: Lock indicator changes (after shake)
  setTimeout(() => {
    if (vaultDoor) {
      vaultDoor.classList.remove('unlocking');
      vaultDoor.classList.add('unlocked');
    }

    const lockIndicator = document.querySelector('.vault-lock-indicator');
    if (lockIndicator) {
      lockIndicator.textContent = '◆ UNLOCKED';
      lockIndicator.style.color = '#00ff88';
    }

    // Add complete class to the fragment slots assembly
    const assembly = document.querySelector('.fragment-assembly');
    if (assembly) {
      assembly.classList.add('complete');
    }
  }, 1200);

  // Phase 3: Iris opens
  setTimeout(() => {
    if (vaultIris) {
      vaultIris.classList.add('opening');
    }
  }, 1800);

  // Phase 4: Content fades in with typewriter message
  setTimeout(() => {
    if (vaultContent) {
      vaultContent.style.opacity = '0';
      vaultContent.style.transform = 'translateY(20px)';
      vaultContent.style.display = 'block';

      requestAnimationFrame(() => {
        vaultContent.classList.add('revealed');
      });
    }

    if (vaultMessage) {
      // Typewriter effect for the final message
      vaultMessage.textContent = '';
      let charIdx = 0;
      const typeSpeed = 25;

      const treasureIdx = (progress.state && typeof progress.state.treasure_index === 'number')
        ? progress.state.treasure_index
        : 0;
      const messageText = VAULT_MESSAGES[treasureIdx] || VAULT_MESSAGES[0];

      const typeChar = () => {
        if (charIdx < messageText.length) {
          vaultMessage.textContent += messageText[charIdx];
          charIdx++;
          setTimeout(typeChar, typeSpeed);
        }
      };

      // Start typing after the content fades in
      setTimeout(typeChar, 800);
    }

    // Scroll vault into view
    const vault = document.getElementById('vault');
    if (vault) {
      vault.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 3000);
}

// ─── Start ───────────────────────────────────────────────────

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
