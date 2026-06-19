/**
 * progress.js — Progress Manager for The Obsidian Signal
 *
 * Manages puzzle progress via localStorage with Base64 encoding.
 * Supports URL-hash sharing and dispatches custom events on discovery.
 */

const STORAGE_KEY = 'obs_meridian_signal_progress';
const FRAGMENT_COUNT = 9;

function createDefaultState() {
  return {
    fragments: new Array(FRAGMENT_COUNT).fill(false),
    discovered_at: new Array(FRAGMENT_COUNT).fill(null),
    total_clicks: 0,
    total_time_spent: 0,
    first_visit: new Date().toISOString(),
    vault_unlocked: false,
    treasure_index: Math.floor(Math.random() * 4),
  };
}

function encodeState(state) {
  try {
    const json = JSON.stringify(state);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return '';
  }
}

function decodeState(b64) {
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function validateState(state) {
  if (!state || typeof state !== 'object') return null;
  if (!Array.isArray(state.fragments) || state.fragments.length !== FRAGMENT_COUNT) return null;
  if (!Array.isArray(state.discovered_at) || state.discovered_at.length !== FRAGMENT_COUNT) return null;
  
  // Set random treasure index for legacy states
  if (typeof state.treasure_index !== 'number' || state.treasure_index < 0 || state.treasure_index > 3) {
    state.treasure_index = Math.floor(Math.random() * 4);
  }
  return state;
}

export class Progress {
  constructor() {
    this.state = null;
  }

  /**
   * Load progress from URL hash, then localStorage, or create fresh state.
   */
  load() {
    // 1. Try URL hash first
    const hash = window.location.hash;
    if (hash && hash.startsWith('#p=')) {
      const imported = this.importFromHash(hash.slice(3));
      if (imported) {
        // Clear the hash so it doesn't persist in address bar
        history.replaceState(null, '', window.location.pathname + window.location.search);
        this.save();
        this._dispatchLoaded();
        return this;
      }
    }

    // 2. Try localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const decoded = decodeState(raw);
        const valid = validateState(decoded);
        if (valid) {
          this.state = valid;
          this._dispatchLoaded();
          return this;
        }
      }
    } catch {
      // localStorage may be unavailable
    }

    // 3. Create new state
    this.state = createDefaultState();
    this.save();
    this._dispatchLoaded();
    return this;
  }

  /**
   * Persist current state to localStorage.
   */
  save() {
    if (!this.state) return;
    try {
      localStorage.setItem(STORAGE_KEY, encodeState(this.state));
    } catch {
      // Silently fail if storage is full or unavailable
    }
  }

  /**
   * Mark a fragment as discovered.
   * @param {number} index — Fragment index (0–8)
   */
  discoverFragment(index) {
    if (index < 0 || index >= FRAGMENT_COUNT) return;
    if (!this.state) this.state = createDefaultState();
    if (this.state.fragments[index]) return; // Already found

    this.state.fragments[index] = true;
    this.state.discovered_at[index] = new Date().toISOString();
    this.save();

    document.dispatchEvent(
      new CustomEvent('fragment-discovered', {
        detail: {
          index,
          total: this.getFoundCount(),
        },
      })
    );
  }

  /**
   * Check if a specific fragment has been discovered.
   * @param {number} index
   * @returns {boolean}
   */
  isFragmentFound(index) {
    if (!this.state) return false;
    return !!this.state.fragments[index];
  }

  /**
   * @returns {number} Count of discovered fragments.
   */
  getFoundCount() {
    if (!this.state) return 0;
    return this.state.fragments.filter(Boolean).length;
  }

  /**
   * @returns {boolean} True if all 9 fragments discovered.
   */
  allFound() {
    return this.getFoundCount() === FRAGMENT_COUNT;
  }

  /**
   * Encode current state as a Base64 string for URL sharing.
   * @returns {string}
   */
  toShareString() {
    if (!this.state) return '';
    return encodeState(this.state);
  }

  /**
   * Import progress from a Base64 hash string.
   * @param {string} hash — Base64-encoded state
   * @returns {boolean} True if import succeeded.
   */
  importFromHash(hash) {
    const decoded = decodeState(hash);
    const valid = validateState(decoded);
    if (!valid) return false;
    this.state = valid;
    return true;
  }

  /**
   * Reset all progress.
   */
  reset() {
    this.state = createDefaultState();
    this.save();
    this._dispatchLoaded();
  }

  /**
   * Increment total click counter.
   */
  trackClick() {
    if (!this.state) return;
    this.state.total_clicks++;
    // Save periodically, not every click (handled by app.js)
  }

  /**
   * Update total time spent (in seconds).
   * @param {number} seconds
   */
  trackTime(seconds) {
    if (!this.state) return;
    this.state.total_time_spent += seconds;
  }

  /** @private */
  _dispatchLoaded() {
    document.dispatchEvent(new CustomEvent('progress-loaded'));
  }
}
