<template id="linktpl">
	<line :ref="mEvent ? 'drawlink' : ''" :x1="dc1.x" :y1="dc1.y" :x2="dc2.x" :y2="dc2.y" :stroke="color" class="exLink" />
</template>
<script>

	const PinLink = {
		data: function(){
			return {
				classObject: {
					linked: false,
				},
			}
		},
				
		created: function(){
			var me = this;
			this.$on('link-start', this.startLink);
		},
		
		beforeDestroy: function(){
			this.$off('link-start', this.startLink);
		},
		
		methods: {
			mouseEnter: function(evt){
				//console.log('coucou');
			},
			
			startLink: function(evt){
				var d = {inputpin: this, event: evt, color: this.mColor}
				this.getWorksheet().addLink(d);
			}
		},
	}

	const LinkComponent = {
		mixins: [Viewport],
		
		props: {
			inputpin: {},
			outpoutpin: {},
			event: {},
			datatype: {type: String},
			color:{type: String, default: '#fff'},
		},
		
		watch: {
			
			mInputPin: {
				immediate: true,
				handler: function(){
					if(!this.mInputPin)
						return;
					console.log('watch input ', this.mInputPin);
					
					var me = this;
					this.watchers.push(this.mInputPin.getNode().$watch('mX', me.update));
					this.watchers.push(this.mInputPin.getNode().$watch('mY', me.update));
					this.dc1.x = this.mInputPin.getCenter().x;
					this.dc1.y = this.mInputPin.getCenter().y;
				}
			},
			mOutputPin: {
				immediate: true,
				handler: function(){
					if(!this.mOutputPin)
						return;
					console.log('watch output', this.mOutputPin);
					
					var me = this;
					this.watchers.push(this.mOutputPin.getNode().$watch('mX', me.update));				
					this.watchers.push(this.mOutputPin.getNode().$watch('mY', me.update));
					this.dc2.x = this.mOutputPin.getCenter().x;
					this.dc2.y = this.mOutputPin.getCenter().y;
				}
			},
			mEvent: {
				immediate: true,
				handler: function(){
					if(!this.mEvent)
						return;
					console.log('watch event');
					
					var me = this
					, rm = function(ev){
						document.removeEventListener('mousemove', me.update);
						document.removeEventListener('mouseup', rm);
					}
					document.addEventListener('mousemove', this.update);
					document.addEventListener('mouseup', rm);
					this.update(this.mEvent);
				}
			}			
		},
		
		beforeDestroy: function(){
			this.watchers.forEach(function(el){
				el.unwatch();
			});
		},
		
		data: function(){
			return {
				mInputPin: this.inputpin,
				mOutputPin: this.outputpin,
				mEvent: this.event,
				mColor: this.color,
				mDataType: this.datatype,
				point: this.getPoint(),
				dc1: {x: 0, y:0},
				dc2: {x: 0, y:0},
				dp1: {x: 0, y:0},
				dp2: {x: 0, y:0},
				watchers: [],
			}
		},
		
		methods: {
			finishLink: function(){
			
			},
			
			update: function(evt){
				if(evt instanceof MouseEvent){
					this.getPoint(evt, this.point);
					this.dc1.x = this.dc2.x = this.point.x;
					this.dc1.y = this.dc2.y = this.point.y;
				}
				if(this.mInputPin){
					this.dc1.x = this.mInputPin.getCenter().x;
					this.dc1.y = this.mInputPin.getCenter().y;
				}
				if(this.mOutputPin){
					this.dc2.x = this.mOutputPin.getCenter().x;
					this.dc2.y = this.mOutputPin.getCenter().y;
				}
			}
		},
		template: '#linktpl'
	}
	Vue.component('ex-link', LinkComponent);
</script>

<style>
	.exLink{
		stroke-width: 3;
	}