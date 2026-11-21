<?php
/**
 * Inner page hero. Accepts $args['lead'] and $args['eyebrow'].
 *
 * @package chcs-care
 */
$lead    = isset( $args['lead'] ) ? $args['lead'] : '';
$eyebrow = isset( $args['eyebrow'] ) ? $args['eyebrow'] : '';
if ( ! $lead && is_singular() && has_excerpt() ) {
	$lead = get_the_excerpt();
}
?>
<section class="page-hero">
	<div class="container">
		<?php chcs_breadcrumbs(); ?>
		<?php if ( $eyebrow ) : ?><span class="eyebrow"><?php echo esc_html( $eyebrow ); ?></span><?php endif; ?>
		<h1><?php echo wp_kses_post( chcs_page_title() ); ?></h1>
		<?php if ( $lead ) : ?><p class="lead"><?php echo esc_html( $lead ); ?></p><?php endif; ?>
	</div>
</section>
