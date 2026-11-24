<?php
/**
 * Admin: users & access, designations, email/API settings, email log, audit log.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'rest_api_init',
	function () {

		chcs_route(
			'GET',
			'/users',
			'users',
			function ( $req ) {
				$ids = chcs_portal_users( chcs_str( $req['status'], 20 ) );
				return array_values( array_filter( array_map( function ( $id ) { return chcs_user_pub( $id, true ); }, $ids ) ) );
			}
		);

		chcs_route(
			'POST',
			'/users',
			'users',
			function ( $req, $me ) {
				$email = sanitize_email( (string) $req['email'] );
				$name  = chcs_str( $req['name'], 100 );
				$type  = in_array( $req['type'], array( 'office', 'field', 'admin' ), true ) ? $req['type'] : 'office';
				if ( ! $name || ! is_email( $email ) ) {
					return chcs_err( 400, 'Name and valid email required.' );
				}
				if ( email_exists( $email ) ) {
					return chcs_err( 409, 'Email already in use.' );
				}
				if ( 'admin' === $type && 'admin' !== chcs_user_type( $me ) ) {
					return chcs_err( 403, 'Only admins can create admins.' );
				}
				$uid = wp_insert_user(
					array(
						'user_login'   => sanitize_user( strtolower( $email ), true ),
						'user_email'   => $email,
						'user_pass'    => wp_generate_password( 24 ),
						'display_name' => $name,
						'role'         => 'chcs_staff',
					)
				);
				if ( is_wp_error( $uid ) ) {
					return chcs_err( 400, $uid->get_error_message() );
				}
				update_user_meta( $uid, 'chcs_type', $type );
				update_user_meta( $uid, 'chcs_designation', chcs_str( $req['designation'], 60 ) );
				update_user_meta( $uid, 'chcs_status', 'active' );
				update_user_meta( $uid, 'chcs_email_verified', 1 );
				update_user_meta( $uid, 'chcs_phone', chcs_str( $req['phone'], 30 ) );
				$token = chcs_token();
				update_user_meta( $uid, 'chcs_reset_hash', chcs_token_hash( $token ) );
				update_user_meta( $uid, 'chcs_reset_expires', time() + 7 * DAY_IN_SECONDS );
				chcs_mail( 'account_decision', $email, 'You have been invited to the CHCS Portal', "Hi {$name},\n\nAn account was created for you on the Complete Home Care Services staff portal. Set your password here (link valid 7 days):\n" . chcs_portal_url( 'reset/' . $token ), true );
				chcs_audit( $me, 'users.invite', $email );
				return chcs_user_pub( $uid, true );
			}
		);

		chcs_route(
			'PATCH',
			'/users/(?P<id>\d+)',
			'users',
			function ( $req, $me ) {
				$uid = (int) $req['id'];
				if ( ! chcs_is_portal_user( $uid ) ) {
					return chcs_err( 404, 'User not found.' );
				}
				if ( user_can( $uid, 'manage_options' ) && 'admin' !== chcs_user_type( $me ) ) {
					return chcs_err( 403, 'Only administrators can change another administrator.' );
				}
				if ( $uid === $me && $req['status'] && 'active' !== $req['status'] ) {
					return chcs_err( 400, 'You cannot deactivate your own account.' );
				}
				$before = chcs_user_status( $uid );
				if ( $req['name'] ) {
					wp_update_user( array( 'ID' => $uid, 'display_name' => chcs_str( $req['name'], 100 ) ) );
				}
				if ( null !== $req['phone'] ) {
					update_user_meta( $uid, 'chcs_phone', chcs_str( $req['phone'], 30 ) );
				}
				if ( null !== $req['designation'] ) {
					update_user_meta( $uid, 'chcs_designation', chcs_str( $req['designation'], 60 ) );
				}
				$type = (string) $req['type'];
				if ( in_array( $type, array( 'admin', 'office', 'field', 'applicant' ), true ) && ! user_can( $uid, 'manage_options' ) ) {
					if ( 'admin' === $type && 'admin' !== chcs_user_type( $me ) ) {
						return chcs_err( 403, 'Only admins can create admins.' );
					}
					update_user_meta( $uid, 'chcs_type', $type );
				}
				if ( in_array( $req['status'], array( 'pending', 'active', 'rejected', 'suspended' ), true ) && ! user_can( $uid, 'manage_options' ) ) {
					update_user_meta( $uid, 'chcs_status', $req['status'] );
					if ( 'suspended' === $req['status'] ) {
						WP_Session_Tokens::get_instance( $uid )->destroy_all();
					}
				}
				$params = $req->get_json_params();
				if ( is_array( $params ) && array_key_exists( 'schedule', $params ) ) {
					$sch = chcs_schedule_input( $params['schedule'] );
					if ( $sch ) {
						update_user_meta( $uid, 'chcs_schedule', $sch );
					} else {
						delete_user_meta( $uid, 'chcs_schedule' );
					}
				}
				if ( is_array( $params ) && array_key_exists( 'permissions', $params ) ) {
					if ( null === $params['permissions'] ) {
						delete_user_meta( $uid, 'chcs_permissions' );
					} elseif ( is_array( $params['permissions'] ) ) {
						update_user_meta( $uid, 'chcs_permissions', array_values( array_intersect( array_map( 'strval', $params['permissions'] ), chcs_modules() ) ) );
					}
				}
				$after = chcs_user_status( $uid );
				if ( $before !== $after && in_array( $after, array( 'active', 'rejected' ), true ) ) {
					$u = get_userdata( $uid );
					chcs_mail(
						'account_decision',
						$u->user_email,
						'active' === $after ? 'Your CHCS Portal account is approved' : 'Your CHCS Portal account request',
						'active' === $after ? "Hi {$u->display_name},\n\nYour account has been approved. Sign in here:\n" . chcs_portal_url() : "Hi {$u->display_name},\n\nYour account request was not approved. Please contact the office with any questions."
					);
				}
				chcs_audit( $me, 'users.update', get_userdata( $uid )->user_email . ( $before !== $after ? " status {$before}→{$after}" : '' ) );
				return chcs_user_pub( $uid, true );
			}
		);

		/* ---- designations */
		$save_des = function ( $list ) {
			update_option( 'chcs_designations', array_values( $list ), false );
		};
		$des_input = function ( $req ) {
			$params = $req->get_json_params();
			return array(
				'name'        => chcs_str( $req['name'], 60 ),
				'type'        => 'field' === $req['type'] ? 'field' : 'office',
				'permissions' => isset( $params['permissions'] ) && is_array( $params['permissions'] ) ? array_values( array_intersect( array_map( 'strval', $params['permissions'] ), chcs_modules() ) ) : null,
			);
		};
		chcs_route(
			'POST',
			'/designations',
			'users',
			function ( $req, $me ) use ( $save_des, $des_input ) {
				$in = $des_input( $req );
				if ( ! $in['name'] ) {
					return chcs_err( 400, 'Name required.' );
				}
				$list = chcs_designations();
				$max  = $list ? max( wp_list_pluck( $list, 'id' ) ) : 0;
				$d    = array( 'id' => $max + 1, 'name' => $in['name'], 'type' => $in['type'], 'permissions' => $in['permissions'] ? $in['permissions'] : array() );
				$list[] = $d;
				$save_des( $list );
				chcs_audit( $me, 'designations.create', $d['name'] );
				return $d;
			}
		);
		chcs_route(
			'PATCH',
			'/designations/(?P<id>\d+)',
			'users',
			function ( $req, $me ) use ( $save_des, $des_input ) {
				$list = chcs_designations();
				$in   = $des_input( $req );
				foreach ( $list as &$d ) {
					if ( (int) $d['id'] === (int) $req['id'] ) {
						if ( $in['name'] && $in['name'] !== $d['name'] ) {
							foreach ( chcs_portal_users() as $uid ) {
								if ( get_user_meta( $uid, 'chcs_designation', true ) === $d['name'] ) {
									update_user_meta( $uid, 'chcs_designation', $in['name'] );
								}
							}
							$d['name'] = $in['name'];
						}
						if ( $req['type'] ) {
							$d['type'] = $in['type'];
						}
						if ( null !== $in['permissions'] ) {
							$d['permissions'] = $in['permissions'];
						}
						$save_des( $list );
						chcs_audit( $me, 'designations.update', $d['name'] );
						return $d;
					}
				}
				return chcs_err( 404, 'Not found.' );
			}
		);
		chcs_route(
			'DELETE',
			'/designations/(?P<id>\d+)',
			'users',
			function ( $req, $me ) use ( $save_des ) {
				$list = chcs_designations();
				foreach ( $list as $i => $d ) {
					if ( (int) $d['id'] === (int) $req['id'] ) {
						foreach ( chcs_portal_users() as $uid ) {
							if ( get_user_meta( $uid, 'chcs_designation', true ) === $d['name'] ) {
								return chcs_err( 400, 'Reassign the users with this designation first.' );
							}
						}
						unset( $list[ $i ] );
						$save_des( $list );
						chcs_audit( $me, 'designations.delete', $d['name'] );
						return array( 'ok' => true );
					}
				}
				return chcs_err( 404, 'Not found.' );
			}
		);

		/* ---- email & API settings */
		chcs_route(
			'GET',
			'/settings/email',
			'settings',
			function () {
				$s                 = chcs_email_settings();
				$key               = chcs_resend_key();
				$s['resendKeySet'] = (bool) $key;
				$s['resendKey']    = $key ? '••••••••' . substr( $key, -4 ) : '';
				$s['keyInConfig']  = defined( 'CHCS_RESEND_API_KEY' ) && CHCS_RESEND_API_KEY;
				return $s;
			}
		);
		chcs_route(
			'PUT',
			'/settings/email',
			'settings',
			function ( $req, $me ) {
				$s = chcs_email_settings();
				if ( in_array( $req['provider'], array( 'resend', 'wordpress' ), true ) ) {
					$s['provider'] = $req['provider'];
				}
				foreach ( array( 'fromName' ) as $k ) {
					if ( null !== $req[ $k ] ) {
						$s[ $k ] = chcs_str( $req[ $k ], 120 );
					}
				}
				foreach ( array( 'fromEmail', 'replyTo', 'adminEmail' ) as $k ) {
					if ( null !== $req[ $k ] ) {
						$s[ $k ] = sanitize_email( (string) $req[ $k ] );
					}
				}
				$key = (string) $req['resendKey'];
				if ( $key && 0 !== strpos( $key, '••' ) ) {
					if ( ! preg_match( '/^re_[A-Za-z0-9_]+$/', $key ) ) {
						return chcs_err( 400, 'That does not look like a Resend API key (it should start with re_).' );
					}
					$s['resendKey'] = $key;
				}
				if ( $req['clearResendKey'] ) {
					$s['resendKey'] = '';
				}
				$params = $req->get_json_params();
				if ( isset( $params['templates'] ) && is_array( $params['templates'] ) ) {
					foreach ( $s['templates'] as $k => $v ) {
						if ( array_key_exists( $k, $params['templates'] ) ) {
							$s['templates'][ $k ] = (bool) $params['templates'][ $k ];
						}
					}
				}
				update_option( 'chcs_email_settings', $s, false );
				chcs_audit( $me, 'settings.email', 'provider ' . $s['provider'] );
				return array( 'ok' => true );
			}
		);
		chcs_route(
			'POST',
			'/settings/email/test',
			'settings',
			function ( $req, $me ) {
				$s = chcs_email_settings();
				if ( 'resend' === $s['provider'] && ! chcs_resend_key() ) {
					return chcs_err( 400, 'Add your Resend API key first.' );
				}
				$to = sanitize_email( (string) $req['to'] );
				$to = $to ? $to : get_userdata( $me )->user_email;
				$ok = chcs_mail( 'test', $to, 'CHCS Portal test email', 'If you can read this, automatic emails from the CHCS Portal are working.', true );
				if ( ! $ok ) {
					$last = chcs_rec_query( 'emails', array(), 1 );
					return chcs_err( 502, 'The test email failed: ' . ( $last ? $last[0]['status'] : 'unknown error' ) );
				}
				return array(
					'ok'      => true,
					'message' => 'Test email sent to ' . $to . '.',
				);
			}
		);
		chcs_route(
			'GET',
			'/emails',
			'settings',
			function () {
				return chcs_rec_query( 'emails', array(), 200 );
			}
		);
		chcs_route(
			'GET',
			'/audit',
			'audit',
			function () {
				return array_map(
					function ( $a ) {
						$a['userName'] = chcs_user_name( $a['userId'] );
						return $a;
					},
					chcs_rec_query( 'audit', array(), 300 )
				);
			}
		);
	}
);
