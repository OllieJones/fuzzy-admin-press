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
 *
 * @package         Fuzzy_Admin_Press
 */

// Your code starts here.

namespace FuzzyAdminPress;

\add_action( 'admin_init', '\FuzzyAdminPress\admin_init', 10, 0 );

function admin_init() {

	load_plugin_textdomain( 'fuzzy-admin-press', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

	wp_enqueue_style( 'jquery-ui-autocomplete' );
//hack hack	wp_enqueue_style('jquery-ui-css', 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');
	wp_enqueue_style( 'fuzzy-admin-press', plugin_dir_url( __FILE__ ) . 'assets/css/fuzzy.css' );
	wp_enqueue_script( 'jquery-ui-autocomplete' );
	wp_enqueue_script( 'fuzzy-admin-press', plugin_dir_url( __FILE__ ) . 'assets/js/fuzzy.js' , array('jquery-ui-autocomplete'));
}

