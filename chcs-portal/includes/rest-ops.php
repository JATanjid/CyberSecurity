<?php
/**
 * Notifications & live updates, vacation / sick leave, and the call dashboard.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ------------------------------------------------------------ leave helpers */

function chcs_leave_types() {
	return array( 'vacation', 'sick', 'personal', 'bereavement', 'jury', 'unpaid', 'other' );
}

function chcs_leave_settings() {
	$s = get_option( 'chcs_leave_settings', array() );
	return array_merge( array( 'vacation' => 80, 'sick' => 40, 'personal' => 16, 'hoursPerDay' => 8 ), is_array( $s ) ? $s : array() );
}

/** Number of Monday–Friday days between two Y-m-d dates (inclusive). */
function chcs_workdays( $from, $to ) {
	$n = 0;
	$d = new DateTime( $from . ' 12:00:00' );
	$e = new DateTime( $to . ' 12:00:00' );
	while ( $d <= $e ) {
		if ( (int) $d->format( 'N' ) < 6 ) {
			$n++;
		}
		$d->modify( '+1 day' );
	}
	return $n;
}

function chcs_leave_allowance( $uid ) {
	$d = chcs_leave_settings();
	$a = get_user_meta( $uid, 'chcs_leave_allowance', true );
	$a = is_array( $a ) ? $a : array();
	return array(
		'vacation' => isset( $a['vacation'] ) ? (float) $a['vacation'] : (float) $d['vacation'],
		'sick'     => isset( $a['sick'] ) ? (float) $a['sick'] : (float) $d['sick'],
		'personal' => isset( $a['personal'] ) ? (float) $a['personal'] : (float) $d['personal'],
	);
}

function chcs_leave_balances( $uid ) {
	$yr      = substr( chcs_today(), 0, 4 );
	$al      = chcs_leave_allowance( $uid );
	$used    = array( 'vacation' => 0, 'sick' => 0, 'personal' => 0 );
	$pending = $used;
	foreach ( chcs_rec_query( 'leave', array( 'owner' => $uid, 'from' => $yr . '-01-01', 'to' => $yr . '-12-31' ) ) as $l ) {
		if ( ! isset( $used[ $l['type'] ] ) ) {
			continue;
		}
		if ( 'approved' === $l['status'] ) {
			$used[ $l['type'] ] += $l['totalHours'];
		} elseif ( 'pending' === $l['status'] ) {
			$pending[ $l['type'] ] += $l['totalHours'];
		}
	}
	$out = array();
	foreach ( $al as $k => $v ) {
		$out[] = array( 'type' => $k, 'allowed' => $v, 'used' => $used[ $k ], 'pending' => $pending[ $k ], 'left' => $v - $used[ $k ] );
	}
	return $out;
}

function chcs_decorate_leave( $l ) {
	$l['userName']      = chcs_user_name( $l['userId'] );
	$l['designation']   = (string) get_user_meta( $l['userId'], 'chcs_designation', true );
	$l['decidedByName'] = ! empty( $l['decidedBy'] ) ? chcs_user_name( $l['decidedBy'] ) : '';
	return $l;
}

/* ------------------------------------------------------------ call helpers */

function chcs_digits( $s ) {
	return substr( preg_replace( '/\D/', '', (string) $s ), -10 );
}

function chcs_decorate_call( $c ) {
	$c['takenByName']    = chcs_user_name( $c['takenBy'] );
	$c['assignedToName'] = ! empty( $c['assignedTo'] ) ? chcs_user_name( $c['assignedTo'] ) : '';
	$c['followUps']      = array_map(
		function ( $f ) {
			$f['userName'] = chcs_user_name( $f['userId'] );
			return $f;
		},
		(array) ( $c['followUps'] ?? array() )
	);
	return $c;
}

