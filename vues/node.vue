<template>
	<svg
		:class="classObject"
		:id="id"
		:x="mX" 
		:y="mY" 
		:width="mWidth" 
		:height="mHeight" 
		:type="type"
		overflow="visible"
		@mousedown.left.stop="$emit('mouse:leftdown', $event)" 
		@mouseup.right="$emit('mouse:rightup', $event)" 
		@contextmenu.prevent.stop="$emit('mouse:context', $event)"
	>
		<rect width="100%" height="100%" rx="13" ry="13" class="exNodeBody" />
		
		<g class="exNodeHeader" ref="header">
			<path v-if="title && subtitle" :d="'m2,12c0,-5 5,-10 10,-10l+' + (mWidth-24) + ',0c5,0 10,5 10,10l0,30l-' + (mWidth - 4) + ',0l0,-30z'" class="exHeader" :fill="'url(#nodeHeader_' + color.replace('#', '') + ')'" />
			<path v-if="title && !subtitle" :d="'m2,11.5c0,-5 5,-10 10,-10l+' + (mWidth-24) + ',0c5,0 10,5 10,10l0,16-' + (mWidth - 4) + ',0l0,-13z'" class="exHeader" :fill="'url(#nodeHeader_' + color.replace('#', '') + ')'" />
			<image v-if="img" :href="'img/' + img" x="10" y="6" width="16" height="16" />
			<g>
				<text v-if="title" class="exNodeTitle" :x="img ? '28' : 10" y="19">{{title}}</text>
				<text v-if="subtitle" class="exNodeSubtitle" :x="img ? '28' : 10" y="34">{{subtitle}}</text>
			</g>
		</g>
		
		<g ref="inputs" class="exInputs" :transform="subtitle ? 'translate(0,50)' : title ? 'translate(0,34)' : 'translate(7,14)'">
			<slot name="inputs">
				<component v-for="(pin, idx) in inputs" :key="pin.id" 
					:is="pin.ctor ? pin.ctor : 'ex-pin'"
					:max-link="pin.maxlink ? pin.maxlink : 1"
					class="exPin"
					:ref="'input_' + pin.name"
					type="input" 
					:x="0"
					@pin-resize="$emit('pin-resize')"
					v-bind="pin"
				/>
			</slot>
		</g>
		
		<g ref="outputs" class="exOutputs" :transform="subtitle ? 'translate(0,50)' : title ? 'translate(0,34)' : 'translate(7,14)'">
			<slot name="outputs">	
				<component v-for="(pin, idx) in outputs" :key="pin.id" 
					:is="pin.ctor ? pin.ctor : 'ex-pin'" 
					:max-link="pin.maxlink ? pin.maxlink : 99"
					class="exPin"
					:ref="'output_' + pin.name"
					type="output" 
					@pin-resize="$emit('pin-resize')"
					v-bind="pin"
				/>				
			</slot>
		</g>
		<!--
		<svg class="exExtend" @mousedown.stop="" v-inline.vertical.debug="10" >
			<rect x="3" y="0" width="98%" height="15" rx="8" ry="8" ref="optional" ></rect>
			<text x="0" y="0" width="100%">↓</text>
		</svg>
		-->
	</svg>
</template>

