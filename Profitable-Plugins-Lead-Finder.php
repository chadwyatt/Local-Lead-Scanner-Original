<?php   
/* 
Plugin Name: Profitable Plugins Leader Finder
Plugin URI: https://profitableplugins.com
Description: Query the google places api for business leads.
Version: 1.1.4
Author: Profitable Plugins
Author URI: https://profitableplugins.com
*/

namespace ProfitablePlugins\LeadFinder;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'PROFITABLE_PLUGINS_LEAD_FINDER_VERSION', '1.1.4' );


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

		gpapiscraper::frontend();
		gpapiscraper::api();
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
			'supports' => array('title'),
			'show_in_rest' => true
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

	function frontend(){
		add_shortcode('lead-finder', function($attr){
			wp_register_script( 'vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12' );
			wp_enqueue_script( 'vuejs' );
			// wp_enqueue_script('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.js', [], '1.0.3', true);
			wp_enqueue_script('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.js', array( 'wp-api' ));
			return '<div id="mount"></div>';
		});
	}

	function api(){
		// add_action('rest_api_init', function () {
			// die("test123");
			// register_rest_route( 'leadfinderapi', '/test', array(
			// 	'methods'  => ['GET', 'POST'],
			// 	'callback' => 'ProfitablePlugins\LeadFinder\gpapiscraper::test'
			// ));

			// register_rest_route( 'leadfinderapi', '/create', array(
			// 	'methods'  => ['GET', 'POST'],
			// 	'callback' => 'ProfitablePlugins\LeadFinder\gpapiscraper::test'
			// ));
		// });
	}

	function test($request) {
		$person->fname  = "Chad";
		$person->lname = "Wyatt";
		
		$obj->name = "person";
		$obj->id = "123";
		$obj->attr = array("color" => "Red", "width" => 25);
		$obj->person = $person;
		return new \WP_REST_Response( $obj, 200 );
	}

	function scrape2() {
		return;
	}
}

class LeadFinderApi {
	function __construct() {
		add_action('init', function () {
			add_action('wp_ajax_lead_finder_list', array($this, 'get_finders'));
			add_action('wp_ajax_lead_finder_create', array($this, 'create'));
			add_action('wp_ajax_lead_finder_records', array($this, 'records'));
			add_action('wp_ajax_lead_finder_get_locations', array($this, 'get_locations'));
			add_action('wp_ajax_lead_finder_save_locations', array($this, 'save_locations'));
		});	
	}

	function get_finders() {
		$posts = get_posts(array(
			'post_type' => 'gpapiscraper',
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'author' => get_current_user_id(),
			'orderby' => 'title',
			'order' => 'ASC'
		));
		header('Content-Type: application/json');
		echo(json_encode($posts));
		die();
	}

	function create() {
		$data = json_decode(file_get_contents('php://input'), true);
		$ID = wp_insert_post(array(
			'post_title' => $data['title'],
			'post_type' => 'gpapiscraper',
			'post_status' => 'publish'
		));
		echo "id:".$ID;
		die();
	}

	function records() {
		$ID = $_REQUEST['ID'];
		$posts = get_posts(array(
			'post_type' => 'pp_lead_record',
			'post_status' => 'publish',
			'post_parent' => $ID,
			'posts_per_page' => -1
		));
		foreach($posts as $post){
			$post->business_data = get_post_meta($post->ID, 'business_data', true);
		}

		header('Content-Type: application/json');
		echo(json_encode($posts));
		die();
	}

	function get_locations() {
		$user_id = get_current_user_id();
		$locations = get_user_meta($user_id, 'lead_finder_locations', true);
		header('Content-Type: application/json');
		echo(json_encode($locations));
		die();
	}

	function save_locations() {
		$user_id = get_current_user_id();
		$data = json_decode(file_get_contents('php://input'), true);

		$locations = $data['locations'];
		if($data['new_location']['title'] !== '' || $data['new_location']['locations'] !== '')
			array_push($locations, $data['new_location']);
		update_user_meta($user_id, 'lead_finder_locations', $locations);

		header('Content-Type: application/json');
		echo(json_encode($locations));
		die();
	}
}
$lfapi_obj = new LeadFinderApi();

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
add_action('rest_api_init', 'ProfitablePlugins\LeadFinder\gpapiscraper::api');


