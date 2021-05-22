<?php   
/* 
Plugin Name: Local Lead Scanner
Plugin URI: https://localleadscanner.com
Description: Query the google places api for business leads. To install, add the [local-lead-scanner] shortcode to a page or post.
Version: 1.0.0
Author: Local Lead Scanner
Author URI: https://localleadscanner.com
*/

namespace LocalLeadScanner;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'LOCAL_LEAD_SCANNER_VERSION', '1.0.0' );


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
		$updater = Updater::get_instance();
		$updater->set_file(__FILE__);
		$updater->initialize();
		gpapiscraper::frontend();
	}
		
	public static function scrape(){
		include(dirname(__FILE__)."/scrape.php");
		die();
	}

	function frontend(){
		add_shortcode('local-lead-scanner', function($attr){
			wp_register_script( 'vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12' );
			wp_enqueue_script( 'vuejs' );
			wp_enqueue_script('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.js', array( 'wp-api' ));
			wp_enqueue_script('fontawesome', 'https://kit.fontawesome.com/a9997e81a5.js');
			wp_enqueue_style('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.css');
			
			return '
				<link rel="preconnect" href="https://fonts.gstatic.com">
				<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;700&display=swap" rel="stylesheet">
				<script>
					var ajaxurl = "'.admin_url( 'admin-ajax.php' ).'"
					var lf_admin_page = false
				</script>
				<div id="lf-mount"></div>
			';
		});
	}
}

class LeadFinderApi {
	function __construct() {
		add_action('init', function () {
			add_action('wp_ajax_lead_finder_list', array($this, 'get_finders'));
			add_action('wp_ajax_lead_finder_create', array($this, 'create'));
			add_action('wp_ajax_lead_finder_update', array($this, 'update'));
			add_action('wp_ajax_lead_finder_delete', array($this, 'delete'));
			add_action('wp_ajax_lead_finder_records', array($this, 'records'));
			add_action('wp_ajax_lead_finder_get_locations', array($this, 'get_locations'));
			add_action('wp_ajax_lead_finder_save_locations', array($this, 'save_locations'));
			add_action('wp_ajax_lead_finder_get_settings', array($this, 'get_settings'));
			add_action('wp_ajax_lead_finder_save_api_key', array($this, 'save_api_key'));
			add_action('wp_ajax_lead_finder_download', array($this, 'download'));
			add_action('wp_ajax_lead_finder_create_key_test', array($this, 'create_key_test'));
			add_action('wp_ajax_lead_finder_check_key_test', array($this, 'check_key_test'));
			add_action('wp_ajax_lead_finder_activate_license', array($this, 'activate_license'));
			add_action('wp_ajax_lead_finder_deactivate_license', array($this, 'deactivate_license'));
			add_action('wp_ajax_lead_finder_reset_options', array($this, 'reset_options'));
			add_action('wp_ajax_lead_finder_signalwire_update', array($this, 'signalwire_update'));
			add_action('wp_ajax_lead_finder_twilio_update', array($this, 'twilio_update'));
			add_action('wp_ajax_lead_finder_cancel', array($this, 'cancel_queries'));
		});
		add_action('admin_menu', function() {
			add_menu_page(
				'Local Lead Scanner', 
				'Local Lead Scanner', 
				'read', 
				'local-lead-scanner', 
				array( $this, 'display_plugin_admin_page' ),
				'dashicons-visibility',
				20
			);
		});
	}

	public function display_plugin_admin_page() {
		wp_register_script( 'vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12' );
			wp_enqueue_script( 'vuejs' );
			wp_enqueue_script('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.js', array( 'wp-api' ));
			wp_enqueue_script('fontawesome', 'https://kit.fontawesome.com/a9997e81a5.js');
			wp_enqueue_style('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.css');
			
			echo '
				<link rel="preconnect" href="https://fonts.gstatic.com">
				<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;700&display=swap" rel="stylesheet">
				<div class="wrap" style="padding-right:1%">
					<script>
						var ajaxurl = "'.admin_url( 'admin-ajax.php' ).'"
						var lf_admin_page = true
					</script>
					<div id="lf-mount"></div>
				</div>
			';
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
		
		// $this->get_finders();
		$post = get_post($ID);

		header('Content-Type: application/json');
		echo(json_encode($post));
		die();
	}

	function update() {
		$data = json_decode(file_get_contents('php://input'), true);
		
		$post = get_post($data['ID']);
		if($post->post_author != get_current_user_id()){
			echo "0";
			die();
		}

		wp_update_post(array(
			'ID' => $data['ID'],
			'post_title' => $data['post_title']
		));
		$this->get_finders();
	}

