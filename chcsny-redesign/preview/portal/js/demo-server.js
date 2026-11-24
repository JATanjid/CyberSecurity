/* CHCS Portal — in-browser DEMO backend.
 * Implements the same REST contract as the WordPress plugin (chcs/v1) but stores
 * everything in this browser's localStorage. Used only for the GitHub Pages test site.
 * Never enter real patient or employee information in demo mode.
 */
(function () {
  'use strict';
  var KEY = 'chcs_portal_demo_v1';
  var MODULES = window.CHCS_MODULES;

  function now() { return new Date().toISOString(); }
  function today(offset) { var d = new Date(); d.setDate(d.getDate() + (offset || 0)); return ymd(d); }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function token() { var a = new Uint8Array(16); crypto.getRandomValues(a); return Array.from(a, function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function err(status, message) { var e = new Error(message); e.status = status; return e; }
  async function hash(pw) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('chcs-demo:' + pw));
    return Array.from(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  var db;
  function load() { try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage full or blocked */ } }
  function nextId() { db.seq = (db.seq || 1000) + 1; return db.seq; }
  function col(name) { if (!db.records[name]) db.records[name] = []; return db.records[name]; }
  function find(name, id) { id = Number(id); return col(name).find(function (r) { return r.id === id; }); }
  function insert(name, rec) { rec.id = nextId(); rec.createdAt = rec.createdAt || now(); col(name).push(rec); return rec; }
  function user(id) { id = Number(id); return db.users.find(function (u) { return u.id === id; }); }

  /* ------------------------------------------------------------------ seed */
  async function seed() {
    var pw = await hash('demo1234');
    db = { seq: 1000, users: [], designations: [], records: {}, settings: {}, session: null };
    var D = function (name, type, perms) { db.designations.push({ id: nextId(), name: name, type: type, permissions: perms }); };
    var OFFICE = ['clock', 'leave', 'calls', 'chat', 'calendar', 'tasks'];
    D('Office Manager', 'office', OFFICE.concat(['approvals', 'intake', 'calendar_manage', 'tasks_manage', 'payroll', 'leave_manage', 'applications', 'news_manage', 'training_manage', 'forms']));
    D('Intake Coordinator', 'office', OFFICE.concat(['intake', 'forms']));
    D('Scheduler', 'office', OFFICE.concat(['intake', 'calendar_manage']));
    D('Payroll Specialist', 'office', OFFICE.concat(['approvals', 'payroll']));
    D('HR Coordinator', 'office', OFFICE.concat(['applications', 'training_manage', 'news_manage', 'leave_manage', 'tasks_manage']));
    D('Nursing Supervisor', 'office', OFFICE.concat(['intake', 'approvals', 'training_manage', 'inservices', 'forms']));
    D('PCA', 'field', ['chat', 'inservices', 'calendar', 'forms']);
    D('HHA', 'field', ['chat', 'inservices', 'calendar', 'forms']);
    D('LPN', 'field', ['chat', 'inservices', 'calendar', 'forms']);
    D('RN', 'field', ['chat', 'inservices', 'calendar', 'forms']);

    var U = function (name, email, type, designation, extra) {
      var u = Object.assign({ id: nextId(), name: name, email: email, phone: '', type: type, designation: designation, status: 'active', permissions: null, password: pw, createdAt: now(), emailVerified: true }, extra || {});
      db.users.push(u); return u;
    };
    var admin = U('Agency Admin', 'admin@chcs.demo', 'admin', 'Administrator');
    var maria = U('Maria Lopez', 'manager@chcs.demo', 'office', 'Office Manager', { phone: '(718) 555-0101' });
    var james = U('James Carter', 'intake@chcs.demo', 'office', 'Intake Coordinator', { phone: '(718) 555-0102' });
    var grace = U('Grace Johnson', 'hha@chcs.demo', 'field', 'HHA', { phone: '(718) 555-0144', permissions: ['chat', 'inservices', 'calendar', 'forms', 'timesheet', 'orientation'] });
    var nadia = U('Nadia Pierre', 'rn@chcs.demo', 'field', 'RN', { phone: '(718) 555-0155', permissions: ['chat', 'inservices', 'calendar', 'forms', 'timesheet'] });
    var rita = U('Rita Okafor, RN', 'nurse@chcs.demo', 'office', 'Nursing Supervisor', { phone: '(718) 555-0160' });
    U('Kevin Brown', 'pending@chcs.demo', 'office', 'Scheduler', { status: 'pending' });
    var appl = U('Ana Rivera', 'applicant@chcs.demo', 'applicant', '', {});

    db.settings.email = {
      provider: 'wordpress', resendKey: '', fromName: 'Complete Home Care Services', fromEmail: 'no-reply@chcsny.com', replyTo: 'info@chcsny.com', adminEmail: 'admin@chcs.demo',
      templates: { verify: true, password_reset: true, signup_admin: true, account_decision: true, application_received: true, application_decision: true, time_decision: true, shift_assigned: true, inservice_assigned: true, leave_request: true, leave_decision: true, call_assigned: true, task_assigned: true, task_reminder: true, new_post: false }
    };
    db.settings.leave = { vacation: 80, sick: 40, personal: 16, hoursPerDay: 8 };
    db.settings.time = { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', grace: 15 };
    db.settings.social = { facebook: 'https://www.facebook.com/CHCSNY/', instagram: 'https://www.instagram.com/chcsny/', youtube: '', linkedin: '' };

    // Cases
    var c1 = insert('cases', { patientName: 'Dorothy Williams', dob: '1941-03-12', phone: '(718) 555-0190', address: '110-20 Farmers Blvd', borough: 'Queens', referralSource: 'Hospital discharge', referrerName: 'Jamaica Hospital — D. Shah', insurance: 'Medicare', physician: 'Dr. A. Mensah', services: ['Skilled Nursing', 'Physical Therapy'], status: 'active', priority: 'normal', assigned: [nadia.id, grace.id], createdBy: james.id, socDate: today(-12) });
    insert('cases', { patientName: 'Harold Greene', dob: '1950-07-02', phone: '(347) 555-0123', address: '45 Linden Blvd', borough: 'Brooklyn', referralSource: 'Physician', referrerName: 'Dr. K. Osei', insurance: 'Medicaid MLTC', physician: 'Dr. K. Osei', services: ['Skilled Nursing'], status: 'assessment', priority: 'high', assigned: [nadia.id], createdBy: james.id });
    insert('cases', { patientName: 'Rosa Martinez', dob: '1938-11-30', phone: '(718) 555-0177', address: '2100 Grand Concourse', borough: 'Bronx', referralSource: 'Family', referrerName: 'Daughter — L. Martinez', insurance: 'Verifying', physician: '', services: ['Respite Care'], status: 'verifying', priority: 'normal', assigned: [], createdBy: james.id });
    insert('cases', { patientName: 'Samuel Okafor', dob: '1946-01-19', phone: '(516) 555-0166', address: '12 Main St, Hempstead', borough: 'Nassau County', referralSource: 'Website', referrerName: '', insurance: '', physician: '', services: ['Occupational Therapy'], status: 'new', priority: 'normal', assigned: [], createdBy: james.id });
    insert('caseNotes', { caseId: c1.id, userId: james.id, body: 'Start of care completed. RN visits 2x/week, HHA daily 4h.' });

    // Time entries: office clock punches on recent weekdays. Inside the schedule = approved automatically; outside = waits for approval.
    james.schedule = { days: [1, 2, 3, 4, 5], start: '08:30', end: '17:00' };
    function entry(u, dOff, h1, h2) {
      var d = today(dOff), s = new Date(d + 'T' + h1 + ':00'), e = new Date(d + 'T' + h2 + ':00');
      var t = insert('time', { userId: u.id, date: d, start: s.toISOString(), end: e.toISOString(), minutes: Math.round((e - s) / 60000), source: 'clock', note: '' });
      var f = scheduleFlag(t); if (f) { t.status = 'pending'; t.flag = f; } else { t.status = 'approved'; t.autoApproved = true; }
    }
    var wd = []; for (var k = -1; wd.length < 7; k--) { var dw = new Date(today(k) + 'T12:00:00').getDay(); if (dw > 0 && dw < 6) wd.push(k); }
    wd.forEach(function (o, n) {
      entry(maria, o, n === 0 ? '08:20' : '09:02', '17:05');
      entry(james, o, '08:31', n === 1 ? '18:45' : '17:00');
    });
    var sat = wd.length && (function () { for (var k = -1; k > -8; k--) if (new Date(today(k) + 'T12:00:00').getDay() === 6) return k; })();
    if (sat) entry(james, sat, '10:00', '13:00');

    // Shifts
    [0, 1, 2, 3, 4].forEach(function (o) {
      insert('shifts', { userId: maria.id, date: today(o), start: '09:00', end: '17:30', title: 'Office', location: 'St. Albans office', notes: '' });
      insert('shifts', { userId: james.id, date: today(o), start: '08:30', end: '17:00', title: 'Intake desk', location: 'St. Albans office', notes: '' });
    });

    // In-services
    insert('inservices', { title: 'Infection Control & Hand Hygiene', description: 'Standard precautions, hand hygiene and PPE in the home.', body: 'Hand hygiene is the single most important way to prevent infection.\n\n• Wash hands with soap and water for at least 20 seconds before and after patient contact.\n• Use alcohol-based hand rub when hands are not visibly soiled.\n• Wear gloves for contact with blood or body fluids, and change them between tasks.\n• Dispose of sharps and soiled supplies according to agency policy.\n• Report any signs of infection (fever, redness, drainage) to the RN right away.', hours: 1, dueDate: today(14), audience: ['field'], passScore: 80, externalUrl: '', active: true,
      questions: [{ q: 'How long should you wash your hands with soap and water?', options: ['5 seconds', '10 seconds', 'At least 20 seconds'], answer: 2 }, { q: 'When should gloves be changed?', options: ['Once per day', 'Between tasks', 'Only if torn'], answer: 1 }, { q: 'Who do you report signs of infection to?', options: ['The RN', 'Nobody', 'A neighbor'], answer: 0 }] });
    insert('inservices', { title: 'HIPAA & Patient Privacy', description: 'Protecting patient information at home, on the phone and on your mobile device.', body: '• Only share patient information with people involved in their care.\n• Never post about patients on social media.\n• Lock your phone and never save patient photos to your personal gallery.\n• Report any privacy breach to the Compliance Hotline immediately.', hours: 1, dueDate: today(30), audience: ['field', 'office'], passScore: 100, externalUrl: '', active: true,
      questions: [{ q: 'Can you post a photo of a patient on social media if you hide their face?', options: ['Yes', 'No'], answer: 1 }, { q: 'Where do you report a privacy breach?', options: ['Compliance Hotline', 'Social media', 'Nowhere'], answer: 0 }] });

    // Orientation
    ['Welcome to Complete Home Care Services', 'Patient Rights & Responsibilities', 'Infection Control', 'Emergency Preparedness', 'Abuse, Neglect & Incident Reporting', 'Compliance & Code of Conduct'].forEach(function (t, i) {
      insert('orientationModules', { title: t, order: i + 1, body: t + ' — please read this section of the CHCS Employee Handbook carefully. Your administrator can replace this text with the agency\'s full orientation content from Admin → Training.' });
    });

    // Posts
    insert('posts', { title: 'Welcome to the new CHCS Staff Portal', body: 'Clock in, see your schedule, complete in-services and message the office — all from your phone. Tap "Install app" in the menu to add the portal to your home screen.', audience: 'staff', pinned: true, status: 'published', authorId: admin.id, publishedAt: now() });
    insert('posts', { title: 'Flu shots available at the office', body: 'Free flu vaccines for all staff every Tuesday and Thursday, 10 AM – 2 PM, at the St. Albans office. Bring your employee ID.', audience: 'staff', pinned: false, status: 'published', authorId: maria.id, publishedAt: now() });
    insert('posts', { title: 'CHCS earns The Joint Commission Gold Seal of Approval®', body: 'Complete Home Care Services has been recognized for its commitment to quality and safety in home care. Thank you to every nurse, aide and therapist who made it possible.', audience: 'public', pinned: false, status: 'published', authorId: admin.id, publishedAt: now() });
    insert('posts', { title: 'We are hiring HHAs and PCAs in Queens and Brooklyn', body: 'Flexible schedules, weekly pay and paid in-service training. Apply online through the CHCS portal.', audience: 'public', pinned: false, status: 'published', authorId: maria.id, publishedAt: now() });

    // Chat
    var team = insert('conversations', { type: 'group', name: 'Office Team', members: [admin.id, maria.id, james.id], lastMessageAt: now(), reads: {} });
    var dm = insert('conversations', { type: 'direct', name: null, members: [grace.id, maria.id], lastMessageAt: now(), reads: {} });
    insert('messages', { convId: team.id, userId: maria.id, body: 'Good morning team — 2 new referrals came in overnight.' });
    insert('messages', { convId: team.id, userId: james.id, body: 'On it. Verifying insurance for Rosa Martinez now.' });
    insert('messages', { convId: dm.id, userId: grace.id, body: 'Hi Maria, Mrs. Williams asked to move Thursday\'s visit to 10 AM.' });
    insert('messages', { convId: dm.id, userId: maria.id, body: 'Thanks Grace, I updated the schedule.' });

    insert('applications', { userId: appl.id, status: 'submitted', submittedAt: now(), data: { position: 'HHA', availability: 'Weekdays, mornings', certification: 'NYS HHA certificate', licenseNumber: 'HHA-445219', experience: '3 years home care in Brooklyn', languages: 'English, Spanish', references: 'R. Diaz (718) 555-0133', workAuth: 'yes', attestation: true, signature: 'Ana Rivera' } });
    // In-service assignments (Training Center modules + a portal quiz), made by the nursing supervisor
    insert('inserviceAssignments', { userId: grace.id, centerId: 'homecare', title: 'Home Care Overview', dueDate: today(5), nurseId: rita.id, assignedBy: rita.id, status: 'assigned' });
    insert('inserviceAssignments', { userId: grace.id, centerId: 'violence', title: 'Workplace Violence Prevention & Safety', dueDate: today(-2), nurseId: rita.id, assignedBy: rita.id, status: 'assigned' });
    insert('inserviceAssignments', { userId: nadia.id, centerId: 'rnlpn', title: 'RN/LPN Training / Competency Checklist', dueDate: today(12), nurseId: rita.id, assignedBy: rita.id, status: 'assigned' });
    // Leave
    insert('leave', { userId: james.id, type: 'vacation', from: today(9), to: today(11), partial: false, hoursPerDay: 8, totalHours: 24, reason: 'Family trip', status: 'pending' });
    insert('leave', { userId: maria.id, type: 'sick', from: today(-6), to: today(-6), partial: false, hoursPerDay: 8, totalHours: 8, reason: '', status: 'approved', decidedBy: admin.id });
    // Calls
    insert('calls', { takenBy: james.id, callerName: 'Linda Martinez', callerPhone: '(718) 555-0177', callerType: 'family', reason: 'Scheduling', message: 'Daughter of Rosa Martinez asking when the nurse assessment will be scheduled.', assignedTo: rita.id, priority: 'normal', status: 'open', callbackBy: today(0) + 'T16:00', duration: 240, followUps: [] });
    insert('calls', { takenBy: maria.id, callerName: 'Jamaica Hospital — D. Shah', callerPhone: '(718) 555-0199', callerType: 'physician', reason: 'New referral / services', message: 'New referral for skilled nursing, patient discharging Friday. Fax coming.', assignedTo: james.id, priority: 'urgent', status: 'open', callbackBy: today(0) + 'T12:00', duration: 300, followUps: [] });
    insert('calls', { takenBy: james.id, callerName: 'Grace Johnson', callerPhone: '(718) 555-0144', callerType: 'employee', reason: 'Payroll', message: 'Question about last week\'s hours.', assignedTo: maria.id, priority: 'normal', status: 'returned', callbackBy: '', duration: 120, followUps: [{ userId: maria.id, body: 'Called back, explained the approval schedule.', at: now() }] });
    insert('notifications', { userId: rita.id, kind: 'call', title: 'Call assigned to you: Linda Martinez', body: 'Asking when the nurse assessment will be scheduled.', link: '#/calls', read: false });
    insert('notifications', { userId: james.id, kind: 'call', title: 'Urgent call assigned to you: Jamaica Hospital', body: 'New referral for skilled nursing.', link: '#/calls', read: false });
    insert('notifications', { userId: grace.id, kind: 'inservice', title: 'In-service assigned: Home Care Overview', body: 'Due ' + today(5), link: '#/inservices', read: false });
    var nurseChat = insert('conversations', { type: 'direct', name: null, members: [grace.id, rita.id], lastMessageAt: now(), reads: {}, delivered: {} });
    insert('messages', { convId: nurseChat.id, userId: rita.id, body: 'Hi Grace, I assigned you two in-services. Message me here if you have questions during the test.' });
    // Office tasks & deadlines (some repeat)
    insert('tasks', { title: 'Renew NYS DOH home care license', description: 'Submit renewal packet and fee.', category: 'Compliance / licensing', assignedTo: maria.id, createdBy: admin.id, dueDate: today(20), priority: 'high', repeat: 'yearly', status: 'open' });
    insert('tasks', { title: 'Monthly payroll reconciliation', description: 'Match approved hours with HHAeXchange export.', category: 'Billing / payroll', assignedTo: maria.id, createdBy: admin.id, dueDate: today(3), priority: 'normal', repeat: 'monthly', status: 'open' });
    insert('tasks', { title: 'Review expiring staff certifications', description: 'Pull list of certificates expiring in the next 60 days.', category: 'HR / personnel files', assignedTo: james.id, createdBy: maria.id, dueDate: today(-1), priority: 'normal', repeat: 'monthly', status: 'open' });
    insert('tasks', { title: 'Quarterly chart audit (10 charts)', description: '', category: 'Audit / survey', assignedTo: rita.id, createdBy: maria.id, dueDate: today(8), priority: 'normal', repeat: 'quarterly', status: 'open' });
    audit(admin.id, 'demo.seed', 'Demo data created');
    save();
  }

  /* ------------------------------------------------------------- helpers */
  function audit(userId, action, detail) { insert('audit', { userId: userId, action: action, detail: detail || '' }); var a = col('audit'); if (a.length > 500) a.splice(0, a.length - 500); }

  function notify(userId, kind, title, body, link) {
    if (!userId) return;
    insert('notifications', { userId: Number(userId), kind: kind, title: title, body: body || '', link: link || '', read: false });
    var n = col('notifications'); if (n.length > 1000) n.splice(0, n.length - 1000);
  }
  function usersWith(p) { return db.users.filter(function (u) { return u.status === 'active' && can(u, p); }); }
  function perms(u) {
    if (!u) return [];
    if (u.type === 'admin') return MODULES.map(function (m) { return m[0]; });
    if (u.type === 'applicant' || u.status !== 'active') return [];
    if (Array.isArray(u.permissions)) return u.permissions.slice();
    var d = db.designations.find(function (x) { return x.name === u.designation; });
    return d ? d.permissions.slice() : ['chat'];
  }
  function can(u, p) { return perms(u).indexOf(p) !== -1; }
  function pub(u, full) {
    if (!u) return null;
    var o = { id: u.id, name: u.name, type: u.type, designation: u.designation, status: u.status };
    if (full) { o.email = u.email; o.phone = u.phone; o.permissions = perms(u); o.customPermissions = Array.isArray(u.permissions); o.createdAt = u.createdAt; o.emailVerified = !!u.emailVerified; o.schedule = u.schedule || null; }
    return o;
  }
  function me() { return db.session ? user(db.session) : null; }
  function requireUser() { var u = me(); if (!u) throw err(401, 'Please sign in.'); return u; }
  function requirePerm(p) { var u = requireUser(); if (!can(u, p)) throw err(403, 'You do not have access to this section.'); return u; }
  function str(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 500); }
  function emailOk(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  /* Email "sending" — demo only logs to the Demo Inbox. */
  function sendEmail(template, to, subject, body) {
    var s = db.settings.email;
    if (s.templates && s.templates[template] === false) return;
    insert('emails', { template: template, to: to, subject: subject, body: body, provider: s.provider === 'resend' ? 'Resend (simulated)' : 'WordPress mail (simulated)', status: 'demo — not actually sent' });
  }
  function base() { return location.href.split('#')[0]; }
  function admins() { return db.users.filter(function (u) { return u.type === 'admin' && u.status === 'active'; }); }
  function notifyAdmins(template, subject, body) { var to = db.settings.email.adminEmail || (admins()[0] || {}).email; if (to) sendEmail(template, to, subject, body); }

  function weekStart(dateStr) { var d = new Date(dateStr + 'T12:00:00'); var day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return ymd(d); }

  /* ------------------------------------------------------------- routes */
  var routes = [];
  function route(method, pattern, fn) { routes.push({ m: method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn: fn }); }

  // ---- auth
  route('POST', 'auth/signup', async function (p, b) {
    var name = str(b.name, 100), email = str(b.email, 190).toLowerCase(), type = b.accountType;
    if (!name || !emailOk(email)) throw err(400, 'Please enter your name and a valid email.');
    if (!b.password || b.password.length < 8) throw err(400, 'Password must be at least 8 characters.');
    if (['office', 'field', 'applicant'].indexOf(type) === -1) throw err(400, 'Choose an account type.');
    if (db.users.some(function (u) { return u.email === email; })) throw err(409, 'An account with this email already exists. Try signing in.');
    var t = token();
    var u = { id: nextId(), name: name, email: email, phone: str(b.phone, 30), type: type, designation: type === 'applicant' ? '' : str(b.designation, 60), status: 'unverified', permissions: null, password: await hash(b.password), verifyToken: t, createdAt: now(), emailVerified: false };
    db.users.push(u);
    sendEmail('verify', email, 'Verify your email — CHCS Portal', 'Hi ' + name + ',\n\nPlease confirm your email address to continue:\n' + base() + '#/verify/' + t + '\n\nIf you did not create this account, ignore this email.');
    audit(u.id, 'auth.signup', type);
    save(); return { ok: true, message: 'Check your email for a verification link.' };
  });
  route('POST', 'auth/verify', function (p, b) {
    var u = db.users.find(function (x) { return x.verifyToken && x.verifyToken === b.token; });
    if (!u) throw err(400, 'This verification link is invalid or was already used.');
    u.verifyToken = null; u.emailVerified = true;
    u.status = u.type === 'applicant' ? 'active' : 'pending';
    if (u.status === 'pending') usersWith('users').forEach(function (a) { notify(a.id, 'account', 'Account waiting for approval', u.name + ' (' + (u.designation || u.type) + ')', '#/admin/users'); });
    if (u.status === 'pending') notifyAdmins('signup_admin', 'New portal account waiting for approval', u.name + ' (' + u.email + ') signed up as ' + u.type + (u.designation ? ' — ' + u.designation : '') + '. Review it in Admin → Users.');
    audit(u.id, 'auth.verified', '');
    save(); return { ok: true, status: u.status };
  });
  route('POST', 'auth/resend-verification', function (p, b) {
    var u = db.users.find(function (x) { return x.email === str(b.email).toLowerCase(); });
    if (u && u.status === 'unverified') { u.verifyToken = token(); sendEmail('verify', u.email, 'Verify your email — CHCS Portal', 'Verification link:\n' + base() + '#/verify/' + u.verifyToken); save(); }
    return { ok: true };
  });
  route('POST', 'auth/login', async function (p, b) {
    var u = db.users.find(function (x) { return x.email === str(b.email).toLowerCase(); });
    if (!u || u.password !== await hash(b.password || '')) throw err(401, 'Incorrect email or password.');
    if (u.status === 'unverified') { var e = err(403, 'Please verify your email first. We can resend the link.'); e.code = 'unverified'; throw e; }
    if (u.status === 'suspended') throw err(403, 'This account is suspended. Contact the office.');
    if (u.status === 'rejected') throw err(403, 'This account was not approved. Contact the office.');
    db.session = u.id; u.lastLogin = now(); audit(u.id, 'auth.login', ''); save();
    return { user: pub(u, true) };
  });
  route('POST', 'auth/logout', function () { db.session = null; save(); return { ok: true }; });
  route('POST', 'auth/forgot', function (p, b) {
    var u = db.users.find(function (x) { return x.email === str(b.email).toLowerCase(); });
    if (u) { u.resetToken = token(); sendEmail('password_reset', u.email, 'Reset your CHCS Portal password', 'Reset link (valid 1 hour):\n' + base() + '#/reset/' + u.resetToken); save(); }
    return { ok: true };
  });
  route('POST', 'auth/reset', async function (p, b) {
    var u = db.users.find(function (x) { return x.resetToken && x.resetToken === b.token; });
    if (!u) throw err(400, 'This reset link is invalid or expired.');
    if (!b.password || b.password.length < 8) throw err(400, 'Password must be at least 8 characters.');
    u.password = await hash(b.password); u.resetToken = null; save(); return { ok: true };
  });
  route('GET', 'me', function () { var u = me(); if (!u) throw err(401, 'Not signed in.'); return { user: pub(u, true) }; });
  route('PATCH', 'me', async function (p, b) {
    var u = requireUser();
    if (b.name) u.name = str(b.name, 100);
    if (b.phone != null) u.phone = str(b.phone, 30);
    if (b.newPassword) { if (u.password !== await hash(b.currentPassword || '')) throw err(400, 'Current password is incorrect.'); if (b.newPassword.length < 8) throw err(400, 'Password must be at least 8 characters.'); u.password = await hash(b.newPassword); }
    save(); return { user: pub(u, true) };
  });

  // ---- dashboard
  route('GET', 'dashboard', function () {
    var u = requireUser(), out = {};
    var mine = col('time').filter(function (t) { return t.userId === u.id; });
    var ws = weekStart(today());
    out.weekMinutes = mine.filter(function (t) { return t.date >= ws && t.end; }).reduce(function (a, t) { return a + t.minutes; }, 0);
    out.openEntry = mine.find(function (t) { return t.status === 'open'; }) || null;
    if (can(u, 'approvals')) out.pendingApprovals = col('time').filter(function (t) { return t.status === 'pending'; }).length;
    if (can(u, 'intake')) out.newCases = col('cases').filter(function (c) { return c.status === 'new' || c.status === 'verifying'; }).length;
    if (can(u, 'applications')) out.pendingApplications = col('applications').filter(function (a) { return a.status === 'submitted'; }).length;
    if (can(u, 'users')) out.pendingUsers = db.users.filter(function (x) { return x.status === 'pending'; }).length;
    out.upcomingShifts = col('shifts').filter(function (s) { return s.userId === u.id && s.date >= today(); }).sort(function (a, b) { return (a.date + a.start).localeCompare(b.date + b.start); }).slice(0, 4);
    if (can(u, 'inservices')) out.inservicesDue = visibleInservices(u).filter(function (i) { return !i.myResult || !i.myResult.passed; }).length;
    out.unread = can(u, 'chat') ? conversationsFor(u).reduce(function (a, c) { return a + c.unread; }, 0) : 0;
    if (can(u, 'tasks')) out.myTasks = col('tasks').filter(function (t) { return t.assignedTo === u.id && t.status === 'open' && t.dueDate <= today(7); }).length;
    if (can(u, 'calls')) out.myCalls = col('calls').filter(function (c) { return c.assignedTo === u.id && (c.status === 'open' || c.status === 'in_progress'); }).length;
    if (can(u, 'leave_manage')) out.pendingLeave = col('leave').filter(function (l) { return l.status === 'pending' && l.userId !== u.id; }).length;
    out.unreadNotifications = col('notifications').filter(function (n) { return n.userId === u.id && !n.read; }).length;
    out.posts = visiblePosts(u).slice(0, 4);
    return out;
  });

  // ---- users & access
  route('GET', 'users', function (p, b, q) {
    requirePerm('users');
    return db.users.filter(function (u) { return !q.status || u.status === q.status; }).map(function (u) { return pub(u, true); });
  });
  route('POST', 'users', function (p, b) {
    var a = requirePerm('users'), email = str(b.email, 190).toLowerCase();
    if (!emailOk(email) || !str(b.name)) throw err(400, 'Name and valid email required.');
    if (db.users.some(function (u) { return u.email === email; })) throw err(409, 'Email already in use.');
    var u = { id: nextId(), name: str(b.name, 100), email: email, phone: str(b.phone, 30), type: b.type || 'office', designation: str(b.designation, 60), status: 'active', permissions: null, password: '', resetToken: token(), createdAt: now(), emailVerified: true };
    db.users.push(u);
    sendEmail('account_decision', email, 'You have been invited to the CHCS Portal', 'Hi ' + u.name + ',\n\nAn account was created for you. Set your password here:\n' + base() + '#/reset/' + u.resetToken);
    audit(a.id, 'users.invite', email); save(); return pub(u, true);
  });
  route('PATCH', 'users/:id', function (p, b) {
    var a = requirePerm('users'), u = user(p.id);
    if (!u) throw err(404, 'User not found.');
    if (u.id === a.id && b.status && b.status !== 'active') throw err(400, 'You cannot deactivate your own account.');
    var before = u.status;
    ['name', 'phone', 'designation'].forEach(function (k) { if (b[k] != null) u[k] = str(b[k], 100); });
    if (b.type && ['admin', 'office', 'field', 'applicant'].indexOf(b.type) !== -1) { if (b.type === 'admin' && a.type !== 'admin') throw err(403, 'Only admins can create admins.'); u.type = b.type; }
    if (b.status && ['pending', 'active', 'rejected', 'suspended'].indexOf(b.status) !== -1) u.status = b.status;
    if ('schedule' in b) u.schedule = scheduleInput(b.schedule);
    if (b.permissions === null) u.permissions = null;
    else if (Array.isArray(b.permissions)) u.permissions = b.permissions.filter(function (x) { return MODULES.some(function (m) { return m[0] === x; }); });
    if (before !== u.status && (u.status === 'active' || u.status === 'rejected')) {
      sendEmail('account_decision', u.email, u.status === 'active' ? 'Your CHCS Portal account is approved' : 'Your CHCS Portal account request', u.status === 'active' ? 'Hi ' + u.name + ',\n\nYour account has been approved. Sign in at ' + base() : 'Hi ' + u.name + ',\n\nYour account request was not approved. Please contact the office with any questions.');
    }
    audit(a.id, 'users.update', u.email + (before !== u.status ? ' status ' + before + '→' + u.status : '')); save(); return pub(u, true);
  });
  route('GET', 'designations', function () { requireUser(); return clone(db.designations); });
  route('POST', 'designations', function (p, b) {
    var a = requirePerm('users'); if (!str(b.name)) throw err(400, 'Name required.');
    var d = { id: nextId(), name: str(b.name, 60), type: b.type === 'field' ? 'field' : 'office', permissions: Array.isArray(b.permissions) ? b.permissions : [] };
    db.designations.push(d); audit(a.id, 'designations.create', d.name); save(); return d;
  });
  route('PATCH', 'designations/:id', function (p, b) {
    var a = requirePerm('users'), d = db.designations.find(function (x) { return x.id === Number(p.id); });
    if (!d) throw err(404, 'Not found.');
    if (b.name && b.name !== d.name) { db.users.forEach(function (u) { if (u.designation === d.name) u.designation = str(b.name, 60); }); d.name = str(b.name, 60); }
    if (b.type) d.type = b.type === 'field' ? 'field' : 'office';
    if (Array.isArray(b.permissions)) d.permissions = b.permissions;
    audit(a.id, 'designations.update', d.name); save(); return d;
  });
  route('DELETE', 'designations/:id', function (p) {
    var a = requirePerm('users'), i = db.designations.findIndex(function (x) { return x.id === Number(p.id); });
    if (i < 0) throw err(404, 'Not found.');
    if (db.users.some(function (u) { return u.designation === db.designations[i].name; })) throw err(400, 'Reassign the users with this designation first.');
    audit(a.id, 'designations.delete', db.designations[i].name); db.designations.splice(i, 1); save(); return { ok: true };
  });

  // ---- settings (email / API)
  route('GET', 'settings/email', function () { requirePerm('settings'); var s = clone(db.settings.email); s.resendKeySet = !!s.resendKey; s.resendKey = s.resendKey ? '••••••••' + s.resendKey.slice(-4) : ''; return s; });
  route('PUT', 'settings/email', function (p, b) {
    var a = requirePerm('settings'), s = db.settings.email;
    ['provider', 'fromName', 'fromEmail', 'replyTo', 'adminEmail'].forEach(function (k) { if (b[k] != null) s[k] = str(b[k], 190); });
    if (b.resendKey && b.resendKey.indexOf('••') !== 0) s.resendKey = str(b.resendKey, 200);
    if (b.clearResendKey) s.resendKey = '';
    if (b.templates) Object.keys(s.templates).forEach(function (k) { if (k in b.templates) s.templates[k] = !!b.templates[k]; });
    audit(a.id, 'settings.email', 'provider ' + s.provider); save(); return { ok: true };
  });
  route('POST', 'settings/email/test', function (p, b) {
    var a = requirePerm('settings'), s = db.settings.email;
    if (s.provider === 'resend' && !s.resendKey) throw err(400, 'Add your Resend API key first.');
    insert('emails', { template: 'test', to: str(b.to) || a.email, subject: 'CHCS Portal test email', body: 'If you can read this, email delivery is configured.', provider: s.provider === 'resend' ? 'Resend (simulated)' : 'WordPress mail (simulated)', status: 'demo — not actually sent' });
    save(); return { ok: true, message: 'Demo mode: the test email was added to the Demo Inbox. On WordPress it is really sent.' };
  });
  route('GET', 'emails', function () { requirePerm('settings'); return col('emails').slice().reverse().slice(0, 200); });
  route('GET', 'demo/inbox', function () { return col('emails').slice().reverse().slice(0, 50); });
  route('POST', 'demo/reset', async function () { localStorage.removeItem(KEY); await seed(); return { ok: true }; });
  route('GET', 'audit', function () {
    requirePerm('audit');
    return col('audit').slice().reverse().slice(0, 300).map(function (a) { var u = user(a.userId); return Object.assign({}, a, { userName: u ? u.name : '—' }); });
  });

  // ---- work schedules: a calendar shift wins, then the person's schedule, then the office default
  function timeRules() { return Object.assign({ days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', grace: 15 }, (db.settings && db.settings.time) || {}); }
  function scheduleInput(x, withGrace) {
    if (!x || typeof x !== 'object' || !/^\d{2}:\d{2}$/.test(x.start || '') || !/^\d{2}:\d{2}$/.test(x.end || '')) return null;
    var o = { days: (x.days || []).map(Number).filter(function (d, i, a) { return d >= 0 && d <= 6 && a.indexOf(d) === i; }).sort(), start: x.start, end: x.end };
    if (withGrace) o.grace = Math.max(0, Math.min(120, parseInt(x.grace, 10) || 0));
    return o;
  }
  function scheduleFor(uid, date) {
    var sh = col('shifts').filter(function (s) { return s.userId === uid && s.date === date; });
    if (sh.length) return { start: sh.map(function (s) { return s.start; }).sort()[0], end: sh.map(function (s) { return s.end; }).sort().pop() };
    var u = user(uid), r = (u && u.schedule) || timeRules();
    return r.days.indexOf(new Date(date + 'T12:00:00').getDay()) === -1 ? null : { start: r.start, end: r.end };
  }
  function fmtMin(m) { m = Math.round(m); return m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min'; }
  function fmtHM(hm) { var h = +hm.slice(0, 2); return ((h % 12) || 12) + ':' + hm.slice(3) + (h < 12 ? ' AM' : ' PM'); }
  function scheduleFlag(t) {
    var sc = scheduleFor(t.userId, t.date); if (!sc) return 'Not a scheduled work day';
    var g = timeRules().grace * 60000, s = new Date(t.date + 'T' + sc.start + ':00').getTime(), e = new Date(t.date + 'T' + sc.end + ':00').getTime();
    if (e <= s) e += 86400000;
    var ts = new Date(t.start).getTime(), te = new Date(t.end).getTime(), out = [];
    if (ts < s - g) out.push('Clocked in ' + fmtMin((s - ts) / 60000) + ' early (starts ' + fmtHM(sc.start) + ')');
    if (te > e + g) out.push('Clocked out ' + fmtMin((te - e) / 60000) + ' late (ends ' + fmtHM(sc.end) + ')');
    return out.join(' · ');
  }

  // ---- time
  function decorateTime(t) { var u = user(t.userId); var c = t.caseId ? find('cases', t.caseId) : null; return Object.assign({}, t, { userName: u ? u.name : '—', designation: u ? u.designation : '', patientName: c ? c.patientName : '' }); }
  route('GET', 'time/entries', function (p, b, q) {
    var u = requireUser(), list = col('time');
    if (q.scope === 'all') { if (!can(u, 'approvals') && !can(u, 'payroll')) throw err(403, 'No access.'); }
    else list = list.filter(function (t) { return t.userId === u.id; });
    if (q.userId) list = list.filter(function (t) { return t.userId === Number(q.userId); });
    if (q.from) list = list.filter(function (t) { return t.date >= q.from; });
    if (q.to) list = list.filter(function (t) { return t.date <= q.to; });
    if (q.status) list = list.filter(function (t) { return t.status === q.status; });
    return list.slice().sort(function (a, b2) { return b2.start.localeCompare(a.start); }).map(decorateTime);
  });
  route('POST', 'time/clock-in', function (p, b) {
    var u = requirePerm('clock');
    if (u.type === 'field') throw err(403, 'Field staff clock in and out in HHAeXchange.');
    if (col('time').some(function (t) { return t.userId === u.id && t.status === 'open'; })) throw err(400, 'You are already clocked in.');
    var t = insert('time', { userId: u.id, date: today(), start: now(), end: null, minutes: 0, source: 'clock', status: 'open', note: str(b.note, 300), geo: b.geo || null });
    audit(u.id, 'time.clock_in', ''); save(); return decorateTime(t);
  });
  route('POST', 'time/clock-out', function (p, b) {
    var u = requirePerm('clock'), t = col('time').find(function (x) { return x.userId === u.id && x.status === 'open'; });
    if (!t) throw err(400, 'You are not clocked in.');
    t.end = now(); t.minutes = Math.max(1, Math.round((new Date(t.end) - new Date(t.start)) / 60000));
    var flag = scheduleFlag(t); if (flag) { t.status = 'pending'; t.flag = flag; } else { t.status = 'approved'; t.autoApproved = true; t.decidedAt = now(); }
    if (b.note) t.note = (t.note ? t.note + ' · ' : '') + str(b.note, 300);
    audit(u.id, 'time.clock_out', t.minutes + ' min'); save(); return decorateTime(t);
  });
  route('POST', 'time/entries', function (p, b) {
    var u = requirePerm('timesheet');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !/^\d{2}:\d{2}$/.test(b.startTime || '') || !/^\d{2}:\d{2}$/.test(b.endTime || '')) throw err(400, 'Enter a date, time in and time out.');
    var s = new Date(b.date + 'T' + b.startTime + ':00'), e = new Date(b.date + 'T' + b.endTime + ':00');
    if (e <= s) e.setDate(e.getDate() + 1); // overnight
    var t = insert('time', { userId: u.id, date: b.date, start: s.toISOString(), end: e.toISOString(), minutes: Math.round((e - s) / 60000), source: 'manual', status: 'draft', caseId: b.caseId ? Number(b.caseId) : null, note: str(b.note, 300) });
    save(); return decorateTime(t);
  });
  route('DELETE', 'time/entries/:id', function (p) {
    var u = requireUser(), t = find('time', p.id);
    if (!t || t.userId !== u.id || ['draft', 'rejected'].indexOf(t.status) === -1) throw err(400, 'Only your draft or rejected entries can be deleted.');
    col('time').splice(col('time').indexOf(t), 1); save(); return { ok: true };
  });
  route('POST', 'time/submit', function (p, b) {
    var u = requireUser(), n = 0;
    col('time').forEach(function (t) { if (t.userId === u.id && (t.status === 'draft' || t.status === 'rejected') && (!b.weekStart || weekStart(t.date) === b.weekStart)) { t.status = 'pending'; n++; } });
    audit(u.id, 'time.submit', n + ' entries'); save(); return { ok: true, submitted: n };
  });
  route('POST', 'time/decide', function (p, b) {
    var u = requirePerm('approvals'), ids = (b.ids || []).map(Number), act = b.action === 'reject' ? 'rejected' : 'approved', touched = {};
    col('time').forEach(function (t) { if (ids.indexOf(t.id) !== -1 && t.status === 'pending') { t.status = act; t.decidedBy = u.id; t.decidedAt = now(); if (b.note) t.decisionNote = str(b.note, 300); touched[t.userId] = (touched[t.userId] || 0) + 1; } });
    Object.keys(touched).forEach(function (uid) { var w = user(uid); notify(uid, 'time', 'Time entries ' + act, touched[uid] + ' entr' + (touched[uid] > 1 ? 'ies' : 'y') + (b.note ? ' — ' + b.note : ''), w && w.type === 'field' ? '#/timesheet' : '#/clock'); if (w) sendEmail('time_decision', w.email, 'Your time entries were ' + act, 'Hi ' + w.name + ',\n\n' + touched[uid] + ' time entr' + (touched[uid] > 1 ? 'ies were ' : 'y was ') + act + (b.note ? '.\nNote: ' + b.note : '.')); });
    audit(u.id, 'time.' + act, ids.length + ' entries'); save(); return { ok: true };
  });
  route('GET', 'payroll', function (p, b, q) {
    requirePerm('payroll');
    var list = col('time').filter(function (t) { return t.end && t.date >= (q.from || '0000') && t.date <= (q.to || '9999') && (q.includePending === '1' ? (t.status === 'approved' || t.status === 'pending') : t.status === 'approved'); });
    var out = payrollRows(list), from = q.from || '0000-01-01', to = q.to || '9999-12-31', leaveRows = [];
    col('leave').filter(function (l) { return l.status === 'approved' && l.to >= from && l.from <= to; }).forEach(function (l) {
      var days = workdays(l.from < from ? from : l.from, l.to > to ? to : l.to), hours = days * (l.hoursPerDay || 8), w = user(l.userId);
      leaveRows.push({ userId: l.userId, name: w ? w.name : '—', designation: w ? w.designation : '', type: l.type, from: l.from, to: l.to, days: days, hours: hours });
      var s0 = out.summary.find(function (x) { return x.userId === l.userId; });
      if (!s0) { s0 = { userId: l.userId, name: w ? w.name : '—', designation: w ? w.designation : '', regularHours: 0, overtimeHours: 0, totalHours: 0, entries: 0 }; out.summary.push(s0); }
      s0.leaveHours = +((s0.leaveHours || 0) + hours).toFixed(2);
    });
    out.summary.forEach(function (x) { x.leaveHours = x.leaveHours || 0; });
    out.leave = leaveRows; return out;
  });
  function payrollRows(list) {
    var detail = list.map(decorateTime).sort(function (a, b) { return (a.userName + a.start).localeCompare(b.userName + b.start); });
    var byUser = {};
    detail.forEach(function (t) {
      var k = t.userId; byUser[k] = byUser[k] || { userId: k, name: t.userName, designation: t.designation, weeks: {}, entries: 0 };
      var w = weekStart(t.date); byUser[k].weeks[w] = (byUser[k].weeks[w] || 0) + t.minutes; byUser[k].entries++;
    });
    var summary = Object.keys(byUser).map(function (k) {
      var s = byUser[k], reg = 0, ot = 0;
      Object.keys(s.weeks).forEach(function (w) { var h = s.weeks[w] / 60; reg += Math.min(40, h); ot += Math.max(0, h - 40); });
      return { userId: s.userId, name: s.name, designation: s.designation, regularHours: +reg.toFixed(2), overtimeHours: +ot.toFixed(2), totalHours: +(reg + ot).toFixed(2), entries: s.entries };
    });
    return { summary: summary, detail: detail };
  }

  // ---- intake / cases
  var CASE_FIELDS = ['patientName', 'dob', 'phone', 'address', 'borough', 'referralSource', 'referrerName', 'insurance', 'physician', 'status', 'priority', 'socDate'];
  function decorateCase(c, full) {
    var o = full ? clone(c) : { id: c.id, patientName: c.patientName, borough: c.borough, status: c.status, priority: c.priority, services: c.services, assigned: c.assigned, address: c.address, phone: c.phone, physician: c.physician };
    o.assignedNames = (c.assigned || []).map(function (id) { var u = user(id); return u ? u.name : '—'; });
    return o;
  }
  function casesFor(u) {
    if (can(u, 'intake')) return col('cases');
    return col('cases').filter(function (c) { return (c.assigned || []).indexOf(u.id) !== -1 && c.status === 'active'; });
  }
  route('GET', 'cases', function () { var u = requireUser(); if (!can(u, 'intake') && !can(u, 'timesheet')) throw err(403, 'No access.'); return casesFor(u).slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).map(function (c) { return decorateCase(c, can(u, 'intake')); }); });
  route('POST', 'cases', function (p, b) {
    var u = requirePerm('intake'); if (!str(b.patientName)) throw err(400, 'Patient name is required.');
    var c = { services: Array.isArray(b.services) ? b.services.slice(0, 10) : [], assigned: [], createdBy: u.id };
    CASE_FIELDS.forEach(function (k) { c[k] = str(b[k], 300); }); c.status = c.status || 'new'; c.priority = c.priority || 'normal';
    insert('cases', c); audit(u.id, 'cases.create', '#' + c.id); save(); return decorateCase(c, true);
  });
  route('GET', 'cases/:id', function (p) {
    var u = requireUser(), c = find('cases', p.id);
    if (!c || casesFor(u).indexOf(c) === -1) throw err(404, 'Case not found.');
    var o = decorateCase(c, can(u, 'intake'));
    o.notes = can(u, 'intake') ? col('caseNotes').filter(function (n) { return n.caseId === c.id; }).map(function (n) { var w = user(n.userId); return Object.assign({}, n, { userName: w ? w.name : '—' }); }) : [];
    return o;
  });
  route('PATCH', 'cases/:id', function (p, b) {
    var u = requirePerm('intake'), c = find('cases', p.id); if (!c) throw err(404, 'Case not found.');
    var before = c.status;
    CASE_FIELDS.forEach(function (k) { if (b[k] != null) c[k] = str(b[k], 300); });
    if (Array.isArray(b.services)) c.services = b.services.slice(0, 10);
    if (Array.isArray(b.assigned)) c.assigned = b.assigned.map(Number).filter(function (id) { return !!user(id); });
    c.updatedAt = now();
    if (before !== c.status) insert('caseNotes', { caseId: c.id, userId: u.id, body: 'Status changed: ' + before + ' → ' + c.status, system: true });
    audit(u.id, 'cases.update', '#' + c.id); save(); return decorateCase(c, true);
  });
  route('POST', 'cases/:id/notes', function (p, b) {
    var u = requirePerm('intake'), c = find('cases', p.id); if (!c) throw err(404, 'Case not found.');
    if (!str(b.body)) throw err(400, 'Write a note first.');
    var n = insert('caseNotes', { caseId: c.id, userId: u.id, body: str(b.body, 4000) }); save(); return Object.assign({}, n, { userName: u.name });
  });

  // ---- chat
  function directory(u) {
    return db.users.filter(function (x) {
      if (x.id === u.id || x.status !== 'active' || x.type === 'applicant') return false;
      if (u.type === 'field') return x.type === 'office' || x.type === 'admin'; // field staff chat with the office only
      return true;
    });
  }
  function conversationsFor(u) {
    var dirty = false;
    var out = col('conversations').filter(function (c) { return c.members.indexOf(u.id) !== -1; }).map(function (c) {
      var msgs = col('messages').filter(function (m) { return m.convId === c.id; });
      var lastRead = (c.reads || {})[u.id] || 0, last = msgs[msgs.length - 1];
      var lastId = last ? last.id : 0; c.delivered = c.delivered || {}; if ((c.delivered[u.id] || 0) < lastId) { c.delivered[u.id] = lastId; dirty = true; }
      var title = c.type === 'group' ? c.name : (c.members.filter(function (id) { return id !== u.id; }).map(function (id) { var w = user(id); return w ? w.name : '—'; }).join(', ') || 'Me');
      var other = c.type === 'direct' ? user(c.members.find(function (id) { return id !== u.id; })) : null;
      return { id: c.id, type: c.type, title: title, subtitle: other ? other.designation : c.members.length + ' members', members: c.members, lastMessage: last ? { body: last.body, at: last.createdAt, userId: last.userId } : null, unread: msgs.filter(function (m) { return m.id > lastRead && m.userId !== u.id; }).length };
    }).sort(function (a, b) { return ((b.lastMessage || {}).at || '').localeCompare((a.lastMessage || {}).at || ''); });
    if (dirty) save();
    return out;
  }
  function receipts(c, me) {
    var others = c.members.filter(function (id) { return id !== me; });
    var mins = function (m) { return others.length ? Math.min.apply(null, others.map(function (id) { return (m || {})[id] || 0; })) : 0; };
    return { readUpTo: mins(c.reads), deliveredUpTo: Math.max(mins(c.delivered), mins(c.reads)) };
  }
  route('GET', 'chat/directory', function () { var u = requirePerm('chat'); return directory(u).map(function (x) { return pub(x); }); });
  route('GET', 'chat/conversations', function () { return conversationsFor(requirePerm('chat')); });
  route('POST', 'chat/conversations', function (p, b) {
    var u = requirePerm('chat'), allowed = directory(u).map(function (x) { return x.id; });
    var members = (b.userIds || []).map(Number).filter(function (id) { return allowed.indexOf(id) !== -1; });
    if (!members.length) throw err(400, 'Choose who to message.');
    if (members.length === 1 && !b.name) {
      var ex = col('conversations').find(function (c) { return c.type === 'direct' && c.members.length === 2 && c.members.indexOf(u.id) !== -1 && c.members.indexOf(members[0]) !== -1; });
      if (ex) return { id: ex.id };
      var c = insert('conversations', { type: 'direct', name: null, members: [u.id, members[0]], reads: {}, delivered: {}, lastMessageAt: now() }); save(); return { id: c.id };
    }
    if (u.type === 'field') throw err(403, 'Group chats are created by the office.');
    var g = insert('conversations', { type: 'group', name: str(b.name, 80) || 'Group', members: [u.id].concat(members), reads: {}, delivered: {}, lastMessageAt: now() }); save(); return { id: g.id };
  });
  route('GET', 'chat/conversations/:id/messages', function (p, b, q) {
    var u = requirePerm('chat'), c = find('conversations', p.id);
    if (!c || c.members.indexOf(u.id) === -1) throw err(404, 'Conversation not found.');
    var after = Number(q.after || 0);
    var msgs = col('messages').filter(function (m) { return m.convId === c.id && m.id > after; }).map(function (m) { var w = user(m.userId); return Object.assign({}, m, { userName: w ? w.name : '—' }); });
    var all = col('messages').filter(function (m) { return m.convId === c.id; }), lastId = all.length ? all[all.length - 1].id : 0;
    c.reads = c.reads || {}; c.delivered = c.delivered || {};
    if ((c.reads[u.id] || 0) < lastId) { c.reads[u.id] = lastId; c.delivered[u.id] = Math.max(c.delivered[u.id] || 0, lastId); save(); }
    return Object.assign({ messages: msgs }, receipts(c, u.id));
  });
  route('POST', 'chat/conversations/:id/messages', function (p, b) {
    var u = requirePerm('chat'), c = find('conversations', p.id);
    if (!c || c.members.indexOf(u.id) === -1) throw err(404, 'Conversation not found.');
    var body = str(b.body, 4000); if (!body) throw err(400, 'Message is empty.');
    var m = insert('messages', { convId: c.id, userId: u.id, body: body }); c.lastMessageAt = m.createdAt; c.reads = c.reads || {}; c.reads[u.id] = m.id; c.delivered = c.delivered || {}; c.delivered[u.id] = m.id;
    save(); return Object.assign({}, m, { userName: u.name });
  });

  // ---- schedule / calendar
  function decorateShift(s) { var u = user(s.userId); return Object.assign({}, s, { userName: u ? u.name : '—', designation: u ? u.designation : '' }); }
  route('GET', 'shifts', function (p, b, q) {
    var u = requireUser(); if (!can(u, 'calendar') && !can(u, 'calendar_manage')) throw err(403, 'No access.');
    var list = col('shifts').filter(function (s) { return (q.scope === 'all' && can(u, 'calendar_manage')) || s.userId === u.id; });
    if (q.from) list = list.filter(function (s) { return s.date >= q.from; });
    if (q.to) list = list.filter(function (s) { return s.date <= q.to; });
    if (q.userId) list = list.filter(function (s) { return s.userId === Number(q.userId); });
    return list.slice().sort(function (a, b2) { return (a.date + a.start).localeCompare(b2.date + b2.start); }).map(decorateShift);
  });
  route('GET', 'staff', function () { var u = requireUser(); if (!can(u, 'calendar_manage') && !can(u, 'intake') && !can(u, 'approvals') && !can(u, 'payroll')) throw err(403, 'No access.'); return db.users.filter(function (x) { return x.status === 'active' && x.type !== 'applicant'; }).map(function (x) { return pub(x); }); });
  function shiftInput(b) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !/^\d{2}:\d{2}$/.test(b.start || '') || !/^\d{2}:\d{2}$/.test(b.end || '')) throw err(400, 'Enter a date, start and end time.');
    if (!user(b.userId)) throw err(400, 'Choose an employee.');
    return { userId: Number(b.userId), date: b.date, start: b.start, end: b.end, title: str(b.title, 120) || 'Shift', location: str(b.location, 120), notes: str(b.notes, 500) };
  }
  route('POST', 'shifts', function (p, b) {
    var u = requirePerm('calendar_manage'), dates = [b.date], s0 = shiftInput(b), out = [];
    if (b.repeatWeeks) { for (var i = 1; i <= Math.min(12, Number(b.repeatWeeks)); i++) { var d = new Date(b.date + 'T12:00:00'); d.setDate(d.getDate() + 7 * i); dates.push(ymd(d)); } }
    dates.forEach(function (d) { out.push(insert('shifts', Object.assign({}, s0, { date: d, createdBy: u.id }))); });
    var w = user(s0.userId); notify(w.id, 'shift', 'New shift: ' + s0.title, b.date + ' ' + b.start + '–' + b.end + (out.length > 1 ? ' (' + out.length + ' shifts)' : ''), '#/calendar'); sendEmail('shift_assigned', w.email, 'New shift scheduled', 'Hi ' + w.name + ',\n\nYou have ' + out.length + ' new shift(s) starting ' + b.date + ' ' + b.start + '–' + b.end + ' (' + s0.title + ').');
    audit(u.id, 'shifts.create', out.length + ' for ' + w.email); save(); return out.map(decorateShift);
  });
  route('PATCH', 'shifts/:id', function (p, b) { var u = requirePerm('calendar_manage'), s = find('shifts', p.id); if (!s) throw err(404, 'Not found.'); Object.assign(s, shiftInput(Object.assign({}, s, b))); audit(u.id, 'shifts.update', '#' + s.id); save(); return decorateShift(s); });
  route('DELETE', 'shifts/:id', function (p) { var u = requirePerm('calendar_manage'), s = find('shifts', p.id); if (!s) throw err(404, 'Not found.'); col('shifts').splice(col('shifts').indexOf(s), 1); audit(u.id, 'shifts.delete', '#' + p.id); save(); return { ok: true }; });

  // ---- in-services
  function defaultNurse() { var n = db.users.find(function (x) { return x.status === 'active' && x.type !== 'field' && x.designation === 'Nursing Supervisor'; }); return n || db.users.find(function (x) { return x.status === 'active' && x.type === 'admin'; }); }
  function resultFor(uid, inserviceId, centerId) {
    return col('inserviceResults').filter(function (x) { return x.userId === uid && (inserviceId ? x.inserviceId === inserviceId : x.centerId === centerId); }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); })[0] || null;
  }
  function visibleInservices(u) {
    var out = [], seen = {}, nurse = defaultNurse();
    col('inserviceAssignments').filter(function (a) { return a.userId === u.id; }).forEach(function (a) {
      var nu = user(a.nurseId) || nurse, i = a.inserviceId ? find('inservices', a.inserviceId) : null;
      if (a.inserviceId && (!i || !i.active)) return;
      var r = resultFor(u.id, a.inserviceId, a.centerId);
      var o = i ? clone(i) : { title: a.title, description: 'CHCS In-Service Training Center', hours: 0, questions: [], passScore: 0 };
      o.kind = a.centerId ? 'center' : 'quiz'; o.centerId = a.centerId || null; o.id = i ? i.id : null; o.assignmentId = a.id;
      o.dueDate = a.dueDate || (i && i.dueDate) || ''; o.nurseId = nu ? nu.id : null; o.nurseName = nu ? nu.name : '';
      o.questions = (o.questions || []).map(function (q) { return { q: q.q, options: q.options }; });
      o.myResult = r ? { score: r.score, passed: r.passed, completedAt: r.createdAt } : null;
      if (a.status === 'completed' && !o.myResult) o.myResult = { score: 100, passed: true, completedAt: a.completedAt };
      seen[(a.inserviceId || '') + '|' + (a.centerId || '')] = 1; out.push(o);
    });
    col('inservices').filter(function (i) { return i.active && (i.audience || []).indexOf(u.type === 'admin' ? 'office' : u.type) !== -1 && !seen[i.id + '|']; }).forEach(function (i) {
      var r = resultFor(u.id, i.id), o = clone(i);
      o.kind = i.externalUrl ? 'link' : 'quiz'; o.questions = i.questions.map(function (q) { return { q: q.q, options: q.options }; });
      o.nurseId = nurse ? nurse.id : null; o.nurseName = nurse ? nurse.name : '';
      o.myResult = r ? { score: r.score, passed: r.passed, completedAt: r.createdAt } : null; out.push(o);
    });
    // Training Center courses finished without an assignment still count as completed.
    col('inserviceResults').filter(function (x) { return x.userId === u.id && x.centerId && !seen['|' + x.centerId]; }).forEach(function (x) {
      seen['|' + x.centerId] = 1; var c = (window.CHCS_CENTER || []).find(function (y) { return y[0] === x.centerId; });
      out.push({ kind: 'center', centerId: x.centerId, id: null, title: c ? c[1] : x.centerId, description: 'CHCS In-Service Training Center', hours: c ? +(c[2] / 60).toFixed(2) : 0, questions: [], dueDate: '', nurseId: nurse ? nurse.id : null, nurseName: nurse ? nurse.name : '', myResult: { score: x.score, passed: true, completedAt: x.createdAt } });
    });
    return out.sort(function (a, b) { return (a.myResult && a.myResult.passed ? 1 : 0) - (b.myResult && b.myResult.passed ? 1 : 0) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'); });
  }
  function completeAssignments(uid, inserviceId, centerId) {
    col('inserviceAssignments').forEach(function (a) { if (a.userId === uid && a.status !== 'completed' && (inserviceId ? a.inserviceId === inserviceId : a.centerId === centerId)) { a.status = 'completed'; a.completedAt = now(); var n = user(a.nurseId); if (n) notify(n.id, 'inservice', (user(uid) || {}).name + ' completed ' + a.title, '', '#/admin/training?tab=assign'); } });
  }
  route('GET', 'inservices', function (p, b, q) {
    var u = requireUser();
    if (q.manage === '1') {
      requirePerm('training_manage');
      return col('inservices').map(function (i) { var res = col('inserviceResults').filter(function (r) { return r.inserviceId === i.id && r.passed; }); return Object.assign(clone(i), { completions: res.length }); });
    }
    if (!can(u, 'inservices')) throw err(403, 'No access.');
    return visibleInservices(u);
  });
  function inserviceInput(b) {
    if (!str(b.title)) throw err(400, 'Title required.');
    var qs = (b.questions || []).filter(function (q) { return str(q.q) && (q.options || []).filter(Boolean).length >= 2; }).map(function (q) { return { q: str(q.q, 300), options: q.options.filter(Boolean).map(function (o) { return str(o, 200); }), answer: Number(q.answer) || 0 }; });
    return { title: str(b.title, 150), description: str(b.description, 500), body: str(b.body, 20000), hours: Number(b.hours) || 0, dueDate: str(b.dueDate, 10), audience: (b.audience || ['field']).filter(function (a) { return a === 'field' || a === 'office'; }), passScore: Math.min(100, Math.max(0, Number(b.passScore) || 80)), externalUrl: str(b.externalUrl, 500), active: b.active !== false, questions: qs };
  }
  route('POST', 'inservices', function (p, b) {
    var u = requirePerm('training_manage'), i = insert('inservices', inserviceInput(b));
    db.users.filter(function (x) { return x.status === 'active' && i.audience.indexOf(x.type) !== -1; }).forEach(function (x) { notify(x.id, 'inservice', 'New in-service: ' + i.title, i.dueDate ? 'Due ' + i.dueDate : '', '#/inservices'); sendEmail('inservice_assigned', x.email, 'New in-service assigned: ' + i.title, 'Hi ' + x.name + ',\n\nA new in-service is ready for you' + (i.dueDate ? ' (due ' + i.dueDate + ')' : '') + '. Open the CHCS Portal to complete it.'); });
    audit(u.id, 'inservices.create', i.title); save(); return i;
  });
  route('PATCH', 'inservices/:id', function (p, b) { var u = requirePerm('training_manage'), i = find('inservices', p.id); if (!i) throw err(404, 'Not found.'); Object.assign(i, inserviceInput(Object.assign({}, i, b))); audit(u.id, 'inservices.update', i.title); save(); return i; });
  route('DELETE', 'inservices/:id', function (p) { var u = requirePerm('training_manage'), i = find('inservices', p.id); if (!i) throw err(404, 'Not found.'); i.active = false; audit(u.id, 'inservices.archive', i.title); save(); return { ok: true }; });
  route('POST', 'inservices/:id/complete', function (p, b) {
    var u = requirePerm('inservices'), i = find('inservices', p.id); if (!i || !i.active) throw err(404, 'Not found.');
    if (!str(b.signature)) throw err(400, 'Sign to confirm you completed the in-service.');
    var correct = 0; (i.questions || []).forEach(function (q, k) { if (Number((b.answers || [])[k]) === q.answer) correct++; });
    var score = i.questions.length ? Math.round(correct / i.questions.length * 100) : 100, passed = score >= i.passScore;
    insert('inserviceResults', { inserviceId: i.id, userId: u.id, score: score, passed: passed, answers: b.answers || [], signature: str(b.signature, 100) });
    if (passed) completeAssignments(u.id, i.id, null);
    audit(u.id, 'inservices.complete', i.title + ' ' + score + '%'); save(); return { score: score, passed: passed, passScore: i.passScore };
  });
  route('GET', 'inservices/report', function () {
    requirePerm('training_manage');
    return col('inserviceResults').slice().reverse().map(function (r) { var u = user(r.userId), i = r.inserviceId ? find('inservices', r.inserviceId) : null, c = (window.CHCS_CENTER || []).find(function (x) { return x[0] === r.centerId; }); return { id: r.id, userName: u ? u.name : '—', designation: u ? u.designation : '', title: i ? i.title : (c ? c[1] + ' (Training Center)' : '—'), hours: i ? i.hours : (c ? +(c[2] / 60).toFixed(2) : 0), score: r.score, passed: r.passed, completedAt: r.createdAt }; });
  });

  // ---- orientation
  route('GET', 'orientation', function () {
    var u = requirePerm('orientation');
    return col('orientationModules').slice().sort(function (a, b) { return a.order - b.order; }).map(function (m) { var pr = col('orientationProgress').find(function (x) { return x.moduleId === m.id && x.userId === u.id; }); return Object.assign(clone(m), { ackAt: pr ? pr.createdAt : null }); });
  });
  route('POST', 'orientation/:id/ack', function (p, b) {
    var u = requirePerm('orientation'), m = find('orientationModules', p.id); if (!m) throw err(404, 'Not found.');
    if (!str(b.signature)) throw err(400, 'Type your name to sign.');
    if (!col('orientationProgress').some(function (x) { return x.moduleId === m.id && x.userId === u.id; })) insert('orientationProgress', { moduleId: m.id, userId: u.id, signature: str(b.signature, 100) });
    audit(u.id, 'orientation.ack', m.title); save(); return { ok: true };
  });
  route('GET', 'orientation/modules', function () { requirePerm('training_manage'); return col('orientationModules').slice().sort(function (a, b) { return a.order - b.order; }); });
  route('POST', 'orientation/modules', function (p, b) { var u = requirePerm('training_manage'); if (!str(b.title)) throw err(400, 'Title required.'); var m = insert('orientationModules', { title: str(b.title, 150), body: str(b.body, 20000), order: Number(b.order) || col('orientationModules').length + 1 }); audit(u.id, 'orientation.create', m.title); save(); return m; });
  route('PATCH', 'orientation/modules/:id', function (p, b) { requirePerm('training_manage'); var m = find('orientationModules', p.id); if (!m) throw err(404, 'Not found.'); if (b.title) m.title = str(b.title, 150); if (b.body != null) m.body = str(b.body, 20000); if (b.order) m.order = Number(b.order); save(); return m; });
  route('DELETE', 'orientation/modules/:id', function (p) { requirePerm('training_manage'); var m = find('orientationModules', p.id); if (!m) throw err(404, 'Not found.'); col('orientationModules').splice(col('orientationModules').indexOf(m), 1); save(); return { ok: true }; });
  route('GET', 'orientation/report', function () {
    requirePerm('training_manage'); var total = col('orientationModules').length;
    return db.users.filter(function (u) { return can(u, 'orientation'); }).map(function (u) { var done = col('orientationProgress').filter(function (x) { return x.userId === u.id; }).length; return { userId: u.id, name: u.name, designation: u.designation, done: done, total: total }; });
  });

  // ---- applications
  route('GET', 'application', function () {
    var u = requireUser(); if (!u.emailVerified) throw err(403, 'Verify your email first.');
    return col('applications').find(function (a) { return a.userId === u.id; }) || null;
  });
  route('PUT', 'application', function (p, b) {
    var u = requireUser(); if (!u.emailVerified) throw err(403, 'Verify your email first.');
    var a = col('applications').find(function (x) { return x.userId === u.id; });
    if (a && a.status !== 'draft') throw err(400, 'Your application was already submitted.');
    var d = b.data || {}, data = {};
    ['position', 'availability', 'certification', 'licenseNumber', 'experience', 'languages', 'references', 'workAuth', 'signature', 'boroughs'].forEach(function (k) { data[k] = str(d[k], 2000); });
    data.attestation = !!d.attestation;
    if (b.submit) {
      if (!data.position || !data.availability || !data.experience) throw err(400, 'Position, availability and experience are required.');
      if (!data.attestation || !data.signature) throw err(400, 'Please confirm the attestation and sign.');
    }
    if (!a) a = insert('applications', { userId: u.id, status: 'draft', data: {} });
    a.data = data; a.updatedAt = now();
    if (b.submit) {
      a.status = 'submitted'; a.submittedAt = now();
      usersWith('applications').forEach(function (a) { notify(a.id, 'application', 'New application: ' + u.name, data.position, '#/applications'); });
      notifyAdmins('application_received', 'New employment application: ' + u.name, u.name + ' applied for ' + data.position + '. Review it in the portal under Applications.');
      sendEmail('application_received', u.email, 'We received your application', 'Hi ' + u.name + ',\n\nThank you for applying to Complete Home Care Services. Our HR team will review your application and contact you.');
      audit(u.id, 'application.submit', data.position);
    }
    save(); return a;
  });
  route('GET', 'applications', function () {
    requirePerm('applications');
    return col('applications').filter(function (a) { return a.status !== 'draft'; }).slice().reverse().map(function (a) { var u = user(a.userId); return Object.assign(clone(a), { userName: u ? u.name : '—', email: u ? u.email : '', phone: u ? u.phone : '' }); });
  });
  route('POST', 'applications/:id/decision', function (p, b) {
    var r = requirePerm('applications'), a = find('applications', p.id); if (!a || a.status !== 'submitted') throw err(400, 'This application is not waiting for a decision.');
    var u = user(a.userId), approve = b.decision === 'approve';
    a.status = approve ? 'approved' : 'rejected'; a.decidedBy = r.id; a.decidedAt = now(); a.decisionNote = str(b.note, 1000);
    if (approve && u) {
      u.type = 'field'; u.status = 'active'; u.designation = str(b.designation, 60) || a.data.position || 'HHA';
      var d = db.designations.find(function (x) { return x.name === u.designation; });
      var perm = d ? d.permissions.slice() : ['chat', 'inservices', 'calendar'];
      if (b.allowOrientation && perm.indexOf('orientation') === -1) perm.push('orientation');
      if (b.allowTimesheet && perm.indexOf('timesheet') === -1) perm.push('timesheet');
      u.permissions = perm;
    }
    if (u) sendEmail('application_decision', u.email, approve ? 'Welcome to Complete Home Care Services!' : 'Your application to Complete Home Care Services', approve ? 'Hi ' + u.name + ',\n\nCongratulations — your application was approved. Sign in to the CHCS Portal to ' + (b.allowOrientation ? 'start your orientation.' : 'get started.') + (a.decisionNote ? '\n\n' + a.decisionNote : '') : 'Hi ' + u.name + ',\n\nThank you for your interest. We are not able to move forward at this time.' + (a.decisionNote ? '\n\n' + a.decisionNote : ''));
    audit(r.id, 'application.' + a.status, u ? u.email : ''); save(); return { ok: true };
  });

  // ---- news & posts
  function visiblePosts(u) {
    return col('posts').filter(function (x) {
      if (x.status !== 'published') return can(u, 'news_manage');
      if (x.audience === 'public' || x.audience === 'staff') return true;
      if (x.audience === 'office') return u.type === 'office' || u.type === 'admin';
      if (x.audience === 'field') return u.type === 'field' || u.type === 'admin';
      return false;
    }).slice().sort(function (a, b) { return (b.pinned - a.pinned) || (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt); }).map(function (x) { var w = user(x.authorId); return Object.assign({}, x, { authorName: w ? w.name : 'CHCS' }); });
  }
  route('GET', 'posts', function (p, b, q) {
    if (q.public === '1') return col('posts').filter(function (x) { return x.audience === 'public' && x.status === 'published'; }).slice().reverse();
    var u = requireUser(); if (u.type === 'applicant') return visiblePosts(u).filter(function (x) { return x.audience === 'public'; });
    return visiblePosts(u);
  });
  function postInput(b) { if (!str(b.title)) throw err(400, 'Title required.'); return { title: str(b.title, 200), body: str(b.body, 20000), audience: ['public', 'staff', 'office', 'field'].indexOf(b.audience) !== -1 ? b.audience : 'staff', pinned: !!b.pinned, status: b.status === 'draft' ? 'draft' : 'published', imageUrl: str(b.imageUrl, 500) }; }
  route('POST', 'posts', function (p, b) {
    var u = requirePerm('news_manage'), x = insert('posts', Object.assign(postInput(b), { authorId: u.id, publishedAt: now() }));
    if (x.status === 'published' && x.audience !== 'public') db.users.filter(function (w) { return w.status === 'active' && w.type !== 'applicant' && w.id !== u.id; }).forEach(function (w) { sendEmail('new_post', w.email, 'CHCS news: ' + x.title, x.body.slice(0, 400)); });
    audit(u.id, 'posts.create', x.title); save(); return x;
  });
  route('PATCH', 'posts/:id', function (p, b) { var u = requirePerm('news_manage'), x = find('posts', p.id); if (!x) throw err(404, 'Not found.'); Object.assign(x, postInput(Object.assign({}, x, b))); x.updatedAt = now(); audit(u.id, 'posts.update', x.title); save(); return x; });
  route('DELETE', 'posts/:id', function (p) { var u = requirePerm('news_manage'), x = find('posts', p.id); if (!x) throw err(404, 'Not found.'); col('posts').splice(col('posts').indexOf(x), 1); audit(u.id, 'posts.delete', x.title); save(); return { ok: true }; });


  // ---- notifications & live updates
  route('GET', 'pulse', function (p, b, q) {
    var u = requireUser(), since = Number(q.since || 0), msgSince = Number(q.msgSince || 0);
    var mine = col('notifications').filter(function (n) { return n.userId === u.id; });
    var convs = can(u, 'chat') ? conversationsFor(u) : [];   // also marks messages as delivered
    var convIds = convs.map(function (c) { return c.id; });
    var msgs = col('messages').filter(function (m) { return m.id > msgSince && m.userId !== u.id && convIds.indexOf(m.convId) !== -1; }).slice(-10).map(function (m) { var c = convs.find(function (x) { return x.id === m.convId; }), w = user(m.userId); return { id: m.id, convId: m.convId, title: c ? c.title : '', userName: w ? w.name : '', body: m.body }; });
    var allMsgs = col('messages'), allN = col('notifications');
    return { notifications: mine.filter(function (n) { return n.id > since; }).slice(-20).reverse(), unreadNotifications: mine.filter(function (n) { return !n.read; }).length, unreadChat: convs.reduce(function (a, c) { return a + c.unread; }, 0), messages: msgs, lastMsgId: allMsgs.length ? allMsgs[allMsgs.length - 1].id : 0, lastNotifId: allN.length ? allN[allN.length - 1].id : 0 };
  });
  route('GET', 'notifications', function () { var u = requireUser(); return col('notifications').filter(function (n) { return n.userId === u.id; }).slice(-50).reverse(); });
  route('POST', 'notifications/read', function (p, b) { var u = requireUser(), ids = (b.ids || []).map(Number); col('notifications').forEach(function (n) { if (n.userId === u.id && (b.all || ids.indexOf(n.id) !== -1)) n.read = true; }); save(); return { ok: true }; });

  // ---- vacation & sick leave (office staff)
  function workdays(from, to) { var n = 0, d = new Date(from + 'T12:00:00'), e = new Date(to + 'T12:00:00'); while (d <= e) { var w = d.getDay(); if (w !== 0 && w !== 6) n++; d.setDate(d.getDate() + 1); } return n; }
  function allowance(u) { var dflt = db.settings.leave, a = u.leaveAllowance || {}; return { vacation: a.vacation != null ? a.vacation : dflt.vacation, sick: a.sick != null ? a.sick : dflt.sick, personal: a.personal != null ? a.personal : dflt.personal }; }
  function balances(u) {
    var yr = today().slice(0, 4), al = allowance(u), used = { vacation: 0, sick: 0, personal: 0 }, pending = { vacation: 0, sick: 0, personal: 0 };
    col('leave').filter(function (l) { return l.userId === u.id && l.from.slice(0, 4) === yr; }).forEach(function (l) { if (!(l.type in used)) return; if (l.status === 'approved') used[l.type] += l.totalHours; if (l.status === 'pending') pending[l.type] += l.totalHours; });
    return Object.keys(al).map(function (k) { return { type: k, allowed: al[k], used: used[k], pending: pending[k], left: al[k] - used[k] }; });
  }
  function decorateLeave(l) { var w = user(l.userId), d = user(l.decidedBy); return Object.assign({}, l, { userName: w ? w.name : '—', designation: w ? w.designation : '', decidedByName: d ? d.name : '' }); }
  route('GET', 'leave', function (p, b, q) {
    var u = requireUser(), list = col('leave');
    if (q.scope === 'all') { if (!can(u, 'leave_manage')) throw err(403, 'No access.'); }
    else if (q.scope === 'calendar') { if (!can(u, 'calendar_manage') && !can(u, 'leave_manage')) list = list.filter(function (l) { return l.userId === u.id; }); list = list.filter(function (l) { return l.status === 'approved' || (l.status === 'pending' && l.userId === u.id); }); }
    else { if (!can(u, 'leave')) throw err(403, 'No access.'); list = list.filter(function (l) { return l.userId === u.id; }); }
    if (q.status) list = list.filter(function (l) { return l.status === q.status; });
    if (q.from) list = list.filter(function (l) { return l.to >= q.from; });
    if (q.to) list = list.filter(function (l) { return l.from <= q.to; });
    return list.slice().sort(function (a, b2) { return b2.from.localeCompare(a.from); }).map(decorateLeave);
  });
  route('GET', 'leave/balances', function (p, b, q) {
    var u = requireUser();
    if (q.userId && Number(q.userId) !== u.id) { if (!can(u, 'leave_manage')) throw err(403, 'No access.'); return balances(user(q.userId)); }
    if (q.all === '1') { if (!can(u, 'leave_manage')) throw err(403, 'No access.'); return db.users.filter(function (x) { return x.status === 'active' && (x.type === 'office' || x.type === 'admin'); }).map(function (x) { return { userId: x.id, name: x.name, designation: x.designation, balances: balances(x), allowance: allowance(x) }; }); }
    return balances(u);
  });
  route('POST', 'leave', function (p, b) {
    var u = requirePerm('leave'), types = (window.CHCS_LEAVE_TYPES || []).map(function (t) { return t[0]; });
    if (types.indexOf(b.type) === -1) throw err(400, 'Choose a leave type.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.from || '') || !/^\d{4}-\d{2}-\d{2}$/.test(b.to || b.from || '')) throw err(400, 'Choose the dates.');
    var to = b.to || b.from; if (to < b.from) throw err(400, 'The end date is before the start date.');
    var days = workdays(b.from, to); if (!days) throw err(400, 'Those dates are only weekend days.');
    var hpd = b.partial ? Math.min(8, Math.max(0.5, Number(b.hours) || 4)) : db.settings.leave.hoursPerDay;
    var overlap = col('leave').some(function (l) { return l.userId === u.id && ['pending', 'approved'].indexOf(l.status) !== -1 && l.from <= to && l.to >= b.from; });
    if (overlap) throw err(400, 'You already have leave requested for some of these days.');
    var l = insert('leave', { userId: u.id, type: b.type, from: b.from, to: to, partial: !!b.partial, hoursPerDay: hpd, totalHours: days * hpd, reason: str(b.reason, 500), status: 'pending' });
    usersWith('leave_manage').filter(function (m) { return m.id !== u.id; }).forEach(function (m) { notify(m.id, 'leave', 'Leave request: ' + u.name, b.type + ' · ' + b.from + (to !== b.from ? ' → ' + to : '') + ' (' + l.totalHours + 'h)', '#/leave?tab=manage'); sendEmail('leave_request', m.email, 'Leave request from ' + u.name, u.name + ' requested ' + b.type + ' leave: ' + b.from + (to !== b.from ? ' to ' + to : '') + ' (' + l.totalHours + ' hours).\n\nReview it in the portal: ' + base() + '#/leave?tab=manage'); });
    audit(u.id, 'leave.request', b.type + ' ' + b.from); save(); return decorateLeave(l);
  });
  route('PATCH', 'leave/:id', function (p, b) {
    var u = requireUser(), l = find('leave', p.id); if (!l) throw err(404, 'Not found.');
    if (b.action === 'cancel') { if (l.userId !== u.id || ['pending', 'approved'].indexOf(l.status) === -1) throw err(400, 'You can only cancel your own pending or approved leave.'); if (l.status === 'approved' && l.from <= today()) throw err(400, 'Leave that has started can only be changed by a manager.'); l.status = 'cancelled'; save(); return decorateLeave(l); }
    if (!can(u, 'leave_manage')) throw err(403, 'No access.');
    if (l.userId === u.id && u.type !== 'admin') throw err(400, 'Someone else has to approve your own leave.');
    if (b.action !== 'approve' && b.action !== 'reject') throw err(400, 'Unknown action.');
    l.status = b.action === 'approve' ? 'approved' : 'rejected'; l.decidedBy = u.id; l.decidedAt = now(); l.decisionNote = str(b.note, 300);
    var w = user(l.userId);
    notify(l.userId, 'leave', 'Leave ' + l.status + ': ' + l.from + (l.to !== l.from ? ' → ' + l.to : ''), l.decisionNote, '#/leave');
    if (w) sendEmail('leave_decision', w.email, 'Your leave request was ' + l.status, 'Hi ' + w.name + ',\n\nYour ' + l.type + ' leave (' + l.from + (l.to !== l.from ? ' to ' + l.to : '') + ') was ' + l.status + '.' + (l.decisionNote ? '\nNote: ' + l.decisionNote : ''));
    audit(u.id, 'leave.' + l.status, (w ? w.email : '') + ' ' + l.from); save(); return decorateLeave(l);
  });
  route('PUT', 'leave/allowance/:id', function (p, b) {
    var u = requirePerm('leave_manage'), w = user(p.id); if (!w) throw err(404, 'Not found.');
    w.leaveAllowance = { vacation: Math.max(0, Number(b.vacation) || 0), sick: Math.max(0, Number(b.sick) || 0), personal: Math.max(0, Number(b.personal) || 0) };
    audit(u.id, 'leave.allowance', w.email); save(); return { ok: true };
  });

  // ---- call dashboard (incoming call management)
  function digits(s) { return String(s || '').replace(/\D/g, '').slice(-10); }
  function decorateCall(c) { var t = user(c.takenBy), a = user(c.assignedTo); return Object.assign({}, c, { takenByName: t ? t.name : '—', assignedToName: a ? a.name : '', followUps: (c.followUps || []).map(function (f) { var w = user(f.userId); return Object.assign({}, f, { userName: w ? w.name : '—' }); }) }); }
  function callAssigned(c, by) {
    var a = user(c.assignedTo); if (!a || a.id === by.id) return;
    notify(a.id, 'call', (c.priority === 'urgent' ? 'URGENT call for you: ' : 'Call for you: ') + c.callerName, (c.callerPhone ? c.callerPhone + ' · ' : '') + c.message.slice(0, 140), '#/calls?id=' + c.id);
    sendEmail('call_assigned', a.email, (c.priority === 'urgent' ? '[URGENT] ' : '') + 'Call for you from ' + c.callerName, 'Hi ' + a.name + ',\n\n' + by.name + ' took a call for you.\n\nCaller: ' + c.callerName + (c.callerPhone ? '\nPhone: ' + c.callerPhone : '') + '\nAbout: ' + c.reason + '\nMessage: ' + c.message + (c.callbackBy ? '\nPlease call back by: ' + c.callbackBy.replace('T', ' ') : '') + '\n\nOpen it in the portal: ' + base() + '#/calls?id=' + c.id);
  }
  route('GET', 'calls', function (p, b, q) {
    var u = requirePerm('calls'), list = col('calls'), term = (q.q || '').toLowerCase();
    if (q.filter === 'mine') list = list.filter(function (c) { return c.assignedTo === u.id && (c.status === 'open' || c.status === 'in_progress'); });
    else if (q.filter === 'taken') list = list.filter(function (c) { return c.takenBy === u.id; });
    else if (q.filter === 'open') list = list.filter(function (c) { return c.status === 'open' || c.status === 'in_progress'; });
    else if (q.filter === 'today') list = list.filter(function (c) { return c.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10); });
    if (term) list = list.filter(function (c) { return (c.callerName + ' ' + c.callerPhone + ' ' + c.message + ' ' + c.reason).toLowerCase().indexOf(term) !== -1 || (digits(term) && digits(c.callerPhone).indexOf(digits(term)) !== -1); });
    return list.slice().reverse().slice(0, 300).map(decorateCall);
  });
  route('GET', 'calls/stats', function () {
    var u = requirePerm('calls'), all = col('calls'), d = new Date().toISOString().slice(0, 10), nowIso = new Date().toISOString().slice(0, 16);
    var open = all.filter(function (c) { return c.status === 'open' || c.status === 'in_progress'; });
    return { today: all.filter(function (c) { return c.createdAt.slice(0, 10) === d; }).length, open: open.length, mine: open.filter(function (c) { return c.assignedTo === u.id; }).length, overdue: open.filter(function (c) { return c.callbackBy && c.callbackBy < nowIso; }).length, urgent: open.filter(function (c) { return c.priority === 'urgent'; }).length };
  });
  route('GET', 'calls/lookup', function (p, b, q) {
    requirePerm('calls'); var dg = digits(q.phone); if (dg.length < 7) return { calls: 0 };
    var prev = col('calls').filter(function (c) { return digits(c.callerPhone) === dg; });
    var cs = col('cases').find(function (c) { return digits(c.phone) === dg; });
    var emp = db.users.find(function (x) { return digits(x.phone) === dg; });
    return { calls: prev.length, last: prev.length ? decorateCall(prev[prev.length - 1]) : null, patient: cs ? { id: cs.id, name: cs.patientName, status: cs.status } : null, employee: emp ? { id: emp.id, name: emp.name, designation: emp.designation } : null };
  });
  route('POST', 'calls', function (p, b) {
    var u = requirePerm('calls');
    if (!str(b.callerName) && !str(b.callerPhone)) throw err(400, 'Enter the caller\'s name or phone number.');
    if (!str(b.message)) throw err(400, 'Write what the call was about.');
    var assignee = b.assignedTo ? user(b.assignedTo) : null; if (b.assignedTo && (!assignee || assignee.status !== 'active')) throw err(400, 'Choose an active staff member.');
    var c = insert('calls', { takenBy: u.id, callerName: str(b.callerName, 120) || 'Unknown caller', callerPhone: str(b.callerPhone, 30), callerType: str(b.callerType, 20) || 'other', reason: str(b.reason, 60) || 'Other', message: str(b.message, 2000), assignedTo: assignee ? assignee.id : null, priority: b.priority === 'urgent' ? 'urgent' : 'normal', status: assignee ? 'open' : (b.status === 'closed' ? 'closed' : 'open'), callbackBy: str(b.callbackBy, 16), duration: Math.max(0, Math.round(Number(b.duration) || 0)), direction: b.direction === 'outgoing' ? 'outgoing' : 'incoming', followUps: [] });
    callAssigned(c, u); audit(u.id, 'calls.create', '#' + c.id); save(); return decorateCall(c);
  });
  route('PATCH', 'calls/:id', function (p, b) {
    var u = requirePerm('calls'), c = find('calls', p.id); if (!c) throw err(404, 'Not found.');
    var before = c.assignedTo;
    if (b.status && ['open', 'in_progress', 'returned', 'closed'].indexOf(b.status) !== -1) { c.status = b.status; if (b.status === 'closed' || b.status === 'returned') c.closedAt = now(); }
    if (b.priority) c.priority = b.priority === 'urgent' ? 'urgent' : 'normal';
    if (b.callbackBy != null) c.callbackBy = str(b.callbackBy, 16);
    if (b.assignedTo !== undefined) { var a = b.assignedTo ? user(b.assignedTo) : null; c.assignedTo = a ? a.id : null; if (a && c.status === 'closed') c.status = 'open'; }
    if (b.note) (c.followUps = c.followUps || []).push({ userId: u.id, body: str(b.note, 1000), at: now() });
    if (c.assignedTo && c.assignedTo !== before) callAssigned(c, u);
    if (b.note && c.takenBy !== u.id && (b.status === 'returned' || b.status === 'closed')) notify(c.takenBy, 'call', 'Call ' + c.status + ': ' + c.callerName, u.name + ': ' + str(b.note, 140), '#/calls?id=' + c.id);
    audit(u.id, 'calls.update', '#' + c.id + ' ' + c.status); save(); return decorateCall(c);
  });

  // ---- in-service assignments (nurse / training managers)
  function decorateAssignment(a) { var w = user(a.userId), n = user(a.nurseId); return Object.assign({}, a, { userName: w ? w.name : '—', designation: w ? w.designation : '', nurseName: n ? n.name : '', overdue: a.status !== 'completed' && a.dueDate && a.dueDate < today() }); }
  route('GET', 'inservices/assignments', function (p, b, q) { requirePerm('training_manage'); var l = col('inserviceAssignments'); if (q.userId) l = l.filter(function (a) { return a.userId === Number(q.userId); }); return l.slice().reverse().map(decorateAssignment); });
  route('POST', 'inservices/assign', function (p, b) {
    var u = requirePerm('training_manage'), ids = (b.userIds || []).map(Number).filter(function (id) { var x = user(id); return x && x.status === 'active'; });
    if (!ids.length) throw err(400, 'Choose at least one employee.');
    var i = b.inserviceId ? find('inservices', b.inserviceId) : null, c = (window.CHCS_CENTER || []).find(function (x) { return x[0] === b.centerId; });
    if (!i && !c) throw err(400, 'Choose an in-service.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.dueDate || '')) throw err(400, 'Choose a due date.');
    var nurse = user(b.nurseId) || u, title = i ? i.title : c[1], made = 0;
    ids.forEach(function (id) {
      if (col('inserviceAssignments').some(function (a) { return a.userId === id && a.status !== 'completed' && (i ? a.inserviceId === i.id : a.centerId === c[0]); })) return;
      insert('inserviceAssignments', { userId: id, inserviceId: i ? i.id : null, centerId: c ? c[0] : null, title: title, dueDate: b.dueDate, nurseId: nurse.id, assignedBy: u.id, status: 'assigned' }); made++;
      var w = user(id); notify(id, 'inservice', 'In-service assigned: ' + title, 'Due ' + b.dueDate + ' · Questions? Message ' + nurse.name, '#/inservices');
      sendEmail('inservice_assigned', w.email, 'In-service assigned: ' + title, 'Hi ' + w.name + ',\n\n' + u.name + ' assigned you "' + title + '", due ' + b.dueDate + '.\nOpen the CHCS Portal → In-services to start. You can message ' + nurse.name + ' from inside the in-service if you have questions.\n\n' + base() + '#/inservices');
    });
    audit(u.id, 'inservices.assign', title + ' x' + made); save(); return { ok: true, assigned: made };
  });
  route('DELETE', 'inservices/assignments/:id', function (p) { var u = requirePerm('training_manage'), a = find('inserviceAssignments', p.id); if (!a) throw err(404, 'Not found.'); col('inserviceAssignments').splice(col('inserviceAssignments').indexOf(a), 1); audit(u.id, 'inservices.unassign', a.title); save(); return { ok: true }; });
  route('POST', 'inservices/center-complete', function (p, b) {
    var u = requirePerm('inservices'), c = (window.CHCS_CENTER || []).find(function (x) { return x[0] === b.centerId; });
    if (!c) throw err(400, 'Unknown training.');
    insert('inserviceResults', { centerId: c[0], userId: u.id, score: Math.min(100, Math.max(0, Number(b.score) || 100)), passed: true, answers: [], signature: str(b.name, 100) });
    completeAssignments(u.id, null, c[0]); audit(u.id, 'inservices.center_complete', c[1]); save(); return { ok: true };
  });
  route('GET', 'nurse', function () { requireUser(); var n = defaultNurse(); return n ? pub(n) : null; });


  // ---- tasks & deadlines (office task calendar, repeating)
  function nextDue(d, rep) {
    var x = new Date(d + 'T12:00:00'), day = x.getDate();
    if (rep === 'weekly') x.setDate(x.getDate() + 7);
    else if (rep === 'monthly' || rep === 'quarterly') { x.setDate(1); x.setMonth(x.getMonth() + (rep === 'monthly' ? 1 : 3)); x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate())); }
    else if (rep === 'yearly') { x.setDate(1); x.setFullYear(x.getFullYear() + 1); x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate())); }
    return ymd(x);
  }
  function decorateTask(t) { var a = user(t.assignedTo), c = user(t.createdBy), d = user(t.completedBy); return Object.assign({}, t, { assignedToName: a ? a.name : '', createdByName: c ? c.name : '', completedByName: d ? d.name : '', overdue: t.status === 'open' && t.dueDate < today() }); }
  function taskInput(b, u) {
    if (!str(b.title)) throw err(400, 'Give the task a title.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.dueDate || '')) throw err(400, 'Choose a due date.');
    var to = Number(b.assignedTo) || u.id;
    if (to !== u.id && !can(u, 'tasks_manage')) throw err(403, 'Only managers can assign tasks to other people.');
    var a = user(to); if (!a || a.status !== 'active') throw err(400, 'Choose an active staff member.');
    return { title: str(b.title, 160), description: str(b.description, 2000), category: str(b.category, 60) || 'Administrative', assignedTo: to, dueDate: b.dueDate, dueTime: /^\d{2}:\d{2}$/.test(b.dueTime || '') ? b.dueTime : '', priority: b.priority === 'high' ? 'high' : 'normal', repeat: ['none', 'weekly', 'monthly', 'quarterly', 'yearly'].indexOf(b.repeat) !== -1 ? b.repeat : 'none' };
  }
  function taskAssigned(t, by) {
    if (t.assignedTo === by.id) return; var a = user(t.assignedTo); if (!a) return;
    notify(a.id, 'task', 'Task for you: ' + t.title, 'Due ' + t.dueDate + (t.repeat !== 'none' ? ' · repeats ' + t.repeat : ''), '#/tasks?id=' + t.id);
    sendEmail('task_assigned', a.email, 'New task: ' + t.title, 'Hi ' + a.name + ',\n\n' + by.name + ' assigned you a task.\n\nTask: ' + t.title + (t.description ? '\nDetails: ' + t.description : '') + '\nDue: ' + t.dueDate + (t.repeat !== 'none' ? '\nRepeats: ' + t.repeat : '') + '\n\n' + base() + '#/tasks?id=' + t.id);
  }
  route('GET', 'tasks', function (p, b, q) {
    var u = requirePerm('tasks'), list = col('tasks'), f = q.filter || 'mine';
    if (f === 'all' || f === 'team') { if (!can(u, 'tasks_manage')) throw err(403, 'No access.'); }
    else if (f === 'created') list = list.filter(function (t) { return t.createdBy === u.id; });
    else list = list.filter(function (t) { return t.assignedTo === u.id; });
    if (q.userId) list = list.filter(function (t) { return t.assignedTo === Number(q.userId); });
    if (q.status) list = list.filter(function (t) { return t.status === q.status; });
    if (q.from) list = list.filter(function (t) { return t.dueDate >= q.from; });
    if (q.to) list = list.filter(function (t) { return t.dueDate <= q.to; });
    return list.slice().sort(function (a, b2) { return (a.status === 'done') - (b2.status === 'done') || (a.dueDate + (a.dueTime || '')).localeCompare(b2.dueDate + (b2.dueTime || '')); }).map(decorateTask);
  });
  route('POST', 'tasks', function (p, b) { var u = requirePerm('tasks'), t = insert('tasks', Object.assign(taskInput(b, u), { createdBy: u.id, status: 'open' })); taskAssigned(t, u); audit(u.id, 'tasks.create', t.title); save(); return decorateTask(t); });
  route('PATCH', 'tasks/:id', function (p, b) {
    var u = requirePerm('tasks'), t = find('tasks', p.id); if (!t) throw err(404, 'Not found.');
    var mine = t.assignedTo === u.id || t.createdBy === u.id; if (!mine && !can(u, 'tasks_manage')) throw err(403, 'No access.');
    var next = null;
    if (b.status === 'done' && t.status !== 'done') {
      t.status = 'done'; t.completedAt = now(); t.completedBy = u.id; t.completionNote = str(b.note, 500);
      if (t.repeat !== 'none') { next = insert('tasks', { title: t.title, description: t.description, category: t.category, assignedTo: t.assignedTo, createdBy: t.createdBy, dueDate: nextDue(t.dueDate, t.repeat), dueTime: t.dueTime, priority: t.priority, repeat: t.repeat, status: 'open', seriesId: t.seriesId || t.id }); }
      if (t.createdBy !== u.id) notify(t.createdBy, 'task', 'Task done: ' + t.title, u.name + (t.completionNote ? ': ' + t.completionNote : ''), '#/tasks?filter=created');
    } else if (b.status === 'open' && t.status === 'done') { t.status = 'open'; t.completedAt = null; }
    else if (b.title !== undefined || b.dueDate !== undefined || b.assignedTo !== undefined) {
      var before = t.assignedTo; Object.assign(t, taskInput(Object.assign({}, t, b), u)); if (t.assignedTo !== before) taskAssigned(t, u);
    }
    audit(u.id, 'tasks.update', t.title + ' ' + t.status); save();
    var out = decorateTask(t); if (next) out.next = decorateTask(next); return out;
  });
  route('DELETE', 'tasks/:id', function (p) { var u = requirePerm('tasks'), t = find('tasks', p.id); if (!t) throw err(404, 'Not found.'); if (t.createdBy !== u.id && !can(u, 'tasks_manage')) throw err(403, 'Only the person who created it (or a manager) can delete it.'); col('tasks').splice(col('tasks').indexOf(t), 1); audit(u.id, 'tasks.delete', t.title); save(); return { ok: true }; });

  // ---- website social links (shown on the website and in the portal)
  route('GET', 'settings/time', function () { requireUser(); return timeRules(); });
  route('PUT', 'settings/time', function (p, b) {
    var u = requireUser(); if (!can(u, 'approvals') && !can(u, 'settings')) throw err(403, 'No access.');
    var r = scheduleInput(b, true); if (!r || !r.days.length) throw err(400, 'Choose at least one work day and a start and end time.');
    db.settings.time = r; audit(u.id, 'settings.time', r.days.join(',') + ' ' + r.start + '-' + r.end); save(); return clone(r);
  });
  route('GET', 'settings/social', function () { return clone(db.settings.social || {}); });
  route('PUT', 'settings/social', function (p, b) {
    var u = requireUser(); if (!can(u, 'settings') && !can(u, 'news_manage')) throw err(403, 'No access.');
    var out = {}; ['facebook', 'instagram', 'youtube', 'linkedin'].forEach(function (k) { var v = str(b[k], 300); if (v && !/^https:\/\//i.test(v)) throw err(400, 'Links must start with https://'); out[k] = v; });
    db.settings.social = out; audit(u.id, 'settings.social', ''); save(); return out;
  });

  /* ------------------------------------------------------------- dispatcher */
  var ready = (async function () { load(); if (!db || !db.users) await seed(); })();

  window.CHCSDemoServer = {
    handle: async function (method, path, body) {
      await ready;
      var qs = {}, parts = path.split('?');
      if (parts[1]) new URLSearchParams(parts[1]).forEach(function (v, k) { qs[k] = v; });
      var clean = parts[0].replace(/^\/+|\/+$/g, '');
      for (var i = 0; i < routes.length; i++) {
        var r = routes[i]; if (r.m !== method) continue;
        var mm = clean.match(r.re); if (!mm) continue;
        load(); if (!db || !db.users) await seed(); // storage was cleared while the page was open
        var res = await r.fn(mm.groups || {}, body || {}, qs);
        return clone(res);
      }
      throw err(404, 'Unknown endpoint: ' + method + ' ' + clean);
    }
  };
})();
