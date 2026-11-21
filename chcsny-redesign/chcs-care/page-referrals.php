<?php
/**
 * Referrals page for providers (slug "referrals").
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => __( 'For physicians & discharge planners', 'chcs-care' ), 'lead' => __( 'Fast, coordinated start of care for your patients across NYC and Nassau County.', 'chcs-care' ) ) );
?>
<section class="section">
	<div class="container">
		<div class="grid grid--3">
			<div class="step reveal"><h3><?php esc_html_e( 'Send the referral', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Call our intake line or submit the form below with your contact details.', 'chcs-care' ); ?></p></div>
			<div class="step reveal"><h3><?php esc_html_e( 'We verify & schedule', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'We confirm eligibility and insurance, then schedule the start-of-care visit.', 'chcs-care' ); ?></p></div>
			<div class="step reveal"><h3><?php esc_html_e( 'You stay informed', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Receive the plan of care for signature and ongoing updates on your patient’s progress.', 'chcs-care' ); ?></p></div>
		</div>
		<?php
		while ( have_posts() ) :
			the_post();
			if ( get_the_content() ) {
				echo '<div class="entry-content" style="margin-top:56px">';
				the_content();
				echo '</div>';
			}
		endwhile;
		?>
	</div>
</section>
<?php
get_template_part( 'template-parts/contact-block', null, array( 'type' => 'referral', 'title' => __( 'Make a referral', 'chcs-care' ) ) );
get_footer();
