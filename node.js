

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
			classObject: {
				selected: false,
			}
		}
	},
	
	methods: {
		
	},
}

const NodeDraggable = {
	inject: ['getGridPosition'],
	
	mounted: function(){
		//console.log('mounted')
		if(this.getGridPosition){
			this.mX = this.getGridPosition(this.mX);
			this.mY = this.getGridPosition(this.mY);			
		}
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
		mWidth: function(){this.$emit('resize')},
		mHeight: function(){this.$emit('resize')},

		mTitle: function(){this.update()},
		mSubtitle: function(){this.update()},
		mInputs: function(){this.update()},
		mOutputs: function(){this.update()},
	},
	
	updated: function(){
	},

	created: function(){
		//console.log(this.$data);
	},
	
	on: {
		//resize: function(){console.log('resize')},
	},
	
	mounted: function(){
		this.update();
	},
	
	methods: {
		
		updatez: function(){console.log('resize11111')},
		
		update: function(){
			var oldSize = {w: this.mWidth, h: this.mHeight}
			, maxWidth = 100
			, headBox = this.$el.querySelector('g.exNodeHeader').getBBox()
			, inputs = this.$el.querySelector('g.exInputs')
			, outputs = this.$el.querySelector('g.exOutputs')
			, inputsBox
			, outputsBox;
			
			// inputs
			inputs.setAttribute('transform', 'translate(0, ' + (headBox.y + headBox.height + 10) + ')');
			
			//outputs
			inputsBox = inputs.getBBox();
			outputs.setAttribute('transform', 'translate(' + (inputsBox.x + inputsBox.width + 10) + ', ' + (headBox.y + headBox.height + 10) + ')');
			
			//head
			outputsBox = outputs.getBBox();
			maxWidth = Math.max(maxWidth, headBox.width + headBox.x + 20, inputsBox.x + inputsBox.width + 10 + outputsBox.width);
			
			if(maxWidth != oldSize.w){
				this.mWidth = maxWidth;
				//this.$emit('resize');
			}
			//console.log(this.$el.querySelector('.exInputs').getBBox());

		},
		
		addInput: function(data){
			this.mInputs.push(data);
		},
		
		alertz: function(){
			console.log('zz');
			alert('');
		}
	},
	
	template: "#exnodeTpl"
};
Vue.component('ex-node', NodeComponent);







const PinLink = {
	data (){
		return {
			classObject: {
				linked: false,
			},
			on : {
				update: function(){
					console.log('alert');
				}
			}
		}
	},
}

const PinForeignEditor = {
	props: {
		editor: String,
	}
}

const PinComponent = {
	mixins: [SvgBase, PinLink, PinForeignEditor],
	props: {
		height: {default: 16},
		ctor: {default: 'ex-pin'},
		label: String, 
		type: String,
		flags: String,
		color: {default: '#00f'},
		
		optionnal: Boolean,
		isarray: Boolean,
		groupe: {type: String},
		editor: false,
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
		mWidth: function(){this.$parent.$emit('resize')},
		mHeight: function(){this.$emit('resize')},
		mLabel: function(){this.update();},
	},
	
	mounted: function(){
		this.update();
	},
	
	methods: {
		update: function(){
			var textBox = this.$el.querySelector('text.label').getBBox()
			, oldWidth = this.mWidth;
			
			if( (textBox.x + textBox.width + 10) != oldWidth)
				this.mWidth = textBox.x + textBox.width + 10;
		},
		
		startLink: function(){console.log('startLink')},
		stopLink: function(){console.log('stopLink')},
		
		mouseEnter: function(){console.log('mouseEnter')},
		mouseLeave: function(){console.log('mouseLeave')},
	},
	
	template: "#expinTpl"
};
Vue.component('ex-pin', PinComponent);





const TooltipComponent = {
	mixins: [SvgBase],
	props: {
		text: {}
	},
	
	data: function(){
		return {
			classObject: {
				hidden: true,
			}
		}
	},

	methods: {

	},
	
	template: "#extooltipTpl"
};
Vue.component('ex-tooltip', TooltipComponent);
