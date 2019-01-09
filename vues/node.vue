<template id="exnodeTpl">
	<svg
		:class="classObject"
		:id="mId"
		:x.sync="mX" 
		:y.sync="mY" 
		:width="mWidth" 
		:height="mWidth" 
		:type="type"
		inputs=""
		outputs=""
		@mousedown.left.stop="leftMouseDown($event)" 
		@contextmenu.prevent.stop="contextMenu($event)"
	>
		<rect width="100%" height="100%" rx="15" ry="15" class="exNodeBody" />
		
		<g class="exNodeHeader">
			<path v-if="mTitle && mSubtitle" :d="'m1.5,11.5c0,-5 5,-10 10,-10l+' + (mWidth-23) + ',0c5,0 10,5 10,10l0,30l-' + (mWidth - 3) + ',0l0,-30z'" class="exHeader" :fill="'url(#nodeHeader_' + mColor.replace('#', '') + ')'" />
			<path v-if="mTitle && !mSubtitle" :d="'m1.5,11.5c0,-5 5,-10 10,-10l+' + (mWidth-23) + ',0c5,0 10,5 10,10l0,16-' + (mWidth - 3) + ',0l0,-13z'" class="exHeader" :fill="'url(#nodeHeader_' + mColor.replace('#', '') + ')'" />
			<image v-if="img" :href="img" x="10" y="6" width="16" height="16" />
			<text v-if="title" class="exNodeTitle" :x="img ? '28' : 10" y="18">{{mTitle}}</text>
			<text v-if="subtitle" class="exNodeSubtitle" :x="img ? '28' : 10" y="34">{{mSubtitle}}</text>
		</g>
		
		<g class="exInputs" :transform="mSubtitle ? 'translate(7,50)' : mTitle ? 'translate(7,34)' : 'translate(7,14)'">
			<component v-for="(pin, idx) in mInputs" :key="pin.id" 
				:is="pin.ctor ? pin.ctor : 'ex-pin'" 
				slot="inputs" 
				:class="pin.class"
				:label="pin.label"
				:type="pin.type"
				:x="0"
				:y="idx*24" 
				:width="pin.width"
				:height="pin.height"
				:color="pin.color"
			/>
			<slot name="inputs" />
		</g>
		
		<g class="exOutputs" :transform="mSubtitle ? 'translate(7,50)' : mTitle ? 'translate(7,34)' : 'translate(7,14)'">
			<component v-for="(pin, idx) in mOutputs" :key="pin.id" 
				:is="pin.ctor ? pin.ctor : 'ex-pin'" 
				slot="inputs" 
				:class="pin.class"
				:label="pin.label"
				:type="pin.type"
				:x="pin.x"
				:y="idx*24" 
				:width="pin.width"
				:height="pin.height"
				:color="pin.color"
			/>				
			<slot name="outputs" />
		</g>
	</svg>
</template>

<script>



	const NodeComponent = {
		mixins: [SvgBase, NodeDraggable, NodeSelectable],
			
		props: {
			title: String, 
			subtitle: String,
			type: String,
			flags: String,
			color: {default: '#00f'},
			img: String,
			inputs: {type: Array},
			outputs: {},
		},
		
		data () {
			//console.log(this.color);
			var me = this
			, def = {
				props: {
					is: 'linearGradient',
					id: 'nodeHeader_' + this.color.replace('#', ''),
					x1: '0',
					y1: '0',
					x2: '1',
					y2: '0.4'
				},
				childs: [{
					props : {
						is: 'stop',
						'stop-color': new Color(this.color).darker(0.1).toString(),
						offset: '0'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': this.color,
						offset: '0.02'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': new Color(this.color).darker(0.45).toString(),
						offset: '0.3'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': new Color(this.color).darker(0.4).toString(),
						offset: '0.7'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': new Color(this.color).darker(0.8).toString(),
						offset: '0.95'
					}
				},
				{
					props: {
						is: 'stop',
						'stop-color': new Color(this.color).darker(0.8).toString(),
						offset: '1'
					}
				},
				
				]
			}
			this.$parent.addDef(def);
			
			//console.log(this.inputs);
			return {
				mTitle: this.title,
				mSubtitle: this.subtitle,
				mType: this.type || '',
				mFlags: this.flags,
				mColor: this.color,
				mImg: this.img,
				mInputs: this.inputs,
				mOutputs: this.outputs,
			}
		},
		
		watch: {
			mWidth: function(){this.$emit('resize')},
			mHeight: function(){this.$emit('resize')},

			mTitle: function(){this.update()},
			mSubtitle: function(){this.update()},
			mInputs: function(){this.update()},
			mOutputs: function(){this.update()},
		},
		
		updated: function(){
		},

		created: function(){
			this.$on('pin.resize', function(){
				console.log('rtrtrt');
			});
		},
		
		mounted: function(){
			this.update();
		},
		
		methods: {
			
			updatez: function(){console.log('resize11111')},
			
			update: function(){
				//console.log('Node: Start resize ' + this.mTitle);
				var oldSize = {w: this.mWidth, h: this.mHeight}
				, maxWidth = 100
				, headBox = this.$el.querySelector('g.exNodeHeader').getBBox()
				, inputs = this.$el.querySelector('g.exInputs')
				, outputs = this.$el.querySelector('g.exOutputs')
				, inputsBox
				, outputsBox;
				
				// inputs
				inputs.setAttribute('transform', 'translate(0, ' + (headBox.y + headBox.height + 10) + ')');
				
				//outputs
				inputsBox = inputs.getBBox();
				outputsBox = outputs.getBBox();

				outputs.setAttribute('transform', 'translate(' + (inputsBox.x + inputsBox.width + 9 + outputsBox.width) + ', ' + (headBox.y + headBox.height + 10) + ')');
				
				//head
				maxWidth = Math.max(maxWidth, headBox.width + headBox.x + 20, inputsBox.x + inputsBox.width + 9 + outputsBox.width);
				
				if(maxWidth != oldSize.w){
					this.mWidth = maxWidth;
					//this.$emit('resize');
				}
				console.log(inputsBox, outputsBox);
			},
			
			addInput: function(data){
				this.mInputs.push(data);
			},
			
			contextMenu: function(){console.log('Node:Context menu');},
			
			leftMouseDown: function(evt){
				this.$eventBus.$emit('node.leftmousedown', this, evt);
				this.$emit('node.leftmousedown', evt);
			}
		},
		
		template: "#exnodeTpl"
	};
	Vue.component('ex-node', NodeComponent);
</script>
