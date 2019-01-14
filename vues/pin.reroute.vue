<template>
	<svg 
		:id="id"
		:class="classObject"
		:x="x"
		:y="y"
		:width="mWidth" 
		:height="mHeight"
		:group="group"
		:datatype="datatype"
		:type="type"
		@mousedown.left.stop="$emit('mouse:leftdown', $event)"
		@mouseup.left.stop="$emit('mouse:leftup')"
		@mouseenter="$emit('mouse:enter', $event)"
		@mouseleave="$emit('mouse:leave', $event)"
		@contextmenu.stop.prevent="contextMenu"
		overflow="visible"
	>
		<circle cx="13" cy="10" r="5" :stroke="color" :fill="color" class="pin" ref="pin" />
		<text x="26" y="14" class="label" ref="label">{{label}}</text>
	</svg>
</template>

<script>

	module.exports = {
		mixins: [expin],
	
		methods: {
			update: function(){}
		},
	
		//template: "#expinrerouteTpl"
	};
	//Vue.component('ex-pinreroute', PinRerouteComponent);


</script>
