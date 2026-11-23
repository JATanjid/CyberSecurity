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

define( 'CHCS_PORTAL_VERSION', '1.2.0' );
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
require CHCS_PORTAL_DIR . 'includes/rest-ops.php';
require CHCS_PORTAL_DIR . 'includes/rest-tasks.php';
require CHCS_PORTAL_DIR . 'includes/portal-page.php';

register_activation_hook( __FILE__, 'chcs_portal_activate' );
register_deactivation_hook(
	__FILE__,
	function () {
		wp_clear_scheduled_hook( 'chcs_daily' );
		flush_rewrite_rules();
	}
);

/**
 * Activation: tables, role, defaults, rewrite rules.
 */
function chcs_portal_activate() {
	chcs_store_install();
	add_role( 'chcs_staff', 'CHCS Portal User', array( 'read' => true ) );

	if ( ! get_option( 'chcs_designations' ) ) {
		$o        = array( 'clock', 'leave', 'calls', 'chat', 'calendar', 'tasks' );
		$defaults = array(
			array( 'Office Manager', 'office', array_merge( $o, array( 'approvals', 'intake', 'calendar_manage', 'tasks_manage', 'payroll', 'leave_manage', 'applications', 'news_manage', 'training_manage', 'forms' ) ) ),
			array( 'Intake Coordinator', 'office', array_merge( $o, array( 'intake', 'forms' ) ) ),
			array( 'Scheduler', 'office', array_merge( $o, array( 'intake', 'calendar_manage' ) ) ),
			array( 'Payroll Specialist', 'office', array_merge( $o, array( 'approvals', 'payroll' ) ) ),
			array( 'HR Coordinator', 'office', array_merge( $o, array( 'applications', 'training_manage', 'news_manage', 'leave_manage', 'tasks_manage' ) ) ),
			array( 'Nursing Supervisor', 'office', array_merge( $o, array( 'intake', 'approvals', 'training_manage', 'inservices', 'forms' ) ) ),
			array( 'PCA', 'field', array( 'chat', 'inservices', 'calendar', 'forms' ) ),
			array( 'HHA', 'field', array( 'chat', 'inservices', 'calendar', 'forms' ) ),
			array( 'LPN', 'field', array( 'chat', 'inservices', 'calendar', 'forms' ) ),
			array( 'RN', 'field', array( 'chat', 'inservices', 'calendar', 'forms' ) ),
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

/**
 * 1.1.0: visit notes were removed (field staff document visits in HHAeXchange);
 * office designations gain vacation/sick leave and the call dashboard.
 */
function chcs_portal_upgrade_110() {
	$list = chcs_designations();
	foreach ( $list as &$d ) {
		$d['permissions'] = array_values( array_diff( $d['permissions'], array( 'notes' ) ) );
		if ( 'office' === $d['type'] ) {
			$d['permissions'] = array_values( array_unique( array_merge( $d['permissions'], array( 'leave', 'calls' ) ) ) );
			if ( in_array( $d['name'], array( 'Office Manager', 'HR Coordinator' ), true ) ) {
				$d['permissions'][] = 'leave_manage';
			}
			if ( 'Nursing Supervisor' === $d['name'] ) {
				$d['permissions'][] = 'inservices';
			}
			$d['permissions'] = array_values( array_unique( $d['permissions'] ) );
		}
	}
	update_option( 'chcs_designations', $list, false );
	foreach ( chcs_portal_users() as $uid ) {
		$p = get_user_meta( $uid, 'chcs_permissions', true );
		if ( is_array( $p ) && in_array( 'notes', $p, true ) ) {
			update_user_meta( $uid, 'chcs_permissions', array_values( array_diff( $p, array( 'notes' ) ) ) );
		}
	}
}

/** 1.2.0: office designations gain the task calendar; managers can assign tasks. */
function chcs_portal_upgrade_120() {
	$list = chcs_designations();
	foreach ( $list as &$d ) {
		if ( 'office' === $d['type'] ) {
			$d['permissions'][] = 'tasks';
			if ( in_array( $d['name'], array( 'Office Manager', 'HR Coordinator' ), true ) ) {
				$d['permissions'][] = 'tasks_manage';
			}
			$d['permissions'] = array_values( array_unique( $d['permissions'] ) );
		}
	}
	unset( $d );
	update_option( 'chcs_designations', $list, false );
}

/* Run table upgrades when the plugin is updated without re-activation. */
add_action(
	'init',
	function () {
		$was = get_option( 'chcs_portal_db' );
		if ( $was !== CHCS_PORTAL_VERSION ) {
			chcs_store_install();
			if ( $was && version_compare( $was, '1.1.0', '<' ) ) {
				chcs_portal_upgrade_110();
			}
			if ( $was && version_compare( $was, '1.2.0', '<' ) ) {
				chcs_portal_upgrade_120();
			}
			update_option( 'chcs_portal_db', CHCS_PORTAL_VERSION ); // only after the upgrade finished.
		}
	},
	1 // after roles are loaded (get_users() needs them), before anything else uses the data.
);
