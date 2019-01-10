<template id="expinTpl">
	<svg 
		:id="mId"
		:class="classObject"
		:x="mX" 
		:y="mY" 
		:width="mWidth" 
		:height="mHeight" 
		:label="mLabel"
		@mousedown.left.stop="$emit('link-start', $event)"
		@mouseup.left.stop="$emit('stopLink')"
		@mouseenter="mouseEnter"
		@contextmenu.stop.prevent="contextMenu"
		:overflow="mType=='output' ? 'visible' : ''"
	>
		<rect :transform="mType=='output' ? 'scale(-1,1)' : ''" x="0" y="0" :width="mWidth" :height="mHeight" :fill="'url(#pinFocus_' + mColor.replace('#', '') + ')'" />
		<template v-if="type == 'input'">
			<circle cx="14" :cy="mHeight/2" r="5" :stroke="mColor" class="pin" ref="pin" />
			<text x="26" y="14" class="label" ref="label">{{label}}</text>
		</template>
		<template v-else>
			<circle cx="-14" :cy="mHeight/2" r="5" :stroke="mColor" class="pin" ref="pin" />
			<text x="19" y="14" transform="translate(-47)" text-anchor="end" class="label" ref="label">{{label}}</text>
		</template>
		<component v-if="mEditor && classObject.linked==false" 
			:is="mEditor.ctor"
			
		/>
	</svg>
</template>

<script>

	const TooltipComponent = {
		mixins: [SvgBase],
		props: {
			text: {}
		},
		
		data: function(){
			return {
				classObject: {
					hidden: true,
				},
			}
		},

		methods: {

		},
		
		template: "#extooltipTpl"
	};
	Vue.component('ex-tooltip', TooltipComponent);


	const PinComponent = {
		inject: ['addSvgDef'],
		mixins: [SvgBase, PinLink, PinForeignEditor],
		props: {

			height: {default: 20},
			ctor: {default: 'ex-pin'},
			label: String, 
			type: String,
			flags: String,
			color: {default: '#00f'},
			datatype: {type: String, required: true},
			
			optionnal: Boolean,
			isarray: Boolean,
			groupe: {type: String},
			editor: false,
		},
		
		data: function() {
			var me = this
			, def = {
				props: {
					is: 'linearGradient',
					id: 'pinFocus_' + this.color.replace('#', '')
				},
				childs: [{
					props : {
						is: 'stop',
						'stop-color': this.color,
						'stop-opacity': '0.01',
						offset: '0.1'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': this.color,
						'stop-opacity': '0.4',
						offset: '0.3'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': this.color,
						'stop-opacity': '0.01',
						offset: '1'
					}
				}]			
			};
			this.$parent.$parent.addDef(def);
			
			return {
				classObject: {
					exPin: true,
					linkable: true,
					linked: false,
				},
				mLabel: this.label,
				mType: this.type,
				mColor: this.color,
				mFlags: this.flags,
				mEditor: this.editor,
			}
		},
		
		watch: {

			label: function(){
				var me = this;
					Vue.nextTick(function () {
						me.update();
					})
			},
		},
		
		mounted: function(){
			this.update();
		},
		
		computed: {
			
			
		},
		
		methods: {
			update: function(){
				//console.log('Pin:start resize ' + this.mLabel);
				var me = this
				, text = this.$refs.label
				, editor = this.$el.querySelector('.exEditor')
				, oldWidth = this.mWidth
				, textBox
				, width
				
				this.mWidth = 400;
				textBox = text.getBBox();
				
				width = parseInt(text.getAttribute('x')) + textBox.width + 11;
				if(editor){
					editor.setAttribute('x', width);
					width += parseInt(editor.getAttribute('width')) + 2;
				}
				
				if( (width) != oldWidth){
					this.mWidth = width;
					this.$nextTick(function(){
						me.$emit('pin-resize');
					});
				}
				else
					this.mWidth = oldWidth;
			},
			
			getNode: function(){
				return this.$parent;
			},
			
			getCenter: function(){
				var b = this.$refs.pin.getBoundingClientRect();
				return {x: b.left-3, y: b.top-3};
				//return this.$refs.pin.getBoundingClientRect().left;
				//return {x:0, y:0}
			},

			isInput: function(){
				return this.mType == 'input';
			},
			
			isOutput: function(){
				return this.mType == 'output';			
			},
			
			getType: function(){
				return this.mType;
			},
						
			contextMenu: function(){console.log('Pin:context menu')},
			
			//mouseEnter: function(){console.log('mouseEnter')},
			mouseLeave: function(){console.log('mouseLeave')},
			

		},
		
		template: "#expinTpl"
	};
	Vue.component('ex-pin', PinComponent);





</script>

<style>
	.exWorksheet .exNode .exPin{
		cursor: crosshair;
	}

	.exWorksheet .exNode .exPin.linkable{
		pointer-events : all;
		cursor: crosshair;
	}

	.exWorksheet .exNode.dragging .exPin{
		pointer-events : none;
	}


	.exWorksheet .exNode .exPin > rect:first-child{
		stroke-width: 0;
		fill-opacity: 0;
	}

	.exWorksheet .exNode .exPin > rect:hover{
		fill-opacity: 1;
	}

	.exWorksheet .exNode .exPin circle.pin{
		stroke-width: 3px;
		pointer-events : none;
	}

	.exWorksheet .exNode .exPin text.label{
		stroke-width: 0;
		font-size: 16px;
		fill: #fff;
		pointer-events : none;
	}
</style>