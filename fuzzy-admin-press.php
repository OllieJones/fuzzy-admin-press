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
\add_action( 'personal_options', '\FuzzyAdminPress\personal_options', 10, 1 );
\add_action( 'personal_options_update', '\FuzzyAdminPress\save_personal_options' );
\add_action( 'edit_user_profile_update', '\FuzzyAdminPress\save_personal_options' );


function admin_init() {
  $version = '0.1.0';

  load_plugin_textdomain( 'fuzzy-admin-press', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

  if ( get_searchable_menu_pref() ) {
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
      'submenu_delimiter'  => __( ' ⮞ ', 'fuzzy-admin-press' ),
      'locale'             => get_user_locale(),
    );
    wp_localize_script( 'fuzzy-admin-press', 'fuzzy_admin_press_i18n', $i18n );
  }
}

function get_searchable_menu_pref( $user = 0 ) {
  $pref = get_user_option( 'searchable_admin_menu', $user );
  if ( false === $pref ) {
    return true;
  }

  return 'true' === $pref;
}

function personal_options( $profile_user ) {
  ?>
  <tr class="show-admin-bar user-admin-bar-front-wrap">
    <th scope="row"><?php esc_html_e( 'Searchable Menus', 'fuzzy-admin-press' ); ?></th>
    <td>
      <label for="searchable_menus">
        <input name="searchable_menus" type="checkbox" id="searchable_menus"
               value="1"<?php checked( get_searchable_menu_pref( $profile_user->ID ) ); ?> />
        <?php esc_html_e( 'Searchable administration menus', 'fuzzy-admin-press' ); ?>
      </label><br/>
    </td>
  </tr>
  <?php
}


function save_personal_options( $user_id ) {
  if ( empty( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'update-user_' . $user_id ) ) {
    return;
  }

  if ( ! current_user_can( 'edit_user', $user_id ) ) {
    return;
  }
  $menu = isset( $_POST['searchable_menus'] ) ? sanitize_text_field( wp_unslash( $_POST['searchable_menus'] ) ) : '0';
  $menu = '1' === $menu || 'on' === $menu ? 'true' : 'false';

  update_user_meta( $user_id, 'searchable_admin_menu', $menu );
}

