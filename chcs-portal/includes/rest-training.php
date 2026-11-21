<?php
/**
 * In-services (training + quiz) and new-hire orientation.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_visible_inservices( $me ) {
	$type = chcs_user_type( $me );
	$aud  = 'admin' === $type ? 'office' : $type;
	$out  = array();
	foreach ( chcs_rec_query( 'inservices', array(), 0, 'ASC' ) as $i ) {
		if ( empty( $i['active'] ) || ! in_array( $aud, (array) $i['audience'], true ) ) {
			continue;
		}
		$r = chcs_rec_query( 'inserviceResults', array( 'owner' => $me, 'ref' => $i['id'] ), 1 );
		$i['questions'] = array_map(
			function ( $q ) {
				return array( 'q' => $q['q'], 'options' => $q['options'] );
			},
			(array) $i['questions']
		);
		$i['myResult'] = $r ? array( 'score' => $r[0]['score'], 'passed' => $r[0]['passed'], 'completedAt' => $r[0]['createdAt'] ) : null;
		$out[]         = $i;
	}
	return $out;
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
				$out = array();
				foreach ( chcs_rec_query( 'inserviceResults', array(), 1000 ) as $r ) {
					$i     = chcs_rec_get( 'inservices', $r['inserviceId'] );
					$out[] = array(
						'id'          => $r['id'],
						'userName'    => chcs_user_name( $r['userId'] ),
						'designation' => (string) get_user_meta( $r['userId'], 'chcs_designation', true ),
						'title'       => $i ? $i['title'] : '—',
						'hours'       => $i ? $i['hours'] : 0,
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
	}
);
