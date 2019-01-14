<script>

	const WorksheetTooltip = {
	
		mounted: function(){
			if(this.$tooltip)
				return;
			this.$tooltip = document.querySelector('#exTooltip');
			if(!this.$tooltip){
				this.$tooltip = document.createElement('div');
				this.$tooltip.setAttribute('id', 'exTooltip');
				document.body.appendChild(this.$tooltip);
			}
			this.$on('mouse:enter', this.tooltipPinMouseEnter);
		},
		
		methods: {	
			showTooltip: function(e, text, timeout){
				//console.log('show tooltip');
				var me = this;
			
				this.$tooltip.innerHTML = nl2br(text);
				this.$tooltip.style.left = e.pageX + 'px';
				this.$tooltip.style.top = (e.pageY+10) + 'px';
				this.$tooltip.timer = setTimeout(function(){
					if(!me.$tooltip.timer)
						return;
					me.$tooltip.setAttribute('class', 'exTooltip visible');
				}, timeout || 500);
			},

			hideTooltip: function(){
				var me = this;
				clearTimeout(me.$tooltip.timer);
				me.$tooltip.timer = null;
				me.$tooltip.setAttribute('class', 'exTooltip');
			},
		}
	}
</script>
<style>

	#exTooltip{
		position: absolute;
		min-height: 15px;
		min-width: 100px;
		max-width: 450px;
		background-color: #555;
		border: 1px solid #555;
		pointer-events: none;
		color: #999;
		display: none;
		padding: 5px;
		font: 12px arial, sans-serif;
		/*cursor: crosshair;*/
	}

	#exTooltip.visible{
		display: block;
	}

	#exTooltip span{
		display: block;
	}

	#exTooltip span:nth-of-type(2){
		font-style:italic;
		color:#fff;
		padding-bottom: 6px;
	}

	.exWorksheet .exTooltip {
		fill: #555;
	}
	
	.exWorksheet .exTooltip text{
		fill: #fff;
	}
</style>