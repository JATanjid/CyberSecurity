<?php
/**
 * Serves the portal app at /portal/ (plus its PWA manifest and service worker),
 * and adds a "CHCS Portal" menu in wp-admin.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_portal_rewrite_rules() {
	add_rewrite_rule( '^portal/?$', 'index.php?chcs_portal=app', 'top' );
	add_rewrite_rule( '^portal/manifest\.webmanifest$', 'index.php?chcs_portal=manifest', 'top' );
	add_rewrite_rule( '^portal/sw\.js$', 'index.php?chcs_portal=sw', 'top' );
}
add_action( 'init', 'chcs_portal_rewrite_rules' );

add_filter(
	'query_vars',
	function ( $v ) {
		$v[] = 'chcs_portal';
		return $v;
	}
);

/* Don't let WordPress add a trailing slash to /portal/sw.js or the manifest. */
add_filter(
	'redirect_canonical',
	function ( $redirect ) {
		return get_query_var( 'chcs_portal' ) ? false : $redirect;
	}
);

/* Work even before permalinks are flushed / with plain permalinks: /?chcs_portal=app */
add_action(
	'template_redirect',
	function () {
		$what = get_query_var( 'chcs_portal' );
		if ( ! $what ) {
			return;
		}
		nocache_headers();
		header( 'X-Robots-Tag: noindex, nofollow' );
		header( 'X-Frame-Options: SAMEORIGIN' );
		header( 'Referrer-Policy: same-origin' );
		if ( 'manifest' === $what ) {
			chcs_portal_manifest();
		} elseif ( 'sw' === $what ) {
			chcs_portal_sw();
		} else {
			chcs_portal_page();
		}
		exit;
	}
);

function chcs_portal_asset_base() {
	return CHCS_PORTAL_URL . 'app/';
}

function chcs_portal_page() {
	$base   = chcs_portal_asset_base();
	$ver    = CHCS_PORTAL_VERSION;
	$uid    = get_current_user_id();
	$config = array(
		'mode'      => 'rest',
		'root'      => esc_url_raw( rest_url( CHCS_PORTAL_NS . '/' ) ),
		'nonce'     => $uid ? wp_create_nonce( 'wp_rest' ) : '',
		'assetBase' => $base,
		'sw'        => home_url( '/portal/sw.js' ),
		'swScope'   => wp_parse_url( home_url( '/portal/' ), PHP_URL_PATH ),
		'site'      => home_url( '/' ),
	);
	header( 'Content-Type: text/html; charset=utf-8' );
	?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#161b45">
<meta name="robots" content="noindex, nofollow">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CHCS Portal">
<title>CHCS Portal</title>
<link rel="manifest" href="<?php echo esc_url( home_url( '/portal/manifest.webmanifest' ) ); ?>">
<link rel="icon" type="image/png" href="<?php echo esc_url( $base . 'assets/favicon.png' ); ?>">
<link rel="apple-touch-icon" href="<?php echo esc_url( $base . 'assets/apple-touch-icon.png' ); ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="<?php echo esc_url( $base . 'css/portal.css?v=' . $ver ); ?>">
</head>
<body>
<div id="app"><div class="loading" style="min-height:100vh"><div class="spinner"></div></div></div>
<div id="toasts" class="toasts" aria-live="polite"></div>
<noscript><p style="padding:20px">The CHCS Portal needs JavaScript turned on.</p></noscript>
<script>window.CHCS_CONFIG = <?php echo wp_json_encode( $config ); ?>;</script>
<script src="<?php echo esc_url( $base . 'js/core.js?v=' . $ver ); ?>"></script>
<script src="<?php echo esc_url( $base . 'js/app.js?v=' . $ver ); ?>"></script>
</body>
</html>
	<?php
}

