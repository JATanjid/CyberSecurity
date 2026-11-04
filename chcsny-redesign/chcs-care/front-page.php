<?php
/**
 * Homepage.
 *
 * @package chcs-care
 */
get_header();
$hero_img  = chcs_opt( 'hero_image' );
$about_img = chcs_opt( 'about_image' );
$years     = (int) gmdate( 'Y' ) - (int) chcs_opt( 'founded' );
?>

<section class="hero">
	<div class="container">
		<div>
			<span class="eyebrow"><?php esc_html_e( 'Licensed Home Health Care · NYC & Nassau', 'chcs-care' ); ?></span>
			<h1><?php echo wp_kses( chcs_opt( 'hero_title' ), array( 'em' => array(), 'strong' => array(), 'br' => array() ) ); ?></h1>
			<p class="lead"><?php echo esc_html( chcs_opt( 'hero_text' ) ); ?></p>
			<div class="hero__actions">
				<a class="btn btn--primary" href="<?php echo esc_url( chcs_page_url( 'contact-us' ) ); ?>#request"><?php esc_html_e( 'Request Care', 'chcs-care' ); ?> <?php echo chcs_icon( 'arrow' ); // phpcs:ignore ?></a>
				<a class="btn btn--ghost" href="<?php echo esc_attr( chcs_tel( chcs_opt( 'phone' ) ) ); ?>"><?php echo chcs_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( chcs_opt( 'phone' ) ); ?></a>
			</div>
			<div class="hero__trust">
				<div><?php echo chcs_icon( 'shield' ); // phpcs:ignore ?><?php esc_html_e( 'NYS DOH Licensed', 'chcs-care' ); ?></div>
				<div><?php echo chcs_icon( 'award' ); // phpcs:ignore ?><?php esc_html_e( 'Joint Commission Accredited', 'chcs-care' ); ?></div>
				<div><?php echo chcs_icon( 'globe' ); // phpcs:ignore ?><?php esc_html_e( 'Multilingual staff', 'chcs-care' ); ?></div>
			</div>
		</div>
		<div class="hero__visual">
			<?php if ( $hero_img ) : ?>
				<img class="hero__img" src="<?php echo esc_url( $hero_img ); ?>" alt="<?php esc_attr_e( 'A CHCS nurse caring for a patient at home', 'chcs-care' ); ?>" fetchpriority="high">
			<?php else : ?>
				<img class="hero__img" src="<?php echo esc_url( CHCS_URI . '/assets/img/hero.svg' ); ?>" alt="" fetchpriority="high">
			<?php endif; ?>
			<div class="hero__badge hero__badge--top">
				<span class="seal"><?php echo chcs_icon( 'heart' ); // phpcs:ignore ?></span>
				<div><strong><?php echo esc_html( sprintf( /* translators: %d years */ __( '%d+ years', 'chcs-care' ), $years ) ); ?></strong><small><?php esc_html_e( 'of care in our community', 'chcs-care' ); ?></small></div>
			</div>
			<div class="hero__badge">
				<span class="seal"><?php echo chcs_icon( 'award' ); // phpcs:ignore ?></span>
				<div><strong><?php esc_html_e( 'Gold Seal of Approval®', 'chcs-care' ); ?></strong><small><?php esc_html_e( 'The Joint Commission — Home Care', 'chcs-care' ); ?></small></div>
			</div>
		</div>
	</div>
</section>

<section class="stats" aria-label="<?php esc_attr_e( 'At a glance', 'chcs-care' ); ?>">
	<div class="container">
		<div class="stat"><strong><?php echo esc_html( chcs_opt( 'founded' ) ); ?></strong><span><?php esc_html_e( 'Serving families since', 'chcs-care' ); ?></span></div>
		<div class="stat"><strong><?php echo esc_html( count( chcs_service_areas() ) ); ?></strong><span><?php esc_html_e( 'Boroughs & counties served', 'chcs-care' ); ?></span></div>
		<div class="stat"><strong><?php echo esc_html( count( chcs_services() ) ); ?></strong><span><?php esc_html_e( 'Nursing & therapy services', 'chcs-care' ); ?></span></div>
		<div class="stat"><strong><?php esc_html_e( 'RN-led', 'chcs-care' ); ?></strong><span><?php esc_html_e( 'Personalized plans of care', 'chcs-care' ); ?></span></div>
	</div>
</section>

<section class="section">
	<div class="container">
		<div class="section-head">
			<span class="eyebrow"><?php esc_html_e( 'Our services', 'chcs-care' ); ?></span>
			<h2><?php esc_html_e( 'Hospital-quality care, delivered to your door', 'chcs-care' ); ?></h2>
			<p class="lead"><?php esc_html_e( 'Our licensed clinicians work with your physician to help you heal, regain independence and manage your health safely at home.', 'chcs-care' ); ?></p>
		</div>
		<?php get_template_part( 'template-parts/services-grid' ); ?>
	</div>
