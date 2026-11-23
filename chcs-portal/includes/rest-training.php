<?php
/**
 * In-services (training + quiz) and new-hire orientation.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** The nurse employees message about in-services: first active Nursing Supervisor, else an admin. */
function chcs_default_nurse() {
	$admin = 0;
	foreach ( chcs_portal_users( 'active' ) as $uid ) {
		$t = chcs_user_type( $uid );
		if ( 'field' !== $t && 'Nursing Supervisor' === get_user_meta( $uid, 'chcs_designation', true ) ) {
			return $uid;
		}
		if ( 'admin' === $t && ! $admin ) {
			$admin = $uid;
		}
	}
	return $admin;
}

function chcs_inservice_result( $uid, $inservice_id, $center_id ) {
	foreach ( chcs_rec_query( 'inserviceResults', array( 'owner' => $uid ), 500 ) as $r ) {
		if ( $inservice_id ? (int) ( $r['inserviceId'] ?? 0 ) === (int) $inservice_id : ( $r['centerId'] ?? '' ) === $center_id ) {
			return $r;
		}
	}
	return null;
}

/** Everything a user should complete: personal assignments (quiz or Training Center module) + audience-wide quizzes. */
function chcs_visible_inservices( $me ) {
	$type   = chcs_user_type( $me );
	$aud    = 'admin' === $type ? 'office' : $type;
	$nurse  = chcs_default_nurse();
	$center = chcs_center_trainings();
	$out    = array();
	$seen   = array();
	foreach ( chcs_rec_query( 'inserviceAssignments', array( 'owner' => $me ), 500 ) as $a ) {
		$iid = (int) ( $a['inserviceId'] ?? 0 );
		$cid = (string) ( $a['centerId'] ?? '' );
		$i   = $iid ? chcs_rec_get( 'inservices', $iid ) : null;
		if ( $iid && ( ! $i || empty( $i['active'] ) ) ) {
			continue;
		}
		$o = $i ? $i : array( 'title' => $a['title'], 'description' => 'CHCS In-Service Training Center', 'hours' => $cid && isset( $center[ $cid ] ) ? round( $center[ $cid ][1] / 60, 2 ) : 0, 'questions' => array(), 'passScore' => 0 );
		$r = chcs_inservice_result( $me, $iid, $cid );
		$n = (int) ( $a['nurseId'] ?? 0 ) ?: $nurse;
		$o['kind']         = $cid ? 'center' : 'quiz';
		$o['centerId']     = $cid ? $cid : null;
		$o['id']           = $i ? $i['id'] : null;
		$o['assignmentId'] = $a['id'];
		$o['dueDate']      = $a['dueDate'] ? $a['dueDate'] : ( $i['dueDate'] ?? '' );
		$o['nurseId']      = $n;
		$o['nurseName']    = $n ? chcs_user_name( $n ) : '';
		$o['questions']    = array_map( function ( $q ) { return array( 'q' => $q['q'], 'options' => $q['options'] ); }, (array) ( $o['questions'] ?? array() ) );
		$o['myResult']     = $r ? array( 'score' => $r['score'], 'passed' => $r['passed'], 'completedAt' => $r['createdAt'] ) : ( 'completed' === $a['status'] ? array( 'score' => 100, 'passed' => true, 'completedAt' => $a['completedAt'] ?? '' ) : null );
		$seen[ $iid . '|' . $cid ] = 1;
		$out[] = $o;
	}
	foreach ( chcs_rec_query( 'inservices', array(), 0, 'ASC' ) as $i ) {
		if ( empty( $i['active'] ) || ! in_array( $aud, (array) $i['audience'], true ) || isset( $seen[ $i['id'] . '|' ] ) ) {
			continue;
		}
		$r = chcs_inservice_result( $me, $i['id'], '' );
		$i['kind']      = $i['externalUrl'] ? 'link' : 'quiz';
		$i['questions'] = array_map( function ( $q ) { return array( 'q' => $q['q'], 'options' => $q['options'] ); }, (array) $i['questions'] );
		$i['nurseId']   = $nurse;
		$i['nurseName'] = $nurse ? chcs_user_name( $nurse ) : '';
		$i['myResult']  = $r ? array( 'score' => $r['score'], 'passed' => $r['passed'], 'completedAt' => $r['createdAt'] ) : null;
		$out[]          = $i;
	}
	// Training Center courses finished without an assignment still count as completed.
	foreach ( chcs_rec_query( 'inserviceResults', array( 'owner' => $me ), 500 ) as $r ) {
		$cid = (string) ( $r['centerId'] ?? '' );
		if ( ! $cid || isset( $seen[ '0|' . $cid ] ) || isset( $seen[ '|' . $cid ] ) ) {
			continue;
		}
		$seen[ '|' . $cid ] = 1;
		$out[] = array( 'kind' => 'center', 'centerId' => $cid, 'id' => null, 'title' => isset( $center[ $cid ] ) ? $center[ $cid ][0] : $cid, 'description' => 'CHCS In-Service Training Center', 'hours' => isset( $center[ $cid ] ) ? round( $center[ $cid ][1] / 60, 2 ) : 0, 'questions' => array(), 'dueDate' => '', 'nurseId' => $nurse, 'nurseName' => $nurse ? chcs_user_name( $nurse ) : '', 'myResult' => array( 'score' => $r['score'], 'passed' => true, 'completedAt' => $r['createdAt'] ) );
	}
	usort(
		$out,
		function ( $a, $b ) {
			$da = ! empty( $a['myResult']['passed'] );
			$db = ! empty( $b['myResult']['passed'] );
			if ( $da !== $db ) {
				return $da ? 1 : -1;
			}
			return strcmp( $a['dueDate'] ? $a['dueDate'] : '9999', $b['dueDate'] ? $b['dueDate'] : '9999' );
		}
	);
	return $out;
}

