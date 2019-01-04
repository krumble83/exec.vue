
var id = 100;

function genUid(prefix){
	return 'svg' + ((prefix) ? prefix : '') + id++;
}

var WorksheetGrid = {
	provide: {
		getGridPosition: function(x, y){
			if(typeof x !== "undefined" && typeof y === "undefined")
				return parseInt(x/25)*25;
			else if(typeof y !== "undefined" && typeof x === "undefined")
				return parseInt(y/25)*25;
			else
				return {x: parseInt(x/25)*25, y: parseInt(y/25)*25};
		}
	},
	data: function(){
		return {
			snap: 25,
		}
	},
}


var worksheetComponent = {
	mixins: [WorksheetGrid],
	
	data: function(){
		return {
			defs: {},
			nodes: [],
			links: [],
			selection: [],
		}
	},
	
	props: {
		id: String,
		cls: String,
	},
	
	methods: {
		addNode: function(data){
			this.nodes.push(data);
		}
	},
	
	template: '#worksheetTpl'
};
Vue.component('ex-worksheet', worksheetComponent);


var titlebarButtonComponent = {
  inject: ['getTitleButtonPos'],
  data: function(){
	  return {
	  }
  },
  props: {
  },
  methods: {
	test: function(){alert('t')},
  },
  template: '#titlebarButtonTpl'	
};
Vue.component('ex-titlebarbutton', titlebarButtonComponent);


var titleBarComponent = {
  provide: {
    getTitleButtonPos: function(){return Math.floor(Math.random() * Math.floor(500));}
  },
  data: function(){
	  return {
		  _title: this.title,
	  }
  },
  components: {
	  'ex-titlebarbutton' : titlebarButtonComponent
  },
  props: {
	  title: String, 
  },
  methods: {
	setTitle: function(str){this.$data._title = str;}
  },
  template: '#titlebarTpl'	
};
Vue.component('ex-titlebar', titleBarComponent);



var app = new Vue({
	provide: {
		getUid: function(prefix){return 'svg' + ((prefix) ? prefix : '') + id++;}, 
	},
	el: '#app',
	data: {
		title: ''
	},
	methods: {
		addNode: function(data) {this.$refs.worksheet.addNode(data)},
	}
});

