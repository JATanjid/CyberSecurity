<?php
/**
 * Users, permissions, route registration and small utilities.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** All grantable modules (keys must match app/js/core.js). */
function chcs_modules() {
	return array( 'clock', 'timesheet', 'approvals', 'payroll', 'leave', 'leave_manage', 'calls', 'chat', 'news_manage', 'intake', 'forms', 'calendar', 'calendar_manage', 'tasks', 'tasks_manage', 'inservices', 'orientation', 'training_manage', 'applications', 'users', 'settings', 'audit' );
}

/** Trainings inside the In-Service Training Center (app/forms/inservice-training.html): id => [title, minutes]. */
function chcs_center_trainings() {
	return array(
		'homecare'   => array( 'Home Care Overview', 60 ),
		'osha'       => array( 'OSHA Standards: Infection and Safety', 60 ),
		'disaster'   => array( 'Disaster and Emergency Preparedness', 45 ),
		'oxygen'     => array( 'Oxygen Safety', 30 ),
		'rnlpn'      => array( 'RN/LPN Training / Competency Checklist', 60 ),
		'violence'   => array( 'Workplace Violence Prevention & Safety', 45 ),
		'measles'    => array( 'Measles & Hantavirus Infection Control', 45 ),
		'lithium'    => array( 'Lithium Battery Safety & Fire Prevention', 30 ),
		'lgbtqia'    => array( 'LGBTQIA+ Cultural Competency Training', 45 ),
		'maid'       => array( 'Medical Aid in Dying Clinical Protocols', 45 ),
		'cyclo'      => array( 'Cyclosporiasis: Prevention, Identification, and Reporting', 30 ),
		'harassment' => array( 'Sexual Harassment Prevention Training', 60 ),
	);
}

/** In-app notification (bell + device notification). */
function chcs_notify( $uid, $kind, $title, $body = '', $link = '' ) {
	if ( ! $uid ) {
		return;
	}
	chcs_rec_insert( 'notifications', array( 'userId' => (int) $uid, 'kind' => $kind, 'title' => mb_substr( $title, 0, 200 ), 'body' => mb_substr( (string) $body, 0, 300 ), 'link' => $link, 'read' => false, 'status' => 'unread' ) );
}

/** Active portal users that have a permission. */
function chcs_users_with( $perm ) {
	return array_values( array_filter( chcs_portal_users( 'active' ), function ( $id ) use ( $perm ) { return chcs_can( $id, $perm ); } ) );
}

function chcs_designations() {
	$d = get_option( 'chcs_designations', array() );
	return is_array( $d ) ? $d : array();
}

/* ------------------------------------------------------------ user model */

function chcs_user_type( $uid ) {
	if ( user_can( $uid, 'manage_options' ) ) {
		return 'admin'; // WordPress administrators are always portal admins.
	}
	$t = get_user_meta( $uid, 'chcs_type', true );
	return $t ? $t : '';
}

function chcs_user_status( $uid ) {
	if ( user_can( $uid, 'manage_options' ) ) {
		return 'active';
	}
	$s = get_user_meta( $uid, 'chcs_status', true );
	return $s ? $s : '';
}

/** Is this WP user part of the portal at all? */
function chcs_is_portal_user( $uid ) {
	return $uid && ( user_can( $uid, 'manage_options' ) || '' !== get_user_meta( $uid, 'chcs_type', true ) );
}

function chcs_perms( $uid ) {
	if ( ! $uid ) {
		return array();
	}
	$type = chcs_user_type( $uid );
	if ( 'admin' === $type ) {
		return chcs_modules();
	}
	if ( 'applicant' === $type || 'active' !== chcs_user_status( $uid ) ) {
		return array();
	}
	$custom = get_user_meta( $uid, 'chcs_permissions', true );
	if ( is_array( $custom ) ) {
		return array_values( array_intersect( $custom, chcs_modules() ) );
	}
	$des = get_user_meta( $uid, 'chcs_designation', true );
	foreach ( chcs_designations() as $d ) {
		if ( $d['name'] === $des ) {
			return $d['permissions'];
		}
	}
	return array( 'chat' );
}

