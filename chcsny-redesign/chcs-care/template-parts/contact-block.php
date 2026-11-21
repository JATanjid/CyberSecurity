<?php
/**
 * Contact info + form. $args['type'] = request|referral|careers|contact.
 *
 * @package chcs-care
 */
$type    = isset( $args['type'] ) ? $args['type'] : 'request';
$address = chcs_opt( 'street' ) . ', ' . chcs_opt( 'city' ) . ', ' . chcs_opt( 'state' ) . ' ' . chcs_opt( 'zip' );
?>
<section class="section section--cream" id="request">
	<div class="container">
		<div class="split" style="align-items:start">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Get in touch', 'chcs-care' ); ?></span>
				<h2><?php echo isset( $args['title'] ) ? esc_html( $args['title'] ) : esc_html__( 'We’re here to help', 'chcs-care' ); ?></h2>
				<p class="lead"><?php esc_html_e( 'Call us, email us, or send the form and an intake coordinator will reach out within one business day.', 'chcs-care' ); ?></p>
				<ul class="info-list">
					<li><span class="ico"><?php echo chcs_icon( 'phone' ); // phpcs:ignore ?></span><div><strong><?php esc_html_e( 'Main office', 'chcs-care' ); ?></strong><a href="<?php echo esc_attr( chcs_tel( chcs_opt( 'phone' ) ) ); ?>"><?php echo esc_html( chcs_opt( 'phone' ) ); ?></a></div></li>
					<li><span class="ico"><?php echo chcs_icon( 'mail' ); // phpcs:ignore ?></span><div><strong><?php esc_html_e( 'Email', 'chcs-care' ); ?></strong><a href="mailto:<?php echo esc_attr( antispambot( chcs_opt( 'email' ) ) ); ?>"><?php echo esc_html( antispambot( chcs_opt( 'email' ) ) ); ?></a></div></li>
					<li><span class="ico"><?php echo chcs_icon( 'pin' ); // phpcs:ignore ?></span><div><strong><?php esc_html_e( 'Office', 'chcs-care' ); ?></strong><span><?php echo esc_html( $address ); ?></span></div></li>
					<?php if ( chcs_opt( 'hours' ) ) : ?>
						<li><span class="ico"><?php echo chcs_icon( 'clock' ); // phpcs:ignore ?></span><div><strong><?php esc_html_e( 'Hours', 'chcs-care' ); ?></strong><span><?php echo esc_html( chcs_opt( 'hours' ) ); ?></span></div></li>
					<?php endif; ?>
					<li><span class="ico"><?php echo chcs_icon( 'shield' ); // phpcs:ignore ?></span><div><strong><?php esc_html_e( 'Compliance Hotline', 'chcs-care' ); ?></strong><a href="<?php echo esc_attr( chcs_tel( chcs_opt( 'hotline' ) ) ); ?>"><?php echo esc_html( chcs_opt( 'hotline' ) ); ?></a> <span>· <?php echo esc_html( chcs_opt( 'hotline_hours' ) ); ?></span></div></li>
				</ul>
				<?php if ( ! empty( $args['map'] ) ) : ?>
					<iframe class="map-embed" loading="lazy" title="<?php esc_attr_e( 'Office location map', 'chcs-care' ); ?>" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=<?php echo rawurlencode( $address ); ?>&output=embed"></iframe>
				<?php endif; ?>
			</div>
			<div class="form-card">
				<h3><?php esc_html_e( 'Send us a message', 'chcs-care' ); ?></h3>
				<?php chcs_render_form( $type ); ?>
			</div>
		</div>
	</div>
</section>
