<?php   
/* 
Plugin Name: GpApiScraper
Plugin URI: http://smswordpress.com/gp-api-scraper
Description: Query the google places api for business leads.
Version: 1.0.1
Author: Chad Wyatt
Author URI: http://chadwyatt.com
*/


if( ! class_exists( 'ChadWyatt_Updater' ) && file_exists( plugin_dir_path( __FILE__ ) . 'updater.php' ) ){
	include_once( plugin_dir_path( __FILE__ ) . 'updater.php' );
}

if( class_exists( 'ChadWyatt_Updater' ) ){
    $updater = new ChadWyatt_Updater( __FILE__ );
    $updater->set_username( 'chadwyatt' );
    $updater->set_repository( 'GpApiScraper' );
    $updater->authorize( '336da467c3a4afb1a7a95c75e755a50a1e8ac289' ); // auth code for private repo
    $updater->initialize();
}

if (!class_exists ("gpapiscraper")) {
	
	class gpapiscraper {
		
		public static function init(){
			gpapiscraper::register_gpapiscraper();
		}
		
		public static function admin_init(){
			add_meta_box("meta_scraper", "Scraper", "gpapiscraper::meta_scraper", "gpapiscraper", "normal", "low");
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
				'name' => _x('GpApiScraper', 'post type general name'),
				'singular_name' => _x('GpApiScraper', 'post type singular name'),
				'add_new' => _x('Add New', 'GpApiScraper item'),
				'add_new_item' => __('Add New GpApiScraper'),
				'edit_item' => __('Edit GpApiScraper'),
				'new_item' => __('New GpApiScraper'),
				'view_item' => __('View GpApiScraper'),
				'search_items' => __('Search GpApiScraper'),
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
		
		public static function curl_operation($url){
			//$headers = array("Content-type: multipart/form-data");
			$ch = curl_init(); // Initialize the curl
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
			curl_setopt($ch, CURLOPT_URL, $url);  // set the opton for curl
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);// set the option to transfer output from script to curl
			//curl_setopt($ch, CURLOPT_POST, 1);
			//curl_setopt($ch, CURLOPT_POSTFIELDS, $val); // add POST fields
			//curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			$response = curl_exec($ch); // Execute curl
			return $response;
		}
		
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
		add_action( 'admin_menu', 'gpapiscraper::admin_menu' );	
		add_action( 'admin_init', 'gpapiscraper::admin_init' );
		add_action( 'save_post', 'gpapiscraper::save_post' );
		
		add_action( 'edit_user_profile', 'gpapiscraper::user_fields' );
		add_action( 'edit_user_profile_update', 'gpapiscraper::update_user_fields' );
		add_action( 'show_user_profile', 'gpapiscraper::user_fields' );
		add_action( 'personal_options_update', 'gpapiscraper::update_user_fields' );
		
		add_action('wp_ajax_gpapiscraper_scrape', 'gpapiscraper::scrape');
	
	}
	
	add_action('init', 'gpapiscraper::init');
}
