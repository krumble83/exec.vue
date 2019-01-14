<script>
	const NodeSelectable = {
		data: function(){
			return {
				classObject: {
					selected: false,
				}		
			}
		},
		
		created: function(){
			this.$on('mouse:leftdown', this.selectNode);			
		},
		
		beforeDestroy: function(){
			this.$off('mouse:leftdown', this.selectNode);	
		},
		
		methods: {
						
			selectNode: function(evt){
				var me = this;

				console.log(evt);
				if(evt.type == 'mousedown'){
					this.$once('mouseup', this.selectNode);
					//evt.preventDefault();
					//return;
				}
				

				if(!evt.ctrlKey)
					me.$worksheet.unselectNode();
				else {
					me.$worksheet.switchSelectNode(me);
					return;
				}
				me.$worksheet.selectNode(me);
				
				if(this.$worksheet.getNode(node => node.classObject.selected).length > 1)
					evt.preventDefault();

			}
			
		}
	}


	var WorksheetSelection = {
		mixins: [WorksheetHelpers],
		created: function(){
			var me = this;

			this.$on('mouse:leftdown', function(evt){
				if(!evt.ctrlKey)
					me.unselectNode();	
				me.startSelection(evt);
			});		

			var def = {
				props: {is: 'linearGradient',id: 'selectionHandlerStroke',x1: '0',y1:'0',x2: '0',y2: '1'
				},
				childs: [
					{props : {is: 'stop','stop-color': '#f1b000',offset: '0'}},
					{props: {is: 'stop','stop-color': '#ce6d00',offset: '1'}}
				]			
			};
			this.addDef(def);
		},
		
		methods: {			
			unselectNode: function(node){
				if(!node){
					var n = this.$worksheet.getNode(node => node.classObject.selected == true);
					n.forEach(el => el.classObject.selected = false);
				}
				else
					node.classObject.selected = false;
			},
			
			switchSelectNode: function(node){
				node.classObject.selected = !node.classObject.selected;
			},
			
			selectNode: function(node){
				node.classObject.selected = true;
			},
			
			isNodeSelected: function(node){
				return node.classObject.selected;
			},
			
			startSelection: function(evt){
				console.log(this);
				var point = this.$el.createSVGPoint()
				, startPos = this.getMousePoint(evt)
				, rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
				, req;
				
				this.$el.appendChild(rect);
				
				rect.setAttribute('x', startPos.x);
				rect.setAttribute('y', startPos.y);
				rect.setAttribute('width', 1);
				rect.setAttribute('height', 1);
				rect.setAttribute('class', 'exSelectionRectangle');
				
				//this.getMousePoint(evt, point);
								
				const updateFn = () => {
					req = requestAnimationFrame(updateFn);
					
					

					if (point.x - startPos.x < 0) {
						rect.setAttribute('x', rect.getAttribute('x') + rect.getAttribute('width'));
						rect.setAttribute('width', -rect.getAttribute('width'))
					}
					else
						rect.setAttribute('width', point.x - startPos.x);
					rect.setAttribute('height', point.y - startPos.y);					
					
				}
				
				const moveFn = (evt) => {
					this.getMousePoint(evt, point);
				}
				
				const stopFn = (evt) => {
					document.removeEventListener('mousemove', moveFn);
					document.removeEventListener('mouseup', stopFn);
					this.$el.removeChild(rect);
					cancelAnimationFrame(req);
				}

				requestAnimationFrame(updateFn);
				moveFn(evt);
				document.addEventListener('mousemove', moveFn);
				document.addEventListener('mouseup', stopFn);				
			}
		}
		
	}
</script>

<style>
	.exWorksheet .exNode.selected > rect:first-child {
		stroke-width: 3px;
		stroke: url(#selectionHandlerStroke);
	}

	.exWorksheet .exSelectionRectangle{
		stroke: #fff;
		stroke-width: 1;
		fill: none;
	}
</style>