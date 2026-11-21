<?php
/**
 * Single post.
 *
 * @package chcs-care
 */
get_header();
while ( have_posts() ) :
	the_post();
	get_template_part( 'template-parts/page-hero', null, array( 'eyebrow' => get_the_date() ) );
	?>
	<article class="section">
		<div class="container entry-content">
			<?php if ( has_post_thumbnail() ) : ?>
				<?php the_post_thumbnail( 'large', array( 'style' => 'margin-bottom:32px' ) ); ?>
			<?php endif; ?>
			<?php the_content(); ?>
			<hr style="margin:48px 0;border:0;border-top:1px solid var(--line)">
			<?php the_post_navigation( array( 'prev_text' => '← %title', 'next_text' => '%title →' ) ); ?>
		</div>
	</article>
	<?php
endwhile;
get_template_part( 'template-parts/cta' );
get_footer();
