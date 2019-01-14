<script>

	const NodeDraggable = {
		inject: ['getGridPosition'],
		
		created: function(){
			this.$on('mouse:leftdown', this.dragMouseDown);
		},
		
		beforeDestroy: function(){
			this.$off('mouse:leftdown', this.dragMouseDown);
		},
		
		data: function(){
			return {
				classObject: {
					dragging: false,
				}
			}
		},
		
		watch: {
			x : function(val){this.mX = val},
			y : function(val){this.mY = val},
		},
		
		methods: {
			dragMouseDown(evt) {				
				if(evt.defaultPrevented)
					return;

				var point = this.getSvgPoint()
				, startPos = {x: this.x, y: this.y};
				
				this.getMousePoint(evt, point);
				
				const delta = {x: point.x - (this.mX + 12), y: point.y - (this.mY + 12)}
				
				const updateFn = () => {
					if (this.classObject.dragging) 
						requestAnimationFrame(updateFn);
					
					if(this.getGridPosition){
						this.mX = this.getGridPosition(point.x - delta.x);
						this.mY = this.getGridPosition(point.y - delta.y);
					}
					else {
						this.mX = point.x - offset.x;
						this.mY = point.y - offset.y;
					}
					this.$emit('dragmove', evt);
					//this.$worksheet.$emit('node:dragmove', evt, this);
				}
				
				const moveFn = (evt) => {
					this.getMousePoint(evt, point);
				}
				
				const stopFn = (evt) => {
					this.classObject.dragging = false;
					document.removeEventListener('mousemove', moveFn);
					document.removeEventListener('mouseup', stopFn);
					if(this.mX != startPos.x || this.mY != startPos.y){
						this.$store.commit('changeNodeProperty', {node: this.id, props: {x: this.mX, y: this.mY}});
						this.$emit('dragend', evt, this);
						//this.$worksheet.$emit('node:dragend', evt, this);
					}
					evt.stopPropagation();
				}

				//this.$eventBus.$emit('node.dragstart', evt);
				this.$emit('dragstart', evt);
				//this.$worksheet.$emit('node:dragstart', this, evt);
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