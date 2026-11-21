<?php
/**
 * Default page template.
 *
 * @package chcs-care
 */
get_header();
while ( have_posts() ) :
	the_post();
	get_template_part( 'template-parts/page-hero' );
	?>
	<section class="section">
		<div class="container entry-content">
			<?php the_content(); ?>
			<?php wp_link_pages(); ?>
		</div>
	</section>
	<?php
endwhile;
get_template_part( 'template-parts/cta' );
get_footer();
