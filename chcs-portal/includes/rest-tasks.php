<?php
/**
 * Office tasks & deadlines (task calendar, repeating weekly / monthly / quarterly / yearly),
 * daily reminder emails, and the website's social media links.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_task_next_due( $date, $repeat ) {
	$d   = new DateTime( $date . ' 12:00:00' );
	$day = (int) $d->format( 'j' );
	if ( 'weekly' === $repeat ) {
		$d->modify( '+7 days' );
		return $d->format( 'Y-m-d' );
	}
	$months = array( 'monthly' => 1, 'quarterly' => 3, 'yearly' => 12 );
	if ( ! isset( $months[ $repeat ] ) ) {
		return $date;
	}
	$d->modify( 'first day of this month' )->modify( '+' . $months[ $repeat ] . ' months' );
	$d->setDate( (int) $d->format( 'Y' ), (int) $d->format( 'n' ), min( $day, (int) $d->format( 't' ) ) ); // 31st → last day of shorter months.
	return $d->format( 'Y-m-d' );
}

function chcs_decorate_task( $t ) {
	$t['assignedToName']  = chcs_user_name( $t['assignedTo'] );
	$t['createdByName']   = chcs_user_name( $t['createdBy'] );
	$t['completedByName'] = ! empty( $t['completedBy'] ) ? chcs_user_name( $t['completedBy'] ) : '';
	$t['overdue']         = 'open' === $t['status'] && $t['dueDate'] < chcs_today();
	return $t;
}

function chcs_task_input( $b, $me ) {
	if ( ! chcs_str( $b['title'] ?? '' ) ) {
		return chcs_err( 400, 'Give the task a title.' );
	}
	if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) ( $b['dueDate'] ?? '' ) ) ) {
		return chcs_err( 400, 'Choose a due date.' );
	}
	$to = (int) ( $b['assignedTo'] ?? 0 ) ?: $me;
	if ( $to !== $me && ! chcs_can( $me, 'tasks_manage' ) ) {
		return chcs_err( 403, 'Only managers can assign tasks to other people.' );
	}
	if ( 'active' !== chcs_user_status( $to ) ) {
		return chcs_err( 400, 'Choose an active staff member.' );
	}
	$repeat = in_array( $b['repeat'] ?? '', array( 'none', 'weekly', 'monthly', 'quarterly', 'yearly' ), true ) ? $b['repeat'] : 'none';
	return array(
		'title'       => chcs_str( $b['title'], 160 ),
		'description' => chcs_text( $b['description'] ?? '', 2000 ),
		'category'    => chcs_str( $b['category'] ?? '', 60 ) ?: 'Administrative',
		'assignedTo'  => $to,
		'dueDate'     => $b['dueDate'],
		'dueTime'     => preg_match( '/^\d{2}:\d{2}$/', (string) ( $b['dueTime'] ?? '' ) ) ? $b['dueTime'] : '',
		'priority'    => 'high' === ( $b['priority'] ?? '' ) ? 'high' : 'normal',
		'repeat'      => $repeat,
	);
}

function chcs_task_assigned( $t, $by ) {
	if ( (int) $t['assignedTo'] === (int) $by ) {
		return;
	}
	$a = get_userdata( $t['assignedTo'] );
	chcs_notify( $t['assignedTo'], 'task', 'Task for you: ' . $t['title'], 'Due ' . $t['dueDate'] . ( 'none' !== $t['repeat'] ? ' · repeats ' . $t['repeat'] : '' ), '#/tasks?id=' . $t['id'] );
	if ( $a ) {
		chcs_mail( 'task_assigned', $a->user_email, 'New task: ' . $t['title'], "Hi {$a->display_name},\n\n" . chcs_user_name( $by ) . " assigned you a task.\n\nTask: {$t['title']}" . ( $t['description'] ? "\nDetails: {$t['description']}" : '' ) . "\nDue: {$t['dueDate']}" . ( 'none' !== $t['repeat'] ? "\nRepeats: {$t['repeat']}" : '' ) . "\n\n" . chcs_portal_url( 'tasks?id=' . $t['id'] ) );
	}
}

/* Daily reminder: tasks due tomorrow, today, or overdue (once per day per person). */
add_action( 'chcs_daily', 'chcs_task_reminders' );
function chcs_task_reminders() {
	$soon = wp_date( 'Y-m-d', time() + DAY_IN_SECONDS );
	$by   = array();
	foreach ( chcs_rec_query( 'tasks', array( 'status' => 'open', 'to' => $soon ), 5000 ) as $t ) {
		$by[ (int) $t['assignedTo'] ][] = $t;
	}
	foreach ( $by as $uid => $list ) {
		$u = get_userdata( $uid );
		if ( ! $u ) {
			continue;
		}
		$lines = array_map( function ( $t ) { return '• ' . $t['title'] . ' — due ' . $t['dueDate'] . ( $t['dueDate'] < chcs_today() ? ' (OVERDUE)' : '' ); }, $list );
		chcs_notify( $uid, 'task', count( $list ) . ' task' . ( count( $list ) > 1 ? 's' : '' ) . ' due soon or overdue', mb_substr( implode( '; ', wp_list_pluck( $list, 'title' ) ), 0, 200 ), '#/tasks' );
		chcs_mail( 'task_reminder', $u->user_email, 'Tasks due soon', "Hi {$u->display_name},\n\nThese tasks are due soon or overdue:\n\n" . implode( "\n", $lines ) . "\n\n" . chcs_portal_url( 'tasks' ) );
	}
}
add_action(
	'init',
	function () {
		if ( ! wp_next_scheduled( 'chcs_daily' ) ) {
			wp_schedule_event( strtotime( 'tomorrow 07:30', current_time( 'timestamp' ) ) - (int) ( get_option( 'gmt_offset' ) * HOUR_IN_SECONDS ), 'daily', 'chcs_daily' );
		}
	},
	20
);

