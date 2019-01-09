<template id="expinTpl">
	<svg 
		:id="mId"
		class="exPin"
		:x="mX" 
		:y="mY" 
		:width="mWidth" 
		:height="mHeight" 
		:label="mLabel"
		@mousedown.left.stop="$emit('startLink')"
		@mouseup.left="$emit('stopLink')"
		@mouseenter="mouseEnter"
		@resize="$parent.$emit('pin.resize')"
		@contextmenu.stop.prevent="contextMenu"
		overflow="visible"
	>
		<rect :transform="mType=='output' ? 'scale(-1,1)' : ''" x="0" y="0" :width="mWidth" :height="mHeight" :fill="'url(#pinFocus_' + mColor.replace('#', '') + ')'" />
		<template v-if="type == 'input'">
			<circle cx="14" :cy="mHeight/2" r="5" :stroke="mColor" class="pin" />
			<text x="26" y="14" class="label">{{label}}</text>
		</template>
		<template v-else>
			<circle cx="-14" :cy="mHeight/2" r="5" :stroke="mColor" class="pin" />
			<text x="19" y="14" transform="translate(-47)" text-anchor="end" class="label">{{label}}</text>
		</template>
		<component v-if="mEditor"
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

	const PinForeignEditor = {
		props: {
			editor: String,
		}
	}

	const PinLink = {
		data: function(){
			return {
				classObject: {
					linked: false,
				},
			}
		},
		
		methods: {
			mouseEnter: function(evt){
				console.log('coucou');
			}
		}
	}
	
	
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
			
			optionnal: Boolean,
			isarray: Boolean,
			groupe: {type: String},
			editor: false,
		},
		
		data: function() {
			var me = this
			, def = {
				//<linearGradient id="pinFocus_ffffff">
					//<stop id="SvgjsStop1065" stop-opacity="0.01" stop-color="#ffffff" offset="0.1"></stop>
					//<stop id="SvgjsStop1066" stop-opacity="0.4" stop-color="#ffffff" offset="0.3">
					//</stop><stop id="SvgjsStop1067" stop-opacity="0.01" stop-color="#ffffff" offset="1"></stop></linearGradient>
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
			
			//console.log(this.$refs);
			this.$parent.$parent.addDef(def);
			
			return {
				classObject: {
					linkable: true,
				},
				mLabel: this.label,
				mType: this.type,
				mColor: this.color,
				mFlags: this.flags,
				mEditor: false,
			}
		},
		
		watch: {
			mWidth: function(){this.$emit('resize')},
			mHeight: function(){this.$emit('pin.resize')},
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
			
			center: function(){
				return {x:0, y:0 }
			},
			
		},
		
		methods: {
			update: function(){
				console.log('Pin:start resize ' + this.mLabel);
				var text = this.$el.querySelector('text.label')
				, textBox
				, oldWidth = this.mWidth;
				
				this.mWidth = 400;
				textBox = text.getBBox();
				
				if( (parseInt(text.getAttribute('x')) + textBox.width + 11) != oldWidth)
					this.mWidth = parseInt(text.getAttribute('x')) + textBox.width + 11;
				else
					this.mWidth = oldWidth;
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
			
			startLink: function(){console.log('startLink')},
			stopLink: function(){console.log('stopLink')},
			
			contextMenu: function(){console.log('Pin:context menu')},
			
			//mouseEnter: function(){console.log('mouseEnter')},
			mouseLeave: function(){console.log('mouseLeave')},
			
			Emit: function(){
				console.log('emit', this.$parent);
				this.$emit('merdeenter');
			}
		},
		
		template: "#expinTpl"
	};
	Vue.component('ex-pin', PinComponent);





</script>