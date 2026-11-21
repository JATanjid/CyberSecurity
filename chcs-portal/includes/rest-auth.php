<?php
/**
 * Auth: sign-up with email verification, login, logout, password reset, profile, dashboard.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* Make the new login cookie visible in the same request, so the nonce we return is valid. */
add_action(
	'set_logged_in_cookie',
	function ( $cookie ) {
		$_COOKIE[ LOGGED_IN_COOKIE ] = $cookie;
	}
);

function chcs_find_user_by_token( $meta_key, $token ) {
	if ( ! $token || ! is_string( $token ) ) {
		return 0;
	}
	$ids = get_users(
		array(
			'fields'     => 'ID',
			'number'     => 1,
			'meta_key'   => $meta_key, // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value' => chcs_token_hash( $token ), // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
	return $ids ? (int) $ids[0] : 0;
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'POST',
			'/auth/signup',
			null,
			function ( $req ) {
				if ( chcs_rate_limited( 'signup', 8, 3600 ) ) {
					return chcs_err( 429, 'Too many attempts. Please try again later.' );
				}
				$name  = chcs_str( $req['name'], 100 );
				$email = sanitize_email( (string) $req['email'] );
				$type  = (string) $req['accountType'];
				$pw    = (string) $req['password'];
				if ( ! $name || ! is_email( $email ) ) {
					return chcs_err( 400, 'Please enter your name and a valid email.' );
				}
				if ( strlen( $pw ) < 8 ) {
					return chcs_err( 400, 'Password must be at least 8 characters.' );
				}
				if ( ! in_array( $type, array( 'office', 'field', 'applicant' ), true ) ) {
					return chcs_err( 400, 'Choose an account type.' );
				}
				if ( email_exists( $email ) ) {
					return chcs_err( 409, 'An account with this email already exists. Try signing in.' );
				}
				$des = 'applicant' === $type ? '' : chcs_str( $req['designation'], 60 );
				if ( $des && ! in_array( $des, wp_list_pluck( chcs_designations(), 'name' ), true ) ) {
					$des = '';
				}
				$login = sanitize_user( strtolower( $email ), true );
				$uid   = wp_insert_user(
					array(
						'user_login'   => $login,
						'user_email'   => $email,
						'user_pass'    => $pw,
						'display_name' => $name,
						'first_name'   => strtok( $name, ' ' ),
						'role'         => 'chcs_staff',
					)
				);
				if ( is_wp_error( $uid ) ) {
					return chcs_err( 400, $uid->get_error_message() );
				}
				$token = chcs_token();
				update_user_meta( $uid, 'chcs_type', $type );
				update_user_meta( $uid, 'chcs_designation', $des );
				update_user_meta( $uid, 'chcs_status', 'unverified' );
				update_user_meta( $uid, 'chcs_phone', chcs_str( $req['phone'], 30 ) );
				update_user_meta( $uid, 'chcs_verify_hash', chcs_token_hash( $token ) );
				chcs_mail( 'verify', $email, 'Verify your email — CHCS Portal', "Hi {$name},\n\nPlease confirm your email address to continue:\n" . chcs_portal_url( 'verify/' . $token ) . "\n\nIf you did not create this account, ignore this email.", true );
				chcs_audit( $uid, 'auth.signup', $type );
				return array(
					'ok'      => true,
					'message' => 'Check your email for a verification link.',
				);
			}
		);

		chcs_route(
			'POST',
			'/auth/verify',
			null,
			function ( $req ) {
				$uid = chcs_find_user_by_token( 'chcs_verify_hash', (string) $req['token'] );
				if ( ! $uid ) {
					return chcs_err( 400, 'This verification link is invalid or was already used.' );
				}
				delete_user_meta( $uid, 'chcs_verify_hash' );
				update_user_meta( $uid, 'chcs_email_verified', 1 );
				$status = 'applicant' === chcs_user_type( $uid ) ? 'active' : 'pending';
				update_user_meta( $uid, 'chcs_status', $status );
				if ( 'pending' === $status ) {
					$p = chcs_user_pub( $uid, true );
					chcs_notify_admins( 'signup_admin', 'New portal account waiting for approval', "{$p['name']} ({$p['email']}) signed up as {$p['type']}" . ( $p['designation'] ? " — {$p['designation']}" : '' ) . ".\n\nReview it here:\n" . chcs_portal_url( 'admin/users' ) );
				}
				chcs_audit( $uid, 'auth.verified' );
				return array(
					'ok'     => true,
					'status' => $status,
				);
			}
		);

		chcs_route(
			'POST',
			'/auth/resend-verification',
			null,
			function ( $req ) {
				if ( chcs_rate_limited( 'resend', 5, 3600 ) ) {
					return chcs_err( 429, 'Too many attempts. Please try again later.' );
				}
				$u = get_user_by( 'email', sanitize_email( (string) $req['email'] ) );
				if ( $u && 'unverified' === chcs_user_status( $u->ID ) ) {
					$token = chcs_token();
					update_user_meta( $u->ID, 'chcs_verify_hash', chcs_token_hash( $token ) );
					chcs_mail( 'verify', $u->user_email, 'Verify your email — CHCS Portal', "Hi {$u->display_name},\n\nVerification link:\n" . chcs_portal_url( 'verify/' . $token ), true );
				}
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'POST',
			'/auth/login',
			null,
			function ( $req ) {
				$email = sanitize_text_field( (string) $req['email'] );
				if ( chcs_rate_limited( 'login|' . strtolower( $email ), 10, 900 ) ) {
					return chcs_err( 429, 'Too many sign-in attempts. Wait 15 minutes and try again.' );
				}
				$u = is_email( $email ) ? get_user_by( 'email', $email ) : get_user_by( 'login', $email );
				if ( ! $u || ! wp_check_password( (string) $req['password'], $u->user_pass, $u->ID ) ) {
					return chcs_err( 401, 'Incorrect email or password.' );
				}
				if ( ! chcs_is_portal_user( $u->ID ) ) {
					return chcs_err( 403, 'This account does not have portal access.' );
				}
				$st = chcs_user_status( $u->ID );
				if ( 'unverified' === $st ) {
					return chcs_err( 403, 'Please verify your email first. We can resend the link.', 'unverified' );
				}
				if ( 'suspended' === $st ) {
					return chcs_err( 403, 'This account is suspended. Contact the office.' );
				}
				if ( 'rejected' === $st ) {
					return chcs_err( 403, 'This account was not approved. Contact the office.' );
				}
				wp_set_current_user( $u->ID );
				wp_set_auth_cookie( $u->ID, true, is_ssl() );
				update_user_meta( $u->ID, 'chcs_last_login', chcs_now_iso() );
				chcs_audit( $u->ID, 'auth.login' );
				return array(
					'user'  => chcs_user_pub( $u->ID, true ),
					'nonce' => wp_create_nonce( 'wp_rest' ),
				);
			}
		);

		chcs_route(
			'POST',
			'/auth/logout',
			null,
			function () {
				wp_logout();
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'POST',
			'/auth/forgot',
			null,
			function ( $req ) {
				if ( chcs_rate_limited( 'forgot', 5, 3600 ) ) {
					return chcs_err( 429, 'Too many attempts. Please try again later.' );
				}
				$u = get_user_by( 'email', sanitize_email( (string) $req['email'] ) );
				if ( $u && chcs_is_portal_user( $u->ID ) ) {
					$token = chcs_token();
					update_user_meta( $u->ID, 'chcs_reset_hash', chcs_token_hash( $token ) );
					update_user_meta( $u->ID, 'chcs_reset_expires', time() + HOUR_IN_SECONDS );
					chcs_mail( 'password_reset', $u->user_email, 'Reset your CHCS Portal password', "Hi {$u->display_name},\n\nReset your password with this link (valid for 1 hour):\n" . chcs_portal_url( 'reset/' . $token ) . "\n\nIf you didn't ask for this, you can ignore this email.", true );
				}
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'POST',
			'/auth/reset',
			null,
			function ( $req ) {
				$uid = chcs_find_user_by_token( 'chcs_reset_hash', (string) $req['token'] );
				if ( ! $uid || (int) get_user_meta( $uid, 'chcs_reset_expires', true ) < time() ) {
					return chcs_err( 400, 'This reset link is invalid or expired.' );
				}
				if ( strlen( (string) $req['password'] ) < 8 ) {
					return chcs_err( 400, 'Password must be at least 8 characters.' );
				}
				wp_set_password( (string) $req['password'], $uid );
				delete_user_meta( $uid, 'chcs_reset_hash' );
				delete_user_meta( $uid, 'chcs_reset_expires' );
				chcs_audit( $uid, 'auth.password_reset' );
				return array( 'ok' => true );
			}
		);

		chcs_route(
			'GET',
			'/me',
			'user',
			function ( $req, $me ) {
				return array( 'user' => chcs_user_pub( $me, true ) );
			}
		);

		chcs_route(
			'PATCH',
			'/me',
			'user',
			function ( $req, $me ) {
				$data = array( 'ID' => $me );
				if ( $req['name'] ) {
					$data['display_name'] = chcs_str( $req['name'], 100 );
				}
				if ( null !== $req['phone'] ) {
					update_user_meta( $me, 'chcs_phone', chcs_str( $req['phone'], 30 ) );
				}
				if ( $req['newPassword'] ) {
					$u = get_userdata( $me );
					if ( ! wp_check_password( (string) $req['currentPassword'], $u->user_pass, $me ) ) {
						return chcs_err( 400, 'Current password is incorrect.' );
					}
					if ( strlen( (string) $req['newPassword'] ) < 8 ) {
						return chcs_err( 400, 'Password must be at least 8 characters.' );
					}
					wp_set_password( (string) $req['newPassword'], $me );
					wp_set_auth_cookie( $me, true, is_ssl() ); // wp_set_password logs the user out.
				}
				if ( count( $data ) > 1 ) {
					wp_update_user( $data );
				}
				return array( 'user' => chcs_user_pub( $me, true ) );
			}
		);

		chcs_route(
			'GET',
			'/designations',
			null,
			function () {
				return chcs_designations();
			}
		);

		chcs_route(
			'GET',
			'/dashboard',
			'user',
			function ( $req, $me ) {
				$out   = array();
				$ws    = chcs_week_start( chcs_today() );
				$mine  = chcs_rec_query( 'time', array( 'owner' => $me, 'from' => $ws ) );
				$out['weekMinutes'] = array_sum(
					array_map(
						function ( $t ) {
							return ! empty( $t['end'] ) ? (int) $t['minutes'] : 0;
						},
						$mine
					)
				);
				$open               = chcs_rec_query( 'time', array( 'owner' => $me, 'status' => 'open' ), 1 );
				$out['openEntry']   = $open ? $open[0] : null;
				if ( chcs_can( $me, 'approvals' ) ) {
					$out['pendingApprovals'] = count( chcs_rec_query( 'time', array( 'status' => 'pending' ) ) );
				}
				if ( chcs_can( $me, 'intake' ) ) {
					$out['newCases'] = count( chcs_rec_query( 'cases', array( 'status' => array( 'new', 'verifying' ) ) ) );
				}
				if ( chcs_can( $me, 'applications' ) ) {
					$out['pendingApplications'] = count( chcs_rec_query( 'applications', array( 'status' => 'submitted' ) ) );
				}
				if ( chcs_can( $me, 'users' ) ) {
					$out['pendingUsers'] = count( chcs_portal_users( 'pending' ) );
				}
				$shifts = chcs_rec_query( 'shifts', array( 'owner' => $me, 'from' => chcs_today() ), 0, 'ASC' );
				usort(
					$shifts,
					function ( $a, $b ) {
						return strcmp( $a['date'] . $a['start'], $b['date'] . $b['start'] );
					}
				);
				$out['upcomingShifts'] = array_slice( $shifts, 0, 4 );
				if ( chcs_can( $me, 'inservices' ) ) {
					$out['inservicesDue'] = count(
						array_filter(
							chcs_visible_inservices( $me ),
							function ( $i ) {
								return empty( $i['myResult'] ) || empty( $i['myResult']['passed'] );
							}
						)
					);
				}
				$out['unread'] = array_sum( wp_list_pluck( chcs_conversations_for( $me ), 'unread' ) );
				$out['posts']  = array_slice( chcs_visible_posts( $me ), 0, 4 );
				return $out;
			}
		);
	}
);
