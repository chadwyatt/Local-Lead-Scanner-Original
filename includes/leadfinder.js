( function() {
    var colors = {
        orange1: ''
    }
    var vm = new Vue({
        el: document.querySelector('#lf-mount'),
        template: `
            <div>
                <div v-bind:style="style.brandTitle">
                    <i class="fas fa-map-marker-alt" :style="[style.brandTitleIcon]"></i>
                    Local Lead Scanner
                </div>
                <div v-if="lf_admin_page && isAdministrator" style="margin-top:-20px;margin-bottom:20px;">
                    <i class="fas fa-info-circle"></i> You can optionally add the [local-lead-finder] shortcode to a page or post.
                </div>

                <div v-if="view == 'activate'" style="max-width:700px;margin:50px auto;">
                    <h2 v-bind:style="style.heading">Activate</h2>
                    <p>Please enter your license key to register this installation. <a href="https://localleadscanner.com" target="_blank">Need a license?</a></p>
                    <input v-model="license_key" v-bind:style="[style.input, style.inputLarge]" />
                    <button v-bind:style="[style.button, style.buttonFullWidth]" v-on:click="activatePlugin">Activate</button>
                </div>

                <div v-if="view == 'google_places_api_key'" style="max-width:700px;margin:50px auto;">
                    <h3>API Key</h3>
                    <label>Google Places API Key</label>
                    <input type="password" v-model="update_google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                    <button v-bind:style="style.button" v-on:click="saveApiKey">Save API Key</button>
                </div>
                <div class="lead-finder-wrapper" v-bind:style="[style.wrapper, style.shadow]">
                    
                    <div v-if="view != '' && view != 'activate' && view != 'google_places_api_key'" style="display: flex;">
                        
                        <!-- LEFT COLUMN -->
                        <div v-bind:style="style.leftColumn">
                            <div v-bind:style="style.leftColumnContent">
                                
                                <div style="margin-bottom:5px;">
                                    <a v-on:click="showNewFinderForm" :style="[style.leftColumnLink]">New <i class="fas fa-plus-circle"></i></a>
                                    <a v-on:click="showSettings" :style="[style.leftColumnLink, style.floatRight]">Settings <i class="fas fa-sliders-h"></i></a>
                                </div>
                                <input v-model="search" v-bind:style="[style.input, style.searchInput]" placeholder="Search" autocomplete="off" />
                            </div>
                                <h4 :style="[style.heading, style.navSubHeading]">Scanners</h4>
                                <div v-if="loadingFinders" style="margin-left:20px;">Loading...</div>

                                <!-- SCANNER NAV ITEMS -->
                                <div v-for="item in finders" v-on:click="loadFinder(item)" v-if="showFinderInList(item.post_title)">
                                    <a v-if="item.ID == finder.ID" v-bind:style="[style.navItem, style.navItemActive]" class="lfNavItem">
                                        <i class="fas fa-map-marker-alt" :style="[style.navItemIconActive]"></i> 
                                        {{decodeHTML(item.post_title)}}
                                    </a>
                                    <a v-else v-bind:style="[style.navItem]" class="lfNavItem">
                                        <i class="fas fa-map-marker-alt" style="opacity:0.5;"></i> 
                                        {{decodeHTML(item.post_title)}}
                                    </a>
                                </div>
                        </div>

                        <div v-bind:style="style.rightColumn">
                            <div v-bind:style="style.rightColumnContent" class="content">

                                <!-- SCANNER FORM -->
                                <div v-if="view !== 'settings'">
                                    <a v-if="finder.ID > 0 && view !== 'settings'" v-on:click="confirmDelete" style="float:right;cursor:pointer;color:red;margin-right:15px;">Delete</a>
                                    <h2 v-bind:style="[style.heading, style.mainTitle]">{{decodeHTML(finderTitle)}}</h2>
                                    <div v-bind:style="[style.record, style.shadow]">
                                        <div>
                                            <label>Title</label>
                                            <div>
                                                <div style="width:80%;float:left;">
                                                    <input v-model="finder.post_title" v-bind:style="[style.input, style.inputLarge]" />
                                                </div>
                                                <div style="width:18%;float:left;">
                                                    <button v-bind:style="[style.btn, style.btnPrimary, style.btnFullWidth]" v-on:click="saveLeadFinder">Save Title</button>
                                                </div>
                                                <div style="clear:both;"></div>
                                            </div>
                                        </div>
                                        <div v-if="finder.ID > 0">
                                            <div style="width:39%;float:left;margin-right:2%">
                                                <label>Query</label>
                                                <input v-model="query" v-bind:style="[style.input, style.inputLarge]" />
                                            </div>
                                            <div style="width:39%; float:left;">
                                                <label>Locations</label>
                                                <select label="Locations" v-model="location" :items="finder.locations" v-bind:style="[style.input, style.inputLarge]">
                                                    <option value="">Select location (optional)</option>
                                                    <option v-for="location in locations" v-bind:value="location.locations">
                                                        {{ location.title }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div style="width:18%;float:left;">
                                                <label>&nbsp;</label>
                                                <button v-bind:style="[style.btn, style.btnPrimary, style.btnFullWidth]" v-on:click="runLeadFinder">Run Scanner</button>
                                            </div>
                                            <div style="clear:both;"></div>
                                        </div>
                                        <div style="clear:both;"></div>
                                    </div>
                                </div>


                                <!-- SCANNER RECORDS -->
                                <div v-if="view === 'finder'" style="margin-top:30px;">
                                    
                                    <strong>Filters:</strong> 
                                    <div style="margin-bottom:16px;">
                                        <span :style="style.filter">
                                            Website
                                            <select v-model="filters.website" :style="[style.input, style.inputSmall]">
                                                <option>All</option>
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </span>
                                        
                                        <span :style="style.filter">
                                            Phone Type
                                            <select v-model="filters.phone_type" :style="[style.input, style.inputSmall]">
                                                <option>All</option>
                                                <option value="wireless">Wireless</option>
                                                <option value="landline">Landline</option>
                                            </select>
                                        </span>
                                        
                                        <span :style="style.filter">
                                            Reviews 
                                            <select v-model="filters.reviews" :style="[style.input, style.inputSmall]">
                                                <option value="5">All</option>
                                                <option value="4">4 or less</option>
                                                <option value="3">3 or less</option>
                                                <option value="2">2 or less</option>
                                                <option value="1">1 or less</option>
                                                <option value="0">0</option>
                                            </select>
                                        </span>

                                        <span :style="style.filter">
                                            Rating 
                                            <select v-model="filters.rating" :style="[style.input, style.inputSmall]">
                                                <option value="5">All</option>
                                                <option value="4.5">4.5 or lower</option>
                                                <option value="4">4 or lower</option>
                                                <option value="3.5">3.5 or lower</option>
                                                <option value="3">3 or lower</option>
                                                <option value="2.5">2.5 or lower</option>
                                                <option value="2">2 or lower</option>
                                                <option value="1.5">1.5 or lower</option>
                                                <option value="1">1 or lower</option>
                                            </select>
                                        </span>
                                        <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download()">
                                            <i class="fas fa-download"></i> Download
                                        </a>
                                        <a :style="[style.copyDataLink]" v-on:click="exportWebsites">
                                            <i class="fas fa-map-marker-alt"></i>
                                            Copy Data
                                        </a>
                                    </div>
                                    
                                    <h3 :style="[style.heading, style.headingRecords]">Records <span style="font-size:.5em;">({{businesses.length}} of {{original_businesses.length}})</span></h3>
                                    
                                    <!-- SCANNER RECORDS -->
                                    <div class="lf-records">
                                        <div v-if="loadingRecords">Loading...</div>
                                        <div v-for="business in businesses" v-bind:style="[style.record, style.shadow]">
                                            <div style="float:right;display:inline-block">
                                                <a style="margin-left:5px;" v-if="business.business_data.website" :href="business.business_data.website" target="_blank">
                                                    <i class="fas fa-external-link-alt"></i>
                                                </a>
                                                <a style="margin-left:5px;" v-if="business.business_data.url" :href="business.business_data.url" target="_blank">
                                                    <i class="fas fa-map-marker-alt"></i>
                                                </a>
                                                <span style="margin-right:5px;">{{rating(business)}}</span>
                                                <span style="margin-right:5px;">({{reviewsCount(business)}})</span>
                                                <div class="Stars right" :style="stars(rating(business))" :label="business.business_data.rating"></div>
                                                <div style="clear:both;"></div>
                                                <div><a v-on:click="showDetails(business)" style="float:right;cursor:pointer;">Details</a></div>
                                            </div>
                                            <div :style="[style.recordTitle]">{{business.post_title}}</div>
                                            <div :style="[style.recordText]">
                                                <span v-html="business.business_data.adr_address"></span><br />
                                                {{business.business_data.formatted_phone_number}}
                                                <span v-if="business.business_data.phone_type !== undefined">
                                                    <span v-if="business.business_data.phone_type == 'wireless'" :title="business.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-mobile-alt"></i></span>
                                                    <span v-if="business.business_data.phone_type != 'wireless'" :title="business.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-phone"></i></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- SETTINGS -->
                                <div v-if="view === 'settings'">
                                    <h2 v-bind:style="[style.heading]">Settings</h2>
                                    <div>
                                        <a v-on:click="settings_view = 'locations'" v-bind:style="[style.navpill]">Locations</a>
                                        <a v-on:click="settings_view = 'phone_lookup'" v-bind:style="[style.navpill]">Phone Type Lookup</a>
                                        <a v-on:click="settings_view = 'google_api_key'" v-bind:style="[style.navpill]">Google API Key</a>
                                    </div>
                                    <div v-if="view === 'settings'" v-bind:style="[style.record, style.shadow]">
                                        <a v-if="isAdministrator" style="float:right;cursor:pointer;margin-left:15px;" v-on:click="confirmDeactivate">Deactivate</a>
                                        
                                        
                                        <!-- GOOGLE API KEY SETTINGS -->
                                        <div v-if="settings_view === 'google_api_key'" style="margin-bottom:30px;">
                                            <h3>API Key</h3>
                                            <label>Google Places API Key</label>
                                            <input type="password" v-model="update_google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                                            <button v-bind:style="style.button" v-on:click="saveApiKey">Save API Key</button>
                                        </div>

                                        <!-- LOCATIONS SETTINGS -->
                                        <div v-if="settings_view === 'locations'" style="margin-bottom:30px;">
                                            
                                            <!-- LOCATIONS LEFT NAV -->
                                            <div style="width:30%;float:left; padding: 6px 0px;">
                                                <h4 :style="[style.heading]">
                                                    Locations
                                                    <a :style="[style.newLocationLink]" v-on:click="locations_view = 'new'">New <i class="fas fa-plus-circle"></i></a>
                                                </h4>
                                                <div :style="[style.locationsNav]">
                                                    <div v-for="item in locations">
                                                        <a v-on:click="editLocation(item)" :style="[style.locationNavLink]">{{item.title}}</a>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style="width:68%;float:right;">

                                                <!-- EDIT LOCATION FORM -->
                                                <div v-if="locations_view !== 'new'">
                                                    <div v-for="location in locations">
                                                        <div v-if="location.index == edit_location.index">
                                                            <label>Title</label>
                                                            <input v-model="location.title" v-bind:style="[style.input, style.inputLarge]" />

                                                            <label>Locations</label>
                                                            <textarea v-model="location.locations" v-bind:style="[style.input, style.inputLarge, style.textarea]"></textarea>
                                                            <div style="text-align:right;">
                                                                <a v-if="confirm_delete_location !== location.index" v-on:click="confirm_delete_location = location.index" style="cursor:pointer;">Delete Location</a>
                                                                <span v-if="confirm_delete_location === location.index">
                                                                    Are you sure? 
                                                                    <a v-on:click="deleteLocation(location.index)" style="cursor:pointer;color:red;margin-left:10px;margin-right:10px;font-weight:bold;">Yes, Delete!</a>
                                                                    <a v-on:click="confirm_delete_location = null" style="cursor:pointer;">Cancel</a>
                                                                </span>
                                                                <button v-on:click="saveLocations" v-bind:style="[style.btn, style.btnPrimary, style.btnLarge]">Save Location</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- NEW LOCATION FORM -->
                                                <div v-if="locations_view == 'new'" style="margin-bottom:40px;">
                                                    <label>New Location Title</label>
                                                    <input v-model="new_location.title" v-bind:style="[style.input, style.inputLarge]" />

                                                    <label>Locations</label>
                                                    <textarea v-model="new_location.locations" v-bind:style="[style.input, style.inputSmall, style.textarea]"></textarea>
                                                    <button v-on:click="saveLocations" v-bind:style="[style.btn, style.btnPrimary, style.btnLarge, style.floatRight]">Save Location</button>
                                                </div>

                                            </div>
                                            <div style="clear:both;"></div>
                                        </div>

                                        <!-- SIGNAL WIRE SETTINGS -->
                                        <div v-if="settings_view === 'phone_lookup'" style="margin-bottom:30px;">
                                            <h3>SignalWire Phone Type Lookup</h3>
                                            <p>You can optionally enable an API to tell you if a phone number is a mobile, voip, or landline. You will need the following information from your <a href="https://signalwire.com" target="_blank">signalwire.com</a> account.</p>

                                            <div><label><input type="checkbox" v-model="signalwire.active" /> Phone Type Lookup Active</label></div>

                                            <label>Namespace</label>
                                            <input v-model="signalwire.namespace" v-bind:style="[style.input, style.inputLarge]" />
                                            
                                            <label>Project ID</label>
                                            <input v-model="signalwire.project_id" v-bind:style="[style.input, style.inputLarge]" />
                                            
                                            <label>API Token</label>
                                            <input v-model="signalwire.api_token" v-bind:style="[style.input, style.inputLarge]" />

                                            <button v-on:click="saveSignalWireSettings" v-bind:style="style.button">Save Settings</button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="myModal" v-bind:style="[style.modal]" v-on:click="style.modal.display = 'none'">
                        <div v-bind:style="[style.modalContent, style.shadow]">
                            <span v-bind:style="style.modalClose" v-on:click="style.modal.display = 'none'">&times;</span>
                            <p v-html="modal_message"></p>
                        </div>
                    </div>
                    
                    <div id="websitesModal" v-bind:style="[style.websitesModal]">
                        <div v-bind:style="[style.modalContent, style.modalContentWide, style.shadow]">
                            <span v-bind:style="style.modalClose" v-on:click="style.websitesModal.display = 'none'">&times;</span>
                            <h3 :style="[style.heading]">Copy Field Data</h3>
                            <p>Website URLs and phone numbers are often used in various programs for marketing purposes. You can select and copy all of the values below.</p>
                            <div>
                                <div style="width:48%;float:left;">
                                    <label style="display:block;margin-top:20px"><strong>Website URLs:</strong>
                                        <a v-on:click="copyText('lf_website_urls')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                        <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download(websiteUrls, finder.post_title+'-websites')" title="Download"><i class="fas fa-download"></i></a>
                                    </label>
                                    <textarea id="lf_website_urls" :style="[style.input, style.inputLarge, style.textarea]">{{websiteUrls}}</textarea>
                                </div>
                                <div style="width:48%;float:right;">
                                    <label style="display:block;margin-top:20px"><strong>Phone Numbers:</strong>
                                        <a v-on:click="copyText('lf_phone_numbers')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                        <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download(phoneNumbers, finder.post_title+'-phone-numbers')" title="Download"><i class="fas fa-download"></i></a>
                                    </label>
                                    <textarea id="lf_phone_numbers" :style="[style.input, style.inputLarge, style.textarea]">{{phoneNumbers}}</textarea>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div>
                                <label style="display:block;margin-top:20px"><strong>All Records (filtered):</strong>
                                    <a v-on:click="copyText('lf_all_data')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                    <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download()" title="Download"><i class="fas fa-download"></i></a>
                                </label>
                                <textarea id="lf_all_data" :style="[style.input, style.inputLarge, style.textarea]">{{csvData()}}</textarea>
                            </div>
                        </div>
                    </div>

                    <div id="deleteModal" v-bind:style="style.modalDelete">
                        <div v-bind:style="style.modalContent">
                            <span v-bind:style="style.modalClose" v-on:click="style.modalDelete.display = 'none'">&times;</span>
                            <p style="text-align:center;margin-top:40px;margin-bottom:30px;">Are you sure you want to delete this?</p>
                            <button v-bind:style="[style.button, style.buttonDelete]" v-on:click="deleteLeadFinder">Yes, Delete</button>
                            <button v-bind:style="[style.button]" v-on:click="style.modalDelete.display = 'none'">Cancel</button>
                            <div style="clear:both;"></div>
                        </div>
                    </div>

                    <div id="deactivateModal" v-bind:style="style.deactivateModal">
                        <div v-bind:style="style.modalContent">
                            <span v-bind:style="style.modalClose" v-on:click="style.deactivateModal.display = 'none'">&times;</span>
                            <table style="border:none;">
                                <tr>
                                    <td style="padding:0;"><i class="fas fa-exclamation-circle" style="margin-left:15px;font-size:4em;color:red;"></i></td>
                                    <td><p style="text-align:left;margin-top:40px;margin-bottom:30px;">Are you sure you want to deactivate this plugin and license? You can reactivate it as long has you have a license key.</p></td>
                                </tr>
                            </table>
                            <button v-bind:style="[style.button, style.buttonDelete]" v-on:click="deactivateLicense">Yes, Deactivate</button>
                            <button v-bind:style="[style.button]" v-on:click="style.deactivateModal.display = 'none'">Cancel</button>
                            <div style="clear:both;"></div>
                        </div>
                    </div>

                    <!-- RUN SCANNER MODAL -->
                    <div id="runScraperModal" v-bind:style="style.runScraperModal">
                        <div v-bind:style="style.modalContent">
                            <div style="text-align:center;margin-bottom:20px;">
                                <i class="fas fa-cog fa-spin" style="font-size:4em;margin-top:30px;"></i>
                                <p v-if="!cancelQueries" style="margin-top: 15px;font-weight: bold;font-size: 1.5em;">"{{currentQuery}}"</p>
                                <div v-if="signalwire.active">Phone type lookup is active.</div>
                                <p v-if="cancelQueries" style="margin-top:30px;margin-bottom:30px;font-weight:bold;">Cancelling...</p>
                            </div>
                            <div v-if="queries || queries.length > 0 && cancelQueries == false">
                                <p>Pending: ({{queries.length}})</p>
                                <div style="height:100px; overflow:auto; border: 1px solid #ccc; padding:5px; margin-bottom:15px;">
                                    <div v-for="query in queries">
                                        <div>{{query}}</div>
                                    </div>
                                </div>
                            </div>
                            <button v-bind:style="[style.button, style.buttonDelete]" v-on:click="cancelLeadFinder()">Stop</button>
                            <div style="clear:both;"></div>
                        </div>
                    </div>


                    <!-- BUSINESS DETAILS MODAL -->
                    <div id="details" v-bind:style="style.modalDetails" v-on:click="closeModalOutsideClick">
                        <div v-bind:style="[style.modalDetailsContent, style.shadow]">
                            <span v-bind:style="style.modalClose" v-on:click="style.modalDetails.display = 'none'">&times;</span>
                            
                            <h2 v-bind:style="style.heading">{{currentBusiness.post_title}}</h2>
                            <table class="lf-table" style="margin-top:30px;">
                                <tr>
                                    <td>Business Name</td>
                                    <td>
                                        {{currentBusiness.post_title}}
                                        <a style="margin-left:5px;" v-if="currentBusiness.business_data.url" :href="currentBusiness.business_data.url" target="_blank">
                                            <i class="fas fa-map-marker-alt"></i>
                                        </a>
                                    </td>
                                <tr>
                                <tr>
                                    <td>Address</td>
                                    <td v-html="currentBusiness.business_data.adr_address"></td>
                                <tr>
                                <tr>
                                    <td>Phone</td>
                                    <td>
                                        {{currentBusiness.business_data.formatted_phone_number}}
                                        <span v-if="currentBusiness.business_data.phone_type !== undefined">
                                            <span v-if="currentBusiness.business_data.phone_type == 'wireless'" :title="currentBusiness.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-mobile-alt"></i></span>
                                            <span v-if="currentBusiness.business_data.phone_type != 'wireless'" :title="currentBusiness.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-phone"></i></span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Website</td>
                                    <td>
                                        <a style="margin-left:5px;" v-if="currentBusiness.business_data.website" :href="currentBusiness.business_data.website" target="_blank">
                                            {{currentBusiness.business_data.website}}
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Rating</td>
                                    <td>
                                        <div class="Stars" :style="stars(rating(currentBusiness))" :label="currentBusiness.business_data.rating"></div>
                                        <span style="margin-right:5px;">{{rating(currentBusiness)}}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Photos</td>
                                    <td>{{currentBusiness.business_data.photos !== undefined ? currentBusiness.business_data.photos.length : 0}}</td>
                                </tr>
                                <tr>
                                    <td>Reviews</td>
                                    <td>{{currentBusiness.business_data.reviews !== undefined ? currentBusiness.business_data.reviews.length : 0}}</td>
                                </tr>
                                <tr>
                                    <td>Hours</td>
                                    <td>
                                        <div  v-if="currentBusiness.business_data.opening_hours !== undefined">
                                            <div v-for="item in currentBusiness.business_data.opening_hours.weekday_text">
                                                {{item}}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div style="clear:both;"></div>
                </div>
            </div>
        `,
        data: {
            license_key: '',
            roles: [],
            loadingFinders: false,
            loadingRecords: false,
            google_places_api_key: '',
            update_google_places_api_key: '',
            confirm_delete_location: null,
            finders: [],
            businesses: [],
            original_businesses: [],
            license_status: null,
            showApiKeyField: false,
            filters: {
                website: 'All',
                phone_type: 'All',
                reviews: 5,
                rating: 5,
                photos: 10
            },
            currentBusiness: {
                business_data: {
                    photos: [],
                    reviews: [],
                    opening_hours: {
                        weekday_text: []
                    }
                }
            },
            finder: {
                ID: '',
                post_title: '',
                locations_id: 0 
            },
            signalwire: {
                active: '',
                namespace: '',
                project_id: '',
                api_token: ''
            },
            settingsAreValid: false,
            query: '',
            queries: [],
            currentQuery: '',
            cancelQueries: false,
            location: '',
            locations: [],
            locations_select: [],
            new_location: {
                title: '',
                locations: ''
            },
            edit_location: {},
            view: '',
            settings_view: 'locations',
            locations_view: 'new',
            search: '',
            modal_message: '',
            theme: 'default',
            colors: {
                default: {
                    leftColumn: {
                        bgColor: 'rgb(60 57 57)',
                        link: {
                            color: '#fff'
                        }
                    },
                    link: {
                        color: '#2ea3f2'
                    },
                    button: {
                        primary: {
                            text: '#fff',
                            // background: 'rgb(18 54 230)'
                            background: '#2ea3f2'
                        },
                        secondary: {
                            text: '#fff',
                            background: 'gray'
                        },
                        success: {
                            text: '#fff',
                            background: 'green'
                        },
                        danger: {
                            text: '#fff',
                            background: 'red'
                        },
                    },
                    navpill: {
                        text: '#fff',
                        background: 'rgb(236 135 11)'
                    },
                    input: {
                        background: '#efefefab'
                    },
                    searchInput: {
                        background: 'rgb(239 239 239 / 23%)',
                        color: '#fff'
                    },

                    primary: 'orange',
                    secondary: 'gray',
                    background1: '#efefef',
                    background2: '#fff',
                    background3: '#fff',
                    background4: '#000',

                    color1: '#000',
                    color2: '#fff',

                    navColor: '#fff',
                    navBackground: 'transparent',
                    navColorHover: '#fff',
                    navBackgroundHover: '#636161',
                    
                    brandTitleIcon: {
                        color: 'red'
                    },

                    navSubHeading: {
                        color: '#2ea3f2' //link color
                    },

                    navItemActive: {
                        color: '#fff'
                    },
                    navItemIconActive: {
                        color: 'red'
                    },
                    recordTitle: {
                        color: '#000'
                    }

                },
                dark: {
                    background1: '#000',
                    background2: 'rgb(245 244 244)',
                    background3: '#999',
                }
            },
            style: {}
        },
        mounted: function(){
            this.setStyles()
            this.getSettings()
            // this.loadFinders()
            // this.loadLocations()
        },
        computed: {
            finderTitle: function() {
                return this.finder.post_title !== '' ? this.finder.post_title : 'New Lead Scanner'
            },
            websiteUrls: function() {
                //business that have a website
                var businesses = this.businesses.filter(business => {
                    return business.business_data.website && business.business_data.website.length > 0
                })
                let websites = businesses.map(business => {
                    return business.business_data.website
                })
                return websites.join("\n")
            },
            phoneNumbers: function() {
                //business that have a phone number
                var businesses = this.businesses.filter(business => {
                    return business.business_data.international_phone_number && business.business_data.international_phone_number.length > 0
                })
                let phone_numbers = businesses.map(business => {
                    return business.business_data.international_phone_number.replace(/-|\s/g, '')
                })
                return phone_numbers.join("\n")
            },
            isAdministrator: function() {
                return this.roles.includes('administrator')
            }
        },
        methods: {
            setStyles: function() {
                // this.theme = 'dark'
                this.style = {
                    wrapper: {
                        backgroundColor: this.colors[this.theme].background1,
                        borderRadius: '25px'
                    },
                    brandTitle: {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '26px',
                        lineHeight: '0.9',
                        letterSpacing: '-2px',
                        padding: '0 0 9px 17px',
                        marginTop: '20px'
                    },
                    brandTitleIcon: {
                        color: this.colors[this.theme].brandTitleIcon.color,
                        marginRight: '3px'
                    },
                    leftColumn: {
                        width: '25%',
                        float: 'left',
                        marginRight: '1%',
                        backgroundColor: this.colors[this.theme].leftColumn.bgColor,
                        borderTopLeftRadius: '20px',
                        borderBottomLeftRadius: '20px',
                        paddingBottom: '20px'
                    },
                    leftColumnContent: {
                        padding: '20px'
                    },
                    leftColumnLink: {
                        color: this.colors[this.theme].leftColumn.link.color
                    },
                    rightColumn: {
                        width: '74%',
                        float: 'right'
                    },
                    rightColumnContent: {
                        padding: '20px'
                    },
                    link: {
                        color: this.colors[this.theme].link.color,
                        fontWeight: 'normal'
                    },
                    copyDataLink: {
                        color: this.colors[this.theme].link.color,
                        cursor: 'pointer',
                        marginRight: '5px'
                    },
                    navItem: {
                        borderBottom: '1 px solid #ccc',
                        cursor: 'pointer',
                        width: '86%',
                        margin: 'auto',
                        display: 'block',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        
                        '--nav-color': this.colors[this.theme].navColor,
                        '--nav-background-color': this.colors[this.theme].navBackground,
                        
                        '--nav-color-hover': this.colors[this.theme].navColorHover,
                        '--nav-background-color-hover': this.colors[this.theme].navBackgroundHover
                    },
                    navItemActive: {
                        fontWeight: 'bold',
                        color: this.colors[this.theme].navItemActive.color
                    },
                    navItemIconActive: {
                        color: this.colors[this.theme].navItemIconActive.color
                    },
                    subnav: {
                        '--subnav-color': '#fff',
                        '--subnav-background-color': this.colors[this.theme].primary,
                        '--subnav-background-color-hover': this.colors[this.theme].secondary
                    },
                    shadow: {
                        "-webkit-box-shadow": "0px 0px 10px 6px rgba(79,79,79,0.1)", 
                        "box-shadow": "0px 0px 10px 6px rgba(79,79,79,0.1)"
                    },
                    locationsNav: {
                        color: 'blue'
                    },
                    newLocationLink: {
                        color: this.colors[this.theme].link.color,
                        fontSize: '0.8em',
                        marginLeft: '6px'
                    },
                    locationNavLink: {
                        color: this.colors[this.theme].link.color
                    },
                    h1: {
                        marginBottom: '30px',
                        borderBottom: '1px solid #ccc',
                        fontFamily: "'Poppins', sans-serif",
                    },
                    heading: {
                        fontFamily: "'Poppins', sans-serif",
                    },
                    navSubHeading: {
                        color: this.colors[this.theme].navSubHeading.color,
                        paddingLeft: '20px',
                        textTransform: 'uppercase',
                        fontSize: '16px',
                        margin: '5px 0px'
                    },
                    headingRecords: {
                        marginTop: "25px",
                        marginBottom: "-20px"
                    },
                    mainTitle: {
                        fontFamily: 'Poppins, sans-serif',
                        marginTop: '30px',
                        marginBottom: '-10px',
                        marginLeft: '10px',
                    },
                    input: {
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        marginBottom: '10px',
                        width: '100%',
                        backgroundColor: this.colors[this.theme].input.background
                    },
                    inputLarge: {
                        fontSize: '1.5em',
                        padding: '10px 15px'
                    },
                    inputLarge: {
                        padding: '10px 15px'
                    },
                    inputSmall: {
                        width: 'auto',
                        padding: '2px 2px'
                    },
                    textarea: {
                        height: '100px',
                        width: '100%'
                    },
                    searchInput: {
                        backgroundColor: this.colors[this.theme].searchInput.background,
                        color: this.colors[this.theme].searchInput.color,
                        border: 'none',
                        marginTop: '6px'
                    },
                    btn: {
                        padding: '5px 15px',
                        marginBottom: '10px',
                        marginLeft: '10px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    },
                    btnLarge: {
                        padding: '10px 25px'
                    },
                    btnPrimary: {
                        color: this.colors[this.theme].button.primary.text,
                        backgroundColor: this.colors[this.theme].button.primary.background
                    },
                    btnSecondary: {
                        color: this.colors[this.theme].button.secondary.text,
                        backgroundColor: this.colors[this.theme].button.secondary.background,
                    },
                    btnDanger: {
                        color: this.colors[this.theme].button.danger.text,
                        backgroundColor: this.colors[this.theme].button.danger.background,
                    },
                    btnSuccess: {
                        color: this.colors[this.theme].button.success.text,
                        backgroundColor: this.colors[this.theme].button.success.background,
                    },
                    floatRight: {
                        float: 'right'
                    },
                    btnFullWidth: {
                        width: '100%',
                        padding: '10px 15px'
                    },
                    navpill: {
                        color: this.colors[this.theme].navpill.text,
                        backgroundColor: this.colors[this.theme].navpill.background,
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '2px 15px'
                    },
                    record: {
                        padding: '16px 18px',
                        border: '1px solid #e6e3e3',
                        margin: '20px 0px',
                        backgroundColor: this.colors[this.theme].background3,
                        borderRadius: '16px'
                    },
                    modal: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1,
                        paddingTop: '100px',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: 'rgb(0,0,0)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    },
                    modalDelete: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1,
                        paddingTop: '100px',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: 'rgb(0,0,0)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    },
                    deactivateModal: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1,
                        paddingTop: '100px',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: 'rgb(0,0,0)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    },
                    websitesModal: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1,
                        paddingTop: '100px',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: 'rgb(0,0,0)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    },
                    runScraperModal: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1,
                        paddingTop: '100px',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: 'rgb(0,0,0)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    },
                    modalDetails: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1,
                        paddingTop: '100px',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        backgroundColor: 'rgb(0,0,0)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    },
                    modalContent: {
                        margin: 'auto',
                        padding: '28px 36px',
                        border: '1px solid #888',
                        width: '80%',
                        maxWidth: '500px',
                        backgroundColor: this.colors[this.theme].background3,
                        borderRadius: '16px'
                    },
                    modalContentWide: {
                        maxWidth: '800px'
                    },
                    modalDetailsContent: {
                        backgroundColor: '#fefefe',
                        margin: 'auto',
                        width: '80%',
                        maxWidth: '800px',
                        borderRadius: '16px',
                        padding: '28px 36px',
                    },
                    modalClose: {
                        color: '#aaaaaa',
                        float: 'right',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    },
                    filter: {
                        marginRight: '4px',
                        fontSize: '12px'
                    },
                    recordTitle: {
                        color: this.colors[this.theme].recordTitle.color,
                        fontWeight: 'bold',
                        fontSize: '1.25em',
                        letterSpacing: '-1px'
                    },
                    recordText: {
                        lineHeight: '1.4em',
                        marginTop: '4px'
                    }
                }
            },
            saveSignalWireSettings: function() {
                var url = ajaxurl+'?action=lead_finder_signalwire_update';
                this.alert({message:'SAVING...'})
                let g = this
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        signalwire: this.signalwire
                    })
                }).then((response)=>{
                    return response
                }).then((data)=>{
                    g.alert({message:'SAVED', type: 'success', time:2, delay:1})
                })
            },
            editLocation: function(location) {
                this.locations_view = ''
                this.edit_location = location
            },
            reviewsCount: function(business) {
                if(business.business_data === undefined || business.business_data.reviews === undefined)
                    return "0"
                return business.business_data.reviews.length
            },
            confirmDeactivate: function() {
                this.style.deactivateModal.display = 'block'
            },
            deactivateLicense: function() {
                this.style.deactivateModal.display = 'none'
                this.alert({message: "Deactivating..."})
                var url = ajaxurl+'?action=lead_finder_deactivate_license'
                fetch(url).then((response) => {
                    this.style.deactivateModal.display = 'none'
                    return response.json()
                }).then((data) => {
                    this.license_status = ''
                    this.view = 'activate'
                    this.alert({message: "Plugin Deactivated", type:"success", time: 2, delay: 1})
                })
            },
            activatePlugin: function() {
                if(this.license_key.length == 0) {
                    // this.flashModal("Please enter a license key.", 3)
                    this.alert({message: "Please enter a license key.", type:"error", time: 3})
                    return
                }

                var url = ajaxurl+'?action=lead_finder_activate_license&license_key='+this.license_key
                this.alert({message: "Checking key..."})
                fetch(url).then((response) => {
                    return response.json()
                }).then((data) => {
                    if(data.license_status == 'active'){
                        this.license_status = 'active'
                        // this.view = 'finders'
                        // this.loadFinders()
                        // g.loadLocations()
                        this.getSettings()
                        this.alert({message: "Plugin Activated", type:"success", time: 2, delay: 1})
                    } else {
                        // this.flashModal("Error: "+data.message)
                        this.alert({message: data.message, type: "error", delay:1})
                    }
                })
            },
            copyText: function(id) {
                let obj = document.getElementById(id)
                obj.select()
                document.execCommand("copy")
            },
            exportWebsites: function() {
                this.style.websitesModal.display = 'block'
            },
            cancelLeadFinder: function() {
                this.cancelQueries = true
            },
            loadFinders: function() {
                this.loadingFinders = true
                var url = ajaxurl+'?action=lead_finder_list'
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    this.finders = data
                    this.loadingFinders = false
                })
            },
            loadLocations: function() {
                var url = ajaxurl+'?action=lead_finder_get_locations'
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    for(var x = 0; x < data.length; x++){
                        data[x]['index'] = x
                    }
                    this.locations = data
                })
            },
            getSettings: function() {
                var g = this
                var url = ajaxurl+'?action=lead_finder_get_settings'
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    g.google_places_api_key = data.google_places_api_key
                    g.license_status = data.license_status
                    g.roles = data.roles
                    g.signalwire = data.signalwire
                    if(this.license_status == 'active'){
                        g.google_places_api_key = data.google_places_api_key
                        if(data.google_places_api_key != true){
                            g.view = 'google_places_api_key'
                            // g.loadFinders()
                            // g.loadLocations()
                            this.alert({message: "Google API Key", text: "A Google API Key is required to run lead queries."})
                        } else {
                            g.view = 'finders'
                            g.loadFinders()
                            g.loadLocations()
                        }
                    } else {
                        g.view = 'activate'
                        this.alert({message: "ACTIVATION REQUIRED", text: "Enter a valid license key to activate the plugin."})
                    }
                })
            },
            loadFinder: function(item) {
                this.loadingRecords = true
                this.view = 'finder'
                this.finder = item
                this.businesses = []
                // var url = '/wp-json/lead_finder/records/'+item.ID;
                var url = ajaxurl+'?action=lead_finder_records&ID='+item.ID
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this.businesses = data
                        this.original_businesses = data
                        this.loadingRecords = false
                    })
            },
            showFinders: function() {
                this.view = 'finders'
            },
            showFinderInList: function(title) {
                if(this.search.toLowerCase().length === 0)
                    return true
                if(title.toLowerCase().indexOf(this.search.toLowerCase()) > -1)
                    return true
                return false
            },
            showNewFinderForm: function() {
                this.view = 'newfinder'
                this.finder = { post_title: '' }
            },
            showSettings: function() {
                this.view = 'settings'
            },
            saveLeadFinder: function() {
                if(this.finder.ID > 0){
                    var url = ajaxurl+'?action=lead_finder_update';
                    fetch(url, {
                        method: 'post',
                        body: JSON.stringify({
                            ID: this.finder.ID,
                            post_title: this.finder.post_title
                        })
                    }).then((response)=>{
                        return response.json()
                    }).then((data)=>{
                        this.alert({message:'SAVED', type: 'success', time:3})
                        this.finders = data
                    })
                } else {
                    var url = ajaxurl+'?action=lead_finder_create';
                    fetch(url, {
                        method: 'post',
                        body: JSON.stringify({
                            title: this.finder.post_title
                        })
                    }).then((response)=>{
                        return response.json()
                    }).then((data)=>{
                        // this.flashModal('Saved!')
                        this.alert({message:'SAVED', type: 'success', time:3})
                        // this.alert({type:'success', message:'SAVED', time:3})
                        this.finder = data
                        this.loadFinders()
                        this.loadFinder(this.finder)
                        this.view = 'finder'
                    })
                }
            },
            decodeHTML: function (html) {
                var txt = document.createElement('textarea');
                if(html.length == 0)
                    return "Empty"
                txt.innerHTML = html;
                return txt.value;
            },
            saveLocations: function() {
                // this.flashModal("Saving locations...")
                this.alert({message:'Saving locations...'})
                var url = ajaxurl+'?action=lead_finder_save_locations';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        locations: this.locations,
                        new_location: this.new_location
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    this.locations = data
                    // this.flashModal('<span style="color:green;font-weight:bold;">Done!<span>', 2)
                    var g = this
                    setTimeout(function(){
                        g.alert({message:'SAVED', type: 'success', time:2})
                    }, 2000)
                    this.new_location = {
                        title: '',
                        locations: ''
                    }
                })
                return
            },
            saveApiKey: function() {
                var url = ajaxurl+'?action=lead_finder_save_api_key';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        google_places_api_key: this.update_google_places_api_key
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    // this.locations = data
                    this.showApiKeyField = false
                    this.getSettings()
                })
                return
            },
            deleteLocation: function(index){
                this.locations = this.locations.filter(location => location.index !== index)
                return
            },
            flashModal: function(message, time) {
                this.modal_message = message
                this.style.modal.display = 'block'
                if(time !== null && time > 0){
                    time *= 1000
                    let g = this
                    setTimeout(function(){
                        g.style.modal.display = 'none'
                    }, time)
                }
            },
            alert: function({message, type, time, text, delay}) {
                let icon = ''
                switch(type) {
                    case 'success':
                        icon = 'fa-check-circle'
                        break;
                    case 'error':
                        icon = 'fa-exclamation-circle'
                        break;
                    default:
                        type = 'info'
                        icon = 'fa-info-circle'
                }

                // this.modal_message = message
                let subtext = ''
                if(text)
                    subtext = `<p class="lf-alert-subtext">${text}</p>`

                let g = this
                if(delay != null || delay > 0)
                    delay *= 1000
                else
                    delay = 1

                setTimeout(function() {
                    g.modal_message =`<div class="lf-icon-alert-modal lf-${type}"><div class="lf-alert-icon"><i class="fas ${icon}"></i></div><div class="lf-alert-message">${message}</div>${subtext}</div>`
                    g.style.modal.display = 'block'
                    if(time !== null && time > 0){
                        time *= 1000
                        // let g = this
                        setTimeout(function(){
                            g.style.modal.display = 'none'
                        }, time)
                    }
                }, delay)
            },
            showDetails: function(business) {
                this.currentBusiness = business
                this.style.modalDetails.display = 'block'
            },
            runNextQuery: function() {
                let g = this
                if(g.queries.length === 0 || g.cancelQueries === true) {
                    g.currentQuery = ''
                    this.style.runScraperModal.display = 'none'
                    return
                }

                let query = this.queries.shift()
                this.currentQuery = query
                
                var url = `${ajaxurl}?action=gpapiscraper_scrape&post_ID=${this.finder.ID}&query=${query}`;
                fetch(url, {
                    method: 'get'
                }).then((response)=>{
                    g.runNextQuery()
                    this.loadFinder(this.finder)
                })
            },
            runLeadFinder: function() {
                if(this.query == '') {
                    this.alert({message:'QUERY REQUIRED', text: 'Please enter a query to run. i.e. "Dentist near Dallas", etc.', type: 'error'})
                    return
                }
                    
                //reset cancel
                this.cancelQueries = false

                //set up the queries
                let locations = this.location.split("\n")
                this.queries = locations.map(location => {
                    if(location.length > 0)
                        return `${this.query} near ${location}`
                    else
                        return this.query
                })
                this.style.runScraperModal.display = 'block'
                this.runNextQuery()
                return
            },
            stars: function(rating) {
                return "--rating: " + rating + ";"
            },
            rating: function(business) {
                if(business && business.business_data && business.business_data.rating)
                    return business.business_data.rating.toFixed(1)
                return parseInt('0').toFixed(1)
            },
            closeModalOutsideClick: function(event) {
                if(event.target.id === 'details'){
                    this.style.modalDetails.display = 'none'
                    this.style.modal.display = 'none'
                }
            },
            csvData: function() {
                // var url = ajaxurl+'?action=lead_finder_download&lead_finder_ID='+this.finder.ID
                // jQuery('<form action="'+ url +'" method="post"></form>')
		        //     .appendTo('body').submit().remove();

                const lines = []

                //array of data table fields for csv header row
                const fields = ["Name", "Phone", "Phone Type", "Full Address", "Street", "City", "State", "Country", "Postal Code", "Website", "Google Places URL", "Photos", "Reviews", "Rating", "Latitude", "Longitude", "Google ID"]
                
                //build the string and add to lines array
                lines.push(`"`+fields.join(`","`)+`"`)

                //loop through business records and build the csv text line
                this.businesses.map(business => {
                    let b = business.business_data
                    
                    //array of carrier field values based on fields defined by data table
                    let values = []

                    let address = []
                    b.address_components.map(item => {
                        address[item['types'][0]] = item['long_name']
                    })
                    values.push(b.name)
                    values.push(b.international_phone_number !== undefined ? b.international_phone_number.replace(/-|\s/g, '') : "")
                    values.push(b.phone_type !== undefined ? b.phone_type : '')
                    values.push(b.formatted_address)
                    values.push(address['street_number']+' '+address['route'])
                    values.push(address['locality'])
                    values.push(address['administrative_area_level_1'])
                    values.push(address['country'])
                    values.push(address['postal_code'])
                    values.push(b.website)
                    values.push(b.url)
                    values.push(b.photos !== undefined ? b.photos.length : 0)
                    values.push(b.reviews !== undefined ? b.reviews.length : 0)
                    values.push(b.rating || 0)
                    values.push(b.geometry.location.lat)
                    values.push(b.geometry.location.lng)
                    values.push(b.place_id)

                    //build the string and add to lines array
                    lines.push(`"`+values.join(`","`)+`"`)
                })

                //build all rows of csv by joining lines array
                let txt = lines.join("\n")
                return txt
            },
            download: function(data, title) {
                //get the records as csv
                let txt = ""
                if(data === undefined)
                    txt = this.csvData()
                else
                    txt = data

                let filename = ""
                if(title === undefined)
                    filename = this.finder.post_title
                else
                    filename = title

                //generate the download
                var element = document.createElement('a')
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt))
                element.setAttribute('download', `${filename}.csv`)
                element.style.display = 'none'
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
            },
            applyFilters: function() {
                
                let filtered_businesses = this.original_businesses.slice(0)
                
                filtered_businesses = filtered_businesses.filter(business => {
                    if(this.filters.website === 'Yes')
                        return business.business_data.website && business.business_data.website.length
                    else if(this.filters.website === 'No')
                        return business.business_data.website == undefined || business.business_data.website.length == 0
                    else
                        return true
                })

                filtered_businesses = filtered_businesses.filter(business => {
                    if(this.filters.phone_type === 'wireless')
                        return business.business_data.phone_type == 'wireless'
                    else if(this.filters.phone_type === 'landline')
                        return business.business_data.phone_type == 'landline'
                    else
                        return true
                })
            
                filtered_businesses = filtered_businesses.filter(business => {
                    return business.business_data.reviews === undefined || business.business_data.reviews.length <= this.filters.reviews
                })

                filtered_businesses = filtered_businesses.filter(business => {
                    return business.business_data.rating === undefined || business.business_data.rating <= parseInt(this.filters.rating)
                })

                this.businesses = filtered_businesses

            },
            confirmDelete: function() {
                this.style.modalDelete.display = 'block'
            },
            deleteLeadFinder: function() {
                this.style.modalDelete.display = 'none'
                var url = ajaxurl+'?action=lead_finder_delete';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        ID: this.finder.ID
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data) => {
                    this.finders = data
                    this.finder = {
                        post_title: '',
                        locations_id: 0 
                    }
                })
                return
            }
        },
        watch: {
            'query': function(newV, oldV) {
                this.settingsAreValid = newV.length > 0
            },
            'settingsAreValid': function(newV, oldV) {
                this.applyFilters()
            },
            'filters.website': function(newV, oldV) {
                this.applyFilters()
            },
            'filters.reviews':function(newV, oldV) {
                this.applyFilters()
            },
            'filters.rating':function(newV, oldV) {
                this.applyFilters()
            },
            'filters.phone_type': function(newV, oldV) {
                this.applyFilters()
            }
        }
    });
})();