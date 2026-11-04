<?php
/**
 * Careers page (slug "careers").
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => __( 'Careers at CHCS', 'chcs-care' ), 'lead' => __( 'Do meaningful work, one patient at a time. Join our team of nurses and therapists.', 'chcs-care' ) ) );
?>
<section class="section">
	<div class="container">
		<div class="grid grid--4">
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'calendar' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Flexible schedules', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Build a caseload that fits your life.', 'chcs-care' ); ?></p></div>
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'users' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Supportive team', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Clinical managers who have your back.', 'chcs-care' ); ?></p></div>
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'pin' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Work locally', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Visits in the borough you live in.', 'chcs-care' ); ?></p></div>
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'heart' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Real impact', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'One-on-one care that changes lives.', 'chcs-care' ); ?></p></div>
		</div>
		<div class="entry-content" style="margin-top:56px">
			<?php
			while ( have_posts() ) :
				the_post();
				the_content();
			endwhile;
			?>
		</div>
	</div>
</section>
<?php
get_template_part( 'template-parts/contact-block', null, array( 'type' => 'careers', 'title' => __( 'Apply or ask about openings', 'chcs-care' ) ) );
get_footer();
