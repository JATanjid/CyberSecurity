# CHCS Care — WordPress Theme: Installation & Setup Guide

A redesigned, mobile-first WordPress theme for **Complete Home Care Services, Inc. (chcsny.com)**.

## What's in the zip

```
chcs-care-theme.zip
└── chcs-care/                ← the WordPress theme (upload this)
    ├── style.css             theme header
    ├── functions.php         setup, assets, helpers, SEO schema
    ├── header.php / footer.php
    ├── front-page.php        designed homepage
    ├── page-services.php     auto-used by the page with slug "services"
    ├── page-about-us.php     … slug "about-us"
    ├── page-family-portal.php… slug "family-portal"
    ├── page-referrals.php    … slug "referrals"
    ├── page-careers.php      … slug "careers"
    ├── page-contact-us.php   … slug "contact-us"
    ├── page.php, single.php, index.php, 404.php, searchform.php
    ├── inc/                  customizer, built-in form, page auto-setup, icons, content data
    ├── template-parts/       reusable sections (hero, services grid, steps, FAQ, CTA, contact)
    └── assets/               css, js, illustrations
chcsny-preview/               ← static HTML preview of every page (open index.html)
INSTRUCTIONS.md               ← this file
```

## 1. Install (5 minutes)

1. **Back up the current site first** (e.g. UpdraftPlus plugin, or your host's backup tool).
2. In WordPress: **Appearance → Themes → Add New → Upload Theme**.
3. Choose **`chcs-care.zip`** (the theme folder zipped on its own — see "Uploading" below) → **Install Now** → **Activate**.

   *Uploading:* WordPress needs a zip whose top-level folder is `chcs-care/`. Inside this package
   there is a ready-made **`chcs-care.zip`**. Upload that one, not the outer package.
   Or use FTP/SFTP or the host's File Manager to copy the `chcs-care` folder into `/wp-content/themes/`.

## 2. What activation does automatically

On first activation the theme:

- creates these pages **only if they don't already exist** (it matches on slug and never overwrites):
  Home, About Us, Services, Patients & Families (`family-portal`), Referrals, Careers, News (`news-blog`),
  Contact Us, Notice of Privacy Practices, Non-Discrimination Notice
- sets **Home** as the static front page and **News** as the blog page, but only if the site currently shows latest posts
- builds a **"CHCS Primary"** menu and assigns it, but only if no primary menu is set yet

The current chcsny.com already uses `/about-us/`, `/contact-us/`, `/news-blog/` and `/patients/family-portal/`.
Existing pages keep their URLs. For the family portal page, either change its slug to `family-portal`
(and add a redirect, see step 6) or pick its template manually.

## 3. Customize your details (no code)

**Appearance → Customize → CHCS Settings**

| Section | Settings |
|---|---|
| Contact & Address | Org name, logo text, tagline, phone, email, address, **office hours** (blank = hidden), compliance hotline + hours |
| Homepage | Hero headline and paragraph, **hero photo**, "Why families choose us" photo |
| Links, Forms & Social | Family portal login URL, form recipient email, optional form-plugin shortcode, Facebook, Instagram, LinkedIn |

Also: **Customize → Site Identity** to upload your real logo (it replaces the text logo) and site icon (favicon).

**Recommended photos:** real CHCS staff photos (with consent). Hero: portrait about 900×1125. Feature: landscape about 1000×800.
The bundled illustrations are placeholders.

## 4. Menus

**Appearance → Menus**: edit "CHCS Primary". Drag items under a parent to create dropdowns.
You can also assign a **Footer Menu** and **Footer Legal Links** menu. If you leave them unassigned, the theme shows sensible defaults.

## 5. Forms

The built-in form (Contact, Referrals, Careers, Patients & Families) is protected by a nonce, a honeypot and a time trap.
It sends email through `wp_mail()` to the address in Customizer, or to the site admin email if that is blank.

- **Make email reliable:** install **WP Mail SMTP** and connect it to Google Workspace, Microsoft 365 or similar. Many hosts drop unauthenticated mail.
- **HIPAA:** the form deliberately asks only for contact details and warns users not to send medical information.
  If you want to collect PHI online, use a HIPAA-compliant form service that will sign a BAA (e.g. Jotform HIPAA, Formstack)
  and paste its shortcode or embed into *Customizer → Links, Forms & Social → form shortcode*.
- Prefer Contact Form 7, WPForms or Gravity Forms? Paste its shortcode into the same field. It replaces the built-in form on every page.

## 6. Recommended plugins

| Purpose | Plugin |
|---|---|
| SEO (titles, sitemap) | Yoast SEO or Rank Math |
| Email delivery | WP Mail SMTP |
| Redirect old URLs (e.g. `/patients/family-portal/` → `/family-portal/`) | Redirection |
| Security | Wordfence, or your host's WAF |
| Speed / cache | your host's cache, or LiteSpeed Cache / WP Super Cache |
| Backups | UpdraftPlus |
| Translation (Spanish, Haitian Creole, etc.) | Polylang or WPML |
| Accessibility check | run the WAVE browser extension once you launch |

## 7. Editing content

- Every designed page also prints whatever you type in the normal WordPress editor, so you can add text, images and lists without code.
- **Services, FAQ and service areas** are defined in `inc/data.php`. Edit the arrays there, or override them from a child theme with the
  `chcs_services`, `chcs_faqs` and `chcs_service_areas` filters.
- **News:** Posts → Add New. The three latest posts appear on the homepage automatically. Set a Featured Image for a nicer card.

## 8. Before going live — checklist

- [ ] Replace placeholder illustrations with real photos (Customizer → Homepage)
- [ ] Upload the logo (Site Identity)
- [ ] Set office hours if you want them shown
- [ ] Paste your real Notice of Privacy Practices and Section 1557 Non-Discrimination notice
- [ ] Update the Careers job list
- [ ] Confirm the "Gold Seal of Approval®" badge is current (it's in `front-page.php`). Remove it if your accreditation has lapsed.
- [ ] Confirm the statements about services and insurance with your compliance team
- [ ] Install WP Mail SMTP and send a test form
- [ ] Add redirects for any URLs that changed
- [ ] Check the site on a phone

## Requirements

WordPress 6.0+ and PHP 7.4+ (tested with PHP 8.3). No page builder is needed, and the theme runs on any standard WordPress host:
Bluehost, SiteGround, Hostinger, GoDaddy, WP Engine, Kinsta and others.

## Improvements over the current site

- A clear call to action on every screen ("Request Care", tap-to-call), plus a sticky call bar on phones
- Trust signals up front: NYS DOH licensed, Joint Commission accredited, serving since 1993
- Dedicated pages for patients and families, referring providers and job seekers
- A plain-language "How it works" section and an FAQ
- Accessibility: skip link, visible focus states, keyboard-friendly menu, semantic headings, good color contrast, reduced-motion support
- Faster loading: no page builder, no jQuery, inline SVG icons, lazy-loaded images
- SEO: HomeHealthCareService structured data, clean headings, a sitemap-ready setup
- Compliance: hotline in the header and footer, links to privacy and non-discrimination notices, a PHI-safe form
- Every contact detail can be edited in the Customizer, with no code
