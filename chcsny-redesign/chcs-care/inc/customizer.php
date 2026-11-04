<?php
/**
 * Customizer: Appearance → Customize → "CHCS Settings".
 *
 * @package chcs-care
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_customize_register( $wp_customize ) {
	$d = chcs_defaults();

	$wp_customize->add_panel( 'chcs_panel', array( 'title' => __( 'CHCS Settings', 'chcs-care' ), 'priority' => 20 ) );

	$sections = array(
		'chcs_contact' => array(
			'title'  => __( 'Contact & Address', 'chcs-care' ),
			'fields' => array(
				'org_name'      => array( __( 'Organization name', 'chcs-care' ), 'text' ),
				'short_name'    => array( __( 'Short name (logo text)', 'chcs-care' ), 'text' ),
				'tagline'       => array( __( 'Logo tagline', 'chcs-care' ), 'text' ),
				'founded'       => array( __( 'Year founded', 'chcs-care' ), 'text' ),
				'phone'         => array( __( 'Main phone', 'chcs-care' ), 'text' ),
				'email'         => array( __( 'Email', 'chcs-care' ), 'email' ),
				'street'        => array( __( 'Street address', 'chcs-care' ), 'text' ),
				'city'          => array( __( 'City', 'chcs-care' ), 'text' ),
				'state'         => array( __( 'State', 'chcs-care' ), 'text' ),
				'zip'           => array( __( 'ZIP', 'chcs-care' ), 'text' ),
				'hours'         => array( __( 'Office hours (leave blank to hide)', 'chcs-care' ), 'text' ),
				'hotline'       => array( __( 'Compliance hotline', 'chcs-care' ), 'text' ),
				'hotline_hours' => array( __( 'Compliance hotline hours', 'chcs-care' ), 'text' ),
			),
		),
		'chcs_hero'    => array(
			'title'  => __( 'Homepage', 'chcs-care' ),
			'fields' => array(
				'hero_title'  => array( __( 'Hero headline (use <em> for accent)', 'chcs-care' ), 'textarea' ),
				'hero_text'   => array( __( 'Hero paragraph', 'chcs-care' ), 'textarea' ),
				'hero_image'  => array( __( 'Hero image', 'chcs-care' ), 'image' ),
				'about_image' => array( __( '“Why families choose us” image', 'chcs-care' ), 'image' ),
			),
		),
		'chcs_links'   => array(
			'title'  => __( 'Links, Forms & Social', 'chcs-care' ),
			'fields' => array(
				'portal_url'     => array( __( 'Family/Patient portal login URL', 'chcs-care' ), 'url' ),
				'form_to'        => array( __( 'Send form submissions to (defaults to site admin email)', 'chcs-care' ), 'email' ),
				'form_shortcode' => array( __( 'Optional: replace built-in form with a plugin shortcode (e.g. [contact-form-7 id="1"])', 'chcs-care' ), 'text' ),
				'facebook'       => array( __( 'Facebook URL', 'chcs-care' ), 'url' ),
				'instagram'      => array( __( 'Instagram URL', 'chcs-care' ), 'url' ),
				'linkedin'       => array( __( 'LinkedIn URL', 'chcs-care' ), 'url' ),
			),
		),
	);

	$priority = 10;
	foreach ( $sections as $section_id => $section ) {
		$wp_customize->add_section( $section_id, array( 'title' => $section['title'], 'panel' => 'chcs_panel', 'priority' => $priority++ ) );
		foreach ( $section['fields'] as $key => $field ) {
			list( $label, $type ) = $field;
			$id       = 'chcs_' . $key;
			$sanitize = 'sanitize_text_field';
			if ( 'email' === $type ) {
				$sanitize = 'sanitize_email';
			} elseif ( 'url' === $type || 'image' === $type ) {
				$sanitize = 'esc_url_raw';
			} elseif ( 'textarea' === $type ) {
				$sanitize = 'chcs_sanitize_inline_html';
			}
			$wp_customize->add_setting( $id, array( 'default' => isset( $d[ $key ] ) ? $d[ $key ] : '', 'sanitize_callback' => $sanitize ) );
			if ( 'image' === $type ) {
				$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, $id, array( 'label' => $label, 'section' => $section_id ) ) );
			} else {
				$wp_customize->add_control( $id, array( 'label' => $label, 'section' => $section_id, 'type' => $type ) );
			}
		}
	}
}
add_action( 'customize_register', 'chcs_customize_register' );

/** Allow only simple inline tags in hero text. */
function chcs_sanitize_inline_html( $value ) {
	return wp_kses( $value, array( 'em' => array(), 'strong' => array(), 'br' => array() ) );
}
