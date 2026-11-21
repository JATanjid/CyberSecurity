/* Shared submit popup for CHCS forms: "Building…" → "Submitting…" → "Submitted successfully".
   Usage: CHCSPopup.building(); CHCSPopup.submitting(); CHCSPopup.done(); CHCSPopup.hide(); */
(function () {
  'use strict';
  var el = null;
  function ensure() {
    if (el) return el;
    var css = document.createElement('style');
    css.textContent = '.chcs-pop{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(15,18,45,.6);font-family:Inter,Arial,Helvetica,sans-serif}' +
      '.chcs-pop.open{display:flex}.chcs-pop__card{background:#fff;border-radius:20px;padding:28px 36px;min-width:250px;max-width:90vw;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.3)}' +
      '.chcs-pop__spin{width:40px;height:40px;border-radius:50%;border:3px solid #e4e6f1;border-top-color:#5a62b5;margin:0 auto;animation:chcsspin .8s linear infinite}' +
      '.chcs-pop__ok{width:56px;height:56px;border-radius:50%;background:#1f8a5b;color:#fff;display:grid;place-items:center;margin:0 auto;font-size:28px}' +
      '.chcs-pop__title{font-size:18px;font-weight:700;color:#151a3b;margin-top:14px}.chcs-pop__sub{font-size:14px;color:#6b7194;margin-top:6px}' +
      '@keyframes chcsspin{to{transform:rotate(360deg)}}';
    document.head.appendChild(css);
    el = document.createElement('div');
    el.className = 'chcs-pop'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-live', 'assertive');
    el.setAttribute('data-html2canvas-ignore', 'true');
    document.body.appendChild(el);
    return el;
  }
  function show(icon, title, sub) {
    var e = ensure();
    e.innerHTML = '<div class="chcs-pop__card">' + icon + '<div class="chcs-pop__title"></div>' + (sub ? '<div class="chcs-pop__sub"></div>' : '') + '</div>';
    e.querySelector('.chcs-pop__title').textContent = title;
    if (sub) e.querySelector('.chcs-pop__sub').textContent = sub;
    e.classList.add('open');
  }
  var timer = null;
  window.CHCSPopup = {
    building: function (sub) { clearTimeout(timer); show('<div class="chcs-pop__spin"></div>', 'Building…', sub || 'Preparing your document. Please keep this page open.'); },
    submitting: function (sub) { clearTimeout(timer); show('<div class="chcs-pop__spin"></div>', 'Submitting…', sub || 'Please keep this page open.'); },
    done: function (sub, ms) { clearTimeout(timer); show('<div class="chcs-pop__ok">✓</div>', 'Submitted successfully', sub || ''); timer = setTimeout(window.CHCSPopup.hide, ms || 2200); },
    hide: function () { clearTimeout(timer); if (el) el.classList.remove('open'); }
  };
})();
