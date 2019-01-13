<script>

	const NodeGrid = {
		mounted: function(){
			var node = this.$store.getters.getNode(this.id);
			node.x = this.getGridPosition(this.x);
			node.y = this.getGridPosition(this.y);
		}				
	}

	const WorksheetGrid = {
		inject: ['getUid'],
		provide: {
			getGridPosition: function(x, y){
				if(typeof x !== "undefined" && typeof y === "undefined")
					return parseInt(x/16)*16;
				else if(typeof y !== "undefined" && typeof x === "undefined")
					return parseInt(y/16)*16;
				else
					return {x: parseInt(x/16)*16, y: parseInt(y/16)*16};
			}
		},
		
		created: function(){
			var smallId = this.getUid()
			, medId = this.getUid()
			,data = [
				{props: {is: 'pattern', id: smallId,x: 0,y:0,width: 16,height: 16,patternUnits: 'userSpaceOnUse',class: 'smallGrid'},
					childs: [{props:{is: 'path',d: 'M 16 0 L 0 0 0 16',fill: 'none'}}]
				},
				{props: {is: 'pattern', id: medId,x: 0,y:0,width: 128,height: 128,patternUnits: 'userSpaceOnUse',class: 'medGrid'},
					childs: [{props:{is: 'rect',width: '128',height: '128',fill: 'url(#' + smallId + ')'}}]
				}
			];
				
			this.getWorksheet().addDef(data);
			this.gridId = medId;			
		},
		
		data: function(){
			return {
				snap: 16,
				gridId: '',
			}
		},
		
		mounted: function(){		
			var panzoom = svgPanZoom(this.$el, {
				viewportSelector: '.exViewport', 
				fit: false, 
				center: false,
				zoomScaleSensitivity: 0.4,
				minZoom: 0.05,
				maxZoom: 1,
				useGlobalMove: true,
				restrictPanButton: 2,
			});
			this.$el._panzoom = panzoom;
			this.$emit('panzoom', panzoom);
		}
	}

</script>
<style>

	.exWorksheet .medGrid{
		stroke: #161616;
		stroke-width: 1;
	}

	.exWorksheet .smallGrid{
		stroke: #343434;
		stroke-width: 1;
		fill: #262626;
	}

</style>