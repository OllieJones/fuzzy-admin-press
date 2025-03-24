<?php
/**
 * Plugin Name:     FuzzyAdminPress
 * Plugin URI:      https://github.com/OllieJones/fuzzy-admin-press
 * Description:     Fuzzy Search for Administrators
 * Author:          Ollie Jones
 * Author URI:      https://github.com/OllieJones/
 * Text Domain:     fuzzy-admin-press
 * Domain Path:     /languages
 * Version:         0.1.0
 * License:         GPLv2 or later
 *
 * @package         Fuzzy_Admin_Press
 */

// Your code starts here.

namespace FuzzyAdminPress;

\add_action( 'admin_init', '\FuzzyAdminPress\admin_init', 10, 0 );

function admin_init() {
	$version = '0.1.0';

	load_plugin_textdomain( 'fuzzy-admin-press', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

	wp_enqueue_style( 'jquery-ui-autocomplete' );
	wp_enqueue_style( 'fuzzy-admin-press', plugin_dir_url( __FILE__ ) . 'assets/css/fuzzy.css', array(), $version, 'all' );
	wp_enqueue_script( 'fuzzy-admin-press', plugin_dir_url( __FILE__ ) . 'assets/js/fuzzy.js', array( 'jquery-ui-autocomplete' ), $version, true );

	$i18n = array(
		/* translators: name of plugin to appear as the placeholder in the search box. */
		'placeholder'        => __( 'Shift Shift Search', 'fuzzy-admin-press' ),
		// Intentional use of core localization strings.
        // phpcs:ignore WordPress.WP.I18n.MissingArgDomain
		'placeholder_active' => implode( ' ', array( __( 'Search' ), __( 'Menus' ) ) ),
		/* translators: this is the delimiter between menu and submenu. For example Settings > Geheral. Change for RTL languages  to  ⮜*/
		'submenu_delimiter' => __(' ⮞ ','fuzzy-admin-press'),
		'locale'             => get_user_locale(),
	);
	wp_localize_script( 'fuzzy-admin-press', 'fuzzy_admin_press_i18n', $i18n );
}

