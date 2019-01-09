

const SvgBase = {
	inject: ['getUid'], 
	props: {
		id: {type: String, default: function(){return this.getUid()}},
		x: {default: 0}, 
		y: {default: 0}, 
		width: {default: 50}, 
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
	},
	
	methods: {
		getWorksheet: function(){
			return this.$parent.getWorksheet();
		},
		
		getViewport: function(){
			return this.$parent.getViewport();
		}
		
	}
}


const NodeSelectable = {

	data: function(){
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
		var me = this;
		this.$on('node.leftmousedown', function(evt){
			//console.log(evt);
			me.dragMouseDown(evt);
		});		
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
			
			if(evt.defaultPrevented)
				return;

			const svg = evt.currentTarget.parentNode.closest("svg")
			, viewport = this.getViewport();
			
			var point = svg.createSVGPoint()
			, offset
			, getPos = function(evt, point) {
				point.x = evt.clientX;
				point.y = evt.clientY;
				point = point.matrixTransform(viewport.getCTM().inverse());
			}
			
			getPos(evt, point);			
			
			offset = {x: point.x, y: point.y}
			offset.x -= this.mX + 12;
			offset.y -= this.mY + 12;
			
			const updateFn = () => {
				if (this.classObject.dragging) 
					requestAnimationFrame(updateFn);
				
				if(this.getGridPosition){
					this.mX = this.getGridPosition(point.x - offset.x);
					this.mY = this.getGridPosition(point.y - offset.y);					
				}
				else {
					this.mX = point.x - offset.x;
					this.mY = point.y - offset.y;
				}
			}
			
			const moveFn = (evt) => {
				this.$eventBus.$emit('node.dragmove', this, evt);
				this.$emit('node.dragmove', evt);
				if(evt.defaultPrevented)
					return;
				getPos(evt, point);
			}
			
			const stopFn = (evt) => {
				this.classObject.dragging = false;
				document.removeEventListener('mousemove', moveFn);
				document.removeEventListener('mouseup', stopFn);
				
				this.$eventBus.$emit('node.dragend', evt);
				this.$emit('node.dragend', evt);
			}

			this.$eventBus.$emit('node.dragstart', evt);
			this.$emit('node.dragstart', evt);
			if(evt.defaultPrevented)
				return;

			this.classObject.dragging = true;
			requestAnimationFrame(updateFn);
			moveFn(evt);
			document.addEventListener('mousemove', moveFn);
			document.addEventListener('mouseup', stopFn);
		},
	}
}

const NodeComponent = {
	mixins: [SvgBase, NodeDraggable, NodeSelectable],
		
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
	
	mounted: function(){
		this.update();
	},
	
	methods: {
		
		updatez: function(){console.log('resize11111')},
		
		update: function(){
			//console.log('Node: Start resize ' + this.mTitle);
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
			outputsBox = outputs.getBBox();

			outputs.setAttribute('transform', 'translate(' + (inputsBox.x + inputsBox.width + 9 + outputsBox.width) + ', ' + (headBox.y + headBox.height + 10) + ')');
			
			//head
			maxWidth = Math.max(maxWidth, headBox.width + headBox.x + 20, inputsBox.x + inputsBox.width + 9 + outputsBox.width);
			
			if(maxWidth != oldSize.w){
				this.mWidth = maxWidth;
				//this.$emit('resize');
			}
			console.log(inputsBox, outputsBox);
		},
		
		addInput: function(data){
			this.mInputs.push(data);
		},
		
		contextMenu: function(){console.log('Node:Context menu');},
		
		leftMouseDown: function(evt){
			this.$eventBus.$emit('node.leftmousedown', this, evt);
			this.$emit('node.leftmousedown', evt);
		}
	},
	
	template: "#exnodeTpl"
};
Vue.component('ex-node', NodeComponent);







const PinLink = {
	data: function(){
		return {
			classObject: {
				linked: false,
			},
		}
	},
	
	methods: {
		mouseEnter: function(evt){
			console.log('coucou');
		}
	}
}

const PinForeignEditor = {
	props: {
		editor: String,
	}
}

const PinComponent = {
	inject: ['addSvgDef'],
	mixins: [SvgBase, PinLink, PinForeignEditor],
	props: {

		height: {default: 20},
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
	
	data: function() {
		var me = this
		, def = {
			//<linearGradient id="pinFocus_ffffff">
				//<stop id="SvgjsStop1065" stop-opacity="0.01" stop-color="#ffffff" offset="0.1"></stop>
				//<stop id="SvgjsStop1066" stop-opacity="0.4" stop-color="#ffffff" offset="0.3">
				//</stop><stop id="SvgjsStop1067" stop-opacity="0.01" stop-color="#ffffff" offset="1"></stop></linearGradient>
			props: {
				is: 'linearGradient',
				id: 'pinFocus_' + this.color.replace('#', '')
			},
			childs: [{
				props : {
					is: 'stop',
					'stop-color': this.color,
					'stop-opacity': '0.01',
					offset: '0.1'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': this.color,
					'stop-opacity': '0.4',
					offset: '0.3'
				}
			},
			{
				props: {
					is: 'stop',
					'stop-color': this.color,
					'stop-opacity': '0.01',
					offset: '1'
				}
			}]			
		};
		
		//console.log(this.$refs);
		this.$parent.$parent.addDef(def);
		
		return {
			classObject: {
				linkable: true,
			},
			mLabel: this.label,
			mType: this.type,
			mColor: this.color,
			mFlags: this.flags,
		}
	},
	
	watch: {
		mWidth: function(){this.$emit('resizee')},
		mHeight: function(){this.$emit('resize')},
		label: function(){
			var me = this;
				Vue.nextTick(function () {
					me.update();
				})
		},
	},
	
	mounted: function(){
		this.update();
	},
	
	computed: {
		
		center: function(){
			return {x:0, y:0 }
		},
		
	},
	
	methods: {
		update: function(){
			console.log('Pin:start resize ' + this.mLabel);
			var text = this.$el.querySelector('text.label')
			, textBox
			, oldWidth = this.mWidth;
			
			this.mWidth = 400;
			textBox = text.getBBox();
			
			if( (parseInt(text.getAttribute('x')) + textBox.width + 11) != oldWidth)
				this.mWidth = parseInt(text.getAttribute('x')) + textBox.width + 11;
			else
				this.mWidth = oldWidth;
		},
		
		isInput: function(){
			return this.mType == 'input';
		},
		
		isOutput: function(){
			return this.mType == 'output';			
		},
		
		getType: function(){
			return this.mType;
		},
		
		startLink: function(){console.log('startLink')},
		stopLink: function(){console.log('stopLink')},
		
		contextMenu: function(){console.log('Pin:context menu')},
		
		//mouseEnter: function(){console.log('mouseEnter')},
		mouseLeave: function(){console.log('mouseLeave')},
		
		Emit: function(){
			console.log('emit', this.$parent);
			this.$emit('merdeenter');
		}
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
			},
		}
	},

	methods: {

	},
	
	template: "#extooltipTpl"
};
Vue.component('ex-tooltip', TooltipComponent);