function chcs_can( $uid, $perm ) {
	return in_array( $perm, chcs_perms( $uid ), true );
}

function chcs_user_pub( $uid, $full = false ) {
	$u = get_userdata( $uid );
	if ( ! $u ) {
		return null;
	}
	$type = chcs_user_type( $uid );
	$o    = array(
		'id'          => (int) $uid,
		'name'        => $u->display_name,
		'type'        => $type,
		'designation' => 'admin' === $type ? ( get_user_meta( $uid, 'chcs_designation', true ) ?: 'Administrator' ) : (string) get_user_meta( $uid, 'chcs_designation', true ),
		'status'      => chcs_user_status( $uid ),
	);
	if ( $full ) {
		$o['email']             = $u->user_email;
		$o['phone']             = (string) get_user_meta( $uid, 'chcs_phone', true );
		$o['permissions']       = chcs_perms( $uid );
		$o['customPermissions'] = is_array( get_user_meta( $uid, 'chcs_permissions', true ) );
		$o['createdAt']         = mysql2date( 'c', $u->user_registered, false );
		$o['emailVerified']     = user_can( $uid, 'manage_options' ) || (bool) get_user_meta( $uid, 'chcs_email_verified', true );
		$o['schedule']          = chcs_user_schedule( $uid );
	}
	return $o;
}

function chcs_user_name( $uid ) {
	$u = get_userdata( $uid );
	return $u ? $u->display_name : '—';
}

/** All portal users (optionally filtered by status). */
function chcs_portal_users( $status = '' ) {
	$ids = get_users(
		array(
			'fields'     => 'ID',
			'meta_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery
				array(
					'key'     => 'chcs_type',
					'compare' => 'EXISTS',
				),
			),
		)
	);
	$admins = get_users(
		array(
			'fields'       => 'ID',
			'capability'   => 'manage_options',
		)
	);
	$ids = array_unique( array_map( 'intval', array_merge( $ids, $admins ) ) );
	if ( $status ) {
		$ids = array_values(
			array_filter(
				$ids,
				function ( $id ) use ( $status ) {
					return chcs_user_status( $id ) === $status;
				}
			)
		);
	}
	return $ids;
}

/* ------------------------------------------------------------ routes */

/**
 * Register a portal REST route.
 *
 * @param string          $methods GET|POST|PUT|PATCH|DELETE.
 * @param string          $path    Route, with (?P<id>\d+) placeholders.
 * @param null|string|array $need  null = public, 'user' = any signed-in portal user, string/array = permission(s) (any of).
 * @param callable        $cb      function( WP_REST_Request $req, int $me ).
 */
function chcs_route( $methods, $path, $need, $cb ) {
	register_rest_route(
		CHCS_PORTAL_NS,
		$path,
		array(
			'methods'             => $methods,
			'permission_callback' => function () use ( $need ) {
				if ( null === $need ) {
					return true;
				}
				$uid = get_current_user_id();
				if ( ! $uid || ! chcs_is_portal_user( $uid ) ) {
					return new WP_Error( 'chcs_auth', 'Please sign in.', array( 'status' => 401 ) );
				}
				$st = chcs_user_status( $uid );
				if ( in_array( $st, array( 'suspended', 'rejected', 'unverified' ), true ) ) {
					return new WP_Error( 'chcs_auth', 'Your account is not active.', array( 'status' => 403 ) );
				}
				if ( 'user' === $need ) {
					return true;
				}
				foreach ( (array) $need as $p ) {
					if ( chcs_can( $uid, $p ) ) {
						return true;
					}
				}
				return new WP_Error( 'chcs_forbidden', 'You do not have access to this section.', array( 'status' => 403 ) );
			},
			'callback'            => function ( WP_REST_Request $req ) use ( $cb ) {
				$res = call_user_func( $cb, $req, get_current_user_id() );
				return is_wp_error( $res ) ? $res : rest_ensure_response( $res );
			},
		)
	);
}

function chcs_err( $status, $message, $code = 'chcs_error' ) {
	return new WP_Error( $code, $message, array( 'status' => $status ) );
}

