<?php   
/* 
Plugin Name: Profitable Plugins Leader Finder
Plugin URI: https://profitableplugins.com
Description: Query the google places api for business leads.
Version: 1.0.3
Author: Profitable Plugins
Author URI: https://profitableplugins.com
*/

namespace ProfitablePlugins\LeadFinder;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'PROFITABLE_PLUGINS_LEAD_FINDER_VERSION', '1.0.3' );


spl_autoload_register(function ($class) {

    // project-specific namespace prefix
    $prefix = __NAMESPACE__;

    // base directory for the namespace prefix
    $base_dir = __DIR__ . '/includes/';

    // does the class use the namespace prefix?
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        // no, move to the next registered autoloader
        return;
    }

    // get the relative class name
    $relative_class = substr($class, $len);

    // replace the namespace prefix with the base directory, replace namespace
    // separators with directory separators in the relative class name, append
    // with .php
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    // if the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});
	
class gpapiscraper {
	
	public static function init(){
		$plugin = Plugin::get_instance();
		gpapiscraper::register_gpapiscraper();

		$updater = Updater::get_instance();
		$updater->set_file(__FILE__);
		$updater->initialize();
	}
	
	public static function admin_init(){
		add_meta_box("meta_scraper", "Scraper", "ProfitablePlugins\LeadFinder\gpapiscraper::meta_scraper", "gpapiscraper", "normal", "low");
		//add_meta_box("meta_audio", "Audio Settings", "painless::meta_audio", "painless_call", "normal", "low");
		//add_meta_box("meta_phone_numbers", "Phone Numbers/Dial", "painless::meta_phone_numbers", "painless_call", "normal", "low");
	}
	
	public static function admin_menu() {
		//add_submenu_page('options-general.php', 'PainlessCalls', 'PainlessCalls', 'administrator', 'painless_options', 'painless::options_page');
	}
	
	public static function options_page(){
		return;
		wp_enqueue_script('jquery');
		wp_enqueue_script('jquery-ui-datepicker');
		//wp_enqueue_script('jquery-ui-dialog');
		wp_register_style('smoothness-css', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/themes/smoothness/jquery-ui.css?ver=3.4.2');
		wp_enqueue_style('smoothness-css');
		include("options_page.php");
	}
	
	public static function register_gpapiscraper(){
		
		$labels = array(
			'name' => _x('Lead Finder', 'post type general name'),
			'singular_name' => _x('Lead Finder', 'post type singular name'),
			'add_new' => _x('Add New', 'Lead Finder item'),
			'add_new_item' => __('Add New Lead Finder'),
			'edit_item' => __('Edit Lead Finder'),
			'new_item' => __('New Lead Finder'),
			'view_item' => __('View Lead Finder'),
			'search_items' => __('Search Lead Finders'),
			'not_found' =>  __('Nothing found'),
			'not_found_in_trash' => __('Nothing found in Trash'),
			'parent_item_colon' => ''
			
		);
		
		$args = array(
			'labels' => $labels,
			'public' => true,
			'publicly_queryable' => false,
			'show_ui' => true,
			'query_var' => true,
			//'menu_icon' => plugins_url( 'images/icon_star.png' , __FILE__ ),
			'rewrite' => false,
			'capability_type' => 'post',
			'hierarchical' => false,
			//'menu_position' => 25,
			'supports' => array('title')
			); 
		
		register_post_type( 'gpapiscraper' , $args );
		
	}
	
	public static function meta_scraper(){
		include(dirname(__FILE__)."/meta_scraper.php");
	}
	
	public static function save_post($post_id){
		//return $post_id;
		$post_id = $_POST["post_ID"];
		if ($_POST["post_type"] != 'gpapiscraper')
			return $post_id;
		if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) 
			return $post_id;
		if ( !current_user_can( 'edit_post', $post_id ) )
			return $post_id;
		
		update_post_meta($post_id, '_gpapiscraper_results', $_POST["gpapiscraper_results"] );
		
		return $post_id;
	}
	
	// public static function curl_operation($url){
	// 	//$headers = array("Content-type: multipart/form-data");
	// 	$ch = curl_init(); // Initialize the curl
	// 	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
	// 	curl_setopt($ch, CURLOPT_URL, $url);  // set the opton for curl
	// 	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);// set the option to transfer output from script to curl
	// 	//curl_setopt($ch, CURLOPT_POST, 1);
	// 	//curl_setopt($ch, CURLOPT_POSTFIELDS, $val); // add POST fields
	// 	//curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	// 	$response = curl_exec($ch); // Execute curl
	// 	return $response;
	// }
	
	public static function user_fields( $user ) { 
		//if ( current_user_can( 'administrator', $user->ID ) )
			include(dirname(__FILE__)."/user_fields.php");
	}
	
	public static function update_user_fields( $user_id ) {
		//die( "testing!!!!!!!!!!!!" );
		//if ( !current_user_can( 'edit_user', $user_id ) && !current_user_can('administrator') )
		//	return false;
		
		update_usermeta( $user_id, 'gpapiscraper_google_key', trim($_POST['gpapiscraper_google_key']) );
	}
	
	public static function scrape(){
		include(dirname(__FILE__)."/scrape.php");
		die();
	}
}

if(is_admin()){
	add_action( 'admin_menu', 'ProfitablePlugins\LeadFinder\gpapiscraper::admin_menu' );	
	add_action( 'admin_init', 'ProfitablePlugins\LeadFinder\gpapiscraper::admin_init' );
	add_action( 'save_post', 'ProfitablePlugins\LeadFinder\gpapiscraper::save_post' );
	
	add_action( 'edit_user_profile', 'ProfitablePlugins\LeadFinder\gpapiscraper::user_fields' );
	add_action( 'edit_user_profile_update', 'ProfitablePlugins\LeadFinder\gpapiscraper::update_user_fields' );
	add_action( 'show_user_profile', 'ProfitablePlugins\LeadFinder\gpapiscraper::user_fields' );
	add_action( 'personal_options_update', 'ProfitablePlugins\LeadFinder\gpapiscraper::update_user_fields' );
	
	add_action('wp_ajax_gpapiscraper_scrape', 'ProfitablePlugins\LeadFinder\gpapiscraper::scrape');

}

add_action('init', 'ProfitablePlugins\LeadFinder\gpapiscraper::init');
// add_action( 'plugins_loaded', 'ProfitablePlugins\\VMD\\init' );

