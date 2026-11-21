<?php
/**
 * Chat (office ↔ office, field ↔ office) and schedules.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** People this user may message. Field staff can message the office only. */
function chcs_chat_directory( $me ) {
	$field = 'field' === chcs_user_type( $me );
	$out   = array();
	foreach ( chcs_portal_users( 'active' ) as $id ) {
		$t = chcs_user_type( $id );
		if ( $id === $me || 'applicant' === $t ) {
			continue;
		}
		if ( $field && ! in_array( $t, array( 'office', 'admin' ), true ) ) {
			continue;
		}
		$out[] = $id;
	}
	return $out;
}

function chcs_conversations_for( $me ) {
	$out = array();
	foreach ( chcs_rec_query( 'conversations' ) as $c ) {
		$members = array_map( 'intval', (array) $c['members'] );
		if ( ! in_array( $me, $members, true ) ) {
			continue;
		}
		$last      = chcs_rec_query( 'messages', array( 'ref' => $c['id'] ), 1 );
		$last_read = (int) ( $c['reads'][ $me ] ?? 0 );
		$unread    = 0;
		foreach ( chcs_rec_query( 'messages', array( 'ref' => $c['id'], 'after_id' => $last_read ), 100 ) as $m ) {
			if ( (int) $m['userId'] !== $me ) {
				$unread++;
			}
		}
		$others = array_values( array_diff( $members, array( $me ) ) );
		$title  = 'group' === $c['type'] ? $c['name'] : implode( ', ', array_map( 'chcs_user_name', $others ) );
		$out[]  = array(
			'id'          => $c['id'],
			'type'        => $c['type'],
			'title'       => $title ? $title : 'Me',
			'subtitle'    => 'direct' === $c['type'] && $others ? (string) get_user_meta( $others[0], 'chcs_designation', true ) : count( $members ) . ' members',
			'members'     => $members,
			'lastMessage' => $last ? array( 'body' => $last[0]['body'], 'at' => $last[0]['createdAt'], 'userId' => $last[0]['userId'] ) : null,
			'unread'      => $unread,
		);
	}
	usort(
		$out,
		function ( $a, $b ) {
			return strcmp( $b['lastMessage']['at'] ?? '', $a['lastMessage']['at'] ?? '' );
		}
	);
	return $out;
}

function chcs_decorate_shift( $s ) {
	$s['userName']    = chcs_user_name( $s['userId'] );
	$s['designation'] = (string) get_user_meta( $s['userId'], 'chcs_designation', true );
	return $s;
}

