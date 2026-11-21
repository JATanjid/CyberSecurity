<?php
/**
 * Plugin Name: CHCS Staff Portal
 * Plugin URI:  https://chcsny.com/portal/
 * Description: Staff & employee portal for Complete Home Care Services: sign-up with email verification, admin approvals, designations & permissions, time clock, timesheets, payroll Excel export, intake & case management, visit notes, chat, schedules, in-services, orientation, job applications, news & posts, and Resend email integration. Installable on phones as an app (PWA) at /portal/.
 * Version:     1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author:      CHCS Web Team
 * License:     GPL-2.0-or-later
 * Text Domain: chcs-portal
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CHCS_PORTAL_VERSION', '1.0.0' );
define( 'CHCS_PORTAL_FILE', __FILE__ );
define( 'CHCS_PORTAL_DIR', plugin_dir_path( __FILE__ ) );
define( 'CHCS_PORTAL_URL', plugin_dir_url( __FILE__ ) );
define( 'CHCS_PORTAL_NS', 'chcs/v1' );

require CHCS_PORTAL_DIR . 'includes/store.php';
require CHCS_PORTAL_DIR . 'includes/helpers.php';
require CHCS_PORTAL_DIR . 'includes/mailer.php';
require CHCS_PORTAL_DIR . 'includes/rest-auth.php';
require CHCS_PORTAL_DIR . 'includes/rest-admin.php';
require CHCS_PORTAL_DIR . 'includes/rest-time.php';
require CHCS_PORTAL_DIR . 'includes/rest-care.php';
require CHCS_PORTAL_DIR . 'includes/rest-team.php';
require CHCS_PORTAL_DIR . 'includes/rest-training.php';
require CHCS_PORTAL_DIR . 'includes/rest-content.php';
require CHCS_PORTAL_DIR . 'includes/portal-page.php';

register_activation_hook( __FILE__, 'chcs_portal_activate' );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );

/**
 * Activation: tables, role, defaults, rewrite rules.
 */
function chcs_portal_activate() {
	chcs_store_install();
	add_role( 'chcs_staff', 'CHCS Portal User', array( 'read' => true ) );

	if ( ! get_option( 'chcs_designations' ) ) {
		$defaults = array(
			array( 'Office Manager', 'office', array( 'clock', 'approvals', 'intake', 'chat', 'calendar', 'calendar_manage', 'payroll', 'applications', 'news_manage', 'training_manage', 'forms' ) ),
			array( 'Intake Coordinator', 'office', array( 'clock', 'intake', 'chat', 'calendar', 'forms' ) ),
			array( 'Scheduler', 'office', array( 'clock', 'intake', 'chat', 'calendar', 'calendar_manage' ) ),
			array( 'Payroll Specialist', 'office', array( 'clock', 'approvals', 'payroll', 'chat', 'calendar' ) ),
			array( 'HR Coordinator', 'office', array( 'clock', 'applications', 'training_manage', 'news_manage', 'chat', 'calendar' ) ),
			array( 'Nursing Supervisor', 'office', array( 'clock', 'intake', 'notes', 'approvals', 'chat', 'calendar', 'training_manage', 'forms' ) ),
			array( 'PCA', 'field', array( 'chat', 'inservices', 'notes', 'calendar', 'forms' ) ),
			array( 'HHA', 'field', array( 'chat', 'inservices', 'notes', 'calendar', 'forms' ) ),
			array( 'LPN', 'field', array( 'chat', 'inservices', 'notes', 'calendar', 'forms' ) ),
			array( 'RN', 'field', array( 'chat', 'inservices', 'notes', 'calendar', 'forms' ) ),
		);
		$list = array();
		foreach ( $defaults as $i => $d ) {
			$list[] = array( 'id' => $i + 1, 'name' => $d[0], 'type' => $d[1], 'permissions' => $d[2] );
		}
		update_option( 'chcs_designations', $list, false );
	}

	if ( ! get_option( 'chcs_email_settings' ) ) {
		update_option( 'chcs_email_settings', chcs_email_defaults(), false );
	}

	if ( ! chcs_rec_query( 'orientationModules', array(), 1 ) ) {
		$titles = array( 'Welcome to Complete Home Care Services', 'Patient Rights & Responsibilities', 'Infection Control', 'Emergency Preparedness', 'Abuse, Neglect & Incident Reporting', 'Compliance & Code of Conduct' );
		foreach ( $titles as $i => $t ) {
			chcs_rec_insert( 'orientationModules', array( 'title' => $t, 'order' => $i + 1, 'body' => $t . ' — replace this text with your orientation content in Portal → Training setup → Orientation.' ) );
		}
	}

	chcs_portal_rewrite_rules();
	flush_rewrite_rules();
}

/* Run table upgrades when the plugin is updated without re-activation. */
add_action(
	'plugins_loaded',
	function () {
		if ( get_option( 'chcs_portal_db' ) !== CHCS_PORTAL_VERSION ) {
			chcs_store_install();
		}
	}
);
