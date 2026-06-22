(function () {
  'use strict';

  var config = window.STANDARD_CHARGING_CONFIG || {};
  var consent = config.cookieConsent || {};
  var storageKey = 'standard-charging-cookie-consent-v1';

  if (!consent.enabled) return;
  if (window.localStorage && window.localStorage.getItem(storageKey)) return;

  function save(choice) {
    var value = {
      choice: choice,
      analytics: choice === 'accept' && consent.analyticsEnabled === true,
      marketing: choice === 'accept' && consent.marketingEnabled === true,
      savedAt: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('standardChargingConsentUpdated', { detail: value }));
    if (banner) banner.remove();
  }

  var banner = document.createElement('section');
  banner.className = 'sc-cookie-consent';
  banner.setAttribute('aria-label', 'Cookie preferences');
  banner.innerHTML = [
    '<h2>Cookie preferences</h2>',
    '<p>Standard Charging uses essential site storage only by default. If analytics or advertising tools are enabled later, they will stay off until you choose to allow them. Read our <a href="/privacy.html">privacy policy</a>.</p>',
    '<div class="sc-cookie-actions">',
    '<button type="button" data-cookie-action="reject">Keep essential only</button>',
    '<button type="button" data-cookie-action="accept">Allow analytics</button>',
    '</div>'
  ].join('');

  banner.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-cookie-action]');
    if (!button) return;
    save(button.getAttribute('data-cookie-action'));
  });

  function mount() {
    document.body.appendChild(banner);
    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