function chcs_call_assigned( $c, $by ) {
	$aid = (int) ( $c['assignedTo'] ?? 0 );
	if ( ! $aid || $aid === (int) $by ) {
		return;
	}
	$a      = get_userdata( $aid );
	$byname = chcs_user_name( $by );
	$urgent = 'urgent' === $c['priority'];
	chcs_notify( $aid, 'call', ( $urgent ? 'URGENT call for you: ' : 'Call for you: ' ) . $c['callerName'], ( $c['callerPhone'] ? $c['callerPhone'] . ' · ' : '' ) . mb_substr( $c['message'], 0, 140 ), '#/calls?id=' . $c['id'] );
	if ( $a ) {
		chcs_mail( 'call_assigned', $a->user_email, ( $urgent ? '[URGENT] ' : '' ) . 'Call for you from ' . $c['callerName'], "Hi {$a->display_name},\n\n{$byname} took a call for you.\n\nCaller: {$c['callerName']}" . ( $c['callerPhone'] ? "\nPhone: {$c['callerPhone']}" : '' ) . "\nAbout: {$c['reason']}\nMessage: {$c['message']}" . ( $c['callbackBy'] ? "\nPlease call back by: " . str_replace( 'T', ' ', $c['callbackBy'] ) : '' ) . "\n\nOpen it in the portal:\n" . chcs_portal_url( 'calls?id=' . $c['id'] ) );
	}
}

