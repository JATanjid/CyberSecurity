<?php
/**
 * Call-to-action band.
 *
 * @package chcs-care
 */
$title = isset( $args['title'] ) ? $args['title'] : __( 'Ready to bring care home?', 'chcs-care' );
$text  = isset( $args['text'] ) ? $args['text'] : __( 'Speak with our intake team today — we’ll answer your questions and help you get started.', 'chcs-care' );
?>
<section class="section section--tight">
	<div class="container">
		<div class="cta-band reveal">
			<div>
				<h2><?php echo esc_html( $title ); ?></h2>
				<p><?php echo esc_html( $text ); ?></p>
			</div>
			<div class="cta-band__actions">
				<a class="btn btn--light" href="<?php echo esc_attr( chcs_tel( chcs_opt( 'phone' ) ) ); ?>"><?php echo chcs_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( chcs_opt( 'phone' ) ); ?></a>
				<a class="btn btn--ghost" href="<?php echo esc_url( chcs_page_url( 'contact-us' ) ); ?>#request"><?php esc_html_e( 'Request care online', 'chcs-care' ); ?></a>
			</div>
		</div>
	</div>
</section>
