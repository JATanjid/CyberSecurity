<?php
/**
 * Contact page (slug "contact-us").
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => __( 'Contact', 'chcs-care' ), 'lead' => __( 'Questions about care, referrals or employment? We’d love to hear from you.', 'chcs-care' ) ) );
while ( have_posts() ) :
	the_post();
	if ( get_the_content() ) {
		echo '<section class="section section--tight"><div class="container entry-content">';
		the_content();
		echo '</div></section>';
	}
endwhile;
get_template_part( 'template-parts/contact-block', null, array( 'type' => 'request', 'map' => true ) );
get_footer();
