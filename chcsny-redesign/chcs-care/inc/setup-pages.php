<?php
/**
 * One-time setup on theme activation:
 *  - creates the core pages (only if a page with that slug doesn't exist),
 *  - sets a static front page + News page for posts,
 *  - builds and assigns a Primary menu.
 * Existing pages and menus are never overwritten.
 *
 * @package chcs-care
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_core_pages() {
	return array(
		'home'          => array( __( 'Home', 'chcs-care' ), '' ),
		'about-us'      => array( __( 'About Us', 'chcs-care' ), '<p>' . __( 'Complete Home Care Services, Inc. (CHCS) is a licensed home health care agency founded in 1993. Edit this page in the WordPress editor to tell your story — the designed sections around it are added by the theme automatically.', 'chcs-care' ) . '</p>' ),
		'services'      => array( __( 'Services', 'chcs-care' ), '' ),
		'family-portal' => array( __( 'Patients & Families', 'chcs-care' ), '' ),
		'referrals'     => array( __( 'Referrals', 'chcs-care' ), '' ),
		'careers'       => array( __( 'Careers', 'chcs-care' ), '<h2>' . __( 'Current openings', 'chcs-care' ) . '</h2><ul><li>' . __( 'Registered Nurse (RN) — Field', 'chcs-care' ) . '</li><li>' . __( 'Licensed Practical Nurse (LPN)', 'chcs-care' ) . '</li><li>' . __( 'Physical Therapist (PT)', 'chcs-care' ) . '</li><li>' . __( 'Occupational Therapist (OT)', 'chcs-care' ) . '</li></ul><p>' . __( 'Edit this list in the page editor as positions open and close.', 'chcs-care' ) . '</p>' ),
		'news-blog'     => array( __( 'News', 'chcs-care' ), '' ),
		'contact-us'    => array( __( 'Contact Us', 'chcs-care' ), '' ),
		'privacy-policy-notice' => array( __( 'Notice of Privacy Practices', 'chcs-care' ), '<p>' . __( 'Paste your HIPAA Notice of Privacy Practices here.', 'chcs-care' ) . '</p>' ),
		'non-discrimination'    => array( __( 'Non-Discrimination Notice', 'chcs-care' ), '<p>' . __( 'Paste your Section 1557 non-discrimination notice and language assistance taglines here.', 'chcs-care' ) . '</p>' ),
	);
}

function chcs_after_switch_theme() {
	if ( get_option( 'chcs_setup_done' ) ) {
		return;
	}

	$ids = array();
	foreach ( chcs_core_pages() as $slug => $page ) {
		$existing = get_page_by_path( $slug );
		if ( $existing ) {
			$ids[ $slug ] = $existing->ID;
			continue;
		}
		$ids[ $slug ] = wp_insert_post(
			array(
				'post_title'   => $page[0],
				'post_name'    => $slug,
				'post_content' => $page[1],
				'post_status'  => 'publish',
				'post_type'    => 'page',
			)
		);
	}

	// Static front page + posts page (only if site still shows latest posts).
	if ( 'posts' === get_option( 'show_on_front' ) && ! empty( $ids['home'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $ids['home'] );
		if ( ! empty( $ids['news-blog'] ) ) {
			update_option( 'page_for_posts', $ids['news-blog'] );
		}
	}

	// Primary menu.
	$locations = get_theme_mod( 'nav_menu_locations', array() );
	if ( empty( $locations['primary'] ) && ! wp_get_nav_menu_object( 'CHCS Primary' ) ) {
		$menu_id = wp_create_nav_menu( 'CHCS Primary' );
		if ( ! is_wp_error( $menu_id ) ) {
			$order = array( 'about-us', 'services', 'family-portal', 'referrals', 'careers', 'news-blog', 'contact-us' );
			foreach ( $order as $i => $slug ) {
				if ( empty( $ids[ $slug ] ) ) {
					continue;
				}
				wp_update_nav_menu_item(
					$menu_id,
					0,
					array(
						'menu-item-object-id' => $ids[ $slug ],
						'menu-item-object'    => 'page',
						'menu-item-type'      => 'post_type',
						'menu-item-status'    => 'publish',
						'menu-item-position'  => $i + 1,
					)
				);
			}
			$locations['primary'] = $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
		}
	}

	update_option( 'chcs_setup_done', 1 );
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'chcs_after_switch_theme' );
