<?php
//die("scraper...");
//test
// go to https://code.google.com/apis/console to get your api key
$user = wp_get_current_user();
$key = esc_attr( get_user_meta( $user->ID, 'gpapiscraper_google_key', true ) );
if($key == '')
	die('<tr><td colspan="20">Please update your google api key in your user <a href="profile.php">profile</a>.</td></tr>');

define('APIKEY', $key);



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
		
		if(!in_array($data[7], $phones)){
			$txt .= implode(",", $data) . "\n";
		}
		$phones[] = $data[7];  
		
	}
	
	$txt = str_replace("&amp;", "&", $txt);
	$txt = stripslashes($txt);
	header("Content-type: application/octet-stream");
	header("Content-Disposition: attachment; filename=\"download.csv\"");
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
	//echo "run_scraper($pagetoken)\n";
	$data = do_query($_REQUEST['query'], $pagetoken);
	//print_r($data);
	//die();
	get_details($data);
	//echo "next page token: ".$data['next_page_token']."\n";
	if($data['next_page_token'] != ''){
		//echo "next page yes\n";
		//run_scraper( $data['next_page_token'] ); 
		run_scraper( $data['next_page_token'] );
	} else {
		//echo "next page NO\n";
	}
	
}

function get_details($data){
	foreach($data['results'] as $b){
		// echo '<pre>';
		// print_r( $data['results'] );
		// echo '</pre>';
		// die();
		$url = sprintf('https://maps.googleapis.com/maps/api/place/details/json?reference=%s&sensor=false&key=%s', $b['reference'], APIKEY);
		$result = curl_operation($url);
		//print_r($result);
		$business = json_decode($result, 1);
		$business = $business['result'];
		//print_r($business);
		//die();
		
		foreach($business['address_components'] as $a){
			$address[ $a['types'][0] ] = $a['long_name'];
		}
		
		echo "<tr>";
		echo "<td style=\"white-space:nowrap;\">$b[name]</td>";
		echo "<td class=\"phone\">".str_replace(array(" ", "-"), array("", ""), $business['international_phone_number'])."</td>";
		echo "<td style=\"white-space:nowrap;\">$b[formatted_address]</td>";
		echo "<td style=\"white-space:nowrap;\">$address[street_number] $address[route]</td>";
		echo "<td>$address[locality]</td>";
		echo "<td>$address[administrative_area_level_1]</td>";
		echo "<td>$address[country]</td>";
		echo "<td>$address[postal_code]</td>";
		// echo "<td>".str_replace(array(" ", "-"), array("", ""), $business['international_phone_number'])."</td>";
		echo "<td>$business[website]</td>";
		echo "<td>$business[url]</td>";
		echo "<td>".count($business['photos'])."</td>";
		echo "<td>".count($business['reviews'])."</td>";
		echo "<td>$business[rating]</td>";
		echo "<td>{$business[geometry][location][lat]}</td>";
		echo "<td>{$business[geometry][location][lng]}</td>";
		
		$p = $business['opening_hours']['periods'];
		for($i=0; $i < 7; $i++){
			echo "<td>".$p[$i]['open']['time']."</td>";
			echo "<td>".$p[$i]['close']['time']."</td>";
		}
		echo "<td>$business[id]</td>";
		echo "<td>$_REQUEST[query]</td>";
		echo "</tr>\n";
		
	}
}

function do_query($query, $pagetoken = ''){
	//echo "do_query pagetoken: $pagetoken";
	
	if($pagetoken == '')
		$url = sprintf('https://maps.googleapis.com/maps/api/place/textsearch/json?query=%s&sensor=false&key=%s', urlencode($query), APIKEY);
	else
		$url = sprintf('https://maps.googleapis.com/maps/api/place/textsearch/json?sensor=false&key=%s&pagetoken=%s', APIKEY, $pagetoken);
	//echo "$url\n";
	$result = curl_operation($url);
	$data = json_decode($result, 1);
	return $data;
}
//print_r($data);
function get_address($address_array){
	
}

function curl_operation($url, $timeout_sec = 5) {
	//$headers = array("Content-type: multipart/form-data");

	$ch = curl_init(); // Initialize the curl
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
	curl_setopt($ch, CURLOPT_URL, $url);  // set the opton for curl
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);// set the option to transfer output from script to curl
	//curl_setopt($ch, CURLOPT_POST, 1);
	//curl_setopt($ch, CURLOPT_POSTFIELDS, $val); // add POST fields
	//curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	
	if($timeout_sec > 0)
	{
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout_sec);
	}
	
	$response = curl_exec($ch); // Execute curl
	return $response;
}

die();
?>