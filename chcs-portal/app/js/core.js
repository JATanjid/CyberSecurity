/* CHCS Portal — shared core: module list, API client, helpers. */
(function () {
  'use strict';

  /* Every permission an admin can grant. [key, label, group, description] */
  window.CHCS_MODULES = [
    ['clock', 'Time clock', 'Time & pay', 'Clock in / clock out (office staff only)'],
    ['timesheet', 'Timesheet', 'Time & pay', 'Enter hours and submit weekly timesheets'],
    ['approvals', 'Approve time', 'Time & pay', 'Approve or reject submitted hours'],
    ['payroll', 'Payroll export', 'Time & pay', 'Download approved hours and leave as an Excel file'],
    ['leave', 'Vacation & sick leave', 'Time & pay', 'Request vacation, sick and other leave'],
    ['leave_manage', 'Manage leave', 'Time & pay', 'Approve leave requests and set yearly allowances'],
    ['calls', 'Call dashboard', 'Communication', 'Log incoming calls and assign follow-ups'],
    ['chat', 'Chat', 'Communication', 'Message coworkers (field staff can message the office only)'],
    ['news_manage', 'Manage news & posts', 'Communication', 'Publish posts to the portal and the website'],
    ['intake', 'Intake & cases', 'Patients', 'Create referrals and manage patient cases'],
    ['forms', 'Forms', 'Patients', 'Duty sheet, patient assessment and other agency forms'],
    ['calendar', 'My schedule', 'Scheduling', 'See own shifts, leave and due dates'],
    ['calendar_manage', 'Manage schedules', 'Scheduling', 'Create and edit shifts for everyone'],
    ['inservices', 'In-services', 'Training', 'Complete assigned in-service trainings'],
    ['orientation', 'Orientation', 'Training', 'Allowed to complete new-hire orientation'],
    ['training_manage', 'Manage training', 'Training', 'Create and assign in-services, orientation, completion reports'],
    ['applications', 'Review applications', 'Admin', 'Approve or reject job applicants'],
    ['users', 'Users & access', 'Admin', 'Approve accounts, set designations and permissions'],
    ['settings', 'Email & API settings', 'Admin', 'Connect Resend and control automatic emails'],
    ['audit', 'Audit log', 'Admin', 'See who did what']
  ];

  /* Trainings inside the CHCS In-Service Training Center (forms/inservice-training.html). */
  window.CHCS_CENTER = [
    ['homecare', 'Home Care Overview', 60], ['osha', 'OSHA Standards: Infection and Safety', 60],
    ['disaster', 'Disaster and Emergency Preparedness', 45], ['oxygen', 'Oxygen Safety', 30],
    ['rnlpn', 'RN/LPN Training / Competency Checklist', 60], ['violence', 'Workplace Violence Prevention & Safety', 45],
    ['measles', 'Measles & Hantavirus Infection Control', 45], ['lithium', 'Lithium Battery Safety & Fire Prevention', 30],
    ['lgbtqia', 'LGBTQIA+ Cultural Competency Training', 45], ['maid', 'Medical Aid in Dying Clinical Protocols', 45],
    ['cyclo', 'Cyclosporiasis: Prevention, Identification, and Reporting', 30], ['harassment', 'Sexual Harassment Prevention Training', 60]
  ];
  window.CHCS_LEAVE_TYPES = [['vacation', 'Vacation'], ['sick', 'Sick leave'], ['personal', 'Personal day'], ['bereavement', 'Bereavement'], ['jury', 'Jury duty'], ['unpaid', 'Unpaid leave'], ['other', 'Other']];
  window.CHCS_CALLER_TYPES = [['patient', 'Patient'], ['family', 'Family member'], ['referral', 'Referral source'], ['physician', 'Physician / hospital'], ['employee', 'Employee'], ['applicant', 'Job applicant'], ['insurance', 'Insurance / MLTC'], ['vendor', 'Vendor'], ['other', 'Other']];
  window.CHCS_CALL_REASONS = ['New referral / services', 'Scheduling', 'Billing / insurance', 'Complaint', 'Clinical question', 'Employment / HR', 'Payroll', 'Message for staff', 'Other'];


  var cfg = window.CHCS_CONFIG || { mode: 'demo' };
  cfg.mode = cfg.mode || 'demo';

  async function call(method, path, body) {
    if (cfg.mode === 'demo') {
      await new Promise(function (r) { setTimeout(r, 120); });
      return window.CHCSDemoServer.handle(method, path, body);
    }
    var res = await fetch(cfg.root.replace(/\/$/, '') + '/' + path.replace(/^\//, ''), {
      method: method,
      credentials: 'same-origin',
      // Sign-in style endpoints must not carry an old session's nonce (WordPress rejects stale nonces).
      headers: Object.assign({ 'Content-Type': 'application/json' }, cfg.nonce && !/^auth\/(login|signup|verify|forgot|reset|resend)/.test(path) ? { 'X-WP-Nonce': cfg.nonce } : {}),
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined
    });
    var newNonce = res.headers.get('X-CHCS-Nonce');
    if (newNonce) cfg.nonce = newNonce;
    if (path.indexOf('auth/logout') === 0) cfg.nonce = '';
    var data = null;
    try { data = await res.json(); } catch (e) { /* empty */ }
    if (!res.ok) {
      var e2 = new Error((data && data.message) || ('Request failed (' + res.status + ')'));
      e2.status = res.status; e2.code = data && data.code; throw e2;
    }
    return data;
  }

  window.API = {
    config: cfg,
    get: function (p) { return call('GET', p); },
    post: function (p, b) { return call('POST', p, b || {}); },
    put: function (p, b) { return call('PUT', p, b || {}); },
    patch: function (p, b) { return call('PATCH', p, b || {}); },
    del: function (p) { return call('DELETE', p); }
  };

  /* ---------- helpers ---------- */
  var H = window.H = {};
  H.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  H.nl2br = function (s) { return H.esc(s).replace(/\n/g, '<br>'); };
  H.ymd = function (d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  H.addDays = function (s, n) { var d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return H.ymd(d); };
  H.weekStart = function (s) { var d = new Date((s || H.ymd()) + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return H.ymd(d); };
  H.fmtDate = function (s, opts) { if (!s) return '—'; var d = new Date(s.length === 10 ? s + 'T12:00:00' : s); return d.toLocaleDateString(undefined, opts || { month: 'short', day: 'numeric', year: 'numeric' }); };
  H.fmtTime = function (s) { if (!s) return '—'; return new Date(s).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
  H.fmtHM = function (hm) { if (!hm) return ''; var p = hm.split(':'), h = +p[0]; return (h % 12 || 12) + ':' + p[1] + (h < 12 ? ' AM' : ' PM'); };
  H.hours = function (min) { return (Math.round((min || 0) / 60 * 100) / 100).toFixed(2); };
  H.ago = function (s) {
    var m = Math.round((Date.now() - new Date(s)) / 60000);
    if (m < 1) return 'just now'; if (m < 60) return m + 'm ago';
    var h = Math.round(m / 60); if (h < 24) return h + 'h ago';
    return H.fmtDate(s, { month: 'short', day: 'numeric' });
  };
  H.initials = function (n) { return String(n || '?').split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); };
  H.avatar = function (n, size) {
    var hue = 0; String(n || '').split('').forEach(function (c) { hue = (hue * 31 + c.charCodeAt(0)) % 360; });
    return '<span class="avatar' + (size ? ' avatar--' + size : '') + '" style="--h:' + hue + '">' + H.esc(H.initials(n)) + '</span>';
  };
  H.badge = function (status) {
    var map = { open: 'info', draft: 'muted', pending: 'warn', submitted: 'warn', approved: 'ok', active: 'ok', reviewed: 'ok', rejected: 'bad', suspended: 'bad', declined: 'bad', unverified: 'muted', new: 'info', verifying: 'warn', assessment: 'info', on_hold: 'muted', discharged: 'muted', published: 'ok', high: 'bad', normal: 'muted' };
    return '<span class="badge badge--' + (map[status] || 'muted') + '">' + H.esc(String(status || '').replace(/_/g, ' ')) + '</span>';
  };
  H.formData = function (form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      if (k.slice(-2) === '[]') { k = k.slice(0, -2); (o[k] = o[k] || []).push(v); } else o[k] = v;
    });
    return o;
  };
})();