/* ------------------------------------------------------------ social links */
function chcs_social_links() {
	$s = get_option( 'chcs_social', array() );
	return array_merge( array( 'facebook' => 'https://www.facebook.com/CHCSNY/', 'instagram' => 'https://www.instagram.com/chcsny/', 'youtube' => '', 'linkedin' => '' ), is_array( $s ) ? $s : array() );
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'GET',
			'/tasks',
			'tasks',
			function ( $req, $me ) {
				$f     = (string) $req['filter'];
				$where = array();
				if ( 'all' === $f ) {
					if ( ! chcs_can( $me, 'tasks_manage' ) ) {
						return chcs_err( 403, 'No access.' );
					}
					if ( $req['userId'] ) {
						$where['owner'] = (int) $req['userId'];
					}
				} elseif ( 'created' === $f ) {
					$where['ref'] = $me;
				} else {
					$where['owner'] = $me;
				}
				if ( $req['status'] ) {
					$where['status'] = chcs_str( $req['status'], 10 );
				}
				if ( $req['from'] ) {
					$where['from'] = chcs_str( $req['from'], 10 );
				}
				if ( $req['to'] ) {
					$where['to'] = chcs_str( $req['to'], 10 );
				}
				$list = array_map( 'chcs_decorate_task', chcs_rec_query( 'tasks', $where, 3000 ) );
				usort(
					$list,
					function ( $a, $b ) {
						$d = ( 'done' === $a['status'] ) - ( 'done' === $b['status'] );
						return $d ? $d : strcmp( $a['dueDate'] . $a['dueTime'], $b['dueDate'] . $b['dueTime'] );
					}
				);
				return $list;
			}
		);

		chcs_route(
			'POST',
			'/tasks',
			'tasks',
			function ( $req, $me ) {
				$in = chcs_task_input( (array) $req->get_json_params(), $me );
				if ( is_wp_error( $in ) ) {
					return $in;
				}
				$t = chcs_rec_insert( 'tasks', array_merge( $in, array( 'createdBy' => $me, 'status' => 'open' ) ) );
				chcs_task_assigned( $t, $me );
				chcs_audit( $me, 'tasks.create', $t['title'] );
				return chcs_decorate_task( $t );
			}
		);

		chcs_route(
			'PATCH',
			'/tasks/(?P<id>\d+)',
			'tasks',
			function ( $req, $me ) {
				$t = chcs_rec_get( 'tasks', (int) $req['id'] );
				if ( ! $t ) {
					return chcs_err( 404, 'Not found.' );
				}
				if ( (int) $t['assignedTo'] !== $me && (int) $t['createdBy'] !== $me && ! chcs_can( $me, 'tasks_manage' ) ) {
					return chcs_err( 403, 'No access.' );
				}
				$b    = (array) $req->get_json_params();
				$next = null;
				if ( 'done' === ( $b['status'] ?? '' ) && 'done' !== $t['status'] ) {
					$t = chcs_rec_update( 'tasks', $t['id'], array( 'status' => 'done', 'completedAt' => chcs_now_iso(), 'completedBy' => $me, 'completionNote' => chcs_str( $b['note'] ?? '', 500 ) ) );
					if ( 'none' !== $t['repeat'] ) {
						$next = chcs_rec_insert( 'tasks', array( 'title' => $t['title'], 'description' => $t['description'], 'category' => $t['category'], 'assignedTo' => $t['assignedTo'], 'createdBy' => $t['createdBy'], 'dueDate' => chcs_task_next_due( $t['dueDate'], $t['repeat'] ), 'dueTime' => $t['dueTime'], 'priority' => $t['priority'], 'repeat' => $t['repeat'], 'status' => 'open', 'seriesId' => ! empty( $t['seriesId'] ) ? $t['seriesId'] : $t['id'] ) );
					}
					if ( (int) $t['createdBy'] !== $me ) {
						chcs_notify( $t['createdBy'], 'task', 'Task done: ' . $t['title'], chcs_user_name( $me ), '#/tasks?filter=created' );
					}
				} elseif ( 'open' === ( $b['status'] ?? '' ) && 'done' === $t['status'] ) {
					$t = chcs_rec_update( 'tasks', $t['id'], array( 'status' => 'open', 'completedAt' => null ) );
				} elseif ( isset( $b['title'] ) || isset( $b['dueDate'] ) || isset( $b['assignedTo'] ) ) {
					$in = chcs_task_input( array_merge( $t, $b ), $me );
					if ( is_wp_error( $in ) ) {
						return $in;
					}
					$before = (int) $t['assignedTo'];
					$t      = chcs_rec_update( 'tasks', $t['id'], $in );
					if ( (int) $t['assignedTo'] !== $before ) {
						chcs_task_assigned( $t, $me );
					}
				}
				chcs_audit( $me, 'tasks.update', $t['title'] . ' ' . $t['status'] );
				$out = chcs_decorate_task( $t );
				if ( $next ) {
					$out['next'] = chcs_decorate_task( $next );
				}
				return $out;
			}
		);

		chcs_route(
			'DELETE',
			'/tasks/(?P<id>\d+)',
			'tasks',
			function ( $req, $me ) {
				$t = chcs_rec_get( 'tasks', (int) $req['id'] );
				if ( ! $t ) {
					return chcs_err( 404, 'Not found.' );
				}
				if ( (int) $t['createdBy'] !== $me && ! chcs_can( $me, 'tasks_manage' ) ) {
					return chcs_err( 403, 'Only the person who created it (or a manager) can delete it.' );
				}
				chcs_rec_delete( 'tasks', $t['id'] );
				chcs_audit( $me, 'tasks.delete', $t['title'] );
				return array( 'ok' => true );
			}
		);

		/* ---- social links (public read, used by the website and portal) */
		chcs_route(
			'GET',
			'/settings/social',
			null,
			function () {
				return chcs_social_links();
			}
		);
		chcs_route(
			'PUT',
			'/settings/social',
			array( 'settings', 'news_manage' ),
			function ( $req, $me ) {
				$out = array();
				foreach ( array( 'facebook', 'instagram', 'youtube', 'linkedin' ) as $k ) {
					$v = trim( (string) $req[ $k ] );
					if ( $v && ! preg_match( '~^https://~i', $v ) ) {
						return chcs_err( 400, 'Links must start with https://' );
					}
					$out[ $k ] = $v ? esc_url_raw( $v ) : '';
				}
				update_option( 'chcs_social', $out );
				chcs_audit( $me, 'settings.social' );
				return $out;
			}
		);
	}
);
