<script>

	const PinDrawLink = {
		mixins: [WorksheetHelpers],
		
		created: function(){
			var me = this;
			this.$on('mouse:leftdown', this.startLink);
			this.$on('mouse:leftup', this.finishLink);
			this.$on('mouse:enter', this.mouseLinkEnter);
			
		},
		
		beforeDestroy: function(){
			this.$off('mouse:leftdown', this.startLink);
			this.$off('mouse:leftup', this.finishLink);
			this.$off('mouse:enter', this.mouseLinkEnter);
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

				this.$once('mouse:leave', function(){
					me.$worksheet.hideTooltip();
					me.$el.removeEventListener('mousemove', move);
				});
								
				this.$worksheet.showTooltip(evt, msg);
				
			},
			
			startLink: function(evt){
				if(this.isInput())
					var d = {ctor: 'ex-drawlink', id: 'drawlink', inputpin: this, event: evt, color: this.color, datatype: this.datatype, ref:'drawlink'}
				else
					var d = {ctor: 'ex-drawlink', id: 'drawlink', outputpin: this, event: evt, color: this.color, datatype: this.datatype, ref:'drawlink'}
				
				this.$worksheet.drawLink(d);
				var link = this.$worksheet.$refs.drawlink;
				this.$worksheet.$emit('worksheet-drawlink', evt, d);
				//this.$worksheet.addLink(d);
			},
			
			finishLink: function(evt){
				//console.log('finish link', this.$worksheet.$refs.drawlink);
				var link = this.$worksheet.$refs.drawlink;
				if(!link || !link)
					return;
				link.finishLink(this);
			}
		},
	}

	const DrawLinkComponent = {
		mixins: [exlink, WorksheetHelpers],
		inject: ['getUid'],
		
		props: {
			inputpin: {},
			outputpin: {},
			event: {},
		},
		
		data: function(){
			return {
				mInputPin: this.inputpin,
				mOutputPin: this.outputpin,
				mEvent: this.event,
			}
		},
		
		watch: {			
			mEvent: {
				immediate: true,
				handler: function(){
					if(!this.mEvent)
						return;
					//console.log('watch event');
					
					document.addEventListener('mousemove', this.updateEvent);
					document.addEventListener('mouseup', this.cancel, {once: true});
					
					this.updateEvent(this.mEvent);
				}
			}			
		},
		
		methods: {
			finishLink: function(pin){
				var d = {color: this.color, datatype: this.datatype};
				
				if(this.inputpin){
					d.input = {node: this.inputpin.$node.id, pin: this.inputpin.name};
					d.output = {node: pin.$node.id, pin: pin.name};
				}
				else if(this.outputpin){
					d.output = {node: this.outputpin.$node.id, pin: this.outputpin.name};
					d.input = {node: pin.$node.id, pin: pin.name};
				}
				
				//TODO: check if link not allredy exixts
				var l = this.$worksheet.getLink(link => link.input.node == d.input.node
					&& link.input.pin == d.input.pin
					&& link.output.node == d.output.node
					&& link.output.pin == d.output.pin
				);
				if(l.length > 0){
					//alert('TODO link allready exists');
					this.cancel();
					return;
				}
				
				this.$worksheet.addLink(d);
				this.remove();
			},
			
			cancel: function(evt){
				this.removeListeners();
				if(evt){
					this.$emit('cancel', evt, this);
					this.$worksheet.$emit('link-cancel', evt, this);
					if(!evt.defaultPrevented)
						this.remove();
					return;
				}
				this.remove();
			},
			
			updateEvent: function(evt){
				console.assert(evt instanceof MouseEvent);
				var point = this.getMousePoint(evt, this.point);
				this.dc1.x = this.dc2.x = point.x;
				this.dc1.y = this.dc2.y = point.y;
				
				if(this.mInputPin){
					this.dp2.x = this.dc2.x + 200;
					this.dp2.y = this.dc2.y;					
				}
				if(this.mOutputPin){
					this.dp1.x = this.dc1.x - 200;
					this.dp1.y = this.dc1.y;
				}
				
				this.update();
			},
			
			remove: function(){
				this.removeListeners();				
				this.$worksheet.drawlink = false;
			},
			
			removeListeners: function(evt){
				//console.log('remove listeners');
				document.removeEventListener('mousemove', this.updateEvent);
				//document.removeEventListener('mouseup', this.removeListeners);
				//evt.stopPropagation();
			},
			
		},
		template: '#ex-link-tpl'
	}
	Vue.component('ex-drawlink', DrawLinkComponent);
	
</script>
