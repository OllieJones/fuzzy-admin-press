<?php
/* Unintall -- clean up usermeta. */
global $wpdb;

/* if uninstall.php is not called by WordPress, die */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
  die;
}

/* Delete any user preferences */
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query( $wpdb->prepare("DELETE FROM {$wpdb->usermeta} WHERE meta_key = %s", 'searchable_admin_menu' ) );