	function delete() {
		$data = json_decode(file_get_contents('php://input'), true);

		$post = get_post($data['ID']);
		if($post->post_author != get_current_user_id()){
			print_r($post);
			echo "0";
			die();
		}

		wp_delete_post($data['ID']);
		$this->get_finders();
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
		if($locations === '')
			$locations = [];

		$title = array_column($locations, 'title');
		array_multisort($title, SORT_ASC, $locations);
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

	function get_settings() {
		$user_id = get_current_user_id();
		$license_key = get_option('lead_finder_license_key', '');
		$license_status = get_option('lead_finder_license_status', '');
		$user = wp_get_current_user();
 		$roles = ( array ) $user->roles;
		
		$google_places_api_key = esc_attr( get_user_meta( $user_id, 'gpapiscraper_google_key', true ) );
		$real_gpapikey = $google_places_api_key;
		if($google_places_api_key !== '')
			$google_places_api_key = true;
		else
			$google_places_api_key = false;

		$signalwire = get_user_meta($user_id, 'signalwire', true);
		$twilio = get_user_meta($user_id, 'lls_twilio', true);

		header('Content-Type: application/json');
		echo(json_encode(array(
			'google_places_api_key' => $google_places_api_key,
			'license_status' => $license_status,
			'roles' => $roles,
			'realapikey' => $real_gpapikey,
			'signalwire' => $signalwire,
			'twilio' => $twilio
		)));
		die();
	}

	function save_api_key() {
		$user_id = get_current_user_id();
		$data = json_decode(file_get_contents('php://input'), true);

		$api_key = $data['google_places_api_key'];
		update_user_meta($user_id, 'gpapiscraper_google_key', $api_key);
	}

	function download() {
		// $txt = str_replace("&amp;", "&", $txt);
		// $txt = stripslashes($txt);

		$lead_finder = get_post($_REQUEST['lead_finder_ID']);

		//get child records of the lead finder record
		$posts = get_posts(array(
			'post_type' => 'pp_lead_record',
			'post_status' => 'publish',
			'post_parent' => $_REQUEST['lead_finder_ID'],
			'posts_per_page' => -1
		));

		// print_r($posts);
		$txt = '';
		//loop through easy business record and pull the meta data
		foreach($posts as $post){
			$m = get_post_meta($post->ID, 'business_data', true);
			
			foreach($m['address_components'] as $a){
				$address[ $a['types'][0] ] = $a['long_name'];
			}

			// print_r($address);
			$fields = [];

			$fields[] = $m['name'];
			$fields[] = $m['formatted_phone_number'];
			$fields[] = $m['formatted_address'];
			$fields[] = $address['street_number'].' '.$address['route'];
			$fields[] = $address['locality'];
			$fields[] = $address['administrative_area_level_1'];
			$fields[] = $address['country'];
			$fields[] = $address['postal_code'];
			$fields[] = $m['website'];
			$fields[] = $m['url'];
			$fields[] = count($m['photos']);
			$fields[] = count($m['reviews']);
			$fields[] = $m['rating'];
			$fields[] = $m['geometry']['location']['lat'];
			$fields[] = $m['geometry']['location']['lng'];
			$p = $m['opening_hours']['periods'];
			for($i=0; $i < 7; $i++){
				$fields[] = $p[$i]['open']['time'];
				$fields[] = $p[$i]['close']['time'];
			}
			$fields[] = $m['place_id'];

			$txt .= '"'.implode('","', $fields).'"'."\n";
		}

		$header_row = "Name,Phone,Full Address,Street,City,State,Country,Zip,Website,Places,Photos,Reviews,Rating,Latitude,Longitude,Mon Open,Mon Close,Tue Open,Tue Close,Wed Open,Wed Close,Thu Open,Thu Close,Fri Open,Fri Close,Sat Open,Sat Close,Sun Open,Sun Close,Google ID\n";
		$txt = $header_row.$txt;
		header("Content-type: application/octet-stream");
		header("Content-Disposition: attachment; filename=\"{$lead_finder->post_title}.csv\"");
		echo $txt;
		die();
	}

	function create_key_test() {
		$api_params = array(
			'slm_action' => 'slm_create_new',
			'secret_key' => '609dadd4005db3.09811485',
			'first_name' => '',
			'last_name' => '',
			'email' => '',
			'company_name' => '',
			'txn_id' => uniqid(),
			'max_allowed_domains' => '2',
			'date_created' => date(“Y-m-d”),
			'date_expiry' => ’’,
		);

		print_r($api_params);
		echo "\n=====\n";
		// Send query to the license manager server
		$response = wp_remote_get(add_query_arg($api_params, 'https://localleadscanner.com'), array('timeout' => 20, 'sslverify' => false));
		
		// Check for error in the response
		if (is_wp_error($response)){
			echo "Unexpected Error! The query returned with an error.";
		}
		
		// License data.
		$license_data = json_decode(wp_remote_retrieve_body($response));

		print_r($license_data);
		die();
	}

	function check_key_test() {
		$api_params = array(
			'slm_action' => 'slm_check',
			'secret_key' => '609dadd4005e09.13239205',
			// 'license_key' => '609db4b4ef04e',
			'license_key' => '609db937bb899',
		);
		// Send query to the license manager server
		$response = wp_remote_get(add_query_arg($api_params, 'https://localleadscanner.com'), array('timeout' => 20, 'sslverify' => false));
		print_r(json_decode($response['body']));
		die("ok");
	}

	function activate_license() {
		$license_key = $_REQUEST['license_key'];
		
        // API query parameters
        $api_params = array(
            'slm_action' => 'slm_activate',
            'secret_key' => '609dadd4005e09.13239205',
            'license_key' => $license_key,
            'registered_domain' => $_SERVER['SERVER_NAME'],
            'item_reference' => urlencode('local-lead-scanner'),
			'random' => uniqid()
        );

        // Send query to the license manager server
        $query = esc_url_raw(add_query_arg($api_params, 'https://localleadscanner.com'));
        $response = wp_remote_get($query, array('timeout' => 20, 'sslverify' => false));
		
		// print_r($response['body']);
		// License data.
		$license_data = json_decode(wp_remote_retrieve_body($response));
        // Check for error in the response
        // if (is_wp_error($response)){
        //     echo "Unexpected Error! The query returned with an error.";
        // }

        if($license_data->result == 'success'){//Success was returned for the license activation
            //Save the license key in the options table
            update_option('lead_finder_license_key', $license_key);
            update_option('lead_finder_license_status', 'active');
			$result = array(
				'license_status' => 'active'
			);	
        } else {
            //Show error to the user. Probably entered incorrect license key.            
            //Uncomment the followng line to see the message that returned from the license server
            // echo '<br />The following message was returned from the server: '.$license_data->message;
			$result = array(
				'license_status' => '',
				'message' => $license_data->message
			);
        }
		header('Content-Type: application/json');
		echo(json_encode($result));
		die();
	}

	
	function deactivate_license() {
		if(!current_user_can('administrator'))
			die('not authorized');

		$license_key = get_option('lead_finder_license_key');
		
        // API query parameters
        $api_params = array(
            'slm_action' => 'slm_deactivate',
            'secret_key' => '609dadd4005e09.13239205',
            'license_key' => $license_key,
            'registered_domain' => $_SERVER['SERVER_NAME'],
        );

        // Send query to the license manager server
        $query = esc_url_raw(add_query_arg($api_params, 'https://localleadscanner.com'));
        $response = wp_remote_get($query, array('timeout' => 20, 'sslverify' => false));
		
		// License data.
		$result = json_decode(wp_remote_retrieve_body($response));
		// print_r($license_data);

		delete_option('lead_finder_license_key', $license_key);
		delete_option('lead_finder_license_status', 'active');

		header('Content-Type: application/json');
		echo(json_encode($result));
		die();
	}

	function reset_options() {
		if(!current_user_can('administrator'))
			die('not authorized');
	
		$user_id = get_current_user_id();
		delete_option('lead_finder_license_key', $license_key);
		delete_option('lead_finder_license_status', 'active');
		delete_user_meta($user_id, 'gpapiscraper_google_key');
		delete_user_meta($user_id, 'lead_finder_locations');

		echo "done";
		die();
	}

	function signalwire_update() {
		$user_id = get_current_user_id();
		$data = json_decode(file_get_contents('php://input'), true);
		update_user_meta($user_id, 'signalwire', $data['signalwire']);
	}

	function twilio_update() {
		$user_id = get_current_user_id();
		$data = json_decode(file_get_contents('php://input'), true);
		update_user_meta($user_id, 'lls_twilio', $data['twilio']);
	}

	function cancel_queries() {
		update_post_meta($_REQUEST['ID'], 'cancel', true);
		die();
	}
}
$lfapi_obj = new LeadFinderApi();

add_action('wp_ajax_gpapiscraper_scrape', 'LocalLeadScanner\gpapiscraper::scrape');
add_action('init', 'LocalLeadScanner\gpapiscraper::init');
