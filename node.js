

const SvgBase = {
	inject: ['getUid'], 
	props: {
		id: {type: String, default: function(){return this.getUid()}},
		x: {default: 0}, 
		y: {default: 0}, 
		width: {default: 100}, 
		height: {default: 100}
	},
	
	data () {
		return {
			mId: this.id,
			mX: this.x,
			mY: this.y,
			mHeight: this.height,
			mWidth: this.width,
		}
	}
}




const NodeSelectable = {
	data (){
		return {
			selected: false,
		}
	},
	methods: {
		selectMouseDown(e) {
			this.oPos = {
				x: e.pageX,
				y: e.pageY
			};
			document.addEventListener("mousemove", this.dragMouseMove);
			document.addEventListener("mouseup", this.dragMouseUp);
		},
	
		selectMouseUp() {
			document.removeEventListener("mousemove", this.dragMouseMove);
			this.oPos = {};
		},
	
		test(){console.log('ff')}
	},
}

const NodeDraggable = {
	inject: ['getGridPosition'],
	
	mounted: function(){
		//console.log('mounted')
		this.mX = this.getGridPosition(this.mX);
		this.mY = this.getGridPosition(this.mY);			
	},
	
	created: function(){
		//console.log(this);
		
	},
	
	data: function(){
		return {
			classObject: {
				dragging: false,
			}
		}
	},
	
	methods: {

		dragMouseDown(evt) {

			const svg = evt.currentTarget.parentNode.closest("svg");
			const point = svg.createSVGPoint();
			const transform = svg.getScreenCTM().inverse();
			
			var getPosss = function(mouseEvent, point) {
				point.x = (mouseEvent.clientX);
				point.y = (mouseEvent.clientY);
			}
			
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
			offset = {x: point.x, y: point.y}
			offset.x -= this.mX + 10;
			offset.y -= this.mY + 10;
			
			const updateFn = () => {
				if (this.classObject.dragging) requestAnimationFrame(updateFn);

				newPt = point.matrixTransform(transform);
				
				if(this.getGridPosition){
					this.mX = this.getGridPosition(newPt.x - offset.x);
					this.mY = this.getGridPosition(newPt.y - offset.y);					
				}
				else {
					this.mX = newPt.x - offset.x;
					this.mY = newPt.y - offset.y;
				}
			}
			const moveFn = (evt) => getPos(evt, point);
			const stopFn = (evt) => {
				this.classObject.dragging = false;
				svg.removeEventListener("mousemove", moveFn);
				svg.removeEventListener("mouseup", stopFn);
			}

			requestAnimationFrame(updateFn);
			moveFn(evt);

			this.classObject.dragging = true;
			this.$el.parentNode.append(this.$el);
			svg.addEventListener('mousemove', moveFn);
			svg.addEventListener('mouseup', stopFn);
		},
	}
}

const NodeComponent = {
	mixins: [SvgBase, NodeDraggable],
		
	props: {
		title: String, 
		subtitle: String,
		type: String,
		flags: String,
		color: {default: '#00f'},
		img: String,
		inputs: {type: Array},
		outputs: {},
	},
	
	data () {
		//console.log(this.color);
		var me = this
		, def = {
			props: {
				is: 'linearGradient',
				id: 'nodeHeader_' + this.color.replace('#', ''),
				x1: '0',
				y1: '0',
				x2: '1',
				y2: '0.4'
			},
			childs: [{
				props : {
					is: 'stop',
					'stop-color': new Color(this.color).darker(0.1).toString(),
					offset: '0'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': this.color,
					offset: '0.02'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': new Color(this.color).darker(0.45).toString(),
					offset: '0.3'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': new Color(this.color).darker(0.4).toString(),
					offset: '0.7'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': new Color(this.color).darker(0.8).toString(),
					offset: '0.95'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': new Color(this.color).darker(0.8).toString(),
					offset: '1'
				}
			},
			
			]
		}
		this.$parent.addDef(def);
		
		//console.log(this.inputs);
		return {
			mTitle: this.title,
			mSubtitle: this.subtitle,
			mType: this.type || '',
			mFlags: this.flags,
			mColor: this.color,
			mImg: this.img,
			mInputs: this.inputs,
			mOutputs: this.outputs,
		}
	},
	
	watch: {
		mTitle: function(){this.update()},
		mSubtitle: function(){this.update()},
	},
	
	updated: function(){
	},

	created: function(){
		console.log(this.$data);
	},
	
	mounted: function(){
		this.update();
	},
	
	methods: {
		update: function(){
			var me = this
			, oldSize = {w: this.mWidth, h: this.mHeight}

			var maxWidth = 100
			, tr = Utils.Svg.getTranslate(me.$el.querySelector('g.title').getAttribute('transform'))
			, el;
			
			if(me.mTitle){
				el = me.$el.querySelector('text.exNodeTitle');
				maxWidth = Math.max(maxWidth, el.getComputedTextLength() + el.x.baseVal[0].value + tr.x + 20);
				//console.log(el.getComputedTextLength(), el.x.baseVal[0].value, tr.x);
			}
			if(me.mSubtitle){
				el = me.$el.querySelector('text.exNodeSubtitle');
				maxWidth = Math.max(maxWidth, el.getComputedTextLength() + el.x.baseVal[0].value + tr.x + 20);
			}
			//console.log(maxWidth);
			if(maxWidth != oldSize.w){
				me.mWidth = maxWidth;
				me.$emit('resize');
			}
			console.log(this.$el.querySelector('.exInputs').getBBox());

		},
		
		addInput: function(){
			
		},
		
		alertz: function(){
			console.log('zz');
			alert('');
		}
	},
	
	template: "#exnodeTpl"
};
Vue.component('ex-node', NodeComponent);







const PinForeignEditor = {
	props: {
		editor: String,
	}
}

const PinComponent = {
	mixins: [SvgBase, PinForeignEditor],
	props: {
		height: {default: 16},
		ctor: {default: 'ex-pin'},
		label: String, 
		type: String,
		flags: String,
		color: {default: '#00f'},
		isarray: Boolean,
	},
	
	data () {
		return {
			mLabel: this.label,
			mType: this.type,
			mColor: this.color,
			mFlags: this.flags,
		}
	},
	
	watch: {
	},
	
	mounted: function(){
		this.update();
	},
	
	methods: {
		update: function(){
			var me = this;
			setTimeout(function(){
				me.mWidth = 100;
				//me.$el.setAttribute('width', '100');
			}, 100);
		},
		
		startLink: function(){console.log('startLink')},
		stopLink: function(){console.log('stopLink')}
	},
	
	template: "#expinTpl"
};
Vue.component('ex-pin', PinComponent);


