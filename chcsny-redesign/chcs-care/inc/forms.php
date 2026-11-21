<?php
/**
 * Built-in secure request / referral / contact form.
 * - Nonce protected, honeypot + time-trap anti-spam, sanitized, sent via wp_mail().
 * - IMPORTANT: Do not collect Protected Health Information (PHI) through email
 *   unless your mail setup is HIPAA compliant. The form intentionally asks only
 *   for contact details and a short, non-clinical message.
 *
 * @package chcs-care
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render the form.
 *
 * @param string $type One of request|referral|contact|careers.
 */
function chcs_render_form( $type = 'request' ) {
	$shortcode = chcs_opt( 'form_shortcode' );
	if ( $shortcode ) {
		echo do_shortcode( $shortcode );
		return;
	}

	$status = isset( $_GET['chcs_form'] ) ? sanitize_key( wp_unslash( $_GET['chcs_form'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( 'sent' === $status ) {
		echo '<div class="notice notice--ok" role="status">' . esc_html__( 'Thank you! Your message has been sent. Our team will contact you within one business day.', 'chcs-care' ) . '</div>';
	} elseif ( 'error' === $status ) {
		echo '<div class="notice notice--err" role="alert">' . esc_html__( 'Sorry, something went wrong. Please check the required fields or call us directly.', 'chcs-care' ) . '</div>';
	}

	$topics = array(
		'request'  => __( 'Request home care', 'chcs-care' ),
		'referral' => __( 'Make a referral (provider / discharge planner)', 'chcs-care' ),
		'careers'  => __( 'Employment inquiry', 'chcs-care' ),
		'contact'  => __( 'General question', 'chcs-care' ),
	);
	?>
	<form class="chcs-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="chcs_form">
		<input type="hidden" name="chcs_ts" value="<?php echo esc_attr( time() ); ?>">
		<?php wp_nonce_field( 'chcs_form', 'chcs_nonce' ); ?>
		<div class="hp-field" aria-hidden="true"><label>Website <input type="text" name="chcs_website" tabindex="-1" autocomplete="off"></label></div>
		<div class="form-grid">
			<div class="field"><label for="chcs-name-<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'Full name *', 'chcs-care' ); ?></label><input id="chcs-name-<?php echo esc_attr( $type ); ?>" name="chcs_name" type="text" autocomplete="name" required></div>
			<div class="field"><label for="chcs-phone-<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'Phone *', 'chcs-care' ); ?></label><input id="chcs-phone-<?php echo esc_attr( $type ); ?>" name="chcs_phone" type="tel" autocomplete="tel" required></div>
			<div class="field"><label for="chcs-email-<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'Email', 'chcs-care' ); ?></label><input id="chcs-email-<?php echo esc_attr( $type ); ?>" name="chcs_email" type="email" autocomplete="email"></div>
			<div class="field"><label for="chcs-area-<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'Borough / County', 'chcs-care' ); ?></label>
				<select id="chcs-area-<?php echo esc_attr( $type ); ?>" name="chcs_area">
					<option value=""><?php esc_html_e( 'Select…', 'chcs-care' ); ?></option>
					<?php foreach ( chcs_service_areas() as $area ) : ?>
						<option><?php echo esc_html( $area ); ?></option>
					<?php endforeach; ?>
					<option><?php esc_html_e( 'Other', 'chcs-care' ); ?></option>
				</select>
			</div>
			<div class="field full"><label for="chcs-topic-<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'How can we help?', 'chcs-care' ); ?></label>
				<select id="chcs-topic-<?php echo esc_attr( $type ); ?>" name="chcs_topic">
					<?php foreach ( $topics as $key => $label ) : ?>
						<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $type ); ?>><?php echo esc_html( $label ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<div class="field full"><label for="chcs-msg-<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'Message', 'chcs-care' ); ?></label><textarea id="chcs-msg-<?php echo esc_attr( $type ); ?>" name="chcs_message" placeholder="<?php esc_attr_e( 'Best time to call, services you are interested in…', 'chcs-care' ); ?>"></textarea></div>
		</div>
		<p class="form-note"><?php esc_html_e( 'Please do not include medical records, diagnoses or insurance ID numbers. Our intake team will collect that securely by phone.', 'chcs-care' ); ?></p>
		<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Send request', 'chcs-care' ); ?> <?php echo chcs_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	</form>
	<?php
}

/** Handle submissions (logged in & visitors). */
function chcs_handle_form() {
	$back = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$back = remove_query_arg( 'chcs_form', $back );

	$fail = function () use ( $back ) {
		wp_safe_redirect( add_query_arg( 'chcs_form', 'error', $back ) . '#request' );
		exit;
	};

	if ( ! isset( $_POST['chcs_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['chcs_nonce'] ) ), 'chcs_form' ) ) {
		$fail();
	}
	// Honeypot.
	if ( ! empty( $_POST['chcs_website'] ) ) {
		$fail();
	}
	// Time trap: bots submit instantly.
	$ts = isset( $_POST['chcs_ts'] ) ? absint( $_POST['chcs_ts'] ) : 0;
	if ( ! $ts || ( time() - $ts ) < 3 ) {
		$fail();
	}

	$name    = isset( $_POST['chcs_name'] ) ? sanitize_text_field( wp_unslash( $_POST['chcs_name'] ) ) : '';
	$phone   = isset( $_POST['chcs_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['chcs_phone'] ) ) : '';
	$email   = isset( $_POST['chcs_email'] ) ? sanitize_email( wp_unslash( $_POST['chcs_email'] ) ) : '';
	$area    = isset( $_POST['chcs_area'] ) ? sanitize_text_field( wp_unslash( $_POST['chcs_area'] ) ) : '';
	$topic   = isset( $_POST['chcs_topic'] ) ? sanitize_key( wp_unslash( $_POST['chcs_topic'] ) ) : 'contact';
	$message = isset( $_POST['chcs_message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['chcs_message'] ) ) : '';

	if ( '' === $name || '' === $phone ) {
		$fail();
	}

	$to = chcs_opt( 'form_to' );
	if ( ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	$subject = sprintf( '[%s] %s — %s', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), ucfirst( $topic ), $name );
	$body    = "Name: {$name}\nPhone: {$phone}\nEmail: {$email}\nArea: {$area}\nTopic: {$topic}\n\nMessage:\n{$message}\n\n-- Sent from " . home_url( '/' );
	$headers = array();
	if ( $email ) {
		$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
	}

	$sent = wp_mail( $to, $subject, $body, $headers );
	wp_safe_redirect( add_query_arg( 'chcs_form', $sent ? 'sent' : 'error', $back ) . '#request' );
	exit;
}
add_action( 'admin_post_nopriv_chcs_form', 'chcs_handle_form' );
add_action( 'admin_post_chcs_form', 'chcs_handle_form' );
