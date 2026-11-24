# CHCS Staff Portal (WordPress plugin + phone app)

A staff and employee portal for **Complete Home Care Services**. It runs inside your WordPress site at
**`https://your-site/portal/`**, and staff can install it on their phones like an app.

## What's inside

| For | Features |
|---|---|
| **Everyone** | Sign up and sign in, **email verification**, forgot password, profile, dashboard, news and posts, a **notification bell** (with phone notifications when allowed), and the phone app |
| **Office staff** | **Time clock** (office staff only) and **Worked time** (weekly hours per office employee), **vacation and sick leave** requests with yearly balances, **Call dashboard**, **Tasks & deadlines** (task calendar with repeating tasks), **office calendar**, chat with **✓ sent / ✓✓ delivered / blue ✓✓ seen** ticks, intake and cases (list view), forms |
| **Field staff (PCA / HHA / LPN / RN)** | Chat with the office, **In-services tab** (due dates, the Training Center inside the tab with their profile name filled in, **"Ask the nurse" chat while taking a test**), **calendar showing only their in-service due dates**, **timesheet = the HHA duty sheet (if allowed)**, **orientation (if allowed)**, forms. Field staff clock in and out of visits in **HHAeXchange**, so the portal has no clock or visit notes for them |
| **Nurse (Nursing Supervisor)** | **Assign in-services** (Training Center courses or portal quizzes) to employees with due dates, track who's done or overdue, and answer employees' questions in chat |
| **Job applicants** | Must **verify their email** before they can apply. Then they fill in the application, and HR approves (hires) or rejects them |
| **Admin panel** | Approve accounts; set **designations** and per-person **access**; approve time and **leave**; **payroll Excel export** (regular, overtime and leave hours); training setup; publish **news and posts** to the portal and/or the website; **connect Resend** for automatic emails; audit log |

### Call dashboard (incoming call management)
- **Take a call** starts a call timer and a quick form: caller phone and name, caller type, reason, message, priority, and who it's for.
- As you type the phone number, the portal looks it up. It shows a **patient on file**, an **employee**, or **earlier calls** from that number, and fills in the name.
- **Assigning a call** sends the person an **email and a notification** right away. Urgent calls are flagged.
- Each call has a **call-back-by** time. Overdue call-backs are shown in red, and they appear on the assignee's calendar.
- Filters: Open, Assigned to me, Taken by me, Today, All. Follow-up notes, **Mark returned**, reassign, and close.
- This is a call log. It doesn't connect to your phone system. If you use RingCentral, 8x8 or similar, the calls can later be logged automatically through their API.

### Tasks & deadlines (office task calendar)
Use it for administrative work with a due date: license renewals, audits, payroll reconciliation, personnel-file reviews and so on.
- Each task has a title, details, category, due date and optional time, priority, and who it's for.
- **Repeat:** every week, month, 3 months or year. Marking a repeating task **done** creates the next one automatically. A task due on the 31st moves to the last day of shorter months.
- Everyone with *Tasks & deadlines* can create their own tasks. People with **Assign tasks** (Office Manager and HR by default) can assign tasks to anyone and see everyone's.
- When a task is assigned, the person gets an **email and a notification**. On WordPress, a **daily reminder email** also goes out for tasks due tomorrow or overdue.
- Views: **List** (open / overdue / done) and **Calendar**. Tasks also appear on the office calendar.

### Calendars
- **Office calendar:** shifts, time off, tasks, call-backs and in-service due dates. Managers can filter by employee and add office shifts. Field staff are left out.
- **Field staff calendar:** only their **in-service due dates** (and completions), with no patient visits.
- **On phones**, every calendar scrolls left and right.

### Worked time
Weekly hours from the office time clock, per employee and per day, with totals. Anyone over 40 hours is shown in red, and hours that still need approval are listed separately. Employees see their own hours; people with *Approve time* or *Payroll export* see the whole office.

### Website & social media
In **Admin → Website & social**, enter the Facebook, Instagram, YouTube and LinkedIn links. They show as icons on the website (top bar and footer), in the portal sidebar and on the sign-in page. Leave a link blank to hide its icon.

### Vacation and sick leave (office staff)
Employees request vacation, sick, personal, bereavement, jury duty, unpaid or other leave, for full or partial days; weekends aren't counted. Managers with **Manage leave** approve or reject, and the employee gets an email and a notification. Yearly allowances are editable per person (defaults: 80h vacation, 40h sick, 16h personal). New York requires paid sick leave: 40h for employers with 5–99 employees, 56h for 100 or more. Approved leave shows on the calendar and in the payroll export (*Leave / PTO hours* column and a *Leave* sheet).

