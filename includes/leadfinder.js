( function() {
    var vm = new Vue({
        el: document.querySelector('#mount'),
        template: `
        <div class="lead-finder-wrapper">
            <h1 v-bind:style="style.h1">
                Local Lead Scanner
            </h1>

            <div v-if="view == 'activate'" style="max-width:700px;margin:50px auto;">
                <h2>Activate</h2>
                <p>Please enter your license key to register this installation.</p>
                <input v-model="license_key" v-bind:style="[style.input, style.inputLarge]" />
                <button v-bind:style="[style.button, style.buttonFullWidth]" v-on:click="activatePlugin">Activate</button>
            </div>

            <div v-if="view == 'google_places_api_key'" style="max-width:700px;margin:50px auto;">
                <h3>API Key</h3>
                <label>Google Places API Key</label>
                <input type="password" v-model="update_google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                <button v-bind:style="style.button" v-on:click="saveApiKey">Save API Key</button>
            </div>

            <div v-if="view != '' && view != 'activate' && view != 'google_places_api_key'">
                <div v-bind:style="style.leftColumn">
                    <a v-on:click="showNewFinderForm" style="font-weight:bold;cursor:pointer;">New +</a>
                    <a v-on:click="showSettings" style="float:right;cursor:pointer;font-weight:bold;">Settings</a>
                    <input v-model="search" v-bind:style="style.input" placeholder="Search" autocomplete="off" />
                
                    <div v-if="loadingFinders">Loading...</div>
                    <div v-on:click="loadFinder(finder)" class="leadfinder-record" v-for="finder in finders" v-if="showFinderInList(finder.post_title)">
                        <a>{{decodeHTML(finder.post_title)}}</a>
                    </div>
                </div>

                <div v-bind:style="style.rightColumn">
                    <div v-if="view !== 'settings'" style="background-color:#fff;padding:15px;border: 1px solid #ccc;">
                        <a v-if="finder.ID > 0 && view !== 'settings'" v-on:click="confirmDelete" style="float:right;cursor:pointer;color:red;margin-right:15px;">Delete</a>
                        <h2>{{decodeHTML(finderTitle)}}</h2>
                        <div>
                            <label>Title</label>
                            <div>
                                <div style="width:80%;float:left;">
                                    <input v-model="finder.post_title" v-bind:style="[style.input, style.inputLarge]" />
                                </div>
                                <div style="width:18%;float:right;">
                                    <button v-bind:style="[style.button, style.buttonFullWidth]" v-on:click="saveLeadFinder">Save Title</button>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                        </div>
                        <div v-if="finder.ID > 0">
                            <div style="width:39%;float:left;margin-right:2%">
                                <label>Query</label>
                                <input v-model="query" v-bind:style="[style.input, style.inputLarge]" />
                            </div>
                            <div style="width:39%; float:left;margin-right:2%">
                                <label>Locations</label>
                                <select label="Locations" v-model="location" :items="finder.locations" v-bind:style="[style.input, style.inputLarge]">
                                    <option value="">Select location (optional)</option>
                                    <option v-for="location in locations" v-bind:value="location.locations">
                                        {{ location.title }}
                                    </option>
                                </select>
                            </div>
                            <div style="width:18%;float:right;">
                                <label>&nbsp;</label>
                                <button v-bind:style="[style.button, style.buttonFullWidth]" v-on:click="runLeadFinder">Run Scanner</button>
                            </div>
                            <div style="clear:both;"></div>
                        </div>
                        <div style="clear:both;"></div>
                    </div>


                    <div v-if="view === 'finder'" style="margin-top:30px;">
                        <h3>Records <span style="font-size:.5em;">({{businesses.length}} of {{original_businesses.length}})</span></h3>
                        
                        <div style="margin-bottom:16px;">
                            <strong>Filters:</strong> 
                            <span style="margin-right:5px">
                                Website
                                <select v-model="filters.website">
                                    <option>All</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                            </span>
                            
                            <span style="margin-right:5px">
                                Reviews 
                                <select v-model="filters.reviews">
                                    <option value="5">All</option>
                                    <option value="4">4 or less</option>
                                    <option value="3">3 or less</option>
                                    <option value="2">2 or less</option>
                                    <option value="1">1 or less</option>
                                    <option value="0">0</option>
                                </select>
                            </span>

                            <span style="margin-right:5px">
                                Rating 
                                <select v-model="filters.rating">
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
                            <a style="cursor:pointer;margin-right:5px;" v-on:click="exportWebsites">Copy Data</a>
                        </div>
                        <div class="lf-records">
                            <div v-if="loadingRecords">Loading...</div>
                            <div v-for="business in businesses" class="lf-record">
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
                                <div>
                                    <strong>{{business.post_title}}</strong>
                                
                                </div>
                                <div v-html="business.business_data.adr_address"></div>
                                <div>{{business.business_data.formatted_phone_number}}</div>
                            </div>
                        </div>
                    </div>

                    <div v-if="view === 'settings'" style="background-color:#fff;border:1px solid #ccc;padding:15px;">
                        <a v-if="isAdministrator" style="float:right;cursor:pointer;margin-left:15px;" v-on:click="confirmDeactivate">Deactivate</a>
                        <h2 style="border-bottom:1px solid #ccc;margin-bottom:10px;">Settings</h2>
                        <div style="margin-bottom:20px">
                            <a v-on:click="settings_view = 'locations'">Locations</a> | 
                            <a v-on:click="settings_view = 'phone_lookup'">Phone Type Lookup</a> | 
                            <a v-on:click="settings_view = 'google_api_key'">Google API Key</a>
                        </div>

                        <div v-if="settings_view === 'google_api_key'" style="margin-bottom:30px;">
                            <h3>API Key</h3>
                            <label>Google Places API Key</label>
                            <input type="password" v-model="update_google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                            <button v-bind:style="style.button" v-on:click="saveApiKey">Save API Key</button>
                        </div>

                        <div v-if="settings_view === 'locations'" style="margin-bottom:30px;">
                            
                            <div style="width:30%;float:left;">
                                <div>Locations</div>
                                <div style="background-color:white;border:1px solid #ccc;padding:12px;">
                                    <div style="font-weight:bold;margin-bottom:10px;"><a v-on:click="locations_view = 'new'">New Location +</a></div>
                                    <div v-for="location in locations">
                                        <a v-on:click="editLocation(location)">{{location.title}}</a>
                                    </div>
                                </div>
                            </div>

                            <div style="width:68%;float:right;">
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
                                                    Are you sure you want to delete this location? 
                                                    <a v-on:click="deleteLocation(location.index)" style="cursor:pointer;color:red;margin-left:10px;margin-right:10px;font-weight:bold;">Yes, Delete!</a>
                                                    <a v-on:click="confirm_delete_location = null" style="cursor:pointer;">Cancel</a>
                                                </span>
                                                <button v-on:click="saveLocations" v-bind:style="style.button">Save Location</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="locations_view == 'new'" style="margin-bottom:40px">
                                    <label>New Location Title</label>
                                    <input v-model="new_location.title" v-bind:style="[style.input, style.inputLarge]" />

                                    <label>Locations</label>
                                    <textarea v-model="new_location.locations" v-bind:style="[style.input, style.inputSmall, style.textarea]"></textarea>
                                    <button v-on:click="saveLocations" v-bind:style="style.button">Save Location</button>
                                </div>

                            </div>
                            <div style="clear:both;"></div>
                        </div>

                        <div v-if="settings_view === 'phone_lookup'" style="margin-bottom:30px;">
                            <h3>SignalWire Phone Type Lookup</h3>
                            <p>You can optionally enable an API to tell you if a phone number is a mobile, voip, or landline. You will need the following information from your <a href="https://signalwire.com" target="_blank">signalwire.com</a> account.</p>

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

            <div id="myModal" v-bind:style="style.modal" v-on:click="style.modal.display = 'none'">
                <div v-bind:style="style.modalContent">
                    <span v-bind:style="style.modalClose" v-on:click="style.modal.display = 'none'">&times;</span>
                    <p v-html="modal_message"></p>
                </div>
            </div>
            
            <div id="websitesModal" v-bind:style="style.websitesModal">
                <div v-bind:style="[style.modalContent, style.modalContentWide]">
                    <span v-bind:style="style.modalClose" v-on:click="style.websitesModal.display = 'none'">&times;</span>
                    <h3>Copy Field Data</h3>
                    <p>Website URLs and phone numbers are often used in various programs for marketing purposes. You can select and copy all of the values below.</p>
                    <div>
                        <div style="width:48%;float:left;">
                            <label style="display:block;margin-top:20px"><strong>Website URLs:</strong>
                                <a v-on:click="copyText('lf_website_urls')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download(websiteUrls, finder.post_title+'-websites')" title="Download"><i class="fas fa-download"></i></a>
                            </label>
                            <textarea id="lf_website_urls" style="width:100%;height:100px;white-space:nowrap;overflow:auto;">{{websiteUrls}}</textarea>
                        </div>
                        <div style="width:48%;float:right;">
                            <label style="display:block;margin-top:20px"><strong>Phone Numbers:</strong>
                                <a v-on:click="copyText('lf_phone_numbers')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                                <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download(phoneNumbers, finder.post_title+'-phone-numbers')" title="Download"><i class="fas fa-download"></i></a>
                            </label>
                            <textarea id="lf_phone_numbers" style="width:100%;height:100px;white-space:nowrap;overflow:auto;">{{phoneNumbers}}</textarea>
                        </div>
                        <div style="clear:both;"></div>
                    </div>
                    <div>
                        <label style="display:block;margin-top:20px"><strong>All Records (filtered):</strong>
                            <a v-on:click="copyText('lf_all_data')" style="float:right;cursor:pointer;" title="Copy"><i class="fas fa-copy"></i></a>
                            <a style="margin-left:10px;margin-right:10px;cursor:pointer;float:right;" v-on:click="download()" title="Download"><i class="fas fa-download"></i></a>
                        </label>
                        <textarea id="lf_all_data" style="width:100%;height:100px;white-space:nowrap;overflow:auto;">{{csvData()}}</textarea>
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
                    <p style="text-align:center;margin-top:40px;margin-bottom:30px;">Are you sure you want to deactivate this plugin and license? You can reactivate it as long has you have a license key.</p>
                    <button v-bind:style="[style.button, style.buttonDelete]" v-on:click="deactivateLicense">Yes, Deactivate</button>
                    <button v-bind:style="[style.button]" v-on:click="style.deactivateModal.display = 'none'">Cancel</button>
                    <div style="clear:both;"></div>
                </div>
            </div>

            <div id="runScraperModal" v-bind:style="style.runScraperModal">
                <div v-bind:style="style.modalContent">
                    <div style="text-align:center;margin-bottom:20px;">
                        <i class="fas fa-cog fa-spin" style="font-size:4em;margin-top:30px;"></i>
                        <p v-if="!cancelQueries" style="margin-top: 15px;margin-bottom: 15px;font-weight: bold;font-size: 1.5em;">"{{currentQuery}}"</p>
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

            <div id="details" v-bind:style="style.modalDetails" v-on:click="closeModalOutsideClick">
                <div v-bind:style="style.modalDetailsContent">
                    <span v-bind:style="style.modalClose" v-on:click="style.modalDetails.display = 'none'">&times;</span>
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
                            <td>{{currentBusiness.business_data.formatted_phone_number}}</td>
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
                            <td>Phone</td>
                            <td>{{currentBusiness.business_data.formatted_phone_number}}</td>
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
                post_title: '',
                locations_id: 0 
            },
            signalwire: {
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
            style: {
                leftColumn: {
                    width: '25%',
                    float: 'left',
                    marginRight: '1%',
                    border: '1px solid #ccc',
                    padding: '10px 15px'
                },
                rightColumn: {
                    width: '71%',
                    float: 'right'
                },
                h1: {
                    marginBottom: '30px',
                    borderBottom: '1px solid #ccc'
                },
                input: {
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                    width: '100%'
                },
                inputLarge: {
                    fontSize: '1.5em',
                    padding: '10px 15px'
                },
                inputLarge: {
                    padding: '10px 15px'
                },
                textarea: {
                    height: '100px'
                },
                button: {
                    padding: '5px 15px',
                    // borderRadius: 'px',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                    marginLeft: '10px',
                    backgroundColor: '#efefef',
                    float: 'right'
                },
                buttonFullWidth: {
                    width: '100%',
                    padding: '10px 15px'
                },
                buttonDelete: {
                    color: 'white',
                    backgroundColor: 'red',
                    fontWeight: 'bold',
                    border: '1px solid red',
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
                    backgroundColor: '#fefefe',
                    margin: 'auto',
                    padding: '20px',
                    border: '1px solid #888',
                    width: '80%',
                    maxWidth: '500px'
                },
                modalContentWide: {
                    maxWidth: '800px'
                },
                modalDetailsContent: {
                    backgroundColor: '#fefefe',
                    margin: 'auto',
                    padding: '20px',
                    border: '1px solid #888',
                    width: '80%',
                    maxWidth: '800px'
                },
                modalClose: {
                    color: '#aaaaaa',
                    float: 'right',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }
            }
        },
        mounted: function(){
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
                var url = ajaxurl+'?action=lead_finder_deactivate_license'
                fetch(url).then((response) => {
                    this.style.deactivateModal.display = 'none'
                    return response.json()
                }).then((data) => {
                    this.license_status = ''
                    this.view = 'activate'
                })
            },
            activatePlugin: function() {
                if(this.license_key.length == 0) {
                    // this.flashModal("Please enter a license key.", 3)
                    this.alert({message: "Please enter a license key.", type:"error", time: 3})
                    return
                }

                var url = ajaxurl+'?action=lead_finder_activate_license&license_key='+this.license_key
                fetch(url).then((response) => {
                    return response.json()
                }).then((data) => {
                    if(data.license_status == 'active'){
                        this.license_status = 'active'
                        // this.view = 'finders'
                        // this.loadFinders()
                        // g.loadLocations()
                        this.getSettings()
                        this.alert({message: "Plugin Activated", type:"success", time: 3})
                    } else {
                        // this.flashModal("Error: "+data.message)
                        this.alert({message: data.message, type: "error"})
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
                const fields = ["Name", "Phone", "Full Address", "Street", "City", "State", "Country", "Postal Code", "Website", "Google Places URL", "Photos", "Reviews", "Rating", "Latitude", "Longitude", "Google ID"]
                
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
                    return business.business_data.reviews === undefined || business.business_data.reviews.length <= this.filters.reviews
                })

                filtered_businesses = filtered_businesses.filter(business => {
                    return business.business_data.rating <= parseInt(this.filters.rating)
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
            }
        }
    });
})();