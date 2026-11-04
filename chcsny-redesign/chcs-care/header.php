<?php
/**
 * Site header.
 *
 * @package chcs-care
 */
$phone = chcs_opt( 'phone' );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#0f2a44">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main"><?php esc_html_e( 'Skip to content', 'chcs-care' ); ?></a>

<div class="topbar">
	<div class="container">
		<div class="topbar__items">
			<span><?php echo chcs_icon( 'phone' ); // phpcs:ignore ?><a href="<?php echo esc_attr( chcs_tel( $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a></span>
			<span><?php echo chcs_icon( 'mail' ); // phpcs:ignore ?><a href="mailto:<?php echo esc_attr( antispambot( chcs_opt( 'email' ) ) ); ?>"><?php echo esc_html( antispambot( chcs_opt( 'email' ) ) ); ?></a></span>
			<?php if ( chcs_opt( 'hours' ) ) : ?>
				<span class="topbar__secondary"><?php echo chcs_icon( 'clock' ); // phpcs:ignore ?><?php echo esc_html( chcs_opt( 'hours' ) ); ?></span>
			<?php endif; ?>
		</div>
		<div class="topbar__items topbar__secondary">
			<span><?php echo chcs_icon( 'shield' ); // phpcs:ignore ?><?php esc_html_e( 'Compliance Hotline:', 'chcs-care' ); ?>&nbsp;<a href="<?php echo esc_attr( chcs_tel( chcs_opt( 'hotline' ) ) ); ?>"><?php echo esc_html( chcs_opt( 'hotline' ) ); ?></a></span>
			<a href="<?php echo esc_url( chcs_page_url( 'careers' ) ); ?>"><?php esc_html_e( 'Careers', 'chcs-care' ); ?></a>
		</div>
	</div>
</div>

<header class="site-header">
	<div class="container">
		<?php get_template_part( 'template-parts/brand' ); ?>

		<nav class="main-nav" id="primary-nav" aria-label="<?php esc_attr_e( 'Primary', 'chcs-care' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'fallback_cb'    => 'chcs_fallback_menu',
					'depth'          => 2,
				)
			);
			?>
		</nav>

		<div class="header-cta">
			<a class="btn btn--ghost" href="<?php echo esc_attr( chcs_tel( $phone ) ); ?>"><?php echo chcs_icon( 'phone' ); // phpcs:ignore ?><?php esc_html_e( 'Call us', 'chcs-care' ); ?></a>
			<a class="btn btn--primary" href="<?php echo esc_url( chcs_page_url( 'contact-us' ) ); ?>#request"><?php esc_html_e( 'Request Care', 'chcs-care' ); ?></a>
			<button class="nav-toggle" aria-controls="primary-nav" aria-expanded="false"><span class="screen-reader-text"><?php esc_html_e( 'Menu', 'chcs-care' ); ?></span><?php echo chcs_icon( 'menu' ); // phpcs:ignore ?></button>
		</div>
	</div>
</header>

<main id="main" tabindex="-1">