/* Send a fresh nonce with every portal response so long-open tabs keep working. */
add_filter(
	'rest_post_dispatch',
	function ( $res, $server, $req ) {
		if ( 0 === strpos( $req->get_route(), '/' . CHCS_PORTAL_NS ) && is_user_logged_in() && $res instanceof WP_HTTP_Response ) {
			$res->header( 'X-CHCS-Nonce', wp_create_nonce( 'wp_rest' ) );
		}
		return $res;
	},
	10,
	3
);

/* ------------------------------------------------------------ utilities */

function chcs_str( $v, $max = 500 ) {
	if ( is_array( $v ) || is_object( $v ) ) {
		return '';
	}
	return mb_substr( sanitize_text_field( (string) $v ), 0, $max );
}

function chcs_text( $v, $max = 4000 ) {
	if ( is_array( $v ) || is_object( $v ) ) {
		return '';
	}
	return mb_substr( sanitize_textarea_field( (string) $v ), 0, $max );
}

function chcs_today( $offset_days = 0 ) {
	return wp_date( 'Y-m-d', time() + $offset_days * DAY_IN_SECONDS );
}

function chcs_now_iso() {
	return gmdate( 'c' );
}

/** Monday of the week containing $date (Y-m-d). */
function chcs_week_start( $date ) {
	$d   = new DateTime( $date . ' 12:00:00', wp_timezone() );
	$dow = ( (int) $d->format( 'N' ) ) - 1;
	$d->modify( "-{$dow} days" );
	return $d->format( 'Y-m-d' );
}

/** Local date + HH:MM → ISO-8601 UTC. */
function chcs_local_to_iso( $date, $hm ) {
	$d = new DateTime( $date . ' ' . $hm . ':00', wp_timezone() );
	$d->setTimezone( new DateTimeZone( 'UTC' ) );
	return $d->format( 'c' );
}

function chcs_token() {
	return bin2hex( random_bytes( 20 ) );
}

function chcs_token_hash( $token ) {
	return hash_hmac( 'sha256', (string) $token, wp_salt( 'auth' ) );
}

function chcs_audit( $uid, $action, $detail = '' ) {
	chcs_rec_insert(
		'audit',
		array(
			'userId' => (int) $uid,
			'action' => $action,
			'detail' => mb_substr( (string) $detail, 0, 300 ),
			'ip'     => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
		)
	);
}

/** Simple rate limit: max $max hits per $window seconds per key. */
function chcs_rate_limited( $key, $max = 10, $window = 900 ) {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'x';
	$k  = 'chcs_rl_' . md5( $key . '|' . $ip );
	$n  = (int) get_transient( $k );
	if ( $n >= $max ) {
		return true;
	}
	set_transient( $k, $n + 1, $window );
	return false;
}

function chcs_portal_url( $hash = '' ) {
	return home_url( '/portal/' ) . ( $hash ? '#/' . ltrim( $hash, '#/' ) : '' );
}

/* Keep portal-only users out of wp-admin and hide the admin bar for them. */
add_action(
	'admin_init',
	function () {
		if ( wp_doing_ajax() || ! is_user_logged_in() ) {
			return;
		}
		$u = wp_get_current_user();
		if ( in_array( 'chcs_staff', (array) $u->roles, true ) && ! current_user_can( 'edit_posts' ) ) {
			wp_safe_redirect( chcs_portal_url() );
			exit;
		}
	}
);
add_filter(
	'show_admin_bar',
	function ( $show ) {
		$u = wp_get_current_user();
		return in_array( 'chcs_staff', (array) $u->roles, true ) && ! current_user_can( 'edit_posts' ) ? false : $show;
	}
);

/* ---------------------------------------------------------------- work schedules (office time approval) */

/** Office-wide default schedule and grace minutes. Days: 0 = Sunday … 6 = Saturday. */
function chcs_time_rules() {
	$r = get_option( 'chcs_time_rules' );
	$d = array(
		'days'  => array( 1, 2, 3, 4, 5 ),
		'start' => '09:00',
		'end'   => '17:00',
		'grace' => 15,
	);
	return is_array( $r ) ? array_merge( $d, $r ) : $d;
}

