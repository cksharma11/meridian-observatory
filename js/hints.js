/**
 * hints.js — Subliminal Hint System for The Obsidian Signal
 *
 * Ghost text layer, scroll-based star hints, margin notes,
 * document title mutation, and console terminal messages.
 */

const GHOST_TEXTS = [
  'look closer',
  'click the light',
  'type what you seek',
  'patience reveals truth',
  'listen to the void',
  'some things run from you',
  'the code is ancient',
  'reverse the flow',
  'count to seven',
];

const MARGIN_HINTS = [
  'Hz 1420.405',
  'the hydrogen line',
  'venus → void → mars',
  '7 clicks',
  'triple-click the black',
  '↑↑↓↓←→←→',
  'right-click to reverse',
  'hover & wait',
  'SIGNAL',
];

const CONSOLE_MESSAGES = [
  {
    text: "If you're reading this, you're looking in the right place...",
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'The signal repeats every 7 cycles...',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'She watches from the cloud...',
    style: 'color: #f39c12; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'Fragment 1: Look up. Count to seven.',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'Fragment 5: Type the name of what you seek.',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'Fragment 3: The order of celestial cards dictates the stream.',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'Fragment 4: The redaction bars hide truth from the board.',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'Some things hide in plain sight. Others hide behind the right click.',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'The void card is not empty. It is patient.',
    style: 'color: #9b59b6; font-family: monospace; font-size: 13px;',
  },
  {
    text: 'Dr. Voss left 9 breadcrumbs. How many have you found?',
    style: 'color: #00ff88; font-family: monospace; font-size: 13px;',
  },
];

const TITLE_ORIGINAL = 'Meridian Observatory';
const TITLE_SIGNAL = 'S . I . G . N . A . L';

export class Hints {
  constructor() {
    this.titleDirection = 'forward'; // 'forward' = original→signal, 'backward' = signal→original
    this.titleTimer = null;
    this.titleIndex = 0;
    this.consoleTimer = null;
    this.consoleIndex = 0;
  }

  init() {
    this._createGhostTexts();
    this._populateMarginNotes();
    this._startTitleMutation();
    this._startConsoleMessages();
  }

  // ─── Ghost Text Layer ──────────────────────────────────────

  _createGhostTexts() {
    const layer = document.getElementById('ghost-text-layer');
    if (!layer) return;

    // Inject ghost text styles
    if (!document.getElementById('ghost-text-style')) {
      const style = document.createElement('style');
      style.id = 'ghost-text-style';
      style.textContent = `
        .ghost-hint {
          position: absolute;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          pointer-events: auto;
          user-select: none;
          transition: opacity 0.8s ease;
          white-space: nowrap;
        }
        .ghost-hint:hover {
          opacity: 0.08 !important;
        }
      `;
      document.head.appendChild(style);
    }

    const positions = [
      { top: '8%', left: '5%' },
      { top: '15%', right: '8%' },
      { top: '28%', left: '12%' },
      { top: '38%', right: '4%' },
      { top: '48%', left: '3%' },
      { top: '58%', right: '10%' },
      { top: '68%', left: '7%' },
      { top: '78%', right: '6%' },
      { top: '88%', left: '15%' },
    ];

    GHOST_TEXTS.forEach((text, i) => {
      const el = document.createElement('span');
      el.className = 'ghost-hint';
      el.textContent = text;
      const pos = positions[i] || { top: `${10 + i * 10}%`, left: '5%' };
      el.style.top = pos.top;
      if (pos.left) el.style.left = pos.left;
      if (pos.right) el.style.right = pos.right;
      el.style.opacity = String(0.03 + Math.random() * 0.02); // 0.03–0.05
      el.style.color = '#64c8ff';
      layer.appendChild(el);
    });
  }

  // ─── Margin Notes ──────────────────────────────────────────

  _populateMarginNotes() {
    // HTML margin notes already have story-rich content.
    // Only populate empty ones as extras; never overwrite existing.
    const notes = document.querySelectorAll('.margin-note');
    let hintIdx = 0;
    notes.forEach((note) => {
      if (!note.textContent.trim() && hintIdx < MARGIN_HINTS.length) {
        note.textContent = MARGIN_HINTS[hintIdx];
        hintIdx++;
      }
    });
  }

  // ─── Title Mutation ────────────────────────────────────────

  _startTitleMutation() {
    // Mutate title character by character over ~60 seconds
    document.title = TITLE_ORIGINAL;
    this.titleDirection = 'forward';
    this.titleIndex = 0;

    const mutate = () => {
      const from = this.titleDirection === 'forward' ? TITLE_ORIGINAL : TITLE_SIGNAL;
      const to = this.titleDirection === 'forward' ? TITLE_SIGNAL : TITLE_ORIGINAL;

      if (this.titleIndex >= to.length) {
        document.title = to;
        // Pause, then reverse direction
        this.titleIndex = 0;
        this.titleDirection = this.titleDirection === 'forward' ? 'backward' : 'forward';
        this.titleTimer = setTimeout(mutate, 5000);
        return;
      }

      // Build title: characters from 'to' up to titleIndex, rest from 'from'
      const morphed =
        to.substring(0, this.titleIndex + 1) +
        from.substring(this.titleIndex + 1);
      document.title = morphed;
      this.titleIndex++;

      // Each character takes ~3s to change (60s / ~20 chars)
      this.titleTimer = setTimeout(mutate, 3000);
    };

    // Start after a short delay
    this.titleTimer = setTimeout(mutate, 10000);
  }

  // ─── Console Messages ─────────────────────────────────────

  _startConsoleMessages() {
    const logNext = () => {
      const msg = CONSOLE_MESSAGES[this.consoleIndex % CONSOLE_MESSAGES.length];
      console.log(
        `%c[ VOSS TERMINAL ] ${msg.text}`,
        msg.style
      );
      this.consoleIndex++;

      // Next message in 20–45 seconds
      const delay = 20000 + Math.random() * 25000;
      this.consoleTimer = setTimeout(logNext, delay);
    };

    // First message after 8 seconds
    this.consoleTimer = setTimeout(logNext, 8000);
  }

  destroy() {
    if (this.titleTimer) clearTimeout(this.titleTimer);
    if (this.consoleTimer) clearTimeout(this.consoleTimer);
  }
}
