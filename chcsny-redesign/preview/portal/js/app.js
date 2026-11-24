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
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    nurse: '<path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z"/><path d="M12 8v6M9 11h6"/>',
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
    $$('.modal').forEach(function (m) { m.parentNode.removeChild(m); }); // a page change closes any open dialog
    var hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
    var path = hash.split('?')[0], query = {};
    if (hash.indexOf('?') !== -1) new URLSearchParams(hash.split('?')[1]).forEach(function (v, k) { query[k] = v; });
    var r = routes.find(function (x) { return x.re.test(path); });
    if (!r) { go('#/dashboard'); return; }
    var params = path.match(r.re).groups || {};
    document.body.setAttribute('data-route', path.split('/')[0]);

    if (!r.public && !state.user) { try { state.user = (await API.get('me')).user; } catch (e) { state.user = null; } }
    if (!r.public && !state.user) { sessionStorage.setItem('chcs_after_login', location.hash); go('#/login'); return; }
    if (r.public) { var dr = $('.drawer'); if (dr) dr.parentNode.removeChild(dr); document.title = r.title + ' · CHCS Portal'; renderAuth(await r.render(params, query)); fillAuthSocial(); if (r.mount) r.mount($('#app'), params, query); return; }

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
    var office = u.type !== 'field';
    add('Home', 'dashboard', 'Dashboard', 'home', '#/dashboard', true);
    add('Home', 'news', 'News & posts', 'news', '#/news', true);
    add('Home', 'chat', 'Chat', 'chat', '#/chat', can('chat'), state.counts.unread);
    add('Home', 'calls', 'Call dashboard', 'call', '#/calls', can('calls'), state.counts.myCalls);
    add('Time & pay', 'clock', 'Time clock', 'clock', '#/clock', can('clock') && office);
    add('Time & pay', 'worked', 'Worked time', 'log', '#/worked', (can('clock') && office) || can('approvals') || can('payroll'));
    add('Time & pay', 'leave', 'Vacation & sick leave', 'sun', '#/leave', (can('leave') && office) || can('leave_manage'), state.counts.pendingLeave);
    add('Time & pay', 'timesheet', 'Timesheet', 'sheet', '#/timesheet', can('timesheet'));
    add('Time & pay', 'approvals', 'Approvals', 'checkc', '#/approvals', can('approvals'), state.counts.pendingApprovals);
    add('Time & pay', 'payroll', 'Payroll export', 'cash', '#/payroll', can('payroll'));
    add('Patients', 'cases', 'Intake & cases', 'folder', '#/cases', can('intake'), state.counts.newCases);
    add('Patients', 'forms', 'Forms', 'form', '#/forms', can('forms'));
    add('Schedule', 'calendar', can('calendar_manage') ? 'Office calendar' : 'My calendar', 'cal', '#/calendar', can('calendar') || can('calendar_manage'));
    add('Schedule', 'tasks', 'Tasks & deadlines', 'sheet', '#/tasks', can('tasks') && office, state.counts.myTasks);
    add('Training', 'inservices', 'In-services', 'grad', '#/inservices', can('inservices'), state.counts.inservicesDue);
    add('Training', 'orientation', 'Orientation', 'compass', '#/orientation', can('orientation'));
    add('Admin', 'applications', 'Applications', 'brief', '#/applications', can('applications'), state.counts.pendingApplications);
    add('Admin', 'admin-users', 'Users & access', 'users', '#/admin/users', can('users'), state.counts.pendingUsers);
    add('Admin', 'admin-designations', 'Designations', 'tag', '#/admin/designations', can('users'));
    add('Admin', 'admin-training', 'Training setup', 'nurse', '#/admin/training', can('training_manage'));
    add('Admin', 'admin-email', 'Email & API', 'mail', '#/admin/email', can('settings'));
    add('Admin', 'admin-website', 'Website & social', 'globe', '#/admin/website', can('settings') || can('news_manage'));
    add('Admin', 'admin-audit', 'Audit log', 'log', '#/admin/audit', can('audit'));
    return items;
  }
  function renderShell(active) {
    var u = state.user;
    if (!$('.shell')) {
      $('#app').innerHTML =
        (CFG.mode === 'demo' ? '<div class="demo-banner">Demo mode — data is saved only in this browser. Don\'t enter real patient or employee information. <button id="demo-reset">Reset demo data</button></div>' : '') +
        '<div class="shell"><aside class="side" id="side" aria-label="Main navigation"></aside><div class="main"><header class="topbar"><button class="btn btn--ghost btn--icon menu-btn" id="menu-btn" aria-label="Open menu" aria-controls="side" aria-expanded="false">' + ico('menu') + '</button><div class="topbar__title grow"></div><button class="btn btn--ghost btn--icon bell" id="bell" aria-label="Notifications">' + ico('bell') + '<span class="bell__count hidden" id="bell-count"></span></button><a class="btn btn--ghost btn--icon" href="#/profile" aria-label="My profile">' + H.avatar(u.name, 'sm') + '</a></header><main id="content" class="content" tabindex="-1"></main></div></div><nav class="tabbar" id="tabbar" aria-label="Quick navigation"></nav>' +
        (CFG.mode === 'demo' ? '<button class="btn inbox-fab" id="inbox-fab" aria-label="Demo inbox">' + ico('mail') + '<span>Demo inbox</span></button>' : '');
      $('#menu-btn').onclick = function () { toggleSide(true); };
      window.addEventListener('scroll', function () { var t = $('.topbar'); if (t) t.classList.toggle('is-scrolled', window.scrollY > 4); }, { passive: true });
      if ($('#demo-reset')) $('#demo-reset').onclick = async function () { if (await confirmBox('Reset demo data?', 'All demo changes in this browser will be erased and the sample data restored.', 'Reset')) { await API.post('demo/reset'); state.user = null; go('#/login'); location.reload(); } };
      if ($('#inbox-fab')) $('#inbox-fab').onclick = demoInbox;
      $('#bell').onclick = openNotifications;
      refreshCounts();
      state.countTimer = setInterval(refreshCounts, 30000);
      startPulse();
    }
    var items = navItems(), groups = {};
    items.forEach(function (i) { (groups[i.group] = groups[i.group] || []).push(i); });
    var side = '<a class="side__brand" href="#/dashboard"><img src="' + ASSET + 'assets/logo.png" alt=""><span><b>CHCS Portal</b><small>Complete Home Care</small></span></a>';
    Object.keys(groups).forEach(function (g) {
      side += '<div class="nav-group"><div class="nav-group__title">' + esc(g) + '</div><nav class="nav">' + groups[g].map(function (i) {
        return '<a href="' + i.href + '" class="' + (i.key === active ? 'is-active' : '') + '"' + (i.key === active ? ' aria-current="page"' : '') + '>' + ico(i.icon) + '<span>' + esc(i.label) + '</span>' + (i.count ? '<span class="count">' + i.count + '</span>' : '') + '</a>';
      }).join('') + '</nav></div>';
    });
    side += '<div class="nav-group"><nav class="nav"><a href="#/profile" class="' + (active === 'profile' ? 'is-active' : '') + '">' + ico('user') + '<span>My profile</span></a><a href="#" id="install-link" class="' + (window.__installPrompt ? '' : 'hidden') + '">' + ico('phone') + '<span>Install app</span></a>' + (CFG.mode === 'demo' ? '<a href="#" id="inbox-link">' + ico('mail') + '<span>Demo inbox</span></a>' : '') + '<a href="#" id="logout-link">' + ico('out') + '<span>Sign out</span></a></nav></div>';
    side += '<div class="side__user">' + H.avatar(u.name) + '<div class="grow"><b>' + esc(u.name) + '</b><small>' + esc(u.designation || typeLabel(u)) + '</small></div></div>';
    side += '<div class="side__social" id="side-social">' + socialIcons(state.social || {}, 'soc soc--side') + '</div>';
    $('#side').innerHTML = side;
    $('#side').onclick = function (e) { if (e.target.closest('a')) toggleSide(false); };
    $('#logout-link').onclick = async function (e) { e.preventDefault(); await API.post('auth/logout'); state.user = null; clearInterval(state.countTimer); clearInterval(state.pulseTimer); state.pulse = null; $('#app').innerHTML = ''; go('#/login'); };
    $('#install-link').onclick = function (e) { e.preventDefault(); installApp(); };
    if ($('#inbox-link')) $('#inbox-link').onclick = function (e) { e.preventDefault(); demoInbox(); };
    // bottom tab bar (phone)
    var keys = ['dashboard', 'clock', 'calls', 'timesheet', 'chat', 'inservices', 'calendar', 'cases', 'application', 'news'];
    var tabs = keys.map(function (k) { return items.find(function (i) { return i.key === k; }); }).filter(Boolean).slice(0, 4);
    $('#tabbar').innerHTML = tabs.map(function (i) { return '<a href="' + i.href + '" class="' + (i.key === active ? 'is-active' : '') + '">' + ico(i.icon) + '<span>' + esc(i.label.replace('Time clock', 'Clock').replace('Intake & cases', 'Cases').replace('My calendar', 'Calendar').replace('Office calendar', 'Calendar').replace('Tasks & deadlines', 'Tasks').replace('News & posts', 'News').replace('Call dashboard', 'Calls')) + '</span>' + (i.count ? '<span class="count">' + i.count + '</span>' : '') + '</a>'; }).join('') + '<button type="button" id="tab-more">' + ico('more') + '<span>More</span></button>';
    $('#tab-more').onclick = function () { toggleSide(true); };
    if (!state.social) loadSocial().then(function (s) { var el = $('#side-social'); if (el) el.innerHTML = socialIcons(s, 'soc soc--side'); });
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

  /* ================================================================ notifications */
  // One light request every 12s: new notifications, new chat messages, unread counts.
  // Also marks chat messages as "delivered" (✓✓) for the sender.
  function startPulse() {
    clearInterval(state.pulseTimer);
    state.pulse = { since: null, msgSince: null };
    pulse(); state.pulseTimer = setInterval(pulse, 12000);
  }
  async function pulse() {
    if (!state.user || state.user.status !== 'active' || isApplicant()) return;
    var first = state.pulse.since === null;
    try {
      var d = await API.get('pulse?since=' + (state.pulse.since || 0) + '&msgSince=' + (state.pulse.msgSince || 0));
      setBell(d.unreadNotifications);
      if (state.counts.unread !== d.unreadChat) { state.counts.unread = d.unreadChat; var a = $('.nav a[href="#/chat"] .count'); if (a || d.unreadChat) refreshCounts(); }
      if (!first) {
        d.notifications.forEach(function (n) { systemNotify(n.title, n.body, n.link, 'n' + n.id); });
        var inChat = location.hash.indexOf('#/chat/') === 0 && !document.hidden;
        d.messages.forEach(function (m) { if (!(inChat && location.hash === '#/chat/' + m.convId)) systemNotify(m.userName + (m.title && m.title !== m.userName ? ' · ' + m.title : ''), m.body, '#/chat/' + m.convId, 'm' + m.id); });
        if (d.notifications.length) d.notifications.slice(0, 2).forEach(function (n) { if (!document.hidden) toast(n.title); });
      }
      state.pulse.since = d.lastNotifId; state.pulse.msgSince = d.lastMsgId;
    } catch (e) { /* offline */ }
  }
  function setBell(n) { var c = $('#bell-count'); if (!c) return; c.textContent = n > 99 ? '99+' : n; c.classList.toggle('hidden', !n); }
  function notifyPermission() { return 'Notification' in window ? Notification.permission : 'unsupported'; }
  async function enableNotifications() {
    if (!('Notification' in window)) { toast('This browser does not support notifications. On iPhone, install the app to your Home Screen first.'); return; }
    var r = await Notification.requestPermission();
    toast(r === 'granted' ? 'Notifications are on.' : 'Notifications are blocked. Allow them in your browser settings.', r === 'granted' ? 'ok' : 'bad');
    if (r === 'granted') systemNotify('Notifications are on', 'You will be alerted about new messages, calls and assignments.', '#/dashboard', 'test');
  }
  function systemNotify(title, body, link, tag) {
    if (notifyPermission() !== 'granted') return;
    var opts = { body: body || '', tag: 'chcs-' + tag, icon: ASSET + 'assets/icon-192.png', badge: ASSET + 'assets/favicon.png', data: { link: link || '#/dashboard' } };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(function (reg) { reg.showNotification(title, opts); }).catch(function () {});
    else try { var n = new Notification(title, opts); n.onclick = function () { window.focus(); location.hash = link || '#/dashboard'; n.close(); }; } catch (e) { /* ignore */ }
  }
  if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.type === 'chcs-open') location.hash = e.data.link; });
  async function openNotifications() {
    var list = await API.get('notifications');
    var perm = notifyPermission();
    modal('Notifications', '<div class="modal__body">' + (perm !== 'granted' ? '<div class="alert alert--info" style="margin-bottom:14px">' + ico('bell') + '<span>Get alerts on this device for messages, calls and assignments. <button class="link" id="notif-enable">Turn on notifications</button></span></div>' : '') +
      (list.length ? '<ul class="list notif-list">' + list.map(function (n) { return '<li class="' + (n.read ? '' : 'is-unread') + '"><a class="item-link" href="' + esc(n.link || '#/dashboard') + '" data-notif="' + n.id + '"><div class="course__icon">' + ico({ call: 'call', leave: 'sun', inservice: 'grad', time: 'clock', shift: 'cal', account: 'users', application: 'brief' }[n.kind] || 'bell') + '</div><div class="grow"><b>' + esc(n.title) + '</b>' + (n.body ? '<div class="small muted">' + esc(n.body) + '</div>' : '') + '<div class="small muted">' + esc(H.ago(n.createdAt)) + '</div></div>' + (n.read ? '' : '<span class="dot" aria-label="Unread"></span>') + '</a></li>'; }).join('') + '</ul>' : '<div class="empty">' + ico('bell') + '<div>You\'re all caught up.</div></div>') + '</div><div class="modal__foot"><button class="btn btn--ghost" id="notif-all">Mark all as read</button><button class="btn" data-close>Close</button></div>', {
      mount: function (w, close) {
        var en = $('#notif-enable', w); if (en) en.onclick = function () { enableNotifications(); close(); };
        $('#notif-all', w).onclick = async function () { await API.post('notifications/read', { all: true }); setBell(0); close(); };
        on(w, 'click', '[data-notif]', function (e, a) { API.post('notifications/read', { ids: [+a.dataset.notif] }); close(); });
      }
    });
  }

  /* ================================================================ auth views */
  function renderAuth(inner) {
    $('#app').innerHTML = '<div class="auth"><section class="auth__brand"><a class="auth__logo" href="#/login"><img src="' + ASSET + 'assets/logo.png" alt=""><span><b>Complete Home Care Services</b><small>Staff &amp; Employee Portal</small></span></a>' +
      '<div class="auth__pitch"><h2>Everything your care team needs, <em>in one place.</em></h2><ul class="auth__list"><li>' + ico('clock') + 'Clock in, timesheets &amp; schedules</li><li>' + ico('chat') + 'Secure chat with the office</li><li>' + ico('grad') + 'In-services &amp; orientation</li><li>' + ico('folder') + 'Intake &amp; case management</li></ul></div>' +
      '<div class="auth__foot"><div class="auth__social" id="auth-social"></div>117-03 203rd Street, St. Albans, NY 11412 · (718) 528-5493</div></section><main class="auth__main"><div class="auth__card">' + inner + '</div></main></div>';
  }
  function fillAuthSocial() { loadSocial().then(function (s) { var el = $('#auth-social'); if (el) el.innerHTML = socialIcons(s, 'soc soc--light'); }); }
  function authTabs(active) { return '<div class="auth__tabs" role="tablist"><a href="#/login" class="' + (active === 'login' ? 'is-active' : '') + '">Sign in</a><a href="#/signup" class="' + (active === 'signup' ? 'is-active' : '') + '">Create account</a></div>'; }

  route('login', { public: true, title: 'Sign in', render: function () {
    return authTabs('login') + '<h1>Welcome back</h1><p class="muted">Sign in to the CHCS staff portal.</p><div id="auth-msg"></div>' +
      '<form id="login-form" class="stack" novalidate><label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required></label><label class="field"><span>Password</span><input class="input" name="password" type="password" autocomplete="current-password" required></label><div class="row row--between"><span></span><a href="#/forgot" class="small">Forgot password?</a></div><button class="btn btn--lg btn--block" type="submit">Sign in</button></form>' +
      (CFG.mode === 'demo' ? '<div class="demo-box"><b class="small">Demo accounts</b> <span class="small muted">(password <code>demo1234</code>)</span><div class="chips" style="margin-top:10px">' +
        [['admin@chcs.demo', 'Admin'], ['manager@chcs.demo', 'Office manager'], ['intake@chcs.demo', 'Intake coordinator'], ['nurse@chcs.demo', 'Nursing supervisor'], ['hha@chcs.demo', 'HHA (field)'], ['rn@chcs.demo', 'RN (field)'], ['applicant@chcs.demo', 'Job applicant'], ['pending@chcs.demo', 'Awaiting approval']].map(function (a) { return '<button type="button" class="chip" data-demo="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div></div>' : '');
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
      (can('clock') && u.type !== 'field' ? '<a class="btn ' + (d.openEntry ? 'btn--red' : '') + '" href="#/clock">' + ico('clock') + (d.openEntry ? 'Clocked in · ' + H.fmtTime(d.openEntry.start) : 'Clock in') + '</a>' : '') +
      (can('chat') ? '<a class="btn btn--ghost" href="#/chat">' + ico('chat') + 'Messages' + (d.unread ? ' (' + d.unread + ')' : '') + '</a>' : '') + '</div></div></div>';
    var stats = [];
    if (d.inservicesDue != null && u.type === 'field') stats.push(['grad', 'In-services to do', d.inservicesDue, 'See due dates', '#/inservices']);
    if (d.myCalls != null) stats.push(['call', 'Calls for me', d.myCalls, 'Open call-backs', '#/calls?filter=mine']);
    if (d.myTasks != null) stats.push(['sheet', 'Tasks due soon', d.myTasks, 'Next 7 days + overdue', '#/tasks']);
    if (can('clock') && u.type !== 'field') stats.push(['clock', 'Hours this week', H.hours(d.weekMinutes), 'Mon–Sun', '#/clock']);
    if (d.pendingLeave != null) stats.push(['sun', 'Leave to approve', d.pendingLeave, 'Pending requests', '#/leave?tab=manage']);
    if (d.pendingApprovals != null) stats.push(['checkc', 'Time to approve', d.pendingApprovals, 'Pending entries', '#/approvals']);
    if (d.newCases != null) stats.push(['folder', 'New referrals', d.newCases, 'New + verifying', '#/cases']);
    if (d.pendingApplications != null) stats.push(['brief', 'Applications', d.pendingApplications, 'Waiting for review', '#/applications']);
    if (d.pendingUsers != null) stats.push(['users', 'Accounts to approve', d.pendingUsers, 'Verified, waiting', '#/admin/users']);
    if (d.inservicesDue != null && u.type !== 'field') stats.push(['grad', 'In-services to do', d.inservicesDue, 'Assigned to you', '#/inservices']);
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
    if (state.user.type === 'field') return '<div class="card"><div class="empty">' + ico('clock') + '<h2>Clock in with HHAeXchange</h2><p>Field staff clock in and out of visits in the HHAeXchange app.</p></div></div>';
    var res = await Promise.all([API.get('time/entries?from=' + H.addDays(H.ymd(), -13)), API.get('settings/time'), API.get('me').catch(function () { return {}; })]), list = res[0];
    var sched = (res[2] && res[2].user && res[2].user.schedule) || res[1];
    var open = list.find(function (t) { return t.status === 'open'; });
    var week = list.filter(function (t) { return t.date >= H.weekStart() && t.end; }).reduce(function (a, t) { return a + t.minutes; }, 0);
    return '<div class="cards cards--2"><section class="card"><div class="clock"><div class="muted">' + esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })) + '</div><div class="clock__time" id="clock-now"></div>' +
      '<div class="clock__ring" id="ring"><div><span class="small muted">' + (open ? 'On the clock' : 'This week') + '</span><b id="elapsed">' + (open ? '' : H.hours(week) + 'h') + '</b><span class="small muted">' + (open ? 'since ' + H.fmtTime(open.start) : 'of 40h') + '</span></div></div>' +
      '<button class="btn clock-btn ' + (open ? 'btn--red' : 'btn--ok') + '" id="clock-btn" data-open="' + (open ? 1 : 0) + '">' + ico('clock') + (open ? 'Clock out' : 'Clock in') + '</button><p class="small muted" style="margin-top:12px">Your location is recorded only if you allow it.</p></div></section>' +
      '<section class="card"><div class="card__head"><h2>Recent punches</h2><span class="small muted">Last 2 weeks</span></div><p class="small muted" style="padding:0 20px">Your schedule: <b>' + esc(schedText(sched)) + '</b>. Time inside it is approved automatically.</p>' + timeTable(list.filter(function (t) { return t.source === 'clock'; }), false) + '</section></div>';
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
      var out = btn.dataset.open === '1'; btn.disabled = true;
      var geo = null;
      if (!out && navigator.geolocation) geo = await new Promise(function (res) { navigator.geolocation.getCurrentPosition(function (p) { res({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5), acc: Math.round(p.coords.accuracy) }); }, function () { res(null); }, { timeout: 5000, maximumAge: 60000 }); });
      try { var t = await API.post(out ? 'time/clock-out' : 'time/clock-in', { geo: geo }); toast(!out ? 'Clocked in. Have a great day!' : t.status === 'approved' ? 'Clocked out. Your hours are approved.' : 'Clocked out. Outside your schedule, so it was sent for approval: ' + (t.flag || 'outside schedule') + '.', 'ok'); refreshCounts(); render(); } catch (e) { btn.disabled = false; fail(e); }
    };
  } });

  function timeTable(list, withUser, selectable) {
    if (!list.length) return '<div class="empty">' + ico('clock') + '<div>' + (selectable ? 'Nothing to approve. Time inside the work schedule is approved automatically.' : 'No entries.') + '</div></div>';
    return '<div class="table-wrap"><table class="table table--cards"><thead><tr>' + (selectable ? '<th><input type="checkbox" id="sel-all" aria-label="Select all"></th>' : '') + (withUser ? '<th>Employee</th>' : '') + '<th>Date</th><th>In</th><th>Out</th><th class="right">Hours</th>' + (selectable ? '<th>Outside schedule</th>' : '') + '<th>Status</th></tr></thead><tbody>' +
      list.map(function (t) {
        return '<tr>' + (selectable ? '<td><input type="checkbox" class="sel" value="' + t.id + '" aria-label="Select entry"></td>' : '') + (withUser ? '<td data-label="Employee"><b>' + esc(t.userName) + '</b><div class="small muted">' + esc(t.designation) + '</div></td>' : '') +
          '<td data-label="Date">' + esc(H.fmtDate(t.date, { weekday: 'short', month: 'short', day: 'numeric' })) + '</td><td data-label="In">' + H.fmtTime(t.start) + '</td><td data-label="Out">' + (t.end ? H.fmtTime(t.end) : '—') + '</td><td data-label="Hours" class="right"><b>' + (t.end ? H.hours(t.minutes) : '—') + '</b></td>' +
          (selectable ? '<td data-label="Outside schedule"><span class="flag">' + ico('clock') + esc(t.flag || 'Outside schedule') + '</span></td>' : '') +
          '<td data-label="Status">' + H.badge(t.status) + (t.autoApproved ? '<div class="small muted">automatic</div>' : '') + (!selectable && t.status === 'pending' && t.flag ? '<div class="small muted">' + esc(t.flag) + '</div>' : '') + (t.decisionNote ? '<div class="small" style="color:var(--red)">' + esc(t.decisionNote) + '</div>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* work schedule helpers (office time approval) */
  var DOW = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']];
  function schedText(r) { if (!r) return '—'; var d = DOW.filter(function (x) { return r.days.indexOf(x[0]) !== -1; }).map(function (x) { return x[1]; }); var txt = d.join(', '); if (d.join() === 'Mon,Tue,Wed,Thu,Fri') txt = 'Mon–Fri'; else if (d.length === 7) txt = 'Every day'; return txt + ' · ' + H.fmtHM(r.start) + ' – ' + H.fmtHM(r.end); }
  function schedFields(r, prefix) {
    r = r || { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' };
    return '<div class="field"><span class="label">Work days</span><div class="dow">' + DOW.map(function (x) { return '<label><input type="checkbox" name="' + prefix + 'day" value="' + x[0] + '"' + (r.days.indexOf(x[0]) !== -1 ? ' checked' : '') + '><span>' + x[1] + '</span></label>'; }).join('') + '</div></div><div class="grid-2"><label class="field"><span>Starts</span><input class="input" type="time" name="' + prefix + 'start" value="' + esc(r.start) + '"></label><label class="field"><span>Ends</span><input class="input" type="time" name="' + prefix + 'end" value="' + esc(r.end) + '"></label></div>';
  }
  function readSched(w, prefix) { return { days: $$('input[name=' + prefix + 'day]:checked', w).map(function (i) { return +i.value; }), start: $('input[name=' + prefix + 'start]', w).value, end: $('input[name=' + prefix + 'end]', w).value }; }

  /* ================================================================ timesheet (field) */
  route('timesheet', { title: 'Timesheet', perm: 'timesheet', render: function () {
    return '<div class="page-head"><div><h1>Timesheet</h1><p>Fill in your weekly HHA / PCA duty sheet, sign it with your client, and tap Submit. It goes straight to the office. Visit hours are recorded in HHAeXchange.</p></div></div>' +
      '<div class="center-frame"><iframe id="duty-frame" title="HHA duty sheet" src="' + ASSET + 'forms/duty-sheet.html?portal=1"></iframe></div>';
  }, mount: function () {
    var df = $('#duty-frame'); if (df) df.addEventListener('load', function () { prefillForm(df); });
  } });

  /* ================================================================ approvals */
  route('approvals', { title: 'Approvals', perm: 'approvals', render: async function () {
    var res = await Promise.all([API.get('time/entries?scope=all&status=pending'), API.get('settings/time')]), list = res[0], rules = res[1];
    state.timeRules = rules;
    return '<div class="page-head"><div><h1>Approvals</h1><p>Only time <b>outside the work schedule</b> comes here. Time inside the schedule is approved automatically. Leave requests are under <a href="#/leave?tab=manage">Vacation &amp; sick leave</a>.</p></div></div>' +
      '<section class="card rules"><div class="card__body row" style="justify-content:space-between"><div class="row" style="gap:12px;flex-wrap:nowrap"><div class="course__icon">' + ico('clock') + '</div><div><b>Office work schedule</b><div class="small muted">' + esc(schedText(rules)) + ' · ' + rules.grace + ' min grace before and after</div><div class="small muted">A shift on the calendar, or a personal schedule set in Users &amp; access, is used instead when there is one.</div></div></div><button class="btn btn--ghost btn--sm" id="edit-rules">' + ico('note') + 'Change</button></div></section>' +
      '<section class="card"><div class="card__head"><h2>' + list.length + ' need' + (list.length === 1 ? 's' : '') + ' approval</h2>' + (list.length ? '<div class="row"><input class="input" id="dec-note" placeholder="Message to employee (optional)" style="min-height:34px;max-width:240px"><button class="btn btn--ghost btn--sm" data-decide="reject">Reject selected</button><button class="btn btn--ok btn--sm" data-decide="approve">' + ico('check') + 'Approve selected</button></div>' : '') + '</div>' + timeTable(list, true, true) + '</section>';
  }, mount: function (root) {
    var all = $('#sel-all'); if (all) all.onchange = function () { $$('.sel', root).forEach(function (c) { c.checked = all.checked; }); };
    on(root, 'click', '[data-decide]', async function (e, b) {
      var ids = $$('.sel:checked', root).map(function (c) { return +c.value; });
      if (!ids.length) { toast('Select at least one entry.'); return; }
      try { await API.post('time/decide', { ids: ids, action: b.dataset.decide, note: $('#dec-note').value }); toast(ids.length + ' entr' + (ids.length > 1 ? 'ies ' : 'y ') + (b.dataset.decide === 'approve' ? 'approved' : 'rejected') + '.', 'ok'); refreshCounts(); render(); } catch (err) { fail(err); }
    });
    $('#edit-rules', root).onclick = function () {
      var r = state.timeRules;
      modal('Office work schedule', '<form class="modal__body stack" id="rules-form"><p class="small muted">Clock-ins and clock-outs inside these hours (plus the grace minutes) are approved automatically. Anything earlier, later or on a day off waits for approval here.</p>' + schedFields(r, 'r') + '<label class="field"><span>Grace minutes</span><input class="input" type="number" min="0" max="120" name="grace" value="' + r.grace + '"><small class="muted">e.g. 15 means 8:45 AM – 5:15 PM still counts as on schedule.</small></label></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="rules-save">Save</button></div>', {
        mount: function (w, close) { $('#rules-save', w).onclick = async function () { var d = readSched(w, 'r'); d.grace = +$('input[name=grace]', w).value; try { await API.put('settings/time', d); close(); toast('Work schedule saved.', 'ok'); render(); } catch (e) { fail(e); } }; }
      });
    };
  } });

  /* ================================================================ payroll */
  route('payroll', { title: 'Payroll export', perm: 'payroll', render: function (p, q) {
    var to = q.to || H.addDays(H.weekStart(), -1), from = q.from || H.addDays(to, -13);
    return '<div class="page-head"><div><h1>Payroll export</h1><p>Approved hours (overtime over 40 hours per Mon–Sun week) plus approved vacation and sick leave.</p></div></div>' +
      '<section class="card"><div class="card__body"><form class="row" id="pay-form" style="align-items:flex-end"><label class="field"><span>From</span><input class="input" type="date" name="from" value="' + from + '"></label><label class="field"><span>To</span><input class="input" type="date" name="to" value="' + to + '"></label><label class="check" style="margin-bottom:10px"><input type="checkbox" name="includePending" value="1"' + (q.includePending ? ' checked' : '') + '> Include pending</label><button class="btn">Preview</button><button type="button" class="btn btn--ok" id="xlsx">' + ico('dl') + 'Download Excel</button></form></div><div id="pay-out"></div></section>';
  }, mount: async function (root, p, q) {
    var f = $('#pay-form'), data = null;
    async function load() {
      var d = H.formData(f);
      data = await API.get('payroll?from=' + d.from + '&to=' + d.to + (d.includePending ? '&includePending=1' : ''));
      var tot = data.summary.reduce(function (a, s) { return a + s.totalHours; }, 0);
      $('#pay-out').innerHTML = data.summary.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Employee</th><th>Designation</th><th class="right">Regular</th><th class="right">Overtime</th><th class="right">Leave / PTO</th><th class="right">Total worked</th><th class="right">Entries</th></tr></thead><tbody>' + data.summary.map(function (s) { return '<tr><td data-label="Employee"><b>' + esc(s.name) + '</b></td><td data-label="Designation">' + esc(s.designation) + '</td><td data-label="Regular" class="right">' + s.regularHours.toFixed(2) + '</td><td data-label="Overtime" class="right">' + s.overtimeHours.toFixed(2) + '</td><td data-label="Leave / PTO" class="right">' + (s.leaveHours || 0).toFixed(2) + '</td><td data-label="Total worked" class="right"><b>' + s.totalHours.toFixed(2) + '</b></td><td data-label="Entries" class="right">' + s.entries + '</td></tr>'; }).join('') + '<tr><td colspan="5"><b>Total</b></td><td class="right"><b>' + tot.toFixed(2) + '</b></td><td></td></tr></tbody></table></div>' : '<div class="empty">' + ico('cash') + '<div>No approved hours in this period.</div></div>';
    }
    f.onsubmit = function (e) { e.preventDefault(); load().catch(fail); };
    $('#xlsx').onclick = async function () {
      try {
        busy('Building…'); if (!data) await load();
        await loadScript(ASSET + 'vendor/xlsx.full.min.js');
        var d = H.formData(f), wb = XLSX.utils.book_new();
        var sum = [['Employee', 'Employee ID', 'Designation', 'Regular Hours', 'Overtime Hours', 'Leave / PTO Hours', 'Total Worked Hours', 'Entries']].concat(data.summary.map(function (s) { return [s.name, s.userId, s.designation, s.regularHours, s.overtimeHours, s.leaveHours || 0, s.totalHours, s.entries]; }));
        var det = [['Employee', 'Employee ID', 'Designation', 'Date', 'Time In', 'Time Out', 'Hours', 'Patient', 'Source', 'Status', 'Note']].concat(data.detail.map(function (t) { return [t.userName, t.userId, t.designation, t.date, H.fmtTime(t.start), H.fmtTime(t.end), +H.hours(t.minutes), t.patientName || '', t.source, t.status, t.note || '']; }));
        var ws1 = XLSX.utils.aoa_to_sheet(sum), ws2 = XLSX.utils.aoa_to_sheet(det);
        ws1['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 9 }]; ws2['!cols'] = [{ wch: 22 }, { wch: 11 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 22 }, { wch: 9 }, { wch: 10 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'Summary'); XLSX.utils.book_append_sheet(wb, ws2, 'Detail');
        var lv = [['Employee', 'Employee ID', 'Designation', 'Leave Type', 'From', 'To', 'Workdays in Period', 'Hours']].concat((data.leave || []).map(function (l) { return [l.name, l.userId, l.designation, l.type, l.from, l.to, l.days, l.hours]; }));
        var ws3 = XLSX.utils.aoa_to_sheet(lv); ws3['!cols'] = [{ wch: 22 }, { wch: 11 }, { wch: 18 }, { wch: 12 }, { wch: 11 }, { wch: 11 }, { wch: 10 }, { wch: 8 }]; XLSX.utils.book_append_sheet(wb, ws3, 'Leave');
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
  route('cases', { title: 'Intake & cases', perm: 'intake', render: async function (p, q) {
    var cases = await API.get('cases'), term = (q.q || '').toLowerCase(), st = q.status || 'open';
    var openSt = ['new', 'verifying', 'assessment', 'active', 'on_hold'];
    var counts = {}; cases.forEach(function (c) { counts[c.status] = (counts[c.status] || 0) + 1; });
    var shown = cases.filter(function (c) { return (st === 'all' || (st === 'open' ? openSt.indexOf(c.status) !== -1 : c.status === st)) && (!term || (c.patientName + ' ' + c.phone + ' ' + c.borough + ' ' + c.insurance + ' ' + c.physician).toLowerCase().indexOf(term) !== -1); });
    var tabs = [['open', 'All open', cases.filter(function (c) { return openSt.indexOf(c.status) !== -1; }).length]].concat(CASE_STATUSES.map(function (x) { return [x[0], x[1], counts[x[0]] || 0]; })).concat([['all', 'All', cases.length]]);
    return '<div class="page-head"><div><h1>Intake &amp; cases</h1><p>Every referral and patient case in one list.</p></div><div class="row"><form id="case-search" class="row"><input class="input" name="q" placeholder="Search name, phone, insurance…" value="' + esc(q.q || '') + '" style="min-height:42px;min-width:240px"></form><button class="btn" id="new-case">' + ico('plus') + 'New intake</button></div></div>' +
      '<div class="alert alert--warn" style="margin-bottom:16px">' + ico('shield') + '<span>This section contains protected health information. Only share what\'s needed for care. Access is logged.</span></div>' +
      '<div class="tabs">' + tabs.map(function (t) { return '<a href="#/cases?status=' + t[0] + (q.q ? '&q=' + encodeURIComponent(q.q) : '') + '" class="' + (st === t[0] ? 'is-active' : '') + '">' + esc(t[1]) + ' (' + t[2] + ')</a>'; }).join('') + '</div>' +
      '<section class="card">' + (shown.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Patient</th><th>Phone</th><th>Borough</th><th>Services</th><th>Insurance</th><th>Care team</th><th>Status</th><th>Updated</th></tr></thead><tbody>' + shown.map(function (c) { return '<tr class="is-click" data-href="#/cases/' + c.id + '"><td data-label="Patient"><b>' + esc(c.patientName) + '</b>' + (c.priority === 'high' ? ' ' + H.badge('high') : '') + '</td><td data-label="Phone" class="nowrap">' + esc(c.phone || '—') + '</td><td data-label="Borough">' + esc(c.borough || '—') + '</td><td data-label="Services">' + esc((c.services || []).join(', ') || '—') + '</td><td data-label="Insurance">' + esc(c.insurance || '—') + '</td><td data-label="Care team">' + esc(c.assignedNames.join(', ') || '—') + '</td><td data-label="Status">' + H.badge(c.status) + '</td><td data-label="Updated" class="small muted nowrap">' + esc(H.ago(c.updatedAt || c.createdAt)) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('folder') + '<div>No cases here.</div></div>') + '</section>';
  }, mount: function (root, p, q) {
    on(root, 'click', 'tr[data-href]', function (e, tr) { go(tr.dataset.href); });
    $('#case-search').onsubmit = function (e) { e.preventDefault(); go('#/cases?status=' + (q.status || 'open') + '&q=' + encodeURIComponent(e.target.q.value)); };
    $('#new-case').onclick = function () { caseForm(); };
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
  route('cases/:id', { title: 'Case', nav: 'cases', perm: 'intake', render: async function (p) {
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

  /* ================================================================ chat */
  route('chat', { title: 'Chat', perm: 'chat', render: function () { return chatShell(null); }, mount: function (root) { chatMount(root, null); } });
  route('chat/:id', { title: 'Chat', nav: 'chat', perm: 'chat', render: function (p) { return chatShell(+p.id); }, mount: function (root, p) { chatMount(root, +p.id); } });
  function chatShell(id) {
    return '<section class="card chat' + (id ? ' has-active' : '') + '"><div class="chat__list"><div class="card__head"><h2>Messages</h2><button class="btn btn--sm" id="new-chat">' + ico('plus') + 'New</button></div><div id="conv-list"><div class="loading"><div class="spinner"></div></div></div></div>' +
      '<div class="chat__pane">' + (id ? '<div class="chat__head"><a href="#/chat" class="btn btn--ghost btn--icon btn--sm" aria-label="Back to conversations">' + ico('left') + '</a><div id="chat-title" class="grow"><b>…</b></div></div><div class="chat__msgs" id="msgs" aria-live="polite"></div><form class="chat__compose" id="compose"><textarea class="input" name="body" placeholder="Write a message…" rows="1" aria-label="Message"></textarea><button class="btn btn--icon" aria-label="Send">' + ico('send') + '</button></form>' : '<div class="empty" style="margin:auto">' + ico('chat') + '<h2>Select a conversation</h2><p>' + (state.user.type === 'field' ? 'You can message anyone in the office.' : 'Message coworkers and field staff.') + '</p><p class="small muted">✓ sent · ✓✓ delivered · <span class="seen-sample">✓✓</span> seen</p>' + (notifyPermission() === 'default' ? '<button class="btn btn--ghost btn--sm" id="notif-chat">' + ico('bell') + 'Turn on message notifications</button>' : '') + '</div>') + '</div></section>';
  }
  // Message ticks like WhatsApp: ✓ sent · ✓✓ delivered (grey) · ✓✓ seen (blue)
  var TICK1 = '<svg viewBox="0 0 16 11" aria-hidden="true"><path d="M1 6l3.5 3.5L11 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var TICK2 = '<svg viewBox="0 0 20 11" aria-hidden="true"><path d="M1 6l3.5 3.5L11 2M7.5 8.5l1 1L16 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function tickHtml(m, rc) {
    if (m.pending) return '<span class="ticks ticks--wait" title="Sending">' + ico('clock') + '</span>';
    if (m.id <= rc.readUpTo) return '<span class="ticks ticks--seen" title="Seen">' + TICK2 + '<span class="sr-only">Seen</span></span>';
    if (m.id <= rc.deliveredUpTo) return '<span class="ticks" title="Delivered">' + TICK2 + '<span class="sr-only">Delivered</span></span>';
    return '<span class="ticks" title="Sent">' + TICK1 + '<span class="sr-only">Sent</span></span>';
  }
  function msgHtml(m, rc, pending) {
    var mine = m.userId === state.user.id;
    return '<div class="msg' + (mine ? ' msg--me' : '') + '"' + (pending ? ' data-pending="1"' : ' data-mid="' + m.id + '"') + '>' + (!mine ? '<div class="msg__who">' + esc(m.userName) + '</div>' : '') + esc(m.body) + '<small>' + esc(H.fmtTime(m.createdAt)) + (mine ? ' ' + tickHtml(m, rc) : '') + '</small></div>';
  }
  function dropPending(box) { $$('.msg[data-pending]', box).forEach(function (el) { el.parentNode.removeChild(el); }); }
  /* Reusable chat panel (used by the Chat tab and the "Ask the nurse" drawer). */
  function chatPanel(box, convId) {
    var lastId = 0, rc = { readUpTo: 0, deliveredUpTo: 0 }, mine = [];
    async function load() {
      var d = await API.get('chat/conversations/' + convId + '/messages?after=' + lastId);
      var msgs = d.messages || d; rc = { readUpTo: d.readUpTo || 0, deliveredUpTo: d.deliveredUpTo || 0 };
      var list = $('.chat__msgs', box); if (!list) return;
      var atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80, firstLoad = !lastId;
      dropPending(list);
      if (msgs.length) {
        list.insertAdjacentHTML('beforeend', msgs.map(function (m) { if (m.userId === state.user.id) mine.push(m); return msgHtml(m, rc); }).join(''));
        lastId = msgs[msgs.length - 1].id;
      }
      mine.forEach(function (m) { var el = list.querySelector('[data-mid="' + m.id + '"] .ticks'); if (el) el.outerHTML = tickHtml(m, rc); });
      if (msgs.length && (atBottom || firstLoad || msgs.some(function (m) { return m.userId === state.user.id; }))) list.scrollTop = list.scrollHeight;
    }
    async function send(body) {
      var list = $('.chat__msgs', box);
      list.insertAdjacentHTML('beforeend', msgHtml({ userId: state.user.id, body: body, createdAt: new Date().toISOString(), pending: true }, rc, true));
      list.scrollTop = list.scrollHeight;
      await API.post('chat/conversations/' + convId + '/messages', { body: body });
      await load();
    }
    var f = $('.chat__compose', box), ta = f.body;
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } });
    f.onsubmit = async function (e) { e.preventDefault(); var body = ta.value.trim(); if (!body) return; ta.value = ''; try { await send(body); } catch (err) { ta.value = body; dropPending(box); fail(err); } };
    var t = setInterval(function () { if (!document.body.contains(box)) { clearInterval(t); return; } load().catch(function () {}); }, 3000);
    state.pollers.push(t);
    return load();
  }
  async function chatMount(root, id) {
    var convs = [];
    async function loadList() {
      convs = await API.get('chat/conversations');
      $('#conv-list').innerHTML = convs.length ? convs.map(function (c) { return '<a class="chat__item' + (c.id === id ? ' is-active' : '') + '" href="#/chat/' + c.id + '">' + H.avatar(c.title) + '<div class="grow"><div class="row row--between" style="gap:6px;flex-wrap:nowrap"><b class="ellipsis">' + esc(c.title) + '</b><small class="muted nowrap">' + (c.lastMessage ? esc(H.ago(c.lastMessage.at)) : '') + '</small></div><small>' + (c.lastMessage && c.lastMessage.userId === state.user.id ? 'You: ' : '') + esc(c.lastMessage ? c.lastMessage.body : c.subtitle) + '</small></div>' + (c.unread ? '<span class="count badge badge--bad">' + c.unread + '</span>' : '') + '</a>'; }).join('') : '<div class="empty">No conversations yet.</div>';
      if (id) { var c = convs.find(function (x) { return x.id === id; }); if (c) $('#chat-title').innerHTML = '<b>' + esc(c.title) + '</b><div class="small muted">' + esc(c.subtitle) + '</div>'; }
    }
    await loadList();
    if (id) { await chatPanel($('.chat__pane', root), id); $('#compose textarea').focus(); refreshCounts(); }
    state.pollers.push(setInterval(function () { loadList().catch(function () {}); }, 8000));
    var nb = $('#notif-chat'); if (nb) nb.onclick = function () { enableNotifications(); nb.style.display = 'none'; };
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
  /* "Ask the nurse" drawer: a direct chat with the in-service nurse, usable while taking a test. */
  async function openNurseChat(nurseId, context) {
    try {
      if (!nurseId) { var n = await API.get('nurse'); nurseId = n && n.id; }
      if (!nurseId) { toast('No nurse is set up yet. Ask the office.'); return; }
      var r = await API.post('chat/conversations', { userIds: [nurseId] });
      var ppl = await API.get('chat/directory'), nurse = ppl.find(function (x) { return x.id === nurseId; }) || { name: 'Nurse' };
      var old = $('.drawer'); if (old) old.parentNode.removeChild(old);
      var d = document.createElement('aside'); d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Chat with ' + nurse.name);
      d.innerHTML = '<div class="chat__head">' + H.avatar(nurse.name, 'sm') + '<div class="grow"><b>' + esc(nurse.name) + '</b><div class="small muted">' + esc(nurse.designation || 'Nurse') + (context ? ' · about ' + esc(context) : '') + '</div></div><button class="btn btn--ghost btn--icon btn--sm" data-x aria-label="Close chat">' + ico('x') + '</button></div><div class="chat__msgs" aria-live="polite"></div><form class="chat__compose"><textarea class="input" name="body" rows="1" placeholder="Ask a question…" aria-label="Message"></textarea><button class="btn btn--icon" aria-label="Send">' + ico('send') + '</button></form>';
      document.body.appendChild(d);
      $('[data-x]', d).onclick = function () { d.parentNode.removeChild(d); };
      await chatPanel(d, r.id);
      if (context && !$('.chat__msgs', d).children.length) d.querySelector('textarea').value = 'Hi, I have a question about "' + context + '": ';
      d.querySelector('textarea').focus();
    } catch (e) { fail(e); }
  }

  /* ================================================================ calendar */
  // Month grid shared by the Calendar and Tasks tabs. On phones it scrolls left/right.
  function monthGrid(month, ev, hrefBase, extraQ) {
    var first = month + '-01', start = H.weekStart(first);
    var prev = new Date(first + 'T12:00:00'); prev.setMonth(prev.getMonth() - 1); var next = new Date(first + 'T12:00:00'); next.setMonth(next.getMonth() + 1);
    var nav = '<a class="btn btn--ghost btn--icon btn--sm" href="' + hrefBase + 'month=' + H.ymd(prev).slice(0, 7) + extraQ + '" aria-label="Previous month">' + ico('left') + '</a><b>' + esc(new Date(first + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })) + '</b><a class="btn btn--ghost btn--icon btn--sm" href="' + hrefBase + 'month=' + H.ymd(next).slice(0, 7) + extraQ + '" aria-label="Next month">' + ico('right') + '</a><a class="btn btn--ghost btn--sm" href="' + hrefBase + extraQ.replace(/^&/, '') + '">Today</a>';
    var html = '<div class="cal-scroll" tabindex="0" aria-label="Calendar — scroll sideways on small screens"><div class="cal">' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return '<div class="cal__dow">' + d + '</div>'; }).join('');
    for (var i = 0; i < 42; i++) {
      var d = H.addDays(start, i), items = ev[d] || [];
      html += '<div class="cal__day' + (d.slice(0, 7) !== month ? ' is-out' : '') + (d === H.ymd() ? ' is-today' : '') + '" data-day="' + d + '"><span class="cal__num">' + (+d.slice(8)) + '</span>' + items.slice(0, 4).join('') + (items.length > 4 ? '<button class="ev ev--more" data-more="' + d + '">+' + (items.length - 4) + ' more</button>' : '') + '</div>';
    }
    return { nav: nav, grid: html + '</div></div><p class="cal-hint small muted">Swipe the calendar sideways to see the whole week.</p>', start: start, end: H.addDays(start, 41) };
  }
  function dayList(ev, d) { modal(H.fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' }), '<div class="modal__body stack day-list">' + (ev[d] || []).join('') + '</div>'); }
  function taskEv(t, showName) { return '<a class="ev ev--task' + (t.status === 'done' ? ' ev--done' : '') + (t.overdue ? ' ev--late' : '') + '" href="#/tasks?id=' + t.id + '" title="' + esc(t.title + (t.assignedToName ? ' · ' + t.assignedToName : '')) + '">' + ico(t.status === 'done' ? 'check' : 'sheet') + esc((showName && t.assignedToName ? t.assignedToName.split(' ')[0] + ': ' : '') + t.title) + '</a>'; }

  route('calendar', { title: 'Calendar', perm: ['calendar', 'calendar_manage'], render: async function (p, q) {
    var month = q.month || H.ymd().slice(0, 7), ev = {};
    function add(d, h) { (ev[d] = ev[d] || []).push(h); }
    // ---- field staff: in-service due dates only
    if (state.user.type === 'field') {
      var mine = can('inservices') ? await API.get('inservices') : [];
      mine.filter(function (i) { return i.dueDate; }).forEach(function (i) { var ok = i.myResult && i.myResult.passed; add(i.dueDate, '<a class="ev ' + (ok ? 'ev--leave' : 'ev--due') + (!ok && i.dueDate < H.ymd() ? ' ev--late' : '') + '" href="' + (i.kind === 'center' ? '#/inservices/center/' + i.centerId : '#/inservices') + '">' + ico(ok ? 'check' : 'grad') + (ok ? 'Done: ' : 'Due: ') + esc(i.title) + '</a>'); });
      var g = monthGrid(month, ev, '#/calendar?', '');
      var todo = mine.filter(function (i) { return !(i.myResult && i.myResult.passed) && i.dueDate; });
      window.__calEv = ev;
      return '<div class="page-head"><div><h1>My calendar</h1><p>Your in-service due dates. Tap one to start it.</p></div><a class="btn" href="#/inservices">' + ico('grad') + 'In-services</a></div>' +
        (todo.length ? '<div class="chips" style="margin-bottom:14px">' + todo.map(function (i) { return '<a class="chip" href="' + (i.kind === 'center' ? '#/inservices/center/' + i.centerId : '#/inservices') + '">' + dueBadge(i) + ' ' + esc(i.title) + '</a>'; }).join('') + '</div>' : '') +
        '<section class="card" style="overflow:hidden"><div class="cal-toolbar">' + g.nav + '<span class="grow"></span><span class="cal-legend"><i class="lg lg--due"></i>Due<i class="lg lg--leave"></i>Completed</span></div>' + g.grid + '</section>';
    }
    // ---- office staff: shifts, time off, tasks, call-backs (+ own in-services)
    var manage = can('calendar_manage'), scope = manage && q.mine !== '1' ? 'all' : 'mine';
    var g0 = monthGrid(month, {}, '', ''), start = g0.start, end = g0.end;
    var staff = manage ? (await API.get('staff')).filter(function (s) { return s.type !== 'field'; }) : [];
    var shifts = await API.get('shifts?from=' + start + '&to=' + end + (scope === 'all' ? '&scope=all' : '') + (q.user ? '&userId=' + q.user : ''));
    var officeIds = {}; staff.forEach(function (s) { officeIds[s.id] = 1; }); officeIds[state.user.id] = 1;
    if (scope === 'all') shifts = shifts.filter(function (s) { return officeIds[s.userId]; });
    var leave = [], ins = [], calls = [], tasks = [];
    try { leave = await API.get('leave?scope=calendar&from=' + start + '&to=' + end); } catch (e) { /* no access */ }
    if (can('inservices')) try { ins = await API.get('inservices'); } catch (e) { /* none */ }
    if (can('calls')) try { calls = await API.get('calls?filter=mine'); } catch (e) { /* none */ }
    if (can('tasks')) try { tasks = await API.get('tasks?filter=' + (can('tasks_manage') && scope === 'all' ? 'all' : 'mine') + '&from=' + start + '&to=' + end + (q.user ? '&userId=' + q.user : '')); } catch (e) { /* none */ }
    if (q.user) leave = leave.filter(function (l) { return l.userId === +q.user; });
    if (scope === 'mine') leave = leave.filter(function (l) { return l.userId === state.user.id; });
    shifts.forEach(function (s) { add(s.date, '<button class="ev" data-shift="' + s.id + '" title="' + esc(s.userName + ' · ' + s.title) + '">' + H.fmtHM(s.start).replace(':00', '') + ' ' + esc(scope === 'all' ? s.userName.split(' ')[0] : s.title) + '</button>'); });
    leave.forEach(function (l) { for (var d = l.from < start ? start : l.from; d <= l.to && d <= end; d = H.addDays(d, 1)) add(d, '<button class="ev ev--leave' + (l.status === 'pending' ? ' ev--pending' : '') + '" data-leave="' + l.id + '" title="' + esc(l.userName + ' · ' + l.type + ' (' + l.status + ')') + '">' + ico('sun') + esc((scope === 'all' ? l.userName.split(' ')[0] + ' · ' : '') + l.type) + (l.status === 'pending' ? ' ?' : '') + '</button>'); });
    tasks.forEach(function (t) { add(t.dueDate, taskEv(t, scope === 'all')); });
    ins.filter(function (i) { return i.dueDate && !(i.myResult && i.myResult.passed); }).forEach(function (i) { add(i.dueDate, '<a class="ev ev--due" href="' + (i.kind === 'center' ? '#/inservices/center/' + i.centerId : '#/inservices') + '">' + ico('grad') + 'Due: ' + esc(i.title) + '</a>'); });
    calls.filter(function (c) { return c.callbackBy; }).forEach(function (c) { add(c.callbackBy.slice(0, 10), '<a class="ev ev--call" href="#/calls?id=' + c.id + '">' + ico('call') + 'Call ' + esc(c.callerName.split(' ')[0]) + '</a>'); });
    var g = monthGrid(month, ev, '#/calendar?', q.user ? '&user=' + q.user : '');
    window.__calEv = ev;
    return '<div class="page-head"><div><h1>' + (manage ? 'Office calendar' : 'My calendar') + '</h1><p>Shifts, time off, tasks &amp; deadlines and call-backs.</p></div><div class="row">' + (can('tasks') ? '<a class="btn btn--ghost" href="#/tasks">' + ico('sheet') + 'Tasks</a>' : '') + (can('leave') ? '<a class="btn btn--ghost" href="#/leave">' + ico('sun') + 'Time off</a>' : '') + (manage ? '<button class="btn" id="add-shift">' + ico('plus') + 'Add shift</button>' : '') + '</div></div>' +
      '<section class="card" style="overflow:hidden"><div class="cal-toolbar">' + g.nav + '<span class="grow"></span><span class="cal-legend"><i class="lg lg--shift"></i>Shift<i class="lg lg--leave"></i>Time off<i class="lg lg--task"></i>Task<i class="lg lg--due"></i>In-service<i class="lg lg--call"></i>Call-back</span>' + (manage ? '<select class="input" id="cal-user" style="min-height:36px;max-width:220px" aria-label="Filter by employee"><option value="">Everyone</option>' + staff.map(function (s) { return '<option value="' + s.id + '"' + (+q.user === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' : '') + '</div>' + g.grid + '</section>' +
      '<script type="application/json" id="cal-json">' + JSON.stringify({ shifts: shifts, leave: leave }).replace(/</g, '\\u003c') + '</script>';
  }, mount: function (root, p, q) {
    on(root, 'click', '[data-more]', function (e, b) { e.stopPropagation(); dayList(window.__calEv || {}, b.dataset.more); });
    if (!$('#cal-json')) return;
    var data = JSON.parse($('#cal-json').textContent), shifts = data.shifts, manage = can('calendar_manage');
    var u = $('#cal-user'); if (u) u.onchange = function () { go('#/calendar?month=' + (q.month || H.ymd().slice(0, 7)) + (u.value ? '&user=' + u.value : '')); };
    async function shiftForm(s) {
      var staff = (await API.get('staff')).filter(function (x) { return x.type !== 'field'; }); s = s || { date: H.ymd(), start: '09:00', end: '17:00', userId: +q.user || '' };
      modal(s.id ? 'Edit shift' : 'Add shift', '<form class="modal__body stack" id="shift-form"><label class="field"><span>Office employee</span><select class="input" name="userId" required><option value="">Choose…</option>' + staff.map(function (x) { return '<option value="' + x.id + '"' + (x.id === s.userId ? ' selected' : '') + '>' + esc(x.name) + ' — ' + esc(x.designation || typeLabel(x)) + '</option>'; }).join('') + '</select></label><div class="grid-3"><label class="field"><span>Date</span><input class="input" type="date" name="date" value="' + s.date + '" required></label><label class="field"><span>Start</span><input class="input" type="time" name="start" value="' + s.start + '" required></label><label class="field"><span>End</span><input class="input" type="time" name="end" value="' + s.end + '" required></label></div><div class="grid-2"><label class="field"><span>Title</span><input class="input" name="title" value="' + esc(s.title || '') + '" placeholder="Office / Front desk"></label><label class="field"><span>Location</span><input class="input" name="location" value="' + esc(s.location || '') + '"></label></div><label class="field"><span>Notes</span><input class="input" name="notes" value="' + esc(s.notes || '') + '"></label>' + (!s.id ? '<label class="field"><span>Repeat weekly for</span><select class="input" name="repeatWeeks"><option value="0">Does not repeat</option>' + [1, 2, 3, 4, 8, 12].map(function (n) { return '<option value="' + n + '">' + n + ' more week' + (n > 1 ? 's' : '') + '</option>'; }).join('') + '</select></label>' : '') + '</form><div class="modal__foot">' + (s.id ? '<button class="btn btn--ghost" id="shift-del" style="margin-right:auto">Delete</button>' : '') + '<button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="shift-save">Save</button></div>', {
        mount: function (w, close) {
          $('#shift-save', w).onclick = async function () { try { var d = H.formData($('#shift-form', w)); if (s.id) await API.patch('shifts/' + s.id, d); else await API.post('shifts', d); close(); toast('Schedule saved. The employee was notified.', 'ok'); render(); } catch (e) { fail(e); } };
          var del = $('#shift-del', w); if (del) del.onclick = async function () { await API.del('shifts/' + s.id); close(); render(); };
        }
      });
    }
    var add = $('#add-shift'); if (add) add.onclick = function () { shiftForm(); };
    on(root, 'click', '[data-shift]', function (e, b) {
      e.stopPropagation(); var s = shifts.find(function (x) { return x.id === +b.dataset.shift; }); if (!s) return;
      if (manage) shiftForm(s);
      else modal(s.title, '<div class="modal__body stack"><div><b>' + esc(H.fmtDate(s.date, { weekday: 'long', month: 'long', day: 'numeric' })) + '</b><div>' + H.fmtHM(s.start) + ' – ' + H.fmtHM(s.end) + '</div></div>' + (s.location ? '<div>' + ico('pin') + ' ' + esc(s.location) + '</div>' : '') + (s.notes ? '<div class="doc">' + esc(s.notes) + '</div>' : '') + '</div>');
    });
    on(root, 'click', '[data-leave]', function (e, b) {
      e.stopPropagation(); var l = data.leave.find(function (x) { return x.id === +b.dataset.leave; }); if (!l) return;
      modal('Time off — ' + l.userName, '<div class="modal__body stack"><div class="row">' + H.badge(l.status) + '<b style="text-transform:capitalize">' + esc(l.type) + '</b></div><div>' + esc(H.fmtDate(l.from)) + (l.to !== l.from ? ' → ' + esc(H.fmtDate(l.to)) : '') + ' · ' + l.totalHours + ' hours</div>' + (l.reason ? '<div class="doc">' + esc(l.reason) + '</div>' : '') + '</div>');
    });
    if (manage) on(root, 'click', '[data-day]', function (e, d) { if (e.target.closest('[data-shift],[data-leave],a,[data-more]')) return; shiftForm({ date: d.dataset.day, start: '09:00', end: '17:00', userId: +q.user || '' }); });
  } });

  /* ================================================================ tasks & deadlines (office task calendar) */
  var REPEAT_LABEL = {}; (window.CHCS_TASK_REPEAT || []).forEach(function (r) { REPEAT_LABEL[r[0]] = r[1]; });
  route('tasks', { title: 'Tasks & deadlines', perm: 'tasks', render: async function (p, q) {
    var mgr = can('tasks_manage'), f = q.filter || 'mine', view = q.view || 'list', month = q.month || H.ymd().slice(0, 7);
    var list = await API.get('tasks?filter=' + f + (q.user ? '&userId=' + q.user : ''));
    var staff = mgr ? (await API.get('staff')).filter(function (s) { return s.type !== 'field'; }) : [];
    var open = list.filter(function (t) { return t.status === 'open'; });
    var qs = function (o) { var x = Object.assign({ filter: f, view: view }, q.user ? { user: q.user } : {}, o); return '#/tasks?' + Object.keys(x).filter(function (k) { return x[k]; }).map(function (k) { return k + '=' + encodeURIComponent(x[k]); }).join('&'); };
    var head = '<div class="page-head"><div><h1>Tasks &amp; deadlines</h1><p>Administrative work with due dates. Repeating tasks (monthly, yearly…) create the next one when you mark them done.</p></div><button class="btn" id="new-task">' + ico('plus') + 'New task</button></div>' +
      '<div class="stats"><div class="stat"><div class="stat__label">' + ico('sheet') + 'Open</div><div class="stat__value">' + open.length + '</div></div><div class="stat"><div class="stat__label">' + ico('clock') + 'Overdue</div><div class="stat__value"' + (open.some(function (t) { return t.overdue; }) ? ' style="color:var(--red)"' : '') + '>' + open.filter(function (t) { return t.overdue; }).length + '</div></div><div class="stat"><div class="stat__label">' + ico('cal') + 'Due in 7 days</div><div class="stat__value">' + open.filter(function (t) { return !t.overdue && t.dueDate <= H.addDays(H.ymd(), 7); }).length + '</div></div><div class="stat"><div class="stat__label">' + ico('check') + 'Done</div><div class="stat__value">' + list.filter(function (t) { return t.status === 'done'; }).length + '</div></div></div>' +
      '<div class="row row--between" style="margin-bottom:14px"><div class="tabs" style="margin:0;border:0">' + [['mine', 'My tasks'], ['created', 'Created by me']].concat(mgr ? [['all', 'Everyone']] : []).map(function (t) { return '<a href="' + qs({ filter: t[0] }) + '" class="' + (f === t[0] ? 'is-active' : '') + '">' + t[1] + '</a>'; }).join('') + '</div><div class="row">' + (mgr && f === 'all' ? '<select class="input" id="task-user" style="min-height:36px;max-width:220px"><option value="">Everyone</option>' + staff.map(function (s) { return '<option value="' + s.id + '"' + (+q.user === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' : '') + '<div class="seg"><a href="' + qs({ view: 'list' }) + '" class="' + (view === 'list' ? 'is-active' : '') + '">' + ico('log') + 'List</a><a href="' + qs({ view: 'calendar' }) + '" class="' + (view === 'calendar' ? 'is-active' : '') + '">' + ico('cal') + 'Calendar</a></div></div></div>';
    var data = '<script type="application/json" id="tasks-json">' + JSON.stringify({ list: list, staff: staff }).replace(/</g, '\\u003c') + '</script>';
    if (view === 'calendar') {
      var ev = {}; list.forEach(function (t) { (ev[t.dueDate] = ev[t.dueDate] || []).push(taskEv(t, f !== 'mine')); });
      var g = monthGrid(month, ev, qs({ month: '' }).replace(/&?month=/, '') + '&', ''); window.__calEv = ev;
      return head + '<section class="card" style="overflow:hidden"><div class="cal-toolbar">' + g.nav + '</div>' + g.grid + '</section>' + data;
    }
    var row = function (t) { return '<tr class="is-click' + (t.overdue ? ' is-urgent' : '') + '" data-task="' + t.id + '"><td style="width:42px"><button class="tick-btn' + (t.status === 'done' ? ' is-done' : '') + '" data-done="' + t.id + '" aria-label="' + (t.status === 'done' ? 'Mark not done' : 'Mark done') + '">' + ico('check') + '</button></td><td data-label="Task"><b' + (t.status === 'done' ? ' class="muted strike"' : '') + '>' + esc(t.title) + '</b>' + (t.priority === 'high' ? ' <span class="badge badge--bad">High</span>' : '') + '<div class="small muted">' + esc(t.category) + (t.repeat !== 'none' ? ' · ' + ico('cal') + ' ' + esc(REPEAT_LABEL[t.repeat]) : '') + '</div></td><td data-label="Assigned to">' + esc(t.assignedToName) + '</td><td data-label="Due" class="nowrap' + (t.overdue ? ' late' : '') + '">' + esc(H.fmtDate(t.dueDate, { weekday: 'short', month: 'short', day: 'numeric' })) + (t.dueTime ? ' ' + H.fmtHM(t.dueTime) : '') + (t.overdue ? ' <span class="badge badge--bad">Overdue</span>' : '') + '</td><td data-label="Status">' + (t.status === 'done' ? '<span class="badge badge--ok">Done</span>' : '<span class="badge badge--warn">Open</span>') + '</td></tr>'; };
    var openRows = open, doneRows = list.filter(function (t) { return t.status === 'done'; }).slice(0, 30);
    return head + '<section class="card">' + (openRows.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th></th><th>Task</th><th>Assigned to</th><th>Due</th><th>Status</th></tr></thead><tbody>' + openRows.map(row).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('check') + '<div>No open tasks.</div></div>') + '</section>' +
      (doneRows.length ? '<section class="card" style="margin-top:18px"><div class="card__head"><h2>Recently done</h2></div><div class="table-wrap"><table class="table table--cards"><tbody>' + doneRows.map(row).join('') + '</tbody></table></div></section>' : '') + data;
  }, mount: function (root, p, q) {
    var d = JSON.parse($('#tasks-json').textContent), list = d.list, mgr = can('tasks_manage');
    on(root, 'click', '[data-more]', function (e, b) { e.stopPropagation(); dayList(window.__calEv || {}, b.dataset.more); });
    var tu = $('#task-user'); if (tu) tu.onchange = function () { go('#/tasks?filter=all&view=' + (q.view || 'list') + (tu.value ? '&user=' + tu.value : '')); };
    async function form(t) {
      var staff = mgr ? (d.staff.length ? d.staff : (await API.get('staff')).filter(function (s) { return s.type !== 'field'; })) : [];
      t = t || { title: '', description: '', category: 'Administrative', assignedTo: state.user.id, dueDate: H.addDays(H.ymd(), 7), dueTime: '', priority: 'normal', repeat: 'none' };
      modal(t.id ? 'Edit task' : 'New task', '<form class="modal__body stack" id="task-form"><label class="field"><span>Task</span><input class="input" name="title" value="' + esc(t.title) + '" required placeholder="e.g. Renew DOH license"></label><label class="field"><span>Details</span><textarea class="input" name="description" rows="3">' + esc(t.description) + '</textarea></label>' +
        '<div class="grid-3"><label class="field"><span>Due date</span><input class="input" type="date" name="dueDate" value="' + t.dueDate + '" required></label><label class="field"><span>Time <span class="muted">(optional)</span></span><input class="input" type="time" name="dueTime" value="' + esc(t.dueTime || '') + '"></label><label class="field"><span>Repeat</span><select class="input" name="repeat">' + (window.CHCS_TASK_REPEAT || []).map(function (r) { return '<option value="' + r[0] + '"' + (t.repeat === r[0] ? ' selected' : '') + '>' + r[1] + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="grid-3"><label class="field"><span>Assigned to</span>' + (mgr ? '<select class="input" name="assignedTo">' + staff.map(function (s) { return '<option value="' + s.id + '"' + (s.id === t.assignedTo ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' : '<input class="input" value="' + esc(state.user.name) + '" disabled><input type="hidden" name="assignedTo" value="' + state.user.id + '">') + '</label><label class="field"><span>Category</span><select class="input" name="category">' + (window.CHCS_TASK_CATEGORIES || []).map(function (c) { return '<option' + (t.category === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label><label class="field"><span>Priority</span><select class="input" name="priority"><option value="normal">Normal</option><option value="high"' + (t.priority === 'high' ? ' selected' : '') + '>High</option></select></label></div>' +
        (t.id ? '<p class="small muted">Created by ' + esc(t.createdByName) + (t.completedAt ? ' · done ' + esc(H.ago(t.completedAt)) + ' by ' + esc(t.completedByName) : '') + '</p>' : '<p class="small muted">The person gets an email and a notification. It shows on their calendar.</p>') + '</form><div class="modal__foot">' + (t.id ? '<button class="btn btn--ghost" id="task-del" style="margin-right:auto">Delete</button>' : '') + '<button class="btn btn--ghost" data-close>Cancel</button>' + (t.id && t.status === 'open' ? '<button class="btn btn--ok" id="task-done">' + ico('check') + 'Mark done</button>' : '') + '<button class="btn" id="task-save">Save</button></div>', {
        wide: true, mount: function (w, close) {
          $('#task-save', w).onclick = async function () { var b = H.formData($('#task-form', w)); try { if (t.id) await API.patch('tasks/' + t.id, b); else await API.post('tasks', b); close(); toast('Task saved.', 'ok'); render(); } catch (e) { fail(e); } };
          var dn = $('#task-done', w); if (dn) dn.onclick = async function () { close(); await markDone(t); };
          var del = $('#task-del', w); if (del) del.onclick = async function () { if (await confirmBox('Delete task?', 'This removes only this occurrence.', 'Delete', true)) { try { await API.del('tasks/' + t.id); close(); render(); } catch (e) { fail(e); } } };
        }
      });
    }
    async function markDone(t) {
      try { var r = await API.patch('tasks/' + t.id, { status: t.status === 'done' ? 'open' : 'done' }); toast(r.next ? 'Done. Next one is due ' + H.fmtDate(r.next.dueDate) + '.' : (r.status === 'done' ? 'Task done.' : 'Task reopened.'), 'ok'); refreshCounts(); render(); } catch (e) { fail(e); }
    }
    $('#new-task').onclick = function () { form(); };
    on(root, 'click', '[data-done]', function (e, b) { e.stopPropagation(); markDone(list.find(function (t) { return t.id === +b.dataset.done; })); });
    on(root, 'click', '[data-task]', function (e, tr) { if (e.target.closest('[data-done]')) return; form(list.find(function (t) { return t.id === +tr.dataset.task; })); });
    on(root, 'click', '.cal__day', function (e, dd) { if (e.target.closest('a,button')) return; form({ title: '', description: '', category: 'Administrative', assignedTo: state.user.id, dueDate: dd.dataset.day, dueTime: '', priority: 'normal', repeat: 'none' }); });
    if (q.id) { var t0 = list.find(function (t) { return t.id === +q.id; }); if (t0) form(t0); }
  } });

  /* ================================================================ worked time (office) */
  route('worked', { title: 'Worked time', perm: ['clock', 'approvals', 'payroll'], render: async function (p, q) {
    var all = can('approvals') || can('payroll'), ws = q.week || H.weekStart(), we = H.addDays(ws, 6);
    var list = (await API.get('time/entries?from=' + ws + '&to=' + we + (all ? '&scope=all' : ''))).filter(function (t) { return t.source === 'clock' && t.end; });
    var days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return H.addDays(ws, i); }), people = {};
    list.forEach(function (t) { var k = t.userId; people[k] = people[k] || { name: t.userName, designation: t.designation, days: {}, total: 0, pending: 0 }; people[k].days[t.date] = (people[k].days[t.date] || 0) + t.minutes; people[k].total += t.minutes; if (t.status !== 'approved') people[k].pending += t.minutes; });
    var rows = Object.keys(people).map(function (k) { return people[k]; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var grand = rows.reduce(function (a, r) { return a + r.total; }, 0);
    return '<div class="page-head"><div><h1>Worked time</h1><p>' + (all ? 'Weekly hours worked by office staff, from the time clock.' : 'Your weekly hours from the time clock.') + '</p></div><div class="row"><a class="btn btn--ghost btn--icon" href="#/worked?week=' + H.addDays(ws, -7) + '" aria-label="Previous week">' + ico('left') + '</a><b>' + esc(H.fmtDate(ws, { month: 'short', day: 'numeric' })) + ' – ' + esc(H.fmtDate(we)) + '</b><a class="btn btn--ghost btn--icon" href="#/worked?week=' + H.addDays(ws, 7) + '" aria-label="Next week">' + ico('right') + '</a>' + (can('clock') ? '<a class="btn" href="#/clock">' + ico('clock') + 'Time clock</a>' : '') + '</div></div>' +
      '<div class="stats"><div class="stat"><div class="stat__label">' + ico('users') + 'People</div><div class="stat__value">' + rows.length + '</div></div><div class="stat"><div class="stat__label">' + ico('clock') + 'Total hours</div><div class="stat__value">' + H.hours(grand) + '</div></div><div class="stat"><div class="stat__label">' + ico('clock') + 'Over 40 h</div><div class="stat__value"' + (rows.some(function (r) { return r.total > 2400; }) ? ' style="color:var(--red)"' : '') + '>' + rows.filter(function (r) { return r.total > 2400; }).length + '</div></div><div class="stat"><div class="stat__label">' + ico('checkc') + 'Needs approval</div><div class="stat__value">' + H.hours(rows.reduce(function (a, r) { return a + r.pending; }, 0)) + '</div></div></div>' +
      '<section class="card">' + (rows.length ? '<div class="table-wrap"><table class="table worked"><thead><tr><th>Employee</th>' + days.map(function (d) { return '<th class="right' + (d === H.ymd() ? ' is-today' : '') + '">' + esc(H.fmtDate(d, { weekday: 'short' })) + '<div class="small muted">' + (+d.slice(8)) + '</div></th>'; }).join('') + '<th class="right">Total</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td><b>' + esc(r.name) + '</b><div class="small muted">' + esc(r.designation) + '</div></td>' + days.map(function (d) { return '<td class="right">' + (r.days[d] ? H.hours(r.days[d]) : '<span class="muted">—</span>') + '</td>'; }).join('') + '<td class="right"><b' + (r.total > 2400 ? ' style="color:var(--red)"' : '') + '>' + H.hours(r.total) + '</b>' + (r.pending ? '<div class="small muted">' + H.hours(r.pending) + ' pending</div>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('clock') + '<div>No clocked time this week.</div></div>') + '</section>';
  } });

  /* ================================================================ in-services */
  function dueBadge(i) {
    if (i.myResult && i.myResult.passed) return '<span class="badge badge--ok">Completed ' + esc(H.fmtDate(i.myResult.completedAt, { month: 'short', day: 'numeric' })) + '</span>';
    if (!i.dueDate) return '';
    var days = Math.round((new Date(i.dueDate + 'T12:00:00') - new Date(H.ymd() + 'T12:00:00')) / 86400000);
    if (days < 0) return '<span class="badge badge--bad">Overdue · was due ' + esc(H.fmtDate(i.dueDate, { month: 'short', day: 'numeric' })) + '</span>';
    if (days === 0) return '<span class="badge badge--bad">Due today</span>';
    return '<span class="badge badge--' + (days <= 7 ? 'warn' : 'muted') + '">Due ' + esc(H.fmtDate(i.dueDate, { month: 'short', day: 'numeric' })) + (days <= 7 ? ' · ' + days + ' day' + (days > 1 ? 's' : '') : '') + '</span>';
  }
  function inserviceHref(i) { return i.kind === 'center' ? '#/inservices/center/' + i.centerId : (i.kind === 'link' ? '' : '#/inservices/' + i.id); }
  route('inservices', { title: 'In-services', perm: 'inservices', render: async function () {
    var list = await API.get('inservices');
    var todo = list.filter(function (i) { return !(i.myResult && i.myResult.passed); }), done = list.filter(function (i) { return i.myResult && i.myResult.passed; });
    var nurse = list.find(function (i) { return i.nurseId; }) || {};
    var row = function (i) {
      var ok = i.myResult && i.myResult.passed, href = inserviceHref(i);
      return '<div class="course"><div class="course__icon' + (ok ? ' is-done' : '') + '">' + ico(ok ? 'check' : 'grad') + '</div><div class="grow"><b>' + esc(i.title) + '</b><div class="small muted">' + esc(i.description || (i.kind === 'center' ? 'CHCS In-Service Training Center' : '')) + '</div><div class="row small" style="margin-top:6px;gap:8px">' + dueBadge(i) + (i.hours ? '<span class="badge badge--muted">' + i.hours + ' hr</span>' : '') + (i.myResult && !i.myResult.passed ? '<span class="badge badge--bad">Last score ' + i.myResult.score + '%</span>' : '') + (i.nurseName ? '<span class="muted">' + ico('nurse') + ' ' + esc(i.nurseName) + '</span>' : '') + '</div></div><div class="row" style="gap:6px">' + (i.nurseId && !ok ? '<button class="btn btn--ghost btn--sm" data-nurse="' + i.nurseId + '" data-ctx="' + esc(i.title) + '">' + ico('chat') + '<span class="hide-sm">Ask nurse</span></button>' : '') + (i.kind === 'link' ? '<button class="btn btn--sm" data-open-form="' + esc(i.externalUrl) + '" data-title="' + esc(i.title) + '">' + ico('ext') + 'Open</button>' : '<a class="btn btn--sm' + (ok ? ' btn--ghost' : '') + '" href="' + href + '">' + (ok ? 'Review' : 'Start') + '</a>') + '</div></div>';
    };
    var lib = (window.CHCS_CENTER || []).map(function (c) {
      var mine = list.find(function (i) { return i.centerId === c[0]; });
      return '<a class="tile" href="#/inservices/center/' + c[0] + '"><div class="row row--between"><div class="course__icon' + (mine && mine.myResult && mine.myResult.passed ? ' is-done' : '') + '">' + ico(mine && mine.myResult && mine.myResult.passed ? 'check' : 'grad') + '</div>' + (mine ? dueBadge(mine) : '') + '</div><b>' + esc(c[1]) + '</b><span class="small muted">About ' + c[2] + ' minutes</span></a>';
    }).join('');
    return '<div class="page-head"><div><h1>In-services</h1><p>Your required trainings and their due dates. Completions are saved to your employee record.</p></div>' + (nurse.nurseId ? '<button class="btn btn--ghost" data-nurse="' + nurse.nurseId + '" data-ctx="">' + ico('nurse') + 'Message ' + esc(nurse.nurseName) + '</button>' : '') + '</div>' +
      '<section class="card" style="margin-bottom:18px"><div class="card__body"><div class="row row--between"><b>' + done.length + ' of ' + list.length + ' assigned in-services complete</b><span class="small muted">' + todo.filter(function (i) { return i.dueDate && i.dueDate < H.ymd(); }).length + ' overdue</span></div><div class="progress" style="margin-top:10px"><i style="width:' + (list.length ? done.length / list.length * 100 : 0) + '%"></i></div></div></section>' +
      '<section class="card" style="margin-bottom:18px"><div class="card__head"><h2>To do</h2><span class="small muted">Sorted by due date</span></div>' + (todo.length ? todo.map(row).join('') : '<div class="empty">' + ico('check') + '<div>You\'re all caught up.</div></div>') + '</section>' +
      '<h2 style="margin:24px 0 12px">Training Center library</h2><p class="muted" style="margin-top:-6px">Open any training. Your name from your profile is filled in automatically.</p><div class="tiles" style="margin-bottom:18px">' + lib + '</div>' +
      (done.length ? '<section class="card"><div class="card__head"><h2>Completed</h2></div>' + done.map(row).join('') + '</section>' : '');
  }, mount: function (root) {
    on(root, 'click', '[data-open-form]', function (e, b) { openForm(b.dataset.openForm, b.dataset.title); });
    on(root, 'click', '[data-nurse]', function (e, b) { openNurseChat(+b.dataset.nurse, b.dataset.ctx); });
  } });

  // Training Center module inside the In-services tab (not a form).
  route('inservices/center/:id', { title: 'In-service', nav: 'inservices', perm: 'inservices', render: async function (p) {
    var c = (window.CHCS_CENTER || []).find(function (x) { return x[0] === p.id; }) || [p.id, 'Training Center', 0];
    var mine = (await API.get('inservices')).find(function (i) { return i.centerId === c[0]; }) || {};
    var nurse = mine.nurseId ? { id: mine.nurseId, name: mine.nurseName } : await API.get('nurse').catch(function () { return null; });
    // Connect the Training Center to the profile: it reads the name from this storage key (same site).
    try { var key = 'chcs-inservice-v1', st = JSON.parse(localStorage.getItem(key) || '{}'); st.name = state.user.name; localStorage.setItem(key, JSON.stringify(st)); } catch (e) { /* storage blocked */ }
    return '<div class="center-bar"><a href="#/inservices" class="btn btn--ghost btn--sm">' + ico('left') + 'All in-services</a><div class="grow"><b>' + esc(c[1]) + '</b><div class="small">' + dueBadge(mine) + '</div></div>' + (nurse ? '<button class="btn btn--sm" id="ask-nurse">' + ico('chat') + 'Ask ' + esc(String(nurse.name).split(',')[0]) + '</button>' : '') + '</div>' +
      '<div class="center-frame"><iframe id="center-frame" title="' + esc(c[1]) + '" src="' + ASSET + 'forms/inservice-training.html?portal=1#/training/' + encodeURIComponent(c[0]) + '"></iframe></div>' +
      '<script type="application/json" id="center-json">' + JSON.stringify({ id: c[0], title: c[1], nurseId: nurse && nurse.id }).replace(/</g, '\\u003c') + '</script>';
  }, mount: function (root) {
    var c = JSON.parse($('#center-json').textContent);
    var b = $('#ask-nurse'); if (b) b.onclick = function () { openNurseChat(c.nurseId, c.title); };
  } });
  // The Training Center tells the portal when a certificate was submitted.
  window.addEventListener('message', async function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'chcs-inservice-complete' || !state.user) return;
    try { await API.post('inservices/center-complete', { centerId: e.data.id, score: e.data.score, name: e.data.name }); toast('In-service completed and saved to your record.', 'ok'); refreshCounts(); } catch (err) { /* not assigned or no access */ }
  });

  route('inservices/:id', { title: 'In-service', nav: 'inservices', perm: 'inservices', render: async function (p) {
    var i = (await API.get('inservices')).find(function (x) { return x.id === +p.id; }); if (!i) throw new Error('In-service not found.');
    return '<div class="page-head"><div><a href="#/inservices" class="small">← All in-services</a><h1>' + esc(i.title) + '</h1><p>' + esc(i.description) + '</p><div class="row small" style="margin-top:6px">' + dueBadge(i) + '</div></div>' + (i.nurseId ? '<button class="btn btn--ghost" id="ask-nurse" data-nurse="' + i.nurseId + '">' + ico('chat') + 'Ask ' + esc(String(i.nurseName).split(',')[0]) + '</button>' : '') + '</div><div class="stack"><section class="card"><div class="card__head"><h2>1. Read the material</h2>' + (i.hours ? '<span class="badge badge--muted">' + i.hours + ' hr</span>' : '') + '</div><div class="card__body"><div class="doc">' + esc(i.body || 'No reading for this in-service.') + '</div></div></section>' +
      '<form id="quiz" class="card"><div class="card__head"><h2>2. ' + (i.questions.length ? 'Quiz' : 'Confirm') + '</h2>' + (i.questions.length ? '<span class="small muted">Pass score ' + i.passScore + '%</span>' : '') + '</div><div class="card__body stack">' + i.questions.map(function (q, k) { return '<fieldset class="quiz-q"><legend class="sr-only">Question ' + (k + 1) + '</legend><b>' + (k + 1) + '. ' + esc(q.q) + '</b>' + q.options.map(function (o, j) { return '<label><input type="radio" name="q' + k + '" value="' + j + '" required> ' + esc(o) + '</label>'; }).join('') + '</fieldset>'; }).join('') +
      '<label class="field"><span>Signature — type your full name to certify you completed this in-service</span><input class="input signature" name="signature" value="' + esc(state.user.name) + '" required></label><div id="quiz-res"></div><button class="btn btn--lg">' + ico('send') + 'Submit</button></div></form></div>' +
      (i.nurseId ? '<button class="btn nurse-fab" data-nurse="' + i.nurseId + '" aria-label="Ask the nurse">' + ico('nurse') + '<span>Ask the nurse</span></button>' : '') +
      '<script type="application/json" id="ins-json">' + JSON.stringify({ title: i.title }).replace(/</g, '\\u003c') + '</script>';
  }, mount: function (root, p) {
    var info = JSON.parse($('#ins-json').textContent);
    on(root, 'click', '[data-nurse]', function (e, b) { openNurseChat(+b.dataset.nurse, info.title); });
    var f = $('#quiz'); f.onsubmit = async function (e) {
      e.preventDefault(); var d = H.formData(f), answers = [];
      Object.keys(d).forEach(function (k) { if (/^q\d+$/.test(k)) answers[+k.slice(1)] = +d[k]; });
      try {
        var r = await submitting(function () { return API.post('inservices/' + p.id + '/complete', { answers: answers, signature: d.signature }); });
        $('#quiz-res').innerHTML = r.passed ? '<div class="alert alert--ok">You passed with ' + r.score + '%. Your completion was recorded.</div>' : '<div class="alert alert--bad">You scored ' + r.score + '% (need ' + r.passScore + '%). Review the material, ask the nurse if anything is unclear, and try again.</div>';
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

  /* ================================================================ vacation & sick leave */
  var LEAVE_LABEL = {}; (window.CHCS_LEAVE_TYPES || []).forEach(function (t) { LEAVE_LABEL[t[0]] = t[1]; });
  route('leave', { title: 'Vacation & sick leave', perm: ['leave', 'leave_manage'], render: async function (p, q) {
    var manage = can('leave_manage'), mineOk = can('leave') && state.user.type !== 'field';
    var tab = q.tab || (mineOk ? 'mine' : 'manage');
    var head = '<div class="page-head"><div><h1>Vacation &amp; sick leave</h1><p>Request time off. Approved leave shows on the calendar and in the payroll export.</p></div>' + (mineOk ? '<button class="btn" id="req-leave">' + ico('plus') + 'Request time off</button>' : '') + '</div>' +
      (manage && mineOk ? '<div class="tabs"><a href="#/leave" class="' + (tab === 'mine' ? 'is-active' : '') + '">My leave</a><a href="#/leave?tab=manage" class="' + (tab === 'manage' ? 'is-active' : '') + '">Requests to approve</a><a href="#/leave?tab=balances" class="' + (tab === 'balances' ? 'is-active' : '') + '">Allowances</a></div>' : (manage ? '<div class="tabs"><a href="#/leave?tab=manage" class="' + (tab === 'manage' ? 'is-active' : '') + '">Requests</a><a href="#/leave?tab=balances" class="' + (tab === 'balances' ? 'is-active' : '') + '">Allowances</a></div>' : ''));
    var table = function (list, who) {
      return list.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr>' + (who ? '<th>Employee</th>' : '') + '<th>Type</th><th>Dates</th><th class="right">Hours</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>' + list.map(function (l) { return '<tr>' + (who ? '<td data-label="Employee"><b>' + esc(l.userName) + '</b> <span class="small muted">' + esc(l.designation) + '</span></td>' : '') + '<td data-label="Type">' + esc(LEAVE_LABEL[l.type] || l.type) + '</td><td data-label="Dates" class="nowrap">' + esc(H.fmtDate(l.from, { month: 'short', day: 'numeric' })) + (l.to !== l.from ? ' → ' + esc(H.fmtDate(l.to, { month: 'short', day: 'numeric', year: 'numeric' })) : ', ' + l.from.slice(0, 4)) + (l.partial ? ' <span class="small muted">(' + l.hoursPerDay + 'h/day)</span>' : '') + '</td><td data-label="Hours" class="right">' + l.totalHours + '</td><td data-label="Reason" class="small">' + esc(l.reason || '—') + (l.decisionNote ? '<div class="muted">' + esc(l.decidedByName) + ': ' + esc(l.decisionNote) + '</div>' : '') + '</td><td data-label="Status">' + H.badge(l.status) + '</td><td class="nowrap">' + (who && l.status === 'pending' ? '<button class="btn btn--ghost btn--sm" data-ldec="reject" data-id="' + l.id + '">Reject</button> <button class="btn btn--ok btn--sm" data-ldec="approve" data-id="' + l.id + '">Approve</button>' : '') + (!who && (l.status === 'pending' || (l.status === 'approved' && l.from > H.ymd())) ? '<button class="btn btn--ghost btn--sm" data-lcancel="' + l.id + '">Cancel</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('sun') + '<div>No leave requests.</div></div>';
    };
    if (tab === 'manage') {
      var all = await API.get('leave?scope=all'), st = q.status || 'pending';
      var shown = all.filter(function (l) { return st === 'all' || l.status === st; });
      return head + '<section class="card"><div class="card__head"><h2>Leave requests</h2><div class="tabs" style="margin:0;border:0">' + [['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']].map(function (t) { return '<a href="#/leave?tab=manage&status=' + t[0] + '" class="' + (st === t[0] ? 'is-active' : '') + '">' + t[1] + ' (' + all.filter(function (l) { return t[0] === 'all' || l.status === t[0]; }).length + ')</a>'; }).join('') + '</div></div>' + table(shown, true) + '</section>';
    }
    if (tab === 'balances') {
      var bal = await API.get('leave/balances?all=1');
      return head + '<section class="card"><div class="card__head"><h2>Yearly allowances (hours)</h2><span class="small muted">' + new Date().getFullYear() + ' · used / allowed</span></div><div class="table-wrap"><table class="table table--cards"><thead><tr><th>Employee</th><th>Vacation</th><th>Sick</th><th>Personal</th><th></th></tr></thead><tbody>' + bal.map(function (b) { var g = function (t) { var x = b.balances.find(function (y) { return y.type === t; }); return x.used + ' / ' + x.allowed + (x.pending ? ' <span class="muted small">(+' + x.pending + ' pending)</span>' : ''); }; return '<tr><td data-label="Employee"><b>' + esc(b.name) + '</b> <span class="small muted">' + esc(b.designation) + '</span></td><td data-label="Vacation">' + g('vacation') + '</td><td data-label="Sick">' + g('sick') + '</td><td data-label="Personal">' + g('personal') + '</td><td><button class="btn btn--ghost btn--sm" data-allow="' + b.userId + '" data-name="' + esc(b.name) + '" data-v="' + b.allowance.vacation + '" data-s="' + b.allowance.sick + '" data-p="' + b.allowance.personal + '">Edit</button></td></tr>'; }).join('') + '</tbody></table></div></section><p class="small muted" style="margin-top:10px">New York requires paid sick leave (40 hours for employers with 5–99 employees, 56 hours for 100+). Set allowances to match your policy.</p>';
    }
    var mine = await API.get('leave'), bals = await API.get('leave/balances');
    return head + '<div class="stats">' + bals.map(function (b) { return '<div class="stat"><div class="stat__label">' + ico('sun') + esc(LEAVE_LABEL[b.type]) + '</div><div class="stat__value">' + b.left + '<span class="small muted" style="font-weight:600"> h left</span></div><div class="stat__hint">' + b.used + ' of ' + b.allowed + ' used' + (b.pending ? ' · ' + b.pending + ' pending' : '') + '</div></div>'; }).join('') + '</div><section class="card"><div class="card__head"><h2>My requests</h2></div>' + table(mine, false) + '</section>';
  }, mount: function (root) {
    var rb = $('#req-leave'); if (rb) rb.onclick = function () {
      modal('Request time off', '<form class="modal__body stack" id="leave-form"><label class="field"><span>Type</span><select class="input" name="type">' + (window.CHCS_LEAVE_TYPES || []).map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select></label><div class="grid-2"><label class="field"><span>From</span><input class="input" type="date" name="from" value="' + H.ymd() + '" required></label><label class="field"><span>To</span><input class="input" type="date" name="to" value="' + H.ymd() + '" required></label></div><label class="check"><input type="checkbox" name="partial" id="lv-partial"> Partial day</label><label class="field hidden" id="lv-hours"><span>Hours per day</span><input class="input" type="number" name="hours" min="0.5" max="8" step="0.5" value="4"></label><label class="field"><span>Reason <span class="muted">(optional — no medical details needed)</span></span><input class="input" name="reason"></label><p class="small muted">Weekends are not counted. Your manager is notified by email.</p></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="leave-save">' + ico('send') + 'Send request</button></div>', {
        mount: function (w, close) {
          $('#lv-partial', w).onchange = function () { $('#lv-hours', w).classList.toggle('hidden', !this.checked); };
          $('#leave-save', w).onclick = async function () { var d = H.formData($('#leave-form', w)); d.partial = !!d.partial; try { await submitting(function () { return API.post('leave', d); }); close(); render(); } catch (e) { /* shown */ } };
        }
      });
    };
    on(root, 'click', '[data-ldec]', function (e, b) {
      modal(b.dataset.ldec === 'approve' ? 'Approve leave' : 'Reject leave', '<div class="modal__body"><label class="field"><span>Note to employee (optional)</span><input class="input" id="ld-note"></label></div><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn ' + (b.dataset.ldec === 'approve' ? 'btn--ok' : 'btn--red') + '" id="ld-go">' + (b.dataset.ldec === 'approve' ? 'Approve' : 'Reject') + '</button></div>', {
        mount: function (w, close) { $('#ld-go', w).onclick = async function () { try { await API.patch('leave/' + b.dataset.id, { action: b.dataset.ldec, note: $('#ld-note', w).value }); close(); toast('Done. The employee was notified.', 'ok'); refreshCounts(); render(); } catch (err) { fail(err); } }; }
      });
    });
    on(root, 'click', '[data-lcancel]', async function (e, b) { if (await confirmBox('Cancel this request?', 'Your manager will see it as cancelled.', 'Cancel request', true)) { try { await API.patch('leave/' + b.dataset.lcancel, { action: 'cancel' }); render(); } catch (err) { fail(err); } } });
    on(root, 'click', '[data-allow]', function (e, b) {
      modal('Allowances — ' + b.dataset.name, '<form class="modal__body grid-3" id="al-form"><label class="field"><span>Vacation (h/yr)</span><input class="input" type="number" min="0" name="vacation" value="' + b.dataset.v + '"></label><label class="field"><span>Sick (h/yr)</span><input class="input" type="number" min="0" name="sick" value="' + b.dataset.s + '"></label><label class="field"><span>Personal (h/yr)</span><input class="input" type="number" min="0" name="personal" value="' + b.dataset.p + '"></label></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="al-save">Save</button></div>', {
        mount: function (w, close) { $('#al-save', w).onclick = async function () { try { await API.put('leave/allowance/' + b.dataset.allow, H.formData($('#al-form', w))); close(); toast('Saved.', 'ok'); render(); } catch (err) { fail(err); } }; }
      });
    });
  } });

  /* ================================================================ call dashboard */
  var CALL_STATUS = { open: 'Open', in_progress: 'In progress', returned: 'Returned', closed: 'Closed' };
  function callTypeLabel(t) { var x = (window.CHCS_CALLER_TYPES || []).find(function (y) { return y[0] === t; }); return x ? x[1] : t; }
  route('calls', { title: 'Call dashboard', perm: 'calls', render: async function (p, q) {
    var f = q.filter || 'open', stats = await API.get('calls/stats'), list = await API.get('calls?filter=' + f + (q.q ? '&q=' + encodeURIComponent(q.q) : ''));
    var nowIso = new Date().toISOString().slice(0, 16);
    var tiles = [['call', 'Calls today', stats.today, 'today'], ['bell', 'Assigned to me', stats.mine, 'mine'], ['folder', 'Open calls', stats.open, 'open'], ['clock', 'Call-backs overdue', stats.overdue, 'open']];
    return '<div class="page-head"><div><h1>Call dashboard</h1><p>Log every call you take. Assign it and that person gets an email and a notification right away.</p></div><button class="btn btn--lg btn--red" id="take-call">' + ico('call') + 'Take a call</button></div>' +
      '<div class="stats">' + tiles.map(function (t) { return '<a class="stat" href="#/calls?filter=' + t[3] + '"><div class="stat__label">' + ico(t[0]) + esc(t[1]) + '</div><div class="stat__value"' + (t[0] === 'clock' && t[2] ? ' style="color:var(--red)"' : '') + '>' + t[2] + '</div>' + (t[0] === 'folder' && stats.urgent ? '<div class="stat__hint" style="color:var(--red)">' + stats.urgent + ' urgent</div>' : '<div class="stat__hint">&nbsp;</div>') + '</a>'; }).join('') + '</div>' +
      '<section class="card"><div class="card__head"><div class="tabs" style="margin:0;border:0">' + [['open', 'Open'], ['mine', 'Assigned to me'], ['taken', 'Taken by me'], ['today', 'Today'], ['all', 'All calls']].map(function (t) { return '<a href="#/calls?filter=' + t[0] + '" class="' + (f === t[0] ? 'is-active' : '') + '">' + t[1] + '</a>'; }).join('') + '</div><form id="call-search"><input class="input" name="q" placeholder="Search caller, phone, message" value="' + esc(q.q || '') + '" style="min-height:38px;min-width:240px"></form></div>' +
      (list.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>When</th><th>Caller</th><th>About</th><th>For</th><th>Call back by</th><th>Status</th></tr></thead><tbody>' + list.map(function (c) { var late = c.callbackBy && c.callbackBy < nowIso && (c.status === 'open' || c.status === 'in_progress'); return '<tr class="is-click' + (c.priority === 'urgent' ? ' is-urgent' : '') + '" data-call="' + c.id + '"><td data-label="When" class="nowrap small">' + esc(H.ago(c.createdAt)) + '<div class="muted">by ' + esc(c.takenByName.split(' ')[0]) + '</div></td><td data-label="Caller"><b>' + esc(c.callerName) + '</b>' + (c.priority === 'urgent' ? ' <span class="badge badge--bad">Urgent</span>' : '') + '<div class="small muted">' + esc(c.callerPhone || '') + ' · ' + esc(callTypeLabel(c.callerType)) + '</div></td><td data-label="About"><b class="small">' + esc(c.reason) + '</b><div class="small muted clamp2">' + esc(c.message) + '</div></td><td data-label="For">' + (c.assignedToName ? esc(c.assignedToName) : '<span class="muted">—</span>') + '</td><td data-label="Call back by" class="nowrap' + (late ? ' late' : '') + '">' + (c.callbackBy ? esc(H.fmtDate(c.callbackBy, { month: 'short', day: 'numeric' })) + ' ' + esc(H.fmtHM(c.callbackBy.slice(11, 16))) : '—') + (late ? ' <span class="badge badge--bad">Late</span>' : '') + '</td><td data-label="Status">' + H.badge(c.status === 'returned' ? 'approved' : c.status === 'closed' ? 'discharged' : c.status === 'in_progress' ? 'pending' : 'new').replace(/>[^<]+</, '>' + CALL_STATUS[c.status] + '<') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">' + ico('call') + '<div>No calls here.</div></div>') + '</section>' +
      '<script type="application/json" id="calls-json">' + JSON.stringify(list).replace(/</g, '\\u003c') + '</script>';
  }, mount: async function (root, p, q) {
    var list = JSON.parse($('#calls-json').textContent), staff = await API.get('chat/directory').catch(function () { return []; });
    staff = staff.filter(function (s) { return s.type !== 'field'; }).concat([{ id: state.user.id, name: state.user.name + ' (me)', designation: state.user.designation }]);
    $('#call-search').onsubmit = function (e) { e.preventDefault(); go('#/calls?filter=all&q=' + encodeURIComponent(e.target.q.value)); };
    $('#take-call').onclick = function () { takeCall(staff); };
    on(root, 'click', '[data-call]', function (e, tr) { callDetail(list.find(function (c) { return c.id === +tr.dataset.call; }), staff); });
    if (q.id) { var c = list.find(function (x) { return x.id === +q.id; }); if (c) callDetail(c, staff); else API.get('calls?filter=all').then(function (all) { var c2 = all.find(function (x) { return x.id === +q.id; }); if (c2) callDetail(c2, staff); }); }
  } });
  function staffOptions(staff, sel) { return '<option value="">— Nobody (just log it) —</option>' + staff.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + (s.designation ? ' — ' + esc(s.designation) : '') + '</option>'; }).join(''); }
  function takeCall(staff) {
    var started = Date.now();
    modal('Incoming call', '<form class="modal__body stack" id="call-form"><div class="call-timer"><span class="dot dot--live"></span><b id="call-timer">00:00</b><span class="small muted">on the call</span></div>' +
      '<div class="grid-2"><label class="field"><span>Caller phone</span><input class="input" name="callerPhone" type="tel" id="cf-phone" autocomplete="off" placeholder="(718) 555-0100"></label><label class="field"><span>Caller name</span><input class="input" name="callerName" id="cf-name" autocomplete="off"></label></div><div id="cf-lookup"></div>' +
      '<div class="grid-2"><label class="field"><span>Caller is a…</span><select class="input" name="callerType">' + (window.CHCS_CALLER_TYPES || []).map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') + '</select></label><label class="field"><span>About</span><select class="input" name="reason">' + (window.CHCS_CALL_REASONS || []).map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="field"><span>Message / notes</span><textarea class="input" name="message" rows="4" placeholder="What did they need? Best time to call back?" required></textarea></label>' +
      '<div class="grid-3"><label class="field"><span>For (assign to)</span><select class="input" name="assignedTo">' + staffOptions(staff) + '</select></label><label class="field"><span>Call back by</span><input class="input" type="datetime-local" name="callbackBy"></label><label class="field"><span>Priority</span><select class="input" name="priority"><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label></div>' +
      '<label class="check"><input type="checkbox" name="resolved"> Resolved on this call (no follow-up needed)</label></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Discard</button><button class="btn" id="call-save">' + ico('check') + 'Save call</button></div>', {
      wide: true, mount: function (w, close) {
        var timer = setInterval(function () { var el = $('#call-timer', w); if (!el) { clearInterval(timer); return; } var s = Math.floor((Date.now() - started) / 1000); el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
        var lk; $('#cf-phone', w).oninput = function () { clearTimeout(lk); var v = this.value; lk = setTimeout(async function () { var r = await API.get('calls/lookup?phone=' + encodeURIComponent(v)).catch(function () { return {}; }); var box = $('#cf-lookup', w); if (!box) return; var bits = []; if (r.patient) bits.push('Patient on file: <b>' + esc(r.patient.name) + '</b> (' + esc(r.patient.status) + ')'); if (r.employee) bits.push('Employee: <b>' + esc(r.employee.name) + '</b> ' + esc(r.employee.designation)); if (r.calls) bits.push(r.calls + ' earlier call' + (r.calls > 1 ? 's' : '') + (r.last ? ', last ' + esc(H.ago(r.last.createdAt)) + ' about "' + esc(r.last.reason) + '"' : '')); box.innerHTML = bits.length ? '<div class="alert alert--info">' + ico('user') + '<span>' + bits.join('<br>') + '</span></div>' : ''; var nm = $('#cf-name', w); if (!nm.value && (r.patient || r.employee || r.last)) nm.value = r.employee ? r.employee.name : (r.last ? r.last.callerName : r.patient.name); }, 400); };
        $('#call-save', w).onclick = async function () {
          var d = H.formData($('#call-form', w)); d.duration = Math.round((Date.now() - started) / 1000); if (d.resolved) d.status = 'closed'; delete d.resolved;
          try { await submitting(function () { return API.post('calls', d); }); clearInterval(timer); close(); render(); } catch (e) { /* shown */ }
        };
      }
    });
  }
  function callDetail(c, staff) {
    var tel = (c.callerPhone || '').replace(/[^0-9+]/g, '');
    modal(c.callerName, '<div class="modal__body stack"><div class="row">' + (c.priority === 'urgent' ? '<span class="badge badge--bad">Urgent</span>' : '') + '<span class="badge badge--brand">' + esc(CALL_STATUS[c.status]) + '</span><span class="small muted">' + esc(callTypeLabel(c.callerType)) + ' · taken by ' + esc(c.takenByName) + ' · ' + esc(new Date(c.createdAt).toLocaleString()) + (c.duration ? ' · ' + Math.round(c.duration / 60) + ' min' : '') + '</span></div>' +
      (c.callerPhone ? '<div class="row"><a class="btn btn--ok" href="tel:' + esc(tel) + '">' + ico('call') + 'Call ' + esc(c.callerPhone) + '</a></div>' : '') +
      '<div><div class="small muted">' + esc(c.reason) + '</div><div class="doc">' + esc(c.message) + '</div></div>' +
      (c.followUps.length ? '<div><div class="small muted">Follow-ups</div><ul class="list">' + c.followUps.map(function (f) { return '<li style="padding:8px 0">' + H.avatar(f.userName, 'sm') + '<div class="grow"><div class="small"><b>' + esc(f.userName) + '</b> <span class="muted">' + esc(H.ago(f.at)) + '</span></div>' + esc(f.body) + '</div></li>'; }).join('') + '</ul></div>' : '') +
      '<div class="grid-3"><label class="field"><span>Assigned to</span><select class="input" id="cd-assign">' + staffOptions(staff, c.assignedTo) + '</select></label><label class="field"><span>Call back by</span><input class="input" type="datetime-local" id="cd-cb" value="' + esc(c.callbackBy || '') + '"></label><label class="field"><span>Status</span><select class="input" id="cd-status">' + Object.keys(CALL_STATUS).map(function (k) { return '<option value="' + k + '"' + (c.status === k ? ' selected' : '') + '>' + CALL_STATUS[k] + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="field"><span>Add a follow-up note</span><input class="input" id="cd-note" placeholder="e.g. Called back, left voicemail"></label></div><div class="modal__foot"><button class="btn btn--ghost" data-close>Close</button><button class="btn btn--ok" id="cd-returned">' + ico('check') + 'Mark returned</button><button class="btn" id="cd-save">Save</button></div>', {
      wide: true, mount: function (w, close) {
        async function save(extra) { var body = Object.assign({ assignedTo: $('#cd-assign', w).value ? +$('#cd-assign', w).value : null, callbackBy: $('#cd-cb', w).value, status: $('#cd-status', w).value, note: $('#cd-note', w).value }, extra || {}); try { await API.patch('calls/' + c.id, body); close(); toast('Call updated.', 'ok'); go('#/calls?filter=' + (new URLSearchParams(location.hash.split('?')[1] || '').get('filter') || 'open')); render(); } catch (e) { fail(e); } }
        $('#cd-save', w).onclick = function () { save(); };
        $('#cd-returned', w).onclick = function () { save({ status: 'returned', note: $('#cd-note', w).value || 'Call returned.' }); };
      }
    });
  }

  /* ================================================================ forms hub */
  var FORMS = [
    { file: 'forms/duty-sheet.html', title: 'HHA / PCA Duty Sheet', desc: 'Weekly duty sheet with client & aide signatures. Submits a signed PDF. Also in Timesheet → HHA duty sheet.', icon: 'sheet', show: function () { return can('forms') || can('timesheet'); } },
    { file: 'forms/patient-assessment.html', title: 'Patient Assessment', desc: 'RN / LPN patient assessment with offline drafts. Submits a signed PDF.', icon: 'heart', show: function () { return can('forms') && (state.user.type !== 'field' || /RN|LPN/.test(state.user.designation)); } },
    { file: 'forms/employment-application.html', title: 'Employment Application Packet', desc: 'Application, references, health assessment and competency checklist.', icon: 'brief', show: function () { return can('applications') || isApplicant(); } },
    { file: 'forms/workspace-app.html', title: 'CHCS Workspace App', desc: 'Agency Google Workspace tool (sign in with your @completehcs.com account).', icon: 'ext', show: function () { return state.user.type === 'office' || state.user.type === 'admin'; } }
  ];
  route('forms', { title: 'Forms', perm: 'forms', render: function () {
    var list = FORMS.filter(function (f) { return f.show(); });
    return '<div class="page-head"><div><h1>Forms</h1><p>Agency forms. Each one submits directly to the office when you tap Submit.</p></div></div>' + (CFG.mode === 'demo' ? '<div class="alert alert--warn" style="margin-bottom:16px">' + ico('shield') + '<span>Heads up: even in this demo, these forms are live. Submitting one sends it to the agency\'s real Google Apps Script. Only submit test data your office expects.</span></div>' : '') + '<div class="tiles">' + list.map(function (f) { return '<a class="tile" href="#" data-open-form="' + f.file + '" data-title="' + esc(f.title) + '"><div class="course__icon">' + ico(f.icon) + '</div><b>' + esc(f.title) + '</b><span class="small muted">' + esc(f.desc) + '</span></a>'; }).join('') + '</div>';
  }, mount: function (root) { on(root, 'click', '[data-open-form]', function (e, b) { e.preventDefault(); openForm(b.dataset.openForm, b.dataset.title); }); } });
  function prefillForm(frame) {
    try {
      var doc = frame.contentDocument, fill = { employeeName: state.user.name, phone: state.user.phone || '' };
      Object.keys(fill).forEach(function (id) { var el = doc.getElementById(id); if (el && !el.value && fill[id]) { el.value = fill[id]; el.dispatchEvent(new Event('input', { bubbles: true })); } });
    } catch (e) { /* cross-site form: nothing to fill */ }
  }
  function openForm(file, title) {
    var url = /^https?:/.test(file) ? file : ASSET + file;
    var w = document.createElement('div'); w.className = 'frame-wrap';
    w.innerHTML = '<div class="frame-wrap__bar"><button class="btn btn--ghost btn--sm" id="fw-close">' + ico('left') + 'Back to portal</button><b class="grow">' + esc(title || 'Form') + '</b></div><iframe src="' + esc(url) + '" title="' + esc(title || 'Form') + '" allow="geolocation; camera; microphone"></iframe>';
    document.body.appendChild(w); document.body.style.overflow = 'hidden';
    // Connect forms to the profile: fill the employee's name/phone if the form has those fields and they're empty.
    var fr = $('iframe', w); fr.addEventListener('load', function () { prefillForm(fr); });
    $('#fw-close', w).onclick = function () { w.remove(); document.body.style.overflow = ''; };
  }

  /* ================================================================ profile */
  route('profile', { title: 'My profile', render: function () {
    var u = state.user;
    return '<div class="page-head"><div class="row">' + H.avatar(u.name, 'lg') + '<div><h1 style="margin:0">' + esc(u.name) + '</h1><div class="muted">' + esc(u.designation || typeLabel(u)) + ' · ' + esc(u.email) + '</div></div></div></div><div class="cards cards--2"><form class="card" id="prof"><div class="card__head"><h2>Contact details</h2></div><div class="card__body stack"><label class="field"><span>Full name</span><input class="input" name="name" value="' + esc(u.name) + '"></label><label class="field"><span>Mobile phone</span><input class="input" name="phone" value="' + esc(u.phone || '') + '"></label><button class="btn">Save</button></div></form>' +
      '<form class="card" id="pw"><div class="card__head"><h2>Change password</h2></div><div class="card__body stack"><label class="field"><span>Current password</span><input class="input" type="password" name="currentPassword" autocomplete="current-password"></label><label class="field"><span>New password</span><input class="input" type="password" name="newPassword" minlength="8" autocomplete="new-password"></label><button class="btn">Update password</button></div></form></div>' +
      '<section class="card" style="margin-top:18px"><div class="card__head"><h2>My access</h2></div><div class="card__body"><div class="chips">' + (u.permissions.length ? u.permissions.map(function (p) { var m = MODULES.find(function (x) { return x[0] === p; }); return '<span class="badge badge--brand">' + esc(m ? m[1] : p) + '</span>'; }).join('') : '<span class="muted">No modules yet.</span>') + '</div><p class="small muted" style="margin-top:10px">Need something else? Ask your administrator.</p></div></section>' +
      '<section class="card" style="margin-top:18px"><div class="course"><div class="course__icon">' + ico('bell') + '</div><div class="grow"><b>Notifications on this device</b><div class="small muted">Alerts for new messages, calls assigned to you, leave decisions and in-services. Status: <b id="np-status">' + ({ granted: 'On', denied: 'Blocked in browser settings', 'default': 'Off', unsupported: 'Not supported here (on iPhone, install the app first)' }[notifyPermission()]) + '</b></div></div>' + (notifyPermission() === 'default' ? '<button class="btn btn--sm" id="np-on">Turn on</button>' : '') + '</div></section>' +
      '<section class="card" style="margin-top:18px"><div class="course"><div class="course__icon">' + ico('phone') + '</div><div class="grow"><b>Use the portal as an app</b><div class="small muted">Install it on your phone\'s home screen for one-tap access. On iPhone: tap Share → Add to Home Screen. On Android: tap Install.</div></div><button class="btn btn--sm" id="inst">Install</button></div></section>';
  }, mount: function () {
    $('#prof').onsubmit = async function (e) { e.preventDefault(); try { state.user = (await API.patch('me', H.formData(e.target))).user; toast('Profile saved.', 'ok'); renderShell('profile'); } catch (err) { fail(err); } };
    $('#pw').onsubmit = async function (e) { e.preventDefault(); try { await API.patch('me', H.formData(e.target)); e.target.reset(); toast('Password updated.', 'ok'); } catch (err) { fail(err); } };
    $('#inst').onclick = installApp;
    var np = $('#np-on'); if (np) np.onclick = function () { enableNotifications().then(function () { render(); }); };
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
      '<div class="field"><span class="label">Module access</span><label class="check" style="margin:6px 0 12px"><input type="checkbox" id="ue-custom"' + (u.customPermissions ? ' checked' : '') + (isAdmin ? ' disabled' : '') + '> Customize for this person <span class="muted small">(otherwise uses the designation\'s defaults)</span></label><div id="ue-perms"></div></div><div class="field" id="ue-sched-wrap"><span class="label">Work schedule <span class="muted small">(office time inside it is approved automatically)</span></span><label class="check" style="margin:6px 0 10px"><input type="checkbox" id="ue-sched-own"' + (u.schedule ? ' checked' : '') + '> Different from the office schedule</label><div id="ue-sched"' + (u.schedule ? '' : ' hidden') + '>' + schedFields(u.schedule, 'u') + '</div></div><p class="small muted">Account created ' + esc(H.fmtDate(u.createdAt)) + ' · Email ' + (u.emailVerified ? 'verified' : 'not verified') + '</p></form><div class="modal__foot"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn" id="ue-save">Save changes</button></div>', {
      wide: true, mount: function (w, close) {
        var type = $('#ue-type', w), dsel = $('#ue-des', w), custom = $('#ue-custom', w);
        function syncDes() { var t = type.value; dsel.innerHTML = t === 'admin' ? '<option>Administrator</option>' : t === 'applicant' ? '<option value="">—</option>' : des.filter(function (d) { return d.type === t; }).map(function (d) { return '<option' + (d.name === u.designation ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join(''); }
        function syncPerms() {
          var t = type.value, defaults = t === 'admin' ? MODULES.map(function (m) { return m[0]; }) : ((des.find(function (d) { return d.name === dsel.value; }) || {}).permissions || []);
          var sel = custom.checked && t !== 'admin' ? (u.customPermissions ? u.permissions : defaults) : defaults;
          $('#ue-perms', w).innerHTML = permMatrix(sel, !custom.checked || t === 'admin' || t === 'applicant');
        }
        function syncSched() { $('#ue-sched-wrap', w).hidden = type.value !== 'office'; }
        $('#ue-sched-own', w).onchange = function () { $('#ue-sched', w).hidden = !this.checked; };
        type.onchange = function () { syncDes(); syncPerms(); syncSched(); }; dsel.onchange = syncPerms; custom.onchange = syncPerms; syncDes(); syncPerms(); syncSched();
        $('#ue-save', w).onclick = async function () {
          var d = H.formData($('#ue', w)); delete d.perm; ['uday', 'ustart', 'uend'].forEach(function (k) { delete d[k]; });
          d.schedule = type.value === 'office' && $('#ue-sched-own', w).checked ? readSched(w, 'u') : null;
          if (d.schedule && !d.schedule.days.length) { toast('Pick at least one work day.'); return; }
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
  var TEMPLATES = [['verify', 'Email verification', 'Sent when someone creates an account (required for sign-up to work)'], ['password_reset', 'Password reset', 'Forgot-password links and invitations'], ['signup_admin', 'New account alert (to admin)', 'When a verified account is waiting for approval'], ['account_decision', 'Account approved / rejected', 'Tells the user the outcome'], ['application_received', 'Application received', 'Confirmation to applicant + alert to admin'], ['application_decision', 'Application decision', 'Hire or reject message'], ['time_decision', 'Time approved / rejected', 'When a manager decides on hours'], ['shift_assigned', 'Shift scheduled', 'When a shift is added for an employee'], ['inservice_assigned', 'In-service assigned', 'When training is published or a nurse assigns it'], ['leave_request', 'Leave request (to managers)', 'When an office employee requests time off'], ['leave_decision', 'Leave approved / rejected', 'Tells the employee the outcome'], ['call_assigned', 'Call assigned', 'When a logged call is assigned to someone'], ['task_assigned', 'Task assigned', 'When someone assigns you a task'], ['task_reminder', 'Task reminders', 'Daily reminder for tasks due tomorrow or overdue (WordPress)'], ['new_post', 'New staff post', 'Emails every staff member when a staff post is published']];
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
    var tab = q.tab || 'assign', head = '<div class="page-head"><div><h1>Training setup</h1><p>Assign in-services to employees with due dates, build quizzes and orientation, and track completion.</p></div></div><div class="tabs">' + [['assign', 'Assign & track'], ['inservices', 'Quizzes'], ['orientation', 'Orientation'], ['report', 'Completion report']].map(function (t) { return '<a href="#/admin/training?tab=' + t[0] + '" class="' + (tab === t[0] ? 'is-active' : '') + '">' + t[1] + '</a>'; }).join('') + '</div>';
    if (tab === 'assign') {
      var asg = await API.get('inservices/assignments'), f = q.f || 'open';
      var shownA = asg.filter(function (a) { return f === 'all' || (f === 'open' ? a.status !== 'completed' : f === 'overdue' ? a.overdue : a.status === 'completed'); });
      return head + '<section class="card" style="margin-bottom:18px"><div class="card__head"><h2>Assign an in-service</h2></div><form class="card__body stack" id="assign-form">' +
        '<div class="grid-3"><label class="field"><span>In-service</span><select class="input" name="what" required><optgroup label="Training Center">' + (window.CHCS_CENTER || []).map(function (c) { return '<option value="c:' + c[0] + '">' + esc(c[1]) + '</option>'; }).join('') + '</optgroup><optgroup label="Portal quizzes" id="quiz-opts"></optgroup></select></label><label class="field"><span>Due date</span><input class="input" type="date" name="dueDate" value="' + H.addDays(H.ymd(), 14) + '" required></label><label class="field"><span>Nurse for questions</span><select class="input" name="nurseId" id="nurse-sel"></select></label></div>' +
        '<div class="field"><span class="label">Employees</span><div class="row" style="margin-bottom:8px"><input class="input" id="emp-q" placeholder="Search name or designation" style="max-width:280px;min-height:38px"><button type="button" class="btn btn--ghost btn--sm" data-pick="field">Select all field staff</button><button type="button" class="btn btn--ghost btn--sm" data-pick="none">Clear</button></div><div class="perm-grid" id="emp-list" style="max-height:280px;overflow:auto"></div></div>' +
        '<div class="row"><button class="btn">' + ico('send') + 'Assign &amp; notify</button><span class="small muted">Each employee gets an email and a notification, and it shows on their calendar.</span></div></form></section>' +
        '<section class="card"><div class="card__head"><h2>Assignments</h2><div class="tabs" style="margin:0;border:0">' + [['open', 'Open'], ['overdue', 'Overdue'], ['completed', 'Completed'], ['all', 'All']].map(function (t) { return '<a href="#/admin/training?tab=assign&f=' + t[0] + '" class="' + (f === t[0] ? 'is-active' : '') + '">' + t[1] + ' (' + asg.filter(function (a) { return t[0] === 'all' || (t[0] === 'open' ? a.status !== 'completed' : t[0] === 'overdue' ? a.overdue : a.status === 'completed'); }).length + ')</a>'; }).join('') + '</div></div>' +
        (shownA.length ? '<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Employee</th><th>In-service</th><th>Due</th><th>Nurse</th><th>Status</th><th></th></tr></thead><tbody>' + shownA.map(function (a) { return '<tr><td data-label="Employee"><b>' + esc(a.userName) + '</b> <span class="small muted">' + esc(a.designation) + '</span></td><td data-label="In-service">' + esc(a.title) + '</td><td data-label="Due" class="nowrap">' + esc(H.fmtDate(a.dueDate)) + '</td><td data-label="Nurse">' + esc(a.nurseName) + '</td><td data-label="Status">' + (a.status === 'completed' ? '<span class="badge badge--ok">Completed</span>' : a.overdue ? '<span class="badge badge--bad">Overdue</span>' : '<span class="badge badge--warn">Assigned</span>') + '</td><td class="nowrap">' + (a.status !== 'completed' ? '<button class="btn btn--ghost btn--sm" data-unassign="' + a.id + '">Remove</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">Nothing here.</div>') + '</section>';
    }
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
  }, mount: async function (root, p, q) {
    var tab = q.tab || 'assign';
    if (tab === 'assign') {
      var staff = await API.get('staff'), quizzes = (await API.get('inservices?manage=1')).filter(function (i) { return i.active && !i.externalUrl; });
      $('#quiz-opts').innerHTML = quizzes.map(function (i) { return '<option value="i:' + i.id + '">' + esc(i.title) + '</option>'; }).join('');
      var nurses = staff.filter(function (s) { return s.type !== 'field'; });
      $('#nurse-sel').innerHTML = nurses.map(function (s) { return '<option value="' + s.id + '"' + (s.id === state.user.id ? ' selected' : '') + '>' + esc(s.name) + ' — ' + esc(s.designation || typeLabel(s)) + '</option>'; }).join('');
      var emps = staff.filter(function (s) { return s.id !== state.user.id; });
      $('#emp-list').innerHTML = emps.map(function (s) { return '<label class="perm" data-name="' + esc((s.name + ' ' + s.designation).toLowerCase()) + '" data-type="' + s.type + '"><input type="checkbox" name="emp" value="' + s.id + '"><span><b>' + esc(s.name) + '</b><small>' + esc(s.designation || typeLabel(s)) + '</small></span></label>'; }).join('');
      $('#emp-q').oninput = function () { var v = this.value.toLowerCase(); $$('#emp-list [data-name]').forEach(function (l) { l.classList.toggle('hidden', l.dataset.name.indexOf(v) === -1); }); };
      on(root, 'click', '[data-pick]', function (e, b) { $$('#emp-list [data-type]').forEach(function (l) { l.querySelector('input').checked = b.dataset.pick === 'field' ? l.dataset.type === 'field' : false; }); });
      $('#assign-form').onsubmit = async function (e) {
        e.preventDefault(); var d = H.formData(e.target), ids = $$('#emp-list input:checked').map(function (i) { return +i.value; });
        if (!ids.length) { toast('Choose at least one employee.'); return; }
        var body = { userIds: ids, dueDate: d.dueDate, nurseId: +d.nurseId }; if (d.what.indexOf('c:') === 0) body.centerId = d.what.slice(2); else body.inserviceId = +d.what.slice(2);
        try { var r2 = await submitting(function () { return API.post('inservices/assign', body); }); toast(r2.assigned + ' assignment' + (r2.assigned === 1 ? '' : 's') + ' created.', 'ok'); render(); } catch (err) { /* shown */ }
      };
      on(root, 'click', '[data-unassign]', async function (e, b) { if (await confirmBox('Remove assignment?', 'The employee will no longer see this in-service as assigned.', 'Remove', true)) { await API.del('inservices/assignments/' + b.dataset.unassign); render(); } });
    }
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

  /* ================================================================ website & social links */
  var SOCIAL = [['facebook', 'Facebook', 'https://www.facebook.com/…'], ['instagram', 'Instagram', 'https://www.instagram.com/…'], ['youtube', 'YouTube', 'https://www.youtube.com/@…'], ['linkedin', 'LinkedIn', 'https://www.linkedin.com/company/…']];
  var SOCIAL_SVG = {
    facebook: '<path d="M14 9h3V5h-3c-2.8 0-4 1.8-4 4.3V11H7v4h3v8h4v-8h3l1-4h-4V9.5c0-.3.2-.5.5-.5z"/>',
    instagram: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2z"/>',
    youtube: '<path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.4 3.1-5.4 3.1z"/>',
    linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>'
  };
  function socialIcons(links, cls) { return SOCIAL.filter(function (s) { return links && links[s[0]]; }).map(function (s) { return '<a class="' + cls + '" href="' + esc(links[s[0]]) + '" target="_blank" rel="noopener" aria-label="CHCS on ' + s[1] + '"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + SOCIAL_SVG[s[0]] + '</svg></a>'; }).join(''); }
  async function loadSocial() { if (state.social) return state.social; try { state.social = await API.get('settings/social'); } catch (e) { state.social = {}; } return state.social; }
  route('admin/website', { title: 'Website & social', nav: 'admin-website', perm: ['settings', 'news_manage'], render: async function () {
    var s = await API.get('settings/social');
    return '<div class="page-head"><div><h1>Website &amp; social media</h1><p>These links show as icons on the website (top bar and footer) and in the portal. Leave one blank to hide it.</p></div></div>' +
      '<form id="soc-form" class="card"><div class="card__body stack">' + SOCIAL.map(function (x) { return '<label class="field soc-field"><span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + SOCIAL_SVG[x[0]] + '</svg>' + x[1] + '</span><input class="input" type="url" name="' + x[0] + '" value="' + esc(s[x[0]] || '') + '" placeholder="' + esc(x[2]) + '" inputmode="url"></label>'; }).join('') +
      '<div class="row"><button class="btn btn--lg">Save links</button><span class="small muted">Preview: </span><span class="row" id="soc-preview">' + socialIcons(s, 'soc') + '</span></div></div></form>' +
      '<section class="card" style="margin-top:18px"><div class="card__body small muted">Links must start with <code>https://</code>. On WordPress, these replace the social links in <i>Appearance → Customize → CHCS Settings</i>, so you only need to manage them here.</div></section>';
  }, mount: function () {
    var f = $('#soc-form');
    f.oninput = function () { $('#soc-preview').innerHTML = socialIcons(H.formData(f), 'soc'); };
    f.onsubmit = async function (e) { e.preventDefault(); try { state.social = await API.put('settings/social', H.formData(f)); toast('Links saved. The website shows them now.', 'ok'); renderShell('admin-website'); } catch (err) { fail(err); } };
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