<script>

	module.exports = {
		mixins: [SvgBase, NodeSelectable, NodeDraggable, NodeGrid, ContextMenu],
			
		props: {
			title: String, 
			subtitle: String,
			type: String,
			flags: String,
			color: {default: '#00f'},
			img: String,
			inputs: {type: Array},
			outputs: {type: Array},
			expendable: Boolean,
		},
		
		data: function() {
			return {
				classObject: {
				},
				mX: this.x,
				mY: this.y,
			}
		},
		
		watch: {
			mWidth: function(){this.$emit('node:resize');this.$worksheet.$emit('node:resize')},
			mHeight: function(){this.$emit('node:resize');this.$worksheet.$emit('node:resize')},
		},

		created: function(){
			console.log('created');
			var me = this
			, def = {
				props: {is: 'linearGradient',id: 'nodeHeader_' + this.color.replace('#', ''),x1: '0',y1: '0',x2: '1',y2: '0.4'},
				childs: [
					{props: {is: 'stop','stop-color': new Color(this.color).darker(0.1).toString(),offset: '0'}},
					{props: {is: 'stop','stop-color': this.color,offset: '0.02'}},
					{props: {is: 'stop','stop-color': new Color(this.color).darker(0.45).toString(),offset: '0.3'}},
					{props: {is: 'stop','stop-color': new Color(this.color).darker(0.4).toString(),offset: '0.7'}},
					{props: {is: 'stop','stop-color': new Color(this.color).darker(0.8).toString(),offset: '0.95'}},
					{props: {is: 'stop','stop-color': new Color(this.color).darker(0.8).toString(),offset: '1'}}				
				]
			}
			this.getWorksheet().addDef(def);
						
			var cmen = function(menu){
				//alert('')

			};
			
			this.$on('pin-resize', this.update);
			//this.$on('cmenu', this.contextMenu, {capture: true});
		},
		
		beforeDestroy: function(){
			this.$off('cmenu', this.contextMenu);
			this.$off('pin-resize', this.update);		
		},
		
		
		mounted: function(){
			console.log('mounted');
			this.update();
			//console.dir(this.$store.getters.getNode(this.id));
		},
		
		methods: {			
			update: function(){
				//console.log('Node: Start resize ' + this.mTitle);
				var oldSize = {w: this.mWidth, h: this.mHeight}
				, maxWidth = 100
				, maxHeigth = 100
				, optional = this.$refs.optional
				, headBox = this.$refs.header.querySelector('g').getBBox()
				, inputs = this.$refs.inputs
				, outputs = this.$refs.outputs
				, inputsBox
				, outputsBox;
				
				// inputs
				//inputs.setAttribute('transform', 'translate(0, ' + (headBox.y + headBox.height + 16) + ')');
				this.$forceUpdate();
				
				
				//console.log(this.$slots);
				
				//outputs
				inputsBox = inputs.getBBox();
				outputsBox = outputs.getBBox();

				outputs.setAttribute('transform', 'translate(' + (inputsBox.x + inputsBox.width + 9 + outputsBox.width) + ', ' + (headBox.y + headBox.height + 16) + ')');				
				
				//head
				maxWidth = Math.max(maxWidth, headBox.width + headBox.x + 16, inputsBox.x + inputsBox.width + 9 + outputsBox.width);
				
				if(maxWidth != oldSize.w)
					this.mWidth = maxWidth;
					
				maxHeigth = Math.max(maxHeigth, headBox.height + headBox.y + 30, headBox.height + headBox.y + 30 + inputsBox.height, headBox.height + headBox.y + 30 + outputsBox.height);
				//console.log(maxHeigth);
				/*
				if(optional){
					optional.setAttribute('y', maxHeigth-12);
					maxHeigth += 5;
				}
				*/
				this.mHeight = maxHeigth;
			},
			
			remove: function(){
				this.$emit('remove');
				this.$worksheet.$emit('node:remove');
				this.$worksheet.removeNode(this.id);
			},
			
			addInput: function(data){
				this.inputs.push(data);
			},
			
			addOutput: function(data){
				this.outputs.push(data);
			},
			
			getInput: function(name, asComponent){
				if(asComponent)
					return this.$refs['input_' + name][0];
				return this.inputs.find(pin => pin.name === name);
			},

			getOutput: function(name, asComponent){
				if(asComponent)
					return this.$refs['output_' + name][0];
				return this.outputs.find(pin => pin.name === name);
			},
			
			buildContextMenu: function(menu){
				console.log('1');
				menu.addTitle('Node');
				menu.addItem({id: 'delete', title: 'Delete', desc: 'Delete this node', callback: this.remove});
				menu.addItem({id: 'duplicate', title: 'Duplicate', desc: 'Duplicate this node', callback: function(){alert('duplicate')}});
				menu.addSeparator();
				menu.addItem({id: 'break', title: 'Break All links', callback: function(){alert('break')}});
				menu.addItem({id: 'selectall', title: 'Select All linked nodes', disabled: true, callback: function(){alert('selectall')}});
				//var s = menu.addSubMenu('Break links');
				//var s = menu.getLast();
				//s.addItem({id: 'break', title: 'Break links', callback: function(){alert('break')}});
			}
		},
	};
</script>

<style>
	.exWorksheet .exNode{
		cursor: move;
		stroke: none;
		fill: none;

		-webkit-user-select: none; /* Safari */        
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* IE10+/Edge */
		user-select: none; /* Standard */
	}

	.exWorksheet .exNode .exExtend rect {
		fill: #000;
		cursor: pointer;
		pointer-events: all;
	}

	.exWorksheet .exNode .exExtend {
		pointer-events: all;
	}
	
	.exWorksheet .exNode .exExtend rect:hover {
		fill: #555;
		cursor: pointer;
	}
	
	.exWorksheet .exNode rect.exNodeBody{
		stroke: #000;
		stroke-width:  1px;
		fill: #000;

		-webkit-user-select: none; /* Safari */        
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* IE10+/Edge */
		user-select: none; /* Standard */
	}

	.exWorksheet .exNode text.exNodeTitle{
		fill: #fff;
	}

	.exWorksheet .exNode .exHeader{
		font-family: Helvetica, Arial, sans-serif;
		font-size: 12px;
		stroke: none;
	}
	
	.exWorksheet .exNode text.exNodeSubtitle{
		fill: #999;
	}
</style>