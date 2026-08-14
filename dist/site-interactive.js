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

  var toastTimer;
  var popupTimer;

  /* ── Utilities ──────────────────────────────────────────────────────────── */
  function qs(sel, scope) { return (scope || document).querySelector(sel); }
  function qsa(sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); }
  function escAttr(s) { return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  /* ── Bootstrap ──────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectModals();
    injectUtilities();
    bindGlobalEvents();
    initRevealAnimations();
    initConsultationPopup();
    initPartnerForm();
    prefillFromQuery();
  });

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
      localStorage.setItem(CONSULTATION_HIDDEN_KEY, 'true');
      closeConsultationModal();
    });

    /* Thank you modal */
    qs('#thankyou-close')?.addEventListener('click', closeThankYouModal);
    qs('#thankyou-dismiss')?.addEventListener('click', closeThankYouModal);
    qs('#thankyou-modal')?.addEventListener('click', function (e) {
      if (e.target === qs('#thankyou-modal')) closeThankYouModal();
    });

    /* Escape key closes any open modal */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
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
    closeInvestorModal();
    form.reset();
    showThankYouModal('We have received your enquiry and our advisory team will reach out to you within 24 hours.');
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
    if (localStorage.getItem(CONSULTATION_HIDDEN_KEY) === 'true' ||
        sessionStorage.getItem(CONSULTATION_SESSION_KEY) === 'true') return;

    function startTimer() {
      clearTimeout(popupTimer);
      if (document.hidden) return;
      if (sessionStorage.getItem(CONSULTATION_SESSION_KEY) === 'true') return;
      if (localStorage.getItem(CONSULTATION_HIDDEN_KEY) === 'true') return;
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
    sessionStorage.setItem(CONSULTATION_SESSION_KEY, 'true');
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
    state.date = ''; state.time = ''; state.mode = '';
    form.reset();
    if (modal._av_render) modal._av_render();
    closeConsultationModal();
    showToast('Consultation Confirmed', 'Your booking has been recorded. Our advisory team will contact you shortly.');
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * PARTNER FORM
   * ──────────────────────────────────────────────────────────────────────── */
  function initPartnerForm() {
    var form = qs('#partner-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.reset();
      showThankYouModal('Thank you for your application. Our executive partnership team will review your details and respond within 2 business days.');
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
