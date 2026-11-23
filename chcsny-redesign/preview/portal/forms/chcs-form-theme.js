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
  // Some forms prepare the page (e.g. swap date fields for text copies of their current
  // style) *before* calling html2canvas. Switch the theme off for the whole PDF function.
  var fns = ((me && me.getAttribute('data-capture-fns')) || '').split(/[\s,]+/).filter(Boolean);
  function wrapFns() {
    fns.forEach(function (name) {
      var f = window[name];
      if (typeof f !== 'function' || f.__chcsWrapped) return;
      var w = function () {
        captureOn();
        var r;
        try { r = f.apply(this, arguments); } catch (e) { captureOff(); throw e; }
        return Promise.resolve(r).then(function (v) { captureOff(); return v; }, function (e) { captureOff(); throw e; });
      };
      w.__chcsWrapped = true;
      window[name] = w;
    });
  }
  wrapFns();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapFns);
  // Printing also uses the original look.
  window.addEventListener('beforeprint', function () { root.classList.add('chcs-capturing'); });
  window.addEventListener('afterprint', function () { root.classList.remove('chcs-capturing'); });

  /* ---------- employment application: header with page + progress (outside the pages) ---------- */
  if (form === 'application') {
    var startApp = function () {
      var pages = Array.prototype.slice.call(document.querySelectorAll('.page')), cont = document.querySelector('.page-container');
      if (!pages.length || !cont) return;
      var names = pages.map(function (p, i) { var h = p.querySelector('h2, h1'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : 'Page ' + (i + 1); });
      var logo = (me && me.src ? me.src.replace(/forms\/chcs-form-theme\.js.*$/, '') : '../') + 'assets/logo.png';
      var head = document.createElement('div'); head.className = 'chcs-apphead'; head.setAttribute('data-html2canvas-ignore', 'true');
      head.innerHTML = '<img src="' + logo + '" alt=""><div class="chcs-apphead__t"><b>Employment Application</b><span id="chcs-app-where"></span></div><div class="chcs-apphead__prog"><small><span>Filled in</span><span id="chcs-app-pct">0%</span></small><div class="chcs-apphead__bar"><i id="chcs-app-bar"></i></div></div><div class="chcs-apphead__nav"><button type="button" id="chcs-app-prev">‹ Previous</button><button type="button" class="primary" id="chcs-app-next">Next page ›</button></div>';
      cont.insertBefore(head, cont.firstChild);
      var cur = 0;
      function go(i) { i = Math.max(0, Math.min(pages.length - 1, i)); var y = pages[i].getBoundingClientRect().top + window.scrollY - head.offsetHeight - 12; window.scrollTo({ top: y, behavior: 'smooth' }); }
      document.getElementById('chcs-app-prev').onclick = function () { go(cur - 1); };
      document.getElementById('chcs-app-next').onclick = function () { go(cur + 1); };
      function setCur(i) { cur = i; pages.forEach(function (p, k) { p.classList.toggle('chcs-current', k === i); }); document.getElementById('chcs-app-where').textContent = 'Page ' + (i + 1) + ' of ' + pages.length + ' · ' + names[i]; }
      function progress() {
        var f = Array.prototype.slice.call(document.querySelectorAll('.page input[type=text], .page input[type=date], .page input[type=tel], .page input[type=email], .page input:not([type]), .page textarea'));
        var n = 0; f.forEach(function (el) { var on = !!String(el.value || '').trim(); el.classList.toggle('chcs-filled', on); if (on) n++; });
        var pct = f.length ? Math.round(n / f.length * 100) : 0;
        document.getElementById('chcs-app-pct').textContent = pct + '%'; document.getElementById('chcs-app-bar').style.width = pct + '%';
      }
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setCur(pages.indexOf(e.target)); }); }, { rootMargin: '-35% 0px -55% 0px' });
        pages.forEach(function (p) { io.observe(p); });
      }
      setCur(0); progress();
      document.addEventListener('input', progress); document.addEventListener('change', progress);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp); else setTimeout(startApp, 0);
  }

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
