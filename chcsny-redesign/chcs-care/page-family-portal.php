<?php
/**
 * Patients & Families page (slug "family-portal").
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => __( 'Patients & families', 'chcs-care' ), 'lead' => __( 'Resources, rights and answers to help you and your loved ones through every step of care.', 'chcs-care' ) ) );
$portal = chcs_opt( 'portal_url' );
?>
<section class="section">
	<div class="container">
		<div class="grid grid--3">
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'lock' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Family portal login', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Securely view visit schedules and updates for your loved one.', 'chcs-care' ); ?></p>
				<?php if ( $portal ) : ?><a class="btn btn--teal" href="<?php echo esc_url( $portal ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Log in', 'chcs-care' ); ?></a><?php else : ?><a class="card__link" href="<?php echo esc_attr( chcs_tel( chcs_opt( 'phone' ) ) ); ?>"><?php esc_html_e( 'Call to request access', 'chcs-care' ); ?></a><?php endif; ?>
			</div>
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'clipboard' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Patient rights', 'chcs-care' ); ?></h3><p><?php esc_html_e( 'Read your rights and responsibilities as a home care patient, and our Notice of Privacy Practices.', 'chcs-care' ); ?></p><a class="card__link" href="<?php echo esc_url( chcs_page_url( 'privacy-policy-notice' ) ); ?>"><?php esc_html_e( 'View notice', 'chcs-care' ); ?></a></div>
			<div class="card reveal"><div class="card__icon"><?php echo chcs_icon( 'shield' ); // phpcs:ignore ?></div><h3><?php esc_html_e( 'Report a concern', 'chcs-care' ); ?></h3><p><?php echo esc_html( sprintf( /* translators: 1 phone 2 hours */ __( 'Confidential Compliance Hotline: %1$s (%2$s). Anonymous reports welcome.', 'chcs-care' ), chcs_opt( 'hotline' ), chcs_opt( 'hotline_hours' ) ) ); ?></p><a class="card__link" href="<?php echo esc_attr( chcs_tel( chcs_opt( 'hotline' ) ) ); ?>"><?php esc_html_e( 'Call hotline', 'chcs-care' ); ?></a></div>
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
get_template_part( 'template-parts/faq' );
get_template_part( 'template-parts/contact-block', null, array( 'type' => 'request' ) );
get_footer();
