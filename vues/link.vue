<template>
	<path :id="id" :stroke="color" :d="'M' + dc1.x + ',' + dc1.y + ' C' + (dp1.x) + ',' + dp1.y + ' ' + (dp2.x) + ',' + dp2.y + ' ' + dc2.x + ',' + dc2.y" fill="none" @mousedown.stop="remove" />
	<!--<line :id="id" :x1="dc1.x" :y1="dc1.y" :x2="dc2.x" :y2="dc2.y" :stroke="color" :class="classObject" :datatype="datatype" />-->
</template>

<script>

	module.exports = {
		mixins: [WorksheetHelpers],
		props: {
			id: {type: String, default: genUid()},
			datatype: {type: String, default: 'totoType'},
			color:{type: String, default: '#fff'},
			input: {
				node: String,
				pin: String
			},
			output: {
				node: String,
				pin: String
			},
		},
		
		watch: {			
			mInputPin: {
				immediate: true,
				handler: function(val, old){
					if(!val)
						return;
					console.log('watch input ', val, old);
					
					this.watchers.input.push(val.$node.$watch('mX', this.update));
					this.watchers.input.push(val.$node.$watch('mY', this.update));
					val.$node.$once('remove', this.remove);
					if(old){
						this.watchers.input.forEach(function(el){
							el();
						});
						old.$node.$off('remove', this.remove);
					}
				}
			},
			
			mOutputPin: {
				immediate: true,
				handler: function(val, old){
					if(!val)
						return;
					console.log('watch output', this.mOutputPin);
					
					this.watchers.output.push(val.$node.$watch('mX', this.update));
					this.watchers.output.push(val.$node.$watch('mY', this.update));
					val.$node.$once('remove', this.remove);
					if(old){
						this.watchers.output.forEach(function(el){
							el();
						});
						old.$node.$off('remove', this.remove);
					}
				}
			},
		},
		
		mounted: function(){
			if(this.input){
				var n = this.$worksheet.getNode(this.input.node);
				console.assert(n);
				var p = n.getInput(this.input.pin, true);
				console.assert(p);
				this.mInputPin = p;
			}
			if(this.output){
				var n = this.$worksheet.getNode(this.output.node);
				console.assert(n);
				var p = n.getOutput(this.output.pin, true);
				console.assert(p);
				this.mOutputPin = p;
			}
			if(this.mInputPin && this.mOutputPin){
				this.mInputPin.addLink(this);
				this.mOutputPin.addLink(this);
			}
			this.update();
		},
		
		beforeDestroy: function(){
			this.$worksheet.startSequence();
			this.$emit('remove');
			//this.$worksheet.$emit('link:remove', this);
			this.watchers.input.forEach(function(el){
				el();
			});
			this.watchers.output.forEach(function(el){
				el();
			});

			if(this.mInputPin)
				this.mInputPin.$node.$off('remove', this.remove);
			if(this.mOutputPin)
				this.mOutputPin.$node.$off('remove', this.remove);
			this.$worksheet.stopSequence();
		},
		
		data: function(){
			return {
				classObject: {},
				mInputPin: false,
				mOutputPin: false,
				dc1: {x: 0, y:0},
				dc2: {x: 0, y:0},
				dp1: {x: 0, y:0},
				dp2: {x: 0, y:0},
				watchers: {input: [], output: []},
			}
		},
						
		methods: {
			
			isPinLinkable: function(pin){
				var ret = {code: 0, label: '<img src="img/linkok.png"> Place a new Link'};
				var oPin = (this.mInputPin) ? this.mInputPin : this.mOutputPin;
				
				if(oPin.isarray !== pin.isarray) // ARRAY WITH NON-ARRAY
					ret = {code: ret.code + 32, label: '<div><img src="img/none.png"> Pins are not same type (Array vs Non-Array)' + ' (' + (ret.code + 32) + ')'};

				if(oPin.datatype != pin.datatype) // WRONG DATATYPE
					ret = {code: ret.code + 16, label: '<div><img src="img/none.png"> Wrong datatype (' + pin.datatype + ' vs ' + oPin.datatype + ')' + ' (' + (ret.code + 16) + ')'};
				
				if(oPin.type == pin.type) // SAME PIN TYPE
					ret = {code: ret.code + 8, label: '<div><img src="img/none.png"> Pins are same type (inputs or outputs)' + ' (' + (ret.code + 8) + ')'};
				
				if(oPin.$node == pin.$node) // SAME NODE
					ret = {code: ret.code + 4, label: '<div><img src="img/none.png"> Can\'t link pins on same node' + ' (' + (ret.code + 4) + ')'};
				
				if(oPin == pin) // SAME PIN
					ret = {code: ret.code + 2, label: '<div><img src="img/none.png"> Same Pin' + ' (' + (ret.code + 2) + ')'};
					
				if(!oPin.classObject.linkable) // PIN NOT LINKABLE
					ret = {code: ret.code + 1, label: '<div><img src="img/none.png"> Pin is not linkable' + ' (' + (ret.code + 1) + ')'};

				return ret;
			},
			
			update: function(){
				if(this.mInputPin){
					this.dc1.x = this.mInputPin.getCenter().x;
					this.dc1.y = this.mInputPin.getCenter().y;
					this.dp1.x = this.dc1.x - 200;
					this.dp1.y = this.dc1.y;
				}
				if(this.mOutputPin){
					this.dc2.x = this.mOutputPin.getCenter().x;
					this.dc2.y = this.mOutputPin.getCenter().y;
					this.dp2.x = this.dc2.x + 200;
					this.dp2.y = this.dc2.y;
				}
				this.updateIntermediatePoints();
			},
			
			updateIntermediatePoints: function(){
				if(this.mInputPin){
					this.dp1.x = this.dc1.x - 200;
					this.dp1.y = this.dc1.y;
				}
				if(this.mOutputPin){
					this.dp2.x = this.dc2.x + 200;
					this.dp2.y = this.dc2.y;
				}
			
			},
			
			remove: function(){
				console.log('remove');
				this.$worksheet.removeLink(this.id);
			}
		},
		//template: '#linktpl'
	}
	//Vue.component('ex-link', LinkComponent);
	
</script>

<style>
	.exLink{
		stroke-width: 3;
		pointer-events: all;
	}
</style>