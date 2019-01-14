<script>

	const WorksheetNodeDraggable = {
		methods: {},
		
		created: function(){
			var me = this;
			
			var update = function(evt, node){
				console.log('coucou :)', node);
				me.$store.commit('changeNodeProperty', {node: node.id, props: {x: node.mX, y: node.mY}});
			}
			
			this.$on('node:dragend', update);
			
			this.$once('hook:beforeDestroy', function () {
				this.$off('node:dragend', update);
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
				, startPos = {x: this.x, y: this.y}
				//, oldPos = {x: this.x, y: this.y}
				, offset
				//, data = this.$store.getters.getNode(this.id);
				
				this.getMousePoint(evt, point);
				
				offset = {x: point.x, y: point.y}
				offset.x -= this.mX + 12;
				offset.y -= this.mY + 12;
				
				const updateFn = () => {
					if (this.classObject.dragging) 
						requestAnimationFrame(updateFn);
					
					if(this.getGridPosition){
						this.mX = this.getGridPosition(point.x - offset.x);
						this.mY = this.getGridPosition(point.y - offset.y);
						/*
						if(this.mX == oldPos.x && this.mY == oldPos.y)
							return;
						oldPos.x = this.mX;
						oldPos.y = this.mY;
						this.$store.commit('changeNodePropertyShadow', {
							node: this.id, 
							props: {
								x: oldPos.x, 
								y: oldPos.y}
							}
						);
						*/
					}
					else {
						//data.x = this.mX = point.x - offset.x;
						//data.y = this.mY = point.y - offset.y;
					}
				}
				
				const moveFn = (evt) => {
					this.getMousePoint(evt, point);
				}
				
				const stopFn = (evt) => {
					this.classObject.dragging = false;
					document.removeEventListener('mousemove', moveFn);
					document.removeEventListener('mouseup', stopFn);
					if(this.mX != startPos.x || this.mY != startPos.y){
						console.log('zz');
						this.$emit('dragend', evt, this);
						this.$parent.$emit('node:dragend', evt, this);
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