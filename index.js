
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


let SelectionRectangle = {
	
	template: `
		<rect :x="mX" :y="mY" width="100" class="selection" height="100" />
	`,
  
	props: {
		x: {type: Number, default: 200},
		y: {type: Number, default: 200},
	},
  
	data () {
		return {
			mX: this.x,
			mY: this.y,
		}
	},

}


var worksheetSelection = {
	
	methods: {
		startSelection: function(evt){
			const svg = evt.currentTarget.closest("svg");
			const point = svg.createSVGPoint();
			const transform = svg.getScreenCTM().inverse();
			
			var getPosss = function(mouseEvent, point) {
				point.x = (mouseEvent.clientX);
				point.y = (mouseEvent.clientY);
			}
			
			this.workspace.push(SelectionRectangle);
			var svgDropPoint;
			
			const main_group_selector = svg.querySelector(".svg-pan-zoom_viewport");

			var getPos = function(evt, point) {
				svgDropPoint = svg.createSVGPoint();

				svgDropPoint.x = evt.clientX;
				svgDropPoint.y = evt.clientY;

				svgDropPoint = svgDropPoint.matrixTransform(main_group_selector.getCTM().inverse());
				point.x = svgDropPoint.x;
				point.y = svgDropPoint.y;
			}
			
			var newPt
			, offset;
			
			getPos(evt, point);			
			SelectionRectangle.x = point.x;
			SelectionRectangle.y = point.y;
			console.log(SelectionRectangle, point);
						
			return;
			
			const updateFn = () => {
				if (this.classObject.dragging) 
					requestAnimationFrame(updateFn);

				newPt = point.matrixTransform(transform);
				
				if(this.getGridPosition){
					this.mX = this.getGridPosition(newPt.x - offset.x);
					this.mY = this.getGridPosition(newPt.y - offset.y);					
				}
				else {
					this.mX = newPt.x - offset.x;
					this.mY = newPt.y - offset.y;
				}
				//this.$emit('dragmove', {x: this.mX, y: this.mY});
			}
			
			const moveFn = (evt) => {
				getPos(evt, point);
				this.$emit('dragmove', evt);
			}
			
			const stopFn = (evt) => {
				this.classObject.dragging = false;
				svg.removeEventListener('mousemove', moveFn);
				svg.removeEventListener('mouseup', stopFn);
				this.$emit('dragend', evt);
			}

			requestAnimationFrame(updateFn);
			moveFn(evt);

			this.$el.parentNode.append(this.$el);
			this.classObject.dragging = true;
			svg.addEventListener('mousemove', moveFn);
			svg.addEventListener('mouseup', stopFn);
			this.$emit('dragstart', evt);			
		}
	}
	
}

var worksheetComponent = {
	inject: ['getUid'],
	mixins: [WorksheetGrid, worksheetSelection],
	
	data: function(){
		return {
			defs: [],
			nodes: [],
			links: [],
			selection: [],
			workspace: [],
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
		
		addLink: function(startPin, evt){
			this.links.push({
				starPin: startPin,
				startEvt: evt,
			});
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

	mixins: [SvgBase],
	
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

