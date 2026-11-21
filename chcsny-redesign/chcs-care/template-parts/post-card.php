<?php
/**
 * Post card used in news listings.
 *
 * @package chcs-care
 */
?>
<article <?php post_class( 'post-card reveal' ); ?>>
	<a href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
		<?php if ( has_post_thumbnail() ) : ?>
			<?php the_post_thumbnail( 'chcs-card', array( 'class' => 'post-card__img', 'loading' => 'lazy', 'alt' => '' ) ); ?>
		<?php else : ?>
			<div class="post-card__img"></div>
		<?php endif; ?>
	</a>
	<div class="post-card__body">
		<div class="post-card__meta"><?php echo esc_html( get_the_date() ); ?></div>
		<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<p><?php echo esc_html( get_the_excerpt() ); ?></p>
		<a class="card__link" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read more', 'chcs-care' ); ?><span class="screen-reader-text"> — <?php the_title(); ?></span></a>
	</div>
</article>
