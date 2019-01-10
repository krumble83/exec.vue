<template id="linktpl">
	<line :ref="mEvent ? 'drawlink' : ''" :x1="dc1.x" :y1="dc1.y" :x2="dc2.x" :y2="dc2.y" style="stroke:rgb(255,0,0);stroke-width:2" class="exLink" />
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
			this.$on('link-start', function(evt){
				me.startLink(evt);
			});
		},
		
		methods: {
			mouseEnter: function(evt){
				//console.log('coucou');
			},
			
			startLink: function(evt){
				var me = this;
				var d = {inputpin: this, event: evt}
				this.getWorksheet().addLink(d);
				console.log(evt);
				//d.x1=750;
				/*
				LinkComponent.data.dcenter = this.centerz;
				var l = Vue.extend(LinkComponent);
				var instance = new l();
				
				this.$parent.$watch('mX', function(){
					me.dcenter.left = me.$el.getBoundingClientRect().left;
					console.log('move');
				});
				
				instance.dcenter = this.centerz;
				instance.$mount();
				this.getViewportEl().appendChild(instance.$el);
				*/
			}
		},
		
		computed: {
			centerz: function(){
				return {left: this.$parent.x, top: this.$parent.y};
			}
		}
	}

	const LinkComponent = {
		mixins: [Viewport],
		
		props: {
			x1: Number,
			y1: Number,
			x2: Number,
			y2: Number,
			inputpin: {},
			outpoutpin: {},
			event: {},
		},
		
		mounted: function(){
			var me = this;
			if(this.mInputPin){
			

				if(this.mEvent){
					this.getPoint(this.mEvent, this.point);
					this.dc2.x = this.point.x;
					this.dc2.y = this.point.y;
					
					var mv = function(ev){
						me.getPoint(ev, me.point);
						me.dc2.x = me.point.x;
						me.dc2.y = me.point.y;
					}
					
					var rm = function(ev){
						document.removeEventListener('mousemove', mv);
						document.removeEventListener('mouseup', rm);
					}
					document.addEventListener('mousemove', mv);
					document.addEventListener('mouseup', rm);
				}
			}
		},
		
		
		watch: {
			mInputPin: {
				immediate: true,
				handler: function(){
					if(!this.mInputPin)
						return;
					console.log('watch input ', this.mInputPin);
					
					var me = this;
					this.mInputPin.getNode().$watch('mX', me.update);				
					this.mInputPin.getNode().$watch('mY', me.update);
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
					this.mOutputPin.getNode().$watch('mX', me.update);				
					this.mOutputPin.getNode().$watch('mY', me.update);
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
					
					var me = this;				
					
					var mv = function(ev){
						me.getPoint(ev, me.point);
						if(me.mInputPin){
							me.dc2.x = me.point.x;
							me.dc2.y = me.point.y;
						}
						else if(me.mOutputPin){
							me.dc1.x = me.point.x;
							me.dc1.y = me.point.y;
						}
					}
					
					var rm = function(ev){
						document.removeEventListener('mousemove', mv);
						document.removeEventListener('mouseup', rm);
					}
					document.addEventListener('mousemove', mv);
					document.addEventListener('mouseup', rm);
				}
			}			
		},
		
		beforeDestroy: function(){
			// TODO: remove watchers
		},
		
		data: function(){
			return {
				mInputPin: this.inputpin,
				mOutputPin: this.outputpin,
				mEvent: this.event,
				mDataType: '',
				point: this.getPoint(),
				dc1: {x: 0, y:0},
				dc2: {x: 0, y:0},
			}
		},
		
		computed: {
		
			c1: {
				get: function(){
					console.log('c1', this.point);
					if(this.mInputPin)
						return this.mInputPin.getCenter();
					else if(this.mEvent){
						this.getPoint(this.mEvent, this.point); //{x: this.mEvent.clientX, y: this.mEvent.clientY};
						return this.point;
					}			
				},
				set: function(evt){
					
				},
			},
			
			c2: function(){
				if(this.mOutputPin)
					return this.mOutputPin.getCenter();
				else if(this.mEvent){
					this.getPoint(this.mEvent, this.point); //{x: this.mEvent.clientX, y: this.mEvent.clientY};
					return this.point;
				}
			},
		},
		
		methods: {
			startLink: function(startPin, evt){
				this.mInputPin = startPin;
			},
			
			getC1: function(){
			},
			
			finishLink: function(){
			
			},
			
			update: function(){
				if(this.mInputPin){
					this.dc1.x = this.mInputPin.getCenter().x;
					this.dc1.y = this.mInputPin.getCenter().y;
				}
			}
		},
		template: '#linktpl'
	}
	Vue.component('ex-link', LinkComponent);
</script>