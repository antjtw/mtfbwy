/* ============================================================
   MTFBYW Closed Beta — Password Gate
   Injected as the FIRST script in every page <head>.
   No URL bypass. Session-only (dies on tab close).
   ============================================================ */

(function () {
  'use strict';

  const SESSION_KEY = 'mtfbwy_gate_v1';
  const PASS        = 'BD1_745_n3xu';

  // Daily salt: stolen session tokens expire the next calendar day
  function dateBucket() {
    const d = new Date();
    return d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate();
  }

  async function makeToken(pw) {
    const raw  = pw + '::mtfbwy::' + dateBucket();
    const data = new TextEncoder().encode(raw);
    const buf  = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function isUnlocked() {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    return stored === await makeToken(PASS);
  }

  async function tryUnlock(input) {
    const token = await makeToken(input.trim());
    const expected = await makeToken(PASS);
    if (token === expected) {
      sessionStorage.setItem(SESSION_KEY, token);
      return true;
    }
    return false;
  }

  // ── Step 1: hide the page immediately (synchronous) ──────────
  // This prevents a flash of content before the gate renders.
  document.documentElement.style.visibility = 'hidden';

  // ── Step 2: once DOM is ready, decide what to do ─────────────
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(async function () {
    if (await isUnlocked()) {
      // Authenticated — reveal immediately
      document.documentElement.style.visibility = '';
      return;
    }

    // Not authenticated — show gate overlay
    showGate();
  });

  function showGate() {
    // Reveal the page background so the gate sits on the dark bg
    document.documentElement.style.visibility = '';

    const style = document.createElement('style');
    style.textContent = `
      body { overflow: hidden; }
      #mtfbwy-gate {
        position: fixed; inset: 0; z-index: 999999;
        background: #161B20;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Ff Din Paneuropean Variable', system-ui, sans-serif;
      }
      #mtfbwy-gate .gate-box {
        width: 100%; max-width: 380px;
        padding: 48px 40px;
        text-align: center;
      }
      #mtfbwy-gate .gate-wordmark {
        display: block;
        margin: 0 auto 36px;
        height: 32px;
        width: auto;
      }
      #mtfbwy-gate h1 {
        font-family: 'ITC Serif Gothic', Georgia, serif;
        font-weight: 900;
        font-size: 22px;
        color: #F0F0F0;
        margin-bottom: 8px;
        letter-spacing: -0.01em;
      }
      #mtfbwy-gate .gate-sub {
        font-size: 14px; color: #A8B5C2;
        margin-bottom: 32px; line-height: 1.6;
      }
      #mtfbwy-gate .gate-field {
        display: flex; flex-direction: column;
        gap: 8px; margin-bottom: 12px; text-align: left;
      }
      #mtfbwy-gate label {
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: #A29E89;
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
        min-height: 18px; text-align: left;
        margin-bottom: 4px;
      }
      #mtfbwy-gate button {
        width: 100%; background: #E1DFB8; border: none;
        border-radius: 8px; color: #161B20; font-size: 14px;
        font-weight: 700; padding: 14px; cursor: pointer;
        margin-top: 4px; transition: opacity 150ms;
        font-family: inherit;
      }
      #mtfbwy-gate button:hover { opacity: 0.88; }
      #mtfbwy-gate button:disabled { opacity: 0.4; cursor: default; }
      #mtfbwy-gate .gate-legal {
        font-size: 11px; color: #58697F;
        margin-top: 28px; line-height: 1.5;
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
        <img src="assets/logo.svg" alt="MTFBYW" class="gate-wordmark">
        <h1>Closed Beta Access</h1>
        <p class="gate-sub">This playtest is invite-only.<br>Enter your beta access code to continue.</p>
        <div class="gate-field">
          <label for="gate-input">Beta access code</label>
          <input type="password" id="gate-input"
            autocomplete="off" autocorrect="off"
            autocapitalize="off" spellcheck="false"
            placeholder="••••••••••••" required>
        </div>
        <div class="gate-err" id="gate-err" aria-live="polite"></div>
        <button type="button" id="gate-btn">Enter</button>
        <p class="gate-legal">MTFBYW is a non-commercial fan project.<br>Access is restricted to invited playtesters.</p>
      </div>
    `;
    document.body.appendChild(gate);

    const input = document.getElementById('gate-input');
    const btn   = document.getElementById('gate-btn');
    const err   = document.getElementById('gate-err');

    setTimeout(() => input.focus(), 50);

    async function attempt() {
      input.classList.remove('error');
      err.textContent = '';
      btn.disabled    = true;
      btn.textContent = 'Checking…';

      const ok = await tryUnlock(input.value);
      if (ok) {
        gate.style.transition  = 'opacity 0.25s';
        gate.style.opacity     = '0';
        document.body.style.overflow = '';
        setTimeout(() => { gate.remove(); style.remove(); }, 260);
      } else {
        input.classList.add('error');
        err.textContent  = 'Incorrect access code. Try again.';
        input.value      = '';
        btn.disabled     = false;
        btn.textContent  = 'Enter';
        setTimeout(() => input.focus(), 80);
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  }

})();
