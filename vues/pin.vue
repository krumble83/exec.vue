<template id="expinTpl">
	<svg 
		:id="id"
		:class="classObject"
		:x="x" 
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
		v-inline.vertical="5"
	>
		<rect :transform="type=='output' ? 'scale(-1,1)' : ''" x="0" y="0" :width="mWidth" :height="mHeight" :fill="'url(#pinFocus' + color.replace('#', '_') + ')'" />
		<template v-if="type == 'output'">
			<circle v-if="!isarray" cx="-13" :cy="mHeight/2" r="5" :stroke="color" :fill="color" class="pin" ref="pin" />
			<rect v-if="isarray" x="-19" y="4" width="10" height="11" class="pin exArray" ref="pin" :stroke="color" stroke-width="4" :fill="'url(#pinArrayPattern' + color.replace('#', '_') + ')'" />
			<text x="19" y="14" id="zz" transform="translate(-47)" text-anchor="end" class="label" ref="label">{{label}}</text>
		</template>
		<template v-else>
			<circle v-if="!isarray" cx="13" cy="10" r="5" :stroke="color" :fill="color" class="pin" ref="pin" />
			<rect x="8" y="4" v-if="isarray" width="11" height="10" class="pin exArray" ref="pin" :stroke="color" stroke-width="4" :fill="'url(#pinArrayPattern' + color.replace('#', '_') + ')'" />
			<text x="26" y="14" class="label" ref="label">{{label}}</text>
		</template>
		<component v-if="editor && classObject.linked==false" :is="editor.ctor" class="exEditor" />
	</svg>
</template>

<script>

	const PinComponent = {
		inject: ['addSvgDef'],
		mixins: [SvgBase, PinDrawLink],
		props: {
			name: {type: String, required: true},
			height: {default: 20},
			ctor: {type: String, default: 'ex-pin'},
			label: String, 
			type: String,
			flags: Number,
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
						{props: {is: 'rect', width: 2, height: 2, x: 1, y: 1, fill: this.color}}
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
				//mName: this.name,
				//mLabel: this.label,
				//mType: this.type,
				//mColor: this.color,
				mEditor: this.editor,
				mLinkCount: 0,
			}
		},
		
		watch: {
			label: function(){
				var me = this;
					Vue.nextTick(function () {
						//me.$forceUpdate();
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
		},
		
		computed: {
			$node: function(){return this.$parent;},
			center: function(){
				var b = this.$refs.pin.getBoundingClientRect();
				return {x: b.left-3, y: b.top-3};
			},
		},
		
		methods: {
			update: function(){
				//console.log('Pin:start resize ' + this.mLabel);
				var me = this
				, text = this.$refs.label
				, oldWidth = this.mWidth
				, textBox
				, width
				
				this.$el.querySelector('rect').setAttribute('opacity', 0);
				
				this.mWidth = this.$el.getBBox().width;
				this.mHeight = this.$el.getBBox().height;
				this.$el.querySelector('rect').setAttribute('opacity', 1);
				this.$parent.update();
				this.$forceUpdate();


				/*
				this.mWidth = 400;
				textBox = text.getBBox();
				
				width = parseInt(text.getAttribute('x')) + textBox.width + 11;
				
				if( (width) != oldWidth){
					this.mWidth = width;
					this.$nextTick(function(){
						me.$emit('pin-resize');
					});
				}
				else
					this.mWidth = oldWidth;
				*/
			},
			
			getCenter: function(){
				var b = this.$refs.pin.getBoundingClientRect()
				, p = this.getSvgPoint(b.left+6, b.top+6);
				
				return p.matrixTransform(this.getViewportEl().getScreenCTM().inverse());

			},

			isInput: function(){
				return this.type == 'input';
			},
			
			isOutput: function(){
				return this.type == 'output';			
			},
			
			addLink: function(link){
				var me = this;
				me.classObject.linked = true;
				me.mLinkCount++;
				link.$once('remove', function(){
					me.mLinkCount--;
					if(me.mLinkCount == 0)
						me.classObject.linked = false;
				});
			},
			
			acceptLink: function(link){
				return 0;
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
		stroke-width: 3;
		pointer-events : none;
		fill-opacity: 0;
	}

	.exWorksheet .exNode .exPin.linked circle.pin{
		fill-opacity: 1;
	}
	
	.exWorksheet .exNode .exPin rect.pin.exArray{
		stroke-width: 3;
		stroke-dasharray: 3,2.1;
		pointer-events : none;
	}

	.exWorksheet .exNode .exPin.linked rect.pin.exArray{
		fill-opacity: 1;
	}

	
	.exWorksheet .exNode .exPin text.label{
		stroke-width: 0;
		font-size: 16px;
		fill: #fff;
		pointer-events : none;
	}
</style>
