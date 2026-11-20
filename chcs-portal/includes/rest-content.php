<?php
/**
 * Job applications, and news & posts.
 *
 * Posts with audience "public" are normal WordPress posts, so they appear in the
 * website's News section. Staff/office/field posts are a private post type
 * (chcs_announcement) that only shows inside the portal.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'init',
	function () {
		register_post_type(
			'chcs_announcement',
			array(
				'label'        => 'Staff announcements',
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => 'chcs-portal',
				'supports'     => array( 'title', 'editor', 'author' ),
				'menu_icon'    => 'dashicons-megaphone',
			)
		);
	}
);

function chcs_post_out( WP_Post $p ) {
	$aud = 'post' === $p->post_type ? 'public' : ( get_post_meta( $p->ID, 'chcs_audience', true ) ?: 'staff' );
	return array(
		'id'          => $p->ID,
		'title'       => get_the_title( $p ),
		'body'        => wp_strip_all_tags( $p->post_content ),
		'audience'    => $aud,
		'pinned'      => (bool) get_post_meta( $p->ID, 'chcs_pinned', true ),
		'status'      => 'publish' === $p->post_status ? 'published' : 'draft',
		'imageUrl'    => (string) get_the_post_thumbnail_url( $p, 'large' ) ?: (string) get_post_meta( $p->ID, 'chcs_image_url', true ),
		'authorId'    => (int) $p->post_author,
		'authorName'  => get_the_author_meta( 'display_name', $p->post_author ) ?: 'CHCS',
		'publishedAt' => get_post_time( 'c', true, $p ),
		'createdAt'   => get_post_time( 'c', true, $p ),
		'url'         => 'post' === $p->post_type ? get_permalink( $p ) : '',
	);
}

function chcs_visible_posts( $me ) {
	$manage = chcs_can( $me, 'news_manage' );
	$type   = chcs_user_type( $me );
	$posts  = get_posts(
		array(
			'post_type'      => array( 'post', 'chcs_announcement' ),
			'post_status'    => $manage ? array( 'publish', 'draft' ) : array( 'publish' ),
			'posts_per_page' => 60,
		)
	);
	$out = array();
	foreach ( $posts as $p ) {
		$o = chcs_post_out( $p );
		if ( 'applicant' === $type && 'public' !== $o['audience'] ) {
			continue;
		}
		if ( 'office' === $o['audience'] && ! in_array( $type, array( 'office', 'admin' ), true ) ) {
			continue;
		}
		if ( 'field' === $o['audience'] && ! in_array( $type, array( 'field', 'admin' ), true ) ) {
			continue;
		}
		$out[] = $o;
	}
	usort(
		$out,
		function ( $a, $b ) {
			return ( (int) $b['pinned'] - (int) $a['pinned'] ) ?: strcmp( $b['publishedAt'], $a['publishedAt'] );
		}
	);
	return $out;
}

function chcs_save_post( $req, $me, $id = 0 ) {
	$title = chcs_str( $req['title'], 200 );
	if ( ! $title ) {
		return chcs_err( 400, 'Title required.' );
	}
	$aud    = in_array( $req['audience'], array( 'public', 'staff', 'office', 'field' ), true ) ? $req['audience'] : 'staff';
	$status = 'draft' === $req['status'] ? 'draft' : 'publish';
	$arr    = array(
		'post_title'   => $title,
		'post_content' => wp_kses_post( wpautop( chcs_text( $req['body'], 20000 ) ) ),
		'post_status'  => $status,
		'post_type'    => 'public' === $aud ? 'post' : 'chcs_announcement',
	);
	if ( $id ) {
		$arr['ID'] = $id;
	} else {
		$arr['post_author'] = $me;
	}
	$pid = $id ? wp_update_post( $arr, true ) : wp_insert_post( $arr, true );
	if ( is_wp_error( $pid ) ) {
		return chcs_err( 400, $pid->get_error_message() );
	}
	update_post_meta( $pid, 'chcs_audience', $aud );
	update_post_meta( $pid, 'chcs_pinned', $req['pinned'] ? 1 : 0 );
	update_post_meta( $pid, 'chcs_image_url', esc_url_raw( (string) $req['imageUrl'] ) );
	return get_post( $pid );
}

add_action(
	'rest_api_init',
	function () {

		/* ---- applications (the applicant must have verified their email) */
		chcs_route(
			'GET',
			'/application',
			'user',
			function ( $req, $me ) {
				if ( ! get_user_meta( $me, 'chcs_email_verified', true ) && ! user_can( $me, 'manage_options' ) ) {
					return chcs_err( 403, 'Verify your email first.' );
				}
				$a = chcs_rec_query( 'applications', array( 'owner' => $me ), 1 );
				return $a ? $a[0] : null;
			}
		);

		chcs_route(
			'PUT',
			'/application',
			'user',
			function ( $req, $me ) {
				if ( ! get_user_meta( $me, 'chcs_email_verified', true ) ) {
					return chcs_err( 403, 'Verify your email first.' );
				}
				$cur = chcs_rec_query( 'applications', array( 'owner' => $me ), 1 );
				$a   = $cur ? $cur[0] : null;
				if ( $a && 'draft' !== $a['status'] ) {
					return chcs_err( 400, 'Your application was already submitted.' );
				}
				$d    = (array) $req['data'];
				$data = array();
				foreach ( array( 'position', 'availability', 'certification', 'licenseNumber', 'experience', 'languages', 'references', 'workAuth', 'signature', 'boroughs' ) as $k ) {
					$data[ $k ] = chcs_text( $d[ $k ] ?? '', 2000 );
				}
				$data['attestation'] = ! empty( $d['attestation'] );
				$submit              = (bool) $req['submit'];
				if ( $submit ) {
					if ( ! $data['position'] || ! $data['availability'] || ! $data['experience'] ) {
						return chcs_err( 400, 'Position, availability and experience are required.' );
					}
					if ( ! $data['attestation'] || ! $data['signature'] ) {
						return chcs_err( 400, 'Please confirm the attestation and sign.' );
					}
				}
				$fields = array( 'userId' => $me, 'data' => $data, 'status' => $submit ? 'submitted' : 'draft' );
				if ( $submit ) {
					$fields['submittedAt'] = chcs_now_iso();
				}
				$a = $a ? chcs_rec_update( 'applications', $a['id'], $fields ) : chcs_rec_insert( 'applications', $fields );
				if ( $submit ) {
					$u = get_userdata( $me );
					chcs_notify_admins( 'application_received', 'New employment application: ' . $u->display_name, "{$u->display_name} applied for {$data['position']}.\n\nReview it here:\n" . chcs_portal_url( 'applications' ) );
					chcs_mail( 'application_received', $u->user_email, 'We received your application', "Hi {$u->display_name},\n\nThank you for applying to Complete Home Care Services. Our HR team will review your application and contact you." );
					chcs_audit( $me, 'application.submit', $data['position'] );
				}
				return $a;
			}
		);

		chcs_route(
			'GET',
			'/applications',
			'applications',
			function () {
				$out = array();
				foreach ( chcs_rec_query( 'applications', array( 'status' => array( 'submitted', 'approved', 'rejected' ) ) ) as $a ) {
					$u           = get_userdata( $a['userId'] );
					$a['userName'] = $u ? $u->display_name : '—';
					$a['email']    = $u ? $u->user_email : '';
					$a['phone']    = (string) get_user_meta( $a['userId'], 'chcs_phone', true );
					$out[]         = $a;
				}
				return $out;
			}
		);

		chcs_route(
			'POST',
			'/applications/(?P<id>\d+)/decision',
			'applications',
			function ( $req, $me ) {
				$a = chcs_rec_get( 'applications', (int) $req['id'] );
				if ( ! $a || 'submitted' !== $a['status'] ) {
					return chcs_err( 400, 'This application is not waiting for a decision.' );
				}
				$approve = 'approve' === $req['decision'];
				$note    = chcs_text( $req['note'], 1000 );
				chcs_rec_update( 'applications', $a['id'], array( 'status' => $approve ? 'approved' : 'rejected', 'decidedBy' => $me, 'decidedAt' => chcs_now_iso(), 'decisionNote' => $note ) );
				$uid = (int) $a['userId'];
				$u   = get_userdata( $uid );
				if ( $approve && $u ) {
					$des = chcs_str( $req['designation'], 60 ) ?: ( $a['data']['position'] ?? 'HHA' );
					update_user_meta( $uid, 'chcs_type', 'field' );
					update_user_meta( $uid, 'chcs_status', 'active' );
					update_user_meta( $uid, 'chcs_designation', $des );
					$perm = array( 'chat', 'inservices', 'calendar' );
					foreach ( chcs_designations() as $d ) {
						if ( $d['name'] === $des ) {
							$perm = $d['permissions'];
						}
					}
					if ( $req['allowOrientation'] ) {
						$perm[] = 'orientation';
					}
					if ( $req['allowTimesheet'] ) {
						$perm[] = 'timesheet';
					}
					update_user_meta( $uid, 'chcs_permissions', array_values( array_unique( $perm ) ) );
				}
				if ( $u ) {
					chcs_mail(
						'application_decision',
						$u->user_email,
						$approve ? 'Welcome to Complete Home Care Services!' : 'Your application to Complete Home Care Services',
						$approve ? "Hi {$u->display_name},\n\nCongratulations — your application was approved. Sign in to the CHCS Portal to " . ( $req['allowOrientation'] ? 'start your orientation' : 'get started' ) . ":\n" . chcs_portal_url() . ( $note ? "\n\n{$note}" : '' ) : "Hi {$u->display_name},\n\nThank you for your interest in Complete Home Care Services. We are not able to move forward at this time." . ( $note ? "\n\n{$note}" : '' )
					);
				}
				chcs_audit( $me, 'application.' . ( $approve ? 'approved' : 'rejected' ), $u ? $u->user_email : '' );
				return array( 'ok' => true );
			}
		);

		/* ---- news & posts */
		chcs_route(
			'GET',
			'/posts',
			null,
			function ( $req ) {
				$me = get_current_user_id();
				if ( '1' === (string) $req['public'] || ! $me || ! chcs_is_portal_user( $me ) ) {
					return array_map( 'chcs_post_out', get_posts( array( 'post_type' => 'post', 'posts_per_page' => 10 ) ) );
				}
				return chcs_visible_posts( $me );
			}
		);

		chcs_route(
			'POST',
			'/posts',
			'news_manage',
			function ( $req, $me ) {
				$p = chcs_save_post( $req, $me );
				if ( is_wp_error( $p ) ) {
					return $p;
				}
				$o = chcs_post_out( $p );
				if ( 'published' === $o['status'] && 'public' !== $o['audience'] ) {
					foreach ( chcs_portal_users( 'active' ) as $uid ) {
						$t = chcs_user_type( $uid );
						if ( $uid === $me || 'applicant' === $t || ( 'office' === $o['audience'] && 'field' === $t ) || ( 'field' === $o['audience'] && 'office' === $t ) ) {
							continue;
						}
						$u = get_userdata( $uid );
						chcs_mail( 'new_post', $u->user_email, 'CHCS news: ' . $o['title'], mb_substr( $o['body'], 0, 600 ) . "\n\n" . chcs_portal_url( 'news' ) );
					}
				}
				chcs_audit( $me, 'posts.create', $o['title'] );
				return $o;
			}
		);

		chcs_route(
			'PATCH',
			'/posts/(?P<id>\d+)',
			'news_manage',
			function ( $req, $me ) {
				$p = get_post( (int) $req['id'] );
				if ( ! $p || ! in_array( $p->post_type, array( 'post', 'chcs_announcement' ), true ) ) {
					return chcs_err( 404, 'Not found.' );
				}
				$cur = chcs_post_out( $p );
				$in  = new WP_REST_Request();
				foreach ( array( 'title', 'body', 'audience', 'pinned', 'status', 'imageUrl' ) as $k ) {
					$in[ $k ] = null !== $req[ $k ] ? $req[ $k ] : $cur[ $k ];
				}
				if ( ( 'public' === $in['audience'] ) !== ( 'post' === $p->post_type ) ) {
					// Audience moved between website and portal-only: recreate as the other post type.
					$new = chcs_save_post( $in, (int) $p->post_author );
					if ( is_wp_error( $new ) ) {
						return $new;
					}
					wp_trash_post( $p->ID );
					$p = $new;
				} else {
					$p = chcs_save_post( $in, $me, $p->ID );
					if ( is_wp_error( $p ) ) {
						return $p;
					}
				}
				chcs_audit( $me, 'posts.update', $p->post_title );
				return chcs_post_out( $p );
			}
		);

		chcs_route(
			'DELETE',
			'/posts/(?P<id>\d+)',
			'news_manage',
			function ( $req, $me ) {
				$p = get_post( (int) $req['id'] );
				if ( ! $p || ! in_array( $p->post_type, array( 'post', 'chcs_announcement' ), true ) ) {
					return chcs_err( 404, 'Not found.' );
				}
				wp_trash_post( $p->ID );
				chcs_audit( $me, 'posts.delete', $p->post_title );
				return array( 'ok' => true );
			}
		);
	}
);
