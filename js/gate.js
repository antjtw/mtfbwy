/* ============================================================
   MTFBYW Closed Beta — Password Gate
   Cookie-based: valid for 14 days after correct entry.
   No URL bypass. Overlay blocks all content until unlocked.
   ============================================================ */

(function () {
  'use strict';

  const COOKIE_NAME = 'mtfbwy_beta_v1';
  const COOKIE_DAYS = 14;
  const PASS        = 'BD1_745_n3xu';

  // SHA-256 of the password (no daily salt — we want persistent login)
  async function hashPassword(pw) {
    const data = new TextEncoder().encode(pw + '::mtfbwy::beta');
    const buf  = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCookie(name) {
    const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
    return match ? match.split('=')[1] : null;
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
  }

  async function isUnlocked() {
    const stored = getCookie(COOKIE_NAME);
    if (!stored) return false;
    const expected = await hashPassword(PASS);
    return stored === expected;
  }

  async function tryUnlock(input) {
    const inputHash   = await hashPassword(input.trim());
    const correctHash = await hashPassword(PASS);
    if (inputHash === correctHash) {
      setCookie(COOKIE_NAME, correctHash, COOKIE_DAYS);
      return true;
    }
    return false;
  }

  function injectGate() {
    document.documentElement.style.cssText = 'visibility:hidden;';

    const style = document.createElement('style');
    style.textContent = `
      #mtfbwy-gate {
        position: fixed; inset: 0; z-index: 999999;
        background: #161B20;
        display: flex; align-items: center; justify-content: center;
      }
      #mtfbwy-gate .gate-box {
        width: 100%; max-width: 380px;
        padding: 48px 40px;
        text-align: center;
      }
      #mtfbwy-gate .gate-logo {
        font-family: 'ITC Serif Gothic', Georgia, serif;
        font-weight: 900; font-size: 22px;
        letter-spacing: 0.08em; color: #F0F0F0;
        text-transform: uppercase; margin-bottom: 40px; display: block;
      }
      #mtfbwy-gate .gate-logo span { color: #E1DFB8; }
      #mtfbwy-gate h1 {
        font-family: 'ITC Serif Gothic', Georgia, serif;
        font-weight: 900; font-size: 24px;
        color: #F0F0F0; margin-bottom: 8px; letter-spacing: -0.01em;
      }
      #mtfbwy-gate .gate-sub {
        font-size: 14px; color: #A8B5C2;
        margin-bottom: 32px; line-height: 1.6;
        font-family: 'Ff Din Paneuropean Variable', system-ui, sans-serif;
      }
      #mtfbwy-gate .gate-field {
        display: flex; flex-direction: column; gap: 8px;
        margin-bottom: 16px; text-align: left;
      }
      #mtfbwy-gate label {
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase; color: #A29E89;
        font-family: 'Ff Din Paneuropean Variable', system-ui, sans-serif;
      }
      #mtfbwy-gate input {
        width: 100%; background: #20252A;
        border: 1.5px solid #2A323D; border-radius: 8px;
        color: #F0F0F0; font-size: 15px; padding: 13px 16px;
        outline: none; letter-spacing: 0.06em;
        transition: border-color 150ms, box-shadow 150ms;
        box-sizing: border-box;
      }
      #mtfbwy-gate input:focus {
        border-color: #A29E89;
        box-shadow: 0 0 0 3px rgba(225,223,184,0.08);
      }
      #mtfbwy-gate input.error {
        border-color: #FD6E6E;
        box-shadow: 0 0 0 3px rgba(253,110,110,0.1);
        animation: gate-shake 0.35s ease;
      }
      #mtfbwy-gate .gate-err {
        font-size: 12px; color: #FD6E6E;
        min-height: 18px; text-align: left; margin-bottom: 4px;
        font-family: 'Ff Din Paneuropean Variable', system-ui, sans-serif;
      }
      #mtfbwy-gate button {
        width: 100%; background: #E1DFB8; border: none;
        border-radius: 8px; color: #161B20; font-size: 14px;
        font-weight: 700; padding: 14px; cursor: pointer;
        margin-top: 8px; transition: opacity 150ms;
        font-family: 'Ff Din Paneuropean Variable', system-ui, sans-serif;
      }
      #mtfbwy-gate button:hover { opacity: 0.88; }
      #mtfbwy-gate button:disabled { opacity: 0.4; cursor: default; }
      #mtfbwy-gate .gate-legal {
        font-size: 11px; color: #58697F;
        margin-top: 32px; line-height: 1.5;
        font-family: 'Ff Din Paneuropean Variable', system-ui, sans-serif;
      }
      @keyframes gate-shake {
        0%,100% { transform: translateX(0); }
        20%,60%  { transform: translateX(-6px); }
        40%,80%  { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);

    const gate = document.createElement('div');
    gate.id = 'mtfbwy-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-label', 'Beta access required');
    gate.innerHTML = `
      <div class="gate-box">
        <span class="gate-logo">MTF<span>B</span>WY</span>
        <h1>Closed Beta Access</h1>
        <p class="gate-sub">This playtest is invite-only.<br>Enter your beta access code to continue.</p>
        <form id="gate-form" autocomplete="off">
          <div class="gate-field">
            <label for="gate-input">Beta access code</label>
            <input
              type="password"
              id="gate-input"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="••••••••••••"
              required
            >
          </div>
          <div class="gate-err" id="gate-err" aria-live="polite"></div>
          <button type="submit" id="gate-btn">Enter</button>
        </form>
        <p class="gate-legal">Your access will be remembered for 14 days.<br>MTFBYW RPG is a non-commercial fan project.</p>
      </div>
    `;
    document.body.appendChild(gate);

    setTimeout(() => document.getElementById('gate-input')?.focus(), 80);

    document.getElementById('gate-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('gate-input');
      const btn   = document.getElementById('gate-btn');
      const err   = document.getElementById('gate-err');

      input.classList.remove('error');
      err.textContent = '';
      btn.disabled    = true;
      btn.textContent = 'Checking…';

      const ok = await tryUnlock(input.value);
      if (ok) {
        gate.style.opacity = '0';
        gate.style.transition = 'opacity 250ms';
        setTimeout(() => {
          gate.remove();
          style.remove();
          document.documentElement.style.cssText = '';
        }, 260);
      } else {
        input.classList.add('error');
        err.textContent  = 'Incorrect access code. Try again.';
        input.value      = '';
        btn.disabled     = false;
        btn.textContent  = 'Enter';
        setTimeout(() => input.focus(), 80);
      }
    });
  }

  async function init() {
    const unlocked = await isUnlocked();
    if (unlocked) {
      // Already authenticated — just show the page
      document.documentElement.style.cssText = '';
    } else {
      if (document.body) {
        injectGate();
      } else {
        document.addEventListener('DOMContentLoaded', injectGate);
      }
    }
  }

  init();
})();
