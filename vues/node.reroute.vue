<template>
	<svg
		:class="classObject"
		class="nodeReroute"
		:id="id"
		:x="mX" 
		:y="mY" 
		:width="37" 
		:height="26" 
		:type="type"
		@mousedown.left.stop="leftMouseDown($event)" 
		@contextmenu.prevent.stop="contextMenu($event)"
	>
		<rect width="100%" height="100%" rx="13" ry="13" class="exNodeBody" />
		
		<component  
			:is="pin.ctor ? pin.ctor : 'ex-pinreroute'"
			:max-link="99"
			class="exPin"
			:ref="pin"
			:x="6"
			:y="3"
			v-bind="pin"			
		/>		
	</svg>
</template>

<script>
	module.exports = {
		mixins: [exnode],
			
		props: {
			pin: {}
		},
		
		created: function(){
		},
		
		beforeDestroy: function(){
		},
		
		mounted: function(){
		},
		
		methods: {			
			update: function(){}
		},
	};
	
</script>

<style>
	.exWorksheet .exNode.nodeReroute > rect:first-child {
		opacity: 0.3;
		pointer-events: all
	}	

	.exWorksheet .exNode.nodeReroute > rect:first-child:hover,
	.exWorksheet .exNode.nodeReroute.selected > rect:first-child{
		opacity: 1
	}

	
</style>