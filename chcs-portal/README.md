# CHCS Staff Portal (WordPress plugin + phone app)

A staff and employee portal for **Complete Home Care Services**. It runs inside your WordPress site at
**`https://your-site/portal/`**, and staff can install it on their phones like an app.

## What's inside

| For | Features |
|---|---|
| **Everyone** | Sign up and sign in, **email verification**, forgot password, profile, dashboard, news and posts, phone app |
| **Office staff** | Time clock (in/out, optional location), work calendar, chat with coworkers and field staff, intake and case management, visit-note review, forms |
| **Field staff (PCA / HHA / LPN / RN)** | Chat with the office, in-services with quizzes, visit notes for assigned patients, schedule, **timesheet (if allowed)**, **orientation (if allowed)**, forms |
| **Job applicants** | Must **verify their email** before they can apply. Then they fill in the application, and HR approves (hires) or rejects them |
| **Admin panel** | Approve accounts; set **designations** and per-person **access**; approve time; **payroll Excel export**; manage in-services and orientation; publish **news and posts** to the portal and/or the website; **connect Resend** for automatic emails; audit log |

The access control is by module. Each designation (Office Manager, Intake Coordinator, Scheduler, Payroll Specialist,
HR Coordinator, Nursing Supervisor, PCA, HHA, LPN, RN — all editable) has default modules, and an admin can
customize any single person. The modules are: Time clock, Timesheet, Approve time, Payroll export,
Intake & cases, Visit notes, Forms, My schedule, Manage schedules, Chat, Manage news & posts,
In-services, Orientation, Manage training, Review applications, Users & access, Email & API settings, and Audit log.
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
- **Time:** office staff clock in and out, and field staff add visits to a weekly timesheet and submit it. Both go to **Approvals**.
  **Payroll export** then downloads an Excel file with a *Summary* sheet (regular / overtime over 40 hours per Mon–Sun week / total) and a *Detail* sheet.
- **Intake:** a referral board (New → Verifying insurance → Assessment → Active → On hold / Discharged). Assign the care team.
  Assigned field staff see the patient under **My patients** and can write visit notes.
- **News and posts:** *Website + all staff* posts are normal WordPress posts, so they also appear on the website's News section.
  *All staff / Office / Field* posts stay inside the portal (a private "Staff announcements" post type).
- **Forms:** your existing duty sheet, patient assessment, in-service training center, employment application packet
  and Workspace app open inside the portal. They submit to your Google Apps Script backends, and each one shows
  *Building… → Submitting… → Submitted successfully*.

## Security and HIPAA notes

- Intake/cases, visit notes and chat can contain **protected health information (PHI)**. Host WordPress with a provider
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
│   ├── rest-care.php        intake / cases / visit notes
│   ├── rest-team.php        chat, schedules
│   ├── rest-training.php    in-services, quizzes, orientation
│   ├── rest-content.php     applications, news & posts
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
`admin@chcs.demo`, `manager@chcs.demo`, `intake@chcs.demo`, `hha@chcs.demo`, `rn@chcs.demo`,
`applicant@chcs.demo`, `pending@chcs.demo`. Emails appear in the **Demo inbox** button.
