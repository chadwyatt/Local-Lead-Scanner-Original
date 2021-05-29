<?php   
/* 
Plugin Name: Local Lead Scanner
Plugin URI: https://localleadscanner.com
Description: Query the google places api for business leads. To install, add the [local-lead-scanner] shortcode to a page or post.
Version: 1.0.2
Author: Local Lead Scanner
Author URI: https://localleadscanner.com
*/

namespace LocalLeadScanner;
use Twilio\Rest\Client;
use Twilio\TwiML\VoiceResponse;


// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'LOCAL_LEAD_SCANNER_VERSION', '1.0.2' );


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
		// gpapiscraper::frontend();
	}
		
	public static function scrape(){
		include(dirname(__FILE__)."/scrape.php");
		die();
	}

	function frontend(){
		add_shortcode('local-lead-scanner', function($attr){
			// wp_register_script( 'vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12' );
			// wp_enqueue_script( 'vuejs' );
			// wp_enqueue_script( 'leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.js', array( 'wp-api' ) );
			// wp_enqueue_script( 'fontawesome', 'https://kit.fontawesome.com/a9997e81a5.js' );
			// wp_enqueue_style( 'leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.css' );
			// wp_enqueue_script( 'filepond', 'https://unpkg.com/filepond/dist/filepond.min.js' );
			// wp_enqueue_script( 'filepond-jquery', 'https://unpkg.com/jquery-filepond/filepond.jquery.js' );
			// wp_enqueue_script( 'filepond-filetype', 'https://unpkg.com/filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.js' );
			// wp_enqueue_style( 'filepond', 'https://unpkg.com/filepond/dist/filepond.css' );
			// wp_enqueue_script( 'momentjs', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js' );
			$this->enqueue_scripts();
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

class LocalLeadScannerPlugin {
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
			add_action('wp_ajax_nopriv_lead_finder_get_settings', array($this, 'login_required'));
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
			add_action('wp_ajax_nopriv_lead_finder_twilio_twiml', array($this, 'twilio_twiml'));
			add_action('wp_ajax_nopriv_lead_finder_twilio_status_callback', array($this, 'twilio_status_callback'));
			add_action('wp_ajax_lead_finder_upload_audio_file', array($this, 'upload_audio_file'));
			add_action('wp_ajax_lead_finder_update_vm_broadcast', array($this, 'update_vm_broadcast'));
			add_action('wp_ajax_lead_finder_run_broadcasts', array($this, 'run_broadcasts'));
			// add_action('wp_ajax_lead_finder_test', array($this, 'test'));
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

		$this->frontend();

	}

	function frontend(){
		add_shortcode('local-lead-scanner', function($attr){
			$this->enqueue_scripts();
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

	function login_required() {
		header('Content-Type: application/json');
		echo(json_encode(array("error" => "Login Required")));
		die();
	}

	function enqueue_scripts() {
		wp_enqueue_script( 'vuejs', 'https://cdn.jsdelivr.net/npm/vue@2.6.12' );
		wp_enqueue_script('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.js', array( 'wp-api' ));
		wp_enqueue_script('fontawesome', 'https://kit.fontawesome.com/a9997e81a5.js');
		wp_enqueue_style('leadfinder', plugin_dir_url( __FILE__ ) . '/includes/leadfinder.css');
		wp_enqueue_script( 'filepond', 'https://unpkg.com/filepond/dist/filepond.min.js' );
		wp_enqueue_script( 'filepond-filetype', 'https://unpkg.com/filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.js' );
		wp_enqueue_style( 'filepond', 'https://unpkg.com/filepond/dist/filepond.css' );
		wp_enqueue_script( 'momentjs', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js' );
	}

	public function display_plugin_admin_page() {
			$this->enqueue_scripts();

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
		$posts = $this->get_finder_posts();
		header('Content-Type: application/json');
		echo(json_encode($posts));
		die();
	}

	function get_finder_posts() {

		$posts = get_posts(array(
			'post_type' => 'gpapiscraper',
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'author' => get_current_user_id(),
			'orderby' => 'title',
			'order' => 'ASC'
		));

		foreach($posts as $post) {
			$voicemail = get_post_meta($post->ID, 'vm_broadcast_settings', true);
			// $obj = new stdClass();
			// $obj = (object)[];
			$post->voicemail = $voicemail != '' ? $voicemail : [];
			// $post->voicemail = $voicemail;
		}

		return $posts;
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
		$post->voicemail = (object)[];

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
		global $wpdb;

		$ID = $_REQUEST['ID'];
		$posts = get_posts(array(
			'post_type' => 'pp_lead_record',
			'post_status' => 'publish',
			'post_parent' => $ID,
			'posts_per_page' => -1
		));
		foreach($posts as $post){
			$post->meta = get_post_meta($post->ID);
			$post->business_data = get_post_meta($post->ID, 'business_data', true); //redundant
			
			$phone_number_post = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $wpdb->posts WHERE post_title = %s AND post_type = 'pp_phone_history'", $post->meta['phone_number'][0] ) );
			
			if($phone_number_post)
				$post->voicemail_history = get_post_meta($phone_number_post[0]->ID, 'voicemail');
			else
				$post->voicemail_history = [];

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
		$audio_files_meta = get_user_meta($user_id, 'lf_audio_files', true);
		$audio_files = [];

		//return clean array of files without full file path
		if(gettype($audio_files_meta) != 'string'){
			foreach($audio_files_meta as $file){
				array_push($audio_files, array("url" => $file["url"], "filename" => $file["filename"]));
			}
		}

		// get twilio incoming phone numbers
		$client = new Client($twilio['account_sid'], $twilio['auth_token']);
		$incomingPhoneNumbers = $client->incomingPhoneNumbers->read([], 1000);
		$twilio['phone_numbers'] = [];
		foreach ($incomingPhoneNumbers as $record) {
			// error_log(print_r($record, true));
			array_push($twilio['phone_numbers'], array("sid" => $record->sid, "phoneNumber" => $record->phoneNumber, "friendlyName" => $record->friendlyName));
		}

		
		header('Content-Type: application/json');
		echo(json_encode(array(
			'google_places_api_key' => $google_places_api_key,
			'license_status' => $license_status,
			'roles' => $roles,
			'realapikey' => $real_gpapikey,
			'signalwire' => $signalwire,
			'twilio' => $twilio,
			'audio_files' => $audio_files,
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

	function send_voicemail($post, $settings) {
		
		// $user_id = get_current_user_id();
		$twilio = get_user_meta($post->post_author, 'lls_twilio', true);

		$phone_number = $post->meta['phone_number'][0];
		$from_number = $settings['from_phone_number'];
		$audio_file_url = $settings['audio_file_url'];

		$ajax_url = admin_url( 'admin-ajax.php' );
		$twiml_url = $ajax_url."?action=lead_finder_twilio_twiml&audioFileUrl=".$audio_file_url;

		$twilio_status_callback_url = $ajax_url."?action=lead_finder_twilio_status_callback&ID=".$settings['history_id'];

        $timeout = 4;

		
		$client = new Client($twilio['account_sid'], $twilio['auth_token']);
		// return; 

		try {
			// first call, ties up line for a few seconds then hangs up
			$client->account->calls->create(  
				$phone_number,
				$from_number,
				array(
					"url" => $twiml_url,
					"timeout" => $timeout,
					"record" => $settings['record'] == true ? true : false,
					"statusCallback" => $twilio_status_callback_url,
					"statusCallbackEvent" => array("answered","completed"),
					"machineDetection" => "DetectMessageEnd"
				)
			);
			sleep(1);
			
			// second call (goes to voicemail)
			$client->account->calls->create(  
				$phone_number,
				$from_number,
				array(
					"url" => $twiml_url,
					"timeout" => $timeout,
					"record" => $settings['record'] == true ? true : false,
					"statusCallback" => $twilio_status_callback_url,
					"statusCallbackEvent" => array("answered","completed"),
					"machineDetection" => "DetectMessageEnd"
				)
			);
			sleep(1);
		} catch(Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
		}

        return true;
    }

    public function twilio_twiml(){
		$response = new VoiceResponse();
        $AnsweredBy = $_REQUEST["AnsweredBy"];
		
        //if not human, play the audio file
        if($AnsweredBy !== null && $AnsweredBy !== 'human'){	
            $response->play($_REQUEST['audioFileUrl']);
		}

		//if human, hangup
        else {
            $response->hangup();
        }   

        header("Content-type: text/xml");
        echo $response;
        die();
    }

    public function twilio_status_callback($request){
        //update phone number record
        $ID = $_REQUEST['ID'];
		
		$meta = get_metadata_by_mid('post', $ID);
		$meta->meta_value['status'] = $_REQUEST['CallStatus'];
		$meta->meta_value['modified'] = $_REQUEST['Timestamp'];
		if($_REQUEST["RecordingUrl"] != ""){
			$meta->meta_value['RecordingUrl'] = $_REQUEST['RecordingUrl'];
        }
		update_metadata_by_mid('post', $ID, $meta->meta_value);

		// header("Content-type: text/xml");
        echo "OK";
        die();
    }

	function upload_audio_file() {
		$filename = time() . '-' . $_FILES['audiofile']['name'];
		// if ($_FILES['fileToUpload']['size'] <= 500000)
		$result = wp_upload_bits($filename , null, file_get_contents($_FILES['audiofile']['tmp_name']));
		
		//save file reference to user meta data
		$user_id = get_current_user_id();
		$files_meta = get_user_meta($user_id, 'lf_audio_files', true);
		
		$new_files = [];
		if(gettype($files_meta) != 'string') {

			//loop through existing files to make sure they exist and rebuild the array of files
			foreach($files_meta as $file){
				//make sure file exists
				if(file_exists($file["file"]))
					array_push($new_files, $file);
			}
		}

		array_push($new_files, array("url" => $result['url'], "file" => $result['file'], "filename" => $_FILES['audiofile']['name']));
		update_user_meta($user_id, 'lf_audio_files', $new_files);

		
		header('Content-Type: application/json');
		echo(json_encode($result));
		die();
	}

	function update_vm_broadcast() {
		//update leadfinder record meta to turn on/off a vm broadcast

		$data = json_decode(file_get_contents('php://input'), true);
		$ID = $data['ID'];

		update_post_meta($ID, 'vm_broadcast_active', $data['voicemail']['active']);
		update_post_meta($ID, 'vm_broadcast_settings', $data['voicemail']);

		//if turning on, call the run_vm_broadcast
		if($data['voicemail']['active'] == '1'){
			$obj = $this->run_vm_broadcast($ID);
			header('Content-Type: application/json');
			echo(json_encode($obj));
		}
		die();
	}

	function run_broadcasts() {
		//get all finder records and run broadcast for each active one
		$posts = $this->get_finder_posts();
		foreach($posts as $post) {
			// print_r($post);
			echo "\nVoicemail: ".$post->voicemail['active'];
		}
		die("done!");
	}

	function run_vm_broadcast($ID = null) {
		if($ID == null)
			return;
		
		$settings = get_post_meta($ID, 'vm_broadcast_settings', true);
		// $settings['list_id'] = $ID;
		// print_r($settings);

		// still running?
		if($settings['active'] != '1')
			return;

		// get all businesses with phone_type = 'mobile'
		$posts = get_posts(array(
			'post_type' => 'pp_lead_record',
			'post_status' => 'publish',
			'post_parent' => $ID,
			'posts_per_page' => -1,
			'meta_key' => 'phone_type',
			'meta_value' => 'mobile'
		));

		$counter = 0;

		foreach($posts as $post) {

			// look for the next eligible record
			$post->meta = get_post_meta($post->ID);
			
			// add in the voicemail history for this user id and phone number
			$phone_number_post = get_posts(array(
				'post_type' => 'pp_phone_history',
				'post_status' => 'publish',
				'author' => $post->post_author,
				's' => $post->meta['phone_number'][0]
			));

			
			if(count($phone_number_post) > 0){
				$phone_history_id = $phone_number_post[0]->ID;
				$post->meta['voicemail_history'] = get_post_meta($phone_history_id, 'voicemail');
			} else {
				$phone_history_id = wp_insert_post(array(
					'post_title' => $post->meta['phone_number'][0],
					'post_type' => 'pp_phone_history',
					'post_status' => 'publish'
				));
				$post->meta['voicemail_history'] = '';
			}

			$send_vm = false;
			
			switch($settings['send_to']){
				// Send to all who haven't received THIS audio
				case 1:
					if($this->not_Received_This_Audio($post, $settings)) {
						// echo "\nsend it 1 => ".$post->meta['phone_number'][0];
						$send_vm = true;
					}
					break;
				case 3:
					if($this->not_Received_Any_Audio_On_This_List($post, $settings)) {
						// echo "send it 3\n";
						$send_vm = true;
					}
					break;
				// Send to all who haven't received ANY audio on ANY list
				case 4:
					if($this->not_Received_Any_Audio_On_Any_List($post, $settings)) {
						// echo "send it 4\n";
						$send_vm = true;
					}
					break;
				// Send to all on this list
				case 5:
					// echo "send it 5\n";
					$send_vm = true;
					break;
				default:
					// echo "do not send\n";

			}

			if($send_vm) {

				//keeping track of vms being generated so we can break out at a max of 30 for this cycle
				$counter++;
				
				// optimistically update vm history to avoid duplicate sends
				$settings['filename'] = basename($settings['audio_file_url']);
				$settings['datetime'] = gmdate("Y-m-d G:i:s");
				$history_id = add_post_meta($phone_history_id, 'voicemail', $settings); 
				$settings['history_id'] = $history_id;
				
				// $this->send_voicemail($post, $settings);

			} else {
				// echo "not sending\n";
			}

			// send up to 30 in this cycle
			if($counter >= 30)
				break;
			
		}

		//update status if sending less than 30. Means we've reached the end.
		if($counter < 30) {
			$settings['active'] = 0;
			// update_post_meta($ID, 'vm_broadcast_settings', $settings);
			$status = "complete";
			$active = 0;
		} else {
			$status = "running";
			$active = 1;
		}

		$obj = (object)[];
		$obj->status = $status;
		$obj->active = $active;
		$obj->count = $counter;

		return $obj;

	}

	function not_Received_This_Audio($post, $settings) {
		
		// check this list specifically
		$voicemail_history = $post->meta['voicemail_history'];

		// if no history, then it qualifies
		if(gettype($voicemail_history) == 'string' || count($voicemail_history) < 1)
			return true;

		// loop through history to check for specic audio
		foreach($voicemail_history as $item){
			if(basename($item['audio_file_url']) == basename($settings['audio_file_url']))
				return false;
		}

		return true;
	}

	function not_Received_Any_Audio_On_This_List($post, $settings) {
		// check this list specifically
		$voicemail_history = $post->meta['voicemail_history'];

		// if no history, then it qualifies
		if(gettype($voicemail_history) == 'string' || count($voicemail_history) < 1)
			return true;

		// loop through history to check for any audio matching this list
		foreach($voicemail_history as $item){
			if($item['list_id'] == $settings['list_id'])
				return false;
		}

		return true;
	}

	function not_Received_Any_Audio_On_Any_List($post, $settings) {
		// check this list specifically
		$voicemail_history = $post->meta['voicemail_history'];

		// if no history, then it qualifies
		if(gettype($voicemail_history) == 'string' || count($voicemail_history) < 1)
			return true;

		return false;
	}

	function test() {
		$ID = 32145;
		$meta = get_metadata_by_mid('post', $ID);
		print_r($meta->meta_value);
		$meta->meta_value['status'] = 'complete';
		update_metadata_by_mid('post', $ID, $meta->meta_value);

		$meta2 = get_metadata_by_mid('post', $ID);
		print_r($meta2->meta_value);
		
		die();
	}
	

}

$lfapi_obj = new LocalLeadScannerPlugin();

add_action('wp_ajax_gpapiscraper_scrape', 'LocalLeadScanner\gpapiscraper::scrape');
add_action('init', 'LocalLeadScanner\gpapiscraper::init');
