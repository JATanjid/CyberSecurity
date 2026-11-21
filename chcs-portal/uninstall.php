<?php
/**
 * Uninstall. Portal data (users, time, cases, messages…) is KEPT by default, because
 * home care records must be retained. To erase everything, add this to wp-config.php
 * before deleting the plugin:  define( 'CHCS_PORTAL_DELETE_DATA', true );
 *
 * @package chcs-portal
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
if ( defined( 'CHCS_PORTAL_DELETE_DATA' ) && CHCS_PORTAL_DELETE_DATA ) {
	global $wpdb;
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}chcs_records" ); // phpcs:ignore
	foreach ( array( 'chcs_designations', 'chcs_email_settings', 'chcs_portal_db' ) as $o ) {
		delete_option( $o );
	}
	remove_role( 'chcs_staff' );
}
