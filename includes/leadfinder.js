( function() {
    var vm = new Vue({
        el: document.querySelector('#mount'),
        template: `
        <div class="lead-finder-wrapper">
            <h1 v-bind:style="style.h1">
                Lead Finder
            </h1>
            <button v-bind:style="style.button" v-on:click="showNewFinderForm">New Lead Finder</button>
            <a v-on:click="showSettings" style="float:right;cursor:pointer;">Settings</a>
            <div v-bind:style="style.leftColumn">
                <input v-model="search" v-bind:style="style.input" placeholder="Search" />
                <div v-if="loadingFinders">Loading...</div>
                <ul>
                    <li v-for="finder in finders" v-if="showFinderInList(finder.post_title)">
                        <div>
                            <a v-on:click="loadFinder(finder)">{{decodeHTML(finder.post_title)}}</a>
                        </div>
                    </li>
                </ul>
            </div>

            <div v-bind:style="style.rightColumn">


                <div v-if="view !== 'settings'">
                    <h2>{{decodeHTML(finderTitle)}}</h2>
                    <div>
                        <label>Title</label>
                        <input v-model="finder.post_title" v-bind:style="[style.input, style.inputLarge]" />
                        <button v-bind:style="style.button" v-on:click="saveLeadFinder">Save Title</button>
                        <div style="clear:both;"></div>
                    </div>
                    <div>
                        <div style="width:48%; float:left;">
                            <label>Query</label>
                            <input v-model="query" v-bind:style="[style.input, style.inputLarge]" />
                        </div>
                        <div style="width:48%; float:right;">
                            <label>Locations</label>
                            <select label="Locations" v-model="finder.locations" v-bind:style="[style.input, style.inputLarge]">
                                <option value="">Select location (optional)</option>
                                <option v-for="location in locations" v-bind:value="location.locations">
                                    {{ location.title }}
                                </option>
                            </select>
                        </div>
                        <div style="clear:both;"></div>
                    </div>

                    <button v-bind:style="style.button" v-on:click="runLeadFinder">Run Lead Finder</button>
                    <div style="clear:both;"></div>
                </div>


                <div v-if="view === 'finder'">
                    <h2>Records</h2>
                    <table>
                        <tr>
                            <th>Business Name, Address, Phone</th>
                        </tr>
                        <tr v-if="loadingRecords"><td>Loading...</td></tr>
                        <tr v-for="business in businesses">
                            <td>
                                <div style="float:right;display:inline-block">
                                    <div class="Stars" :style="stars(business.business_data.rating)" :label="business.business_data.rating"></div>
                                    <div><a v-on:click="showDetails(business)" style="float:right;">Details</a></div>
                                </div>
                                <div><a :href="business.business_data.website" target="_blank">{{business.post_title}}</a></div>
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
                                <a v-if="confirm_delete_location !== location.index" v-on:click="confirm_delete_location = location.index" style="cursor:pointer;">Location</a>
                                <span v-if="confirm_delete_location === location.index">
                                    Are you sure you want to delete this location? 
                                    <a v-on:click="deleteLocation(location.index)" style="cursor:pointer;color:red;margin-left:10px;margin-right:10px;font-weight:bold;">Yes, Delete!</a>
                                    <a v-on:click="confirm_delete_location = null" style="cursor:pointer;">Cancel</a>
                                </span>
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
            <div id="details" v-bind:style="style.modalDetails" v-on:click="style.modalDetails.display = 'none'">
                <div v-bind:style="style.modalContent">
                    <span v-bind:style="style.modalClose" v-on:click="style.modal.display = 'none'">&times;</span>
                    <p v-html="modal_message"></p>
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
            finder: {
                post_title: '',
                locations_id: 0 
            },
            settingsAreValid: false,
            google_places_api_key: '',
            query: '',
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
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                    marginLeft: '10px',
                    backgroundColor: '#efefef',
                    float: 'right'
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
        },
        methods: {
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
                console.log("locations", this.locations)
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
                // var url = '/wp-json/lead_finder/create';
                var url = ajaxurl+'?action=lead_finder_create';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        title: this.finder.post_title
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    
                })
            },
            decodeHTML: function (html) {
                var txt = document.createElement('textarea');
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
                console.log("business", business)
                this.modal_message = business.post_title
                this.style.modalDetails.display = 'block'
            },
            runLeadFinder: function() {
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
            stars: function(rating) {
                return "--rating: " + rating + ";"
            }
        },
        watch: {
            'query': function(newV, oldV) {
                console.log("check query", newV.length, newV.length > 0)
                this.settingsAreValid = newV.length > 0
            },
            'settingsAreValid': function(newV, oldV) {
                console.log('settingsAreValid', newV, oldV)
            }
        }
    });
})();