function chcs_portal_manifest() {
	$base = chcs_portal_asset_base();
	$path = wp_parse_url( home_url( '/portal/' ), PHP_URL_PATH );
	header( 'Content-Type: application/manifest+json; charset=utf-8' );
	echo wp_json_encode(
		array(
			'name'             => 'CHCS Staff Portal',
			'short_name'       => 'CHCS Portal',
			'description'      => 'Complete Home Care Services staff and employee portal.',
			'start_url'        => $path . '#/dashboard',
			'scope'            => $path,
			'display'          => 'standalone',
			'orientation'      => 'portrait',
			'background_color' => '#161b45',
			'theme_color'      => '#161b45',
			'icons'            => array(
				array( 'src' => $base . 'assets/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png' ),
				array( 'src' => $base . 'assets/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png' ),
				array( 'src' => $base . 'assets/icon-maskable-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'maskable' ),
			),
			'shortcuts'        => array(
				array( 'name' => 'Time clock', 'url' => $path . '#/clock' ),
				array( 'name' => 'Chat', 'url' => $path . '#/chat' ),
				array( 'name' => 'My schedule', 'url' => $path . '#/calendar' ),
			),
		),
		JSON_UNESCAPED_SLASHES
	);
}

function chcs_portal_sw() {
	$base = chcs_portal_asset_base();
	header( 'Content-Type: application/javascript; charset=utf-8' );
	header( 'Service-Worker-Allowed: ' . wp_parse_url( home_url( '/portal/' ), PHP_URL_PATH ) );
	$ver = CHCS_PORTAL_VERSION;
	// Network-first app-shell cache. REST API calls are never cached.
	echo "var CACHE='chcs-portal-{$ver}',B=" . wp_json_encode( $base ) . ";\n";
	echo "var SHELL=['./',B+'css/portal.css?v={$ver}',B+'js/core.js?v={$ver}',B+'js/app.js?v={$ver}',B+'assets/logo.png',B+'assets/icon-192.png'];\n";
	echo <<<'JS'
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL).catch(function(){});}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){var r=e.request,u=new URL(r.url);
if(r.method!=='GET'||u.origin!==self.location.origin||u.pathname.indexOf('/wp-json/')!==-1||u.search.indexOf('rest_route')!==-1||u.pathname.indexOf('/forms/')!==-1)return;
e.respondWith(fetch(r).then(function(res){if(res&&res.ok){var c=res.clone();caches.open(CACHE).then(function(x){x.put(r,c);});}return res;}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('./');});}));});
JS;
}

/* ------------------------------------------------------------ wp-admin menu */
add_action(
	'admin_menu',
	function () {
		add_menu_page( 'CHCS Portal', 'CHCS Portal', 'manage_options', 'chcs-portal', 'chcs_portal_admin_page', 'dashicons-heart', 3 );
	}
);

function chcs_portal_admin_page() {
	$url     = home_url( '/portal/' );
	$pending = count( chcs_portal_users( 'pending' ) );
	$s       = chcs_email_settings();
	?>
	<div class="wrap">
		<h1>CHCS Staff Portal</h1>
		<p style="font-size:15px">The portal runs at <a href="<?php echo esc_url( $url ); ?>" target="_blank"><strong><?php echo esc_html( $url ); ?></strong></a>. You are a portal administrator because you are a WordPress administrator.</p>
		<p><a class="button button-primary button-hero" href="<?php echo esc_url( $url ); ?>" target="_blank">Open the portal</a></p>
		<h2>Status</h2>
		<ul style="list-style:disc;padding-left:20px">
			<li>Accounts waiting for approval: <strong><?php echo (int) $pending; ?></strong></li>
			<li>Email delivery: <strong><?php echo 'resend' === $s['provider'] && chcs_resend_key() ? 'Resend API (connected)' : 'WordPress mail'; ?></strong> — change it in the portal under Admin → Email &amp; API.</li>
			<li>Permalinks: if <code>/portal/</code> shows “Page not found”, go to Settings → Permalinks and click Save once.</li>
		</ul>
		<h2>Add the portal to your website menu</h2>
		<p>Appearance → Menus → Custom Links → URL <code><?php echo esc_html( $url ); ?></code>, label “Staff Portal”.</p>
	</div>
	<?php
}

/* Link "Staff Portal" on the plugins screen. */
add_filter(
	'plugin_action_links_' . plugin_basename( CHCS_PORTAL_FILE ),
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( home_url( '/portal/' ) ) . '">Open portal</a>' );
		return $links;
	}
);
