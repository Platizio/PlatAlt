/**
 * Platizio Alternatives
 * Site-wide interactive features:
 *   - Investor Enquiry Modal (opens via .js-open-consult buttons)
 *   - Consultation Booking Popup (auto-triggers at 90 seconds)
 *   - Thank You Modal (after form submissions)
 *   - Toast Notifications
 *   - Scroll-to-Top Button
 *   - Scroll Reveal Animations
 *   - Partner Form Handler
 */
(function () {
  'use strict';

  /* ── Constants ──────────────────────────────────────────────────────────── */
  var CONSULTATION_SESSION_KEY = 'av_consultation_shown';
  var CONSULTATION_HIDDEN_KEY  = 'av_consultation_hidden';
  var CONSULTATION_DELAY_MS    = 90000; // 90 seconds

  var KEY_SENTINEL = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';

  var toastTimer;
  var popupTimer;

  /* ── Utilities ──────────────────────────────────────────────────────────── */
  function qs(sel, scope) { return (scope || document).querySelector(sel); }
  function qsa(sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); }
  function escAttr(s) { return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  /** Config injected by BaseLayout. public/ never sees Astro, so <meta> is the bridge. */
  function meta(name) {
    var el = qs('meta[name="' + name + '"]');
    return el ? el.content : '';
  }

  /**
   * Storage access throws outright in some contexts — Safari with cross-site
   * tracking restrictions, Chrome with site data blocked, some embedded
   * webviews. Every call in this file used to be unguarded, so one throw during
   * init took the consultation modal down with it, form included. Same pattern
   * as compare.astro.
   */
  function storeGet(store, key) {
    try { return window[store].getItem(key); } catch (e) { return null; }
  }
  function storeSet(store, key, value) {
    try { window[store].setItem(key, value); } catch (e) { /* non-fatal */ }
  }

  /* ── Bootstrap ──────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectModals();
    injectUtilities();
    bindGlobalEvents();
    initRevealAnimations();
    initConsultationPopup();
    initPartnerForm();
    initNewsletterForm();
    prefillFromQuery();
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * FORM SUBMISSION
   *
   * Every form on this site used to preventDefault(), reset, and show a
   * success message without sending anything anywhere. This is the one path
   * they all now go through.
   *
   * Three rules it exists to enforce:
   *   1. Nothing is called a success unless the relay returned 2xx.
   *   2. Nothing is sent that has not passed validation. Every form here
   *      carries `novalidate` and none of them used to validate in JS either,
   *      so an entirely empty submission was accepted.
   *   3. On failure the form is NOT reset. The user's typing is the only copy
   *      of that lead; clearing it loses what the relay just failed to take.
   * ──────────────────────────────────────────────────────────────────────── */

  /**
   * @param form     the <form> element
   * @param opts     { formName, subject, extra, successMessage, onSuccess }
   *                 `extra` is merged over the form's own named fields — used
   *                 for state the markup does not hold, e.g. the consultation
   *                 date/time/mode.
   */
  function submitForm(form, opts) {
    opts = opts || {};

    /* Re-entrancy guard on the form, not the button.
       Disabling the submit button stops a second *click*, but not Enter pressed
       in a text field and not requestSubmit() — both submit a form whose button
       is disabled. Without this flag a fast double-submit fires two requests,
       and the second call captures "Sending…" as the button's original label,
       so the first call's restore() puts "Sending…" back permanently. */
    if (form.dataset.sending === 'true') return;

    /* Native constraint validation. The markup already declares required /
       type=email / type=tel on every field that needs it; reportValidity gives
       us those messages, localised and accessible, for one line. */
    if (!form.reportValidity()) return;

    var endpoint = meta('w3f-endpoint');
    var key      = meta('w3f-key');

    var btn = form.querySelector('[type="submit"]');
    /* Stored once, on the element. A local variable would be re-captured on
       every call; this cannot be overwritten by an in-flight label. */
    if (btn && btn.dataset.label === undefined) btn.dataset.label = btn.innerHTML;

    form.dataset.sending = 'true';

    function restore() {
      form.dataset.sending = 'false';
      if (!btn) return;
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.innerHTML = btn.dataset.label;
    }

    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Sending…';
    }

    var payload = {};
    new FormData(form).forEach(function (value, name) { payload[name] = value; });
    Object.keys(opts.extra || {}).forEach(function (k) { payload[k] = opts.extra[k]; });

    payload.access_key  = key;
    payload.subject     = opts.subject || 'Website enquiry — Platizio Alternatives';
    payload.from_name   = 'Platizio Alternatives website';
    payload.form_name   = opts.formName || 'unknown';
    payload.source_page = window.location.pathname;
    if (payload.email) payload.replyto = payload.email;
    /* Honeypot. FormData only carries a checkbox when it is checked, so an
       absent botcheck means a human; send it empty so the field is always
       present for the relay to judge. */
    if (!('botcheck' in payload)) payload.botcheck = '';

    if (!endpoint || !key || key === KEY_SENTINEL) {
      /* Refuse to pretend. Better a visible failure with a phone number than a
         thank-you modal for a submission that went nowhere — that was the bug. */
      console.warn('[forms] No Web3Forms access key configured; submission not sent.');
      restore();
      showFormFailure(form, payload);
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Relay returned ' + res.status);
        /* Web3Forms carries its own verdict in the body, and their reference
           snippet checks that rather than the status — so a 200 is necessary
           but not sufficient. Parse failures are tolerated: a 200 we cannot
           read is still a delivered submission, and calling it a failure would
           push the user to re-send something that already arrived. */
        return res.json().then(
          function (json) {
            if (json && json.success === false) {
              throw new Error(json.message || 'Relay rejected the submission');
            }
          },
          function () { /* body was not JSON; trust the 200 */ }
        );
      })
      .then(function () {
        form.reset();
        if (typeof opts.onSuccess === 'function') opts.onSuccess();
        showThankYouModal(opts.successMessage);
      })
      .catch(function (err) {
        console.error('[forms] Submission failed:', err);
        showFormFailure(form, payload);       // form deliberately left populated
      })
      .then(restore);                          // runs on both paths
  }

  /**
   * Failure surface. Carries the two routes that do not depend on this site
   * working: a phone call and WhatsApp, both prefilled with what they typed so
   * the lead survives the outage.
   */
  function showFormFailure(form, payload) {
    var phone     = meta('site-phone') || '';
    var phoneHref = meta('site-phone-href') || '';
    /* wa.me takes digits only — telephoneHref is +91…, so strip everything else. */
    var waNumber  = phoneHref.replace(/\D/g, '');

    var summary = ['Hello, my enquiry form on the website did not go through.'];
    ['name', 'email', 'phone', 'city', 'fund_interest', 'interest_detail', 'arn_number', 'business_name', 'message']
      .forEach(function (f) { if (payload[f]) summary.push(f.replace(/_/g, ' ') + ': ' + payload[f]); });

    var waHref = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(summary.join('\n'));

    qs('#formfail-phone') && (qs('#formfail-phone').href = 'tel:' + phoneHref);
    qs('#formfail-phone-label') && (qs('#formfail-phone-label').textContent = phone);
    qs('#formfail-whatsapp') && (qs('#formfail-whatsapp').href = waHref);

    var modal = qs('#formfail-modal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('av-modal-open');
  }

  function closeFormFailure() {
    var modal = qs('#formfail-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('av-modal-open');
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * MODAL HTML INJECTION
   * ──────────────────────────────────────────────────────────────────────── */
  function injectModals() {
    var host = qs('#site-modals');
    if (!host) {
      host = document.createElement('div');
      host.id = 'site-modals';
      document.body.appendChild(host);
    }

    host.innerHTML = [
      /* ── Investor Enquiry Modal ── */
      '<div class="av-modal" id="investor-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="im-title">',
        '<div class="av-modal-card">',
          '<button class="av-modal-close" id="investor-modal-close" type="button" aria-label="Close">&times;</button>',
          '<p class="av-modal-eyebrow">Investor Enquiry</p>',
          '<h2 class="av-modal-title" id="im-title">Start Your Investment Journey</h2>',
          '<p class="av-modal-subtitle">Share a few details and our advisors will help you explore the right PMS, AIF, or alternative investment opportunities suited to your profile.</p>',
          '<form id="investor-form" class="av-form-grid" novalidate>',
            '<div class="av-field">',
              '<label for="investor-name">Full Name <span class="av-required">*</span></label>',
              '<input id="investor-name" name="name" type="text" placeholder="Your full name" required autocomplete="name" />',
            '</div>',
            '<div class="av-field">',
              '<label for="investor-email">Email Address <span class="av-required">*</span></label>',
              '<input id="investor-email" name="email" type="email" placeholder="you@domain.com" required autocomplete="email" />',
            '</div>',
            '<div class="av-field">',
              '<label for="investor-phone">Contact Number <span class="av-required">*</span></label>',
              '<input id="investor-phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" required autocomplete="tel" />',
            '</div>',
            '<div class="av-field">',
              '<label for="investor-occupation">Occupation</label>',
              '<select id="investor-occupation" name="occupation">',
                '<option value="">Select occupation</option>',
                '<option>Professional / Salaried</option>',
                '<option>Business Owner</option>',
                '<option>Retired</option>',
                '<option>Other</option>',
              '</select>',
            '</div>',
            '<div class="av-field">',
              '<label for="investor-city">City of Residence</label>',
              '<input id="investor-city" name="city" type="text" placeholder="Mumbai" autocomplete="address-level2" />',
            '</div>',
            '<div class="av-field">',
              '<label for="investor-fund">Investment Interest</label>',
              '<select id="investor-fund" name="fund_interest">',
                '<option value="">Select type</option>',
                '<option value="PMS">PMS</option>',
                '<option value="AIF">AIF</option>',
                '<option value="Both">PMS + AIF</option>',
                '<option value="Other">Other</option>',
              '</select>',
            '</div>',
            '<div class="av-field av-field--full">',
              '<label for="investor-amc">Specific Fund or AMC</label>',
              '<input id="investor-amc" name="interest_detail" type="text" placeholder="Optional — name a specific fund or AMC" />',
            '</div>',
            /* Honeypot. Hidden from people, tempting to bots; the relay rejects
               any submission that arrives with it filled. */
            '<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none" />',
            '<div class="av-field av-field--full">',
              '<label class="av-consent">',
                '<input id="investor-consent" name="consent" type="checkbox" required />',
                '<span>I hereby give my consent to receive calls, WhatsApp messages, SMS and e-mails from Platizio Services LLP regarding my enquiry.</span>',
              '</label>',
            '</div>',
            '<div class="av-field av-field--full">',
              '<button class="av-btn-submit" type="submit">',
                'Submit Enquiry',
                '<span class="material-symbols-outlined">arrow_forward</span>',
              '</button>',
            '</div>',
          '</form>',
          '<p class="av-modal-disclaimer">We respect your privacy. Your details are used only to respond to your enquiry and are never sold.</p>',
        '</div>',
      '</div>',

      /* ── Consultation Booking Popup ── */
      '<div class="av-modal av-modal--consultation" id="consultation-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="cm-title">',
        '<div class="av-modal-card av-consultation-card">',
          '<button class="av-modal-close" id="consultation-modal-close" type="button" aria-label="Close">&times;</button>',
          '<div class="av-consultation-header">',
            '<span class="material-symbols-outlined av-consultation-icon">calendar_month</span>',
            '<h2 id="cm-title">Book A Call &amp; Get Expert Investment Guidance</h2>',
            '<p>Choose a time that works for you and our advisors will connect with you personally.</p>',
          '</div>',
          '<form id="consultation-form" class="av-consultation-form" novalidate>',
            '<div class="av-consultation-top-grid">',
              '<div class="av-field">',
                '<label class="sr-only" for="consultation-name">Your Name</label>',
                '<input id="consultation-name" name="name" type="text" placeholder="Your name" required autocomplete="name" />',
              '</div>',
              '<div class="av-field">',
                '<label class="sr-only" for="consultation-email">Your Email</label>',
                '<input id="consultation-email" name="email" type="email" placeholder="Your email" required autocomplete="email" />',
              '</div>',
              '<div class="av-field">',
                '<label class="sr-only" for="consultation-phone">Your Phone</label>',
                '<input id="consultation-phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" required autocomplete="tel" />',
              '</div>',
            '</div>',
            '<div class="av-consultation-section">',
              '<h3>Let\'s have a quick call on!</h3>',
              '<div class="av-date-grid" id="consultation-date-grid"></div>',
            '</div>',
            '<div class="av-consultation-section">',
              '<h3>What time works for you? <small>(IST)</small></h3>',
              '<div class="av-time-grid" id="consultation-time-grid"></div>',
            '</div>',
            '<div class="av-consultation-section">',
              '<h3>Preferred Communication Mode</h3>',
              '<div class="av-mode-grid" id="consultation-mode-grid"></div>',
            '</div>',
            '<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none" />',
            '<label class="av-consent">',
              '<input id="consultation-consent" name="consent" type="checkbox" required />',
              '<span>I hereby give my consent to receive calls, WhatsApp messages, SMS and e-mails from Platizio Services LLP regarding my investment consultation.</span>',
            '</label>',
            '<div class="av-consultation-actions">',
              '<button class="av-consultation-submit" type="submit">',
                '<span class="material-symbols-outlined">event_available</span>',
                'Confirm Booking',
              '</button>',
            '</div>',
            '<button class="av-consultation-suppress" id="consultation-suppress" type="button">',
              'Don\'t show this again',
            '</button>',
          '</form>',
        '</div>',
      '</div>',

      /* ── Thank You Modal ── */
      '<div class="av-modal av-modal--thankyou" id="thankyou-modal" aria-hidden="true" role="dialog" aria-modal="true">',
        '<div class="av-modal-card av-thankyou-card">',
          '<button class="av-modal-close" id="thankyou-close" type="button" aria-label="Close">&times;</button>',
          '<div class="av-thankyou-icon">',
            '<span class="material-symbols-outlined">check_circle</span>',
          '</div>',
          '<h2 class="av-thankyou-title">Thank You</h2>',
          '<p class="av-thankyou-message" id="thankyou-message">We have received your details and will be in touch shortly.</p>',
          '<button class="av-thankyou-btn" id="thankyou-dismiss" type="button">Close</button>',
        '</div>',
      '</div>',

      /* ── Submission Failure ──
         A separate modal rather than a reworded thank-you: the tick and the
         word "Thank You" are exactly wrong here, and conflating the two is how
         a failure gets reported as a success. The form behind this stays
         populated, so "Try again" costs the user nothing. */
      '<div class="av-modal av-modal--failure" id="formfail-modal" aria-hidden="true" role="alertdialog" aria-modal="true" aria-labelledby="ff-title">',
        '<div class="av-modal-card av-thankyou-card">',
          '<button class="av-modal-close" id="formfail-close" type="button" aria-label="Close">&times;</button>',
          '<div class="av-thankyou-icon av-failure-icon">',
            '<span class="material-symbols-outlined">error</span>',
          '</div>',
          '<h2 class="av-thankyou-title" id="ff-title">We could not send that</h2>',
          '<p class="av-thankyou-message">Your details are still in the form behind this message, so nothing is lost — close this and try again. If it keeps failing, reach us directly and we will pick it up from there.</p>',
          '<div class="av-failure-actions">',
            '<a class="av-failure-btn" id="formfail-phone" href="tel:">',
              '<span class="material-symbols-outlined">call</span>',
              '<span id="formfail-phone-label"></span>',
            '</a>',
            '<a class="av-failure-btn av-failure-btn--wa" id="formfail-whatsapp" href="#" target="_blank" rel="noopener">',
              '<span class="material-symbols-outlined">chat</span>',
              'Send on WhatsApp',
            '</a>',
          '</div>',
          '<button class="av-thankyou-btn" id="formfail-dismiss" type="button">Try again</button>',
        '</div>',
      '</div>'
    ].join('');
  }

  function injectUtilities() {
    if (!qs('#site-toast')) {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="av-toast" id="site-toast" aria-live="polite" aria-atomic="true">' +
          '<strong id="site-toast-title"></strong>' +
          '<span id="site-toast-message"></span>' +
        '</div>'
      );
    }
    if (!qs('#scroll-to-top')) {
      document.body.insertAdjacentHTML('beforeend',
        '<button id="scroll-to-top" class="av-scroll-top" type="button" aria-label="Back to top" title="Back to top">' +
          '<span class="material-symbols-outlined">keyboard_arrow_up</span>' +
        '</button>'
      );
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * GLOBAL EVENT BINDING
   * ──────────────────────────────────────────────────────────────────────── */
  function bindGlobalEvents() {
    /* Open investor modal via any .js-open-consult button */
    qsa('.js-open-consult').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openInvestorModal({
          fundType:      btn.dataset.fund   || '',
          interestDetail: btn.dataset.detail || btn.dataset.amc || ''
        });
      });
    });

    /* Investor modal */
    qs('#investor-modal-close')?.addEventListener('click', closeInvestorModal);
    qs('#investor-modal')?.addEventListener('click', function (e) {
      if (e.target === qs('#investor-modal')) closeInvestorModal();
    });
    qs('#investor-form')?.addEventListener('submit', handleInvestorSubmit);

    /* Consultation modal */
    qs('#consultation-modal-close')?.addEventListener('click', closeConsultationModal);
    qs('#consultation-modal')?.addEventListener('click', function (e) {
      if (e.target === qs('#consultation-modal')) closeConsultationModal();
    });
    qs('#consultation-form')?.addEventListener('submit', handleConsultationSubmit);
    qs('#consultation-suppress')?.addEventListener('click', function () {
      storeSet('localStorage', CONSULTATION_HIDDEN_KEY, 'true');
      closeConsultationModal();
    });

    /* Thank you modal */
    qs('#thankyou-close')?.addEventListener('click', closeThankYouModal);
    qs('#thankyou-dismiss')?.addEventListener('click', closeThankYouModal);
    qs('#thankyou-modal')?.addEventListener('click', function (e) {
      if (e.target === qs('#thankyou-modal')) closeThankYouModal();
    });

    /* Submission failure modal. "Try again" only dismisses — the form behind it
       is still populated, which is the whole point. */
    qs('#formfail-close')?.addEventListener('click', closeFormFailure);
    qs('#formfail-dismiss')?.addEventListener('click', closeFormFailure);
    qs('#formfail-modal')?.addEventListener('click', function (e) {
      if (e.target === qs('#formfail-modal')) closeFormFailure();
    });

    /* Escape key closes any open modal */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeFormFailure();
      closeInvestorModal();
      closeConsultationModal();
      closeThankYouModal();
    });

    /* Scroll to top */
    window.addEventListener('scroll', function () {
      var btn = qs('#scroll-to-top');
      if (btn) btn.classList.toggle('is-visible', window.scrollY > 320);
    }, { passive: true });
    qs('#scroll-to-top')?.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * INVESTOR MODAL
   * ──────────────────────────────────────────────────────────────────────── */
  function openInvestorModal(prefill) {
    prefill = prefill || {};
    var modal = qs('#investor-modal');
    if (!modal) return;
    if (prefill.fundType) {
      var sel = qs('#investor-fund');
      if (sel) sel.value = prefill.fundType;
    }
    if (prefill.interestDetail) {
      var inp = qs('#investor-amc');
      if (inp) inp.value = prefill.interestDetail;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('av-modal-open');
    var firstInput = qs('input', modal);
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }

  function closeInvestorModal() {
    var modal = qs('#investor-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('av-modal-open');
  }

  function handleInvestorSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var name = (qs('#investor-name') || {}).value || '';
    submitForm(form, {
      formName: 'investor-enquiry',
      subject: 'New investor enquiry' + (name ? ' — ' + name : ''),
      successMessage: 'We have received your enquiry and our advisory team will reach out to you within 24 hours.',
      /* Closing on success only. Closing first, as this used to, hides the
         failure state behind a modal the user can no longer see. */
      onSuccess: closeInvestorModal
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * CONSULTATION POPUP
   * ──────────────────────────────────────────────────────────────────────── */
  function initConsultationPopup() {
    var modal = qs('#consultation-modal');
    if (!modal) return;

    var state = { date: '', time: '', mode: '' };
    modal._av_state = state;

    var dateOptions = buildDates();
    var timeOptions = [
      { value: '10:30 AM', label: '10:30 AM' },
      { value: '11:30 AM', label: '11:30 AM' },
      { value: '12:30 PM', label: '12:30 PM' },
      { value: '01:30 PM', label: '01:30 PM' },
      { value: '02:30 PM', label: '02:30 PM' },
      { value: '03:30 PM', label: '03:30 PM' },
      { value: '04:30 PM', label: '04:30 PM' },
      { value: '05:30 PM', label: '05:30 PM' }
    ];
    var modeOptions = [
      { value: 'Phone Call',   icon: 'phone_in_talk',       label: 'Phone Call'   },
      { value: 'Google Meet',  icon: 'video_camera_front',  label: 'Google Meet'  },
      { value: 'Zoom Call',    icon: 'duo',                 label: 'Zoom Call'    },
      { value: 'WhatsApp',     icon: 'chat_bubble',         label: 'WhatsApp'     }
    ];

    function renderGrid(hostId, options, activeVal, attrKey, cardClass) {
      var host = qs('#' + hostId);
      if (!host) return;
      host.innerHTML = options.map(function (opt) {
        var active = (activeVal === opt.value) ? ' is-active' : '';
        var iconHtml = opt.icon ? '<span class="material-symbols-outlined">' + opt.icon + '</span>' : '';
        var bodyHtml = opt.day
          ? '<span class="av-day">' + opt.day + '</span><strong>' + opt.date + '</strong><span class="av-month">' + opt.month + '</span>'
          : '<span>' + escAttr(opt.label || opt.value) + '</span>';
        return '<button class="' + cardClass + active + '" type="button" data-val="' + escAttr(opt.value) + '">' + iconHtml + bodyHtml + '</button>';
      }).join('');

      qsa('button', host).forEach(function (btn) {
        btn.addEventListener('click', function () {
          state[attrKey] = btn.dataset.val;
          render();
        });
      });
    }

    function render() {
      renderGrid('consultation-date-grid', dateOptions, state.date, 'date', 'av-date-card');
      renderGrid('consultation-time-grid', timeOptions,  state.time, 'time', 'av-time-card');
      renderGrid('consultation-mode-grid', modeOptions,  state.mode, 'mode', 'av-mode-card');
    }

    modal._av_render = render;
    render();

    /* 90-second auto-trigger */
    if (storeGet('localStorage', CONSULTATION_HIDDEN_KEY) === 'true' ||
        storeGet('sessionStorage', CONSULTATION_SESSION_KEY) === 'true') return;

    function startTimer() {
      clearTimeout(popupTimer);
      if (document.hidden) return;
      if (storeGet('sessionStorage', CONSULTATION_SESSION_KEY) === 'true') return;
      if (storeGet('localStorage', CONSULTATION_HIDDEN_KEY) === 'true') return;
      popupTimer = setTimeout(function () {
        if (!document.hidden) openConsultationModal();
      }, CONSULTATION_DELAY_MS);
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
      window.addEventListener(evt, startTimer, { passive: true, once: false });
    });
    document.addEventListener('visibilitychange', function () {
      document.hidden ? clearTimeout(popupTimer) : startTimer();
    });
    startTimer();
  }

  function buildDates() {
    var fDay   = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
    var fDate  = new Intl.DateTimeFormat('en-IN', { day: '2-digit' });
    var fMonth = new Intl.DateTimeFormat('en-IN', { month: 'short' });
    return Array.from({ length: 8 }, function (_, i) {
      var d = new Date();
      d.setDate(d.getDate() + i + 1);
      return { value: d.toISOString(), day: fDay.format(d), date: fDate.format(d), month: fMonth.format(d) };
    });
  }

  function openConsultationModal() {
    var modal = qs('#consultation-modal');
    if (!modal) return;
    if (modal._av_render) modal._av_render();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('av-modal-open');
    storeSet('sessionStorage', CONSULTATION_SESSION_KEY, 'true');
  }

  function closeConsultationModal() {
    var modal = qs('#consultation-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('av-modal-open');
  }

  function handleConsultationSubmit(e) {
    e.preventDefault();
    var modal = qs('#consultation-modal');
    var state = modal && modal._av_state;
    var consent = qs('#consultation-consent');

    if (!state || !state.date || !state.time || !state.mode) {
      showToast('Incomplete Booking', 'Please select a preferred date, time, and communication mode to continue.');
      return;
    }
    if (!consent || !consent.checked) {
      showToast('Consent Required', 'Please provide consent so our team can connect with you regarding the consultation.');
      return;
    }

    var form = e.currentTarget;

    /* state.date holds d.toISOString() from buildDates(), so sending it raw
       would put "2026-08-21T04:33:12.345Z" in the booking email. Format it. */
    var pretty = state.date;
    try {
      pretty = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(state.date));
    } catch (err) { /* keep the raw value rather than lose the booking */ }

    var name = (qs('#consultation-name') || {}).value || '';

    submitForm(form, {
      formName: 'consultation',
      subject: 'Consultation booking' + (name ? ' — ' + name : '') + ' · ' + pretty + ' ' + state.time,
      extra: {
        preferred_date: pretty,
        preferred_time: state.time + ' IST',
        preferred_mode: state.mode
      },
      successMessage: 'Your consultation request has been sent. Our advisory team will confirm the slot with you shortly.',
      onSuccess: function () {
        state.date = ''; state.time = ''; state.mode = '';
        if (modal._av_render) modal._av_render();
        closeConsultationModal();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * PARTNER FORM
   * ──────────────────────────────────────────────────────────────────────── */
  function initPartnerForm() {
    var form = qs('#partner-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (qs('#partner-name') || {}).value || '';
      var arn  = (qs('#partner-arn') || {}).value || '';
      submitForm(form, {
        formName: 'partner-registration',
        subject: 'Distributor registration' + (name ? ' — ' + name : '') + (arn ? ' (' + arn + ')' : ''),
        successMessage: 'Thank you for your application. Our executive partnership team will review your details and respond within 2 business days.'
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * NEWSLETTER
   *
   * The form on /media had no action, no method and no handler, so the browser
   * default applied: a GET to the current URL. The subscriber's address ended
   * up in /media?email=..., i.e. in their history, in the Referer header of
   * every subsequent request and in the host's access logs — directly beneath
   * the line "We do not share your address with third parties". And nothing
   * was ever subscribed.
   * ──────────────────────────────────────────────────────────────────────── */
  function initNewsletterForm() {
    var form = qs('#newsletter-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitForm(form, {
        formName: 'newsletter',
        subject: 'Newsletter signup',
        successMessage: 'You are on the list. We will email you when we publish new research or video commentary.'
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * THANK YOU MODAL
   * ──────────────────────────────────────────────────────────────────────── */
  function showThankYouModal(message) {
    var modal = qs('#thankyou-modal');
    var msgEl = qs('#thankyou-message');
    if (!modal) return;
    if (msgEl && message) msgEl.textContent = message;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('av-modal-open');
  }

  function closeThankYouModal() {
    var modal = qs('#thankyou-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('av-modal-open');
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * TOAST NOTIFICATIONS
   * ──────────────────────────────────────────────────────────────────────── */
  function showToast(title, message) {
    var toast    = qs('#site-toast');
    var titleEl  = qs('#site-toast-title');
    var messageEl = qs('#site-toast-message');
    if (!toast || !titleEl || !messageEl) return;
    titleEl.textContent   = title;
    messageEl.textContent = message;
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-open'); }, 3200);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * SCROLL REVEAL ANIMATIONS
   * ──────────────────────────────────────────────────────────────────────── */
  function initRevealAnimations() {
    var nodes = qsa('[data-reveal]');
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    nodes.forEach(function (n) { observer.observe(n); });
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * QUERY PARAMETER PRE-FILL
   * ──────────────────────────────────────────────────────────────────────── */
  function prefillFromQuery() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('enquire') === 'true') {
      openInvestorModal({
        fundType:      params.get('fundType') || '',
        interestDetail: params.get('interest') || ''
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * PUBLIC API (accessible from inline onclick / other scripts)
   * ──────────────────────────────────────────────────────────────────────── */
  window.avSite = {
    openInvestorModal:     openInvestorModal,
    openConsultationModal: function () { openConsultationModal(); },
    showToast:             showToast,
    showThankYouModal:     showThankYouModal
  };

})();
