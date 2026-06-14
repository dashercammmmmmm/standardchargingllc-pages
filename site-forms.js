(function () {
  const defaultEndpoint = 'https://formsubmit.co/ajax/cam@standardchargingllc.com';
  const defaultEmail = 'cam@standardchargingllc.com';

  function statusFor(form) {
    const id = form.getAttribute('aria-describedby');
    if (id) return document.getElementById(id);
    return form.querySelector('[data-form-status]');
  }

  function setStatus(form, message) {
    const target = statusFor(form);
    if (target) target.textContent = message;
  }

  function fieldLabel(field) {
    const ariaLabel = field.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    const labelledBy = field.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelText = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((node) => node.textContent.trim())
        .join(' ')
        .trim();
      if (labelText) return labelText;
    }

    const explicitLabel = field.id ? document.querySelector(`label[for="${CSS.escape(field.id)}"]`) : null;
    const label = explicitLabel || field.closest('label');
    if (label) {
      const clone = label.cloneNode(true);
      clone.querySelectorAll('input, textarea, select, button').forEach((node) => node.remove());
      const text = clone.textContent.replace(/\s+/g, ' ').trim();
      if (text) return text;
    }

    return field.name || 'A required field';
  }

  function missingRequiredFields(form) {
    return Array.from(form.querySelectorAll('input[required], textarea[required], select[required]'))
      .filter((field) => !field.disabled && field.type !== 'hidden')
      .filter((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') return !field.checked;
        return !String(field.value || '').trim();
      })
      .map((field) => ({ field, label: fieldLabel(field) }));
  }

  function setHiddenField(form, name, value) {
    let field = form.querySelector(`input[type="hidden"][name="${CSS.escape(name)}"]`);
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  }

  function clearHiddenField(form, name) {
    const field = form.querySelector(`input[type="hidden"][name="${CSS.escape(name)}"]`);
    if (field) field.remove();
  }

  function confirmMissingFields(form) {
    const missing = missingRequiredFields(form);
    if (!missing.length) {
      clearHiddenField(form, 'missing_fields_user_confirmed');
      return true;
    }

    const labels = missing.map((item) => item.label);
    const message = `Some fields are blank:\n\n- ${labels.join('\n- ')}\n\nSubmit anyway?`;
    const ok = window.confirm(message);
    if (!ok) {
      setStatus(form, `Please complete: ${labels.join(', ')}.`);
      missing[0].field.focus({ preventScroll: false });
      return false;
    }

    setHiddenField(form, 'missing_fields_user_confirmed', labels.join(', '));
    return true;
  }

  async function submitForm(form) {
    const endpoint = form.dataset.endpoint || form.getAttribute('action') || defaultEndpoint;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      let detail = '';
      try {
        const json = await response.json();
        detail = json && json.message ? ` ${json.message}` : '';
      } catch (_) {}
      throw new Error(`Form delivery failed.${detail}`);
    }
  }

  function bindForms() {
    document.querySelectorAll('form[data-email-form]').forEach((form) => {
      if (form.dataset.emailFormBound === 'true') return;
      form.dataset.emailFormBound = 'true';
      form.noValidate = true;
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!confirmMissingFields(form)) return;
        setStatus(form, 'Sending…');
        try {
          await submitForm(form);
          const next = form.querySelector('input[type="hidden"][name="_next"]')?.value;
          form.reset();
          setStatus(form, 'Thanks — your message was sent.');
          if (next) window.location.href = next;
        } catch (error) {
          setStatus(form, `Could not send from the page yet. Please email ${defaultEmail}.`);
          console.error(error);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindForms);
  } else {
    bindForms();
  }
})();
