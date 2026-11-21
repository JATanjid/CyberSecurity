<?php
/**
 * About page (slug "about-us").
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => __( 'Our story', 'chcs-care' ), 'lead' => sprintf( /* translators: %s year */ __( 'A trusted, local home health agency caring for New Yorkers since %s.', 'chcs-care' ), chcs_opt( 'founded' ) ) ) );
?>
<section class="section">
	<div class="container split" style="align-items:start">
		<div class="entry-content">
			<?php
			while ( have_posts() ) :
				the_post();
				the_content();
			endwhile;
			?>
		</div>
		<div class="grid" style="gap:16px">
			<div class="card"><div class="card__icon"><?php echo chcs_icon( 'heart' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Our mission', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'To deliver the highest quality nursing and rehabilitative services to patients in the comfort and dignity of their homes.', 'chcs-care' ); ?></p></div>
			<div class="card"><div class="card__icon"><?php echo chcs_icon( 'award' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Accredited & licensed', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Licensed by the New York State Department of Health and accredited by The Joint Commission.', 'chcs-care' ); ?></p></div>
			<div class="card"><div class="card__icon"><?php echo chcs_icon( 'users' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Our people', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Experienced RNs, LPNs and therapists who reflect the diverse communities we serve.', 'chcs-care' ); ?></p></div>
		</div>
	</div>
</section>
<?php
get_template_part( 'template-parts/areas' );
get_template_part( 'template-parts/cta' );
get_footer();