add_action(
	'rest_api_init',
	function () {

		/* ---------------- notifications & live updates */
		chcs_route(
			'GET',
			'/pulse',
			'user',
			function ( $req, $me ) {
				global $wpdb;
				$since     = (int) $req['since'];
				$msg_since = (int) $req['msgSince'];
				$new       = $since ? chcs_rec_query( 'notifications', array( 'owner' => $me, 'after_id' => $since ), 20 ) : array();
				$convs     = chcs_can( $me, 'chat' ) ? chcs_conversations_for( $me, true ) : array(); // also marks messages delivered.
				$msgs      = array();
				if ( $msg_since ) {
					foreach ( $convs as $c ) {
						foreach ( chcs_rec_query( 'messages', array( 'ref' => $c['id'], 'after_id' => $msg_since ), 5 ) as $m ) {
							if ( (int) $m['userId'] !== $me ) {
								$msgs[] = array( 'id' => $m['id'], 'convId' => $c['id'], 'title' => $c['title'], 'userName' => chcs_user_name( $m['userId'] ), 'body' => mb_substr( $m['body'], 0, 200 ) );
							}
						}
					}
				}
				$t = chcs_table();
				return array(
					'notifications'       => $new,
					'unreadNotifications' => count( chcs_rec_query( 'notifications', array( 'owner' => $me, 'status' => 'unread' ), 100 ) ),
					'unreadChat'          => array_sum( wp_list_pluck( $convs, 'unread' ) ),
					'messages'            => array_slice( $msgs, -10 ),
					'lastMsgId'           => (int) $wpdb->get_var( $wpdb->prepare( "SELECT MAX(id) FROM {$t} WHERE type = %s", 'messages' ) ), // phpcs:ignore
					'lastNotifId'         => (int) $wpdb->get_var( $wpdb->prepare( "SELECT MAX(id) FROM {$t} WHERE type = %s", 'notifications' ) ), // phpcs:ignore
				);
			}
		);
		chcs_route(
			'GET',
			'/notifications',
			'user',
			function ( $req, $me ) {
				return chcs_rec_query( 'notifications', array( 'owner' => $me ), 50 );
			}
		);
		chcs_route(
			'POST',
			'/notifications/read',
			'user',
			function ( $req, $me ) {
				$ids = array_map( 'intval', (array) $req['ids'] );
				foreach ( chcs_rec_query( 'notifications', array( 'owner' => $me, 'status' => 'unread' ), 500 ) as $n ) {
					if ( $req['all'] || in_array( $n['id'], $ids, true ) ) {
						chcs_rec_update( 'notifications', $n['id'], array( 'read' => true, 'status' => 'read' ) );
					}
				}
				return array( 'ok' => true );
			}
		);

		/* ---------------- vacation & sick leave */
		chcs_route(
			'GET',
			'/leave',
			'user',
			function ( $req, $me ) {
				$scope = (string) $req['scope'];
				$where = array();
				if ( 'all' === $scope ) {
					if ( ! chcs_can( $me, 'leave_manage' ) ) {
						return chcs_err( 403, 'No access.' );
					}
				} elseif ( 'calendar' === $scope ) {
					if ( ! chcs_can( $me, 'calendar_manage' ) && ! chcs_can( $me, 'leave_manage' ) ) {
						$where['owner'] = $me;
					}
				} else {
					if ( ! chcs_can( $me, 'leave' ) ) {
						return chcs_err( 403, 'No access.' );
					}
					$where['owner'] = $me;
				}
				if ( $req['status'] ) {
					$where['status'] = chcs_str( $req['status'], 20 );
				}
				$from = chcs_str( $req['from'], 10 );
				$to   = chcs_str( $req['to'], 10 );
				$out  = array();
				foreach ( chcs_rec_query( 'leave', $where, 2000 ) as $l ) {
					if ( ( $from && $l['to'] < $from ) || ( $to && $l['from'] > $to ) ) {
						continue;
					}
					if ( 'calendar' === $scope && ! ( 'approved' === $l['status'] || ( 'pending' === $l['status'] && (int) $l['userId'] === $me ) ) ) {
						continue;
					}
					$out[] = chcs_decorate_leave( $l );
				}
				usort( $out, function ( $a, $b ) { return strcmp( $b['from'], $a['from'] ); } );
				return $out;
			}
		);
		chcs_route(
			'GET',
			'/leave/balances',
			'user',
			function ( $req, $me ) {
				if ( '1' === (string) $req['all'] ) {
					if ( ! chcs_can( $me, 'leave_manage' ) ) {
						return chcs_err( 403, 'No access.' );
					}
					$out = array();
					foreach ( chcs_portal_users( 'active' ) as $uid ) {
						if ( in_array( chcs_user_type( $uid ), array( 'office', 'admin' ), true ) ) {
							$out[] = array( 'userId' => $uid, 'name' => chcs_user_name( $uid ), 'designation' => (string) get_user_meta( $uid, 'chcs_designation', true ), 'balances' => chcs_leave_balances( $uid ), 'allowance' => chcs_leave_allowance( $uid ) );
						}
					}
					return $out;
				}
				$uid = (int) $req['userId'];
				if ( $uid && $uid !== $me ) {
					return chcs_can( $me, 'leave_manage' ) ? chcs_leave_balances( $uid ) : chcs_err( 403, 'No access.' );
				}
				return chcs_leave_balances( $me );
			}
		);
		chcs_route(
			'POST',
			'/leave',
			'leave',
			function ( $req, $me ) {
				if ( 'field' === chcs_user_type( $me ) ) {
					return chcs_err( 403, 'Leave requests are for office staff.' );
				}
				$type = (string) $req['type'];
				$from = (string) $req['from'];
				$to   = $req['to'] ? (string) $req['to'] : $from;
				if ( ! in_array( $type, chcs_leave_types(), true ) ) {
					return chcs_err( 400, 'Choose a leave type.' );
				}
				if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) || ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
					return chcs_err( 400, 'Choose the dates.' );
				}
				if ( $to < $from ) {
					return chcs_err( 400, 'The end date is before the start date.' );
				}
				$days = chcs_workdays( $from, $to );
				if ( ! $days ) {
					return chcs_err( 400, 'Those dates are only weekend days.' );
				}
				$set = chcs_leave_settings();
				$hpd = $req['partial'] ? min( 8, max( 0.5, (float) $req['hours'] ) ) : (float) $set['hoursPerDay'];
				foreach ( chcs_rec_query( 'leave', array( 'owner' => $me, 'status' => array( 'pending', 'approved' ) ) ) as $l ) {
					if ( $l['from'] <= $to && $l['to'] >= $from ) {
						return chcs_err( 400, 'You already have leave requested for some of these days.' );
					}
				}
				$l    = chcs_rec_insert( 'leave', array( 'userId' => $me, 'type' => $type, 'from' => $from, 'to' => $to, 'partial' => (bool) $req['partial'], 'hoursPerDay' => $hpd, 'totalHours' => $days * $hpd, 'reason' => chcs_str( $req['reason'], 500 ), 'status' => 'pending' ) );
				$name = chcs_user_name( $me );
				foreach ( chcs_users_with( 'leave_manage' ) as $m ) {
					if ( $m === $me ) {
						continue;
					}
					chcs_notify( $m, 'leave', 'Leave request: ' . $name, "{$type} · {$from}" . ( $to !== $from ? " → {$to}" : '' ) . " ({$l['totalHours']}h)", '#/leave?tab=manage' );
					chcs_mail( 'leave_request', get_userdata( $m )->user_email, 'Leave request from ' . $name, "{$name} requested {$type} leave: {$from}" . ( $to !== $from ? " to {$to}" : '' ) . " ({$l['totalHours']} hours).\n\nReview it here:\n" . chcs_portal_url( 'leave?tab=manage' ) );
				}
				chcs_audit( $me, 'leave.request', "{$type} {$from}" );
				return chcs_decorate_leave( $l );
			}
		);
		chcs_route(
			'PATCH',
			'/leave/(?P<id>\d+)',
			'user',
			function ( $req, $me ) {
				$l = chcs_rec_get( 'leave', (int) $req['id'] );
				if ( ! $l ) {
					return chcs_err( 404, 'Not found.' );
				}
				$action = (string) $req['action'];
				if ( 'cancel' === $action ) {
					if ( (int) $l['userId'] !== $me || ! in_array( $l['status'], array( 'pending', 'approved' ), true ) ) {
						return chcs_err( 400, 'You can only cancel your own pending or approved leave.' );
					}
					if ( 'approved' === $l['status'] && $l['from'] <= chcs_today() ) {
						return chcs_err( 400, 'Leave that has started can only be changed by a manager.' );
					}
					return chcs_decorate_leave( chcs_rec_update( 'leave', $l['id'], array( 'status' => 'cancelled' ) ) );
				}
				if ( ! chcs_can( $me, 'leave_manage' ) ) {
					return chcs_err( 403, 'No access.' );
				}
				if ( (int) $l['userId'] === $me && 'admin' !== chcs_user_type( $me ) ) {
					return chcs_err( 400, 'Someone else has to approve your own leave.' );
				}
				if ( ! in_array( $action, array( 'approve', 'reject' ), true ) ) {
					return chcs_err( 400, 'Unknown action.' );
				}
				$status = 'approve' === $action ? 'approved' : 'rejected';
				$note   = chcs_str( $req['note'], 300 );
				$l      = chcs_rec_update( 'leave', $l['id'], array( 'status' => $status, 'decidedBy' => $me, 'decidedAt' => chcs_now_iso(), 'decisionNote' => $note ) );
				$dates  = $l['from'] . ( $l['to'] !== $l['from'] ? ' → ' . $l['to'] : '' );
				chcs_notify( $l['userId'], 'leave', "Leave {$status}: {$dates}", $note, '#/leave' );
				$u = get_userdata( $l['userId'] );
				if ( $u ) {
					chcs_mail( 'leave_decision', $u->user_email, 'Your leave request was ' . $status, "Hi {$u->display_name},\n\nYour {$l['type']} leave ({$dates}) was {$status}." . ( $note ? "\nNote: {$note}" : '' ) . "\n\n" . chcs_portal_url( 'leave' ) );
				}
				chcs_audit( $me, 'leave.' . $status, ( $u ? $u->user_email : '' ) . ' ' . $l['from'] );
				return chcs_decorate_leave( $l );
			}
		);
		chcs_route(
			'PUT',
			'/leave/allowance/(?P<id>\d+)',
			'leave_manage',
			function ( $req, $me ) {
				$uid = (int) $req['id'];
				if ( ! chcs_is_portal_user( $uid ) ) {
					return chcs_err( 404, 'Not found.' );
				}
				update_user_meta( $uid, 'chcs_leave_allowance', array( 'vacation' => max( 0, (float) $req['vacation'] ), 'sick' => max( 0, (float) $req['sick'] ), 'personal' => max( 0, (float) $req['personal'] ) ) );
				chcs_audit( $me, 'leave.allowance', get_userdata( $uid )->user_email );
				return array( 'ok' => true );
			}
		);

		/* ---------------- call dashboard */
		chcs_route(
			'GET',
			'/calls',
			'calls',
			function ( $req, $me ) {
				$f     = (string) $req['filter'];
				$where = array();
				if ( 'mine' === $f ) {
					$where = array( 'owner' => $me, 'status' => array( 'open', 'in_progress' ) );
				} elseif ( 'taken' === $f ) {
					$where = array( 'ref' => $me );
				} elseif ( 'open' === $f ) {
					$where = array( 'status' => array( 'open', 'in_progress' ) );
				} elseif ( 'today' === $f ) {
					$where = array( 'from' => wp_date( 'Y-m-d' ), 'to' => wp_date( 'Y-m-d' ) );
				}
				$term = strtolower( chcs_str( $req['q'], 80 ) );
				$out  = array();
				foreach ( chcs_rec_query( 'calls', $where, $term ? 2000 : 300 ) as $c ) {
					if ( $term && false === strpos( strtolower( $c['callerName'] . ' ' . $c['callerPhone'] . ' ' . $c['message'] . ' ' . $c['reason'] ), $term ) && ! ( chcs_digits( $term ) && false !== strpos( chcs_digits( $c['callerPhone'] ), chcs_digits( $term ) ) ) ) {
						continue;
					}
					$out[] = chcs_decorate_call( $c );
				}
				return array_slice( $out, 0, 300 );
			}
		);
		chcs_route(
			'GET',
			'/calls/stats',
			'calls',
			function ( $req, $me ) {
				$open = chcs_rec_query( 'calls', array( 'status' => array( 'open', 'in_progress' ) ), 2000 );
				$now  = wp_date( 'Y-m-d\TH:i' );
				return array(
					'today'   => count( chcs_rec_query( 'calls', array( 'from' => wp_date( 'Y-m-d' ), 'to' => wp_date( 'Y-m-d' ) ), 2000 ) ),
					'open'    => count( $open ),
					'mine'    => count( array_filter( $open, function ( $c ) use ( $me ) { return (int) $c['assignedTo'] === $me; } ) ),
					'overdue' => count( array_filter( $open, function ( $c ) use ( $now ) { return ! empty( $c['callbackBy'] ) && $c['callbackBy'] < $now; } ) ),
					'urgent'  => count( array_filter( $open, function ( $c ) { return 'urgent' === $c['priority']; } ) ),
				);
			}
		);
		chcs_route(
			'GET',
			'/calls/lookup',
			'calls',
			function ( $req ) {
				$dg = chcs_digits( $req['phone'] );
				if ( strlen( $dg ) < 7 ) {
					return array( 'calls' => 0 );
				}
				$prev = array_values( array_filter( chcs_rec_query( 'calls', array(), 2000 ), function ( $c ) use ( $dg ) { return chcs_digits( $c['callerPhone'] ) === $dg; } ) );
				$case = null;
				foreach ( chcs_rec_query( 'cases' ) as $c ) {
					if ( chcs_digits( $c['phone'] ) === $dg ) {
						$case = array( 'id' => $c['id'], 'name' => $c['patientName'], 'status' => $c['status'] );
						break;
					}
				}
				$emp = null;
				foreach ( chcs_portal_users() as $uid ) {
					if ( chcs_digits( get_user_meta( $uid, 'chcs_phone', true ) ) === $dg ) {
						$emp = array( 'id' => $uid, 'name' => chcs_user_name( $uid ), 'designation' => (string) get_user_meta( $uid, 'chcs_designation', true ) );
						break;
					}
				}
				return array( 'calls' => count( $prev ), 'last' => $prev ? chcs_decorate_call( $prev[0] ) : null, 'patient' => $case, 'employee' => $emp );
			}
		);
		chcs_route(
			'POST',
			'/calls',
			'calls',
			function ( $req, $me ) {
				$name  = chcs_str( $req['callerName'], 120 );
				$phone = chcs_str( $req['callerPhone'], 30 );
				$msg   = chcs_text( $req['message'], 2000 );
				if ( ! $name && ! $phone ) {
					return chcs_err( 400, "Enter the caller's name or phone number." );
				}
				if ( ! $msg ) {
					return chcs_err( 400, 'Write what the call was about.' );
				}
				$aid = (int) $req['assignedTo'];
				if ( $aid && 'active' !== chcs_user_status( $aid ) ) {
					return chcs_err( 400, 'Choose an active staff member.' );
				}
				$c = chcs_rec_insert(
					'calls',
					array(
						'takenBy'     => $me,
						'callerName'  => $name ? $name : 'Unknown caller',
						'callerPhone' => $phone,
						'callerType'  => chcs_str( $req['callerType'], 20 ) ?: 'other',
						'reason'      => chcs_str( $req['reason'], 60 ) ?: 'Other',
						'message'     => $msg,
						'assignedTo'  => $aid ? $aid : 0,
						'priority'    => 'urgent' === $req['priority'] ? 'urgent' : 'normal',
						'status'      => ( ! $aid && 'closed' === $req['status'] ) ? 'closed' : 'open',
						'callbackBy'  => preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', (string) $req['callbackBy'] ) ? $req['callbackBy'] : '',
						'duration'    => max( 0, (int) $req['duration'] ),
						'direction'   => 'outgoing' === $req['direction'] ? 'outgoing' : 'incoming',
						'followUps'   => array(),
						'day'         => wp_date( 'Y-m-d' ),
					)
				);
				chcs_call_assigned( $c, $me );
				chcs_audit( $me, 'calls.create', '#' . $c['id'] );
				return chcs_decorate_call( $c );
			}
		);
		chcs_route(
			'PATCH',
			'/calls/(?P<id>\d+)',
			'calls',
			function ( $req, $me ) {
				$c = chcs_rec_get( 'calls', (int) $req['id'] );
				if ( ! $c ) {
					return chcs_err( 404, 'Not found.' );
				}
				$before = (int) $c['assignedTo'];
				$ch     = array();
				if ( in_array( $req['status'], array( 'open', 'in_progress', 'returned', 'closed' ), true ) ) {
					$ch['status'] = $req['status'];
					if ( in_array( $req['status'], array( 'returned', 'closed' ), true ) ) {
						$ch['closedAt'] = chcs_now_iso();
					}
				}
				if ( $req['priority'] ) {
					$ch['priority'] = 'urgent' === $req['priority'] ? 'urgent' : 'normal';
				}
				if ( null !== $req['callbackBy'] ) {
					$ch['callbackBy'] = preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', (string) $req['callbackBy'] ) ? $req['callbackBy'] : '';
				}
				$params = (array) $req->get_json_params();
				if ( array_key_exists( 'assignedTo', $params ) ) {
					$aid              = (int) $params['assignedTo'];
					$ch['assignedTo'] = ( $aid && 'active' === chcs_user_status( $aid ) ) ? $aid : 0;
					if ( $ch['assignedTo'] && 'closed' === ( $ch['status'] ?? $c['status'] ) ) {
						$ch['status'] = 'open';
					}
				}
				$note = chcs_str( $req['note'], 1000 );
				if ( $note ) {
					$ch['followUps']   = (array) ( $c['followUps'] ?? array() );
					$ch['followUps'][] = array( 'userId' => $me, 'body' => $note, 'at' => chcs_now_iso() );
				}
				$c = chcs_rec_update( 'calls', $c['id'], $ch );
				if ( (int) $c['assignedTo'] && (int) $c['assignedTo'] !== $before ) {
					chcs_call_assigned( $c, $me );
				}
				if ( $note && (int) $c['takenBy'] !== $me && in_array( $c['status'], array( 'returned', 'closed' ), true ) ) {
					chcs_notify( $c['takenBy'], 'call', 'Call ' . $c['status'] . ': ' . $c['callerName'], chcs_user_name( $me ) . ': ' . mb_substr( $note, 0, 140 ), '#/calls?id=' . $c['id'] );
				}
				chcs_audit( $me, 'calls.update', '#' . $c['id'] . ' ' . $c['status'] );
				return chcs_decorate_call( $c );
			}
		);
	}
);
