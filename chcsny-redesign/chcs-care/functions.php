<?php
/**
 * CHCS Care theme functions.
 *
 * @package chcs-care
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CHCS_VERSION', '1.0.0' );
define( 'CHCS_DIR', get_template_directory() );
define( 'CHCS_URI', get_template_directory_uri() );

require CHCS_DIR . '/inc/icons.php';
require CHCS_DIR . '/inc/data.php';
require CHCS_DIR . '/inc/customizer.php';
require CHCS_DIR . '/inc/forms.php';
require CHCS_DIR . '/inc/setup-pages.php';

/**
 * Theme setup.
 */
function chcs_setup() {
	load_theme_textdomain( 'chcs-care', CHCS_DIR . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 112,
			'width'       => 360,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'chcs-care' ),
			'footer'  => __( 'Footer Menu', 'chcs-care' ),
			'legal'   => __( 'Footer Legal Links', 'chcs-care' ),
		)
	);

	add_image_size( 'chcs-card', 720, 405, true );
	add_image_size( 'chcs-hero', 900, 1125, true );
}
add_action( 'after_setup_theme', 'chcs_setup' );

/**
 * Enqueue front-end assets.
 */
function chcs_assets() {
	wp_enqueue_style(
		'chcs-fonts',
		'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'chcs-main', CHCS_URI . '/assets/css/main.css', array( 'chcs-fonts' ), CHCS_VERSION );
	wp_enqueue_script( 'chcs-main', CHCS_URI . '/assets/js/main.js', array(), CHCS_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'chcs_assets' );

/** Preconnect to Google Fonts for speed. */
function chcs_resource_hints( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
		$urls[] = 'https://fonts.googleapis.com';
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'chcs_resource_hints', 10, 2 );

/** Footer widget areas. */
function chcs_widgets() {
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'chcs-care' ),
			'id'            => 'sidebar-1',
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);
}
add_action( 'widgets_init', 'chcs_widgets' );

/** Excerpt tweaks. */
add_filter( 'excerpt_length', function () { return 22; } );
add_filter( 'excerpt_more', function () { return '…'; } );

/**
 * Helper: get a Customizer option with default.
 *
 * @param string $key Option key (without prefix).
 * @return string
 */
function chcs_opt( $key ) {
	$defaults = chcs_defaults();
	$default  = isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
	return get_theme_mod( 'chcs_' . $key, $default );
}

/** Helper: phone number to tel: link. */
function chcs_tel( $phone ) {
	return 'tel:' . preg_replace( '/[^0-9+]/', '', $phone );
}

/** Helper: URL of a page by slug (falls back to home). */
function chcs_page_url( $slug ) {
	$page = get_page_by_path( $slug );
	return $page ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
}

/**
 * Fallback menu used until a menu is assigned in Appearance → Menus.
 */
function chcs_fallback_menu() {
	$items = array(
		'about-us'      => __( 'About', 'chcs-care' ),
		'services'      => __( 'Services', 'chcs-care' ),
		'family-portal' => __( 'Patients & Families', 'chcs-care' ),
		'referrals'     => __( 'Referrals', 'chcs-care' ),
		'careers'       => __( 'Careers', 'chcs-care' ),
		'news-blog'     => __( 'News', 'chcs-care' ),
		'contact-us'    => __( 'Contact', 'chcs-care' ),
	);
	echo '<ul class="menu">';
	foreach ( $items as $slug => $label ) {
		$current = is_page( $slug ) ? ' current-menu-item' : '';
		printf( '<li class="menu-item%s"><a href="%s">%s</a></li>', esc_attr( $current ), esc_url( chcs_page_url( $slug ) ), esc_html( $label ) );
	}
	echo '</ul>';
}

/**
 * Simple breadcrumbs.
 */
function chcs_breadcrumbs() {
	echo '<nav class="breadcrumbs" aria-label="' . esc_attr__( 'Breadcrumb', 'chcs-care' ) . '"><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'chcs-care' ) . '</a> / ';
	if ( is_singular( 'post' ) ) {
		$blog = get_option( 'page_for_posts' );
		if ( $blog ) {
			echo '<a href="' . esc_url( get_permalink( $blog ) ) . '">' . esc_html( get_the_title( $blog ) ) . '</a> / ';
		}
	}
	echo '<span aria-current="page">' . esc_html( wp_strip_all_tags( chcs_page_title() ) ) . '</span></nav>';
}

/** Title used in page hero across templates. */
function chcs_page_title() {
	if ( is_home() ) {
		$blog = get_option( 'page_for_posts' );
		return $blog ? get_the_title( $blog ) : __( 'News', 'chcs-care' );
	}
	if ( is_archive() ) {
		return get_the_archive_title();
	}
	if ( is_search() ) {
		/* translators: %s search query */
		return sprintf( __( 'Search results for “%s”', 'chcs-care' ), get_search_query() );
	}
	if ( is_404() ) {
		return __( 'Page not found', 'chcs-care' );
	}
	return get_the_title();
}

/**
 * LocalBusiness / MedicalOrganization structured data for SEO.
 */
function chcs_schema() {
	if ( ! is_front_page() ) {
		return;
	}
	$data = array(
		'@context'    => 'https://schema.org',
		'@type'       => array( 'MedicalBusiness', 'HomeHealthCareService' ),
		'name'        => chcs_opt( 'org_name' ),
		'url'         => home_url( '/' ),
		'telephone'   => chcs_opt( 'phone' ),
		'email'       => chcs_opt( 'email' ),
		'foundingDate' => chcs_opt( 'founded' ),
		'address'     => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => chcs_opt( 'street' ),
			'addressLocality' => chcs_opt( 'city' ),
			'addressRegion'   => chcs_opt( 'state' ),
			'postalCode'      => chcs_opt( 'zip' ),
			'addressCountry'  => 'US',
		),
		'areaServed'  => array_map(
			function ( $a ) {
				return array( '@type' => 'Place', 'name' => $a );
			},
			chcs_service_areas()
		),
	);
	$same_as = array_filter( array( chcs_opt( 'facebook' ), chcs_opt( 'instagram' ), chcs_opt( 'linkedin' ) ) );
	if ( $same_as ) {
		$data['sameAs'] = array_values( $same_as );
	}
	echo '<script type="application/ld+json">' . wp_json_encode( $data ) . '</script>' . "\n";
}
add_action( 'wp_head', 'chcs_schema' );
