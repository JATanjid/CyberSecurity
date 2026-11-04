<?php
/**
 * Renders the theme's real templates to static HTML without WordPress,
 * using minimal stubs of the WP functions the theme calls.
 *
 * Usage: php tools/render-preview.php <theme-dir> <out-dir>
 * Developer tool only — not needed on the live site.
 */

$theme = realpath( $argv[1] );
$out   = $argv[2];
@mkdir( $out, 0777, true );

define( 'ABSPATH', __DIR__ . '/' );

$GLOBALS['__page']  = '';
$GLOBALS['__title'] = '';
$GLOBALS['__content'] = '';
$GLOBALS['__loop']  = 0;

// ---------- i18n / escaping ----------
function __( $t, $d = null ) { return $t; }
function _e( $t, $d = null ) { echo $t; }
function esc_html__( $t, $d = null ) { return esc_html( $t ); }
function esc_html_e( $t, $d = null ) { echo esc_html( $t ); }
function esc_attr__( $t, $d = null ) { return esc_attr( $t ); }
function esc_attr_e( $t, $d = null ) { echo esc_attr( $t ); }
function esc_html( $t ) { return htmlspecialchars( (string) $t, ENT_QUOTES, 'UTF-8', false ); }
function esc_attr( $t ) { return esc_html( $t ); }
function esc_url( $u ) { return esc_attr( $u ); }
function esc_url_raw( $u ) { return $u; }
function wp_kses( $s, $a ) { return $s; }
function wp_kses_post( $s ) { return $s; }
function wp_strip_all_tags( $s ) { return strip_tags( $s ); }
function antispambot( $s ) { return $s; }
function sanitize_title( $s ) { return trim( preg_replace( '/[^a-z0-9]+/', '-', strtolower( $s ) ), '-' ); }
function sanitize_key( $s ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( $s ) ); }
function selected( $a, $b ) { if ( $a === $b ) echo ' selected'; }
function wp_unslash( $v ) { return $v; }

// ---------- hooks (no-ops, but collect) ----------
function add_action() {}
function add_filter() {}
function apply_filters( $tag, $v ) { return $v; }
function do_action() {}
function do_shortcode( $s ) { return $s; }

// ---------- options ----------
function get_theme_mod( $k, $d = '' ) { return $d; }
function get_option( $k ) { return 'page_for_posts' === $k ? 0 : ''; }
function get_template_directory() { return $GLOBALS['theme']; }
function get_template_directory_uri() { return 'assets-root'; }
function get_bloginfo( $k = '' ) { return 'Complete Home Care Services'; }
function bloginfo( $k ) { echo 'charset' === $k ? 'UTF-8' : ''; }
function language_attributes() { echo 'lang="en-US"'; }

// ---------- URLs ----------
function home_url( $p = '/' ) {
	$p = trim( $p, '/' );
	return '' === $p ? 'index.html' : $p . '.html';
}
function get_page_by_path( $s ) { return null; }
function get_permalink( $p = null ) { return '#'; }
function admin_url( $p ) { return '#'; }
function get_privacy_policy_url() { return ''; }

