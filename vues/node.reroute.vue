<template id="exnodererouteTpl">
	<svg
		:class="classObject"
		class="nodeReroute"
		:id="id"
		:x="x" 
		:y="y" 
		:width="37" 
		:height="26" 
		:type="type"
		@mousedown.left.stop="leftMouseDown($event)" 
		@contextmenu.prevent.stop="contextMenu($event)"
	>
		<rect width="100%" height="100%" rx="13" ry="13" class="exNodeBody" />
		
		<component  
			:is="pin.ctor ? pin.ctor : 'ex-pin'"
			:max-link="pin.maxlink ? pin.maxlink : 1"
			class="exPin"
			:class="pin.class"
			:ref="'input_' + pin.name"
			@pin-resize="$emit('pin-resize')"

			:name="pin.name"
			type="input" 
			:label="pin.label"
			:datatype="pin.datatype"
			:x="0"
			:y="0"
			:width="pin.width"
			:height="pin.height"
			:color="pin.color"
			:editor="pin.editor"
			:isarray="pin.isarray"
			
		/>		
	</svg>
</template>

<script>

	const NodeRerouteComponent = {
		mixins: [NodeComponent],
			
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
		
		template: "#exnodererouteTpl"
	};
	Vue.component('ex-nodereroute', NodeRerouteComponent);
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