<?php
//die("scraper...");
//test
// go to https://code.google.com/apis/console to get your api key
$user = wp_get_current_user();
$key = esc_attr( get_user_meta( $user->ID, 'gpapiscraper_google_key', true ) );
if($key == '')
	die('<tr><td colspan="20">Please update your google api key in your user <a href="profile.php">profile</a>.</td></tr>');

define('APIKEY', $key);

//used in get_details
// $user_id = get_current_user_id();
// global $signalwire;
// $signalwire = get_user_meta($user->ID, 'signalwire', true);
// echo "Start: ";
// print_r($signalwire);	

//ini_set('max_execution_time', "120");
if ($_GET["download_data"] == "1")
{
	include("phpQuery/phpQuery.php");
	$html = urldecode($_POST["records"]);
	$doc = phpQuery::newDocument($html);
	phpQuery::selectDocument($doc);
	$phones[] = "";
	foreach( pq('tr') as $tr){
		unset($data);
		foreach( pq($tr)->children('td') as $td){
			$data[] = '"'.pq($td)->html().'"';
		}
		
		if(!in_array($data[1], $phones)){
			$txt .= implode(",", $data) . "\n";
		}
		$phones[] = $data[1];  
		$query = $data[30];
	}
	
	$txt = str_replace("&amp;", "&", $txt);
	$txt = stripslashes($txt);
	$header_row = "Name,Phone,Full Address,Street,City,State,Country,Zip,Website,Places,Photos,Reviews,Rating,Latitude,Longitude,Mon Open,Mon Close,Tue Open,Tue Close,Wed Open,Wed Close,Thu Open,Thu Close,Fri Open,Fri Close,Sat Open,Sat Close,Sun Open,Sun Close,Google ID,Query\n";
	$txt = $header_row.$txt;
	header("Content-type: application/octet-stream");
	header("Content-Disposition: attachment; filename=\"{$query}.csv\"");
	echo $txt;
	die();
}


//include("config.php");

run_scraper();


$count = 0;

function run_scraper($pagetoken = ''){
	
	global $count;
	$count++;
	if($count > 30) return;

	$data = do_query($_REQUEST['query'], $pagetoken);

	
	foreach($data['results'] as $b){
		//look for existing reference for this scraper record
		$posts = get_posts(array(
			'post_type' => 'pp_lead_record',
			'post_status' => 'publish',
			'meta_key' => 'business_reference',
			'meta_value' => $b['reference'],
			'post_parent' => $_REQUEST['post_ID']
		));
		//get details if no existing record found for this scraper record
		if(count($posts) === 0){
			get_details($b);
		}
	}

	if($data['next_page_token'] != ''){
		run_scraper( $data['next_page_token'] );
	} else {
		//all done
	}
	
}

function get_details($b){

	//check status not cancelled
	$cancelled = get_post_meta($_REQUEST['post_ID'], 'cancel', true);
	if($cancelled == true) {
		update_post_meta($_REQUEST['post_ID'], 'cancel', false);
		die();
	}

	$url = sprintf('https://maps.googleapis.com/maps/api/place/details/json?reference=%s&sensor=false&key=%s', $b['reference'], APIKEY);
	$result = curl_operation($url);
	$business = json_decode($result, 1);
	$business = $business['result'];

	foreach($business['address_components'] as $a){
		$address[ $a['types'][0] ] = $a['long_name'];
	}
	
	$phone = str_replace(array(" ", "-"), array("", ""), $business['international_phone_number']);

	//lookup phone type
	$user_id = get_current_user_id();
	$signalwire = get_user_meta($user_id, 'signalwire', true);
	$twilio = get_user_meta($user_id, 'lls_twilio', true);
	if($signalwire['active'] == 1) {
		$url = sprintf('https://%s.signalwire.com/api/relay/rest/lookup/phone_number/%s?include=carrier,cnam', $signalwire['namespace'], $phone);
		$basicauth = 'Basic ' . base64_encode( $signalwire['project_id'].':'.$signalwire['api_token'] );
		$lookup = wp_remote_get($url, array('headers' => array('Authorization' => $basicauth)));
		$lookup = json_decode($lookup['body'], true);
		$phone_type = $lookup['carrier']['linetype'];
		$business['phone_type'] = $phone_type;
	}

	//create a phone meta data record, will be used in VM Drop plugin
	update_post_meta($_REQUEST['post_ID'], sprintf('_phone_%s', $phone), $phone);

	// error_log(print_r($business, true));

	//save business record
	$post = array(
		'post_type' => 'pp_lead_record',
		'post_status' => 'publish',
		'post_parent' => $_REQUEST['post_ID'],
		'post_title' => $b['name']
	);
	$ID = wp_insert_post($post);
	update_post_meta($ID, 'business_reference', $b['reference']);
	update_post_meta($ID, 'business_data', $business);

}



function do_query($query, $pagetoken = ''){
	//echo "do_query pagetoken: $pagetoken";
	
	if($pagetoken == '')
		$url = sprintf('https://maps.googleapis.com/maps/api/place/textsearch/json?query=%s&sensor=false&key=%s', urlencode($query), APIKEY);
	else
		$url = sprintf('https://maps.googleapis.com/maps/api/place/textsearch/json?sensor=false&key=%s&pagetoken=%s', APIKEY, $pagetoken);
	// echo "$url\n";
	$result = curl_operation($url);
	$data = json_decode($result, 1);
	if(strlen($data['error_message']) > 0) {
		echo $data['error_message'];
		die();
	}
	return $data;
}
//print_r($data);
function get_address($address_array){
	
}

function curl_operation($url, $timeout_sec = 5) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);// set the option to transfer output from script to curl
	
	if($timeout_sec > 0)
	{
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout_sec);
	}
	
	$response = curl_exec($ch);
	return $response;
}

die();
?>