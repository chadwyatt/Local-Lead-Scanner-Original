( function() {
    var vm = new Vue({
        el: document.querySelector('#mount'),
        template: `
        <div class="lead-finder-wrapper">
            <h1 v-bind:style="style.h1">
                Lead Finder
            </h1>
            <a v-on:click="showNewFinderForm" style="float:right;cursor:pointer;margin-right:15px;">New Lead Finder</a>
            <a v-on:click="showSettings" style="float:right;cursor:pointer;margin-right:15px;">Settings</a>
            <a v-if="finder.ID > 0 && view !== 'settings'" v-on:click="confirmDelete" style="float:right;cursor:pointer;color:red;margin-right:15px;">Delete</a>

            <div v-bind:style="style.leftColumn">
                <input v-model="search" v-bind:style="style.input" placeholder="Search" />
                <div v-if="loadingFinders">Loading...</div>
                <div v-on:click="loadFinder(finder)" class="leadfinder-record" v-for="finder in finders" v-if="showFinderInList(finder.post_title)">
                    <a>{{decodeHTML(finder.post_title)}}</a>
                </div>
                
            </div>

            <div v-bind:style="style.rightColumn">


                <div v-if="view !== 'settings'">
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
                            <button v-bind:style="[style.button, style.buttonFullWidth]" v-on:click="runLeadFinder">Run Lead Finder</button>
                        </div>
                        <div style="clear:both;"></div>
                    </div>
                    <div style="clear:both;"></div>
                </div>


                <div v-if="view === 'finder'" style="margin-top:25px;padding-top:30px;border-top: 1px solid #ccc;">
                    <div style="float:right;display:inline-block">
                        <a style="cursor:pointer;margin-right:5px;" v-on:click="exportWebsites">Copy Data</a>
                        <span style="margin-right:5px">
                            Filter: Website
                            <select v-model="filters.website">
                                <option></option>
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </span>
                        <!--
                        <span style="margin-right:5px">
                            Reviews 
                            <select v-model="filters.reviews.option">
                                <option></option>
                                <option value="<">Less than</option>
                                <option value="=">Equal to</option>
                                <option value=">">More than</option>
                            </select>
                            <select v-model="filters.reviews.value">
                                <option></option>
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                            </select>
                        </span>
                        <span style="margin-right:5px">
                            Photos 
                            <select v-model="filters.photos.option">
                                <option></option>
                                <option value="<">Less than</option>
                                <option value="=">Equal to</option>
                                <option value=">">More than</option>
                            </select>
                            <select v-model="filters.photos.value">
                                <option></option>
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                            </select>
                        </span>
                        -->
                        <a style="margin-left:10px;margin-right:5px;cursor:pointer;" v-on:click="download">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                    <h3>Records <span style="font-size:.5em;">({{businesses.length}} of {{original_businesses.length}})</span></h3>
                    <table>
                        <tr>
                            <th>Business Name, Address, Phone</th>
                        </tr>
                        <tr v-if="loadingRecords"><td>Loading...</td></tr>
                        <tr v-for="business in businesses">
                            <td>
                                <div style="float:right;display:inline-block">
                                    <a style="margin-left:5px;" v-if="business.business_data.website" :href="business.business_data.website" target="_blank">
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                    <a style="margin-left:5px;" v-if="business.business_data.url" :href="business.business_data.url" target="_blank">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </a>
                                    <span style="margin-right:5px;">{{rating(business)}}</span>
                                    <div class="Stars right" :style="stars(rating(business))" :label="business.business_data.rating"></div>
                                    <div><a v-on:click="showDetails(business)" style="float:right;cursor:pointer;">Details</a></div>
                                </div>
                                <div>
                                    <strong>{{business.post_title}}</strong>
                                   
                                </div>
                                <div v-html="business.business_data.adr_address"></div>
                                <div>{{business.business_data.formatted_phone_number}}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-if="view === 'settings'">
                    <h2 style="border-bottom:1px solid #ccc;margin-bottom:30px;">Settings</h2>
                    
                    <div style="margin-bottom:30px;">
                        <h3>API Key</h3>
                        <label>Google Places API Key</label>
                        <input type="password" v-model="google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                        <button v-bind:style="style.button" v-on:click="saveApiKey">Save API Key</button>
                    </div>

                    <div style="margin-bottom:30px;">
                        <h3>Locations</h3>

                        <div v-for="location in locations" style="margin-bottom:30px">
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
                                <button v-on:click="saveLocations" v-bind:style="style.button">Save Locations</button>
                            </div>
                        </div>

                        <div style="margin-bottom:40px">
                            <h3>Add New Location</h3>
                            <label>Title</label>
                            <input v-model="new_location.title" v-bind:style="[style.input, style.inputLarge]" />

                            <label>Locations</label>
                            <textarea v-model="new_location.locations" v-bind:style="[style.input, style.inputSmall, style.textarea]"></textarea>
                        </div>

                        <button v-on:click="saveLocations" v-bind:style="style.button">Save Locations</button>
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
                    <label style="display:block;margin-top:20px">Website URLs:
                        <a v-on:click="copyText('website_urls')" style="float:right;cursor:pointer;">Copy</a>
                    </label>
                    <textarea id="website_urls" style="width:100%;height:100px;">{{websiteUrls}}</textarea>

                    <label style="display:block;margin-top:20px">Phone Numbers:
                        <a v-on:click="copyText('phone_numbers')" style="float:right;cursor:pointer;">Copy</a>
                    </label>
                    <textarea id="phone_numbers" style="width:100%;height:100px;">{{phoneNumbers}}</textarea>
                </div>
            </div>

            <div id="deleteModal" v-bind:style="style.modalDelete">
                <div v-bind:style="style.modalContent">
                    <span v-bind:style="style.modalClose" v-on:click="style.modalDelete.display = 'none'">&times;</span>
                    <p style="text-align:center;margin-top:40px;margin-bottom:30px;">Are you sure you want to delete this Lead Finder?</p>
                    <button v-bind:style="[style.button, style.buttonDelete]" v-on:click="deleteLeadFinder">Yes, Delete</button>
                    <button v-bind:style="[style.button]" v-on:click="style.modalDelete.display = 'none'">Cancel</button>
                    <div style="clear:both;"></div>
                </div>
            </div>

            <div id="runScraperModal" v-bind:style="style.runScraperModal">
                <div v-bind:style="style.modalContent">
                    <p v-if="!cancelQueries" style="margin-top:30px;margin-bottom:30px;font-weight:bold;">Running...{{currentQuery}}</p>
                    <p v-if="cancelQueries" style="margin-top:30px;margin-bottom:30px;font-weight:bold;">Cancelling...</dipv>
                    <div v-if="queries || queries.length > 0 && cancelQueries == false">
                        <p>Pending: ({{queries.length}})</p>
                        <div style="height:200px; overflow:auto; border: 1px solid #ccc; padding:5px; margin-bottom:15px;">
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
                    <table>
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
            loadingFinders: false,
            loadingRecords: false,
            google_places_api_key: '',
            confirm_delete_location: null,
            finders: [],
            businesses: [],
            original_businesses: [],
            filters: {
                website: null,
                reviews: {
                    option: null,
                    value: null
                },
                photos: {
                    option: null,
                    value: null
                }
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
            settingsAreValid: false,
            google_places_api_key: '',
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
            view: 'finders',
            search: '',
            modal_message: '',
            style: {
                leftColumn: {
                    width: '25%',
                    float: 'left',
                    marginRight: '4%'
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
            this.loadFinders()
            this.loadLocations()
            this.loadGooglePlacesApiKey()
        },
        computed: {
            finderTitle: function() {
                return this.finder.post_title !== '' ? this.finder.post_title : 'New Lead Finder'
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
            }
        },
        methods: {
            // getQueries: function() {
            //     let locations = this.location.split("\n")
            //     this.queries = locations.map(location => {
            //         return `${this.query} near ${location}`
            //     })
            // },
            copyText: function(id) {
                let obj = document.getElementById(id)
                obj.select()
                document.execCommand("copy")
            },
            exportWebsites: function() {
                console.log("show websites")
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
            loadGooglePlacesApiKey: function() {
                var url = ajaxurl+'?action=lead_finder_get_api_key'
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    this.google_places_api_key = data.google_places_api_key
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
                        this.flashModal('Saved!', 2)
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
                        this.flashModal('Saved!')
                        this.finder = data
                        this.loadFinders()
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
                this.flashModal("Saving locations...")
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
                    this.flashModal('<span style="color:green;font-weight:bold;">Done!<span>', 2)
                })
                return
            },
            saveApiKey: function() {
                var url = ajaxurl+'?action=lead_finder_save_api_key';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        google_places_api_key: this.google_places_api_key
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    this.locations = data
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
                //reset cancel
                this.cancelQueries = false

                //set up the queries
                let locations = this.location.split("\n")
                this.queries = locations.map(location => {
                    return `${this.query} near ${location}`
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
            download: function() {
                var url = ajaxurl+'?action=lead_finder_download&lead_finder_ID='+this.finder.ID
                jQuery('<form action="'+ url +'" method="post"></form>')
		            .appendTo('body').submit().remove();
            },
            applyFilters: function() {
                //website filter
                this.businesses = this.original_businesses.filter(business => {
                    if(this.filters.website === 'Yes')
                        return business.business_data.website && business.business_data.website.length
                    else if(this.filters.website === 'No')
                        return business.business_data.website == undefined || business.business_data.website.length == 0
                    else
                        return true
                })
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
            'filters.reviews.option':function(newV, oldV) {
                this.applyFilters()
            },
            'filters.reviews.value':function(newV, oldV) {
                this.applyFilters()
            },
            'filters.photos.option':function(newV, oldV) {
                this.applyFilters()
            },
            'filters.photos.value':function(newV, oldV) {
                this.applyFilters()
            },
        }
    });
})();