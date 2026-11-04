<?php
/**
 * Services grid. $args['detailed'] shows bullet lists and anchors.
 *
 * @package chcs-care
 */
$detailed = ! empty( $args['detailed'] );
?>
<div class="grid grid--3">
	<?php foreach ( chcs_services() as $s ) : ?>
		<article class="card reveal" id="<?php echo esc_attr( sanitize_title( $s['title'] ) ); ?>">
			<div class="card__icon"><?php echo chcs_icon( $s['icon'] ); // phpcs:ignore ?></div>
			<h3><?php echo esc_html( $s['title'] ); ?></h3>
			<p><?php echo esc_html( $s['text'] ); ?></p>
			<?php if ( $detailed && ! empty( $s['items'] ) ) : ?>
				<ul><?php foreach ( $s['items'] as $item ) : ?><li><?php echo esc_html( $item ); ?></li><?php endforeach; ?></ul>
				<a class="card__link" href="<?php echo esc_url( chcs_page_url( 'contact-us' ) ); ?>#request"><?php esc_html_e( 'Request this service', 'chcs-care' ); ?></a>
			<?php else : ?>
				<a class="card__link" href="<?php echo esc_url( chcs_page_url( 'services' ) ); ?>#<?php echo esc_attr( sanitize_title( $s['title'] ) ); ?>"><?php esc_html_e( 'Learn more', 'chcs-care' ); ?></a>
			<?php endif; ?>
		</article>
	<?php endforeach; ?>
</div>
