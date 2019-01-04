
const SvgShape = {
  data () {
    return {
      px: '',
      py: '',
	  h: '',
	  w: ''
    }
  },
  eventHandlers: {
	  "mousemove": [],
	  "mouseup": [],
	  "mousedown": []
  }
}

const Selectable = {
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
    }
  }	
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
      document.addEventListener("mousemove", this.dragMouseMove);
	  document.addEventListener("mouseup", this.dragMouseUp);
    },
    dragMouseUp() {
      document.removeEventListener("mousemove", this.dragMouseMove);
	  document.removeEventListener("mouseup", this.dragMouseUp);
      this.oPos = {};
    },
	test(){
		console.dir(this)
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
      fillIt: this.fill
    }
  },
  template: "#node"
})


new Vue ({
  el: '#meow',
  data: {}
})