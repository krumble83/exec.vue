<script>
	var id = 100;

	function genUid(prefix){
		return 'svg' + ((prefix) ? prefix : '') + id++;
	}
	
	Vue.directive('focus', {
	  // Quand l'élément lié est inséré dans le DOM...
	  bind: function (el, zz, node) {
		  console.log(node);
		// L'élément prend le focus
		el.focus()
	  }
	});


	Vue.prototype.$eventBus = new Vue();
	
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
			},
			
			getSvg: function(){
				return this.$parent.getSvg();
			},
			
			getPoint(evt, point){
				var viewport = this.getViewport();

				if(!evt)
					return this.getSvg().createSVGPoint();

				point.x = evt.clientX;
				point.y = evt.clientY;
				point = point.matrixTransform(viewport.getCTM().inverse());
			}
		}
	}	
</script>