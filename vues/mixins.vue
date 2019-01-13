<script>
	var id = 100;

	function genUid(prefix){
		while(document.querySelector('#svg' + ((prefix) ? prefix : '') + id))
			id++;
		return 'svg' + ((prefix) ? prefix : '') + id++;
	}
	
	Vue.directive('inline', {
		inserted: function(el, bind, vm){
			var prev = el.previousSibling;
			if(!prev)
				return;
			if(prev.nodeName == '#text')
				prev = prev.previousSibling;
			
			var box = prev.getBBox();
			if(bind && bind.modifiers && bind.modifiers.debug)
				console.log(el, prev, box, el.getCTM())//.getTransformToElement(prev));
			if(bind && bind.modifiers && bind.modifiers.vertical)
				el.setAttribute('y', (parseInt(prev.getAttribute('y')) ||0) + box.height + (bind.value || 0));
			if(bind.modifiers && bind.modifiers.horizontal)
				el.setAttribute('x', (parseInt(prev.getAttribute('x')) ||0) + box.width + (bind.value || 0));			
		},
	
		update: function(el, bind){
			//console.log('update', bind);
			var prev = el.previousSibling;
			if(!prev)
				return;
			if(prev.nodeName == '#text')
				prev = prev.previousSibling;
			
			var box = prev.getBBox();
			if(bind && bind.modifiers && bind.modifiers.debug)
				console.log(el, prev, box, el.getCTM())//.getTransformToElement(prev));
			if(bind && bind.modifiers && bind.modifiers.vertical)
				el.setAttribute('y', (parseInt(prev.getAttribute('y')) ||0) + box.height + (bind.value || 0));
			if(bind.modifiers && bind.modifiers.horizontal)
				el.setAttribute('x', (parseInt(prev.getAttribute('x')) ||0) + box.width + (bind.value || 0));
		},

		componentUpdated: function(el, bind){
			//console.log('update', bind);
			var prev = el.previousSibling;
			if(!prev)
				return;
			if(prev.nodeName == '#text')
				prev = prev.previousSibling;
			
			var box = prev.getBBox();
			if(bind && bind.modifiers && bind.modifiers.debug)
				console.log(el, prev, box, el.getCTM())//.getTransformToElement(prev));
			if(bind && bind.modifiers && bind.modifiers.vertical)
				el.setAttribute('y', (parseInt(prev.getAttribute('y')) ||0) + box.height + (bind.value || 0));
			if(bind.modifiers && bind.modifiers.horizontal)
				el.setAttribute('x', (parseInt(prev.getAttribute('x')) ||0) + box.width + (bind.value || 0));
		}
	});
	
	
	/*
	Vue.directive('focus', {
	  // Quand l'élément lié est inséré dans le DOM...
	  bind: function (el, zz, node) {
		  console.log(node);
		// L'élément prend le focus
		el.focus()
	  }
	});
	*/

	
	const BlueprintStore = {
		state: {
			nodes: [],
			links: []
		},

		mutations: {
			increment (state) {
				state.count++
			},

			addNode: function(state, data) {
				state.nodes.push(data);
			},
			
			addLink: function(state, data) {
				state.links.push(data);
			},
			
			deleteNode: function(state, node){
				var n = this.getters.getNode(node);
				if(n && state.nodes.indexOf(n) > -1)
					state.nodes.splice(state.nodes.indexOf(n), 1);
			},

			deleteLink: function(state, link){
				var l = this.getters.getLink(link);
				if(n && state.links.indexOf(l) > -1)
					state.links.splice(state.links.indexOf(l), 1);
			},

			changeNodeProperty: function(state, data){
				var n = state.nodes.find(node => node.id === data.node);
				if(!n)
					return;
				
				for(var index in data.props) { 
					if (data.props.hasOwnProperty(index)) {
						Vue.set(n, index, data.props[index]);
					}
				}				
			},
			
			changeLinkProperty: function(state, data){
				var l = state.links.find(link => link.id === data.link);
				if(!l)
					return;
				
				for(var index in data.props) { 
					if (data.props.hasOwnProperty(index)) {
						Vue.set(l, index, data.props[index]);
					}
				}				
			},

			applyFunc: function(state, func){
				func.call(this);
			},
		},
		
		getters: {
			getNode: (state) => (id) => {
				return state.nodes.find(node => node.id === id)
			},
			
			getLink: (state) => (id) => {
				return state.links.find(link => link.id === id)
			}
			
		}
	}	
	
	Vue.prototype.$eventBus = new Vue();
	
	const WorksheetHelpers = {
		methods: {
			getWorksheet: function(){
				//console.log('getWorksheet()');
				return this.$parent.getWorksheet();
			},
			
			getViewportEl: function(){
				return this.$parent.getViewportEl();
			},
			
			getSvg: function(){
				return this.$parent.getSvg();
			},
			
			getSvgPoint(x, y){
				var ret = this.getSvg().createSVGPoint();
				if(typeof x != 'undefined')
					ret.x = x;
				if(typeof y != 'undefined')
					ret.y = y;
				return ret;
			},
			
			getMousePoint: function(evt, point){
				if(typeof point == 'undefined')
					point = this.getSvg().createSVGPoint();
				
				point.x = (evt.mozInputSource !== undefined) ? evt.layerX : evt.offsetX;
				point.y = (evt.mozInputSource !== undefined) ? evt.layerY : evt.offsetY;
				point = point.matrixTransform(this.getViewportEl().getCTM().inverse());
				return point;
			},
		},
		
		computed: {
			$worksheet: function(){return this.getWorksheet();},
			$viewport: function(){return this.getViewportEl();},
		}
	}
	
	const SvgHelpers = {
		methods: {
			getMouseEventCoords: function(point, evt){
				
			}
		}
	}
	
	const SvgBase = {
		mixins: [WorksheetHelpers],
		inject: ['getUid'], 
		props: {
			id: {type: String, default: function(){return this.getUid()}},
			x: {type: Number, default: 0}, 
			y: {type: Number, default: 0}, 
			width: {type: Number, default: 50}, 
			height: {type: Number, default: 100}
		},
		
		data () {
			return {
				mHeight: this.height,
				mWidth: this.width,
			}
		},
	}	
</script>