<?php
/**
 * Site footer.
 *
 * @package chcs-care
 */
$phone = chcs_opt( 'phone' );
?>
</main>

<footer class="site-footer">
	<div class="container">
		<div class="footer-grid">
			<div>
				<?php get_template_part( 'template-parts/brand' ); ?>
				<p><?php echo esc_html( sprintf( /* translators: %s year */ __( 'Licensed by the New York State Department of Health and accredited by The Joint Commission. Caring for New Yorkers at home since %s.', 'chcs-care' ), chcs_opt( 'founded' ) ) ); ?></p>
				<div class="social">
					<?php foreach ( array( 'facebook', 'instagram', 'linkedin' ) as $net ) : ?>
						<?php if ( chcs_opt( $net ) ) : ?>
							<a href="<?php echo esc_url( chcs_opt( $net ) ); ?>" target="_blank" rel="noopener"><span class="screen-reader-text"><?php echo esc_html( ucfirst( $net ) ); ?></span><?php echo chcs_icon( $net ); // phpcs:ignore ?></a>
						<?php endif; ?>
					<?php endforeach; ?>
				</div>
			</div>

			<div>
				<h4><?php esc_html_e( 'Services', 'chcs-care' ); ?></h4>
				<ul>
					<?php foreach ( chcs_services() as $s ) : ?>
						<li><a href="<?php echo esc_url( chcs_page_url( 'services' ) ); ?>#<?php echo esc_attr( sanitize_title( $s['title'] ) ); ?>"><?php echo esc_html( $s['title'] ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>

			<div>
				<h4><?php esc_html_e( 'Quick links', 'chcs-care' ); ?></h4>
				<?php
				if ( has_nav_menu( 'footer' ) ) {
					wp_nav_menu( array( 'theme_location' => 'footer', 'container' => false, 'depth' => 1 ) );
				} else {
					echo '<ul>';
					foreach ( array( 'about-us' => __( 'About Us', 'chcs-care' ), 'family-portal' => __( 'Patients & Families', 'chcs-care' ), 'referrals' => __( 'For Providers', 'chcs-care' ), 'careers' => __( 'Careers', 'chcs-care' ), 'news-blog' => __( 'News', 'chcs-care' ), 'contact-us' => __( 'Contact', 'chcs-care' ) ) as $slug => $label ) {
						printf( '<li><a href="%s">%s</a></li>', esc_url( chcs_page_url( $slug ) ), esc_html( $label ) );
					}
					echo '</ul>';
				}
				?>
			</div>

			<div>
				<h4><?php esc_html_e( 'Contact', 'chcs-care' ); ?></h4>
				<ul>
					<li><?php echo esc_html( chcs_opt( 'street' ) ); ?><br><?php echo esc_html( chcs_opt( 'city' ) . ', ' . chcs_opt( 'state' ) . ' ' . chcs_opt( 'zip' ) ); ?></li>
					<li><a href="<?php echo esc_attr( chcs_tel( $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a></li>
					<li><a href="mailto:<?php echo esc_attr( antispambot( chcs_opt( 'email' ) ) ); ?>"><?php echo esc_html( antispambot( chcs_opt( 'email' ) ) ); ?></a></li>
					<?php if ( chcs_opt( 'hours' ) ) : ?><li><?php echo esc_html( chcs_opt( 'hours' ) ); ?></li><?php endif; ?>
				</ul>
				<div class="footer-hotline">
					<strong><?php esc_html_e( 'Confidential Compliance Hotline', 'chcs-care' ); ?></strong>
					<a href="<?php echo esc_attr( chcs_tel( chcs_opt( 'hotline' ) ) ); ?>"><?php echo esc_html( chcs_opt( 'hotline' ) ); ?></a> · <?php echo esc_html( chcs_opt( 'hotline_hours' ) ); ?>
				</div>
			</div>
		</div>

		<div class="footer-bottom">
			<span>&copy; <?php echo esc_html( gmdate( 'Y' ) . ' ' . chcs_opt( 'org_name' ) ); ?> <?php esc_html_e( 'All rights reserved.', 'chcs-care' ); ?></span>
			<?php
			if ( has_nav_menu( 'legal' ) ) {
				wp_nav_menu( array( 'theme_location' => 'legal', 'container' => false, 'depth' => 1 ) );
			} else {
				echo '<ul>';
				foreach ( array( 'privacy-policy-notice' => __( 'Notice of Privacy Practices', 'chcs-care' ), 'non-discrimination' => __( 'Non-Discrimination Notice', 'chcs-care' ) ) as $slug => $label ) {
					printf( '<li><a href="%s">%s</a></li>', esc_url( chcs_page_url( $slug ) ), esc_html( $label ) );
				}
				if ( get_privacy_policy_url() ) {
					printf( '<li><a href="%s">%s</a></li>', esc_url( get_privacy_policy_url() ), esc_html__( 'Website Privacy', 'chcs-care' ) );
				}
				echo '</ul>';
			}
			?>
		</div>
	</div>
</footer>

<div class="mobile-callbar">
	<a href="<?php echo esc_attr( chcs_tel( $phone ) ); ?>"><?php esc_html_e( 'Call now', 'chcs-care' ); ?></a>
	<a href="<?php echo esc_url( chcs_page_url( 'contact-us' ) ); ?>#request"><?php esc_html_e( 'Request care', 'chcs-care' ); ?></a>
</div>

<?php wp_footer(); ?>
</body>
</html>