/** Validate a schedule from a request. Returns array or null. */
function chcs_schedule_input( $s, $with_grace = false ) {
	if ( ! is_array( $s ) ) {
		return null;
	}
	$days = array_values( array_unique( array_filter( array_map( 'intval', (array) ( $s['days'] ?? array() ) ), function ( $d ) { return $d >= 0 && $d <= 6; } ) ) );
	sort( $days );
	$st = (string) ( $s['start'] ?? '' );
	$en = (string) ( $s['end'] ?? '' );
	if ( ! preg_match( '/^\d{2}:\d{2}$/', $st ) || ! preg_match( '/^\d{2}:\d{2}$/', $en ) ) {
		return null;
	}
	$o = array( 'days' => $days, 'start' => $st, 'end' => $en );
	if ( $with_grace ) {
		$o['grace'] = max( 0, min( 120, (int) ( $s['grace'] ?? 15 ) ) );
	}
	return $o;
}

/** Personal schedule (array) or null when the person follows the office default. */
function chcs_user_schedule( $uid ) {
	$s = get_user_meta( $uid, 'chcs_schedule', true );
	return is_array( $s ) ? $s : null;
}

/** The hours someone is expected to work on a date: a calendar shift wins, then their schedule, then the office default. */
function chcs_schedule_for( $uid, $date ) {
	$shifts = chcs_rec_query( 'shifts', array( 'owner' => (int) $uid, 'from' => $date, 'to' => $date ), 20 );
	if ( $shifts ) {
		$st = min( wp_list_pluck( $shifts, 'start' ) );
		$en = max( wp_list_pluck( $shifts, 'end' ) );
		return array( 'start' => $st, 'end' => $en );
	}
	$r   = chcs_user_schedule( $uid );
	$r   = $r ? $r : chcs_time_rules();
	$dow = (int) gmdate( 'w', strtotime( $date . ' 12:00:00 UTC' ) );
	if ( ! in_array( $dow, array_map( 'intval', $r['days'] ), true ) ) {
		return null;
	}
	return array( 'start' => $r['start'], 'end' => $r['end'] );
}

function chcs_fmt_minutes( $m ) {
	$m = (int) round( $m );
	return $m >= 60 ? floor( $m / 60 ) . ' h' . ( $m % 60 ? ' ' . ( $m % 60 ) . ' min' : '' ) : $m . ' min';
}

function chcs_fmt_hm( $hm ) {
	list( $h, $i ) = array_map( 'intval', explode( ':', $hm ) );
	return ( ( $h % 12 ) ? $h % 12 : 12 ) . ':' . str_pad( (string) $i, 2, '0', STR_PAD_LEFT ) . ( $h < 12 ? ' AM' : ' PM' );
}

/** Why a finished clock entry falls outside the work schedule ('' when it is inside, so it can be approved automatically). */
function chcs_schedule_flag( $t ) {
	$sc = chcs_schedule_for( $t['userId'], $t['date'] );
	if ( ! $sc ) {
		return 'Not a scheduled work day';
	}
	$g  = (int) chcs_time_rules()['grace'] * 60;
	$s  = strtotime( chcs_local_to_iso( $t['date'], $sc['start'] ) );
	$e  = strtotime( chcs_local_to_iso( $t['date'], $sc['end'] ) );
	if ( $e <= $s ) {
		$e += DAY_IN_SECONDS;
	}
	$ts  = strtotime( $t['start'] );
	$te  = strtotime( $t['end'] );
	$out = array();
	if ( $ts < $s - $g ) {
		$out[] = 'Clocked in ' . chcs_fmt_minutes( ( $s - $ts ) / 60 ) . ' early (starts ' . chcs_fmt_hm( $sc['start'] ) . ')';
	}
	if ( $te > $e + $g ) {
		$out[] = 'Clocked out ' . chcs_fmt_minutes( ( $te - $e ) / 60 ) . ' late (ends ' . chcs_fmt_hm( $sc['end'] ) . ')';
	}
	return implode( ' · ', $out );
}
