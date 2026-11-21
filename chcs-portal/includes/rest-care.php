<?php
/**
 * Intake & case management, case notes, visit notes.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_case_fields() {
	return array( 'patientName', 'dob', 'phone', 'address', 'borough', 'referralSource', 'referrerName', 'insurance', 'physician', 'status', 'priority', 'socDate' );
}

/** Cases a user may see: everything with intake access; otherwise active cases assigned to them. */
function chcs_cases_for( $uid ) {
	$all = chcs_rec_query( 'cases' );
	if ( chcs_can( $uid, 'intake' ) ) {
		return $all;
	}
	return array_values(
		array_filter(
			$all,
			function ( $c ) use ( $uid ) {
				return 'active' === $c['status'] && in_array( $uid, array_map( 'intval', (array) ( $c['assigned'] ?? array() ) ), true );
			}
		)
	);
}

function chcs_decorate_case( $c, $full ) {
	$o = $full ? $c : array_intersect_key( $c, array_flip( array( 'id', 'patientName', 'borough', 'status', 'priority', 'services', 'assigned', 'address', 'phone', 'physician' ) ) );
	$o['assigned']      = array_map( 'intval', (array) ( $c['assigned'] ?? array() ) );
	$o['assignedNames'] = array_map( 'chcs_user_name', $o['assigned'] );
	return $o;
}

