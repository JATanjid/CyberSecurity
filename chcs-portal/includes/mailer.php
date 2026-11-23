<?php
/**
 * Automatic emails: Resend API (recommended) or WordPress mail.
 *
 * The Resend API key can be stored from the portal (Admin → Email & API) or,
 * more securely, defined in wp-config.php:  define( 'CHCS_RESEND_API_KEY', 're_...' );
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_email_defaults() {
	return array(
		'provider'   => 'wordpress',
		'resendKey'  => '',
		'fromName'   => 'Complete Home Care Services',
		'fromEmail'  => 'no-reply@' . wp_parse_url( home_url(), PHP_URL_HOST ),
		'replyTo'    => get_option( 'admin_email' ),
		'adminEmail' => get_option( 'admin_email' ),
		'templates'  => array(
			'verify'               => true,
			'password_reset'       => true,
			'signup_admin'         => true,
			'account_decision'     => true,
			'application_received' => true,
			'application_decision' => true,
			'time_decision'        => true,
			'shift_assigned'       => true,
			'inservice_assigned'   => true,
			'leave_request'        => true,
			'leave_decision'       => true,
			'call_assigned'        => true,
			'task_assigned'        => true,
			'task_reminder'        => true,
			'new_post'             => false,
		),
	);
}

function chcs_email_settings() {
	$s = get_option( 'chcs_email_settings', array() );
	$d = chcs_email_defaults();
	$s = array_merge( $d, is_array( $s ) ? $s : array() );
	$s['templates'] = array_merge( $d['templates'], isset( $s['templates'] ) && is_array( $s['templates'] ) ? $s['templates'] : array() );
	return $s;
}

function chcs_resend_key() {
	if ( defined( 'CHCS_RESEND_API_KEY' ) && CHCS_RESEND_API_KEY ) {
		return CHCS_RESEND_API_KEY;
	}
	$s = chcs_email_settings();
	return $s['resendKey'];
}

/**
 * Send one email (if its template is enabled) and log it (without the body).
 *
 * @return bool sent
 */
function chcs_mail( $template, $to, $subject, $body, $force = false ) {
	$s = chcs_email_settings();
	if ( ! $force && isset( $s['templates'][ $template ] ) && ! $s['templates'][ $template ] ) {
		return false;
	}
	if ( ! is_email( $to ) ) {
		return false;
	}
	$body .= "\n\n— Complete Home Care Services\n" . home_url( '/' );
	$ok    = false;
	$via   = 'WordPress mail';
	$error = '';

	if ( 'resend' === $s['provider'] && chcs_resend_key() ) {
		$via  = 'Resend';
		$resp = wp_remote_post(
			'https://api.resend.com/emails',
			array(
				'timeout' => 15,
				'headers' => array(
					'Authorization' => 'Bearer ' . chcs_resend_key(),
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode(
					array_filter(
						array(
							'from'     => sprintf( '%s <%s>', $s['fromName'], $s['fromEmail'] ),
							'to'       => array( $to ),
							'subject'  => $subject,
							'text'     => $body,
							'html'     => chcs_mail_html( $subject, $body ),
							'reply_to' => $s['replyTo'] ? $s['replyTo'] : null,
						)
					)
				),
			)
		);
		$code = is_wp_error( $resp ) ? 0 : wp_remote_retrieve_response_code( $resp );
		$ok   = $code >= 200 && $code < 300;
		if ( ! $ok ) {
			$error = is_wp_error( $resp ) ? $resp->get_error_message() : 'HTTP ' . $code . ' ' . mb_substr( wp_remote_retrieve_body( $resp ), 0, 160 );
		}
	} else {
		$headers = array( 'Content-Type: text/html; charset=UTF-8', sprintf( 'From: %s <%s>', $s['fromName'], $s['fromEmail'] ) );
		if ( $s['replyTo'] ) {
			$headers[] = 'Reply-To: ' . $s['replyTo'];
		}
		$ok = wp_mail( $to, $subject, chcs_mail_html( $subject, $body ), $headers );
		if ( ! $ok ) {
			$error = 'wp_mail failed (install WP Mail SMTP or connect Resend)';
		}
	}

	chcs_rec_insert(
		'emails',
		array(
			'template' => $template,
			'to'       => $to,
			'subject'  => $subject,
			'provider' => $via,
			'status'   => $ok ? 'sent' : 'failed: ' . $error,
		)
	);
	$all = chcs_rec_query( 'emails', array(), 0 );
	if ( count( $all ) > 500 ) {
		foreach ( array_slice( $all, 500 ) as $old ) {
			chcs_rec_delete( 'emails', $old['id'] );
		}
	}
	return $ok;
}

/** Branded HTML version of a plain-text email. Links become buttons-friendly anchors. */
function chcs_mail_html( $subject, $text ) {
	$logo = CHCS_PORTAL_URL . 'app/assets/logo.png';
	$html = nl2br( esc_html( $text ) );
	$html = preg_replace( '~(https?://[^\s<]+)~', '<a href="$1" style="color:#5a62b5;font-weight:600;word-break:break-all">$1</a>', $html );
	return '<!doctype html><html><body style="margin:0;background:#f4f5fb;font-family:Arial,Helvetica,sans-serif;color:#151a3b">'
		. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">'
		. '<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e4e6f1" cellpadding="0" cellspacing="0">'
		. '<tr><td style="padding:22px 28px;border-bottom:1px solid #eef0f7"><img src="' . esc_url( $logo ) . '" width="40" alt="" style="vertical-align:middle"> <b style="font-size:16px;vertical-align:middle;margin-left:8px">Complete Home Care Services</b></td></tr>'
		. '<tr><td style="padding:26px 28px;font-size:15px;line-height:1.6"><h2 style="margin:0 0 14px;font-size:19px">' . esc_html( $subject ) . '</h2>' . $html . '</td></tr>'
		. '</table><p style="font-size:12px;color:#6b7194">117-03 203rd Street, St. Albans, NY 11412 · (718) 528-5493</p></td></tr></table></body></html>';
}

function chcs_notify_admins( $template, $subject, $body ) {
	$s  = chcs_email_settings();
	$to = $s['adminEmail'] ? $s['adminEmail'] : get_option( 'admin_email' );
	chcs_mail( $template, $to, $subject, $body );
}
