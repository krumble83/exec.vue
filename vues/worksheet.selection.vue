<script>
	
	const NodeSelectable = {
		data: function(){
			return {
				classObject: {
					selected: false,
				}		
			}
		},
	}


	var SelectionRectangle = Vue.extend({		
		template: '<rect :x="mX" :y="mY" width="100" height="100" class="exSelectionRectangle" />',
	  
		props: {
			x: {type: Number, default: 200},
			y: {type: Number, default: 200},
			width: {},
			height: {},
		},
		
		methods: {
			update: function(x,y){
				this.x = x;
				this.y = y;
			}
		},
	  
		data: function() {
			return {
				mX: this.x,
				mY: this.y,
			}
		},

	});
	
	var WorksheetSelection = {
		
		created: function(){
			var me = this;
			this.$on('node-leftmousedown', function(node, evt){
				if(!evt.ctrlKey)
					me.unselectNode();
				else if(me.isNodeSelected(node)){
					me.unselectNode(node);
					return;
				}
				me.selectNode(node);
				
				//evt.preventDefault();
			});

			this.$on('worksheet-leftmousedown', function(evt){
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
				var me = this
				, target = this.$worksheet.$refs.nodesEl;
				
				if(!node){
					this.$worksheet.$refs.selection.querySelectorAll('.exNode').forEach(function(el){
						me.unselectNode(el.__vue__);
					});
					return;
				}

				target.appendChild(node.$el);
				node.classObject.selected = false;
			},
			
			selectNode: function(node){
				this.$worksheet.$refs.selection.appendChild(node.$el);
				node.classObject.selected = true;
			},
			
			isNodeSelected: function(node){
				return node.$el.parentNode == this.$worksheet.$refs.selection
			},
			
			startSelection: function(evt){
				console.log(evt);
				const svg = evt.currentTarget.closest("svg");
				const point = svg.createSVGPoint();
				const transform = svg.getScreenCTM().inverse();
				
				
				var instance = new SelectionRectangle();
				instance.$mount();
				this.getViewportEl().appendChild(instance.$el);
				
				//this.workspace.push(SelectionRectangle);
				var svgDropPoint;
				
				const main_group_selector = svg.querySelector(".svg-pan-zoom_viewport");

				var getPos = function(evt, point) {
					svgDropPoint = svg.createSVGPoint();

					svgDropPoint.x = evt.offsetX;
					svgDropPoint.y = evt.offsetY;

					svgDropPoint = svgDropPoint.matrixTransform(main_group_selector.getCTM().inverse());
					point.x = svgDropPoint.x;
					point.y = svgDropPoint.y;
				}
				
				var newPt
				, oPos;
				
				getPos(evt, point);
				oPos = {x: point.x, y: point.y};
				
				//console.log(point.x);
				//SelectionRectangle.methods.update(point.x, point.y);
				instance.mX = point.x;
				instance.mY = point.y;
							
				return;
				
				const updateFn = () => {
					if (this.classObject.dragging) 
						requestAnimationFrame(updateFn);

					newPt = point.matrixTransform(transform);
					
					if(this.getGridPosition){
						this.mX = this.getGridPosition(newPt.x - offset.x);
						this.mY = this.getGridPosition(newPt.y - offset.y);					
					}
					else {
						this.mX = newPt.x - offset.x;
						this.mY = newPt.y - offset.y;
					}
					//this.$emit('dragmove', {x: this.mX, y: this.mY});
				}
				
				const moveFn = (evt) => {
					getPos(evt, point);
					this.$emit('dragmove', evt);
				}
				
				const stopFn = (evt) => {
					this.classObject.dragging = false;
					svg.removeEventListener('mousemove', moveFn);
					svg.removeEventListener('mouseup', stopFn);
					this.$emit('dragend', evt);
				}

				requestAnimationFrame(updateFn);
				moveFn(evt);

				this.$el.parentNode.append(this.$el);
				this.classObject.dragging = true;
				svg.addEventListener('mousemove', moveFn);
				svg.addEventListener('mouseup', stopFn);
				this.$emit('dragstart', evt);			
			}
		}
		
	}
</script>

<style>
	.exWorksheet .exSelectionRectangle{
		
	}
</style>