</section>

<?php get_template_part( 'template-parts/steps' ); ?>

<section class="section">
	<div class="container split">
		<div class="reveal">
			<?php if ( $about_img ) : ?>
				<img class="split__media" src="<?php echo esc_url( $about_img ); ?>" alt="" loading="lazy">
			<?php else : ?>
				<img class="split__media" src="<?php echo esc_url( CHCS_URI . '/assets/img/family.svg' ); ?>" alt="" loading="lazy">
			<?php endif; ?>
		</div>
		<div>
			<span class="eyebrow"><?php esc_html_e( 'Why families choose CHCS', 'chcs-care' ); ?></span>
			<h2><?php esc_html_e( 'Clinical excellence with a neighbor’s heart', 'chcs-care' ); ?></h2>
			<ul class="checklist">
				<li><strong><?php esc_html_e( 'Accredited quality.', 'chcs-care' ); ?></strong> <?php esc_html_e( 'Licensed by NYS DOH and accredited by The Joint Commission for home care.', 'chcs-care' ); ?></li>
				<li><strong><?php esc_html_e( 'One coordinated team.', 'chcs-care' ); ?></strong> <?php esc_html_e( 'Nurses and therapists share one plan of care and keep your doctor in the loop.', 'chcs-care' ); ?></li>
				<li><strong><?php esc_html_e( 'Rooted in Queens.', 'chcs-care' ); ?></strong> <?php echo esc_html( sprintf( /* translators: %s year */ __( 'A local agency serving New York families since %s.', 'chcs-care' ), chcs_opt( 'founded' ) ) ); ?></li>
				<li><strong><?php esc_html_e( 'Family kept informed.', 'chcs-care' ); ?></strong> <?php esc_html_e( 'Clear communication and family resources at every step.', 'chcs-care' ); ?></li>
			</ul>
			<a class="btn btn--teal" href="<?php echo esc_url( chcs_page_url( 'about-us' ) ); ?>"><?php esc_html_e( 'About our agency', 'chcs-care' ); ?></a>
		</div>
	</div>
</section>

<?php get_template_part( 'template-parts/areas' ); ?>

<section class="section section--navy">
	<div class="container">
		<div class="grid grid--2">
			<div class="reveal">
				<span class="eyebrow"><?php esc_html_e( 'For providers', 'chcs-care' ); ?></span>
				<h2><?php esc_html_e( 'Refer a patient in minutes', 'chcs-care' ); ?></h2>
				<p><?php esc_html_e( 'Physicians, hospital discharge planners and case managers: our intake team responds quickly and coordinates start of care so your patients transition home safely.', 'chcs-care' ); ?></p>
				<a class="btn btn--primary" href="<?php echo esc_url( chcs_page_url( 'referrals' ) ); ?>"><?php esc_html_e( 'Make a referral', 'chcs-care' ); ?></a>
			</div>
			<div class="reveal">
				<span class="eyebrow"><?php esc_html_e( 'Careers', 'chcs-care' ); ?></span>
				<h2><?php esc_html_e( 'Join a team that cares', 'chcs-care' ); ?></h2>
				<p><?php esc_html_e( 'We’re looking for RNs, LPNs and therapists who want meaningful, flexible work caring for patients in their own homes.', 'chcs-care' ); ?></p>
				<a class="btn btn--light" href="<?php echo esc_url( chcs_page_url( 'careers' ) ); ?>"><?php esc_html_e( 'View openings', 'chcs-care' ); ?></a>
			</div>
		</div>
	</div>
</section>

<?php
$news = new WP_Query( array( 'posts_per_page' => 3, 'ignore_sticky_posts' => true ) );
if ( $news->have_posts() ) :
	?>
	<section class="section section--cream">
		<div class="container">
			<div class="section-head">
				<span class="eyebrow"><?php esc_html_e( 'News & updates', 'chcs-care' ); ?></span>
				<h2><?php esc_html_e( 'From the CHCS community', 'chcs-care' ); ?></h2>
			</div>
			<div class="grid grid--3">
				<?php
				while ( $news->have_posts() ) :
					$news->the_post();
					get_template_part( 'template-parts/post-card' );
				endwhile;
				wp_reset_postdata();
				?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php
// Anything typed into the "Home" page in the editor appears here.
while ( have_posts() ) :
	the_post();
	if ( get_the_content() ) :
		?>
		<section class="section"><div class="container entry-content"><?php the_content(); ?></div></section>
		<?php
	endif;
endwhile;
?>

<?php get_template_part( 'template-parts/cta' ); ?>

<?php
get_footer();
