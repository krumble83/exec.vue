<template id="linktpl">
	<line :x1="tcenter.left" :y1="tcenter.top" :x2="x2" :y2="y2" style="stroke:rgb(255,0,0);stroke-width:2" />
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
				LinkComponent.data.dcenter = this.centerz;
				var l = Vue.extend(LinkComponent);
				var instance = new l();
				
				
				console.log(this.centerz);
				
				instance.tcenter = this.centerz;
				instance.$mount();
				this.getViewport().appendChild(instance.$el);
			}
		},
		
		computed: {
			centerz: function(){
				return {left: this.$parent.mX, top: this.$parent.mY};
			}
		}
	}

	const LinkComponent = {
		props: {
			x1: String,
			y1: String,
			x2: String,
			y2: String,
			tcenter: {
				type: Object,
				default: function () { return {left: 50, top: 300} }
			  },
		},
		
		data: function(){
			return {
				mInputPin: false,
				mOutputPin: false,
				mStartPin: false,
				mDataType: '',
				
				dcenter: this.tcenter
			}
		},
		
		methods: {
			createLink: function(startPin){
				this.mStartPin = startPin;
				
				if(startPin.getType() == 'input')
					this.mInputPin = startPin;
				else
					this.mOutputPin = startPin;
			},
			
			finishLink: function(endPin){
				
			}
		},
		template: '#linktpl'
	}
	
</script>