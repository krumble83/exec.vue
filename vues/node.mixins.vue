<script>

	const NodeSelectable = {

		data: function(){
			return {
				classObject: {
					selected: false,
				}		
			}
		},
		
		methods: {
			
		},
	}

	const NodeDraggable = {
		inject: ['getGridPosition'],
		
		mounted: function(){
			//console.log('mounted')
			if(this.getGridPosition){
				this.mX = this.getGridPosition(this.mX);
				this.mY = this.getGridPosition(this.mY);			
			}
		},
		
		created: function(){
			var me = this;
			this.$on('node.leftmousedown', function(evt){
				//console.log(evt);
				me.dragMouseDown(evt);
			});		
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
				, offset;
				
				this.getPoint(evt, point);			
				
				offset = {x: point.x, y: point.y}
				offset.x -= this.mX + 12;
				offset.y -= this.mY + 12;
				
				var ws = this.getWorksheet();
				
				
				//console.dir(this.$el.transform);
				
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
					this.$eventBus.$emit('node.dragmove', this, evt);
					this.$emit('node.dragmove', evt);
					if(evt.defaultPrevented)
						return;
					this.getPoint(evt, point);
				}
				
				const stopFn = (evt) => {
					this.classObject.dragging = false;
					document.removeEventListener('mousemove', moveFn);
					document.removeEventListener('mouseup', stopFn);
					
					this.$eventBus.$emit('node.dragend', evt);
					this.$emit('node.dragend', evt);
				}

				this.$eventBus.$emit('node.dragstart', evt);
				this.$emit('node.dragstart', evt);
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