function chcs_decorate_note( $n ) {
	$c                = chcs_rec_get( 'cases', $n['caseId'] );
	$n['userName']    = chcs_user_name( $n['userId'] );
	$n['designation'] = (string) get_user_meta( $n['userId'], 'chcs_designation', true );
	$n['patientName'] = $c ? $c['patientName'] : '—';
	return $n;
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'GET',
			'/cases',
			array( 'intake', 'notes', 'timesheet' ),
			function ( $req, $me ) {
				$full = chcs_can( $me, 'intake' );
				if ( $full ) {
					chcs_audit( $me, 'cases.list' );
				}
				return array_map(
					function ( $c ) use ( $full ) {
						return chcs_decorate_case( $c, $full );
					},
					chcs_cases_for( $me )
				);
			}
		);

		chcs_route(
			'POST',
			'/cases',
			'intake',
			function ( $req, $me ) {
				if ( ! chcs_str( $req['patientName'] ) ) {
					return chcs_err( 400, 'Patient name is required.' );
				}
				$c = array(
					'services'  => array_slice( array_map( 'chcs_str', (array) $req['services'] ), 0, 10 ),
					'assigned'  => array(),
					'createdBy' => $me,
				);
				foreach ( chcs_case_fields() as $k ) {
					$c[ $k ] = chcs_str( $req[ $k ], 300 );
				}
				$c['status']   = $c['status'] ? $c['status'] : 'new';
				$c['priority'] = $c['priority'] ? $c['priority'] : 'normal';
				$c             = chcs_rec_insert( 'cases', $c );
				chcs_audit( $me, 'cases.create', '#' . $c['id'] );
				return chcs_decorate_case( $c, true );
			}
		);

		chcs_route(
			'GET',
			'/cases/(?P<id>\d+)',
			array( 'intake', 'notes', 'timesheet' ),
			function ( $req, $me ) {
				$id = (int) $req['id'];
				if ( ! in_array( $id, wp_list_pluck( chcs_cases_for( $me ), 'id' ), true ) ) {
					return chcs_err( 404, 'Case not found.' );
				}
				$full = chcs_can( $me, 'intake' );
				$o    = chcs_decorate_case( chcs_rec_get( 'cases', $id ), $full );
				$o['notes'] = array();
				if ( $full ) {
					foreach ( chcs_rec_query( 'caseNotes', array( 'ref' => $id ), 0, 'ASC' ) as $n ) {
						$n['userName'] = chcs_user_name( $n['userId'] );
						$o['notes'][]  = $n;
					}
					chcs_audit( $me, 'cases.view', '#' . $id );
				}
				return $o;
			}
		);

		chcs_route(
			'PATCH',
			'/cases/(?P<id>\d+)',
			'intake',
			function ( $req, $me ) {
				$c = chcs_rec_get( 'cases', (int) $req['id'] );
				if ( ! $c ) {
					return chcs_err( 404, 'Case not found.' );
				}
				$ch = array();
				foreach ( chcs_case_fields() as $k ) {
					if ( null !== $req[ $k ] ) {
						$ch[ $k ] = chcs_str( $req[ $k ], 300 );
					}
				}
				if ( is_array( $req['services'] ) ) {
					$ch['services'] = array_slice( array_map( 'chcs_str', $req['services'] ), 0, 10 );
				}
				if ( is_array( $req['assigned'] ) ) {
					$ch['assigned'] = array_values( array_filter( array_map( 'intval', $req['assigned'] ), 'chcs_is_portal_user' ) );
				}
				$updated = chcs_rec_update( 'cases', $c['id'], $ch );
				if ( isset( $ch['status'] ) && $ch['status'] !== $c['status'] ) {
					chcs_rec_insert( 'caseNotes', array( 'caseId' => $c['id'], 'userId' => $me, 'body' => "Status changed: {$c['status']} → {$ch['status']}", 'system' => true ) );
				}
				chcs_audit( $me, 'cases.update', '#' . $c['id'] );
				return chcs_decorate_case( $updated, true );
			}
		);

		chcs_route(
			'POST',
			'/cases/(?P<id>\d+)/notes',
			'intake',
			function ( $req, $me ) {
				$c    = chcs_rec_get( 'cases', (int) $req['id'] );
				$body = chcs_text( $req['body'], 4000 );
				if ( ! $c ) {
					return chcs_err( 404, 'Case not found.' );
				}
				if ( ! $body ) {
					return chcs_err( 400, 'Write a note first.' );
				}
				$n             = chcs_rec_insert( 'caseNotes', array( 'caseId' => $c['id'], 'userId' => $me, 'body' => $body ) );
				$n['userName'] = chcs_user_name( $me );
				return $n;
			}
		);

		/* ---- visit notes */
		chcs_route(
			'GET',
			'/notes',
			array( 'notes', 'intake', 'approvals' ),
			function ( $req, $me ) {
				$reviewer = chcs_can( $me, 'intake' ) || chcs_can( $me, 'approvals' );
				$where    = ( 'all' === $req['scope'] && $reviewer ) ? array() : array( 'owner' => $me );
				return array_map( 'chcs_decorate_note', chcs_rec_query( 'notes', $where, 500 ) );
			}
		);

		chcs_route(
			'POST',
			'/notes',
			'notes',
			function ( $req, $me ) {
				$case_id = (int) $req['caseId'];
				if ( ! in_array( $case_id, wp_list_pluck( chcs_cases_for( $me ), 'id' ), true ) ) {
					return chcs_err( 400, 'Choose one of your assigned patients.' );
				}
				$tasks = array_slice( array_map( function ( $t ) { return chcs_str( $t, 80 ); }, (array) $req['tasks'] ), 0, 40 );
				if ( ! chcs_text( $req['narrative'] ) && ! $tasks ) {
					return chcs_err( 400, 'Add the tasks you completed or a note.' );
				}
				if ( ! chcs_str( $req['signature'] ) ) {
					return chcs_err( 400, 'Sign the note.' );
				}
				$date = preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $req['date'] ) ? $req['date'] : chcs_today();
				$n    = chcs_rec_insert(
					'notes',
					array(
						'userId'    => $me,
						'caseId'    => $case_id,
						'date'      => $date,
						'timeIn'    => chcs_str( $req['timeIn'], 5 ),
						'timeOut'   => chcs_str( $req['timeOut'], 5 ),
						'tasks'     => $tasks,
						'condition' => chcs_str( $req['condition'], 60 ),
						'narrative' => chcs_text( $req['narrative'], 4000 ),
						'signature' => chcs_str( $req['signature'], 100 ),
						'status'    => 'submitted',
					)
				);
				chcs_audit( $me, 'notes.create', '#' . $n['id'] );
				return chcs_decorate_note( $n );
			}
		);

		chcs_route(
			'PATCH',
			'/notes/(?P<id>\d+)',
			array( 'intake', 'approvals' ),
			function ( $req, $me ) {
				$n = chcs_rec_get( 'notes', (int) $req['id'] );
				if ( ! $n ) {
					return chcs_err( 404, 'Not found.' );
				}
				if ( 'reviewed' === $req['status'] ) {
					$n = chcs_rec_update( 'notes', $n['id'], array( 'status' => 'reviewed', 'reviewedBy' => $me, 'reviewedAt' => chcs_now_iso(), 'reviewNote' => chcs_str( $req['reviewNote'], 500 ) ) );
					chcs_audit( $me, 'notes.review', '#' . $n['id'] );
				}
				return chcs_decorate_note( $n );
			}
		);
	}
);
