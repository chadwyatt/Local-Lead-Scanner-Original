( function() {
    var vm = new Vue({
        el: document.querySelector('#mount'),
        template: `
        <div class="lead-finder-wrapper">
            <h1 v-bind:style="style.h1">
                Lead Finder
            </h1>
            <button v-bind:style="style.button" v-on:click="showNewFinderForm">New Lead Finder</button>
            <button v-bind:style="style.button" v-on:click="showNewFinderForm">Google API Key</button>
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
                    </div>
                    <div>
                        <div style="width:48%; float:left;">
                            <label>Query</label>
                            <input v-model="query" v-bind:style="[style.input, style.inputLarge]" />
                        </div>
                        <div style="width:48%; float:right;">
                            <label>Locations</label>
                            <select label="Locations" v-model="finder.locations_id" v-bind:style="[style.input, style.inputLarge]">
                                <option v-for="location in locations" v-bind:value="location.ID">
                                    {{ location.text }}
                                </option>
                            </select>
                        </div>
                        <div style="clear:both;"></div>
                    </div>

                    <button v-bind:style="style.button" v-on:click="saveLeadFinder">Save</button>
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
                        <input v-model="google_places_api_key" v-bind:style="[style.input, style.inputLarge]" />
                    </div>

                    <div style="margin-bottom:30px;">
                        <h3>Locations</h3>


                        <div v-for="location in locations">
                            <label>Title</label>
                            <input v-model="location.title" v-bind:style="[style.input, style.inputLarge]" />

                            <label>Locations</label>
                            <textarea v-model="location.locations" v-bind:style="[style.input, style.inputLarge]"></textarea>
                            
                        </div>

                        <label>Title</label>
                        <input v-model="new_location.title" v-bind:style="[style.input, style.inputLarge]" />

                        <label>Locations</label>
                        <textarea v-model="new_location.locations" v-bind:style="[style.input, style.inputLarge]"></textarea>
                        

                        <button v-on:click="saveLocations">Save Locations</button>
                    </div>

                </div>
                

            </div>
        </div>
        `,
        data: {
            loadingFinders: false,
            loadingRecords: false,
            finders: [],
            businesses: [],
            finder: {
                post_title: '',
                locations_id: 0 
            },
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
                button: {
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                    marginLeft: '10px',
                    backgroundColor: '#efefef',
                    float: 'right'
                }
            }
        },
        mounted: function(){
            this.loadFinders()
            this.loadLocations()
        },
        computed: {
            finderTitle: function(){
                return this.finder.post_title !== '' ? this.finder.post_title : 'New Lead Finder'
            }
        },
        methods: {
            loadFinders: function() {
                this.loadingFinders = true
                // var url = '/wp-json/wp/v2/gpapiscraper?filter[orderby]=date&_fields[]=title&_fields[]=id';
                // var url = '/wp-json/wp/v2/gpapiscraper?orderby=title&per_page=100'
                // var url = '/wp-json/lead_finder/finders'
                var url = '/wp-admin/admin-ajax.php?action=lead_finder_list'
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    console.log("finders", data)
                    this.finders = data
                    this.loadingFinders = false
                })
            },
            loadLocations: function() {
                var url = '/wp-admin/admin-ajax.php?action=lead_finder_get_locations'
                fetch(url).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    console.log("locations", data)
                    this.locations = data
                })
            },
            loadFinder: function(item) {
                this.loadingRecords = true
                this.view = 'finder'
                this.finder = item
                this.businesses = []
                // var url = '/wp-json/lead_finder/records/'+item.ID;
                var url = '/wp-admin/admin-ajax.php?action=lead_finder_records&ID='+item.ID
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log("records", data)
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
                var url = '/wp-admin/admin-ajax.php?action=lead_finder_create';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        title: this.finder.post_title
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    console.log("saved lead finder", data)
                })
            },
            decodeHTML: function (html) {
                var txt = document.createElement('textarea');
                txt.innerHTML = html;
                return txt.value;
            },
            saveLocations: function() {
                var url = '/wp-admin/admin-ajax.php?action=lead_finder_save_locations';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        locations: this.locations,
                        new_location: this.new_location
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    console.log("saved lead finder", data)
                    this.locations = data
                })
                return
            }
            
        }
    });
})();