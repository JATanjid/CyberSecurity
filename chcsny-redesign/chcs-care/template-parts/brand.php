<?php
/**
 * Logo / brand block. Uses the Custom Logo if set (Appearance → Customize → Site Identity).
 *
 * @package chcs-care
 */
if ( has_custom_logo() ) {
	the_custom_logo();
	return;
}
?>
<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
	<img class="brand__logo" src="<?php echo esc_url( CHCS_URI . '/assets/img/logo.png' ); ?>" alt="" width="46" height="50">
	<span class="brand__text">
		<span class="brand__name"><?php echo esc_html( chcs_opt( 'short_name' ) ); ?></span>
		<span class="brand__tag"><?php echo esc_html( chcs_opt( 'tagline' ) ); ?></span>
	</span>
</a>
