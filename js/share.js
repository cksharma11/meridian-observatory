/**
 * share.js — Social Sharing for The Obsidian Signal
 *
 * Encodes progress to URL hash, uses Web Share API or clipboard,
 * shows brief "TRANSMITTED" confirmation.
 */

export class Share {
  constructor() {
    this.progress = null;
    this.transmitBtn = null;
  }

  init(progress) {
    this.progress = progress;
    this.transmitBtn = document.getElementById('transmit-btn');
    if (!this.transmitBtn) return;

    this.transmitBtn.addEventListener('click', () => this._share());
  }

  async _share() {
    if (!this.progress) return;

    const encoded = this.progress.toShareString();
    const url = `${window.location.origin}${window.location.pathname}#p=${encoded}`;
    const count = this.progress.getFoundCount();
    const allFound = this.progress.allFound();

    const shareText = allFound
      ? "I've decoded The Obsidian Signal. The truth is out there."
      : `I've decoded ${count}/9 fragments of The Obsidian Signal. Can you find them all?`;

    const shareData = {
      title: 'The Obsidian Signal',
      text: shareText,
      url: url,
    };

    let success = false;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        success = true;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if (err.name !== 'AbortError') {
          success = await this._copyToClipboard(url, shareText);
        }
      }
    } else {
      success = await this._copyToClipboard(url, shareText);
    }

    if (success) {
      this._showConfirmation();
    }
  }

  async _copyToClipboard(url, text) {
    const fullText = `${text}\n${url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      return true;
    } catch {
      // Fallback: textarea copy
      try {
        const ta = document.createElement('textarea');
        ta.value = fullText;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        return true;
      } catch {
        return false;
      }
    }
  }

  _showConfirmation() {
    // Inject style if needed
    if (!document.getElementById('transmit-confirm-style')) {
      const style = document.createElement('style');
      style.id = 'transmit-confirm-style';
      style.textContent = `
        .transmit-confirm {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.4);
          color: #00ff88;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          letter-spacing: 4px;
          padding: 12px 28px;
          z-index: 60000;
          border-radius: 4px;
          animation: transmit-in 0.3s ease;
          pointer-events: none;
          text-transform: uppercase;
        }
        @keyframes transmit-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    const confirm = document.createElement('div');
    confirm.className = 'transmit-confirm';
    confirm.textContent = '► TRANSMITTED';
    document.body.appendChild(confirm);

    setTimeout(() => {
      confirm.style.transition = 'opacity 0.4s ease';
      confirm.style.opacity = '0';
      setTimeout(() => confirm.remove(), 500);
    }, 2000);
  }
}
