

const SvgBase = {
	inject: ['getUid'], 
	props: {
		id: {type: String, default: function(){return this.getUid()}},
		x: {default: 0}, 
		y: {default: 0}, 
		width: {default: 100}, 
		height: {default: 200}
	},
	data () {
		return {
			mId: this.id,
			px: this.x,
			py: this.y,
			h: this.height,
			w: this.width,
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
  inject: ['getGridPosition'],
  data () {
    return {
      oPos: {
        x: 0,
        y: 0
      }
    }
  },
  
  methods: {
    dragMouseMove(e) {
      const xDiff = this.oPos.x - e.pageX;
      const yDiff = this.oPos.y - e.pageY;
  
      this.oPos.x = e.pageX;
      this.oPos.y = e.pageY;
      this.px = this.getGridPosition(e.pageX);
      this.py = this.getGridPosition(e.pageY);
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
	
	focus(){
		
	}
  }
}


Vue.component('ex-node', {
	mixins: [SvgBase, Draggable, Selectable],
	props: {
		title: String, 
		subtitle: String,
		color: {default: '#00f'},
		img: String,
	},
	
	data () {
		return {
			mTitle: this.title,
			mSubtitle: this.subtitle,
			mColor: this.color,
			mImg: this.img,
			
			inputs: {},
			outputs: {},
		}
	},
	
	watch: {
		mTitle: function(){this.update()},
		mSubtitle: function(){this.update()},
	},
	
	methods: {
		update: function(){
			var me = this;
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
		}
	},
	
	template: "#exnodeTpl"
})

