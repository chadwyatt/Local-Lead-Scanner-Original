<?php
$key = esc_attr( get_user_meta( $user->ID, 'gpapiscraper_google_key', true ) );
?>

			<h3>GpApiScraper Google Key</h3>
			<table class="form-table">
				<tr>
					<th><label for="gpapiscraper_google_key">Google API Key</label></th>
					<td>
						<input type="password" name="gpapiscraper_google_key" id="gpapiscraper_google_key" value="<?php echo $key ?>" class="regular-text" /><br />
						<span class="description" <?php echo trim($key) == "" ? 'style="color:#C00;"' : ''; ?>>
                        	Please enter your google api key.
                        </span>
					</td>
				</tr>
            </table>
            
            
            
