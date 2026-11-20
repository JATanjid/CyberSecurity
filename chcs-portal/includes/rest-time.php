<?php
/**
 * Time clock, timesheets, approvals and payroll.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_decorate_time( $t ) {
	$t['userName']    = chcs_user_name( $t['userId'] );
	$t['designation'] = (string) get_user_meta( $t['userId'], 'chcs_designation', true );
	$t['patientName'] = '';
	if ( ! empty( $t['caseId'] ) ) {
		$c = chcs_rec_get( 'cases', $t['caseId'] );
		$t['patientName'] = $c ? $c['patientName'] : '';
	}
	return $t;
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'GET',
			'/time/entries',
			'user',
			function ( $req, $me ) {
				$where = array();
				if ( 'all' === $req['scope'] ) {
					if ( ! chcs_can( $me, 'approvals' ) && ! chcs_can( $me, 'payroll' ) ) {
						return chcs_err( 403, 'No access.' );
					}
					if ( $req['userId'] ) {
						$where['owner'] = (int) $req['userId'];
					}
				} else {
					$where['owner'] = $me;
				}
				if ( $req['from'] ) {
					$where['from'] = chcs_str( $req['from'], 10 );
				}
				if ( $req['to'] ) {
					$where['to'] = chcs_str( $req['to'], 10 );
				}
				if ( $req['status'] ) {
					$where['status'] = chcs_str( $req['status'], 20 );
				}
				$list = chcs_rec_query( 'time', $where, 2000 );
				usort(
					$list,
					function ( $a, $b ) {
						return strcmp( $b['start'], $a['start'] );
					}
				);
				return array_map( 'chcs_decorate_time', $list );
			}
		);

		chcs_route(
			'POST',
			'/time/clock-in',
			'clock',
			function ( $req, $me ) {
				if ( chcs_rec_query( 'time', array( 'owner' => $me, 'status' => 'open' ), 1 ) ) {
					return chcs_err( 400, 'You are already clocked in.' );
				}
				$geo = null;
				$g   = $req['geo'];
				if ( is_array( $g ) && isset( $g['lat'], $g['lng'] ) ) {
					$geo = array( 'lat' => round( (float) $g['lat'], 5 ), 'lng' => round( (float) $g['lng'], 5 ), 'acc' => (int) ( $g['acc'] ?? 0 ) );
				}
				$t = chcs_rec_insert(
					'time',
					array(
						'userId'  => $me,
						'date'    => chcs_today(),
						'start'   => chcs_now_iso(),
						'end'     => null,
						'minutes' => 0,
						'source'  => 'clock',
						'status'  => 'open',
						'note'    => chcs_str( $req['note'], 300 ),
						'geo'     => $geo,
					)
				);
				chcs_audit( $me, 'time.clock_in' );
				return chcs_decorate_time( $t );
			}
		);

		chcs_route(
			'POST',
			'/time/clock-out',
			'clock',
			function ( $req, $me ) {
				$open = chcs_rec_query( 'time', array( 'owner' => $me, 'status' => 'open' ), 1 );
				if ( ! $open ) {
					return chcs_err( 400, 'You are not clocked in.' );
				}
				$t    = $open[0];
				$end  = chcs_now_iso();
				$mins = max( 1, (int) round( ( strtotime( $end ) - strtotime( $t['start'] ) ) / 60 ) );
				$note = chcs_str( $req['note'], 300 );
				$t    = chcs_rec_update(
					'time',
					$t['id'],
					array(
						'end'     => $end,
						'minutes' => $mins,
						'status'  => 'pending',
						'note'    => $note ? trim( $t['note'] . ' · ' . $note, ' ·' ) : $t['note'],
					)
				);
				chcs_audit( $me, 'time.clock_out', $mins . ' min' );
				return chcs_decorate_time( $t );
			}
		);

		chcs_route(
			'POST',
			'/time/entries',
			'timesheet',
			function ( $req, $me ) {
				$date = (string) $req['date'];
				$st   = (string) $req['startTime'];
				$en   = (string) $req['endTime'];
				if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) || ! preg_match( '/^\d{2}:\d{2}$/', $st ) || ! preg_match( '/^\d{2}:\d{2}$/', $en ) ) {
					return chcs_err( 400, 'Enter a date, time in and time out.' );
				}
				$start = chcs_local_to_iso( $date, $st );
				$end   = chcs_local_to_iso( $date, $en );
				if ( strtotime( $end ) <= strtotime( $start ) ) {
					$end = gmdate( 'c', strtotime( $end ) + DAY_IN_SECONDS ); // overnight shift.
				}
				$case_id = (int) $req['caseId'];
				if ( $case_id && ! in_array( $case_id, wp_list_pluck( chcs_cases_for( $me ), 'id' ), true ) ) {
					$case_id = 0;
				}
				$t = chcs_rec_insert(
					'time',
					array(
						'userId'  => $me,
						'date'    => $date,
						'start'   => $start,
						'end'     => $end,
						'minutes' => (int) round( ( strtotime( $end ) - strtotime( $start ) ) / 60 ),
						'source'  => 'manual',
						'status'  => 'draft',
						'caseId'  => $case_id ? $case_id : null,
						'note'    => chcs_str( $req['note'], 300 ),
					)
				);
				return chcs_decorate_time( $t );
			}
		);

		chcs_route(
			'DELETE',
			'/time/entries/(?P<id>\d+)',
			'user',
			function ( $req, $me ) {
				$t = chcs_rec_get( 'time', (int) $req['id'] );
				if ( ! $t || (int) $t['userId'] !== $me || ! in_array( $t['status'], array( 'draft', 'rejected' ), true ) ) {
					return chcs_err( 400, 'Only your draft or rejected entries can be deleted.' );
				}
				chcs_rec_delete( 'time', $t['id'] );
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'POST',
			'/time/submit',
			'user',
			function ( $req, $me ) {
				$ws = chcs_str( $req['weekStart'], 10 );
				$n  = 0;
				foreach ( chcs_rec_query( 'time', array( 'owner' => $me, 'status' => array( 'draft', 'rejected' ) ) ) as $t ) {
					if ( ! $ws || chcs_week_start( $t['date'] ) === $ws ) {
						chcs_rec_update( 'time', $t['id'], array( 'status' => 'pending' ) );
						$n++;
					}
				}
				chcs_audit( $me, 'time.submit', $n . ' entries' );
				return array(
					'ok'        => true,
					'submitted' => $n,
				);
			}
		);

		chcs_route(
			'POST',
			'/time/decide',
			'approvals',
			function ( $req, $me ) {
				$ids     = array_map( 'intval', (array) $req['ids'] );
				$act     = 'reject' === $req['action'] ? 'rejected' : 'approved';
				$note    = chcs_str( $req['note'], 300 );
				$touched = array();
				foreach ( $ids as $id ) {
					$t = chcs_rec_get( 'time', $id );
					if ( $t && 'pending' === $t['status'] ) {
						$ch = array( 'status' => $act, 'decidedBy' => $me, 'decidedAt' => chcs_now_iso() );
						if ( $note ) {
							$ch['decisionNote'] = $note;
						}
						chcs_rec_update( 'time', $id, $ch );
						$touched[ $t['userId'] ] = ( $touched[ $t['userId'] ] ?? 0 ) + 1;
					}
				}
				foreach ( $touched as $uid => $n ) {
					$u = get_userdata( $uid );
					if ( $u ) {
						chcs_mail( 'time_decision', $u->user_email, 'Your time entries were ' . $act, "Hi {$u->display_name},\n\n{$n} time entr" . ( $n > 1 ? 'ies were ' : 'y was ' ) . $act . ( $note ? ".\nNote: {$note}" : '.' ) . "\n\n" . chcs_portal_url( 'timesheet' ) );
					}
				}
				chcs_audit( $me, 'time.' . $act, count( $ids ) . ' entries' );
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'GET',
			'/payroll',
			'payroll',
			function ( $req, $me ) {
				$status = '1' === (string) $req['includePending'] ? array( 'approved', 'pending' ) : array( 'approved' );
				$list   = chcs_rec_query(
					'time',
					array(
						'status' => $status,
						'from'   => chcs_str( $req['from'], 10 ),
						'to'     => chcs_str( $req['to'], 10 ),
					)
				);
				$detail = array_map( 'chcs_decorate_time', array_values( array_filter( $list, function ( $t ) { return ! empty( $t['end'] ); } ) ) );
				usort(
					$detail,
					function ( $a, $b ) {
						return strcmp( $a['userName'] . $a['start'], $b['userName'] . $b['start'] );
					}
				);
				$by = array();
				foreach ( $detail as $t ) {
					$k = $t['userId'];
					if ( ! isset( $by[ $k ] ) ) {
						$by[ $k ] = array( 'userId' => (int) $k, 'name' => $t['userName'], 'designation' => $t['designation'], 'weeks' => array(), 'entries' => 0 );
					}
					$w = chcs_week_start( $t['date'] );
					$by[ $k ]['weeks'][ $w ] = ( $by[ $k ]['weeks'][ $w ] ?? 0 ) + (int) $t['minutes'];
					$by[ $k ]['entries']++;
				}
				$summary = array();
				foreach ( $by as $s ) {
					$reg = 0;
					$ot  = 0;
					foreach ( $s['weeks'] as $m ) {
						$h    = $m / 60;
						$reg += min( 40, $h );
						$ot  += max( 0, $h - 40 );
					}
					$summary[] = array(
						'userId'        => $s['userId'],
						'name'          => $s['name'],
						'designation'   => $s['designation'],
						'regularHours'  => round( $reg, 2 ),
						'overtimeHours' => round( $ot, 2 ),
						'totalHours'    => round( $reg + $ot, 2 ),
						'entries'       => $s['entries'],
					);
				}
				chcs_audit( $me, 'payroll.view', $req['from'] . '..' . $req['to'] );
				return array(
					'summary' => $summary,
					'detail'  => $detail,
				);
			}
		);

		chcs_route(
			'GET',
			'/staff',
			array( 'calendar_manage', 'intake', 'approvals', 'payroll' ),
			function () {
				$out = array();
				foreach ( chcs_portal_users( 'active' ) as $id ) {
					if ( 'applicant' !== chcs_user_type( $id ) ) {
						$out[] = chcs_user_pub( $id );
					}
				}
				return $out;
			}
		);
	}
);
