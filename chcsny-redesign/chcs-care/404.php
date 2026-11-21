<?php
/**
 * 404.
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'lead' => __( 'The page you’re looking for may have moved. Try one of these links, or call us for help.', 'chcs-care' ) ) );
?>
<section class="section">
	<div class="container">
		<div class="hero__actions">
			<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to homepage', 'chcs-care' ); ?></a>
			<a class="btn btn--ghost" href="<?php echo esc_url( chcs_page_url( 'services' ) ); ?>"><?php esc_html_e( 'Our services', 'chcs-care' ); ?></a>
			<a class="btn btn--ghost" href="<?php echo esc_url( chcs_page_url( 'contact-us' ) ); ?>"><?php esc_html_e( 'Contact us', 'chcs-care' ); ?></a>
		</div>
		<?php get_search_form(); ?>
	</div>
</section>
<?php
get_footer();
