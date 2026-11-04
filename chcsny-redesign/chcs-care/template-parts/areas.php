<?php
/**
 * Service areas chips.
 *
 * @package chcs-care
 */
?>
<section class="section section--tight">
	<div class="container">
		<div class="section-head section-head--center">
			<span class="eyebrow"><?php esc_html_e( 'Where we serve', 'chcs-care' ); ?></span>
			<h2><?php esc_html_e( 'Caring for all five boroughs & Nassau', 'chcs-care' ); ?></h2>
		</div>
		<div class="areas">
			<?php foreach ( chcs_service_areas() as $area ) : ?>
				<span class="area"><?php echo chcs_icon( 'pin' ); // phpcs:ignore ?><?php echo esc_html( $area ); ?></span>
			<?php endforeach; ?>
		</div>
	</div>
</section>
