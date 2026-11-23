/* CHCS form theme helper.
 * 1) Turns on the screen theme (chcs-form-theme.css).
 * 2) Keeps PDFs identical: while html2canvas captures a page, <html> gets class
 *    "chcs-capturing", which switches every theme and phone-fit rule off, so the
 *    captured pages use the form's original look.
 * 3) On phones, fixed-size paper pages are scaled to fit the screen, with a
 *    "Fit to screen / Actual size" toggle.
 * Usage: <script src="chcs-form-theme.js" data-form="duty" data-page=".sheet"></script>
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var form = (me && me.getAttribute('data-form')) || '';
  var pageSel = (me && me.getAttribute('data-page')) || '';
  var root = document.documentElement;
  root.classList.add('chcs-themed');
  root.setAttribute('data-chcs-form', form);
  if (/[?&]portal=1/.test(location.search) || (window.parent !== window && document.referrer.indexOf(location.origin) === 0)) root.classList.add('chcs-in-portal');

  // Brand font (falls back to system fonts offline).
  if (!document.querySelector('link[data-chcs-font]')) {
    var lf = document.createElement('link');
    lf.rel = 'stylesheet'; lf.setAttribute('data-chcs-font', '1');
    lf.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(lf);
  }

  /* ---------- 2) capture guard around html2canvas ---------- */
  var depth = 0, offTimer = null;
  function captureOn() { clearTimeout(offTimer); depth++; root.classList.add('chcs-capturing'); void root.offsetHeight; }
  function captureOff() { depth = Math.max(0, depth - 1); if (!depth) offTimer = setTimeout(function () { if (!depth) root.classList.remove('chcs-capturing'); }, 350); }
  function wrap() {
    var orig = window.html2canvas;
    if (typeof orig !== 'function' || orig.__chcsWrapped) return;
    var wrapped = function () {
      var args = arguments;
      captureOn();
      return Promise.resolve().then(function () { return orig.apply(window, args); })
        .then(function (c) { captureOff(); return c; }, function (e) { captureOff(); throw e; });
    };
    wrapped.__chcsWrapped = true;
    window.html2canvas = wrapped;
  }
  wrap();
  // Forms that load html2canvas later still get wrapped.
  var tries = 0, iv = setInterval(function () { wrap(); if (++tries > 40 || (window.html2canvas && window.html2canvas.__chcsWrapped)) clearInterval(iv); }, 250);
  // Printing also uses the original look.
  window.addEventListener('beforeprint', function () { root.classList.add('chcs-capturing'); });
  window.addEventListener('afterprint', function () { root.classList.remove('chcs-capturing'); });

  /* ---------- 3) phone fit-to-width for fixed-size pages ---------- */
  if (!pageSel) return;
  var KEY = 'chcs-form-fit', btn = null;
  function pages() { return Array.prototype.slice.call(document.querySelectorAll(pageSel)); }
  function wanted() { try { return localStorage.getItem(KEY) !== 'actual'; } catch (e) { return true; } }
  function measure() {
    var ps = pages(); if (!ps.length) return;
    ps.forEach(function (p) { p.setAttribute('data-chcs-page', ''); });
    var w = ps[0].offsetWidth, h = ps[0].offsetHeight;          // layout size (not affected by the scale)
    var avail = Math.min(window.innerWidth, document.documentElement.clientWidth) - 16;
    var narrow = avail < w - 4;
    root.classList.toggle('chcs-narrow', narrow);
    root.classList.toggle('chcs-fit', narrow && wanted());
    root.style.setProperty('--chcs-fit', narrow ? (avail / w).toFixed(4) : '1');
    root.style.setProperty('--chcs-page-w', w + 'px');
    root.style.setProperty('--chcs-page-h', h + 'px');
    if (btn) btn.textContent = root.classList.contains('chcs-fit') ? '⤢ Actual size' : '⤡ Fit to screen';
  }
  function init() {
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chcs-fit-toggle'; btn.setAttribute('data-html2canvas-ignore', 'true');
    btn.onclick = function () { try { localStorage.setItem(KEY, root.classList.contains('chcs-fit') ? 'actual' : 'fit'); } catch (e) { /* ignore */ } measure(); };
    document.body.appendChild(btn);
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', function () { setTimeout(measure, 300); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
