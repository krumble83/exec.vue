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
		},
		
		computed: {
			$worksheet: function(){ return this.getWorksheet();}
		}
	}
	
	const SvgBase = {
		mixins: [WorksheetHelpers],
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