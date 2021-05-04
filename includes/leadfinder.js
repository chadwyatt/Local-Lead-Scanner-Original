( function() {
    var vm = new Vue({
        el: document.querySelector('#mount'),
        template: `
        <div class="lead-finder-wrapper">
            <h1 v-bind:style="style.h1">
                Lead Finder
                <button v-bind:style="style.button" v-on:click="showNewFinderForm">New Lead Finder</button>
                <button v-bind:style="style.button" v-on:click="showNewFinderForm">Google API Key</button>
            </h1>
            <div v-bind:style="style.leftColumn">
                <input v-model="search" v-bind:style="style.input" placeholder="Search" />
                <div v-for="row in records">
                    <div v-if="showFinderInList(row.title.rendered)">
                        <a v-on:click="loadFinder(row)">{{row.title.rendered}}</a>
                    </div>
                </div>
            </div>
            <div v-bind:style="style.rightColumn">
                <div v-if="view === 'finder'">
                    <h2>{{finder.title.rendered}}</h2>
                </div>

                <div v-if="view === 'newfinder'">
                    <h2>{{finderTitle}}</h2>
                    <div>
                        <label>Title</label>
                        <input v-model="finder.title.rendered" v-bind:style="[style.input, style.inputLarge]" />
                    </div>
                    <div>
                        <label>Query</label>
                        <input v-model="query" v-bind:style="[style.input, style.inputLarge]" />
                    </div>
                    <div>
                        <label>Locations</label>
                        <input v-model="locations" v-bind:style="[style.input, style.inputLarge]" />
                    </div>

                    <button v-bind:style="style.button" v-on:click="saveLeadFinder">Save</button>
                </div>

            </div>
        </div>
        `,
        data: {
            records: [],
            finder: {
                title: {
                    rendered: ''
                }
            },
            query: '',
            locations: '',
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
            // var url = '/wp-json/wp/v2/gpapiscraper?filter[orderby]=date&_fields[]=title&_fields[]=id';
            var url = '/wp-json/wp/v2/gpapiscraper?filter[orderby]=date';
            fetch(url).then((response)=>{
                return response.json()
            }).then((data)=>{
                this.records = data;
            })
        },
        computed: {
            finderTitle: function(){
                return this.finder.title.rendered !== '' ? this.finder.title.rendered : 'New Lead Finder'
            }
        },
        methods: {
            loadFinder: function(item) {
                this.view = 'finder'
                this.finder = item
                console.log(item.title.rendered, item.id)
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
            },
            saveLeadFinder: function() {
                var url = '/wp-json/wp/v2/leadfinderapi/create';
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify({
                        title: this.finder.title.rendered
                    })
                }).then((response)=>{
                    return response.json()
                }).then((data)=>{
                    // this.records = data;
                    console.log("saved lead finder", data)
                })
            }
        }
    });
})();