The access control is by module. Each designation (Office Manager, Intake Coordinator, Scheduler, Payroll Specialist,
HR Coordinator, Nursing Supervisor, PCA, HHA, LPN, RN — all editable) has default modules, and an admin can
customize any single person. The modules are: Time clock, Timesheet, Approve time, Payroll export,
Vacation & sick leave, Manage leave, Call dashboard, Chat, Manage news & posts, Intake & cases, Forms,
My schedule, Manage schedules, In-services, Orientation, Manage training, Review applications,
Users & access, Email & API settings, and Audit log.
WordPress administrators are always portal admins.

## Install

1. In WordPress, go to **Plugins → Add New → Upload Plugin**, choose **`chcs-portal.zip`**, then **Install**, then **Activate**.
2. Go to **Settings → Permalinks** and click **Save** once. This makes `/portal/` work.
3. Open **`https://your-site/portal/`** and sign in with your WordPress admin account.
4. Go to **Admin → Email & API** in the portal and connect email (see below). Verification emails need working email.
5. Add a "Staff Portal" link to your website menu. The included **CHCS Care** theme already adds one.

Requirements: WordPress 6.0+, PHP 7.4+ (tested on WordPress 6.7.1 + PHP 8.3), and **HTTPS** (required for the phone app).

## Connect Resend (automatic emails)

1. Create an account at resend.com, add your domain (e.g. `chcsny.com`) and add the DNS records it shows you.
2. Create an **API key** (Sending access).
3. In the portal, go to **Admin → Email & API**, choose **Resend API**, paste the key, set **From email** to an
   address on your verified domain (e.g. `no-reply@chcsny.com`), then **Save** and **Send test email**.
4. Choose which automatic emails are sent: verification, password reset, new-account alert to admin, account
   approved/rejected, application received/decision, time approved/rejected, shift scheduled, in-service assigned,
   and new staff post.

It's more secure to keep the key out of the database by adding this line to `wp-config.php`:
```php
define( 'CHCS_RESEND_API_KEY', 're_xxxxxxxxx' );
```
If you don't use Resend, the portal uses normal WordPress mail. In that case install **WP Mail SMTP** so mail is delivered.

## Notifications
The bell in the top bar lists everything addressed to you: calls assigned to you, leave decisions, in-service assignments, time approvals, new shifts and new accounts to approve. Tap **Turn on notifications** (bell, Chat or Profile) to also get **phone and desktop notifications** for these and for new chat messages.
- These notifications arrive while the portal is open or running in the background. On iPhone, install the app to the Home Screen first, because Safari only allows notifications from installed apps.
- Alerts when the app is fully closed would need *Web Push* (VAPID keys plus a push service). That isn't set up yet, but it can be added later. Emails still go out for calls, leave and assignments.

## Install the phone app

The portal is a Progressive Web App (PWA), so nobody needs an app store:
- **iPhone:** open `your-site/portal/` in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** open it in Chrome, then tap **Install app** (or menu ⋮, then **Add to Home screen**).

The app opens full-screen with the CHCS icon and has a bottom tab bar (Dashboard, Clock or Timesheet, Chat,
Schedule, More). It opens instantly on later visits, and the website itself isn't part of the app.
*(If you later want listings in the App Store or Google Play, the same app can be wrapped with Capacitor. That needs
Apple and Google developer accounts.)*

## How the main flows work

- **Office sign-up:** create account, verify email, admin approves (Admin → Users & access → Approve), user signs in.
- **Job applicant:** create account ("Apply for a job"), verify email, fill in the application, HR approves and picks the designation,
  and ticks **Allow orientation** and/or **Allow timesheet**. The person becomes field staff.
- **Time:** office staff clock in and out (field staff use HHAeXchange). Time **inside the work schedule is approved automatically**. Only time **outside** it goes to **Approvals**: clocking in early, clocking out late (beyond the grace minutes) or working on a day off. Each entry shows the reason, e.g. "Clocked out 1 h 45 min late (ends 5:00 PM)".
  - **Office schedule:** set in **Approvals → Office work schedule → Change** (default Mon–Fri 9:00 AM – 5:00 PM, 15 minutes grace).
  - **Personal schedule:** in **Admin → Users & access → Manage**, tick *Different from the office schedule*.
  - A **shift on the office calendar** for that day takes priority over both.
- **Timesheet (field staff):** the weekly HHA / PCA duty sheet, signed and submitted as a PDF. Visit hours stay in HHAeXchange.
  **Payroll export** then downloads an Excel file with a *Summary* sheet (regular / overtime over 40 hours per Mon–Sun week / total) and a *Detail* sheet.
- **Intake:** one list of every referral and case, with status tabs (New, Verifying insurance, Assessment, Active, On hold,
  Discharged, Declined), search, case notes and the care team.
- **News and posts:** *Website + all staff* posts are normal WordPress posts, so they also appear on the website's News section.
  *All staff / Office / Field* posts stay inside the portal (a private "Staff announcements" post type).
