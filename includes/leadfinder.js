( function() {
    var vm = new Vue({
        el: document.querySelector('#lf-mount'),
        template: `
            <div>
                <div v-if="lf_admin_page && isAdministrator" style="margin-right:20px;float:right;display:inline;">
                    <i class="fas fa-info-circle"></i> You can optionally add the <strong>[local-lead-scanner]</strong> shortcode to a page or post.
                </div>
                <div v-bind:style="style.brandTitle">
                    <i class="fas fa-map-marker-alt" :style="[style.brandTitleIcon]"></i>
                    Local Lead Scanner
                </div>
                <div style="clear:both;"></div>
                

                <div v-if="view == 'activate'" style="max-width:700px;margin:50px auto;">
                    <h2 v-bind:style="style.heading">Activate</h2>
                    <p>Please enter your license key to register this installation. <a href="https://localleadscanner.com" target="_blank">Need a license?</a></p>
                    <input v-model="license_key" v-bind:style="[style.input, style.inputLarge]" />
                    <button v-bind:style="[style.btn, style.btnPrimary, style.btnNoMargin, style.btnLarge, style.btnFullWidth]" v-on:click="activatePlugin">Activate</button>
                </div>

                <div v-if="view == 'google_places_api_key'" style="max-width:700px;margin:50px auto;">
                    <h3 :style="[style.heading]">API Key</h3>
                    <label>Google Places API Key</label>
                    <input type="password" v-model="update_google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                    <button v-bind:style="[style.btn, style.btnPrimary, style.btnLarge, style.btnFullWidth, style.btnNoMargin]" v-on:click="saveApiKey">Save API Key</button>
                </div>
                <div class="lead-finder-wrapper" v-bind:style="[style.wrapper]">
                    
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
                                <a :style="[style.link, style.heading, style.navSubHeading]">Scanners</a>
                                <div v-if="loadingFinders" style="margin-left:20px;">Loading...</div>

                                <!-- SCANNER NAV ITEMS -->
                                <div v-for="item in finders" v-on:click="loadFinder(item)" v-if="showFinderInList(item.post_title)" :key="item.ID">
                                    <a v-if="item.ID == finder.ID" v-bind:style="[style.navItem, style.navItemActive]" class="lfNavItem">
                                        <i class="fas fa-map-marker-alt" :style="[style.navItemIconActive]"></i> 
                                        {{decodeHTML(item.post_title)}}
                                        <i v-if="item.voicemail != undefined && item.voicemail.active" class="fas fa-spinner fa-spin" style="margin-left:5px;"></i> 
                                    </a>
                                    <a v-else v-bind:style="[style.navItem]" class="lfNavItem">
                                        <i class="fas fa-map-marker-alt" style="opacity:0.5;"></i> 
                                        {{decodeHTML(item.post_title)}}
                                        <i v-if="item.voicemail != undefined && item.voicemail.active" class="fas fa-spinner fa-spin" style="margin-left:5px;"></i> 
                                    </a>
                                </div>
                        </div>

                        <!-- RIGHT COLUMN -->
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


                                        <!-- RUN SCANNER FORM -->
                                        <div v-if="finder.ID > 0">
                                            <div style="width:39%;float:left;margin-right:2%">
                                                <label>Query</label>
                                                <input v-model="query" v-bind:style="[style.input, style.inputLarge]" />
                                            </div>
                                            <div style="width:39%; float:left;">
                                                <label>Locations  <a style="font-size:.7em;" v-on:click="view = 'settings'; settings_view = 'locations';">EDIT</a></label>
                                                <select label="Locations" v-model="location" :items="finder.locations" v-bind:style="[style.input, style.inputLarge]">
                                                    <option value="">Select location (optional)</option>
                                                    <option v-for="location in locations" v-bind:value="location.locations">
                                                        {{ location.title }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div style="width:18%;float:left;">
                                                <label>&nbsp;</label>
                                                <button v-if="currentQuery == ''" v-bind:style="[style.btn, style.btnPrimary, style.btnFullWidth]" v-on:click="runLeadFinder">Run Scanner</button>
                                                <button v-else v-bind:style="[style.btn, style.btnDanger, style.btnFullWidth]" v-on:click="cancelLeadFinder()">
                                                    <i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i> 
                                                    Stop
                                                </button>
                                            </div>
                                            <div style="clear:both;">
                                                <p v-if="currentQuery != ''">
                                                    <i class="fas fa-cog fa-spin"></i> 
                                                    <span style="font-weight:bold;color:#3ebd65;">Scanning: {{currentQuery}}</span>
                                                    <span v-if="cancelQueries" style="font-weight:bold;margin-left:5px;">[Cancelling]</span>
                                                </p>
                                                <div v-if="queries.length > 0">
                                                    <div v-for="query in queries">
                                                        <div>
                                                            <i class="fas fa-cog" style="opacity:0.4;"></i> 
                                                            Pending: {{query}}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style="clear:both;"></div>
                                        </div>


                                        <div style="clear:both;"></div>
                                    </div>
                                </div>

                                <div v-if="loadingRecords">Loading...</div>
                                
                                
                                <!-- SCANNER RECORDS -->
                                <div v-if="view === 'finder' && businesses && businesses.length > 0" style="margin-top:30px;">

                                    <!-- STATS DASHBOARD -->
                                    <div :style="[style.record, style.shadow]">
                                        <div :style="[style.dashboardWidgetIcon]">
                                            <div :style="[style.dashboardWidgetIconContainer, style.dashboardWidgetIconBg1]"><i class="fas fa-address-book" style="opacity: 0.9"></i></div>
                                            <div :style="[style.dashboardWidgetTitle2]">Records</div>
                                            <div :style="[style.dashboardWidgetNumber2]">{{ original_businesses.length }}</div>
                                        </div>
                                        <div :style="[style.dashboardWidgetIcon, style.marginLeft1]">
                                            <div :style="[style.dashboardWidgetIconContainer, style.dashboardWidgetIconBg2]"><i class="fas fa-mobile-alt" style="opacity: 0.9"></i></div>
                                            <div :style="[style.dashboardWidgetTitle2]">Mobile</div>
                                            <div :style="[style.dashboardWidgetNumber2]">{{ percentMobile }}%</div>
                                        </div>
                                        <div :style="[style.dashboardWidgetIcon, style.marginLeft1]">
                                            <div :style="[style.dashboardWidgetIconContainer, style.dashboardWidgetIconBg3]"><i class="fas fa-globe" style="opacity: 0.9"></i></div>
                                            <div :style="[style.dashboardWidgetTitle2]">Websites</div>
                                            <div :style="[style.dashboardWidgetNumber2]">{{ percentWebsites }}%</div>
                                        </div>
                                        <div :style="[style.dashboardWidgetIcon, style.marginLeft1]">
                                            <div :style="[style.dashboardWidgetIconContainer, style.dashboardWidgetIconBg4]"><i class="fas fa-thumbs-up" style="opacity: 0.9"></i></div>
                                            <div :style="[style.dashboardWidgetTitle2]">&lt; 5 Reviews</div>
                                            <div :style="[style.dashboardWidgetNumber2]">{{ lowReviews }}%</div>
                                        </div>
                                        <div style="clear:both;"></div>
                                    </div>
                                        
                                    <!-- FILTERS -->
                                    <strong>Filters:</strong> 
                                    <div style="margin-bottom:16px;">
                                        <span :style="style.filter">
                                            <select v-model="filters.website" :style="[style.selectSmall]">
                                                <option value="All">Website</option>
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </span>
                                        
                                        <span :style="style.filter">
                                            <select v-model="filters.phone_type" :style="[style.selectSmall]">
                                                <option value="All">Phone Type</option>
                                                <option value="mobile">Mobile</option>
                                                <option value="landline">Landline</option>
                                            </select>
                                        </span>
                                        
                                        <span :style="style.filter">
                                            <select v-model="filters.reviews" :style="[style.selectSmall]">
                                                <option value="5">Reviews</option>
                                                <option value="4">4 or less</option>
                                                <option value="3">3 or less</option>
                                                <option value="2">2 or less</option>
                                                <option value="1">1 or less</option>
                                                <option value="0">0</option>
                                            </select>
                                        </span>

                                        <span :style="style.filter">
                                            <select v-model="filters.rating" :style="[style.selectSmall]">
                                                <option value="5">Rating</option>
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

                                        <!-- VOICEMAIL BROADCAST BUTTON -->
                                        <a v-if="finder.voicemail != undefined && finder.voicemail.active" title="Voicemail Blast" :style="[style.voicemailLink, style.floatRight, style.navpill, style.navpillActive, style.btnSuccess]" v-on:click="showVoicemailBlastModal()">
                                                <i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i> 
                                                Broadcasting...
                                        </a>
                                        <a v-else title="Voicemail Blast" :style="[style.voicemailLink, style.floatRight, style.navpill, style.navpillActive]" v-on:click="showVoicemailBlastModal()">
                                                <i class="fas fa-voicemail" style="margin-right:5px;"></i> 
                                                Voicemail
                                        </a>

                                        <a title="Download Data" style="margin-right:10px;cursor:pointer;float:right;" v-on:click="download()">
                                            <i class="fas fa-download"></i>
                                        </a>
                                        <a title="Copy Data" :style="[style.copyDataLink, style.floatRight]" v-on:click="exportWebsites">
                                            <i class="fas fa-copy"></i>
                                        </a>
                                                                          
                                    </div>
                                    
                                    

                                    <h3 :style="[style.heading, style.headingRecords]">
                                        Records 
                                        <span style="font-size:.5em;">({{businesses.length}} of {{original_businesses.length}})</span>
                                    </h3>
                                    
                                    <!-- SCANNER RECORDS -->
                                    <div class="lf-records">
                                        <div v-if="loadingRecords">Loading...</div>
                                        <div v-for="business in businesses" v-bind:style="[style.record, style.shadow]">
                                            <div style="float:right;display:inline-block;text-align:right;">
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
                                                <div><a v-on:click="showDetails(business)" :style="[style.detailsLink]">Details</a></div>
                                            </div>
                                            <div :style="[style.recordTitle]">{{business.post_title}}</div>
                                            <div :style="[style.recordText]">
                                                <span v-html="business.business_data.adr_address"></span><br />
                                                {{business.business_data.formatted_phone_number}}
                                                <span v-if="business.business_data.phone_type !== undefined">
                                                    <span v-if="business.business_data.phone_type == 'mobile'" :title="business.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-mobile-alt"></i></span>
                                                    <span v-if="business.business_data.phone_type != 'mobile'" :title="business.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-phone"></i></span>
                                                </span>
                                            </div>
                                            <div v-for="voicemail in business.voicemail_history" :style="[style.recordText]">
                                                <i class="fas fa-voicemail"></i> 
                                                <a :href="voicemail.audio_file_url" target="_blank">
                                                    {{ voicemail.filename.replace(/^[0-9]+-/, "") }}
                                                </a>
                                                <span v-if="voicemail.RecordingUrl">
                                                    <a :href="voicemail.RecordingUrl" target="_blank" title="Recording">
                                                        <i class="fas fa-dot-circle"></i> 
                                                    </a>
                                                </span>
                                                {{ moment.utc(voicemail.datetime, "YYYY-MM-DD hh:mm:ss").fromNow() }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- SETTINGS -->
                                <div v-if="view === 'settings'">
                                    <h2 v-bind:style="[style.heading]">Settings</h2>

                                    <!-- SETTINGS MENU -->
                                    <div>
                                        <!-- LOCATIONS -->
                                        <a v-if="settings_view == 'locations'" v-on:click="settings_view = 'locations'" v-bind:style="[style.navpill, style.navpillActive]">
                                            <i class="fas fa-map-marked-alt" style="margin-right:3px;"></i>
                                            Locations
                                        </a>
                                        <a v-else v-on:click="settings_view = 'locations'" v-bind:style="[style.navpill]">
                                            <i class="fas fa-map-marked-alt" style="margin-right:3px;"></i>
                                            Locations
                                        </a>

                                        <!-- PHONE LOOKUP -->
                                        <a v-if="settings_view == 'phone_lookup'" v-on:click="settings_view = 'phone_lookup'" v-bind:style="[style.navpill, style.navpillActive]">
                                            <i class="fas fa-mobile-alt" style="margin-right:3px;"></i>
                                            Phone Type Lookup
                                        </a>
                                        <a v-if="settings_view == 'phone_lookup'" v-on:click="settings_view = 'phone_lookup'" v-bind:style="[style.navpill]">
                                            <i class="fas fa-mobile-alt" style="margin-right:3px;"></i>
                                            Phone Type Lookup
                                        </a>

                                        <!-- TWILIO -->
                                        <a v-if="settings_view == 'twilio'" v-on:click="settings_view = 'twilio'" v-bind:style="[style.navpill, style.navpillActive]">
                                            <i class="fas fa-mobile-alt" style="margin-right:3px;"></i>
                                            Twilio
                                        </a>
                                        <a v-else v-on:click="settings_view = 'twilio'" v-bind:style="[style.navpill]">
                                            <i class="fas fa-mobile-alt" style="margin-right:3px;"></i>
                                            Twilio
                                        </a>

                                        <!-- GOOGLE API KEY -->
                                        <a v-if="settings_view == 'google_api_key'" v-on:click="settings_view = 'google_api_key'" v-bind:style="[style.navpill, style.navpillActive]">
                                            <i class="fas fa-key" style="margin-right:3px;"></i>
                                            Google API Key
                                        </a>
                                        <a v-else v-on:click="settings_view = 'google_api_key'" v-bind:style="[style.navpill]">
                                            <i class="fas fa-key" style="margin-right:3px;"></i>
                                            Google API Key
                                        </a>

                                        <!-- DEACTIVATE -->
                                        <a v-if="isAdministrator" style="float:right;cursor:pointer;margin-left:15px;margin-right:10px;color:red;" v-on:click="confirmDeactivate">Deactivate</a>
                                        
                                    </div>
                                    <div v-if="view === 'settings'" v-bind:style="[style.record, style.shadow]">
                                        
                                        <!-- GOOGLE API KEY SETTINGS -->
                                        <div v-if="settings_view === 'google_api_key'" style="margin-bottom:50px;padding:20px 30px;">
                                            <h4 :style="[style.heading]">API Key</h4>
                                            <label>Google Places API Key</label>
                                            <input type="password" v-model="update_google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                                            <button v-bind:style="[style.btn, style.btnPrimary, style.btnLarge, style.floatRight, style.marginTop10]" v-on:click="saveApiKey">Save API Key</button>
                                        </div>

                                        <!-- LOCATIONS SETTINGS -->
                                        <div v-if="settings_view === 'locations'" style="margin-bottom:30px;padding:10px 25px 10px 0px;">
                                            
                                            <!-- LOCATIONS LEFT NAV -->
                                            <div style="width:30%;float:left; padding: 6px 0px;">
                                                <h4 :style="[style.heading]">
                                                    Locations
                                                    <a :style="[style.newLocationLink]" v-on:click="locations_view = 'new'">New <i class="fas fa-plus-circle"></i></a>
                                                </h4>
                                                <div :style="[style.locationsNav]">
                                                    <div v-for="item in locations">
                                                        <a v-on:click="editLocation(item)" :style="[style.locationNavLink]">
                                                            <i class="fas fa-map-marked-alt" style="margin-right:3px;"></i> 
                                                            {{item.title}}
                                                        </a>
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

                                                            <strong>Locations</strong>
                                                            <textarea v-model="location.locations" v-bind:style="[style.input, style.inputLarge, style.textarea, style.textareaWithHelp]"></textarea>
                                                            <div :style="[style.textareaHelp]">Localities, one per line. i.e "80920", "Dallas, TX", etc.</div>
                                                            
                                                            <div style="text-align:right;margin-top:10px;">
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
                                                <div v-if="locations_view == 'new'">
                                                    <label>New Location Title</label>
                                                    <input v-model="new_location.title" v-bind:style="[style.input, style.inputLarge]" />

                                                    <label>Locations</label>
                                                    <textarea v-model="new_location.locations"  v-bind:style="[style.input, style.inputLarge, style.textarea, style.textareaWithHelp]"></textarea>
                                                    <div :style="[style.textareaHelp]">Localities, one per line. i.e "80920", "Dallas, TX", etc.</div>
                                                    <div style="text-align:right;margin-top:10px;">
                                                        <button v-on:click="saveLocations" v-bind:style="[style.btn, style.btnPrimary, style.btnLarge]">Save Location</button>
                                                    </div>
                                                </div>

                                            </div>
                                            <div style="clear:both;"></div>
                                        </div>

                                        <!-- SIGNAL WIRE SETTINGS -->
                                        <div v-if="settings_view === 'phone_lookup'" style="margin-bottom:50px;padding:20px 30px;">
                                            <h3 :style="[style.heading]">SignalWire Phone Type Lookup</h3>
                                            <p>You can optionally enable an API to tell you if a phone number is a mobile, voip, or landline. You will need the following information from your <a href="https://signalwire.com" target="_blank">signalwire.com</a> account.</p>

                                            <div style="margin:20px 0px">
                                                <h5 :style="[style.heading]">Phone Type Lookup Active</h5>
                                                <label><input type="checkbox" v-model="signalwire.active" /> Active</label>
                                            </div>

                                            <label>Namespace</label>
                                            <input v-model="signalwire.namespace" v-bind:style="[style.input, style.inputLarge]" />
                                            
                                            <label>Project ID</label>
                                            <input v-model="signalwire.project_id" v-bind:style="[style.input, style.inputLarge]" />
                                            
                                            <label>API Token</label>
                                            <input v-model="signalwire.api_token" v-bind:style="[style.input, style.inputLarge]" />

                                            <button v-on:click="saveSignalWireSettings" v-bind:style="[style.btn, style.btnPrimary, style.btnLarge, style.floatRight, style.marginTop20]">Save Settings</button>
                                        </div>

                                        <!-- TWILIO SETTINGS www.twilio.com/referral/kvWmLr -->
                                        <div v-if="settings_view === 'twilio'" style="margin-bottom:50px;padding:20px 30px;">
                                            <h3 :style="[style.heading]">Twilio</h3>
                                            <p>You can optionally enable an twilio for voicemail broadcasts and phone type (mobile, voip, or landline) lookups. You will need the following information from your <a href="https://www.twilio.com/referral/kvWmLr" target="_blank">twilio.com</a> account.</p>

                                            <div style="margin:20px 0px">
                                                <h5 :style="[style.heading]">Phone Type Lookup Active</h5>
                                                <label><input type="checkbox" v-model="twilio.active" /> Active</label>
                                            </div>

                                            <label>Account SID</label>
                                            <input v-model="twilio.account_sid" v-bind:style="[style.input, style.inputLarge]" />
                                            
                                            <label>Auth oken</label>
                                            <input v-model="twilio.auth_token" v-bind:style="[style.input, style.inputLarge]" />

                                            <button v-on:click="saveTwilioSettings" v-bind:style="[style.btn, style.btnPrimary, style.btnLarge, style.floatRight, style.marginTop20]">Save Settings</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <!-- COPY DATA MODAL -->
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
                                    <textarea id="lf_website_urls" :style="[style.input, style.inputLarge, style.textarea, style.textAreaCopy]">{{websiteUrls}}</textarea>
                                </div>
                                <div style="width:48%;float:right;">
                                    <label style="display:block;margin-top:20px"><strong>Phone Numbers:</strong>
                                        <a v-on:click="copyText('lf_phone_numbers')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                        <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download(phoneNumbers, finder.post_title+'-phone-numbers')" title="Download"><i class="fas fa-download"></i></a>
                                    </label>
                                    <textarea id="lf_phone_numbers" :style="[style.input, style.inputLarge, style.textarea, style.textAreaCopy]">{{phoneNumbers}}</textarea>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div>
                                <label style="display:block;margin-top:20px"><strong>All Records (filtered):</strong>
                                    <a v-on:click="copyText('lf_all_data')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                    <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download()" title="Download"><i class="fas fa-download"></i></a>
                                </label>
                                <textarea id="lf_all_data" :style="[style.input, style.inputLarge, style.textarea, style.textAreaCopy]">{{csvData()}}</textarea>
                            </div>
                        </div>
                    </div>


                    <!-- VOICEMAIL BLAST -->
                    <div v-if="finder.voicemail != undefined" id="voicemailBlastmodal" v-bind:style="style.modalVoicemailBlast">
                        <div v-bind:style="style.modalContent">
                            <span v-bind:style="style.modalClose" v-on:click="closeVoicemailBlastModal()">&times;</span>
                            <div style="clear:both;"></div>

                            <h2 v-bind:style="style.heading">Voicemail Broadcast</h2>
                            
                            <label>From Twilio Phone Number:</label>
                            <select label="Locations" v-model="finder.voicemail.from_phone_number" :items="twilio.phone_numbers" v-bind:style="[style.input, style.inputLarge]">
                                <option v-for="from_number in twilio.phone_numbers" v-bind:value="from_number.phoneNumber">
                                    {{ from_number.friendlyName }}
                                </option>
                            </select>
                            

                            
                            <div style="margin-bottom:10px;">
                                <label>Audio: 
                                    <span style="font-size:0.8em;">
                                        <a v-on:click="toggleAudioFile('upload')" v-bind:style="audioFileStyle('upload')">Upload</a> | 
                                        <a v-on:click="toggleAudioFile('url')" v-bind:style="audioFileStyle('url')">URL</a>
                                        <span v-if="audio_files.length > 0">
                                            | 
                                            <a v-on:click="toggleAudioFile('select')" v-bind:style="audioFileStyle('select')">Select</a>
                                        </span>
                                    </span>
                                </label>
                                <div v-if="show.audio_file_url === 'url'">
                                    <input v-model="finder.voicemail.audio_file_url" v-bind:style="[style.input, style.inputLarge]" placeholder="Enter url 'https://'" />
                                </div>
                                <div v-if="show.audio_file_url === 'upload'" id="uploadAudioContainer">
                                    <input type="file" class="audiofile" name="audiofile" accept="audio/*" />
                                </div>
                                <div v-if="show.audio_file_url === 'select'">
                                    <select label="Audio" v-model="finder.voicemail.audio_file_url" :items="audio_files" v-bind:style="[style.input, style.inputLarge]">
                                        <option v-for="audio_file in audio_files" v-bind:value="audio_file.url">
                                            {{ audio_file.filename }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label>Recipients <span style="font-size:0.8em;">(mobile only)</span></label>
                                <select v-bind:style="[style.input, style.inputLarge]" v-model="finder.voicemail.send_to">
                                    <option value="1">Send to all who haven't received THIS audio</option>
                                    <option value="3">Send to all who haven't received ANY audio on THIS list</option>
                                    <option va  lue="4">Send to all who haven't received ANY audio on ANY list</option>
                                    <option value="5">Send to all on this list</option>
                                </select>
                            </div>

                            <div>
                                <label>
                                    <input type="checkbox" v-model="finder.voicemail.record" />
                                    Record calls for review
                                </label>
                            </div>
                                    
                            <div style="text-align:center;margin-top:20px;">
                                <button v-bind:style="[style.btn, style.btnLarge]" v-on:click="closeVoicemailBlastModal()">Close</button>
                                <button v-if="finder.voicemail != undefined && finder.voicemail.active" v-bind:style="[style.btn, style.btnLarge, style.btnDanger]" v-on:click="stopVoicemailBlast()">
                                    <i class="fas fa-spinner fa-spin"></i> 
                                    Stop Broadcast
                                </button>
                                <button v-else v-bind:style="[style.btn, style.btnLarge, style.btnSuccess]" v-on:click="sendVoicemailBlast()">Start Broadcast</button>
                            </div>
                            <div style="clear:both;"></div>
                        </div>
                    </div>
                    
                    
                    <!-- DELETE MODAL -->
                    <div id="deleteModal" v-bind:style="style.modalDelete">
                        <div v-bind:style="style.modalContent">
                            <span v-bind:style="style.modalClose" v-on:click="style.modalDelete.display = 'none'">&times;</span>
                            <table style="border:none;">
                                <tr>
                                    <td style="padding:0;"><i class="fas fa-exclamation-circle" style="margin-left:15px;font-size:4em;color:red;"></i></td>
                                    <td><p style="text-align:left;margin-top:40px;margin-bottom:30px;">Are you sure you want to delete this?</p></td>
                                </tr>
                            </table>
                            <div style="text-align:center;">
                                <button v-bind:style="[style.btn, style.btnLarge]" v-on:click="style.modalDelete.display = 'none'">Cancel</button>
                                <button v-bind:style="[style.btn, style.btnDanger, style.btnLarge]" v-on:click="deleteLeadFinder">Yes, Delete</button>
                            </div>
                            <div style="clear:both;"></div>
                        </div>
                    </div>


                    <!-- DEACTIVATE MODAL -->
                    <div id="deactivateModal" v-bind:style="style.deactivateModal">
                        <div v-bind:style="style.modalContent">
                            <span v-bind:style="style.modalClose" v-on:click="style.deactivateModal.display = 'none'">&times;</span>
                            <table style="border:none;">
                                <tr>
                                    <td style="padding:0;"><i class="fas fa-exclamation-circle" style="margin-left:15px;font-size:4em;color:red;"></i></td>
                                    <td><p style="text-align:left;margin-top:40px;margin-bottom:30px;">Are you sure you want to deactivate this plugin and license? You can reactivate it as long has you have a license key.</p></td>
                                </tr>
                            </table>
                            <div style="text-align:center;">
                                <button v-bind:style="[style.btn, style.btnLarge, style.btnDanger]" v-on:click="deactivateLicense">Yes, Deactivate</button>
                                <button v-bind:style="[style.btn, style.btnLarge]" v-on:click="style.deactivateModal.display = 'none'">Cancel</button>
                            </div>
                            <div style="clear:both;"></div>
                        </div>
                    </div>

                    <!-- RUN SCANNER MODAL -->
                    <div id="runScraperModal" v-bind:style="style.runScraperModal">
                        <div v-bind:style="style.modalContent">
                            <div style="text-align:center;margin-bottom:20px;">
                                <i class="fas fa-cog fa-spin" style="font-size:4em;margin-top:30px;"></i>
                                <p v-if="!cancelQueries" style="margin-top: 15px;font-weight: bold;font-size: 1.5em;">"{{currentQuery}}"</p>
                                <div v-if="signalwire.active || twilio.active">Phone type lookup is active.</div>
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
                            <button v-bind:style="[style.btn, style.btnDanger]" v-on:click="cancelLeadFinder()">
                            <i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i> 
                                Stop
                            </button>
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
                                            <span v-if="currentBusiness.business_data.phone_type == 'mobile'" :title="currentBusiness.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-mobile-alt"></i></span>
                                            <span v-if="currentBusiness.business_data.phone_type != 'mobile'" :title="currentBusiness.business_data.phone_type" style="margin-left:5px;"><i class="fas fa-phone"></i></span>
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


                    <!-- ALERT MODAL -->
                    <div id="myModal" v-bind:style="[style.modal]" v-on:click="style.modal.display = 'none'">
                        <div v-bind:style="[style.modalContent, style.shadow]">
                            <span v-bind:style="style.modalClose" v-on:click="style.modal.display = 'none'">&times;</span>
                            <p v-html="modal_message"></p>
                        </div>
                    </div>


                    <div style="clear:both;"></div>
                </div>
            </div>
        `,
        data: {
            // scannerRunning: false,
            interval: null,
            show: {
                audio_file_url: 'upload'
            },
            voicemail: {
                record: false,
                send_to: 1
            },
            voicemail_running: true,
            audio_files: [],
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
                locations_id: 0,
                voicemail: {
                    from_phone_number: ''
                } 
            },
            signalwire: {
                active: '',
                namespace: '',
                project_id: '',
                api_token: ''
            },
            twilio: {
                active: '',
                account_sid: '',
                auth_token: '',
                phone_numbers: [
                    { SID: "123", phone_number: "(727) 305-0899" }
                ]
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
                    fontFamily: "'Poppins', sans-serif",
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
                        background: '#999'
                    },
                    navpillActive: {
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
                    background1: 'rgb(234 232 232)',
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

                    navItem: {
                        color: '#fff',
                    },
                    navItemActive: {
                        color: '#fff'
                    },
                    navItemIconActive: {
                        color: 'red'
                    },
                    recordTitle: {
                        color: 'rgb(95 95 95)'
                    },
                    recordText: {
                        color: 'rgb(95 95 95)'
                    },
                    dashboardWidget: {
                        color: '#fff',
                        bgImage1: 'linear-gradient(60deg,rgb(255 97 97),#fb8c00)',
                        bgImage2: 'linear-gradient(60deg,rgb(79 181 37),rgb(62 189 101))',
                        bgImage3: 'linear-gradient(60deg,rgb(212 107 255),#e53935)',
                        bgImage4: 'linear-gradient(60deg,rgb(28 15 228),#2ea3f2)',
                    }
                }
            },
            style: {}
        },
        mounted: function(){
            this.setStyles()
            this.getSettings()
            this.createInterval()
        },
        computed: {
            percentMobile: function() {
                let mobile = this.original_businesses.filter(business => {
                    return business.business_data.phone_type == 'mobile'
                })
                if(mobile.length > 0)
                    return (mobile.length/this.original_businesses.length*100).toFixed(0)
                return 0
            },
            percentWebsites: function() {
                let websites = this.original_businesses.filter(business => {
                    return business.business_data.website && business.business_data.website.length
                })
                if(websites.length > 0)
                    return (websites.length/this.original_businesses.length*100).toFixed(0)
                return 0
            },
            lowReviews: function() {
                let low_reviews = this.original_businesses.filter(business => {
                    return business.business_data.reviews === undefined || business.business_data.reviews.length < 5
                })
                if(low_reviews.length > 0)
                    return (low_reviews.length/this.original_businesses.length*100).toFixed(0)
                return 0
            },
            finderTitle: function() {
                return this.finder.post_title !== '' ? this.finder.post_title : 'New Lead Scanner'
            },
            websiteUrls: function() {
                if(this.businesses == undefined)
                    return ''
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
                if(this.businesses == undefined)
                    return ''
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
            },
        },
        methods: {
            createInterval: function() {
                if(this.interval === null) {
                    let g = this
                    this.interval = setInterval(function() {
                        g.runInterval()
                    }, 60000)
                }
            },
            runInterval: function() {
                console.log("do interval stuff")
                this.loadFinders(false)
                this.runBroadcasts()
            },
            runBroadcasts: function() {
                var url = ajaxurl+'?action=lead_finder_run_broadcasts';
                let g = this
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{})
            },
            audioFileStyle: function(view) {
                if(this.show.audio_file_url != view)
                    return {}
                    
                return {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    color: this.colors[this.theme].primary
                }
            },
            setStyles: function() {
                // this.theme = 'dark'
                this.style = {
                    fontWeight: 'bold',
                    fontSize: '24px',
                    wrapper: {
                        backgroundColor: this.colors[this.theme].background1,
                        borderRadius: '25px'
                    },
                    brandTitle: {
                        fontFamily: this.colors[this.theme].fontFamily,
                        fontWeight: '700',
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
                        color: this.colors[this.theme].leftColumn.link.color,
                        textDecoration: 'none'
                    },
                    rightColumn: {
                        width: '74%',
                        float: 'right'
                    },
                    rightColumnContent: {
                        padding: '20px'
                    },
                    link: {
                        fontWeight: 'normal',
                        textDecoration: 'none'
                    },
                    detailsLink: {
                        textDecoration: 'none',

                    },
                    copyDataLink: {
                        cursor: 'pointer',
                        paddingRight: '7px',
                        textDecoration: 'none'
                    },
                    voicemailLink: {
                        cursor: 'pointer',
                        paddingRight: '7px',
                        textDecoration: 'none',
                        marginTop: '-3px'
                    },

                    navItem: {
                        cursor: 'pointer',
                        width: '86%',
                        margin: '1px auto',
                        display: 'block',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        color: this.colors[this.theme].navItem.color,
                        fontFamily: this.colors[this.theme].fontFamily,
                        fontWeight: '700',
                        
                        '--nav-color': this.colors[this.theme].navColor,
                        '--nav-background-color': this.colors[this.theme].navBackground,
                        
                        '--nav-color-hover': this.colors[this.theme].navColorHover,
                        '--nav-background-color-hover': this.colors[this.theme].navBackgroundHover
                    },
                    navItemActive: {
                        fontWeight: 'bold',
                        color: this.colors[this.theme].navItemActive.color,
                        backgroundColor: this.colors[this.theme].navBackgroundHover
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
                        fontFamily: this.colors[this.theme].fontFamily,
                    },
                    heading: {
                        fontFamily: this.colors[this.theme].fontFamily,
                        fontWeight: '700'
                    },
                    navSubHeading: {
                        paddingLeft: '20px',
                        textTransform: 'uppercase',
                        fontSize: '16px',
                        margin: '5px 0px',
                        color: this.colors[this.theme].navSubHeading.color
                    },
                    headingRecords: {
                        marginTop: "25px",
                        marginBottom: "-20px"
                    },
                    mainTitle: {
                        fontFamily: this.colors[this.theme].fontFamily,
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
                        // fontSize: '1.5em',
                        padding: '10px 15px',
                        lineHeight: 'unset'
                    },
                    inputSmall: {
                        width: 'auto',
                        padding: '2px 2px'
                    },
                    selectSmall: {
                        width: 'auto',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        marginBottom: '10px',
                        backgroundColor: this.colors[this.theme].input.background
                    },
                    textarea: {
                        height: '100px',
                        width: '100%'
                    },
                    textAreaCopy: {
                        whiteSpace: 'nowrap',
                        overflow: 'auto'
                    },
                    textareaWithHelp: {
                        marginBottom: '0px'
                    },
                    textareaHelp: {
                        fontSize: '0.9em'
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
                        borderRadius: '4px',
                        lineHeight: 'unset'
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
                    btnNoMargin: {
                        marginLeft: '0px',
                        marginRight: '0px'
                    },
                    navpill: {
                        color: this.colors[this.theme].navpill.text,
                        backgroundColor: this.colors[this.theme].navpill.background,
                        borderRadius: '15px',
                        fontSize: '12px',
                        padding: '4px 15px',
                        marginRight: '5px',
                        textDecoration: 'none'
                    },
                    navpillActive: {
                        color: this.colors[this.theme].navpillActive.text,
                        backgroundColor: this.colors[this.theme].navpillActive.background,
                    },
                    record: {
                        padding: '20px 25px',
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
                    modalVoicemailBlast: {
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
                        marginTop: '4px',
                        color: this.colors[this.theme].recordText.color
                    },
                    marginTop10: {
                        marginTop: '10px'
                    },
                    marginTop20: {
                        marginTop: '20px'
                    },
                    marginLeft1: {
                        marginLeft: '1%'
                    },
                    dashboardWidget: {
                        color: this.colors[this.theme].dashboardWidget.color,
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage1,
                        borderRadius: '15px',
                        textAlign: 'center',
                        padding: '20px',
                        width: '24%',
                        float: 'left'
                    },
                    dashboardWidget2: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage2
                    },
                    dashboardWidget3: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage3
                    },
                    dashboardWidget4: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage4
                    },
                    dashboardWidgetNumber: {
                        fontSize: '58px',
                        fontWeight: 'bold',
                        fontFamily: this.colors[this.theme].fontFamily,
                        lineHeight: '1em',
                        letterSpacing: '-3px'
                    },
                    dashboardWidgetTitle: {
                        fontWeight: 'bold'
                    },
                    dashboardWidgetIcon: {
                        width: '24%',
                        float: 'left'
                    },
                    dashboardWidgetIconContainer: {
                        color: '#fff',
                        width: '75px',
                        height: '75px',
                        lineHeight: '75px',
                        borderRadius: '10px',
                        fontSize: '36px',
                        textAlign: 'center',
                        float: 'left'
                    },
                    dashboardWidgetIconBg1: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage1,
                    },
                    dashboardWidgetIconBg2: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage2,
                    },
                    dashboardWidgetIconBg3: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage3,
                    },
                    dashboardWidgetIconBg4: {
                        backgroundImage: this.colors[this.theme].dashboardWidget.bgImage4,
                    },
                    dashboardWidgetNumber2: {
                        marginLeft: '85px',
                        fontWeight: 'bold',
                        fontSize: '24px',
                        fontFamily: this.colors[this.theme].fontFamily,
                    },
                    dashboardWidgetTitle2: {
                        marginLeft: '85px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginTop: '11px',
                        fontFamily: this.colors[this.theme].fontFamily,
                    },
                }
            },
            navpillActive: function(view){
                return this.settings_view == view ? 'navpillActive' : 'active'
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
            saveTwilioSettings: function() {
                var url = ajaxurl+'?action=lead_finder_twilio_update';
                this.alert({message:'SAVING...'})
                let g = this
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        twilio: this.twilio
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
                var g = this
                this.cancelQueries = true
                this.queries = []

                var url = ajaxurl+'?action=lead_finder_cancel&ID='+this.finder.ID
                fetch(url).then((response)=>{
                    return response
                }).then((data)=>{
                    g.cancelQueries = false
                    g.loadFinder(this.finder)            
                })
            },
            loadFinders: function(showLoading = true) {
                this.loadingFinders = showLoading
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
                    if(data.error){
                        console.error(data.error)
                        this.alert({ type: "error", message: data.error })
                        return
                    }
                    g.google_places_api_key = data.google_places_api_key
                    g.license_status = data.license_status
                    g.roles = data.roles
                    g.signalwire = data.signalwire
                    g.twilio = data.twilio
                    g.audio_files = data.audio_files
                    if(this.license_status == 'active'){
                        g.google_places_api_key = data.google_places_api_key
                        if(data.google_places_api_key != true){
                            g.view = 'google_places_api_key'
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
                if(this.queries.length > 0 && item.ID !== this.finder.ID){
                    this.alert({message:"Scanner is Running", text:"Unable to load another scanner while one is running", type:"error", time:5})
                    return
                }

                if(item.ID !== this.finder.ID)
                    this.loadingRecords = true
    
                this.view = 'finder'
                this.finder = item
                // this.businesses = []
                // var url = '/wp-json/lead_finder/records/'+item.ID;
                var url = ajaxurl+'?action=lead_finder_records&ID='+item.ID
                var g = this
                fetch(url)
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        // g.alert({message:"test"})
                        g.businesses = data
                        g.original_businesses = data
                        g.loadingRecords = false
                        g.view = 'finder'
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
                this.finder = { post_title: '', voicemail: { from_phone_number: '' } }
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
                        this.alert({message:'SAVED', type: 'success', time:1})
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
                        console.log("new lead finder", data)
                        // this.flashModal('Saved!')
                        this.alert({message:'SAVED', type: 'success', time:1})
                        // this.alert({type:'success', message:'SAVED', time:3})
                        this.finder = data
                        this.loadFinders(false)
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
                // this.scannerRunning = true

                //set up the queries
                let locations = this.location.split("\n")
                this.queries = locations.map(location => {
                    if(location.length > 0)
                        return `${this.query} near ${location}`
                    else
                        return this.query
                })
                // this.style.runScraperModal.display = 'block'
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
                if(this.businesses == undefined)
                    return ''
                // var url = ajaxurl+'?action=lead_finder_download&lead_finder_ID='+this.finder.ID
                // jQuery('<form action="'+ url +'" method="post"></form>')
		        //     .appendTo('body').submit().remove();

                const lines = []

                //array of data table fields for csv header row
                const fields = ["Name", "Phone", "Phone Type", "Full Address", "Street", "City", "State", "Country", "Postal Code", "Website", "Google Places URL", "Photos", "Reviews", "Rating", "Latitude", "Longitude", "Business Types", "Status", "Google ID"]
                
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
                    values.push(b.types.join(", "))
                    values.push(b.business_status)
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
                    if(this.filters.phone_type === 'mobile')
                        return business.business_data.phone_type == 'mobile'
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
                this.businesses = []

                this.alert({message: "Deleting..."})
                var url = ajaxurl+'?action=lead_finder_delete';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        ID: this.finder.ID
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data) => {
                    this.alert({ message: "Done!", type:"success", time:1 })
                    this.finders = data
                    this.finder = {
                        post_title: '',
                        locations_id: 0 
                    }
                })
                return
            },
            showVoicemailBlastModal: function() {
                this.style.modalVoicemailBlast.display = 'block'
                if(this.finder.voicemail == undefined)
                    this.finder.voicemail = {}
                    
                if(this.show.audio_file_url === 'upload'){
                    var g = this
                    Vue.nextTick(function(){
                        g.createFileUploadBox()
                    })
                }
            },
            createFileUploadBox: function() {
                FilePond.registerPlugin(FilePondPluginFileValidateType);

                var uploadUrl = ajaxurl+'?action=lead_finder_upload_audio_file';
                
                FilePond.create(document.querySelector('.audiofile'), {
                    instantUpload: true,
                    acceptedFileTypes: ['audio/*'],
                    labelIdle: 'Drag & Drop your audio file or <span class="filepond--label-action"> Browse </span>',
                    credits: { label: '', url: '' },
                    server: {
                        // url: uploadUrl,
                        process: uploadUrl,
                        // revert: '/revert.php',
                        // restore: '/restore.php?id=',
                        // fetch: '/fetch.php?data='
                    }
                })

                const pond = document.querySelector('.audiofile');
                if(pond != undefined) {
                    pond.addEventListener('FilePond:processfile', e => {
                        let file = JSON.parse(e.detail.file.serverId)
                        console.log("metadata", JSON.parse(e.detail.file.serverId))
                        this.finder.voicemail.audio_file_url = file.url
                    })
                }
                
            },
            closeVoicemailBlastModal: function() {
                FilePond.destroy(document.querySelector('.audiofile'))
                this.style.modalVoicemailBlast.display = 'none'
            },
            sendVoicemailBlast: function() {
                var url = ajaxurl+'?action=lead_finder_update_vm_broadcast';
                let g = this
                this.finder.voicemail.active = true
                this.finder.voicemail.list_id = this.finder.ID
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({ ...this.finder })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    if(data.active == 0) {
                        if(data.count == 0) {
                            g.alert({ message:'Broadcast Complete', text: 'No matching records found.' })
                        } else {
                            g.alert({ message:'Broadcast Complete', text: 'Matching Records: '+data.count, type: 'success' })
                        }
                    }
                })
            },
            stopVoicemailBlast: function() {
                var url = ajaxurl+'?action=lead_finder_update_vm_broadcast';
                let g = this
                this.finder.voicemail.active = false
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({ ...this.finder })
                }).then((response)=>{
                    return response
                }).then((data)=>{
                    // g.alert({message:'SAVED', type: 'success', time:2, delay:1})
                })
            },
            toggleAudioFile: function(view) {
                this.show.audio_file_url = view
                if(view === 'upload'){
                    var g = this
                    Vue.nextTick(function(){
                        g.createFileUploadBox()
                    })
                }
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
            },
        }
    });
})();