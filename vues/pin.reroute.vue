<template id="expinrerouteTpl">
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
		@mousedown.left.stop="$emit('link-start', $event)"
		@mouseup.left.stop="$emit('link-finish')"
		@mouseenter="$emit('pin-mouseenter', $event)"
		@mouseleave="$emit('pin-mouseleave', $event)"
		@contextmenu.stop.prevent="contextMenu"
		overflow="visible"
	>
		<circle cx="13" cy="10" r="5" :stroke="color" :fill="color" class="pin" ref="pin" />
		<text x="26" y="14" class="label" ref="label">{{label}}</text>
	</svg>
</template>

<script>

	const PinRerouteComponent = {
		mixins: [PinComponent],
	
		template: "#expinrerouteTpl"
	};
	Vue.component('ex-pinreroute', PinRerouteComponent);


</script>
