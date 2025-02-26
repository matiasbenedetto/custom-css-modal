<?php
/**
 * Plugin Name: Custom CSS Editor
 * Plugin URI: https://wordpress.org/plugins/custom-css-editor/
 * Description: Enhanced CSS editing experience with a modal editor for WordPress Additional CSS customizer section. Features a full-screen modal with syntax highlighting, font size controls, and improved editing capabilities.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.2
 * Author: Matias Benedetto
 * Author URI: https://mebenedetto.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: custom-css-editor
 * Domain Path: /languages
 *
 * @package CustomCSSEditor
 */

if (!defined('ABSPATH')) {
    exit;
}

function custom_css_modal_enqueue_scripts() {
    // Check if we're in the block editor
    if (!wp_should_load_block_editor_scripts_and_styles()) {
        return;
    }

    $asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

    wp_enqueue_script(
        'custom-css-modal-script',
        plugins_url('build/index.js', __FILE__),
        array_merge($asset_file['dependencies'], ['wp-editor', 'wp-blocks', 'wp-components', 'wp-element']),
        $asset_file['version'],
        true
    );

}

// Change the hook to load in the block editor
add_action('enqueue_block_editor_assets', 'custom_css_modal_enqueue_scripts');
