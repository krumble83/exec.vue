<template id="linktpl">
	<line :id="id" :ref="mEvent ? 'drawlink' : ''" :x1="dc1.x" :y1="dc1.y" :x2="dc2.x" :y2="dc2.y" :stroke="color" :class="classObject" />
</template>
<script>

	const PinLink = {
		mixins: [WorksheetHelpers],
		props: {
			
		},
		
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
			this.$on('link-finish', this.finishLink);
			this.$on('pin-mouseenter', this.mouseLinkEnter);
		},
		
		beforeDestroy: function(){
			this.$off('link-start', this.startLink);
			this.$off('link-finish', this.finishLink);
			this.$off('pin-mouseenter', this.mouseLinkEnter);
		},
		
		methods: {

			mouseLinkEnter: function(evt){				
				var me = this
				, valid
				, msg
				, l = this.$worksheet.$el.querySelector('#drawlink');
				
				var move = function(ev){
					me.$worksheet.showTooltip(ev, msg);
				}
				
				if(l){
					l = l.__vue__;

					valid = l.isPinLinkable(this);
					if(valid.code === 0){					
						this.$emit('link-valid');
						msg = valid.label;
					}
					else {
						this.$emit('link-invalid', valid);
						msg = valid.label;
					}
				}
				else 
					msg = 'pin desc';
					
				this.$worksheet.showTooltip(evt, msg);
				
				this.$el.addEventListener('mousemove', move, false);

				this.$once('pin-mouseleave', function(){
					me.$worksheet.hideTooltip();
					me.$el.removeEventListener('mousemove', move);
				});
				
				
				this.$worksheet.showTooltip(evt, msg);
				
			},
			
			startLink: function(evt){
				var d = {id: 'drawlink', inputpin: this, event: evt, color: this.mColor}
				this.getWorksheet().addLink(d);
				
			},
			
			finishLink: function(evt){
				console.log('finish link');
			}
		},
	}

	const LinkComponent = {
		mixins: [WorksheetHelpers],
		inject: ['getUid'],
		
		props: {
			id: {type: String, default: genUid()},
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
					//console.log('watch input ', this.mInputPin);
					
					var me = this;
					this.watchers.push(this.mInputPin.$node.$watch('mX', me.update));
					this.watchers.push(this.mInputPin.$node.$watch('mY', me.update));
					this.dc1.x = this.mInputPin.getCenter().x;
					this.dc1.y = this.mInputPin.getCenter().y;
				}
			},
			mOutputPin: {
				immediate: true,
				handler: function(){
					if(!this.mOutputPin)
						return;
					//console.log('watch output', this.mOutputPin);
					
					var me = this;
					this.watchers.push(this.mOutputPin.$node.$watch('mX', me.update));				
					this.watchers.push(this.mOutputPin.$node.$watch('mY', me.update));
					this.dc2.x = this.mOutputPin.getCenter().x;
					this.dc2.y = this.mOutputPin.getCenter().y;
				}
			},
			mEvent: {
				immediate: true,
				handler: function(){
					if(!this.mEvent)
						return;
					//console.log('watch event');
					
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
				//el.unwatch();
			});
		},
		
		data: function(){
			return {
				classObject: {
					
				},
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
		
		mounted: function(){
			this.$worksheet.$once('worksheet-rightmouseup', function(evt){
				console.log('cancel link');
				this.$store.commit('deleteLink', 'drawlink');
				evt.stopPropagation();
			});		
		},
		
		methods: {
			finishLink: function(){
			
			},
			
			isPinLinkable: function(pin){
				var ret = {code: 0, label: '<img src="img/linkok.png"> Place a new Link'};
				var oPin = (this.mInputPin) ? this.mInputPin : this.mOutputPin;
				
				console.log(oPin.type, pin.type);
				if(1 == 2) // WRONG DATATYPE
					ret.code += 8;
				
				if(oPin.type == pin.type) // SAME PIN TYPE
					ret.code += 4;
				
				if(oPin.$node == pin.$node) // SAME NODE
					ret.code += 2;
				
				if(oPin == pin) // SAME PIN
					ret.code += 1;
					
				if(ret.code > 0)
					ret.label = '<div><img src="img/none.png"> (' + ret.code + ')';
				return ret;
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