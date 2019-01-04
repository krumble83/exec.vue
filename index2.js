
const SvgShape = {
  data () {
    return {
      px: '',
      py: '',
	  h: '',
	  w: '',
    }
  },
  eventHandlers: {
	  "mousemove": [],
	  "mouseup": [],
	  "mousedown": []
  }
}

const Selectable = {
  data (){
	return {
      selected: false,
	  on: {
		mouseup: function(){console.log('rr')}
      }
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
      this.px = this.px - xDiff;
      this.py = this.py - yDiff;
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


Vue.component('Node', {
  mixins: [SvgShape, Draggable, Selectable],
  props: ['x', 'y', 'width', 'height', 'fill'],
  data () {
    return {
      px: this.x,
      py: this.y,
      h: this.height,
      w: this.width,
      fillIt: this.fill,
    }
  },
  template: "#node"
})


new Vue ({
  el: '#meow',
  data: {
    rects: [
      {
        x: 0,
        y: 10,
        width: 150,
        height: 150,
        fill: '#FF8A80'
      },
       {
        x: 200,
        y: 10,
        width: 150,
        height: 150,
        fill: '#E040FB'
      },
    ]
  }
})
