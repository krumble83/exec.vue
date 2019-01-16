<script>

	const NodeDraggable = {
		
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

					this.mX = point.x - delta.x;
					this.mY = point.y - delta.y;

					this.$emit('dragmove', evt);
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