- **Employment application:** on screen it has a header showing which page you're on, a *filled-in* progress bar and Previous / Next page buttons, plus tinted fields and a highlighted current page. **Its PDF is still exactly the same.**
- **Forms:** your existing duty sheet, patient assessment, employment application packet and Workspace app open inside
  the portal, with the employee's name filled in. They submit to your Google Apps Script backends, and each one shows
  *Building… → Submitting… → Submitted successfully*. The forms use the website's design, and on phones the paper forms
  shrink to fit the screen, with a **Fit to screen / Actual size** switch.
  **The PDFs are exactly the same as before.** The new styling switches itself off while a PDF is being made
  (`app/forms/chcs-form-theme.css` and `.js`). This was verified by comparing the PDF page images against the original forms on desktop and phone.
- **In-services:** the In-Service Training Center is part of the **In-services** tab, not a form. It shows the employee's profile name,
  due dates come from the nurse's assignments, and finishing a course is recorded automatically and tells the nurse.

## Updating from version 1.2
Upload the new zip. Nothing to migrate: the office schedule starts at Mon–Fri 9–5 with 15 minutes grace; change it in Approvals. Entries already waiting stay in Approvals.

## Updating from version 1.1
Upload the new zip the same way. The update runs once by itself: office designations gain **Tasks & deadlines**, and Office Manager and HR Coordinator gain **Assign tasks**.

## Updating from version 1.0
Upload the new `chcs-portal.zip` (Plugins → Add New → Upload, then choose **Replace current with uploaded**). The update runs once by itself:
- **Visit notes are removed**, because field staff document visits in HHAeXchange. Existing visit-note records stay in the database but no longer show.
- **Office designations gain** *Vacation & sick leave* and *Call dashboard*.
- **Office Manager and HR Coordinator gain** *Manage leave*.
- **Nursing Supervisor gains** *In-services*.
Review the result in **Designations**.

## Security and HIPAA notes

- Intake/cases, call notes and chat can contain **protected health information (PHI)**. Host WordPress with a provider
  that will sign a **BAA** (Business Associate Agreement), always use HTTPS, keep WordPress and plugins updated, and back up the database.
- Use **2-factor authentication** for admin accounts (e.g. the Wordfence or WP 2FA plugin).
- Emails never include case details. **Don't put patient names in shift titles**, because shift emails include the title.
- Sign-in, sign-up and reset are rate-limited. Tokens are random and stored hashed. Every API call checks the person's
  access on the server. Portal-only users can't open wp-admin. Key actions are recorded in the **Audit log**.
- Uninstalling the plugin keeps all data. To erase it, add `define( 'CHCS_PORTAL_DELETE_DATA', true );` to wp-config.php before deleting.

## Files

```
chcs-portal/
├── chcs-portal.php          plugin bootstrap + activation (table, role, default designations)
├── includes/
│   ├── store.php            one indexed table (wp_chcs_records) for all portal records
│   ├── helpers.php          users, permissions, route wrapper, rate limit, audit
│   ├── mailer.php           Resend API / WordPress mail + branded HTML emails
│   ├── rest-auth.php        sign-up, verify, login, reset, profile, dashboard
│   ├── rest-admin.php       users & access, designations, email settings, audit
│   ├── rest-time.php        clock, timesheets, approvals, payroll
│   ├── rest-care.php        intake / cases
│   ├── rest-team.php        chat, schedules
│   ├── rest-training.php    in-services, quizzes, orientation
│   ├── rest-content.php     applications, news & posts
│   ├── rest-ops.php         notifications, vacation & sick leave, call dashboard
│   ├── rest-tasks.php       tasks & deadlines (repeating), daily reminders, social links
│   └── portal-page.php      serves /portal/, manifest, service worker; wp-admin menu
└── app/                     the portal app (HTML/CSS/JS, no build step)
    ├── js/core.js, js/app.js
    ├── js/demo-server.js    in-browser demo backend (GitHub Pages only, not used on WordPress)
    ├── forms/               your existing agency forms
    └── vendor/xlsx.full.min.js  SheetJS (Apache-2.0) for the Excel export
```

REST API: `/wp-json/chcs/v1/…`. The demo backend in `app/js/demo-server.js` implements the same endpoints.

## Try the demo (no WordPress)

`app/index.html` runs in **demo mode**, and all data stays in that browser. Demo accounts (password `demo1234`):
`admin@chcs.demo`, `manager@chcs.demo`, `intake@chcs.demo`, `nurse@chcs.demo` (Nursing Supervisor), `hha@chcs.demo`, `rn@chcs.demo`,
`applicant@chcs.demo`, `pending@chcs.demo`. Emails appear in the **Demo inbox** button.
