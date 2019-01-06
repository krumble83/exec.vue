
var id = 100;

var strategies = Vue.config.optionMergeStrategies
strategies.myOption = strategies.methods

function genUid(prefix){
	return 'svg' + ((prefix) ? prefix : '') + id++;
}

	
var WorksheetGrid = {
	inject: ['getUid'],
	provide: {
		getGridPosition: function(x, y){
			if(typeof x !== "undefined" && typeof y === "undefined")
				return parseInt(x/16)*16;
			else if(typeof y !== "undefined" && typeof x === "undefined")
				return parseInt(y/16)*16;
			else
				return {x: parseInt(x/16)*16, y: parseInt(y/16)*16};
		}
	},
	
	data: function(){
		var me = this
			, smallId = this.getUid()
			, medId = this.getUid()
			, data = [
				{props: {'is': 'pattern', 
						'id': smallId,
						x: 0,
						y:0,
						width: 16,
						height: 16,
						patternUnits: 'userSpaceOnUse',
						class: 'smallGrid'
					},
					childs: [
						{props:{
								is: 'path',
								d: 'M 16 0 L 0 0 0 16',
								fill: 'none'
							}
						}
					]
				},
				{props: {'is': 'pattern', 
						'id': medId,
						x: 0,
						y:0,
						width: 128,
						height: 128,
						patternUnits: 'userSpaceOnUse',
						class: 'medGrid'
					},
					childs: [
						{props:{
								is: 'rect',
								width: '128',
								height: '128',
								fill: 'url(#' + smallId + ')'
							}
						}
					]
				}
			]
			
		Vue.nextTick(function () {
			me.addDef(data);
		})
		
		return {
			snap: 16,
			gridId: medId
		}
	},
	
	mounted: function(){		
		var panzoom = svgPanZoom(this.$el, {
			viewportSelector: '.exWorkspace', 
			fit: false, 
			center: false,
			zoomScaleSensitivity: 0.4,
			minZoom: 0.05,
			maxZoom: 1,
			useGlobalMove: true,
			restrictPanButton: 2,
		});
		this.$emit('panzoom', panzoom);
	}
}



var lastPageCoords = {x: 0, y: 0}

var worksheetComponent = {
	inject: ['getUid'],
	mixins: [WorksheetGrid],
	
	data: function(){
		return {
			defs: [],
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
			//console.log(this._provided);
			if(typeof data.ctor !== 'String')
				data.ctor = 'ex-node';

			if(typeof data.id !== 'String')
				data.id = this.getUid();

			if(data.inputs){
				Array.from(data.inputs).forEach(function (el, i) {
					if(typeof el.ctor !== 'String')
						data.inputs[i].ctor = 'ex-pin';
					data.inputs[i].type="input";
				});
			}
			if(data.outputs){
				Array.from(data.outputs).forEach(function (el, i) {
					if(typeof el.ctor !== 'String')
						data.outputs[i].ctor = 'ex-pin';
					data.inputs[i].type="output";
				});
			}
			this.nodes.push(data);
		},
		addDef: function(data){
			var me = this;
			
			//console.log(data);
			
			if(Array.isArray(data)){
				data.forEach(function(el){
					me.addDef(el);
				});
				return;
			}
			
			if(data.id) {
				var found = false;
				this.defs.foreach(function(elem){
					if(elem.id == data.id)
						found = true;
				});
				if(found)
					return data.id;
			}
			else
				data.id = this.getUid();
			
			this.defs.push(data);
			return data.id;
		},
		
		onContextMenu: function(){
			console.log('worksheet:onContextMenu');
		},
		
		onRightButtonDown: function(ev){
			console.log('worksheet:onRightButtonDown');
		},
		
		onRightButtonUp: function(ev){
			console.log('worksheet:onRightButtonUp');
		}
	},

	provide: {
		getSvgMousePosition(evt) {
			var CTM = this.$el.getScreenCTM();
			return {
				x: (evt.clientX - CTM.e) / CTM.a,
				y: (evt.clientY - CTM.f) / CTM.d
			};
		},
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
	inject: ['getUid'],

	mixins: [],
	
	provide: {
		getTitleButtonPos: function(){return Math.floor(Math.random() * Math.floor(500));}
	},
  
	data: function(){
		return {
			mTitle: this.title,
		}
	},
  
	components: {
		'ex-titlebarbutton' : titlebarButtonComponent
	},
  
	props: {
		title: {type: String, default: function(){return this.getUid()} }, 
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

