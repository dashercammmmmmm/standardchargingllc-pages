// Legacy helper retained for older static pages only.
// Current Standard Charging public pages are inquiry-first and should not expose checkout flows.
(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('leadForm');
  const msg = document.getElementById('leadMsg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = window.STANDARD_CHARGING_CONFIG?.contactEmail || 'cam@standardchargingllc.com';
    const subject = encodeURIComponent('Standard Charging Website Inquiry');
    const body = encodeURIComponent(
      `Name: ${data.get('name') || ''}\nEmail: ${data.get('email') || ''}\nCompany: ${data.get('company') || ''}\nRole: ${data.get('role') || ''}\n\nMessage:\n${data.get('message') || ''}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    if (msg) msg.textContent = 'Opening email draft...';
  });
})();