// ---------- template ----------
function get_header() { include $GLOBALS['theme'] . '/header.php'; }
function get_footer() { include $GLOBALS['theme'] . '/footer.php'; }
function get_search_form() { include $GLOBALS['theme'] . '/searchform.php'; }
function get_template_part( $slug, $name = null, $args = array() ) { include $GLOBALS['theme'] . '/' . $slug . '.php'; }
function wp_head() {
	echo '<title>' . esc_html( $GLOBALS['__title'] ) . ' – Complete Home Care Services (Design Preview)</title>' . "\n";
	echo '<meta name="robots" content="noindex, nofollow">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap">' . "\n";
	echo '<link rel="stylesheet" href="assets-root/assets/css/main.css">' . "\n";
}
function wp_footer() { echo '<script src="assets-root/assets/js/main.js"></script>'; }
function wp_body_open() {
	echo '<div style="background:#fff4d6;color:#5c4400;text-align:center;font:600 14px/1.4 system-ui,sans-serif;padding:8px 16px;border-bottom:1px solid #f0d58a">Design preview of a proposed redesign — not the official CHCS website. Forms are disabled. Official site: <a href="https://chcsny.com/" style="color:#5c4400">chcsny.com</a></div>';
}
function body_class() { echo 'class="preview"'; }
function post_class( $c = '' ) { echo 'class="' . esc_attr( $c ) . '"'; }
function wp_nav_menu( $a ) { if ( ! empty( $a['fallback_cb'] ) ) call_user_func( $a['fallback_cb'] ); }
function has_nav_menu( $l ) { return false; }
function has_custom_logo() { return false; }
function wp_nonce_field() { echo '<input type="hidden" name="chcs_nonce" value="preview">'; }
function is_page( $s = '' ) { return $GLOBALS['__page'] === $s; }
function is_front_page() { return 'home' === $GLOBALS['__page']; }
function is_home() { return false; }
function is_archive() { return false; }
function is_search() { return false; }
function is_404() { return false; }
function is_singular( $t = '' ) { return 'post' !== $t && 'home' !== $GLOBALS['__page']; }
function has_excerpt() { return false; }
function get_the_title( $p = null ) { return $GLOBALS['__title']; }
function the_title() { echo esc_html( $GLOBALS['__title'] ); }
function have_posts() { return $GLOBALS['__loop']-- > 0; }
function the_post() {}
function get_the_content() { return $GLOBALS['__content']; }
function the_content() { echo $GLOBALS['__content']; }
function wp_reset_postdata() {}
function wp_link_pages() {}

class WP_Query {
	public function __construct( $a ) {}
	public function have_posts() { return false; }
}

$GLOBALS['theme'] = $theme;
require $theme . '/functions.php';

$pages = array(
	'home'          => array( 'Home', 'front-page.php', '' ),
	'about-us'      => array( 'About Us', 'page-about-us.php', '<p>Complete Home Care Services, Inc. (CHCS) has delivered high-quality nursing and rehabilitative services to patients at home since 1993. Licensed by the New York State Department of Health and accredited by The Joint Commission, we help New Yorkers recover and stay independent where they are most comfortable — at home.</p><p>Our multidisciplinary team of registered nurses, licensed practical nurses and therapists works closely with each patient’s physician to build a personalized plan of care, and keeps families informed every step of the way.</p>' ),
	'services'      => array( 'Services', 'page-services.php', '' ),
	'family-portal' => array( 'Patients & Families', 'page-family-portal.php', '' ),
	'referrals'     => array( 'Referrals', 'page-referrals.php', '' ),
	'careers'       => array( 'Careers', 'page-careers.php', '<h2>Current openings</h2><ul><li>Registered Nurse (RN) — Field</li><li>Licensed Practical Nurse (LPN)</li><li>Physical Therapist (PT)</li><li>Occupational Therapist (OT)</li></ul><p>Edit this list in the page editor as positions open and close.</p>' ),
	'contact-us'    => array( 'Contact Us', 'page-contact-us.php', '' ),
	'news-blog'     => array( 'News', 'page.php', '<p>Add news posts in WordPress (Posts → Add New). They appear here and on the homepage automatically.</p>' ),
	'privacy-policy-notice' => array( 'Notice of Privacy Practices', 'page.php', '<p>Paste your HIPAA Notice of Privacy Practices here.</p>' ),
	'non-discrimination'    => array( 'Non-Discrimination Notice', 'page.php', '<p>Paste your Section 1557 non-discrimination notice and language assistance taglines here.</p>' ),
);

foreach ( $pages as $slug => $p ) {
	$GLOBALS['__page']    = $slug;
	$GLOBALS['__title']   = $p[0];
	$GLOBALS['__content'] = $p[2];
	$GLOBALS['__loop']    = 1;
	ob_start();
	include $theme . '/' . $p[1];
	$html = ob_get_clean();
	$file = 'home' === $slug ? 'index.html' : $slug . '.html';
	file_put_contents( $out . '/' . $file, $html );
	echo "rendered $file\n";
}
