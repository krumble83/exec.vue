<template id="expinTpl">
	<svg 
		:id="mId"
		:class="classObject"
		:x="mX" 
		:y="mY" 
		:width="mWidth" 
		:height="mHeight"
		:group="group"
		@mousedown.left.stop="$emit('link-start', $event)"
		@mouseup.left.stop="$emit('link-finish')"
		@mouseenter="$emit('pin-mouseenter', $event)"
		@mouseleave="$emit('pin-mouseleave', $event)"
		@contextmenu.stop.prevent="contextMenu"
		:overflow="mType=='output' ? 'visible' : ''"
	>
		<rect :transform="mType=='output' ? 'scale(-1,1)' : ''" x="0" y="0" :width="mWidth" :height="mHeight" :fill="'url(#pinFocus_' + mColor.replace('#', '') + ')'" />
		<template v-if="type == 'input'">
			<circle v-if="!isarray" cx="13" :cy="mHeight/2" r="5" :stroke="mColor" class="pin" ref="pin" />
			<image x="6" y="3" v-if="isarray" width="13" height="13" class="pin exArray" ref="pin" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAIAAAAmzuBxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAdSURBVChTY/z//z8DAwMjI04GExBTCkZtQQYMDACLJDABlbRJGwAAAABJRU5ErkJggg==" />
			<!--<rect x="5" y="5" v-if="isarray" width="11" height="10" class="pin exArray" ref="pin" :stroke="mColor" stroke-width="4" :fill="'url(#pinArrayPattern' + color.replace('#', '_') + ')'" />-->
			<text x="26" y="14" class="label" ref="label">{{label}}</text>
		</template>
		<template v-else>
			<circle v-if="!isarray" cx="-13" :cy="mHeight/2" r="5" :stroke="mColor" class="pin" ref="pin" />
			<image x="-20" y="3" v-if="isarray" width="13" height="13" class="pin exArray" ref="pin" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAIAAAAmzuBxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAdSURBVChTY/z//z8DAwMjI04GExBTCkZtQQYMDACLJDABlbRJGwAAAABJRU5ErkJggg==" />
			<!--<rect x="-19" y="5" v-if="isarray" width="11" height="11" class="pin exArray" ref="pin" :stroke="mColor" stroke-width="4" :fill="'url(#pinArrayPattern' + color.replace('#', '_') + ')'" />-->
			<text x="19" y="14" transform="translate(-47)" text-anchor="end" class="label" ref="label">{{label}}</text>
		</template>
		<component v-if="mEditor && classObject.linked==false" 
			:is="mEditor.ctor"
			
		/>
	</svg>
</template>

<script>

	const PinComponent = {
		inject: ['addSvgDef'],
		mixins: [SvgBase, PinLink, PinForeignEditor],
		props: {
			name: {type: String, required: true},
			height: {default: 20},
			ctor: {type: String, default: 'ex-pin'},
			label: String, 
			type: String,
			flags: String,
			color: {default: '#00f', required: true},
			datatype: {type: String, required: true},
			'max-link': Number,
			
			optionnal: Boolean,
			isarray: Boolean,
			group: {type: String, default:''},
			editor: false,
		},
		
		created: function(){
			var me = this
			, def = {
				props: {is: 'linearGradient',id: 'pinFocus_' + this.color.replace('#', '')},
				childs: [{props : {is: 'stop','stop-color': this.color,'stop-opacity': '0.01',offset: '0.1'}},
					{props: {is: 'stop','stop-color': this.color,'stop-opacity': '0.4',offset: '0.3'}},
					{props: {is: 'stop','stop-color': this.color,'stop-opacity': '0.01',offset: '1'}}
				]
			};
			this.$worksheet.addDef(def);
			
			if(this.isarray){
				def = {
					props: {is: 'pattern', id: 'pinArrayPattern_' + this.color.replace('#', ''), x: 0, y: 0, width: 11, height: 11, patternUnits: 'userSpaceOnUse'},
					childs: [
						{props: {is: 'rect', width: 2, height: 2, x: 2, y: 2, fill: this.color}}
					]
				};
				this.$worksheet.addDef(def);
			}
		},
		
		data: function() {
			return {
				classObject: {
					linkable: true,
					linked: false,
				},
				mName: this.name,
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
			
			editor: function(){
				var me = this;
					Vue.nextTick(function () {
						me.update();
					})
			},
		},
		
		mounted: function(){
			this.update();
			console.log(this.$root);
		},
		
		computed: {
			$node: function(){return this.$parent;},
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

	.exWorksheet .exNode .exPin image.pin.exArray{
		pointer-events : none;
	}
	
	.exWorksheet .exNode .exPin text.label{
		stroke-width: 0;
		font-size: 16px;
		fill: #fff;
		pointer-events : none;
	}
</style>