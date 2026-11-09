/**
 * Vorevia Contact Widget
 *
 * Adapted from:
 *   Floating Calls & Social Buttons Widget by Liveupx.com
 *   https://github.com/liveupx/Floating-Calls-Social-Buttons-Widget
 *   License: MIT © Liveupx.com
 *
 * Integrated into: website_vorevia — Odoo 19
 * Provides: floating chat launcher, contact panel (WhatsApp / Call / Email /
 *           Quick Enquiry), enquiry form with server-side submission to
 *           vorevia.consultation model.
 *
 * No external dependencies. Vanilla ES6+.
 */

(function () {
  'use strict';

  // ── SVG Icons (reused from original widget icon library) ─────────────────

  const ICONS = {
    chat: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>`,

    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
               -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463
               -2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606
               .134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371
               -.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
               -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016
               -1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487
               .709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719
               2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421
               7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235
               -.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0
               5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884
               -9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157
               11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0
               005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0
               00-3.48-8.413z"/>
    </svg>`,

    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0
               01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72
               12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6
               l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
    </svg>`,

    email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6
               c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>`,

    enquiry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`,
  };

  const COMPANY_PHONE = '9779712030420';
  const COMPANY_PHONE_DISPLAY = '+977 971-2030420';
  const WHATSAPP_MESSAGE = 'Hello Vorevia, I’d like to discuss how Odoo could support my business workflow. Could we arrange a brief consultation?';
  const WHATSAPP_URL = `https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  // ── State ─────────────────────────────────────────────────────────────────

  let _isOpen     = false;
  let _view       = 'contacts'; // 'contacts' | 'form'
  let _submitting = false;

  // DOM references
  let _launcher, _triggerBtn, _panel, _backdrop;
  let _viewContacts, _viewForm, _formEl, _formStatus, _submitBtn;

  // ── CSRF token ────────────────────────────────────────────────────────────

  function getCsrfToken() {
    // Odoo injects <meta name="csrf-token"> in every page
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content') || '';
    // Fallback: check odoo global
    if (window.odoo && window.odoo.csrf_token) return window.odoo.csrf_token;
    return '';
  }

  // ── Panel open / close ───────────────────────────────────────────────────

  function openPanel() {
    _isOpen = true;
    _panel.classList.add('is-open');
    _backdrop.classList.add('is-visible');
    _triggerBtn.classList.add('is-open');
    _triggerBtn.setAttribute('aria-expanded', 'true');
    // Focus first interactive element
    setTimeout(() => {
      const first = _viewContacts.querySelector('a, button');
      if (first) first.focus();
    }, 60);
  }

  function closePanel() {
    _isOpen = false;
    _panel.classList.remove('is-open');
    _backdrop.classList.remove('is-visible');
    _triggerBtn.classList.remove('is-open');
    _triggerBtn.setAttribute('aria-expanded', 'false');
    // Return to contacts view after panel fades out
    if (_view === 'form') {
      setTimeout(() => switchView('contacts'), 300);
    }
    _triggerBtn.focus();
  }

  function togglePanel() {
    _isOpen ? closePanel() : openPanel();
  }

  // ── View switching ────────────────────────────────────────────────────────

  function switchView(target) {
    if (_view === target) return;
    const outEl = target === 'form' ? _viewContacts : _viewForm;
    const inEl  = target === 'form' ? _viewForm     : _viewContacts;

    outEl.classList.add('is-exiting');
    outEl.classList.remove('is-active');

    setTimeout(() => {
      outEl.classList.remove('is-exiting');
      inEl.classList.add('is-active');
      // Focus first input in form
      if (target === 'form') {
        const first = inEl.querySelector('input, textarea, button');
        if (first) first.focus();
      }
    }, 30);

    _view = target;
  }

  // ── Form submission ───────────────────────────────────────────────────────

  function setFormStatus(type, msg) {
    _formStatus.textContent = msg;
    _formStatus.className = 'vov-cw-form-status';
    if (type) _formStatus.classList.add('is-' + type);
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('is-invalid');
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        valid = false;
      }
    });
    // Email format check
    const emailEl = form.querySelector('[name="email"]');
    if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      emailEl.classList.add('is-invalid');
      valid = false;
    }
    return valid;
  }

  async function submitEnquiry(e) {
    e.preventDefault();
    if (_submitting) return;

    const form = _formEl;
    setFormStatus('', '');

    if (!validateForm(form)) {
      setFormStatus('error', 'Please fill in all required fields correctly.');
      return;
    }

    _submitting = true;
    _submitBtn.disabled = true;
    _submitBtn.innerHTML = '<span class="vov-cw-spinner"></span> Sending…';

    const data = new URLSearchParams();
    data.append('name',        form.querySelector('[name="name"]').value.trim());
    data.append('email',       form.querySelector('[name="email"]').value.trim());
    data.append('phone',       form.querySelector('[name="phone"]').value.trim());
    data.append('description', form.querySelector('[name="description"]').value.trim());
    data.append('interest',    'unsure');
    data.append('csrf_token',  getCsrfToken());

    try {
      const resp = await fetch('/website/form/vorevia.consultation', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    data.toString(),
      });

      const result = await resp.json();
      if (resp.ok && result && Number.isInteger(result.id) && result.id > 0) {
        setFormStatus('success', '✓ Your enquiry has been sent! We\'ll be in touch shortly.');
        form.reset();
        // After short delay close panel
        setTimeout(() => {
          closePanel();
          setFormStatus('', '');
        }, 3000);
      } else {
        throw new Error(result?.error || `Server error ${resp.status}`);
      }
    } catch (err) {
      console.warn('[vov-cw] Form submission error:', err);
      setFormStatus('error', 'Could not send your message. Please try again or contact us directly.');
    } finally {
      _submitting = false;
      _submitBtn.disabled = false;
      _submitBtn.textContent = 'Send Message';
    }
  }

  // ── Build DOM ─────────────────────────────────────────────────────────────

  function buildWidget(mount) {
    // Backdrop
    _backdrop = document.createElement('div');
    _backdrop.className = 'vov-cw-backdrop';
    _backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(_backdrop);

    // Panel
    _panel = document.createElement('div');
    _panel.className = 'vov-cw-panel';
    _panel.id = 'vov-cw-panel';
    _panel.setAttribute('role', 'dialog');
    _panel.setAttribute('aria-modal', 'true');
    _panel.setAttribute('aria-label', 'Contact options');

    const inner = document.createElement('div');
    inner.className = 'vov-cw-panel-inner';

    // ── View: contacts ──────────────────────────────────────────────────────
    _viewContacts = document.createElement('div');
    _viewContacts.className = 'vov-cw-view vov-cw-view--contacts is-active';

    _viewContacts.innerHTML = `
      <div class="vov-cw-header">
        <span class="vov-cw-header-title">Chat with us</span>
        <button class="vov-cw-close" aria-label="Close contact panel" data-action="close">
          ${ICONS.close}
        </button>
      </div>
      <div class="vov-cw-body">
        <p class="vov-cw-tagline">How can we help you today?</p>
        <nav class="vov-cw-contacts" aria-label="Contact options">

          <a href="${WHATSAPP_URL}"
             target="_blank" rel="noopener noreferrer"
             class="vov-cw-row vov-cw-row--whatsapp">
            <span class="vov-cw-row-icon">${ICONS.whatsapp}</span>
            <span class="vov-cw-row-label">
              WhatsApp
              <span class="vov-cw-row-sub">Chat instantly</span>
            </span>
            <span class="vov-cw-row-arrow" aria-hidden="true">→</span>
          </a>

          <button class="vov-cw-row vov-cw-row--enquiry" data-action="enquiry" type="button">
            <span class="vov-cw-row-icon">${ICONS.enquiry}</span>
            <span class="vov-cw-row-label">
              Quick Enquiry
              <span class="vov-cw-row-sub">Leave us a message</span>
            </span>
            <span class="vov-cw-row-arrow" aria-hidden="true">→</span>
          </button>

          <a href="tel:+${COMPANY_PHONE}"
             class="vov-cw-row vov-cw-row--call">
            <span class="vov-cw-row-icon">${ICONS.phone}</span>
            <span class="vov-cw-row-label">
              Call Us
              <span class="vov-cw-row-sub">${COMPANY_PHONE_DISPLAY}</span>
            </span>
            <span class="vov-cw-row-arrow" aria-hidden="true">→</span>
          </a>

          <a href="mailto:info@vorevia.com"
             class="vov-cw-row vov-cw-row--email">
            <span class="vov-cw-row-icon">${ICONS.email}</span>
            <span class="vov-cw-row-label">
              Email Us
              <span class="vov-cw-row-sub">info@vorevia.com</span>
            </span>
            <span class="vov-cw-row-arrow" aria-hidden="true">→</span>
          </a>

        </nav>
      </div>
    `;

    // ── View: enquiry form ──────────────────────────────────────────────────
    _viewForm = document.createElement('div');
    _viewForm.className = 'vov-cw-view vov-cw-view--form';

    _viewForm.innerHTML = `
      <div class="vov-cw-header">
        <button class="vov-cw-back" data-action="back" type="button" aria-label="Back to contact options">
          ← Back
        </button>
        <span class="vov-cw-header-title">Quick Enquiry</span>
        <button class="vov-cw-close" aria-label="Close contact panel" data-action="close">
          ${ICONS.close}
        </button>
      </div>
      <div class="vov-cw-body">
        <form class="vov-cw-form" novalidate aria-label="Quick enquiry form">
          <div class="vov-cw-field">
            <label for="vov-cw-name">Name <span aria-hidden="true">*</span></label>
            <input id="vov-cw-name" type="text" name="name" required
                   placeholder="Your full name" autocomplete="name"/>
          </div>
          <div class="vov-cw-field">
            <label for="vov-cw-email">Work Email <span aria-hidden="true">*</span></label>
            <input id="vov-cw-email" type="email" name="email" required
                   placeholder="you@company.com" autocomplete="email"/>
          </div>
          <div class="vov-cw-field">
            <label for="vov-cw-phone">Phone</label>
            <input id="vov-cw-phone" type="tel" name="phone"
                   placeholder="+977 9…" autocomplete="tel"/>
          </div>
          <div class="vov-cw-field">
            <label for="vov-cw-description">Message <span aria-hidden="true">*</span></label>
            <textarea id="vov-cw-description" name="description" required
                      rows="3" placeholder="How can we help you?"></textarea>
          </div>
          <div class="vov-cw-form-status" role="alert" aria-live="polite"></div>
          <button class="vov-cw-submit" type="submit">Send Message</button>
        </form>
      </div>
    `;

    inner.appendChild(_viewContacts);
    inner.appendChild(_viewForm);
    _panel.appendChild(inner);
    document.body.appendChild(_panel);

    // ── Launcher ────────────────────────────────────────────────────────────
    _launcher = document.createElement('div');
    _launcher.className = 'vov-cw-launcher';
    _launcher.id = 'vov-cw-launcher';

    _triggerBtn = document.createElement('button');
    _triggerBtn.className = 'vov-cw-btn';
    _triggerBtn.id = 'vov-cw-trigger';
    _triggerBtn.type = 'button';
    _triggerBtn.setAttribute('aria-label', 'Open contact options');
    _triggerBtn.setAttribute('aria-controls', 'vov-cw-panel');
    _triggerBtn.setAttribute('aria-expanded', 'false');
    _triggerBtn.innerHTML = `
      <img class="vov-cw-robot"
           src="/website_vorevia/static/src/img/vorevia-chat-robot.webp"
           alt="" aria-hidden="true"/>
      <svg class="vov-cw-icon-close" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true" style="display:none">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;

    _launcher.appendChild(_triggerBtn);
    mount.appendChild(_launcher);

    // Store form references
    _formEl    = _viewForm.querySelector('.vov-cw-form');
    _formStatus = _viewForm.querySelector('.vov-cw-form-status');
    _submitBtn  = _viewForm.querySelector('.vov-cw-submit');
  }

  // ── Toggle chat/close icon ─────────────────────────────────────────────────

  function syncTriggerIcon() {
    const robot     = _triggerBtn.querySelector('.vov-cw-robot');
    const iconClose = _triggerBtn.querySelector('.vov-cw-icon-close');
    if (_isOpen) {
      robot.style.display     = 'none';
      iconClose.style.display = '';
    } else {
      robot.style.display     = '';
      iconClose.style.display = 'none';
    }
  }

  // Override open/close to also sync icon
  const _rawOpen  = openPanel.toString();   // not used; redefine below
  function doOpen() {
    _isOpen = true;
    _launcher.classList.add('is-panel-open');
    _panel.classList.add('is-open');
    _backdrop.classList.add('is-visible');
    _triggerBtn.classList.add('is-open');
    _triggerBtn.setAttribute('aria-expanded', 'true');
    syncTriggerIcon();
    setTimeout(() => {
      const first = _viewContacts.querySelector('a, button');
      if (first) first.focus();
    }, 60);
  }

  function doClose() {
    _isOpen = false;
    _launcher.classList.remove('is-panel-open');
    _panel.classList.remove('is-open');
    _backdrop.classList.remove('is-visible');
    _triggerBtn.classList.remove('is-open');
    _triggerBtn.setAttribute('aria-expanded', 'false');
    syncTriggerIcon();
    if (_view === 'form') {
      setTimeout(() => switchView('contacts'), 300);
    }
    _triggerBtn.focus();
  }

  function doToggle() {
    _isOpen ? doClose() : doOpen();
  }

  // ── Event wiring ──────────────────────────────────────────────────────────

  function wireEvents() {
    // Launcher toggle
    _triggerBtn.addEventListener('click', doToggle);

    // Panel — delegated events
    _panel.addEventListener('click', function (e) {
      const action = e.target.closest('[data-action]');
      if (!action) return;
      const act = action.dataset.action;
      if (act === 'close')   doClose();
      if (act === 'enquiry') switchView('form');
      if (act === 'back')    switchView('contacts');
    });

    // Form submit
    if (_formEl) {
      _formEl.addEventListener('submit', submitEnquiry);
      // Clear invalid state on input
      _formEl.addEventListener('input', function (e) {
        e.target.classList.remove('is-invalid');
      });
    }

    // Backdrop click
    _backdrop.addEventListener('click', doClose);

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _isOpen) {
        doClose();
      }
    });

    // Outside click (not on launcher or panel)
    document.addEventListener('click', function (e) {
      if (!_isOpen) return;
      if (_panel.contains(e.target))    return;
      if (_launcher.contains(e.target)) return;
      doClose();
    });
  }

  // ── Odoo Live Chat coexistence ────────────────────────────────────────────

  function adjustForLiveChat() {
    // If Odoo live chat button is present, offset our launcher
    const lc = document.querySelector('.o_livechat_button');
    if (lc) {
      _launcher.style.bottom = '90px';
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    if (document.getElementById('vov-cw-launcher')) return; // already mounted

    const mount = document.getElementById('vov-contact-widget');
    if (!mount) return;

    buildWidget(mount);
    wireEvents();
    adjustForLiveChat();

    // Re-check for live chat after page fully loads
    window.addEventListener('load', adjustForLiveChat, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API (mirrors original FloatingWidget API pattern)
  window.VoreviaContactWidget = {
    open:  function () { if (!_isOpen && _launcher) doOpen(); },
    close: function () { if (_isOpen  && _launcher) doClose(); },
    toggle: function () { if (_launcher) doToggle(); },
  };

})();

