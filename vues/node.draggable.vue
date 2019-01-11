<script>

	const WorksheetNodeDraggable = {
		methods: {},
		
		created: function(){
			var me = this;
			
			var update = function(evt, node){
				//console.log('coucou :)', node);
				me.$store.commit('changeNodeProperty', {node: node.id, props: {x: node.mX, y: node.mY}});
			}
			
			this.$on('node-dragend', update);
			
			this.$once('hook:beforeDestroy', function () {
				this.$off('node-dragend', update);
			});
		}
	}


	const NodeDraggable = {
		inject: ['getGridPosition'],
		
		mounted: function(){
			//console.log('mounted')
			if(this.getGridPosition){
				var node = this.$store.getters.getNode(this.id);
				node.x = this.getGridPosition(this.mX);
				node.y = this.getGridPosition(this.mY);
				this.mX = this.getGridPosition(this.mX);
				this.mY = this.getGridPosition(this.mY);			
			}
		},
		
		created: function(){
			this.$on('node-leftmousedown', this.dragMouseDown);		
		},
		
		beforeDestroy: function(){
			this.$off('node-leftmousedown', this.dragMouseDown);	
		},
		
		watch: {
			//mX: function(){this.$emit('node-dragged')},
			//mY: function(){this.$emit('node-dragged')},			
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

				var point = this.getPoint()
				, oldPos = {x: this.mX, y: this.mY}
				, offset;
				
				this.getPoint(evt, point);
				
				offset = {x: point.x, y: point.y}
				offset.x -= this.mX + 12;
				offset.y -= this.mY + 12;
				
				var ws = this.getWorksheet();
				
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
					//this.$eventBus.$emit('node.dragmove', this, evt);
					//this.$emit('node-dragmove', evt);
					//if(evt.defaultPrevented)
					//	return;
					this.getPoint(evt, point);
				}
				
				const stopFn = (evt) => {
					this.classObject.dragging = false;
					document.removeEventListener('mousemove', moveFn);
					document.removeEventListener('mouseup', stopFn);
					if(this.mX != oldPos.x || this.mY != oldPos.y){
						this.$emit('node-dragend', evt, this);
						this.$parent.$emit('node-dragend', evt, this);
					}
				}

				//this.$eventBus.$emit('node.dragstart', evt);
				this.$emit('node-dragstart', evt);
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

</script>