<?php
/**
 * Services page (auto-applied to the page with slug "services").
 *
 * @package chcs-care
 */
get_header();
get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => __( 'What we do', 'chcs-care' ), 'lead' => __( 'Licensed nursing and rehabilitative therapies, coordinated with your physician and delivered in the comfort of home.', 'chcs-care' ) ) );
?>
<section class="section">
	<div class="container">
		<?php get_template_part( 'template-parts/services-grid', null, array( 'detailed' => true ) ); ?>
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
get_template_part( 'template-parts/steps' );
get_template_part( 'template-parts/faq' );
get_template_part( 'template-parts/cta' );
get_footer();
