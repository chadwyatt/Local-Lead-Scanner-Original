<?php
//gpapiscraper_results
global $post;
$gpapiscraper_results = get_post_meta($post->ID, '_gpapiscraper_results', true);
?>
<style>
table#results thead tr td {white-space:nowrap;}
table#results tbody tr td {white-space:nowrap;}
</style>
<label class="control-label" for="dk_category">Query</label>
<input type="text" style="width:250px;" id="dk_what" name="query">
<a class="button" id="gsubmit">Run</a>

&nbsp;&nbsp;&nbsp;
<span>Status: <span id="gstatus" style="width:80px; display:inline-block;"></span></span> Records: <span id="grecords"></span>
&nbsp;
<div style="width:200px; float:right; text-align: right;">
    <a href="javascript:void(0)" class="button" id="download">Download</a>
    &nbsp;
    <a href="javascript:void(0)" class="button" style="margin-right:10px;" id="clear">Clear</a>
</div>                   
<div style="height:300px; width: 100%; overflow:auto; margin-top:20px;" id="resultspane">
    
    <table class="table table-striped table-bordered table-condensed" id="results">
        <thead>
            <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Full Address</th>
                <th>Street</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Zip</th>
                <th>Website</th>
                <th>Places</th>
                <th>Photos</th>
                <th>Reviews</th>
                <th>Rating</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Mon Open</th>
                <th>Mon Close</th>
                <th>Tue Open</th>
                <th>Tue Close</th>
                <th>Wed Open</th>
                <th>Wed Close</th>
                <th>Thu Open</th>
                <th>Thu Close</th>
                <th>Fri Open</th>
                <th>Fri Close</th>
                <th>Sat Open</th>
                <th>Sat Close</th>
                <th>Sun Open</th>
                <th>Sun Close</th>
                <th>Google ID</th>
                <th>Query</th>
            </tr>
        </thead>
        <tbody id="business_rows">
        	<?php echo $gpapiscraper_results; ?>
        </tbody>
    </table>
 </div>
<textarea name="gpapiscraper_results" id="gpapiscraper_results" style="display:none;"></textarea>

          
<script type="text/javascript">
jQuery(function(){
	jQuery("#edit-slug-box, #minor-publishing, a:contains('View post')").hide();
	jQuery("input#publish").val("Save");
	
	count = jQuery("table#results tbody#business_rows tr").length;
	jQuery("span#grecords").html(count);
	jQuery("span#gstatus").html("Done");
	
	jQuery("#gsubmit").click(function(e){
		e.preventDefault();
		jQuery("#resultspane").show();
		jQuery("span#gstatus").html('Running <img src="<?php echo plugins_url( 'ajax-loader.gif', __FILE__ ); ?>" />');
		jQuery("#hiddenaction").val("gpapiscraper_scrape");
		jQuery.get('<?php echo admin_url( 'admin-ajax.php' ); ?>', jQuery("#post").serialize(), function(result){
			jQuery("table#results tbody").append(result);
			jQuery("table#results tbody tr td:nth-child(9), table#results tbody tr td:nth-child(10)").css({cursor:"pointer", "text-decoration":"underline", color:"blue", width:"200px", overflow:"hidden"});
			count = jQuery("table#results tbody#business_rows tr").length;
			jQuery("span#grecords").html(count);
			jQuery("span#gstatus").html("Done");
		});
		jQuery("#hiddenaction").val( jQuery("#originalaction").val() );
		return false;
	});
	
	jQuery("form#post").submit(function(){
		jQuery("#gpapiscraper_results").val( jQuery("tbody#business_rows").html() );
	});
	
	jQuery("#clear").click(function(){
		jQuery("tbody#business_rows").html("");
		jQuery("span#grecords").html('0');
	});
	
	jQuery("#download").click(function(){
		var data = jQuery("tbody#business_rows").html();
		jQuery.download("<?php echo admin_url( 'admin-ajax.php?action=gpapiscraper_scrape' ); ?>&download_data=1", {records: data});
		
	});
	
	jQuery("tr td:nth-child(9), tr td:nth-child(10)").live('click', function(){
		var url = jQuery(this).html();
		var windowName = "popUp";//jQuery(this).attr("name");
		window.open(url, windowName);
	});
	
});

jQuery.download = function(url, data, method){
	//url and data options required
	if( url && data ){ 
		//data can be string of parameters or array/object
		data = typeof data == 'string' ? data : jQuery.param(data);
		//split params into form inputs
		var inputs = '';
		jQuery.each(data.split('&'), function(){ 
			var pair = this.split('=');
			inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />'; 
		});
		//send request
		jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		.appendTo('body').submit().remove();
	};
};
</script>