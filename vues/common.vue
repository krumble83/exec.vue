<script>
	var id = 100;

	function genUid(prefix){
		while(document.querySelector('#svg' + ((prefix) ? prefix : '') + id))
			id++;
		return 'svg' + ((prefix) ? prefix : '') + id++;
	}
	
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

			changeNodeProperty: function(state, data){
				state.nodes.find(node => node.id === data.node)[data.name] = data.value;
			}
		},
		
		getters: {
			getNode: (state) => (id) => {
				return state.nodes.find(node => node.id === id)
			}
		}
	}	
	
	
	const BlueprintStoreHelpers = {
		methods: {
			store: function(){return this.$root.store},
		}
	}
	
	
	Vue.prototype.$eventBus = new Vue();
	
	const Viewport = {
		methods: {
			getWorksheet: function(){
				return this.$parent.getWorksheet();
			},
			
			getViewportEl: function(){
				return this.$parent.getViewportEl();
			},
			
			getSvg: function(){
				return this.$parent.getSvg();
			},
			
			getPoint(evt, point){
				var viewport = this.getViewportEl();

				if(!evt)
					return this.getSvg().createSVGPoint();

				point.x = evt.clientX;
				point.y = evt.clientY;
				point = point.matrixTransform(viewport.getCTM().inverse());
			}
		}	
	}
	
	const SvgBase = {
		mixins: [Viewport],
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
	}	
</script>