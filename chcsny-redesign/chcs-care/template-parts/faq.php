<?php
/**
 * FAQ accordion (native <details>, accessible, no JS).
 *
 * @package chcs-care
 */
?>
<section class="section">
	<div class="container">
		<div class="split" style="align-items:start">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'FAQ', 'chcs-care' ); ?></span>
				<h2><?php esc_html_e( 'Questions families ask us', 'chcs-care' ); ?></h2>
				<p class="lead"><?php esc_html_e( 'Don’t see your question? Our intake team is happy to help.', 'chcs-care' ); ?></p>
				<a class="btn btn--teal" href="<?php echo esc_attr( chcs_tel( chcs_opt( 'phone' ) ) ); ?>"><?php echo chcs_icon( 'phone' ); // phpcs:ignore ?><?php echo esc_html( chcs_opt( 'phone' ) ); ?></a>
			</div>
			<div class="faq">
				<?php foreach ( chcs_faqs() as $i => $faq ) : ?>
					<details <?php echo 0 === $i ? 'open' : ''; ?>><summary><?php echo esc_html( $faq[0] ); ?></summary><p><?php echo esc_html( $faq[1] ); ?></p></details>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</section>
