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
			this.$on('mouse:rightup', this.selectNode);
			
			this.$on('cmenu', function(menu){
				console.log('2');
			});
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

	
	const SelectionRect = {
		props: {
			x: {type: Number, default: 0},
			y: {type: Number, default: 0},
			width: {type: Number, default: 0},
			height: {type: Number, default: 0},
		},
		
		data: function(){
			return {
				mX: 0,
				mY: 0,
				mW: 0,
				mH: 0,
				startPos: {}
			}
		},
		
		methods: {
			updateFn: function(point){
				//console.log('zz');
				this.req = requestAnimationFrame(this.updateFn);
				
				this.mH = this.point.y - this.mY;
				
				if (this.point.x < this.mX) {
					this.mW = this.mX - point.x;
					this.mX = this.point.x;
				}
				else
					this.mW = this.point.x - this.mX;

			},
			
			
			start: function(startPos, point, ctx){
				this.startPos = startPos;
				this.mX = startPos.x;
				this.mY = startPos.y;
				this.ctx = ctx;
				this.point = point;
				
				document.addEventListener('mousemove', this.moveFn);
				document.addEventListener('mouseup', this.stopFn);					
				this.updateFn(startPos);
			},
			
			moveFn: function(evt) {
				//console.log('eee');
				this.ctx.getMousePoint(evt, this.point);
			},
			
			stopFn: function(){
				document.removeEventListener('mousemove', this.moveFn);
				document.removeEventListener('mouseup', this.stopFn);
				//this.$el.removeChild(rect);
				cancelAnimationFrame(this.req);
				this.$el.parentNode.removeChild(this.$el);
				delete this;
			}
		},
		template: '<rect :x="mX" :y="mY" :width="mW" :height="mH" class="exSelectionRectangle"></rect>'
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
			
			removeSelected: function(){
				const sel = this.getNode(node => node.classObject.selected)
				sel.forEach(function(el){})
				
			},
			
			startSelection: function(evt){
				console.log(this);
				var point = this.$el.createSVGPoint()
				, startPos = this.getMousePoint(evt);
				
				var ComponentClass = Vue.extend(SelectionRect);
				var instance = new ComponentClass();
				instance.$mount();
				this.$el.appendChild(instance.$el);
				this.getMousePoint(evt, point);
				instance.start(startPos, point, this);
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