<template>
	<svg 
		:id="id"
		class="pinExec"
		:class="classObject"
		:x="x" 
		:width="mWidth" 
		:height="mHeight"
		:group="group"
		:datatype="datatype"
		:type="type"
		overflow="visible"
		v-inline.vertical="5"

		@mousedown.left.stop="$emit('mouse:leftdown', $event)"
		@mouseup.left.stop="$emit('mouse:leftup')"
		@mouseenter="$emit('mouse:enter', $event)"
		@mouseleave="$emit('mouse:leave', $event)"
		@mouseup.right="$emit('mouse:rightup', $event)" 
		@contextmenu.prevent.stop="$emit('mouse:context', $event)"
	>
		<rect :transform="type=='output' ? 'scale(-1,1)' : ''" x="0" y="0" :width="mWidth" :height="mHeight" :fill="'url(#pinFocus' + color.replace('#', '_') + ')'" />
		<template v-if="type == 'input'">
			<polygon points="8,6 13,6 18,11 13,16 8,16" class="pin" ref="pin" />
			<text x="26" y="14" class="label" ref="label">{{label}}</text>
		</template>
		<template v-else>
			<polygon points="-20,6 -15,6 -10,11 -15,16 -20,16" class="pin" ref="pin" />
			<text x="19" y="14" id="zz" transform="translate(-47)" text-anchor="end" class="label" ref="label">{{label}}</text>
		</template>
		<component v-if="editor && classObject.linked==false" :is="editor.ctor" class="exEditor" />
	</svg>
</template>

<script>
	module.exports = {
		mixins: [expin],
		
		methods: {
			
		}
	};

</script>

<style>
	.exWorksheet .exNode .exPin.pinExec polygon.pin {
		stroke-width: 2;
		stroke-linejoin: round;
		stroke: #fff;
		fill-opacity: 0;
		fill: #fff;
		pointer-events: none;
	}
	
	.exWorksheet .exNode .exPin.pinExec.linked polygon.pin {
		fill-opacity: 1;
	}	
</style>