/** Mark matching assignments complete and tell the nurse. */
function chcs_complete_assignments( $uid, $inservice_id, $center_id ) {
	foreach ( chcs_rec_query( 'inserviceAssignments', array( 'owner' => $uid ), 500 ) as $a ) {
		$match = $inservice_id ? (int) ( $a['inserviceId'] ?? 0 ) === (int) $inservice_id : ( $a['centerId'] ?? '' ) === $center_id;
		if ( $match && 'completed' !== $a['status'] ) {
			chcs_rec_update( 'inserviceAssignments', $a['id'], array( 'status' => 'completed', 'completedAt' => chcs_now_iso() ) );
			if ( ! empty( $a['nurseId'] ) ) {
				chcs_notify( $a['nurseId'], 'inservice', chcs_user_name( $uid ) . ' completed ' . $a['title'], '', '#/admin/training?tab=assign' );
			}
		}
	}
}

function chcs_inservice_input( $b ) {
	if ( ! chcs_str( $b['title'] ?? '' ) ) {
		return chcs_err( 400, 'Title required.' );
	}
	$qs = array();
	foreach ( (array) ( $b['questions'] ?? array() ) as $q ) {
		$opts = array_values( array_filter( array_map( function ( $o ) { return chcs_str( $o, 200 ); }, (array) ( $q['options'] ?? array() ) ) ) );
		if ( chcs_str( $q['q'] ?? '' ) && count( $opts ) >= 2 ) {
			$qs[] = array( 'q' => chcs_str( $q['q'], 300 ), 'options' => $opts, 'answer' => min( count( $opts ) - 1, max( 0, (int) ( $q['answer'] ?? 0 ) ) ) );
		}
	}
	$aud = array_values( array_intersect( (array) ( $b['audience'] ?? array( 'field' ) ), array( 'field', 'office' ) ) );
	return array(
		'title'       => chcs_str( $b['title'], 150 ),
		'description' => chcs_str( $b['description'] ?? '', 500 ),
		'body'        => chcs_text( $b['body'] ?? '', 20000 ),
		'hours'       => max( 0, (float) ( $b['hours'] ?? 0 ) ),
		'dueDate'     => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) ( $b['dueDate'] ?? '' ) ) ? $b['dueDate'] : '',
		'audience'    => $aud ? $aud : array( 'field' ),
		'passScore'   => min( 100, max( 0, (int) ( $b['passScore'] ?? 80 ) ) ),
		'externalUrl' => preg_match( '~^forms/[\w-]+\.html$~', (string) ( $b['externalUrl'] ?? '' ) ) ? $b['externalUrl'] : ( preg_match( '~^https?://~i', (string) ( $b['externalUrl'] ?? '' ) ) ? esc_url_raw( $b['externalUrl'] ) : '' ),
		'active'      => ! isset( $b['active'] ) || (bool) $b['active'],
		'questions'   => $qs,
	);
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'GET',
			'/inservices',
			array( 'inservices', 'training_manage' ),
			function ( $req, $me ) {
				if ( '1' === (string) $req['manage'] ) {
					if ( ! chcs_can( $me, 'training_manage' ) ) {
						return chcs_err( 403, 'No access.' );
					}
					return array_map(
						function ( $i ) {
							$i['completions'] = count( chcs_rec_query( 'inserviceResults', array( 'ref' => $i['id'] ) ) );
							return $i;
						},
						chcs_rec_query( 'inservices', array(), 0, 'ASC' )
					);
				}
				if ( ! chcs_can( $me, 'inservices' ) ) {
					return chcs_err( 403, 'No access.' );
				}
				return chcs_visible_inservices( $me );
			}
		);

		chcs_route(
			'POST',
			'/inservices',
			'training_manage',
			function ( $req, $me ) {
				$in = chcs_inservice_input( $req->get_json_params() );
				if ( is_wp_error( $in ) ) {
					return $in;
				}
				$i = chcs_rec_insert( 'inservices', $in );
				foreach ( chcs_portal_users( 'active' ) as $uid ) {
					if ( in_array( chcs_user_type( $uid ), $i['audience'], true ) && chcs_can( $uid, 'inservices' ) ) {
						$u = get_userdata( $uid );
						chcs_notify( $uid, 'inservice', 'New in-service: ' . $i['title'], $i['dueDate'] ? 'Due ' . $i['dueDate'] : '', '#/inservices' );
						chcs_mail( 'inservice_assigned', $u->user_email, 'New in-service assigned: ' . $i['title'], "Hi {$u->display_name},\n\nA new in-service is ready for you" . ( $i['dueDate'] ? " (due {$i['dueDate']})" : '' ) . ".\n\n" . chcs_portal_url( 'inservices' ) );
					}
				}
				chcs_audit( $me, 'inservices.create', $i['title'] );
				return $i;
			}
		);

		chcs_route(
			'PATCH',
			'/inservices/(?P<id>\d+)',
			'training_manage',
			function ( $req, $me ) {
				$i = chcs_rec_get( 'inservices', (int) $req['id'] );
				if ( ! $i ) {
					return chcs_err( 404, 'Not found.' );
				}
				$in = chcs_inservice_input( array_merge( $i, (array) $req->get_json_params() ) );
				if ( is_wp_error( $in ) ) {
					return $in;
				}
				chcs_audit( $me, 'inservices.update', $in['title'] );
				return chcs_rec_update( 'inservices', $i['id'], $in );
			}
		);

		chcs_route(
			'DELETE',
			'/inservices/(?P<id>\d+)',
			'training_manage',
			function ( $req, $me ) {
				$i = chcs_rec_get( 'inservices', (int) $req['id'] );
				if ( ! $i ) {
					return chcs_err( 404, 'Not found.' );
				}
				chcs_rec_update( 'inservices', $i['id'], array( 'active' => false ) );
				chcs_audit( $me, 'inservices.archive', $i['title'] );
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'POST',
			'/inservices/(?P<id>\d+)/complete',
			'inservices',
			function ( $req, $me ) {
				$i = chcs_rec_get( 'inservices', (int) $req['id'] );
				if ( ! $i || empty( $i['active'] ) ) {
					return chcs_err( 404, 'Not found.' );
				}
				if ( ! chcs_str( $req['signature'] ) ) {
					return chcs_err( 400, 'Sign to confirm you completed the in-service.' );
				}
				$ans     = (array) $req['answers'];
				$correct = 0;
				foreach ( (array) $i['questions'] as $k => $q ) {
					if ( isset( $ans[ $k ] ) && (int) $ans[ $k ] === (int) $q['answer'] ) {
						$correct++;
					}
				}
				$total  = count( (array) $i['questions'] );
				$score  = $total ? (int) round( $correct / $total * 100 ) : 100;
				$passed = $score >= (int) $i['passScore'];
				chcs_rec_insert( 'inserviceResults', array( 'inserviceId' => $i['id'], 'userId' => $me, 'score' => $score, 'passed' => $passed, 'answers' => array_map( 'intval', $ans ), 'signature' => chcs_str( $req['signature'], 100 ) ) );
				if ( $passed ) {
					chcs_complete_assignments( $me, $i['id'], '' );
				}
				chcs_audit( $me, 'inservices.complete', $i['title'] . ' ' . $score . '%' );
				return array(
					'score'     => $score,
					'passed'    => $passed,
					'passScore' => (int) $i['passScore'],
				);
			}
		);

		chcs_route(
			'GET',
			'/inservices/report',
			'training_manage',
			function () {
				$out    = array();
				$center = chcs_center_trainings();
				foreach ( chcs_rec_query( 'inserviceResults', array(), 1000 ) as $r ) {
					$i     = ! empty( $r['inserviceId'] ) ? chcs_rec_get( 'inservices', $r['inserviceId'] ) : null;
					$c     = ! empty( $r['centerId'] ) && isset( $center[ $r['centerId'] ] ) ? $center[ $r['centerId'] ] : null;
					$out[] = array(
						'id'          => $r['id'],
						'userName'    => chcs_user_name( $r['userId'] ),
						'designation' => (string) get_user_meta( $r['userId'], 'chcs_designation', true ),
						'title'       => $i ? $i['title'] : ( $c ? $c[0] . ' (Training Center)' : '—' ),
						'hours'       => $i ? $i['hours'] : ( $c ? round( $c[1] / 60, 2 ) : 0 ),
						'score'       => $r['score'],
						'passed'      => $r['passed'],
						'completedAt' => $r['createdAt'],
					);
				}
				return $out;
			}
		);

		/* ---- orientation */
		$sorted_modules = function () {
			$m = chcs_rec_query( 'orientationModules', array(), 0, 'ASC' );
			usort(
				$m,
				function ( $a, $b ) {
					return (int) $a['order'] - (int) $b['order'];
				}
			);
			return $m;
		};

		chcs_route(
			'GET',
			'/orientation',
			'orientation',
			function ( $req, $me ) use ( $sorted_modules ) {
				return array_map(
					function ( $m ) use ( $me ) {
						$p        = chcs_rec_query( 'orientationProgress', array( 'owner' => $me, 'ref' => $m['id'] ), 1 );
						$m['ackAt'] = $p ? $p[0]['createdAt'] : null;
						return $m;
					},
					$sorted_modules()
				);
			}
		);

		chcs_route(
			'POST',
			'/orientation/(?P<id>\d+)/ack',
			'orientation',
			function ( $req, $me ) {
				$m = chcs_rec_get( 'orientationModules', (int) $req['id'] );
				if ( ! $m ) {
					return chcs_err( 404, 'Not found.' );
				}
				if ( ! chcs_str( $req['signature'] ) ) {
					return chcs_err( 400, 'Type your name to sign.' );
				}
				if ( ! chcs_rec_query( 'orientationProgress', array( 'owner' => $me, 'ref' => $m['id'] ), 1 ) ) {
					chcs_rec_insert( 'orientationProgress', array( 'moduleId' => $m['id'], 'userId' => $me, 'signature' => chcs_str( $req['signature'], 100 ) ) );
				}
				chcs_audit( $me, 'orientation.ack', $m['title'] );
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'GET',
			'/orientation/modules',
			'training_manage',
			function () use ( $sorted_modules ) {
				return $sorted_modules();
			}
		);

		chcs_route(
			'POST',
			'/orientation/modules',
			'training_manage',
			function ( $req, $me ) {
				if ( ! chcs_str( $req['title'] ) ) {
					return chcs_err( 400, 'Title required.' );
				}
				$m = chcs_rec_insert( 'orientationModules', array( 'title' => chcs_str( $req['title'], 150 ), 'body' => chcs_text( $req['body'], 20000 ), 'order' => (int) $req['order'] ?: 99 ) );
				chcs_audit( $me, 'orientation.create', $m['title'] );
				return $m;
			}
		);

		chcs_route(
			'PATCH',
			'/orientation/modules/(?P<id>\d+)',
			'training_manage',
			function ( $req ) {
				$m = chcs_rec_get( 'orientationModules', (int) $req['id'] );
				if ( ! $m ) {
					return chcs_err( 404, 'Not found.' );
				}
				$ch = array();
				if ( $req['title'] ) {
					$ch['title'] = chcs_str( $req['title'], 150 );
				}
				if ( null !== $req['body'] ) {
					$ch['body'] = chcs_text( $req['body'], 20000 );
				}
				if ( $req['order'] ) {
					$ch['order'] = (int) $req['order'];
				}
				return chcs_rec_update( 'orientationModules', $m['id'], $ch );
			}
		);

		chcs_route(
			'DELETE',
			'/orientation/modules/(?P<id>\d+)',
			'training_manage',
			function ( $req ) {
				return chcs_rec_delete( 'orientationModules', (int) $req['id'] ) ? array( 'ok' => true ) : chcs_err( 404, 'Not found.' );
			}
		);

		chcs_route(
			'GET',
			'/orientation/report',
			'training_manage',
			function () {
				$total = count( chcs_rec_query( 'orientationModules' ) );
				$out   = array();
				foreach ( chcs_portal_users( 'active' ) as $uid ) {
					if ( chcs_can( $uid, 'orientation' ) && 'admin' !== chcs_user_type( $uid ) ) {
						$out[] = array(
							'userId'      => $uid,
							'name'        => chcs_user_name( $uid ),
							'designation' => (string) get_user_meta( $uid, 'chcs_designation', true ),
							'done'        => count( chcs_rec_query( 'orientationProgress', array( 'owner' => $uid ) ) ),
							'total'       => $total,
						);
					}
				}
				return $out;
			}
		);

		/* ---- assignments (nurse / training managers) */
		$decorate = function ( $a ) {
			$a['userName']    = chcs_user_name( $a['userId'] );
			$a['designation'] = (string) get_user_meta( $a['userId'], 'chcs_designation', true );
			$a['nurseName']   = ! empty( $a['nurseId'] ) ? chcs_user_name( $a['nurseId'] ) : '';
			$a['overdue']     = 'completed' !== $a['status'] && ! empty( $a['dueDate'] ) && $a['dueDate'] < chcs_today();
			return $a;
		};
		chcs_route(
			'GET',
			'/inservices/assignments',
			'training_manage',
			function ( $req ) use ( $decorate ) {
				$where = $req['userId'] ? array( 'owner' => (int) $req['userId'] ) : array();
				return array_map( $decorate, chcs_rec_query( 'inserviceAssignments', $where, 2000 ) );
			}
		);
		chcs_route(
			'POST',
			'/inservices/assign',
			'training_manage',
			function ( $req, $me ) {
				$ids = array_values( array_filter( array_map( 'intval', (array) $req['userIds'] ), function ( $id ) { return 'active' === chcs_user_status( $id ); } ) );
				if ( ! $ids ) {
					return chcs_err( 400, 'Choose at least one employee.' );
				}
				$center = chcs_center_trainings();
				$i      = $req['inserviceId'] ? chcs_rec_get( 'inservices', (int) $req['inserviceId'] ) : null;
				$cid    = (string) $req['centerId'];
				if ( ! $i && ! isset( $center[ $cid ] ) ) {
					return chcs_err( 400, 'Choose an in-service.' );
				}
				if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $req['dueDate'] ) ) {
					return chcs_err( 400, 'Choose a due date.' );
				}
				$nurse = (int) $req['nurseId'] && chcs_is_portal_user( (int) $req['nurseId'] ) ? (int) $req['nurseId'] : $me;
				$title = $i ? $i['title'] : $center[ $cid ][0];
				$made  = 0;
				foreach ( $ids as $uid ) {
					$dupe = false;
					foreach ( chcs_rec_query( 'inserviceAssignments', array( 'owner' => $uid ), 500 ) as $a ) {
						if ( 'completed' !== $a['status'] && ( $i ? (int) ( $a['inserviceId'] ?? 0 ) === (int) $i['id'] : ( $a['centerId'] ?? '' ) === $cid ) ) {
							$dupe = true;
						}
					}
					if ( $dupe ) {
						continue;
					}
					chcs_rec_insert( 'inserviceAssignments', array( 'userId' => $uid, 'inserviceId' => $i ? (int) $i['id'] : 0, 'centerId' => $i ? '' : $cid, 'title' => $title, 'dueDate' => $req['dueDate'], 'nurseId' => $nurse, 'assignedBy' => $me, 'status' => 'assigned' ) );
					$made++;
					$u = get_userdata( $uid );
					chcs_notify( $uid, 'inservice', 'In-service assigned: ' . $title, 'Due ' . $req['dueDate'] . ' · Questions? Message ' . chcs_user_name( $nurse ), '#/inservices' );
					chcs_mail( 'inservice_assigned', $u->user_email, 'In-service assigned: ' . $title, "Hi {$u->display_name},\n\n" . chcs_user_name( $me ) . " assigned you \"{$title}\", due {$req['dueDate']}.\nOpen the CHCS Portal → In-services to start. You can message " . chcs_user_name( $nurse ) . " from inside the in-service if you have questions.\n\n" . chcs_portal_url( 'inservices' ) );
				}
				chcs_audit( $me, 'inservices.assign', $title . ' x' . $made );
				return array( 'ok' => true, 'assigned' => $made );
			}
		);
		chcs_route(
			'DELETE',
			'/inservices/assignments/(?P<id>\d+)',
			'training_manage',
			function ( $req, $me ) {
				$a = chcs_rec_get( 'inserviceAssignments', (int) $req['id'] );
				if ( ! $a ) {
					return chcs_err( 404, 'Not found.' );
				}
				chcs_rec_delete( 'inserviceAssignments', $a['id'] );
				chcs_audit( $me, 'inservices.unassign', $a['title'] );
				return array( 'ok' => true );
			}
		);
		chcs_route(
			'POST',
			'/inservices/center-complete',
			'inservices',
			function ( $req, $me ) {
				$center = chcs_center_trainings();
				$cid    = (string) $req['centerId'];
				if ( ! isset( $center[ $cid ] ) ) {
					return chcs_err( 400, 'Unknown training.' );
				}
				chcs_rec_insert( 'inserviceResults', array( 'centerId' => $cid, 'inserviceId' => 0, 'userId' => $me, 'score' => min( 100, max( 0, (int) $req['score'] ?: 100 ) ), 'passed' => true, 'answers' => array(), 'signature' => chcs_str( $req['name'], 100 ) ) );
				chcs_complete_assignments( $me, 0, $cid );
				chcs_audit( $me, 'inservices.center_complete', $center[ $cid ][0] );
				return array( 'ok' => true );
			}
		);
		chcs_route(
			'GET',
			'/nurse',
			'user',
			function () {
				$n = chcs_default_nurse();
				return $n ? chcs_user_pub( $n ) : null;
			}
		);
	}
);
