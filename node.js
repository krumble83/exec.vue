

const SvgBase = {
	inject: ['getUid'], 
	props: {
		id: {type: String, default: function(){return this.getUid()}},
		x: {default: 0}, 
		y: {default: 0}, 
		width: {default: 10}, 
		height: {default: 10}
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

const Selectable = {
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

const Draggable = {
	inject: ['getGridPosition', 'getSvgMousePosition'],
	
	data () {
		return {
			oPos: {
				x: 0,
				y: 0
			},
			offset: {x: 0, y: 0},
		}
	},
  
	methods: {
	
		dragMouseMove(evt) {
			var coord = this.getSvgMousePosition(evt);
			this.$el.setAttributeNS(null, 'x', coord.x - this.offset.x);
			this.$el.setAttributeNS(null, 'y', coord.y - this.offset.y);
			//this.mX = coord.x - this.offset.x
			//this.mY = coord.y - this.offset.y
		},
		
		dragMouseDown(evt) {
			this.offset = this.getSvgMousePosition(evt);
			this.offset.x -= parseFloat(this.mX);
			this.offset.y -= parseFloat(this.mX);
			document.addEventListener("mousemove", this.dragMouseMove);
			document.addEventListener("mouseup", this.dragMouseUp);
		},
		
		dragMouseUp(evt) {
			document.removeEventListener("mousemove", this.dragMouseMove);
			document.removeEventListener("mouseup", this.dragMouseUp);			
		},
	
	/*
	
    dragMouseMove(e) {
      const xDiff = this.oPos.x - e.pageX;
      const yDiff = this.oPos.y - e.pageY;
  
      this.oPos.x = e.pageX;
      this.oPos.y = e.pageY;
      this.mX = this.getGridPosition(e.pageX);
      this.mY = this.getGridPosition(e.pageY);
    },
	
    dragMouseDown(e) {
      this.oPos = {
        x: e.pageX,
        y: e.pageY
      };
	  
	  this.$el.parentNode.append(this.$el);
	  this.selected = true;
	  //this.$el.parentNode.addChild(this.$el);
      document.addEventListener("mousemove", this.dragMouseMove);
	  document.addEventListener("mouseup", this.dragMouseUp);
	  //console.dir(this);
    },
	
    dragMouseUp() {
      document.removeEventListener("mousemove", this.dragMouseMove);
	  document.removeEventListener("mouseup", this.dragMouseUp);
      this.oPos = {};
    },
	
	contextMouseUp(){
		if(this.selected)
			console.log('contextMenu');
	},
	*/
	
	focus(){
		
	}
  }
}

Vue.directive('scale', {
  // Quand l'élément lié est inséré dans le DOM...
  inserted: function (el, args, node) {
    if(node.context.update)
		node.context.update();
  }
})

Vue.component('ex-pin', {
	mixins: [SvgBase],
	props: {
		height: {default: 20},
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
				me.$el.setAttribute('width', '100');
			}, 100);
		},
		
		startLink: function(){},
		stopLink: function(){}
	},
	
	template: "#expinTpl"
})


var SyncProps = {
	beforeCreate: function(){
		console.log(this);
		var name = '';

		for(var index in this.$props) { 
			if (!this.$props.hasOwnProperty(index))
				continue;
				
			name = 'm' + index.charAt(0).toUpperCase() + index.slice(1);
			if(typeof this.$data[name] === "undefined"){
				console.log('no ' + name);
				continue;
			}
			console.log('m' + index.charAt(0).toUpperCase() + index.slice(1));
			this.$watch(index, function(val){this[name] = val;});
		}
	}
}

Vue.component('ex-node', {
	mixins: [SvgBase, Draggable],
	
	inject: ['addDef'],
	
	props: {
		title: String, 
		subtitle: String,
		type: String,
		flags: String,
		color: {default: '#00f'},
		img: String
	},
	
	data () {
		return {
			mTitle: this.title,
			mSubtitle: this.subtitle,
			mType: this.type || '',
			mFlags: this.flags,
			mColor: this.color,
			mImg: this.img,
			
			//inputs: {},
			//outputs: {},
		}
	},
	
	watch: {
		mTitle: function(){this.update()},
		mSubtitle: function(){this.update()},
	},
	
	mounted: function(){
		this.update();
	},
	
	methods: {
		update: function(){
			var me = this;
			console.log(me.$el.querySelector('g.title').getBoundingClientRect());
			setTimeout(function(){
				var maxWidth = 0
					, el;
				if(me.mTitle){
					el = me.$el.querySelector('text.exNodeTitle');
					maxWidth = el.getComputedTextLength() + el.x.baseVal[0].value + 15;
					console.dir(maxWidth);
				}
				if(me.mSubtitle){
					el = me.$el.querySelector('text.exNodeSubtitle');
					maxWidth = Math.max(maxWidth, el.getComputedTextLength() + el.x.baseVal[0].value + 15);
				}
				console.log(maxWidth);
				me.w = maxWidth;				
			}, 100);
		},
		alertz: function(){
			console.log('zz');
			alert('');
		}
	},
	
	template: "#exnodeTpl"
})