function chcs_shift_input( $b ) {
	if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) ( $b['date'] ?? '' ) ) || ! preg_match( '/^\d{2}:\d{2}$/', (string) ( $b['start'] ?? '' ) ) || ! preg_match( '/^\d{2}:\d{2}$/', (string) ( $b['end'] ?? '' ) ) ) {
		return chcs_err( 400, 'Enter a date, start and end time.' );
	}
	if ( ! chcs_is_portal_user( (int) ( $b['userId'] ?? 0 ) ) ) {
		return chcs_err( 400, 'Choose an employee.' );
	}
	return array(
		'userId'   => (int) $b['userId'],
		'date'     => $b['date'],
		'start'    => $b['start'],
		'end'      => $b['end'],
		'title'    => chcs_str( $b['title'] ?? '', 120 ) ?: 'Shift',
		'location' => chcs_str( $b['location'] ?? '', 120 ),
		'notes'    => chcs_str( $b['notes'] ?? '', 500 ),
	);
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'GET',
			'/chat/directory',
			'chat',
			function ( $req, $me ) {
				return array_map( 'chcs_user_pub', chcs_chat_directory( $me ) );
			}
		);

		chcs_route(
			'GET',
			'/chat/conversations',
			'chat',
			function ( $req, $me ) {
				return chcs_conversations_for( $me );
			}
		);

		chcs_route(
			'POST',
			'/chat/conversations',
			'chat',
			function ( $req, $me ) {
				$allowed = chcs_chat_directory( $me );
				$members = array_values( array_intersect( array_map( 'intval', (array) $req['userIds'] ), $allowed ) );
				if ( ! $members ) {
					return chcs_err( 400, 'Choose who to message.' );
				}
				if ( 1 === count( $members ) && ! $req['name'] ) {
					foreach ( chcs_rec_query( 'conversations' ) as $c ) {
						$m = array_map( 'intval', (array) $c['members'] );
						if ( 'direct' === $c['type'] && 2 === count( $m ) && in_array( $me, $m, true ) && in_array( $members[0], $m, true ) ) {
							return array( 'id' => $c['id'] );
						}
					}
					$c = chcs_rec_insert( 'conversations', array( 'type' => 'direct', 'name' => null, 'members' => array( $me, $members[0] ), 'reads' => new stdClass() ) );
					return array( 'id' => $c['id'] );
				}
				if ( 'field' === chcs_user_type( $me ) ) {
					return chcs_err( 403, 'Group chats are created by the office.' );
				}
				$c = chcs_rec_insert( 'conversations', array( 'type' => 'group', 'name' => chcs_str( $req['name'], 80 ) ?: 'Group', 'members' => array_merge( array( $me ), $members ), 'reads' => new stdClass() ) );
				return array( 'id' => $c['id'] );
			}
		);

		chcs_route(
			'GET',
			'/chat/conversations/(?P<id>\d+)/messages',
			'chat',
			function ( $req, $me ) {
				$c = chcs_rec_get( 'conversations', (int) $req['id'] );
				if ( ! $c || ! in_array( $me, array_map( 'intval', (array) $c['members'] ), true ) ) {
					return chcs_err( 404, 'Conversation not found.' );
				}
				$msgs = chcs_rec_query( 'messages', array( 'ref' => $c['id'], 'after_id' => (int) $req['after'] ), 200, 'ASC' );
				foreach ( $msgs as &$m ) {
					$m['userName'] = chcs_user_name( $m['userId'] );
				}
				if ( $msgs ) {
					$reads        = (array) ( $c['reads'] ?? array() );
					$reads[ $me ] = end( $msgs )['id'];
					chcs_rec_update( 'conversations', $c['id'], array( 'reads' => $reads ) );
				}
				return $msgs;
			}
		);

		chcs_route(
			'POST',
			'/chat/conversations/(?P<id>\d+)/messages',
			'chat',
			function ( $req, $me ) {
				$c = chcs_rec_get( 'conversations', (int) $req['id'] );
				if ( ! $c || ! in_array( $me, array_map( 'intval', (array) $c['members'] ), true ) ) {
					return chcs_err( 404, 'Conversation not found.' );
				}
				$body = chcs_text( $req['body'], 4000 );
				if ( ! $body ) {
					return chcs_err( 400, 'Message is empty.' );
				}
				$m            = chcs_rec_insert( 'messages', array( 'convId' => $c['id'], 'userId' => $me, 'body' => $body ) );
				$reads        = (array) ( $c['reads'] ?? array() );
				$reads[ $me ] = $m['id'];
				chcs_rec_update( 'conversations', $c['id'], array( 'reads' => $reads, 'lastMessageAt' => $m['createdAt'] ) );
				$m['userName'] = chcs_user_name( $me );
				return $m;
			}
		);

		/* ---- schedules */
		chcs_route(
			'GET',
			'/shifts',
			array( 'calendar', 'calendar_manage' ),
			function ( $req, $me ) {
				$where = array();
				if ( 'all' !== $req['scope'] || ! chcs_can( $me, 'calendar_manage' ) ) {
					$where['owner'] = $me;
				} elseif ( $req['userId'] ) {
					$where['owner'] = (int) $req['userId'];
				}
				if ( $req['from'] ) {
					$where['from'] = chcs_str( $req['from'], 10 );
				}
				if ( $req['to'] ) {
					$where['to'] = chcs_str( $req['to'], 10 );
				}
				$list = chcs_rec_query( 'shifts', $where, 3000 );
				usort(
					$list,
					function ( $a, $b ) {
						return strcmp( $a['date'] . $a['start'], $b['date'] . $b['start'] );
					}
				);
				return array_map( 'chcs_decorate_shift', $list );
			}
		);

		chcs_route(
			'POST',
			'/shifts',
			'calendar_manage',
			function ( $req, $me ) {
				$s0 = chcs_shift_input( $req->get_json_params() );
				if ( is_wp_error( $s0 ) ) {
					return $s0;
				}
				$dates = array( $s0['date'] );
				$n     = min( 12, (int) $req['repeatWeeks'] );
				for ( $i = 1; $i <= $n; $i++ ) {
					$d       = new DateTime( $s0['date'] . ' 12:00:00', wp_timezone() );
					$dates[] = $d->modify( '+' . ( 7 * $i ) . ' days' )->format( 'Y-m-d' );
				}
				$out = array();
				foreach ( $dates as $d ) {
					$out[] = chcs_decorate_shift( chcs_rec_insert( 'shifts', array_merge( $s0, array( 'date' => $d, 'createdBy' => $me ) ) ) );
				}
				$u = get_userdata( $s0['userId'] );
				chcs_mail( 'shift_assigned', $u->user_email, 'New shift scheduled', "Hi {$u->display_name},\n\nYou have " . count( $out ) . " new shift(s) starting {$s0['date']} {$s0['start']}–{$s0['end']} ({$s0['title']}).\n\n" . chcs_portal_url( 'calendar' ) );
				chcs_audit( $me, 'shifts.create', count( $out ) . ' for ' . $u->user_email );
				return $out;
			}
		);

		chcs_route(
			'PATCH',
			'/shifts/(?P<id>\d+)',
			'calendar_manage',
			function ( $req, $me ) {
				$s = chcs_rec_get( 'shifts', (int) $req['id'] );
				if ( ! $s ) {
					return chcs_err( 404, 'Not found.' );
				}
				$in = chcs_shift_input( array_merge( $s, (array) $req->get_json_params() ) );
				if ( is_wp_error( $in ) ) {
					return $in;
				}
				chcs_audit( $me, 'shifts.update', '#' . $s['id'] );
				return chcs_decorate_shift( chcs_rec_update( 'shifts', $s['id'], $in ) );
			}
		);

		chcs_route(
			'DELETE',
			'/shifts/(?P<id>\d+)',
			'calendar_manage',
			function ( $req, $me ) {
				if ( ! chcs_rec_delete( 'shifts', (int) $req['id'] ) ) {
					return chcs_err( 404, 'Not found.' );
				}
				chcs_audit( $me, 'shifts.delete', '#' . (int) $req['id'] );
				return array( 'ok' => true );
			}
		);
	}
);
