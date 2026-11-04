<?php
/**
 * Default content for the designed sections. Edit here, or override the
 * service list with the `chcs_services` filter from a child theme/plugin.
 *
 * @package chcs-care
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Customizer defaults (current CHCS details). */
function chcs_defaults() {
	return array(
		'org_name'      => 'Complete Home Care Services, Inc.',
		'short_name'    => 'CHCS',
		'tagline'       => 'Home Health Care · Since 1993',
		'founded'       => '1993',
		'phone'         => '(718) 528-5493',
		'hotline'       => '(718) 926-1762',
		'hotline_hours' => '8:00 AM – 5:00 PM',
		'email'         => 'info@chcsny.com',
		'street'        => '117-03 203rd Street',
		'city'          => 'St. Albans',
		'state'         => 'NY',
		'zip'           => '11412',
		'hours'         => '',
		'form_to'       => '',
		'portal_url'    => '',
		'facebook'      => 'https://www.facebook.com/CHCSNY/',
		'instagram'     => 'https://www.instagram.com/chcsny/',
		'linkedin'      => '',
		'hero_title'    => 'Skilled, compassionate care — <em>right at home.</em>',
		'hero_text'     => 'Since 1993, Complete Home Care Services has brought licensed nurses and therapists to patients across New York City and Nassau County, helping them recover, stay independent, and remain where they feel most comfortable.',
		'hero_image'    => '',
		'about_image'   => '',
		'form_shortcode' => '',
	);
}

/** Services offered. */
function chcs_services() {
	return apply_filters(
		'chcs_services',
		array(
			array(
				'icon'  => 'nurse',
				'title' => __( 'Skilled Nursing', 'chcs-care' ),
				'text'  => __( 'Registered and licensed practical nurses providing clinical care at home under your physician’s plan of care.', 'chcs-care' ),
				'items' => array( __( 'Medication management & teaching', 'chcs-care' ), __( 'Wound & post-surgical care', 'chcs-care' ), __( 'Chronic condition monitoring', 'chcs-care' ) ),
			),
			array(
				'icon'  => 'walk',
				'title' => __( 'Physical Therapy', 'chcs-care' ),
				'text'  => __( 'Restore strength, balance and mobility after surgery, illness or a fall — without travelling to a clinic.', 'chcs-care' ),
				'items' => array( __( 'Fall prevention', 'chcs-care' ), __( 'Post-operative rehab', 'chcs-care' ), __( 'Gait & balance training', 'chcs-care' ) ),
			),
			array(
				'icon'  => 'hand',
				'title' => __( 'Occupational Therapy', 'chcs-care' ),
				'text'  => __( 'Regain the skills for everyday living — dressing, bathing, cooking — with safe, practical strategies at home.', 'chcs-care' ),
				'items' => array( __( 'Daily living skills', 'chcs-care' ), __( 'Home safety assessment', 'chcs-care' ), __( 'Adaptive equipment', 'chcs-care' ) ),
			),
			array(
				'icon'  => 'speech',
				'title' => __( 'Speech Therapy', 'chcs-care' ),
				'text'  => __( 'Support for communication, cognition and swallowing difficulties following stroke, injury or illness.', 'chcs-care' ),
				'items' => array( __( 'Speech & language', 'chcs-care' ), __( 'Swallowing therapy', 'chcs-care' ), __( 'Cognitive-communication', 'chcs-care' ) ),
			),
			array(
				'icon'  => 'lungs',
				'title' => __( 'Respiratory Therapy', 'chcs-care' ),
				'text'  => __( 'Breathing support and education for patients managing COPD, asthma and other respiratory conditions.', 'chcs-care' ),
				'items' => array( __( 'Oxygen & equipment education', 'chcs-care' ), __( 'Breathing techniques', 'chcs-care' ), __( 'Symptom management', 'chcs-care' ) ),
			),
			array(
				'icon'  => 'heart',
				'title' => __( 'Respite Care', 'chcs-care' ),
				'text'  => __( 'Short-term relief for family caregivers, so your loved one is safe and cared for while you rest and recharge.', 'chcs-care' ),
				'items' => array( __( 'Planned or short-notice', 'chcs-care' ), __( 'Trusted, trained caregivers', 'chcs-care' ), __( 'Peace of mind for families', 'chcs-care' ) ),
			),
		)
	);
}

/** Service areas. */
function chcs_service_areas() {
	return apply_filters( 'chcs_service_areas', array( 'Queens', 'Brooklyn', 'Bronx', 'Manhattan', 'Staten Island', 'Nassau County' ) );
}

/** FAQ items used on Services and Family Portal pages. */
function chcs_faqs() {
	return apply_filters(
		'chcs_faqs',
		array(
			array( __( 'How do I start home care services?', 'chcs-care' ), __( 'Call our intake team or submit the request form. We’ll confirm eligibility, coordinate with your physician, and schedule a nurse to visit for an initial assessment.', 'chcs-care' ) ),
			array( __( 'Do I need a doctor’s order?', 'chcs-care' ), __( 'Skilled nursing and therapy services require a physician’s order and plan of care. If you don’t have one yet, our team can help coordinate with your doctor or hospital discharge planner.', 'chcs-care' ) ),
			array( __( 'What insurance do you accept?', 'chcs-care' ), __( 'Coverage depends on your plan. Please call our office with your insurance information and our intake team will verify your benefits before services begin.', 'chcs-care' ) ),
			array( __( 'Which areas do you serve?', 'chcs-care' ), __( 'We serve patients in Queens, Brooklyn, the Bronx, Manhattan, Staten Island and Nassau County.', 'chcs-care' ) ),
			array( __( 'How do I report a concern or compliance issue?', 'chcs-care' ), __( 'You can call our confidential Compliance Hotline at any time during posted hours. Reports may be made anonymously and without fear of retaliation.', 'chcs-care' ) ),
		)
	);
}
