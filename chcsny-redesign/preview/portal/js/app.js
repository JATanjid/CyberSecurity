/* CHCS Portal — application (views, router, shell). Vanilla JS, no build step. */
(function () {
  'use strict';
  var esc = H.esc, MODULES = window.CHCS_MODULES, CFG = API.config;
  var ASSET = CFG.assetBase || '';
  var state = { user: null, designations: [], counts: {}, pollers: [] };

  /* ================================================================ icons */
  var IP = {
    home: '<path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    checkc: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3M8 15h3M13 11l1.5 1.5L17 10M13 15l1.5 1.5L17 14"/>',
    cal: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    news: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2"/><path d="M8 8h5M8 12h5M8 16h3"/>',
    grad: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    log: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>'
  };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IP[n] || IP.home) + '</svg>'; }

  /* ================================================================ UI kit */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function on(root, ev, sel, fn) { root.addEventListener(ev, function (e) { var t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); }); }
  function toast(msg, kind) {
    var box = $('#toasts'); var t = document.createElement('div');
    t.className = 'toast' + (kind ? ' toast--' + kind : ''); t.setAttribute('role', 'status'); t.textContent = msg;
    box.appendChild(t); setTimeout(function () { t.remove(); }, 3800);
  }
  function fail(e) { toast(e && e.message ? e.message : 'Something went wrong.', 'bad'); }
  function modal(title, bodyHtml, opts) {
    opts = opts || {};
    var wrap = document.createElement('div'); wrap.className = 'modal';
    wrap.innerHTML = '<div class="modal__card' + (opts.wide ? ' modal__card--wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal__head"><h2>' + esc(title) + '</h2><button class="btn btn--ghost btn--icon btn--sm" data-close aria-label="Close">' + ico('x') + '</button></div>' + bodyHtml + '</div>';
    document.body.appendChild(wrap);
    var prev = document.activeElement;
    function close() { wrap.remove(); document.removeEventListener('keydown', key); if (prev && prev.focus) prev.focus(); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    wrap.addEventListener('click', function (e) { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    var f = wrap.querySelector('input:not([type=hidden]),select,textarea,button:not([data-close])'); if (f) setTimeout(function () { f.focus(); }, 30);
    if (opts.mount) opts.mount(wrap, close);
    return close;
  }
  function confirmBox(title, text, okLabel, danger) {
    return new Promise(function (res) {
      var done = false;
      var close = modal(title, '<div class="modal__body"><p>' + esc(text) + '</p></div><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn ' + (danger ? 'btn--red' : '') + '" data-ok>' + esc(okLabel || 'Confirm') + '</button></div>', {
        mount: function (w, c) { w.querySelector('[data-ok]').onclick = function () { done = true; c(); res(true); }; new MutationObserver(function () { if (!document.body.contains(w) && !done) res(false); }).observe(document.body, { childList: true }); }
      });
      return close;
    });
  }
  /* Busy popup: "Building…" then "Submitting…" then "Submitted successfully" */
  var busyEl = null;
  function busy(text) {
    if (!busyEl) { busyEl = document.createElement('div'); busyEl.className = 'busy'; busyEl.setAttribute('role', 'alertdialog'); busyEl.setAttribute('aria-live', 'assertive'); document.body.appendChild(busyEl); }
    busyEl.innerHTML = '<div class="busy__card"><div class="spinner"></div><b>' + esc(text) + '</b></div>';
  }
  function busyDone(text) {
    if (!busyEl) busy('');
    busyEl.innerHTML = '<div class="busy__card"><div class="success-check">✓</div><b>' + esc(text || 'Submitted successfully') + '</b></div>';
    var el = busyEl; busyEl = null; setTimeout(function () { el.remove(); }, 1500);
  }
  function busyClose() { if (busyEl) { busyEl.remove(); busyEl = null; } }
  async function submitting(fn, label) {
    busy(label || 'Submitting…');
    try { var r = await fn(); busyDone('Submitted successfully'); return r; } catch (e) { busyClose(); fail(e); throw e; }
  }

  /* ================================================================ permissions */
  function can(p) { return !!(state.user && state.user.permissions.indexOf(p) !== -1); }
  function isApplicant() { return state.user && state.user.type === 'applicant'; }
  function typeLabel(u) { return { admin: 'Administrator', office: 'Office', field: 'Field staff', applicant: 'Applicant' }[u.type] || u.type; }

  /* ================================================================ router */
  var routes = [];
  function route(pattern, def) { def.re = new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'); routes.push(def); }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }

  async function render() {
    state.pollers.forEach(clearInterval); state.pollers = [];
    var hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
    var path = hash.split('?')[0], query = {};
    if (hash.indexOf('?') !== -1) new URLSearchParams(hash.split('?')[1]).forEach(function (v, k) { query[k] = v; });
    var r = routes.find(function (x) { return x.re.test(path); });
    if (!r) { go('#/dashboard'); return; }
    var params = path.match(r.re).groups || {};

    if (!r.public && !state.user) { try { state.user = (await API.get('me')).user; } catch (e) { state.user = null; } }
    if (!r.public && !state.user) { sessionStorage.setItem('chcs_after_login', location.hash); go('#/login'); return; }
    if (r.public) { document.title = r.title + ' · CHCS Portal'; renderAuth(await r.render(params, query)); if (r.mount) r.mount($('#app'), params, query); return; }

    if (state.user.status === 'pending' && path !== 'profile') { renderShell(); setContent(pendingView()); $('#pending-out').onclick = function () { $('#logout-link').click(); }; return; }
    if (isApplicant() && ['application', 'news', 'profile'].indexOf(path) === -1) { go('#/application'); return; }
    if (r.perm && !(Array.isArray(r.perm) ? r.perm.some(can) : can(r.perm))) { renderShell(); $('.topbar__title').textContent = 'No access'; setContent('<div class="card"><div class="empty">' + ico('lock') + '<h2>No access</h2><p>You don\'t have access to this section. Ask your administrator if you need it.</p><a class="btn" href="#/dashboard">Back to dashboard</a></div></div>'); return; }

    renderShell(r.nav || path.split('/')[0]);
    // Fresh content element per page so click handlers from earlier pages never pile up.
    var oldC = $('#content'), freshC = oldC.cloneNode(false); oldC.parentNode.replaceChild(freshC, oldC);
    var title = typeof r.title === 'function' ? r.title(params) : r.title;
    $('.topbar__title').textContent = title; document.title = title + ' · CHCS Portal';
    setContent('<div class="loading"><div class="spinner"></div></div>');
    try {
      var html = await r.render(params, query);
      setContent(html);
      if (r.mount) await r.mount($('#content'), params, query);
    } catch (e) {
      if (e.status === 401) { state.user = null; go('#/login'); return; }
      setContent('<div class="card"><div class="empty">' + ico('x') + '<h2>Couldn\'t load this page</h2><p>' + esc(e.message) + '</p><button class="btn" onclick="location.reload()">Try again</button></div></div>');
    }
    window.scrollTo(0, 0);
  }
  function setContent(html) { $('#content').innerHTML = html; }

  /* ================================================================ shell */
  function navItems() {
    var u = state.user, items = [];
    function add(group, key, label, icon, href, show, count) { if (show) items.push({ group: group, key: key, label: label, icon: icon, href: href, count: count }); }
    if (isApplicant()) {
      add('Apply', 'application', 'My application', 'brief', '#/application', true);
      add('Apply', 'news', 'News', 'news', '#/news', true);
      return items;
    }
    if (u.status === 'pending') return items;
    add('Home', 'dashboard', 'Dashboard', 'home', '#/dashboard', true);
    add('Home', 'news', 'News & posts', 'news', '#/news', true);
    add('Home', 'chat', 'Chat', 'chat', '#/chat', can('chat'), state.counts.unread);
    add('Time & pay', 'clock', 'Time clock', 'clock', '#/clock', can('clock'));
    add('Time & pay', 'timesheet', 'Timesheet', 'sheet', '#/timesheet', can('timesheet'));
    add('Time & pay', 'approvals', 'Approvals', 'checkc', '#/approvals', can('approvals'), state.counts.pendingApprovals);
    add('Time & pay', 'payroll', 'Payroll export', 'cash', '#/payroll', can('payroll'));
    add('Patients', 'cases', 'Intake & cases', 'folder', '#/cases', can('intake'), state.counts.newCases);
    add('Patients', 'cases', 'My patients', 'heart', '#/cases', !can('intake') && can('notes'));
    add('Patients', 'notes', 'Visit notes', 'note', '#/notes', can('notes') || can('intake'));
    add('Patients', 'forms', 'Forms', 'form', '#/forms', can('forms') || can('inservices'));
    add('Schedule', 'calendar', can('calendar_manage') ? 'Schedules' : 'My schedule', 'cal', '#/calendar', can('calendar') || can('calendar_manage'));
    add('Training', 'inservices', 'In-services', 'grad', '#/inservices', can('inservices'), state.counts.inservicesDue);
    add('Training', 'orientation', 'Orientation', 'compass', '#/orientation', can('orientation'));
    add('Admin', 'applications', 'Applications', 'brief', '#/applications', can('applications'), state.counts.pendingApplications);
    add('Admin', 'admin-users', 'Users & access', 'users', '#/admin/users', can('users'), state.counts.pendingUsers);
    add('Admin', 'admin-designations', 'Designations', 'tag', '#/admin/designations', can('users'));
    add('Admin', 'admin-training', 'Training setup', 'grad', '#/admin/training', can('training_manage'));
    add('Admin', 'admin-email', 'Email & API', 'mail', '#/admin/email', can('settings'));
    add('Admin', 'admin-audit', 'Audit log', 'log', '#/admin/audit', can('audit'));
    return items;
  }
  function renderShell(active) {
    var u = state.user;
    if (!$('.shell')) {
      $('#app').innerHTML =
        (CFG.mode === 'demo' ? '<div class="demo-banner">Demo mode — data is saved only in this browser. Don\'t enter real patient or employee information. <button id="demo-reset">Reset demo data</button></div>' : '') +
        '<div class="shell"><aside class="side" id="side" aria-label="Main navigation"></aside><div class="main"><header class="topbar"><button class="btn btn--ghost btn--icon menu-btn" id="menu-btn" aria-label="Open menu" aria-controls="side" aria-expanded="false">' + ico('menu') + '</button><div class="topbar__title grow"></div><a class="btn btn--ghost btn--icon" href="#/profile" aria-label="My profile">' + H.avatar(u.name, 'sm') + '</a></header><main id="content" class="content" tabindex="-1"></main></div></div><nav class="tabbar" id="tabbar" aria-label="Quick navigation"></nav>' +
        (CFG.mode === 'demo' ? '<button class="btn inbox-fab" id="inbox-fab" aria-label="Demo inbox">' + ico('mail') + '<span>Demo inbox</span></button>' : '');
      $('#menu-btn').onclick = function () { toggleSide(true); };
      window.addEventListener('scroll', function () { var t = $('.topbar'); if (t) t.classList.toggle('is-scrolled', window.scrollY > 4); }, { passive: true });
      if ($('#demo-reset')) $('#demo-reset').onclick = async function () { if (await confirmBox('Reset demo data?', 'All demo changes in this browser will be erased and the sample data restored.', 'Reset')) { await API.post('demo/reset'); state.user = null; go('#/login'); location.reload(); } };
      if ($('#inbox-fab')) $('#inbox-fab').onclick = demoInbox;
      refreshCounts();
      state.countTimer = setInterval(refreshCounts, 30000);
    }
    var items = navItems(), groups = {};
    items.forEach(function (i) { (groups[i.group] = groups[i.group] || []).push(i); });
    var side = '<a class="side__brand" href="#/dashboard"><img src="' + ASSET + 'assets/logo.png" alt=""><span><b>CHCS Portal</b><small>Complete Home Care</small></span></a>';
    Object.keys(groups).forEach(function (g) {
      side += '<div class="nav-group"><div class="nav-group__title">' + esc(g) + '</div><nav class="nav">' + groups[g].map(function (i) {
        return '<a href="' + i.href + '" class="' + (i.key === active ? 'is-active' : '') + '"' + (i.key === active ? ' aria-current="page"' : '') + '>' + ico(i.icon) + '<span>' + esc(i.label) + '</span>' + (i.count ? '<span class="count">' + i.count + '</span>' : '') + '</a>';
      }).join('') + '</nav></div>';
    });
    side += '<div class="nav-group"><nav class="nav"><a href="#/profile" class="' + (active === 'profile' ? 'is-active' : '') + '">' + ico('user') + '<span>My profile</span></a><a href="#" id="install-link" class="' + (window.__installPrompt ? '' : 'hidden') + '">' + ico('phone') + '<span>Install app</span></a><a href="#" id="logout-link">' + ico('out') + '<span>Sign out</span></a></nav></div>';
    side += '<div class="side__user">' + H.avatar(u.name) + '<div class="grow"><b>' + esc(u.name) + '</b><small>' + esc(u.designation || typeLabel(u)) + '</small></div></div>';
    $('#side').innerHTML = side;
    $('#side').onclick = function (e) { if (e.target.closest('a')) toggleSide(false); };
    $('#logout-link').onclick = async function (e) { e.preventDefault(); await API.post('auth/logout'); state.user = null; clearInterval(state.countTimer); $('#app').innerHTML = ''; go('#/login'); };
    $('#install-link').onclick = function (e) { e.preventDefault(); installApp(); };
    // bottom tab bar (phone)
    var keys = ['dashboard', 'clock', 'timesheet', 'chat', 'calendar', 'cases', 'inservices', 'application', 'news'];
    var tabs = keys.map(function (k) { return items.find(function (i) { return i.key === k; }); }).filter(Boolean).slice(0, 4);
    $('#tabbar').innerHTML = tabs.map(function (i) { return '<a href="' + i.href + '" class="' + (i.key === active ? 'is-active' : '') + '">' + ico(i.icon) + '<span>' + esc(i.label.replace('Time clock', 'Clock').replace('Intake & cases', 'Cases').replace('My schedule', 'Schedule').replace('News & posts', 'News')) + '</span>' + (i.count ? '<span class="count">' + i.count + '</span>' : '') + '</a>'; }).join('') + '<button type="button" id="tab-more">' + ico('more') + '<span>More</span></button>';
    $('#tab-more').onclick = function () { toggleSide(true); };
  }
  function toggleSide(open) {
    var s = $('#side'); if (!s) return;
    s.classList.toggle('is-open', open); $('#menu-btn').setAttribute('aria-expanded', open ? 'true' : 'false');
    var scrim = $('.scrim');
    if (open && !scrim) { scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.onclick = function () { toggleSide(false); }; document.body.appendChild(scrim); }
    if (!open && scrim) scrim.remove();
  }
  async function refreshCounts() {
    if (!state.user || state.user.status !== 'active' || isApplicant()) return;
    try {
      var d = await API.get('dashboard');
      var changed = JSON.stringify(state.counts) !== JSON.stringify(d);
      state.counts = d; state.dash = d;
      if (changed && $('.shell')) { var active = ($('.nav a.is-active') || {}).getAttribute && $('.nav a.is-active').getAttribute('href'); renderShell(active ? navItems().filter(function (i) { return i.href === active; }).map(function (i) { return i.key; })[0] : ''); }
    } catch (e) { /* offline */ }
  }

  /* ================================================================ auth views */
  function renderAuth(inner) {
    $('#app').innerHTML = '<div class="auth"><section class="auth__brand"><a class="auth__logo" href="#/login"><img src="' + ASSET + 'assets/logo.png" alt=""><span><b>Complete Home Care Services</b><small>Staff &amp; Employee Portal</small></span></a>' +
      '<div class="auth__pitch"><h2>Everything your care team needs, <em>in one place.</em></h2><ul class="auth__list"><li>' + ico('clock') + 'Clock in, timesheets &amp; schedules</li><li>' + ico('chat') + 'Secure chat with the office</li><li>' + ico('grad') + 'In-services &amp; orientation</li><li>' + ico('folder') + 'Intake &amp; case management</li></ul></div>' +
      '<div class="auth__foot">117-03 203rd Street, St. Albans, NY 11412 · (718) 528-5493</div></section><main class="auth__main"><div class="auth__card">' + inner + '</div></main></div>';
  }
  function authTabs(active) { return '<div class="auth__tabs" role="tablist"><a href="#/login" class="' + (active === 'login' ? 'is-active' : '') + '">Sign in</a><a href="#/signup" class="' + (active === 'signup' ? 'is-active' : '') + '">Create account</a></div>'; }

  route('login', { public: true, title: 'Sign in', render: function () {
    return authTabs('login') + '<h1>Welcome back</h1><p class="muted">Sign in to the CHCS staff portal.</p><div id="auth-msg"></div>' +
      '<form id="login-form" class="stack" novalidate><label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required></label><label class="field"><span>Password</span><input class="input" name="password" type="password" autocomplete="current-password" required></label><div class="row row--between"><span></span><a href="#/forgot" class="small">Forgot password?</a></div><button class="btn btn--lg btn--block" type="submit">Sign in</button></form>' +
      (CFG.mode === 'demo' ? '<div class="demo-box"><b class="small">Demo accounts</b> <span class="small muted">(password <code>demo1234</code>)</span><div class="chips" style="margin-top:10px">' +
        [['admin@chcs.demo', 'Admin'], ['manager@chcs.demo', 'Office manager'], ['intake@chcs.demo', 'Intake coordinator'], ['hha@chcs.demo', 'HHA (field)'], ['rn@chcs.demo', 'RN (field)'], ['applicant@chcs.demo', 'Job applicant'], ['pending@chcs.demo', 'Awaiting approval']].map(function (a) { return '<button type="button" class="chip" data-demo="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div></div>' : '');
  }, mount: function (root) {
    var f = $('#login-form');
    f.onsubmit = async function (e) {
      e.preventDefault(); var d = H.formData(f), btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        var r = await API.post('auth/login', d); state.user = r.user; if (r.nonce) CFG.nonce = r.nonce;
        var next = sessionStorage.getItem('chcs_after_login'); sessionStorage.removeItem('chcs_after_login');
        $('#app').innerHTML = ''; go(next && next.indexOf('login') === -1 ? next : (state.user.type === 'applicant' ? '#/application' : '#/dashboard'));
      } catch (err) {
        btn.disabled = false;
        $('#auth-msg').innerHTML = '<div class="alert alert--bad" style="margin-bottom:14px">' + esc(err.message) + (err.code === 'unverified' || /verify/i.test(err.message) ? ' <button class="link" id="resend">Resend link</button>' : '') + '</div>';
        if ($('#resend')) $('#resend').onclick = async function () { await API.post('auth/resend-verification', { email: d.email }); toast('Verification email sent.', 'ok'); };
      }
    };
    on(root, 'click', '[data-demo]', function (e, b) { f.email.value = b.dataset.demo; f.password.value = 'demo1234'; f.requestSubmit(); });
  } });

  route('signup', { public: true, title: 'Create account', render: async function () {
    var des = []; try { des = await API.get('designations'); } catch (e) { /* public list may be blocked */ }
    if (!des.length) des = [{ name: 'PCA', type: 'field' }, { name: 'HHA', type: 'field' }, { name: 'LPN', type: 'field' }, { name: 'RN', type: 'field' }];
    var opt = function (t) { return des.filter(function (d) { return d.type === t; }).map(function (d) { return '<option>' + esc(d.name) + '</option>'; }).join(''); };
    return authTabs('signup') + '<h1>Create your account</h1><p class="muted">You\'ll need to verify your email before you can continue.</p><div id="auth-msg"></div>' +
      '<form id="signup-form" class="stack" novalidate><div class="acct-types" role="radiogroup" aria-label="Account type">' +
      '<label class="acct-type"><input type="radio" name="accountType" value="applicant" checked><span><b>Apply for a job</b><span class="small muted">New PCA, HHA, LPN or RN applicant</span></span></label>' +
      '<label class="acct-type"><input type="radio" name="accountType" value="field"><span><b>Current field employee</b><span class="small muted">PCA, HHA, LPN or RN already working with CHCS</span></span></label>' +
      '<label class="acct-type"><input type="radio" name="accountType" value="office"><span><b>Office staff</b><span class="small muted">Requires administrator approval</span></span></label></div>' +
      '<label class="field hidden" id="des-field"><span>Your role</span><select class="input" name="designation" id="des-select"></select></label>' +
      '<div class="grid-2"><label class="field"><span>Full name</span><input class="input" name="name" autocomplete="name" required></label><label class="field"><span>Mobile phone</span><input class="input" name="phone" type="tel" autocomplete="tel"></label></div>' +
      '<label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required></label>' +
      '<label class="field"><span>Password <span class="muted">(8+ characters)</span></span><input class="input" name="password" type="password" autocomplete="new-password" minlength="8" required></label>' +
      '<button class="btn btn--lg btn--block" type="submit">Create account</button></form>' +
      '<template id="opt-field">' + opt('field') + '</template><template id="opt-office">' + opt('office') + '</template>';
  }, mount: function () {
    var f = $('#signup-form');
    function sync() { var t = f.accountType.value; $('#des-field').classList.toggle('hidden', t === 'applicant'); if (t !== 'applicant') $('#des-select').innerHTML = $('#opt-' + t).innerHTML; }
    f.addEventListener('change', function (e) { if (e.target.name === 'accountType') sync(); }); sync();
    f.onsubmit = async function (e) {
      e.preventDefault(); var d = H.formData(f), btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try { await API.post('auth/signup', d); renderAuth('<div class="stack"><div class="course__icon">' + ico('mail') + '</div><h1>Check your email</h1><p>We sent a verification link to <b>' + esc(d.email) + '</b>. Open it to activate your account.</p>' + (CFG.mode === 'demo' ? '<div class="alert alert--info">Demo mode: open the <b>Demo inbox</b> to find the link.</div><button class="btn" id="open-inbox">' + ico('mail') + ' Open demo inbox</button>' : '') + '<a href="#/login" class="btn btn--ghost">Back to sign in</a></div>'); if ($('#open-inbox')) $('#open-inbox').onclick = demoInbox; }
      catch (err) { btn.disabled = false; $('#auth-msg').innerHTML = '<div class="alert alert--bad" style="margin-bottom:14px">' + esc(err.message) + '</div>'; }
    };
  } });

  route('verify/:token', { public: true, title: 'Verify email', render: async function (p) {
    try {
      var r = await API.post('auth/verify', { token: p.token });
      return '<div class="stack"><div class="success-check">✓</div><h1 style="text-align:center">Email verified</h1><p style="text-align:center">' + (r.status === 'pending' ? 'Thanks! An administrator will review your account. We\'ll email you when it\'s approved.' : 'You can now sign in and complete your job application.') + '</p><a class="btn btn--lg btn--block" href="#/login">Sign in</a></div>';
    } catch (e) { return '<div class="stack"><h1>Link not valid</h1><div class="alert alert--bad">' + esc(e.message) + '</div><a class="btn" href="#/login">Back to sign in</a></div>'; }
  } });

  route('forgot', { public: true, title: 'Reset password', render: function () {
    return '<h1>Reset your password</h1><p class="muted">Enter your email and we\'ll send you a reset link.</p><form id="forgot-form" class="stack"><label class="field"><span>Email</span><input class="input" name="email" type="email" required></label><button class="btn btn--lg btn--block">Send reset link</button><a href="#/login" class="small">Back to sign in</a></form>';
  }, mount: function () { var f = $('#forgot-form'); f.onsubmit = async function (e) { e.preventDefault(); await API.post('auth/forgot', H.formData(f)); f.innerHTML = '<div class="alert alert--ok">If an account exists for that email, a reset link is on its way.' + (CFG.mode === 'demo' ? ' (Demo: check the Demo inbox.)' : '') + '</div><a href="#/login" class="btn btn--ghost">Back to sign in</a>' + (CFG.mode === 'demo' ? '<button type="button" class="btn" id="oi">Open demo inbox</button>' : ''); if ($('#oi')) $('#oi').onclick = demoInbox; }; } });

  route('reset/:token', { public: true, title: 'Choose a new password', render: function () {
    return '<h1>Choose a new password</h1><form id="reset-form" class="stack"><label class="field"><span>New password (8+ characters)</span><input class="input" name="password" type="password" minlength="8" autocomplete="new-password" required></label><button class="btn btn--lg btn--block">Save password</button><div id="auth-msg"></div></form>';
  }, mount: function (root, p) { var f = $('#reset-form'); f.onsubmit = async function (e) { e.preventDefault(); try { await API.post('auth/reset', { token: p.token, password: f.password.value }); toast('Password saved. Please sign in.', 'ok'); go('#/login'); } catch (err) { $('#auth-msg').innerHTML = '<div class="alert alert--bad">' + esc(err.message) + '</div>'; } }; } });

  function pendingView() {
    return '<div class="card" style="max-width:640px;margin:20px auto"><div class="card__body stack" style="text-align:center;padding:40px 28px"><div class="course__icon" style="margin:0 auto">' + ico('shield') + '</div><h1>Waiting for approval</h1><p class="muted">Your email is verified. An administrator needs to approve your account and set your access before you can use the portal. You\'ll get an email as soon as it\'s approved.</p><p class="small muted">Questions? Call the office at <a href="tel:7185285493">(718) 528-5493</a>.</p><div class="row" style="justify-content:center"><button class="btn btn--ghost" onclick="location.reload()">Check again</button><button class="btn btn--ghost" id="pending-out">Sign out</button></div></div></div>';
  }

  /* ================================================================ dashboard */
  route('dashboard', { title: 'Dashboard', render: async function () {
    var d = await API.get('dashboard'); state.counts = d; var u = state.user;
    var hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    var html = '<div class="hero-card"><div class="row row--between"><div><div class="small" style="opacity:.8">' + esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })) + '</div><h1>' + greet + ', ' + esc(u.name.split(' ')[0]) + '</h1><div style="opacity:.85">' + esc(u.designation || typeLabel(u)) + '</div></div><div class="row">' +
      (can('clock') ? '<a class="btn ' + (d.openEntry ? 'btn--red' : '') + '" href="#/clock">' + ico('clock') + (d.openEntry ? 'Clocked in · ' + H.fmtTime(d.openEntry.start) : 'Clock in') + '</a>' : '') +
      (can('chat') ? '<a class="btn btn--ghost" href="#/chat">' + ico('chat') + 'Messages' + (d.unread ? ' (' + d.unread + ')' : '') + '</a>' : '') + '</div></div></div>';
    var stats = [];
    if (can('clock') || can('timesheet')) stats.push(['clock', 'Hours this week', H.hours(d.weekMinutes), 'Mon–Sun', can('clock') ? '#/clock' : '#/timesheet']);
    if (d.pendingApprovals != null) stats.push(['checkc', 'Time to approve', d.pendingApprovals, 'Pending entries', '#/approvals']);
    if (d.newCases != null) stats.push(['folder', 'New referrals', d.newCases, 'New + verifying', '#/cases']);
    if (d.pendingApplications != null) stats.push(['brief', 'Applications', d.pendingApplications, 'Waiting for review', '#/applications']);
    if (d.pendingUsers != null) stats.push(['users', 'Accounts to approve', d.pendingUsers, 'Verified, waiting', '#/admin/users']);
    if (d.inservicesDue != null) stats.push(['grad', 'In-services to do', d.inservicesDue, 'Assigned to you', '#/inservices']);
    if (can('chat')) stats.push(['chat', 'Unread messages', d.unread, 'All conversations', '#/chat']);
    html += '<div class="stats">' + stats.slice(0, 4).map(function (s) { return '<a class="stat" href="' + s[4] + '"><div class="stat__label">' + ico(s[0]) + esc(s[1]) + '</div><div class="stat__value">' + esc(s[2]) + '</div><div class="stat__hint">' + esc(s[3]) + '</div></a>'; }).join('') + '</div>';
    html += '<div class="cards cards--2"><section class="card"><div class="card__head"><h2>News &amp; announcements</h2><a href="#/news" class="small">All posts</a></div>' + (d.posts.length ? d.posts.map(postHtml).join('') : '<div class="empty">No posts yet.</div>') + '</section>';
    html += '<section class="card"><div class="card__head"><h2>My upcoming shifts</h2>' + (can('calendar') || can('calendar_manage') ? '<a href="#/calendar" class="small">Calendar</a>' : '') + '</div>' + (d.upcomingShifts.length ? '<ul class="list">' + d.upcomingShifts.map(function (s) { return '<li><div class="course__icon">' + ico('cal') + '</div><div class="grow"><b>' + esc(s.title) + '</b><div class="small muted">' + esc(H.fmtDate(s.date, { weekday: 'short', month: 'short', day: 'numeric' })) + ' · ' + H.fmtHM(s.start) + '–' + H.fmtHM(s.end) + (s.location ? ' · ' + esc(s.location) : '') + '</div></div></li>'; }).join('') + '</ul>' : '<div class="empty">' + ico('cal') + '<div>No upcoming shifts.</div></div>') + '</section></div>';
    return html;
  } });

  function postHtml(p) {
    var aud = { public: 'Website + portal', staff: 'All staff', office: 'Office', field: 'Field staff' }[p.audience];
    return '<article class="post"><div class="post__meta">' + (p.pinned ? '<span class="badge badge--brand">Pinned</span>' : '') + '<span class="badge badge--muted">' + esc(aud) + '</span>' + (p.status === 'draft' ? H.badge('draft') : '') + '<span>' + esc(p.authorName || 'CHCS') + ' · ' + esc(H.fmtDate(p.publishedAt || p.createdAt)) + '</span></div><h3>' + esc(p.title) + '</h3><div class="post__body">' + esc(p.body.length > 360 ? p.body.slice(0, 360) + '…' : p.body) + '</div></article>';
  }

  /* ================================================================ news & posts */
  route('news', { title: 'News & posts', render: async function () {
    var posts = await API.get('posts');
    return '<div class="page-head"><div><h1>News &amp; posts</h1><p>Agency announcements. Posts marked “Website” also appear on chcsny.com.</p></div>' + (can('news_manage') ? '<button class="btn" id="new-post">' + ico('plus') + 'New post</button>' : '') + '</div>' +
      '<section class="card">' + (posts.length ? posts.map(function (p) { return '<div>' + postHtml(p) + (can('news_manage') ? '<div class="row" style="padding:0 20px 16px"><button class="btn btn--ghost btn--sm" data-edit="' + p.id + '">Edit</button><button class="btn btn--ghost btn--sm" data-del="' + p.id + '">Delete</button></div>' : '') + '</div>'; }).join('') : '<div class="empty">' + ico('news') + '<div>No posts yet.</div></div>') + '</section>';
  }, mount: async function (root) {
    var posts = can('news_manage') ? await API.get('posts') : [];
    function editor(p) {
      p = p || { audience: 'staff', status: 'published' };
      modal(p.id ? 'Edit post' : 'New post', '<form class="modal__body stack" id="post-form"><label class="field"><span>Title</span><input class="input" name="title" required value="' + esc(p.title || '') + '"></label><label class="field"><span>Message</span><textarea class="input" name="body" rows="8">' + esc(p.body || '') + '</textarea></label><div class="grid-2"><label class="field"><span>Who sees it</span><select class="input" name="audience">' + [['public', 'Website + all staff'], ['staff', 'All staff (portal only)'], ['office', 'Office staff only'], ['field', 'Field staff only']].map(function (o) { return '<option value="' + o[0] + '"' + (p.audience === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label><label class="field"><span>Status</span><select class="input" name="status"><option value="published">Published</option><option value="draft"' + (p.status === 'draft' ? ' selected' : '') + '>Draft</option></select></label></div><label class="field"><span>Image URL <span class="muted">(optional)</span></span><input class="input" name="imageUrl" value="' + esc(p.imageUrl || '') + '"></label><label class="check"><input type="checkbox" name="pinned"' + (p.pinned ? ' checked' : '') + '> Pin to the top of the dashboard</label></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="post-save">' + (p.id ? 'Save' : 'Publish') + '</button></div>', {
        mount: function (w, close) { $('#post-save', w).onclick = async function () { var d = H.formData($('#post-form', w)); d.pinned = !!d.pinned; try { await submitting(function () { return p.id ? API.patch('posts/' + p.id, d) : API.post('posts', d); }); close(); render(); } catch (e) { /* shown */ } }; }
      });
    }
    var nb = $('#new-post', root); if (nb) nb.onclick = function () { editor(); };
    on(root, 'click', '[data-edit]', function (e, b) { editor(posts.find(function (p) { return p.id === +b.dataset.edit; })); });
    on(root, 'click', '[data-del]', async function (e, b) { if (await confirmBox('Delete post?', 'This removes the post from the portal' + ' and the website.', 'Delete', true)) { await API.del('posts/' + b.dataset.del); toast('Post deleted.'); render(); } });
  } });

  /* ================================================================ time clock */
  route('clock', { title: 'Time clock', perm: 'clock', render: async function () {
    var list = await API.get('time/entries?from=' + H.addDays(H.ymd(), -13));
    var open = list.find(function (t) { return t.status === 'open'; });
    var week = list.filter(function (t) { return t.date >= H.weekStart() && t.end; }).reduce(function (a, t) { return a + t.minutes; }, 0);
    return '<div class="cards cards--2"><section class="card"><div class="clock"><div class="muted">' + esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })) + '</div><div class="clock__time" id="clock-now"></div>' +
      '<div class="clock__ring" id="ring"><div><span class="small muted">' + (open ? 'On the clock' : 'This week') + '</span><b id="elapsed">' + (open ? '' : H.hours(week) + 'h') + '</b><span class="small muted">' + (open ? 'since ' + H.fmtTime(open.start) : 'of 40h') + '</span></div></div>' +
      '<label class="field" style="max-width:340px;margin:0 auto 14px;text-align:left"><span>Note <span class="muted">(optional)</span></span><input class="input" id="clock-note" placeholder="e.g. Field visit, training"></label>' +
      '<button class="btn clock-btn ' + (open ? 'btn--red' : 'btn--ok') + '" id="clock-btn" data-open="' + (open ? 1 : 0) + '">' + ico('clock') + (open ? 'Clock out' : 'Clock in') + '</button><p class="small muted" style="margin-top:12px">Your location is recorded only if you allow it.</p></div></section>' +
      '<section class="card"><div class="card__head"><h2>Recent punches</h2><span class="small muted">Last 2 weeks</span></div>' + timeTable(list.filter(function (t) { return t.source === 'clock'; }), false) + '</section></div>';
  }, mount: function (root) {
    function tick() { var n = $('#clock-now'); if (!n) return; n.textContent = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }); }
    tick(); state.pollers.push(setInterval(tick, 1000));
    var btn = $('#clock-btn');
    API.get('time/entries?status=open').then(function (l) {
      var o = l[0]; if (!o) return;
      function el() { var m = (Date.now() - new Date(o.start)) / 60000, e = $('#elapsed'); if (!e) return; e.textContent = Math.floor(m / 60) + 'h ' + String(Math.floor(m % 60)).padStart(2, '0') + 'm'; $('#ring').style.setProperty('--p', Math.min(100, m / 480 * 100) + '%'); }
      el(); state.pollers.push(setInterval(el, 15000));
    });
    btn.onclick = async function () {
      var out = btn.dataset.open === '1', note = $('#clock-note').value; btn.disabled = true;
      var geo = null;
      if (!out && navigator.geolocation) geo = await new Promise(function (res) { navigator.geolocation.getCurrentPosition(function (p) { res({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5), acc: Math.round(p.coords.accuracy) }); }, function () { res(null); }, { timeout: 5000, maximumAge: 60000 }); });
      try { await API.post(out ? 'time/clock-out' : 'time/clock-in', { note: note, geo: geo }); toast(out ? 'Clocked out. Your hours were sent for approval.' : 'Clocked in. Have a great shift!', 'ok'); refreshCounts(); render(); } catch (e) { btn.disabled = false; fail(e); }
    };
  } });

  function timeTable(list, withUser, selectable) {
    if (!list.length) return '<div class="empty">' + ico('clock') + '<div>No entries.</div></div>';
    return '<div class="table-wrap"><table class="table table--cards"><thead><tr>' + (selectable ? '<th><input type="checkbox" id="sel-all" aria-label="Select all"></th>' : '') + (withUser ? '<th>Employee</th>' : '') + '<th>Date</th><th>In</th><th>Out</th><th class="right">Hours</th><th>Patient / note</th><th>Status</th>' + (!withUser ? '<th></th>' : '') + '</tr></thead><tbody>' +
      list.map(function (t) {
        return '<tr>' + (selectable ? '<td><input type="checkbox" class="sel" value="' + t.id + '" aria-label="Select entry"></td>' : '') + (withUser ? '<td data-label="Employee"><b>' + esc(t.userName) + '</b><div class="small muted">' + esc(t.designation) + '</div></td>' : '') +
          '<td data-label="Date">' + esc(H.fmtDate(t.date, { weekday: 'short', month: 'short', day: 'numeric' })) + '</td><td data-label="In">' + H.fmtTime(t.start) + '</td><td data-label="Out">' + (t.end ? H.fmtTime(t.end) : '—') + '</td><td data-label="Hours" class="right"><b>' + (t.end ? H.hours(t.minutes) : '—') + '</b></td>' +
          '<td data-label="Patient / note">' + esc(t.patientName || '') + (t.note ? '<div class="small muted">' + esc(t.note) + '</div>' : '') + (t.geo ? '<div class="small muted">' + ico('pin') + ' located</div>' : '') + (t.decisionNote ? '<div class="small" style="color:var(--red)">' + esc(t.decisionNote) + '</div>' : '') + '</td><td data-label="Status">' + H.badge(t.status) + '</td>' +
          (!withUser ? '<td>' + (t.source === 'manual' && (t.status === 'draft' || t.status === 'rejected') ? '<button class="btn btn--ghost btn--sm" data-del-time="' + t.id + '">Delete</button>' : '') + '</td>' : '') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ================================================================ timesheet (field) */
  route('timesheet', { title: 'Timesheet', perm: 'timesheet', render: async function (p, q) {
    var ws = q.week || H.weekStart(), we = H.addDays(ws, 6);
    var list = await API.get('time/entries?from=' + ws + '&to=' + we);
    var total = list.filter(function (t) { return t.end; }).reduce(function (a, t) { return a + t.minutes; }, 0);
    var drafts = list.filter(function (t) { return t.status === 'draft' || t.status === 'rejected'; }).length;
    return '<div class="page-head"><div><h1>Timesheet</h1><p>Add each visit, then submit the week for approval.</p></div><div class="row"><a class="btn btn--ghost btn--icon" href="#/timesheet?week=' + H.addDays(ws, -7) + '" aria-label="Previous week">' + ico('left') + '</a><b>' + esc(H.fmtDate(ws, { month: 'short', day: 'numeric' })) + ' – ' + esc(H.fmtDate(we)) + '</b><a class="btn btn--ghost btn--icon" href="#/timesheet?week=' + H.addDays(ws, 7) + '" aria-label="Next week">' + ico('right') + '</a></div></div>' +
      '<div class="stats"><div class="stat"><div class="stat__label">' + ico('clock') + 'Total hours</div><div class="stat__value">' + H.hours(total) + '</div></div><div class="stat"><div class="stat__label">' + ico('sheet') + 'Entries</div><div class="stat__value">' + list.length + '</div></div><div class="stat"><div class="stat__label">' + ico('note') + 'Not submitted</div><div class="stat__value">' + drafts + '</div></div><div class="stat"><div class="stat__label">' + ico('checkc') + 'Approved</div><div class="stat__value">' + list.filter(function (t) { return t.status === 'approved'; }).length + '</div></div></div>' +
      '<section class="card"><div class="card__head"><h2>Visits this week</h2><div class="row"><button class="btn btn--ghost btn--sm" id="add-entry">' + ico('plus') + 'Add visit</button><button class="btn btn--sm" id="submit-week"' + (drafts ? '' : ' disabled') + '>' + ico('send') + 'Submit week</button></div></div>' + timeTable(list, false) + '</section>' +
      '<p class="small muted" style="margin-top:12px">Prefer paper-style? Use the <a href="#/forms">Duty Sheet</a> in Forms.</p>';
  }, mount: function (root, p, q) {
    var ws = q.week || H.weekStart();
    $('#add-entry').onclick = async function () {
      var cases = []; try { cases = await API.get('cases'); } catch (e) { /* none */ }
      modal('Add visit', '<form class="modal__body stack" id="entry-form"><div class="grid-3"><label class="field"><span>Date</span><input class="input" type="date" name="date" value="' + H.ymd() + '" required></label><label class="field"><span>Time in</span><input class="input" type="time" name="startTime" value="09:00" required></label><label class="field"><span>Time out</span><input class="input" type="time" name="endTime" value="13:00" required></label></div><label class="field"><span>Patient</span><select class="input" name="caseId"><option value="">— Not patient-specific —</option>' + cases.map(function (c) { return '<option value="' + c.id + '">' + esc(c.patientName) + '</option>'; }).join('') + '</select></label><label class="field"><span>Note</span><input class="input" name="note" placeholder="Optional"></label></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="entry-save">Add</button></div>', {
        mount: function (w, close) { $('#entry-save', w).onclick = async function () { try { await API.post('time/entries', H.formData($('#entry-form', w))); close(); toast('Visit added.', 'ok'); render(); } catch (e) { fail(e); } }; }
      });
    };
    $('#submit-week').onclick = async function () { try { var r = await submitting(function () { return API.post('time/submit', { weekStart: ws }); }); refreshCounts(); render(); } catch (e) { /* shown */ } };
    on(root, 'click', '[data-del-time]', async function (e, b) { await API.del('time/entries/' + b.dataset.delTime); render(); });
  } });

  /* ================================================================ approvals */
  route('approvals', { title: 'Approvals', perm: 'approvals', render: async function (p, q) {
    var tab = q.tab || 'time';
    var head = '<div class="page-head"><div><h1>Approvals</h1><p>Review hours before they go to payroll.</p></div></div><div class="tabs"><a href="#/approvals" class="' + (tab === 'time' ? 'is-active' : '') + '">Time entries</a><a href="#/approvals?tab=notes" class="' + (tab === 'notes' ? 'is-active' : '') + '">Visit notes</a></div>';
    if (tab === 'notes') { var notes = await API.get('notes?scope=all'); return head + notesTable(notes, true); }
    var list = await API.get('time/entries?scope=all&status=pending');
    return head + '<section class="card"><div class="card__head"><h2>' + list.length + ' pending</h2><div class="row"><input class="input" id="dec-note" placeholder="Note to employee (optional)" style="min-height:34px;max-width:240px"><button class="btn btn--ghost btn--sm" data-decide="reject">Reject selected</button><button class="btn btn--ok btn--sm" data-decide="approve">' + ico('check') + 'Approve selected</button></div></div>' + timeTable(list, true, true) + '</section>';
  }, mount: function (root) {
    var all = $('#sel-all'); if (all) all.onchange = function () { $$('.sel', root).forEach(function (c) { c.checked = all.checked; }); };
    on(root, 'click', '[data-decide]', async function (e, b) {
      var ids = $$('.sel:checked', root).map(function (c) { return +c.value; });
      if (!ids.length) { toast('Select at least one entry.'); return; }
      try { await API.post('time/decide', { ids: ids, action: b.dataset.decide, note: $('#dec-note').value }); toast(ids.length + ' entr' + (ids.length > 1 ? 'ies ' : 'y ') + (b.dataset.decide === 'approve' ? 'approved' : 'rejected') + '.', 'ok'); refreshCounts(); render(); } catch (err) { fail(err); }
    });
    bindNoteReview(root);
  } });

  /* ================================================================ payroll */
  route('payroll', { title: 'Payroll export', perm: 'payroll', render: function (p, q) {
    var to = q.to || H.addDays(H.weekStart(), -1), from = q.from || H.addDays(to, -13);
    return '<div class="page-head"><div><h1>Payroll export</h1><p>Approved hours, with overtime over 40 hours per week (Mon–Sun).</p></div></div>' +
      '<section class="card"><div class="card__body"><form class="row" id="pay-form" style="align-items:flex-end"><label class="field"><span>From</span><input class="input" type="date" name="from" value="' + from + '"></label><label class="field"><span>To</span><input class="input" type="date" name="to" value="' + to + '"></label><label class="check" style="margin-bottom:10px"><input type="checkbox" name="includePending" value="1"' + (q.includePending ? ' checked' : '') + '> Include pending</label><button class="btn">Preview</button><button type="button" class="btn btn--ok" id="xlsx">' + ico('dl') + 'Download Excel</button></form></div><div id="pay-out"></div></section>';
  }, mount: async function (root, p, q) {
    var f = $('#pay-form'), data = null;
    async function load() {
      var d = H.formData(f);
      data = await API.get('payroll?from=' + d.from + '&to=' + d.to + (d.includePending ? '&includePending=1' : ''));
      var tot = data.summary.reduce(function (a, s) { return a + s.totalHours; }, 0);
      $('#pay-out').innerHTML = data.summary.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Employee</th><th>Designation</th><th class="right">Regular</th><th class="right">Overtime</th><th class="right">Total</th><th class="right">Entries</th></tr></thead><tbody>' + data.summary.map(function (s) { return '<tr><td data-label="Employee"><b>' + esc(s.name) + '</b></td><td data-label="Designation">' + esc(s.designation) + '</td><td data-label="Regular" class="right">' + s.regularHours.toFixed(2) + '</td><td data-label="Overtime" class="right">' + s.overtimeHours.toFixed(2) + '</td><td data-label="Total" class="right"><b>' + s.totalHours.toFixed(2) + '</b></td><td data-label="Entries" class="right">' + s.entries + '</td></tr>'; }).join('') + '<tr><td colspan="4"><b>Total</b></td><td class="right"><b>' + tot.toFixed(2) + '</b></td><td></td></tr></tbody></table></div>' : '<div class="empty">' + ico('cash') + '<div>No approved hours in this period.</div></div>';
    }
    f.onsubmit = function (e) { e.preventDefault(); load().catch(fail); };
    $('#xlsx').onclick = async function () {
      try {
        busy('Building…'); if (!data) await load();
        await loadScript(ASSET + 'vendor/xlsx.full.min.js');
        var d = H.formData(f), wb = XLSX.utils.book_new();
        var sum = [['Employee', 'Employee ID', 'Designation', 'Regular Hours', 'Overtime Hours', 'Total Hours', 'Entries']].concat(data.summary.map(function (s) { return [s.name, s.userId, s.designation, s.regularHours, s.overtimeHours, s.totalHours, s.entries]; }));
        var det = [['Employee', 'Employee ID', 'Designation', 'Date', 'Time In', 'Time Out', 'Hours', 'Patient', 'Source', 'Status', 'Note']].concat(data.detail.map(function (t) { return [t.userName, t.userId, t.designation, t.date, H.fmtTime(t.start), H.fmtTime(t.end), +H.hours(t.minutes), t.patientName || '', t.source, t.status, t.note || '']; }));
        var ws1 = XLSX.utils.aoa_to_sheet(sum), ws2 = XLSX.utils.aoa_to_sheet(det);
        ws1['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 9 }]; ws2['!cols'] = [{ wch: 22 }, { wch: 11 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 22 }, { wch: 9 }, { wch: 10 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary'); XLSX.utils.book_append_sheet(wb, ws2, 'Detail');
        XLSX.writeFile(wb, 'CHCS_Payroll_' + d.from + '_to_' + d.to + '.xlsx');
        busyDone('Excel file ready');
      } catch (e) { busyClose(); fail(e); }
    };
    load().catch(fail);
  } });
  var loaded = {};
  function loadScript(src) { if (loaded[src]) return loaded[src]; loaded[src] = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { delete loaded[src]; rej(new Error('Could not load the Excel library. Check your connection.')); }; document.head.appendChild(s); }); return loaded[src]; }

  /* ================================================================ intake & cases */
  var CASE_STATUSES = [['new', 'New referral'], ['verifying', 'Verifying insurance'], ['assessment', 'Assessment scheduled'], ['active', 'Active'], ['on_hold', 'On hold'], ['discharged', 'Discharged'], ['declined', 'Declined']];
  var SERVICES = ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Respiratory Therapy', 'Respite Care', 'Home Health Aide', 'Personal Care Aide'];
  var AREAS = ['Queens', 'Brooklyn', 'Bronx', 'Manhattan', 'Staten Island', 'Nassau County'];
  route('cases', { title: function () { return can('intake') ? 'Intake & cases' : 'My patients'; }, perm: ['intake', 'notes'], render: async function (p, q) {
    var cases = await API.get('cases');
    if (!can('intake')) {
      return '<div class="page-head"><div><h1>My patients</h1><p>Active patients assigned to you.</p></div></div><section class="card">' + (cases.length ? '<ul class="list">' + cases.map(function (c) { return '<li><div class="course__icon">' + ico('heart') + '</div><div class="grow"><b>' + esc(c.patientName) + '</b><div class="small muted">' + esc([c.address, c.borough].filter(Boolean).join(', ')) + '</div><div class="small muted">' + esc((c.services || []).join(' · ')) + '</div></div>' + (c.phone ? '<a class="btn btn--ghost btn--sm" href="tel:' + esc(c.phone.replace(/[^0-9+]/g, '')) + '">Call</a>' : '') + (can('notes') ? '<a class="btn btn--sm" href="#/notes?new=' + c.id + '">Write note</a>' : '') + '</li>'; }).join('') + '</ul>' : '<div class="empty">' + ico('heart') + '<div>No patients assigned yet.</div></div>') + '</section>';
    }
    var view = q.view || 'board', term = (q.q || '').toLowerCase();
    if (term) cases = cases.filter(function (c) { return (c.patientName + ' ' + c.phone + ' ' + c.borough + ' ' + c.insurance).toLowerCase().indexOf(term) !== -1; });
    var head = '<div class="page-head"><div><h1>Intake &amp; cases</h1><p>Referrals move left to right as they progress.</p></div><div class="row"><form id="case-search" class="row"><input class="input" name="q" placeholder="Search patients" value="' + esc(q.q || '') + '" style="min-height:42px"></form><div class="tabs" style="margin:0;border:0"><a href="#/cases?view=board" class="' + (view === 'board' ? 'is-active' : '') + '">Board</a><a href="#/cases?view=list" class="' + (view === 'list' ? 'is-active' : '') + '">List</a></div><button class="btn" id="new-case">' + ico('plus') + 'New intake</button></div></div>' +
      '<div class="alert alert--warn" style="margin-bottom:16px">' + ico('shield') + '<span>This section contains protected health information. Only share what\'s needed for care. Access is logged.</span></div>';
    if (view === 'list') return head + '<section class="card"><div class="table-wrap"><table class="table table--cards"><thead><tr><th>Patient</th><th>Borough</th><th>Services</th><th>Insurance</th><th>Assigned</th><th>Status</th></tr></thead><tbody>' + cases.map(function (c) { return '<tr class="is-click" data-href="#/cases/' + c.id + '"><td data-label="Patient"><b>' + esc(c.patientName) + '</b>' + (c.priority === 'high' ? ' ' + H.badge('high') : '') + '</td><td data-label="Borough">' + esc(c.borough) + '</td><td data-label="Services">' + esc((c.services || []).join(', ')) + '</td><td data-label="Insurance">' + esc(c.insurance) + '</td><td data-label="Assigned">' + esc(c.assignedNames.join(', ') || '—') + '</td><td data-label="Status">' + H.badge(c.status) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
    return head + '<div class="kanban">' + CASE_STATUSES.slice(0, 5).map(function (s) {
      var cs = cases.filter(function (c) { return c.status === s[0]; });
      return '<div class="kanban__col"><h3>' + esc(s[1]) + '<span>' + cs.length + '</span></h3>' + cs.map(function (c) { return '<a class="kcard" href="#/cases/' + c.id + '"><b>' + esc(c.patientName) + '</b><div class="small muted">' + esc(c.borough || '—') + ' · ' + esc((c.services || []).join(', ') || 'No services yet') + '</div><div class="row" style="margin-top:8px;gap:6px">' + (c.priority === 'high' ? H.badge('high') : '') + (c.assignedNames.length ? '<span class="small muted">' + esc(c.assignedNames.join(', ')) + '</span>' : '<span class="small muted">Unassigned</span>') + '</div></a>'; }).join('') + '</div>';
    }).join('') + '</div><p class="small muted" style="margin-top:10px">Discharged and declined cases are in the <a href="#/cases?view=list">list view</a>.</p>';
  }, mount: function (root) {
    on(root, 'click', 'tr[data-href]', function (e, tr) { go(tr.dataset.href); });
    var s = $('#case-search'); if (s) s.onsubmit = function (e) { e.preventDefault(); go('#/cases?view=' + (new URLSearchParams(location.hash.split('?')[1] || '').get('view') || 'board') + '&q=' + encodeURIComponent(s.q.value)); };
    var nb = $('#new-case'); if (nb) nb.onclick = function () { caseForm(); };
  } });
  function caseForm(c) {
    c = c || { status: 'new', priority: 'normal', services: [] };
    var f = function (n, l, t, extra) { return '<label class="field' + (extra || '') + '"><span>' + l + '</span><input class="input" name="' + n + '" type="' + (t || 'text') + '" value="' + esc(c[n] || '') + '"></label>'; };
    modal(c.id ? 'Edit case' : 'New intake', '<form class="modal__body stack" id="case-form"><h3>Patient</h3><div class="grid-2">' + f('patientName', 'Patient full name *') + f('dob', 'Date of birth', 'date') + f('phone', 'Phone', 'tel') + '<label class="field"><span>Borough / county</span><select class="input" name="borough"><option value=""></option>' + AREAS.map(function (a) { return '<option' + (c.borough === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></label>' + f('address', 'Address', 'text', ' full') + '</div>' +
      '<h3>Referral</h3><div class="grid-2"><label class="field"><span>Referral source</span><select class="input" name="referralSource">' + ['Hospital discharge', 'Physician', 'Family', 'Self', 'MLTC / insurer', 'Website', 'Other'].map(function (a) { return '<option' + (c.referralSource === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></label>' + f('referrerName', 'Referrer name / contact') + f('insurance', 'Insurance') + f('physician', 'Physician') + '</div>' +
      '<div class="field"><span class="label">Services requested</span><div class="chips">' + SERVICES.map(function (s) { return '<label class="chip"><input type="checkbox" name="services[]" value="' + esc(s) + '"' + ((c.services || []).indexOf(s) !== -1 ? ' checked' : '') + '>' + esc(s) + '</label>'; }).join('') + '</div></div>' +
      '<div class="grid-3"><label class="field"><span>Status</span><select class="input" name="status">' + CASE_STATUSES.map(function (s) { return '<option value="' + s[0] + '"' + (c.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label><label class="field"><span>Priority</span><select class="input" name="priority"><option value="normal">Normal</option><option value="high"' + (c.priority === 'high' ? ' selected' : '') + '>High</option></select></label>' + f('socDate', 'Start of care', 'date') + '</div></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="case-save">' + (c.id ? 'Save' : 'Create case') + '</button></div>', {
      wide: true, mount: function (w, close) { $('#case-save', w).onclick = async function () { var d = H.formData($('#case-form', w)); d.services = d.services || []; try { var r = c.id ? await API.patch('cases/' + c.id, d) : await API.post('cases', d); close(); toast(c.id ? 'Case updated.' : 'Intake created.', 'ok'); refreshCounts(); go('#/cases/' + r.id); render(); } catch (e) { fail(e); } }; }
    });
  }
  route('cases/:id', { title: 'Case', nav: 'cases', perm: ['intake', 'notes'], render: async function (p) {
    var c = await API.get('cases/' + p.id), staff = can('intake') ? await API.get('staff') : [];
    var info = function (l, v) { return '<div><div class="small muted">' + l + '</div><div><b>' + esc(v || '—') + '</b></div></div>'; };
    var html = '<div class="page-head"><div><a href="#/cases" class="small">← All cases</a><h1>' + esc(c.patientName) + '</h1><div class="row">' + H.badge(c.status) + (c.priority === 'high' ? H.badge('high') : '') + '<span class="muted small">Case #' + c.id + '</span></div></div>' + (can('intake') ? '<button class="btn btn--ghost" id="edit-case">Edit case</button>' : '') + '</div>' +
      '<div class="cards cards--2"><section class="card"><div class="card__head"><h2>Details</h2></div><div class="card__body grid-2">' + info('Date of birth', c.dob ? H.fmtDate(c.dob) : '') + info('Phone', c.phone) + info('Address', [c.address, c.borough].filter(Boolean).join(', ')) + info('Physician', c.physician) + info('Insurance', c.insurance) + info('Referral', [c.referralSource, c.referrerName].filter(Boolean).join(' — ')) + info('Services', (c.services || []).join(', ')) + info('Start of care', c.socDate ? H.fmtDate(c.socDate) : '') + '</div></section>';
    if (can('intake')) {
      html += '<section class="card"><div class="card__head"><h2>Care team</h2></div><div class="card__body"><div class="chips" id="assign">' + staff.filter(function (s) { return s.type === 'field' || s.designation === 'Nursing Supervisor'; }).map(function (s) { return '<label class="chip"><input type="checkbox" value="' + s.id + '"' + (c.assigned.indexOf(s.id) !== -1 ? ' checked' : '') + '>' + esc(s.name) + ' <span class="muted">' + esc(s.designation) + '</span></label>'; }).join('') + '</div><button class="btn btn--sm" id="save-assign" style="margin-top:12px">Save care team</button><p class="small muted" style="margin-top:8px">Assigned field staff see this patient under “My patients” while the case is Active.</p></div></section></div>';
      html += '<section class="card" style="margin-top:18px"><div class="card__head"><h2>Case notes</h2></div><div class="card__body"><form id="cnote" class="row"><input class="input grow" name="body" placeholder="Add a note (call log, insurance update, next steps)…"><button class="btn">Add</button></form></div><ul class="list">' + c.notes.slice().reverse().map(function (n) { return '<li>' + H.avatar(n.userName, 'sm') + '<div class="grow"><div class="small"><b>' + esc(n.userName) + '</b> <span class="muted">' + esc(H.ago(n.createdAt)) + '</span></div><div' + (n.system ? ' class="muted small"' : '') + '>' + H.nl2br(n.body) + '</div></div></li>'; }).join('') + '</ul></section>';
    } else html += '</div>';
    return html;
  }, mount: function (root, p) {
    var e = $('#edit-case'); if (e) e.onclick = async function () { caseForm(await API.get('cases/' + p.id)); };
    var a = $('#save-assign'); if (a) a.onclick = async function () { await API.patch('cases/' + p.id, { assigned: $$('#assign input:checked').map(function (i) { return +i.value; }) }); toast('Care team saved.', 'ok'); };
    var n = $('#cnote'); if (n) n.onsubmit = async function (ev) { ev.preventDefault(); if (!n.body.value.trim()) return; await API.post('cases/' + p.id + '/notes', { body: n.body.value }); render(); };
  } });

  /* ================================================================ visit notes */
  var TASKS = ['Bath / shower', 'Oral hygiene', 'Hair & grooming', 'Toileting', 'Skin care', 'Dressing', 'Meal preparation', 'Assist with feeding', 'Ambulation / transfer', 'ROM exercises', 'Medication reminder', 'Vital signs', 'Light housekeeping', 'Laundry', 'Shopping / errands', 'Accompany to appointment', 'Wound / dressing observed', 'Safety check'];
  route('notes', { title: 'Visit notes', perm: ['notes', 'intake'], render: async function (p, q) {
    var reviewer = can('intake') || can('approvals');
    var notes = await API.get('notes' + (reviewer && q.scope === 'all' ? '?scope=all' : ''));
    return '<div class="page-head"><div><h1>Visit notes</h1><p>Document each visit. Notes are reviewed by the nursing supervisor.</p></div><div class="row">' + (reviewer ? '<div class="tabs" style="margin:0;border:0"><a href="#/notes" class="' + (q.scope !== 'all' ? 'is-active' : '') + '">Mine</a><a href="#/notes?scope=all" class="' + (q.scope === 'all' ? 'is-active' : '') + '">All staff</a></div>' : '') + (can('notes') ? '<button class="btn" id="new-note">' + ico('plus') + 'New visit note</button>' : '') + '</div></div>' + notesTable(notes, reviewer && q.scope === 'all');
  }, mount: function (root, p, q) {
    var b = $('#new-note'); if (b) b.onclick = function () { noteForm(); };
    if (q.new && can('notes')) noteForm(+q.new);
    bindNoteReview(root);
  } });
  function notesTable(notes, review) {
    if (!notes.length) return '<section class="card"><div class="empty">' + ico('note') + '<div>No visit notes yet.</div></div></section>';
    return '<section class="card"><div class="table-wrap"><table class="table table--cards"><thead><tr><th>Date</th><th>Patient</th>' + (review ? '<th>Staff</th>' : '') + '<th>Time</th><th>Tasks</th><th>Status</th><th></th></tr></thead><tbody>' + notes.map(function (n) {
      return '<tr><td data-label="Date">' + esc(H.fmtDate(n.date)) + '</td><td data-label="Patient"><b>' + esc(n.patientName) + '</b></td>' + (review ? '<td data-label="Staff">' + esc(n.userName) + ' <span class="muted small">' + esc(n.designation) + '</span></td>' : '') + '<td data-label="Time">' + H.fmtHM(n.timeIn) + (n.timeOut ? '–' + H.fmtHM(n.timeOut) : '') + '</td><td data-label="Tasks">' + n.tasks.length + ' tasks</td><td data-label="Status">' + H.badge(n.status) + '</td><td><button class="btn btn--ghost btn--sm" data-view-note="' + n.id + '">View</button></td></tr>';
    }).join('') + '</tbody></table></div></section><script type="application/json" id="notes-json">' + JSON.stringify(notes).replace(/</g, '\\u003c') + '</script>';
  }
  function bindNoteReview(root) {
    on(root, 'click', '[data-view-note]', function (e, b) {
      var notes = JSON.parse(($('#notes-json') || {}).textContent || '[]'), n = notes.find(function (x) { return x.id === +b.dataset.viewNote; }); if (!n) return;
      var reviewer = (can('intake') || can('approvals')) && n.status !== 'reviewed';
      modal('Visit note — ' + n.patientName, '<div class="modal__body stack"><div class="grid-3"><div><div class="small muted">Date</div><b>' + esc(H.fmtDate(n.date)) + '</b></div><div><div class="small muted">Time</div><b>' + H.fmtHM(n.timeIn) + '–' + H.fmtHM(n.timeOut) + '</b></div><div><div class="small muted">Staff</div><b>' + esc(n.userName) + '</b></div></div><div><div class="small muted">Tasks completed</div><div class="chips" style="margin-top:6px">' + n.tasks.map(function (t) { return '<span class="badge badge--brand">' + esc(t) + '</span>'; }).join('') + '</div></div>' + (n.condition ? '<div><div class="small muted">Patient condition</div><b>' + esc(n.condition) + '</b></div>' : '') + '<div><div class="small muted">Notes</div><div class="doc">' + esc(n.narrative || '—') + '</div></div><div><div class="small muted">Signed</div><div class="signature">' + esc(n.signature) + '</div></div>' + (n.status === 'reviewed' ? '<div class="alert alert--ok">Reviewed' + (n.reviewNote ? ': ' + esc(n.reviewNote) : '') + '</div>' : '') + (reviewer ? '<label class="field"><span>Review comment</span><input class="input" id="rv-note"></label>' : '') + '</div><div class="modal__foot"><button class="btn btn--ghost no-print" onclick="window.print()">Print</button>' + (reviewer ? '<button class="btn btn--ok" id="rv">Mark reviewed</button>' : '') + '</div>', {
        mount: function (w, close) { var r = $('#rv', w); if (r) r.onclick = async function () { await API.patch('notes/' + n.id, { status: 'reviewed', reviewNote: $('#rv-note', w).value }); close(); toast('Note reviewed.', 'ok'); render(); }; }
      });
    });
  }
  async function noteForm(caseId) {
    var cases = await API.get('cases');
    if (!cases.length) { toast('No patients are assigned to you yet.'); return; }
    modal('New visit note', '<form class="modal__body stack" id="note-form"><div class="grid-2"><label class="field"><span>Patient</span><select class="input" name="caseId" required>' + cases.map(function (c) { return '<option value="' + c.id + '"' + (c.id === caseId ? ' selected' : '') + '>' + esc(c.patientName) + '</option>'; }).join('') + '</select></label><label class="field"><span>Date</span><input class="input" type="date" name="date" value="' + H.ymd() + '"></label><label class="field"><span>Time in</span><input class="input" type="time" name="timeIn" required></label><label class="field"><span>Time out</span><input class="input" type="time" name="timeOut" required></label></div>' +
      '<div class="field"><span class="label">Tasks completed</span><div class="chips">' + TASKS.map(function (t) { return '<label class="chip"><input type="checkbox" name="tasks[]" value="' + esc(t) + '">' + esc(t) + '</label>'; }).join('') + '</div></div>' +
      '<label class="field"><span>Patient condition</span><select class="input" name="condition"><option>Stable — no changes</option><option>Change observed — reported to RN</option><option>Patient refused care</option><option>Patient not home</option></select></label><label class="field"><span>Notes</span><textarea class="input" name="narrative" placeholder="What happened during the visit? Anything the nurse should know?"></textarea></label><label class="field"><span>Signature (type your full name)</span><input class="input signature" name="signature" value="' + esc(state.user.name) + '" required></label></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="note-save">' + ico('send') + 'Submit note</button></div>', {
      wide: true, mount: function (w, close) { $('#note-save', w).onclick = async function () { var d = H.formData($('#note-form', w)); d.tasks = d.tasks || []; try { await submitting(function () { return API.post('notes', d); }); close(); if (location.hash.indexOf('#/notes') === 0) go('#/notes'); else render(); } catch (e) { /* shown */ } }; }
    });
  }

  /* ================================================================ chat */
  route('chat', { title: 'Chat', perm: 'chat', render: function () { return chatShell(null); }, mount: function (root) { chatMount(root, null); } });
  route('chat/:id', { title: 'Chat', nav: 'chat', perm: 'chat', render: function (p) { return chatShell(+p.id); }, mount: function (root, p) { chatMount(root, +p.id); } });
  function chatShell(id) {
    return '<section class="card chat' + (id ? ' has-active' : '') + '"><div class="chat__list"><div class="card__head"><h2>Messages</h2><button class="btn btn--sm" id="new-chat">' + ico('plus') + 'New</button></div><div id="conv-list"><div class="loading"><div class="spinner"></div></div></div></div>' +
      '<div class="chat__pane">' + (id ? '<div class="chat__head"><a href="#/chat" class="btn btn--ghost btn--icon btn--sm" aria-label="Back to conversations">' + ico('left') + '</a><div id="chat-title" class="grow"><b>…</b></div></div><div class="chat__msgs" id="msgs" aria-live="polite"></div><form class="chat__compose" id="compose"><textarea class="input" name="body" placeholder="Write a message…" rows="1" aria-label="Message"></textarea><button class="btn btn--icon" aria-label="Send">' + ico('send') + '</button></form>' : '<div class="empty" style="margin:auto">' + ico('chat') + '<h2>Select a conversation</h2><p>' + (state.user.type === 'field' ? 'You can message anyone in the office.' : 'Message coworkers and field staff.') + '</p></div>') + '</div></section>';
  }
  async function chatMount(root, id) {
    var lastId = 0, convs = [];
    async function loadList() {
      convs = await API.get('chat/conversations');
      $('#conv-list').innerHTML = convs.length ? convs.map(function (c) { return '<a class="chat__item' + (c.id === id ? ' is-active' : '') + '" href="#/chat/' + c.id + '">' + H.avatar(c.title) + '<div class="grow"><div class="row row--between" style="gap:6px"><b>' + esc(c.title) + '</b><small class="muted">' + (c.lastMessage ? esc(H.ago(c.lastMessage.at)) : '') + '</small></div><small>' + esc(c.lastMessage ? c.lastMessage.body : c.subtitle) + '</small></div>' + (c.unread ? '<span class="count badge badge--bad">' + c.unread + '</span>' : '') + '</a>'; }).join('') : '<div class="empty">No conversations yet.</div>';
      if (id) { var c = convs.find(function (x) { return x.id === id; }); if (c) $('#chat-title').innerHTML = '<b>' + esc(c.title) + '</b><div class="small muted">' + esc(c.subtitle) + '</div>'; }
    }
    async function loadMsgs() {
      var msgs = await API.get('chat/conversations/' + id + '/messages?after=' + lastId); if (!msgs.length) return;
      var box = $('#msgs'); if (!box) return; var atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
      box.insertAdjacentHTML('beforeend', msgs.map(function (m) { var mine = m.userId === state.user.id; return '<div class="msg' + (mine ? ' msg--me' : '') + '">' + (!mine ? '<div class="msg__who">' + esc(m.userName) + '</div>' : '') + esc(m.body) + '<small>' + esc(H.fmtTime(m.createdAt)) + '</small></div>'; }).join(''));
      lastId = msgs[msgs.length - 1].id; if (atBottom || lastId) box.scrollTop = box.scrollHeight;
    }
    await loadList();
    if (id) {
      await loadMsgs(); refreshCounts();
      var f = $('#compose'), ta = f.body;
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } });
      f.onsubmit = async function (e) { e.preventDefault(); var body = ta.value.trim(); if (!body) return; ta.value = ''; try { await API.post('chat/conversations/' + id + '/messages', { body: body }); await loadMsgs(); loadList(); } catch (err) { ta.value = body; fail(err); } };
      ta.focus();
      state.pollers.push(setInterval(function () { loadMsgs().catch(function () {}); }, 4000));
    }
    state.pollers.push(setInterval(function () { loadList().catch(function () {}); }, 10000));
    $('#new-chat').onclick = async function () {
      var people = await API.get('chat/directory'), field = state.user.type === 'field';
      modal('New conversation', '<div class="modal__body stack"><input class="input" id="ppl-q" placeholder="Search people"><div id="ppl" class="stack" style="gap:6px;max-height:340px;overflow:auto">' + people.map(function (u) { return '<label class="check perm" data-name="' + esc(u.name.toLowerCase()) + '"><input type="checkbox" value="' + u.id + '">' + H.avatar(u.name, 'sm') + '<span class="grow"><b>' + esc(u.name) + '</b><small>' + esc(u.designation || typeLabel(u)) + '</small></span></label>'; }).join('') + '</div>' + (field ? '<p class="small muted">Field staff can message the office team.</p>' : '<label class="field"><span>Group name <span class="muted">(only for group chats)</span></span><input class="input" id="grp-name"></label>') + '</div><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="start-chat">Start chat</button></div>', {
        mount: function (w, close) {
          $('#ppl-q', w).oninput = function () { var v = this.value.toLowerCase(); $$('[data-name]', w).forEach(function (l) { l.classList.toggle('hidden', l.dataset.name.indexOf(v) === -1); }); };
          $('#start-chat', w).onclick = async function () { var ids = $$('#ppl input:checked', w).map(function (i) { return +i.value; }); if (!ids.length) { toast('Choose at least one person.'); return; } try { var r = await API.post('chat/conversations', { userIds: ids, name: ids.length > 1 ? (($('#grp-name', w) || {}).value || 'Group chat') : '' }); close(); go('#/chat/' + r.id); } catch (e) { fail(e); } };
        }
      });
    };
  }

  /* ================================================================ calendar */
  route('calendar', { title: 'Schedule', perm: ['calendar', 'calendar_manage'], render: async function (p, q) {
    var manage = can('calendar_manage');
    var month = q.month || H.ymd().slice(0, 7), first = month + '-01', start = H.weekStart(first);
    var end = H.addDays(start, 41), scope = manage && q.mine !== '1' ? 'all' : 'mine';
    var shifts = await API.get('shifts?from=' + start + '&to=' + end + (scope === 'all' ? '&scope=all' : '') + (q.user ? '&userId=' + q.user : ''));
    var staff = manage ? await API.get('staff') : [];
    var prev = new Date(first + 'T12:00:00'); prev.setMonth(prev.getMonth() - 1); var next = new Date(first + 'T12:00:00'); next.setMonth(next.getMonth() + 1);
    var nav = '<a class="btn btn--ghost btn--icon btn--sm" href="#/calendar?month=' + H.ymd(prev).slice(0, 7) + (q.user ? '&user=' + q.user : '') + '" aria-label="Previous month">' + ico('left') + '</a><b>' + esc(new Date(first + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })) + '</b><a class="btn btn--ghost btn--icon btn--sm" href="#/calendar?month=' + H.ymd(next).slice(0, 7) + (q.user ? '&user=' + q.user : '') + '" aria-label="Next month">' + ico('right') + '</a><a class="btn btn--ghost btn--sm" href="#/calendar' + (q.user ? '?user=' + q.user : '') + '">Today</a>';
    var html = '<div class="page-head"><div><h1>' + (manage ? 'Schedules' : 'My schedule') + '</h1><p>' + (manage ? 'Office and field staff shifts. Click a day to add a shift.' : 'Your upcoming shifts and visits.') + '</p></div>' + (manage ? '<button class="btn" id="add-shift">' + ico('plus') + 'Add shift</button>' : '') + '</div>';
    var toolbar = '<div class="cal-toolbar">' + nav + '<span class="grow"></span>' + (manage ? '<select class="input" id="cal-user" style="min-height:36px;max-width:240px" aria-label="Filter by employee"><option value="">Everyone</option>' + staff.map(function (s) { return '<option value="' + s.id + '"' + (+q.user === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' : '') + '</div>';
    var types = {}; staff.forEach(function (s) { types[s.id] = s.type; });
    html += '<section class="card" style="overflow:hidden">' + toolbar + '<div class="cal">' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return '<div class="cal__dow">' + d + '</div>'; }).join('');
    for (var i = 0; i < 42; i++) {
      var d = H.addDays(start, i), ds = shifts.filter(function (s) { return s.date === d; });
      html += '<div class="cal__day' + (d.slice(0, 7) !== month ? ' is-out' : '') + (d === H.ymd() ? ' is-today' : '') + '" data-day="' + d + '"><span class="cal__num">' + (+d.slice(8)) + '</span>' + ds.slice(0, 4).map(function (s) { return '<button class="ev' + (types[s.userId] === 'field' ? ' ev--field' : '') + '" data-shift="' + s.id + '" title="' + esc(s.userName + ' · ' + s.title) + '">' + H.fmtHM(s.start).replace(':00', '') + ' ' + esc(scope === 'all' ? s.userName.split(' ')[0] : s.title) + '</button>'; }).join('') + (ds.length > 4 ? '<div class="small muted">+' + (ds.length - 4) + ' more</div>' : '') + '</div>';
    }
    html += '</div></section><script type="application/json" id="shifts-json">' + JSON.stringify(shifts).replace(/</g, '\\u003c') + '</script>';
    return html;
  }, mount: function (root, p, q) {
    var shifts = JSON.parse($('#shifts-json').textContent), manage = can('calendar_manage');
    var u = $('#cal-user'); if (u) u.onchange = function () { go('#/calendar?month=' + (q.month || H.ymd().slice(0, 7)) + (u.value ? '&user=' + u.value : '')); };
    async function shiftForm(s) {
      var staff = await API.get('staff'); s = s || { date: H.ymd(), start: '09:00', end: '17:00', userId: +q.user || '' };
      modal(s.id ? 'Edit shift' : 'Add shift', '<form class="modal__body stack" id="shift-form"><label class="field"><span>Employee</span><select class="input" name="userId" required><option value="">Choose…</option>' + staff.map(function (x) { return '<option value="' + x.id + '"' + (x.id === s.userId ? ' selected' : '') + '>' + esc(x.name) + ' — ' + esc(x.designation || typeLabel(x)) + '</option>'; }).join('') + '</select></label><div class="grid-3"><label class="field"><span>Date</span><input class="input" type="date" name="date" value="' + s.date + '" required></label><label class="field"><span>Start</span><input class="input" type="time" name="start" value="' + s.start + '" required></label><label class="field"><span>End</span><input class="input" type="time" name="end" value="' + s.end + '" required></label></div><div class="grid-2"><label class="field"><span>Title</span><input class="input" name="title" value="' + esc(s.title || '') + '" placeholder="Office / Patient visit"></label><label class="field"><span>Location</span><input class="input" name="location" value="' + esc(s.location || '') + '"></label></div><label class="field"><span>Notes</span><input class="input" name="notes" value="' + esc(s.notes || '') + '"></label>' + (!s.id ? '<label class="field"><span>Repeat weekly for</span><select class="input" name="repeatWeeks"><option value="0">Does not repeat</option>' + [1, 2, 3, 4, 8, 12].map(function (n) { return '<option value="' + n + '">' + n + ' more week' + (n > 1 ? 's' : '') + '</option>'; }).join('') + '</select></label>' : '') + '</form><div class="modal__foot">' + (s.id ? '<button class="btn btn--ghost" id="shift-del" style="margin-right:auto">Delete</button>' : '') + '<button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="shift-save">Save</button></div>', {
        mount: function (w, close) {
          $('#shift-save', w).onclick = async function () { try { var d = H.formData($('#shift-form', w)); if (s.id) await API.patch('shifts/' + s.id, d); else await API.post('shifts', d); close(); toast('Schedule saved. The employee was notified.', 'ok'); render(); } catch (e) { fail(e); } };
          var del = $('#shift-del', w); if (del) del.onclick = async function () { await API.del('shifts/' + s.id); close(); render(); };
        }
      });
    }
    var add = $('#add-shift'); if (add) add.onclick = function () { shiftForm(); };
    on(root, 'click', '[data-shift]', function (e, b) {
      e.stopPropagation(); var s = shifts.find(function (x) { return x.id === +b.dataset.shift; });
      if (manage) shiftForm(s);
      else modal(s.title, '<div class="modal__body stack"><div><b>' + esc(H.fmtDate(s.date, { weekday: 'long', month: 'long', day: 'numeric' })) + '</b><div>' + H.fmtHM(s.start) + ' – ' + H.fmtHM(s.end) + '</div></div>' + (s.location ? '<div>' + ico('pin') + ' ' + esc(s.location) + '</div>' : '') + (s.notes ? '<div class="doc">' + esc(s.notes) + '</div>' : '') + '</div>');
    });
    if (manage) on(root, 'click', '[data-day]', function (e, d) { if (e.target.closest('[data-shift]')) return; shiftForm({ date: d.dataset.day, start: '09:00', end: '17:00', userId: +q.user || '' }); });
  } });

  /* ================================================================ in-services */
  route('inservices', { title: 'In-services', perm: 'inservices', render: async function () {
    var list = await API.get('inservices');
    var done = list.filter(function (i) { return i.myResult && i.myResult.passed; }).length;
    return '<div class="page-head"><div><h1>In-services</h1><p>Required training. Your completions are saved to your employee record.</p></div></div>' +
      '<section class="card" style="margin-bottom:18px"><div class="card__body"><div class="row row--between"><b>' + done + ' of ' + list.length + ' complete</b><span class="small muted">' + list.reduce(function (a, i) { return a + (i.myResult && i.myResult.passed ? i.hours : 0); }, 0) + ' hours earned</span></div><div class="progress" style="margin-top:10px"><i style="width:' + (list.length ? done / list.length * 100 : 0) + '%"></i></div></div></section>' +
      '<section class="card">' + (list.length ? list.map(function (i) {
        var ok = i.myResult && i.myResult.passed;
        return '<div class="course"><div class="course__icon' + (ok ? ' is-done' : '') + '">' + ico(ok ? 'check' : 'grad') + '</div><div class="grow"><b>' + esc(i.title) + '</b><div class="small muted">' + esc(i.description) + '</div><div class="row small" style="margin-top:6px;gap:8px">' + (i.hours ? '<span class="badge badge--muted">' + i.hours + ' hr</span>' : '') + (i.dueDate ? '<span class="badge badge--' + (ok ? 'muted' : (i.dueDate < H.ymd() ? 'bad' : 'warn')) + '">Due ' + esc(H.fmtDate(i.dueDate)) + '</span>' : '') + (i.myResult ? '<span class="badge badge--' + (ok ? 'ok' : 'bad') + '">' + (ok ? 'Passed ' : 'Not passed ') + i.myResult.score + '%</span>' : '') + '</div></div>' + (i.externalUrl ? '<button class="btn btn--sm" data-open-form="' + esc(i.externalUrl) + '" data-title="' + esc(i.title) + '">' + ico('ext') + 'Open</button>' : '<a class="btn btn--sm' + (ok ? ' btn--ghost' : '') + '" href="#/inservices/' + i.id + '">' + (ok ? 'Review' : 'Start') + '</a>') + '</div>';
      }).join('') : '<div class="empty">' + ico('grad') + '<div>No in-services assigned.</div></div>') + '</section>';
  }, mount: function (root) { on(root, 'click', '[data-open-form]', function (e, b) { openForm(b.dataset.openForm, b.dataset.title); }); } });

  route('inservices/:id', { title: 'In-service', nav: 'inservices', perm: 'inservices', render: async function (p) {
    var i = (await API.get('inservices')).find(function (x) { return x.id === +p.id; }); if (!i) throw new Error('In-service not found.');
    return '<div class="page-head"><div><a href="#/inservices" class="small">← All in-services</a><h1>' + esc(i.title) + '</h1><p>' + esc(i.description) + '</p></div></div><div class="stack"><section class="card"><div class="card__head"><h2>1. Read the material</h2>' + (i.hours ? '<span class="badge badge--muted">' + i.hours + ' hr</span>' : '') + '</div><div class="card__body"><div class="doc">' + esc(i.body || 'No reading for this in-service.') + '</div></div></section>' +
      '<form id="quiz" class="card"><div class="card__head"><h2>2. ' + (i.questions.length ? 'Quiz' : 'Confirm') + '</h2>' + (i.questions.length ? '<span class="small muted">Pass score ' + i.passScore + '%</span>' : '') + '</div><div class="card__body stack">' + i.questions.map(function (q, k) { return '<fieldset class="quiz-q"><legend class="sr-only">Question ' + (k + 1) + '</legend><b>' + (k + 1) + '. ' + esc(q.q) + '</b>' + q.options.map(function (o, j) { return '<label><input type="radio" name="q' + k + '" value="' + j + '" required> ' + esc(o) + '</label>'; }).join('') + '</fieldset>'; }).join('') +
      '<label class="field"><span>Signature — type your full name to certify you completed this in-service</span><input class="input signature" name="signature" value="" placeholder="' + esc(state.user.name) + '" required></label><div id="quiz-res"></div><button class="btn btn--lg">' + ico('send') + 'Submit</button></div></form></div>';
  }, mount: function (root, p) {
    var f = $('#quiz'); f.onsubmit = async function (e) {
      e.preventDefault(); var d = H.formData(f), answers = [];
      Object.keys(d).forEach(function (k) { if (k[0] === 'q' && /^q\d+$/.test(k)) answers[+k.slice(1)] = +d[k]; });
      try {
        var r = await submitting(function () { return API.post('inservices/' + p.id + '/complete', { answers: answers, signature: d.signature }); });
        $('#quiz-res').innerHTML = r.passed ? '<div class="alert alert--ok">You passed with ' + r.score + '%. Your completion was recorded.</div>' : '<div class="alert alert--bad">You scored ' + r.score + '% (need ' + r.passScore + '%). Review the material and try again.</div>';
        refreshCounts();
      } catch (err) { /* shown */ }
    };
  } });

  /* ================================================================ orientation */
  route('orientation', { title: 'Orientation', perm: 'orientation', render: async function () {
    var mods = await API.get('orientation'), done = mods.filter(function (m) { return m.ackAt; }).length;
    return '<div class="page-head"><div><h1>New-hire orientation</h1><p>Read each section and sign to acknowledge.</p></div></div><section class="card" style="margin-bottom:18px"><div class="card__body"><div class="row row--between"><b>' + done + ' of ' + mods.length + ' sections signed</b>' + (done === mods.length && mods.length ? '<span class="badge badge--ok">Orientation complete</span>' : '') + '</div><div class="progress" style="margin-top:10px"><i style="width:' + (mods.length ? done / mods.length * 100 : 0) + '%"></i></div></div></section><section class="card">' +
      mods.map(function (m, k) { return '<div class="course"><div class="course__icon' + (m.ackAt ? ' is-done' : '') + '">' + (m.ackAt ? ico('check') : '<b>' + (k + 1) + '</b>') + '</div><div class="grow"><b>' + esc(m.title) + '</b><div class="small muted">' + (m.ackAt ? 'Signed ' + esc(H.fmtDate(m.ackAt)) : 'Not signed yet') + '</div></div><button class="btn btn--sm' + (m.ackAt ? ' btn--ghost' : '') + '" data-mod="' + m.id + '">' + (m.ackAt ? 'Review' : 'Open') + '</button></div>'; }).join('') + '</section><script type="application/json" id="mods-json">' + JSON.stringify(mods).replace(/</g, '\\u003c') + '</script>';
  }, mount: function (root) {
    var mods = JSON.parse($('#mods-json').textContent);
    on(root, 'click', '[data-mod]', function (e, b) {
      var m = mods.find(function (x) { return x.id === +b.dataset.mod; });
      modal(m.title, '<div class="modal__body stack"><div class="doc">' + esc(m.body) + '</div>' + (m.ackAt ? '<div class="alert alert--ok">You signed this section on ' + esc(H.fmtDate(m.ackAt)) + '.</div>' : '<label class="check"><input type="checkbox" id="ack-c"> I have read and understand this section.</label><label class="field"><span>Signature (type your full name)</span><input class="input signature" id="ack-s"></label>') + '</div>' + (m.ackAt ? '' : '<div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="ack">Sign &amp; continue</button></div>'), {
        wide: true, mount: function (w, close) { var a = $('#ack', w); if (a) a.onclick = async function () { if (!$('#ack-c', w).checked) { toast('Please confirm you read this section.'); return; } try { await submitting(function () { return API.post('orientation/' + m.id + '/ack', { signature: $('#ack-s', w).value }); }); close(); render(); } catch (err) { /* shown */ } }; }
      });
    });
  } });

  /* ================================================================ applications */
  route('application', { title: 'My application', render: async function () {
    var a = await API.get('application'), d = (a && a.data) || {}, locked = a && a.status !== 'draft';
    if (locked) {
      var msg = { submitted: ['info', 'Your application was received. Our HR team will contact you soon.'], approved: ['ok', 'Congratulations! Your application was approved. Sign out and back in to see your new portal.'], rejected: ['bad', 'Thank you for applying. We are not able to move forward at this time.' + (a.decisionNote ? ' ' + a.decisionNote : '')] }[a.status];
      return '<div class="page-head"><div><h1>My application</h1></div>' + H.badge(a.status) + '</div><div class="alert alert--' + msg[0] + '" style="margin-bottom:18px">' + esc(msg[1]) + '</div>' + appSummary(d) + packetCard();
    }
    var f = function (n, l, t) { return '<label class="field"><span>' + l + '</span><input class="input" name="' + n + '" type="' + (t || 'text') + '" value="' + esc(d[n] || '') + '"></label>'; };
    return '<div class="page-head"><div><h1>Employment application</h1><p>Your email is verified. Complete the form below — you can save a draft and come back.</p></div></div><form id="app-form" class="stack"><section class="card"><div class="card__head"><h2>Position</h2></div><div class="card__body grid-2"><label class="field"><span>Position applying for *</span><select class="input" name="position">' + ['', 'PCA', 'HHA', 'LPN', 'RN', 'Physical Therapist', 'Occupational Therapist', 'Office / Administrative'].map(function (o) { return '<option' + (d.position === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' + f('availability', 'Availability * (days / hours)') + f('boroughs', 'Boroughs you can work in') + f('languages', 'Languages spoken') + '</div></section>' +
      '<section class="card"><div class="card__head"><h2>Credentials &amp; experience</h2></div><div class="card__body grid-2">' + f('certification', 'Certification / license type') + f('licenseNumber', 'Certificate / license number') + '<label class="field full"><span>Work experience *</span><textarea class="input" name="experience" placeholder="Agency, role, dates and duties">' + esc(d.experience || '') + '</textarea></label><label class="field full"><span>References (name, relationship, phone)</span><textarea class="input" name="references">' + esc(d.references || '') + '</textarea></label><label class="field"><span>Are you authorized to work in the U.S.?</span><select class="input" name="workAuth"><option value=""></option><option value="yes"' + (d.workAuth === 'yes' ? ' selected' : '') + '>Yes</option><option value="no"' + (d.workAuth === 'no' ? ' selected' : '') + '>No</option></select></label></div></section>' +
      '<section class="card"><div class="card__head"><h2>Attestation</h2></div><div class="card__body stack"><label class="check"><input type="checkbox" name="attestation" value="1"' + (d.attestation ? ' checked' : '') + '> I certify that the information in this application is true and complete. I understand that false information may disqualify me from employment.</label><label class="field"><span>Signature (type your full name) *</span><input class="input signature" name="signature" value="' + esc(d.signature || '') + '"></label><div class="row"><button type="button" class="btn btn--ghost" id="app-draft">Save draft</button><button type="submit" class="btn btn--lg">' + ico('send') + 'Submit application</button></div></div></section></form>' + packetCard();
  }, mount: function (root) {
    var f = $('#app-form');
    on(root, 'click', '[data-open-form]', function (e, b) { openForm(b.dataset.openForm, b.dataset.title); });
    if (!f) return;
    function data() { var d = H.formData(f); d.attestation = !!d.attestation; return d; }
    $('#app-draft').onclick = async function () { try { await API.put('application', { data: data() }); toast('Draft saved.', 'ok'); } catch (e) { fail(e); } };
    f.onsubmit = async function (e) { e.preventDefault(); try { await submitting(function () { return API.put('application', { data: data(), submit: true }); }); render(); } catch (err) { /* shown */ } };
  } });
  function packetCard() { return '<section class="card" style="margin-top:18px"><div class="course"><div class="course__icon">' + ico('form') + '</div><div class="grow"><b>Full employment packet</b><div class="small muted">References, health assessment, skills checklist and license upload. HR may ask you to complete this after reviewing your application.</div></div><button class="btn btn--sm" data-open-form="forms/employment-application.html" data-title="Employment application packet">' + ico('ext') + 'Open</button></div></section>'; }
  function appSummary(d) {
    var r = function (l, v) { return v ? '<div><div class="small muted">' + l + '</div><div>' + H.nl2br(v) + '</div></div>' : ''; };
    return '<section class="card"><div class="card__body grid-2">' + r('Position', d.position) + r('Availability', d.availability) + r('Boroughs', d.boroughs) + r('Languages', d.languages) + r('Certification', d.certification) + r('License #', d.licenseNumber) + '<div class="full">' + r('Experience', d.experience) + '</div><div class="full">' + r('References', d.references) + '</div>' + r('Authorized to work', d.workAuth) + (d.signature ? '<div><div class="small muted">Signed</div><div class="signature">' + esc(d.signature) + '</div></div>' : '') + '</div></section>';
  }
  route('applications', { title: 'Applications', perm: 'applications', render: async function (p, q) {
    var list = await API.get('applications'), tab = q.tab || 'submitted';
    var shown = list.filter(function (a) { return tab === 'all' || a.status === tab; });
    return '<div class="page-head"><div><h1>Applications</h1><p>Applicants verified their email before applying.</p></div></div><div class="tabs">' + [['submitted', 'Waiting'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']].map(function (t) { return '<a href="#/applications?tab=' + t[0] + '" class="' + (tab === t[0] ? 'is-active' : '') + '">' + t[1] + ' (' + list.filter(function (a) { return t[0] === 'all' || a.status === t[0]; }).length + ')</a>'; }).join('') + '</div>' +
      '<section class="card">' + (shown.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Applicant</th><th>Position</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>' + shown.map(function (a) { return '<tr><td data-label="Applicant"><b>' + esc(a.userName) + '</b><div class="small muted">' + esc(a.email) + '</div></td><td data-label="Position">' + esc(a.data.position) + '</td><td data-label="Submitted">' + esc(H.fmtDate(a.submittedAt)) + '</td><td data-label="Status">' + H.badge(a.status) + '</td><td><button class="btn btn--sm btn--ghost" data-app="' + a.id + '">Review</button></td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('brief') + '<div>Nothing here.</div></div>') + '</section><script type="application/json" id="apps-json">' + JSON.stringify(list).replace(/</g, '\\u003c') + '</script>';
  }, mount: async function (root) {
    var list = JSON.parse($('#apps-json').textContent), des = await API.get('designations');
    on(root, 'click', '[data-app]', function (e, b) {
      var a = list.find(function (x) { return x.id === +b.dataset.app; });
      modal(a.userName + ' — ' + a.data.position, '<div class="modal__body stack"><div class="row small muted">' + esc(a.email) + (a.phone ? ' · ' + esc(a.phone) : '') + ' · Email verified ✓</div>' + appSummary(a.data) +
        (a.status === 'submitted' ? '<section class="card"><div class="card__body stack"><h3>Decision</h3><label class="field"><span>Hire as</span><select class="input" id="dec-des">' + des.filter(function (d) { return d.type === 'field'; }).map(function (d) { return '<option' + (d.name === a.data.position ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join('') + '</select></label><label class="check"><input type="checkbox" id="dec-or" checked> Allow orientation</label><label class="check"><input type="checkbox" id="dec-ts"> Allow timesheet</label><label class="field"><span>Message to applicant (optional)</span><textarea class="input" id="dec-note" rows="3"></textarea></label></div></section>' : (a.decisionNote ? '<div class="alert alert--info">' + esc(a.decisionNote) + '</div>' : '')) + '</div>' +
        (a.status === 'submitted' ? '<div class="modal__foot"><button class="btn btn--ghost" id="rej">Reject</button><button class="btn btn--ok" id="acc">' + ico('check') + 'Approve &amp; hire</button></div>' : ''), {
        wide: true, mount: function (w, close) {
          async function decide(dec) { try { await submitting(function () { return API.post('applications/' + a.id + '/decision', { decision: dec, designation: $('#dec-des', w).value, allowOrientation: $('#dec-or', w).checked, allowTimesheet: $('#dec-ts', w).checked, note: $('#dec-note', w).value }); }); close(); refreshCounts(); render(); } catch (err) { /* shown */ } }
          var acc = $('#acc', w); if (acc) { acc.onclick = function () { decide('approve'); }; $('#rej', w).onclick = function () { decide('reject'); }; }
        }
      });
    });
  } });

  /* ================================================================ forms hub */
  var FORMS = [
    { file: 'forms/duty-sheet.html', title: 'HHA / PCA Duty Sheet', desc: 'Weekly duty sheet with client & aide signatures. Submits a signed PDF.', icon: 'sheet', show: function () { return can('forms') || can('timesheet'); } },
    { file: 'forms/patient-assessment.html', title: 'Patient Assessment', desc: 'RN / LPN patient assessment with offline drafts. Submits a signed PDF.', icon: 'heart', show: function () { return can('forms') && (state.user.type !== 'field' || /RN|LPN/.test(state.user.designation)); } },
    { file: 'forms/inservice-training.html', title: 'In-Service Training Center', desc: 'Full in-service library with certificates.', icon: 'grad', show: function () { return can('inservices') || can('training_manage'); } },
    { file: 'forms/employment-application.html', title: 'Employment Application Packet', desc: 'Application, references, health assessment and competency checklist.', icon: 'brief', show: function () { return can('applications') || isApplicant(); } },
    { file: 'forms/workspace-app.html', title: 'CHCS Workspace App', desc: 'Agency Google Workspace tool (sign in with your @completehcs.com account).', icon: 'ext', show: function () { return state.user.type === 'office' || state.user.type === 'admin'; } }
  ];
  route('forms', { title: 'Forms', perm: ['forms', 'inservices'], render: function () {
    var list = FORMS.filter(function (f) { return f.show(); });
    return '<div class="page-head"><div><h1>Forms</h1><p>Agency forms. Each one submits directly to the office when you tap Submit.</p></div></div>' + (CFG.mode === 'demo' ? '<div class="alert alert--warn" style="margin-bottom:16px">' + ico('shield') + '<span>Heads up: even in this demo, these forms are live. Submitting one sends it to the agency\'s real Google Apps Script. Only submit test data your office expects.</span></div>' : '') + '<div class="tiles">' + list.map(function (f) { return '<a class="tile" href="#" data-open-form="' + f.file + '" data-title="' + esc(f.title) + '"><div class="course__icon">' + ico(f.icon) + '</div><b>' + esc(f.title) + '</b><span class="small muted">' + esc(f.desc) + '</span></a>'; }).join('') + '</div>';
  }, mount: function (root) { on(root, 'click', '[data-open-form]', function (e, b) { e.preventDefault(); openForm(b.dataset.openForm, b.dataset.title); }); } });
  function openForm(file, title) {
    var url = /^https?:/.test(file) ? file : ASSET + file;
    var w = document.createElement('div'); w.className = 'frame-wrap';
    w.innerHTML = '<div class="frame-wrap__bar"><button class="btn btn--ghost btn--sm" id="fw-close">' + ico('left') + 'Back to portal</button><b class="grow">' + esc(title || 'Form') + '</b></div><iframe src="' + esc(url) + '" title="' + esc(title || 'Form') + '" allow="geolocation; camera; microphone"></iframe>';
    document.body.appendChild(w); document.body.style.overflow = 'hidden';
    $('#fw-close', w).onclick = function () { w.remove(); document.body.style.overflow = ''; };
  }

  /* ================================================================ profile */
  route('profile', { title: 'My profile', render: function () {
    var u = state.user;
    return '<div class="page-head"><div class="row">' + H.avatar(u.name, 'lg') + '<div><h1 style="margin:0">' + esc(u.name) + '</h1><div class="muted">' + esc(u.designation || typeLabel(u)) + ' · ' + esc(u.email) + '</div></div></div></div><div class="cards cards--2"><form class="card" id="prof"><div class="card__head"><h2>Contact details</h2></div><div class="card__body stack"><label class="field"><span>Full name</span><input class="input" name="name" value="' + esc(u.name) + '"></label><label class="field"><span>Mobile phone</span><input class="input" name="phone" value="' + esc(u.phone || '') + '"></label><button class="btn">Save</button></div></form>' +
      '<form class="card" id="pw"><div class="card__head"><h2>Change password</h2></div><div class="card__body stack"><label class="field"><span>Current password</span><input class="input" type="password" name="currentPassword" autocomplete="current-password"></label><label class="field"><span>New password</span><input class="input" type="password" name="newPassword" minlength="8" autocomplete="new-password"></label><button class="btn">Update password</button></div></form></div>' +
      '<section class="card" style="margin-top:18px"><div class="card__head"><h2>My access</h2></div><div class="card__body"><div class="chips">' + (u.permissions.length ? u.permissions.map(function (p) { var m = MODULES.find(function (x) { return x[0] === p; }); return '<span class="badge badge--brand">' + esc(m ? m[1] : p) + '</span>'; }).join('') : '<span class="muted">No modules yet.</span>') + '</div><p class="small muted" style="margin-top:10px">Need something else? Ask your administrator.</p></div></section>' +
      '<section class="card" style="margin-top:18px"><div class="course"><div class="course__icon">' + ico('phone') + '</div><div class="grow"><b>Use the portal as an app</b><div class="small muted">Install it on your phone\'s home screen for one-tap access. On iPhone: tap Share → Add to Home Screen. On Android: tap Install.</div></div><button class="btn btn--sm" id="inst">Install</button></div></section>';
  }, mount: function () {
    $('#prof').onsubmit = async function (e) { e.preventDefault(); try { state.user = (await API.patch('me', H.formData(e.target))).user; toast('Profile saved.', 'ok'); renderShell('profile'); } catch (err) { fail(err); } };
    $('#pw').onsubmit = async function (e) { e.preventDefault(); try { await API.patch('me', H.formData(e.target)); e.target.reset(); toast('Password updated.', 'ok'); } catch (err) { fail(err); } };
    $('#inst').onclick = installApp;
  } });

  /* ================================================================ admin: users */
  route('admin/users', { title: 'Users & access', nav: 'admin-users', perm: 'users', render: async function (p, q) {
    var users = await API.get('users'), tab = q.tab || (users.some(function (u) { return u.status === 'pending'; }) ? 'pending' : 'active'), term = (q.q || '').toLowerCase();
    var shown = users.filter(function (u) { return (tab === 'all' || u.status === tab) && (!term || (u.name + u.email + u.designation).toLowerCase().indexOf(term) !== -1); });
    return '<div class="page-head"><div><h1>Users &amp; access</h1><p>Approve accounts, set designations and control what each person can open.</p></div><button class="btn" id="invite">' + ico('plus') + 'Invite user</button></div><div class="tabs">' + [['pending', 'Waiting approval'], ['active', 'Active'], ['unverified', 'Unverified email'], ['suspended', 'Suspended'], ['rejected', 'Rejected'], ['all', 'All']].map(function (t) { var n = users.filter(function (u) { return t[0] === 'all' || u.status === t[0]; }).length; return '<a href="#/admin/users?tab=' + t[0] + '" class="' + (tab === t[0] ? 'is-active' : '') + '">' + t[1] + ' (' + n + ')</a>'; }).join('') + '</div>' +
      '<section class="card"><div class="card__head"><form id="u-search" class="grow"><input class="input" name="q" placeholder="Search name, email or designation" value="' + esc(q.q || '') + '"></form></div>' + (shown.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Name</th><th>Type</th><th>Designation</th><th>Access</th><th>Status</th><th></th></tr></thead><tbody>' + shown.map(function (u) {
        return '<tr><td data-label="Name"><div class="row" style="gap:10px;flex-wrap:nowrap">' + H.avatar(u.name, 'sm') + '<div><b>' + esc(u.name) + '</b><div class="small muted">' + esc(u.email) + '</div></div></div></td><td data-label="Type">' + esc(typeLabel(u)) + '</td><td data-label="Designation">' + esc(u.designation || '—') + '</td><td data-label="Access"><span class="small">' + (u.type === 'admin' ? 'Everything' : u.permissions.length + ' modules') + (u.customPermissions ? ' <span class="badge badge--brand">custom</span>' : '') + '</span></td><td data-label="Status">' + H.badge(u.status) + '</td><td class="nowrap">' + (u.status === 'pending' ? '<button class="btn btn--ok btn--sm" data-approve="' + u.id + '">Approve</button> ' : '') + '<button class="btn btn--ghost btn--sm" data-user="' + u.id + '">Manage</button></td></tr>';
      }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('users') + '<div>No users here.</div></div>') + '</section><script type="application/json" id="users-json">' + JSON.stringify(users).replace(/</g, '\\u003c') + '</script>';
  }, mount: async function (root, p, q) {
    var users = JSON.parse($('#users-json').textContent), des = await API.get('designations');
    $('#u-search').onsubmit = function (e) { e.preventDefault(); go('#/admin/users?tab=' + (q.tab || 'all') + '&q=' + encodeURIComponent(e.target.q.value)); };
    on(root, 'click', '[data-approve]', async function (e, b) { await API.patch('users/' + b.dataset.approve, { status: 'active' }); toast('Account approved. The user was emailed.', 'ok'); refreshCounts(); render(); });
    on(root, 'click', '[data-user]', function (e, b) { userEditor(users.find(function (u) { return u.id === +b.dataset.user; }), des); });
    $('#invite').onclick = function () {
      modal('Invite user', '<form class="modal__body stack" id="inv"><div class="grid-2"><label class="field"><span>Full name</span><input class="input" name="name" required></label><label class="field"><span>Email</span><input class="input" type="email" name="email" required></label><label class="field"><span>Type</span><select class="input" name="type" id="inv-type"><option value="office">Office</option><option value="field">Field staff</option>' + (state.user.type === 'admin' ? '<option value="admin">Administrator</option>' : '') + '</select></label><label class="field"><span>Designation</span><select class="input" name="designation" id="inv-des"></select></label></div><p class="small muted">They\'ll get an email with a link to set their password. Their account is active right away.</p></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="inv-go">Send invite</button></div>', {
        mount: function (w, close) {
          function sync() { var t = $('#inv-type', w).value; $('#inv-des', w).innerHTML = t === 'admin' ? '<option>Administrator</option>' : des.filter(function (d) { return d.type === t; }).map(function (d) { return '<option>' + esc(d.name) + '</option>'; }).join(''); }
          $('#inv-type', w).onchange = sync; sync();
          $('#inv-go', w).onclick = async function () { try { await API.post('users', H.formData($('#inv', w))); close(); toast('Invitation sent.', 'ok'); render(); } catch (e) { fail(e); } };
        }
      });
    };
  } });
  function permMatrix(selected, disabled) {
    var groups = {}; MODULES.forEach(function (m) { (groups[m[2]] = groups[m[2]] || []).push(m); });
    return Object.keys(groups).map(function (g) { return '<div class="perm-group"><h4>' + esc(g) + '</h4><div class="perm-grid">' + groups[g].map(function (m) { return '<label class="perm"><input type="checkbox" name="perm" value="' + m[0] + '"' + (selected.indexOf(m[0]) !== -1 ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span><b>' + esc(m[1]) + '</b><small>' + esc(m[3]) + '</small></span></label>'; }).join('') + '</div></div>'; }).join('');
  }
  function userEditor(u, des) {
    var isAdmin = u.type === 'admin';
    modal('Manage ' + u.name, '<form class="modal__body stack" id="ue"><div class="grid-3"><label class="field"><span>Status</span><select class="input" name="status">' + ['active', 'pending', 'suspended', 'rejected'].map(function (s) { return '<option' + (u.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + (u.status === 'unverified' ? '<option selected disabled>unverified</option>' : '') + '</select></label><label class="field"><span>Type</span><select class="input" name="type" id="ue-type">' + ['office', 'field', 'applicant'].concat(state.user.type === 'admin' ? ['admin'] : []).map(function (t) { return '<option value="' + t + '"' + (u.type === t ? ' selected' : '') + '>' + typeLabel({ type: t }) + '</option>'; }).join('') + '</select></label><label class="field"><span>Designation</span><select class="input" name="designation" id="ue-des"></select></label></div>' +
      '<div class="field"><span class="label">Module access</span><label class="check" style="margin:6px 0 12px"><input type="checkbox" id="ue-custom"' + (u.customPermissions ? ' checked' : '') + (isAdmin ? ' disabled' : '') + '> Customize for this person <span class="muted small">(otherwise uses the designation\'s defaults)</span></label><div id="ue-perms"></div></div><p class="small muted">Account created ' + esc(H.fmtDate(u.createdAt)) + ' · Email ' + (u.emailVerified ? 'verified' : 'not verified') + '</p></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="ue-save">Save changes</button></div>', {
      wide: true, mount: function (w, close) {
        var type = $('#ue-type', w), dsel = $('#ue-des', w), custom = $('#ue-custom', w);
        function syncDes() { var t = type.value; dsel.innerHTML = t === 'admin' ? '<option>Administrator</option>' : t === 'applicant' ? '<option value="">—</option>' : des.filter(function (d) { return d.type === t; }).map(function (d) { return '<option' + (d.name === u.designation ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join(''); }
        function syncPerms() {
          var t = type.value, defaults = t === 'admin' ? MODULES.map(function (m) { return m[0]; }) : ((des.find(function (d) { return d.name === dsel.value; }) || {}).permissions || []);
          var sel = custom.checked && t !== 'admin' ? (u.customPermissions ? u.permissions : defaults) : defaults;
          $('#ue-perms', w).innerHTML = permMatrix(sel, !custom.checked || t === 'admin' || t === 'applicant');
        }
        type.onchange = function () { syncDes(); syncPerms(); }; dsel.onchange = syncPerms; custom.onchange = syncPerms; syncDes(); syncPerms();
        $('#ue-save', w).onclick = async function () {
          var d = H.formData($('#ue', w)); delete d.perm;
          d.permissions = custom.checked && type.value !== 'admin' ? $$('input[name=perm]:checked', w).map(function (i) { return i.value; }) : null;
          try { await API.patch('users/' + u.id, d); close(); toast('Saved.', 'ok'); if (u.id === state.user.id) state.user = (await API.get('me')).user; refreshCounts(); render(); } catch (e) { fail(e); }
        };
      }
    });
  }

  /* ================================================================ admin: designations */
  route('admin/designations', { title: 'Designations', nav: 'admin-designations', perm: 'users', render: async function () {
    var des = await API.get('designations');
    return '<div class="page-head"><div><h1>Designations</h1><p>Job titles and the access each one gets by default. You can still customize individual users.</p></div><button class="btn" id="new-des">' + ico('plus') + 'New designation</button></div>' + ['office', 'field'].map(function (t) {
      return '<section class="card" style="margin-bottom:18px"><div class="card__head"><h2>' + (t === 'office' ? 'Office designations' : 'Field designations') + '</h2></div><ul class="list">' + des.filter(function (d) { return d.type === t; }).map(function (d) { return '<li><div class="course__icon">' + ico('tag') + '</div><div class="grow"><b>' + esc(d.name) + '</b><div class="small muted">' + d.permissions.map(function (p) { var m = MODULES.find(function (x) { return x[0] === p; }); return m ? m[1] : p; }).join(' · ') + '</div></div><button class="btn btn--ghost btn--sm" data-des="' + d.id + '">Edit</button></li>'; }).join('') + '</ul></section>';
    }).join('') + '<script type="application/json" id="des-json">' + JSON.stringify(des).replace(/</g, '\\u003c') + '</script>';
  }, mount: function (root) {
    var des = JSON.parse($('#des-json').textContent);
    function editor(d) {
      d = d || { name: '', type: 'office', permissions: ['chat', 'calendar'] };
      modal(d.id ? 'Edit ' + d.name : 'New designation', '<form class="modal__body stack" id="de"><div class="grid-2"><label class="field"><span>Name</span><input class="input" name="name" value="' + esc(d.name) + '" required></label><label class="field"><span>Type</span><select class="input" name="type"><option value="office">Office</option><option value="field"' + (d.type === 'field' ? ' selected' : '') + '>Field</option></select></label></div><div class="field"><span class="label">Default access</span>' + permMatrix(d.permissions) + '</div></form><div class="modal__foot">' + (d.id ? '<button class="btn btn--ghost" id="de-del" style="margin-right:auto">Delete</button>' : '') + '<button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="de-save">Save</button></div>', {
        wide: true, mount: function (w, close) {
          $('#de-save', w).onclick = async function () { var f = H.formData($('#de', w)); var body = { name: f.name, type: f.type, permissions: $$('input[name=perm]:checked', w).map(function (i) { return i.value; }) }; try { if (d.id) await API.patch('designations/' + d.id, body); else await API.post('designations', body); close(); toast('Saved.', 'ok'); render(); } catch (e) { fail(e); } };
          var del = $('#de-del', w); if (del) del.onclick = async function () { try { await API.del('designations/' + d.id); close(); render(); } catch (e) { fail(e); } };
        }
      });
    }
    $('#new-des').onclick = function () { editor(); };
    on(root, 'click', '[data-des]', function (e, b) { editor(des.find(function (d) { return d.id === +b.dataset.des; })); });
  } });

  /* ================================================================ admin: email & API */
  var TEMPLATES = [['verify', 'Email verification', 'Sent when someone creates an account (required for sign-up to work)'], ['password_reset', 'Password reset', 'Forgot-password links and invitations'], ['signup_admin', 'New account alert (to admin)', 'When a verified account is waiting for approval'], ['account_decision', 'Account approved / rejected', 'Tells the user the outcome'], ['application_received', 'Application received', 'Confirmation to applicant + alert to admin'], ['application_decision', 'Application decision', 'Hire or reject message'], ['time_decision', 'Time approved / rejected', 'When a manager decides on hours'], ['shift_assigned', 'Shift scheduled', 'When a shift is added for an employee'], ['inservice_assigned', 'In-service assigned', 'When new training is published'], ['new_post', 'New staff post', 'Emails every staff member when a staff post is published']];
  route('admin/email', { title: 'Email & API', nav: 'admin-email', perm: 'settings', render: async function () {
    var s = await API.get('settings/email'), log = await API.get('emails');
    return '<div class="page-head"><div><h1>Email &amp; API</h1><p>Connect Resend to send automatic emails reliably, and choose which emails are sent.</p></div></div><form id="em" class="stack"><section class="card"><div class="card__head"><h2>Delivery</h2>' + (s.provider === 'resend' && s.resendKeySet ? '<span class="badge badge--ok">Resend connected</span>' : '') + '</div><div class="card__body stack">' +
      '<div class="acct-types" style="grid-template-columns:1fr 1fr;display:grid"><label class="acct-type"><input type="radio" name="provider" value="resend"' + (s.provider === 'resend' ? ' checked' : '') + '><span><b>Resend API</b><span class="small muted">Recommended — reliable delivery with your own domain</span></span></label><label class="acct-type"><input type="radio" name="provider" value="wordpress"' + (s.provider !== 'resend' ? ' checked' : '') + '><span><b>WordPress mail</b><span class="small muted">Uses the site\'s mail setup (e.g. WP Mail SMTP)</span></span></label></div>' +
      '<div class="grid-2"><label class="field full"><span>Resend API key</span><input class="input" name="resendKey" type="password" autocomplete="off" placeholder="' + (s.resendKeySet ? esc(s.resendKey) + ' (saved — type to replace)' : 're_…') + '"><span class="small muted">Create one at resend.com → API Keys, and verify your sending domain (e.g. chcsny.com) there first. The key is stored on the server and never shown again.</span></label>' +
      '<label class="field"><span>From name</span><input class="input" name="fromName" value="' + esc(s.fromName) + '"></label><label class="field"><span>From email</span><input class="input" name="fromEmail" type="email" value="' + esc(s.fromEmail) + '"></label><label class="field"><span>Reply-to</span><input class="input" name="replyTo" type="email" value="' + esc(s.replyTo) + '"></label><label class="field"><span>Admin alerts go to</span><input class="input" name="adminEmail" type="email" value="' + esc(s.adminEmail) + '"></label></div>' +
      '<div class="row">' + (s.resendKeySet ? '<button type="button" class="btn btn--ghost btn--sm" id="clear-key">Disconnect Resend key</button>' : '') + '</div></div></section>' +
      '<section class="card"><div class="card__head"><h2>Automatic emails</h2></div><div class="card__body"><div class="perm-grid">' + TEMPLATES.map(function (t) { return '<label class="perm"><input type="checkbox" name="tpl_' + t[0] + '"' + (s.templates[t[0]] !== false ? ' checked' : '') + '><span><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></span></label>'; }).join('') + '</div></div></section>' +
      '<div class="row"><button class="btn btn--lg">Save settings</button><input class="input" id="test-to" placeholder="Send a test to…" style="max-width:260px" value="' + esc(state.user.email) + '"><button type="button" class="btn btn--ghost" id="test">Send test email</button></div></form>' +
      '<section class="card" style="margin-top:18px"><div class="card__head"><h2>Recent emails</h2><span class="small muted">Last 200</span></div>' + (log.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>When</th><th>To</th><th>Subject</th><th>Via</th><th>Status</th></tr></thead><tbody>' + log.slice(0, 50).map(function (e) { return '<tr><td data-label="When">' + esc(H.ago(e.createdAt)) + '</td><td data-label="To">' + esc(e.to) + '</td><td data-label="Subject">' + esc(e.subject) + '</td><td data-label="Via" class="small">' + esc(e.provider) + '</td><td data-label="Status" class="small">' + esc(e.status) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">No emails sent yet.</div>') + '</section>';
  }, mount: function () {
    var f = $('#em');
    f.onsubmit = async function (e) { e.preventDefault(); var d = H.formData(f), body = { provider: d.provider, fromName: d.fromName, fromEmail: d.fromEmail, replyTo: d.replyTo, adminEmail: d.adminEmail, templates: {} }; if (d.resendKey) body.resendKey = d.resendKey; TEMPLATES.forEach(function (t) { body.templates[t[0]] = !!d['tpl_' + t[0]]; }); try { await API.put('settings/email', body); toast('Email settings saved.', 'ok'); render(); } catch (err) { fail(err); } };
    $('#test').onclick = async function () { try { var r = await API.post('settings/email/test', { to: $('#test-to').value }); toast(r.message || 'Test email sent.', 'ok'); render(); } catch (err) { fail(err); } };
    var c = $('#clear-key'); if (c) c.onclick = async function () { await API.put('settings/email', { clearResendKey: true, provider: 'wordpress' }); toast('Resend key removed.'); render(); };
  } });

  /* ================================================================ admin: training setup */
  route('admin/training', { title: 'Training setup', nav: 'admin-training', perm: 'training_manage', render: async function (p, q) {
    var tab = q.tab || 'inservices', head = '<div class="page-head"><div><h1>Training setup</h1><p>Create in-services and orientation, and track completion.</p></div></div><div class="tabs">' + [['inservices', 'In-services'], ['orientation', 'Orientation'], ['report', 'Completion report']].map(function (t) { return '<a href="#/admin/training?tab=' + t[0] + '" class="' + (tab === t[0] ? 'is-active' : '') + '">' + t[1] + '</a>'; }).join('') + '</div>';
    if (tab === 'orientation') {
      var mods = await API.get('orientation/modules'), rep = await API.get('orientation/report');
      return head + '<div class="cards cards--2"><section class="card"><div class="card__head"><h2>Sections</h2><button class="btn btn--sm" id="new-mod">' + ico('plus') + 'Add section</button></div><ul class="list">' + mods.map(function (m) { return '<li><div class="course__icon"><b>' + m.order + '</b></div><div class="grow"><b>' + esc(m.title) + '</b></div><button class="btn btn--ghost btn--sm" data-mod="' + m.id + '">Edit</button></li>'; }).join('') + '</ul></section><section class="card"><div class="card__head"><h2>Who can take orientation</h2></div><ul class="list">' + (rep.length ? rep.map(function (r) { return '<li>' + H.avatar(r.name, 'sm') + '<div class="grow"><b>' + esc(r.name) + '</b><div class="progress" style="margin-top:6px"><i style="width:' + (r.total ? r.done / r.total * 100 : 0) + '%"></i></div></div><span class="small">' + r.done + '/' + r.total + '</span></li>'; }).join('') : '<li class="muted">Nobody has orientation access. Grant it in Users &amp; access.</li>') + '</ul></section></div><script type="application/json" id="mods-json">' + JSON.stringify(mods).replace(/</g, '\\u003c') + '</script>';
    }
    if (tab === 'report') {
      var r = await API.get('inservices/report');
      return head + '<section class="card"><div class="card__head"><h2>In-service completions</h2><button class="btn btn--ghost btn--sm" onclick="window.print()">Print</button></div>' + (r.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Employee</th><th>In-service</th><th class="right">Hours</th><th class="right">Score</th><th>Result</th><th>Date</th></tr></thead><tbody>' + r.map(function (x) { return '<tr><td data-label="Employee"><b>' + esc(x.userName) + '</b> <span class="small muted">' + esc(x.designation) + '</span></td><td data-label="In-service">' + esc(x.title) + '</td><td data-label="Hours" class="right">' + x.hours + '</td><td data-label="Score" class="right">' + x.score + '%</td><td data-label="Result">' + H.badge(x.passed ? 'approved' : 'rejected').replace('approved', 'passed').replace('rejected', 'failed') + '</td><td data-label="Date">' + esc(H.fmtDate(x.completedAt)) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">No completions yet.</div>') + '</section>';
    }
    var list = await API.get('inservices?manage=1');
    return head + '<section class="card"><div class="card__head"><h2>In-services</h2><button class="btn btn--sm" id="new-is">' + ico('plus') + 'New in-service</button></div>' + list.map(function (i) { return '<div class="course"><div class="course__icon">' + ico('grad') + '</div><div class="grow"><b>' + esc(i.title) + '</b> ' + (i.active ? '' : H.badge('archived')) + '<div class="small muted">' + esc((i.audience || []).join(' + ')) + ' · ' + i.questions.length + ' questions · ' + i.completions + ' completed' + (i.dueDate ? ' · due ' + esc(H.fmtDate(i.dueDate)) : '') + '</div></div><button class="btn btn--ghost btn--sm" data-is="' + i.id + '">Edit</button></div>'; }).join('') + '</section><script type="application/json" id="is-json">' + JSON.stringify(list).replace(/</g, '\\u003c') + '</script>';
  }, mount: function (root, p, q) {
    var tab = q.tab || 'inservices';
    if (tab === 'inservices') {
      var list = JSON.parse($('#is-json').textContent);
      var editor = function (i) {
        i = i || { title: '', description: '', body: '', hours: 1, audience: ['field'], passScore: 80, questions: [{ q: '', options: ['', '', ''], answer: 0 }], active: true };
        modal(i.id ? 'Edit in-service' : 'New in-service', '<form class="modal__body stack" id="ise"><div class="grid-2"><label class="field full"><span>Title</span><input class="input" name="title" value="' + esc(i.title) + '" required></label><label class="field full"><span>Short description</span><input class="input" name="description" value="' + esc(i.description) + '"></label><label class="field full"><span>Reading material</span><textarea class="input" name="body" rows="8">' + esc(i.body) + '</textarea></label><label class="field"><span>Credit hours</span><input class="input" type="number" step="0.25" min="0" name="hours" value="' + i.hours + '"></label><label class="field"><span>Due date</span><input class="input" type="date" name="dueDate" value="' + esc(i.dueDate || '') + '"></label><label class="field"><span>Pass score %</span><input class="input" type="number" min="0" max="100" name="passScore" value="' + i.passScore + '"></label><label class="field"><span>External link <span class="muted">(optional)</span></span><input class="input" name="externalUrl" value="' + esc(i.externalUrl || '') + '"></label></div><div class="field"><span class="label">Assigned to</span><div class="chips"><label class="chip"><input type="checkbox" name="aud" value="field"' + (i.audience.indexOf('field') !== -1 ? ' checked' : '') + '>Field staff</label><label class="chip"><input type="checkbox" name="aud" value="office"' + (i.audience.indexOf('office') !== -1 ? ' checked' : '') + '>Office staff</label><label class="chip"><input type="checkbox" name="active"' + (i.active ? ' checked' : '') + '>Active</label></div></div><h3>Quiz</h3><div id="qs" class="stack"></div><button type="button" class="btn btn--ghost btn--sm" id="add-q">' + ico('plus') + 'Add question</button></form><div class="modal__foot">' + (i.id && i.active ? '<button class="btn btn--ghost" id="is-del" style="margin-right:auto">Archive</button>' : '') + '<button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="is-save">Save</button></div>', {
          wide: true, mount: function (w, close) {
            var qs = i.questions.map(function (x) { return { q: x.q, options: x.options.slice(), answer: x.answer || 0 }; });
            function drawQ() { $('#qs', w).innerHTML = qs.map(function (x, k) { return '<div class="quiz-q stack" data-k="' + k + '"><div class="row"><input class="input grow" data-qq placeholder="Question ' + (k + 1) + '" value="' + esc(x.q) + '"><button type="button" class="btn btn--ghost btn--icon btn--sm" data-rmq aria-label="Remove question">' + ico('x') + '</button></div>' + x.options.map(function (o, j) { return '<div class="row"><input type="radio" name="ans' + k + '" data-ans="' + j + '"' + (x.answer === j ? ' checked' : '') + ' aria-label="Correct answer"><input class="input grow" data-opt="' + j + '" placeholder="Option ' + (j + 1) + '" value="' + esc(o) + '"></div>'; }).join('') + '<span class="small muted">Select the correct answer.</span></div>'; }).join(''); }
            function read() { $$('[data-k]', w).forEach(function (el) { var k = +el.dataset.k; qs[k].q = $('[data-qq]', el).value; $$('[data-opt]', el).forEach(function (o) { qs[k].options[+o.dataset.opt] = o.value; }); var a = $('[data-ans]:checked', el); qs[k].answer = a ? +a.dataset.ans : 0; }); }
            drawQ();
            $('#add-q', w).onclick = function () { read(); qs.push({ q: '', options: ['', '', ''], answer: 0 }); drawQ(); };
            on(w, 'click', '[data-rmq]', function (e, b) { read(); qs.splice(+b.closest('[data-k]').dataset.k, 1); drawQ(); });
            $('#is-save', w).onclick = async function () { read(); var f = $('#ise', w), d = H.formData(f); var body = { title: d.title, description: d.description, body: d.body, hours: d.hours, dueDate: d.dueDate, passScore: d.passScore, externalUrl: d.externalUrl, audience: $$('input[name=aud]:checked', w).map(function (x) { return x.value; }), active: !!d.active, questions: qs }; try { if (i.id) await API.patch('inservices/' + i.id, body); else await API.post('inservices', body); close(); toast(i.id ? 'Saved.' : 'In-service published. Staff were notified.', 'ok'); render(); } catch (e) { fail(e); } };
            var del = $('#is-del', w); if (del) del.onclick = async function () { await API.del('inservices/' + i.id); close(); render(); };
          }
        });
      };
      $('#new-is').onclick = function () { editor(); };
      on(root, 'click', '[data-is]', function (e, b) { editor(list.find(function (x) { return x.id === +b.dataset.is; })); });
    }
    if (tab === 'orientation') {
      var mods = JSON.parse($('#mods-json').textContent);
      var med = function (m) {
        m = m || { title: '', body: '', order: mods.length + 1 };
        modal(m.id ? 'Edit section' : 'New section', '<form class="modal__body stack" id="me"><div class="grid-2"><label class="field"><span>Title</span><input class="input" name="title" value="' + esc(m.title) + '"></label><label class="field"><span>Order</span><input class="input" type="number" name="order" value="' + m.order + '"></label></div><label class="field"><span>Content</span><textarea class="input" name="body" rows="12">' + esc(m.body) + '</textarea></label></form><div class="modal__foot">' + (m.id ? '<button class="btn btn--ghost" id="me-del" style="margin-right:auto">Delete</button>' : '') + '<button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="me-save">Save</button></div>', {
          wide: true, mount: function (w, close) {
            $('#me-save', w).onclick = async function () { var d = H.formData($('#me', w)); try { if (m.id) await API.patch('orientation/modules/' + m.id, d); else await API.post('orientation/modules', d); close(); render(); } catch (e) { fail(e); } };
            var del = $('#me-del', w); if (del) del.onclick = async function () { await API.del('orientation/modules/' + m.id); close(); render(); };
          }
        });
      };
      $('#new-mod').onclick = function () { med(); };
      on(root, 'click', '[data-mod]', function (e, b) { med(mods.find(function (x) { return x.id === +b.dataset.mod; })); });
    }
  } });

  /* ================================================================ admin: audit */
  route('admin/audit', { title: 'Audit log', nav: 'admin-audit', perm: 'audit', render: async function () {
    var log = await API.get('audit');
    return '<div class="page-head"><div><h1>Audit log</h1><p>Sign-ins, approvals and changes. Kept for compliance review.</p></div></div><section class="card">' + (log.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead><tbody>' + log.map(function (a) { return '<tr><td data-label="When" class="nowrap">' + esc(new Date(a.createdAt).toLocaleString()) + '</td><td data-label="Who">' + esc(a.userName) + '</td><td data-label="Action"><code>' + esc(a.action) + '</code></td><td data-label="Detail">' + esc(a.detail) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">Nothing logged yet.</div>') + '</section>';
  } });

  /* ================================================================ demo inbox */
  async function demoInbox() {
    var mails = await API.get('demo/inbox');
    modal('Demo inbox', '<div class="modal__body"><div class="alert alert--info" style="margin-bottom:14px">In demo mode, emails aren\'t really sent. They appear here so you can test verification and reset links. On WordPress they go out through Resend or WordPress mail.</div>' + (mails.length ? mails.map(function (m) { return '<div class="email"><div class="row row--between"><b>' + esc(m.subject) + '</b><span class="small muted">' + esc(H.ago(m.createdAt)) + '</span></div><div class="small muted">To: ' + esc(m.to) + '</div><pre>' + esc(m.body).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" data-inbox-link>$1</a>') + '</pre></div>'; }).join('') : '<div class="empty">No emails yet.</div>') + '</div>', {
      wide: true, mount: function (w, close) { on(w, 'click', '[data-inbox-link]', function (e, a) { e.preventDefault(); close(); var h = a.getAttribute('href'); location.hash = h.slice(h.indexOf('#')); }); }
    });
  }

  /* ================================================================ install (PWA) */
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__installPrompt = e; var l = $('#install-link'); if (l) l.classList.remove('hidden'); });
  function installApp() {
    if (window.__installPrompt) { window.__installPrompt.prompt(); window.__installPrompt.userChoice.finally(function () { window.__installPrompt = null; }); return; }
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    modal('Install the CHCS Portal', '<div class="modal__body stack"><div class="row"><img src="' + ASSET + 'assets/icon-192.png" width="56" height="56" alt="" style="border-radius:14px;border:1px solid var(--line)"><div><b>CHCS Portal</b><div class="small muted">Works like an app — one tap from your home screen.</div></div></div>' + (ios ? '<ol><li>Tap the <b>Share</b> button in Safari.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol>' : '<ol><li>Open the browser menu (⋮).</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>') + (window.matchMedia('(display-mode: standalone)').matches ? '<div class="alert alert--ok">You\'re already using the installed app.</div>' : '') + '</div>');
  }

  /* ================================================================ boot */
  window.addEventListener('hashchange', render);
  if ('serviceWorker' in navigator && CFG.sw) navigator.serviceWorker.register(CFG.sw, CFG.swScope ? { scope: CFG.swScope } : undefined).catch(function () {});
  render();
})();
