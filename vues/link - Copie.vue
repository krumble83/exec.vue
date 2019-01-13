<template id="linktpl">
	<line :id="id" :x1="dc1.x" :y1="dc1.y" :x2="dc2.x" :y2="dc2.y" :stroke="color" :class="classObject" :datatype="datatype" />
</template>

<script>

	const PinDrawLink = {
		mixins: [WorksheetHelpers],
		
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
				, link = this.$worksheet.$refs.drawlink
				, valid
				, msg;
				
				var move = function(ev){
					me.$worksheet.showTooltip(ev, msg);
				}
				
				if(link && link[0]){
					link = link[0];

					valid = link.isPinLinkable(this);
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
				if(this.isInput())
					var d = {id: 'drawlink', inputpin: this, event: evt, color: this.color, datatype: this.datatype, ref:'drawlink'}
				else
					var d = {id: 'drawlink', outputpin: this, event: evt, color: this.color, datatype: this.datatype, ref:'drawlink'}
				
				this.$worksheet.addLink(d);
			},
			
			finishLink: function(evt){
				console.log('finish link');
				var link = this.$worksheet.$refs.drawlink;
				if(!link || !link[0])
					return;
				link[0].finishLink(this);
			}
		},
	}

	const DrawLinkComponent = {
		mixins: [WorksheetHelpers],
		inject: ['getUid'],
		
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

			inputpin: {},
			outputpin: {},
			event: {},
		},
		
		watch: {			
			mInputPin: {
				immediate: true,
				handler: function(){
					if(!this.mInputPin)
						return;
					console.log('watch input ', this.mInputPin);
					
					this.watchers.push(this.mInputPin.$node.$watch('mX', this.update));
					this.watchers.push(this.mInputPin.$node.$watch('mY', this.update));

					var d = this.$worksheet.getLink(this.id);
					this.$store.commit('changeLinkProperty', {link: this.id, props:{inputpin: this.mInputPin, input: {node: this.mInputPin.$node.id, pin: this.mInputPin.name}}});

				}
			},
			
			mOutputPin: {
				immediate: true,
				handler: function(){
					if(!this.mOutputPin)
						return;
					console.log('watch output', this.outputpin);
					
					this.watchers.push(this.mOutputPin.$node.$watch('mX', this.update));				
					this.watchers.push(this.mOutputPin.$node.$watch('mY', this.update));

					var d = this.$worksheet.getLink(this.id);
					this.$store.commit('changeLinkProperty', {link: this.id, props:{outputpin: this.mOutputPin, output: {node: this.mOutputPin.$node.id, pin: this.mOutputPin.name}}});

				}
			},
			
			mEvent: {
				immediate: true,
				handler: function(){
					if(!this.mEvent)
						return;
					//console.log('watch event');
					
					document.addEventListener('mousemove', this.update);
					document.addEventListener('mouseup', this.removeListeners);
					this.update(this.mEvent);
				}
			}			
		},
		
		beforeDestroy: function(){
			this.watchers.forEach(function(el){
				el();
			});
		},
		
		data: function(){
			return {
				classObject: {},
				mInputPin: this.inputpin,
				mOutputPin: this.outputpin,
				mEvent: this.event,
				point: this.getSvgPoint(),
				dc1: {x: 0, y:0},
				dc2: {x: 0, y:0},
				dp1: {x: 0, y:0},
				dp2: {x: 0, y:0},
				watchers: [],
			}
		},
		
		
		created: function(){
			console.log(this.input);
			
		},
		
		mounted: function(){
			var me = this;
			this.$worksheet.$once('worksheet-leftmouseup', function(evt){
				me.removeListeners();
				if(evt.defaultPrevented)
					return;

				console.log('cancel link');
				this.$store.commit('deleteLink', 'drawlink');
				evt.stopPropagation();
			});		
		},
		
		methods: {
			finishLink: function(pin){
				if(pin.isInput())
					this.mInputPin = pin;
				else if(pin.isOutput())
					this.mOutputPin = pin;
				
				var d = this.$worksheet.getLink(this.id);
				this.$store.commit('changeLinkProperty', {link: this.id, props:{id: genUid(), ref: undefined}});
				//this.$store.setters.changeLinkProperty('test', 'toto');
				
				var index = this.$worksheet.$refs.drawlink.indexOf(this);
				if (index > -1) {
				  this.$worksheet.$refs.drawlink.splice(index, 1);
				  console.log('ok');
				}		
				
				this.update();
			},
			
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
			
			update: function(evt){
				if(evt instanceof MouseEvent){
					var point = this.getMousePoint(evt, this.point);
					this.dc1.x = this.dc2.x = point.x;
					this.dc1.y = this.dc2.y = point.y;
				}
				if(this.mInputPin){
					this.dc1.x = this.mInputPin.getCenter().x;
					this.dc1.y = this.mInputPin.getCenter().y;
				}
				if(this.mOutputPin){
					this.dc2.x = this.mOutputPin.getCenter().x;
					this.dc2.y = this.mOutputPin.getCenter().y;
				}
			},
			
			removeListeners: function(){
				document.removeEventListener('mousemove', this.update);
				document.removeEventListener('mouseup', this.removeListeners);
			}
		},
		template: '#linktpl'
	}
	Vue.component('ex-link', DrawLinkComponent);
	
</script>

<style>
	.exLink{
		stroke-width: 3;
	}
</style>