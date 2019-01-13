<script>

	const WorksheetNodeDraggable = {
		methods: {},
		
		created: function(){
			var me = this;
			
			var update = function(evt, node){
				//console.log('coucou :)', node);
				me.$store.commit('changeNodeProperty', {node: node.id, props: {x: node.x, y: node.y}});
			}
			
			this.$on('node-dragend', update);
			
			this.$once('hook:beforeDestroy', function () {
				this.$off('node-dragend', update);
			});
		}
	}


	const NodeDraggable = {
		inject: ['getGridPosition'],
		
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
				},
				mX: 0,
				mY: 0,
			}
		},
		
		methods: {
			dragMouseDown(evt) {				
				if(evt.defaultPrevented)
					return;

				var point = this.getSvgPoint()
				, oldPos = {x: this.x, y: this.y}
				, offset
				, data = this.$store.getters.getNode(this.id);
				
				this.getMousePoint(evt, point);
				
				offset = {x: point.x, y: point.y}
				offset.x -= this.x + 12;
				offset.y -= this.y + 12;
				
				var ws = this.getWorksheet();
				
				const updateFn = () => {
					if (this.classObject.dragging) 
						requestAnimationFrame(updateFn);
					
					if(this.getGridPosition){
						data.x = this.mX = this.getGridPosition(point.x - offset.x);
						data.y = this.mY = this.getGridPosition(point.y - offset.y);
					}
					else {
						data.x = this.mX = point.x - offset.x;
						data.y = this.mY = point.y - offset.y;
					}
				}
				
				const moveFn = (evt) => {
					//this.$eventBus.$emit('node.dragmove', this, evt);
					//this.$emit('node-dragmove', evt);
					//if(evt.defaultPrevented)
					//	return;
					this.getMousePoint(evt, point);
				}
				
				const stopFn = (evt) => {
					this.classObject.dragging = false;
					document.removeEventListener('mousemove', moveFn);
					document.removeEventListener('mouseup', stopFn);
					if(this.x != oldPos.x || this.y != oldPos.y){
						this.$emit('node-dragend', evt, this);
						this.$parent.$emit('node-dragend', evt, this);
					}
					evt.stopPropagation();
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