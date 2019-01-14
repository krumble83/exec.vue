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
					var d = {ctor: 'ex-drawlink', id: 'drawlink', inputpin: this, event: evt, color: this.color, datatype: this.datatype, ref:'drawlink'}
				else
					var d = {ctor: 'ex-drawlink', id: 'drawlink', outputpin: this, event: evt, color: this.color, datatype: this.datatype, ref:'drawlink'}
				
				this.$worksheet.drawLink(d);
				var link = this.$worksheet.$refs.drawlink;
				this.$worksheet.$emit('worksheet-drawlink', evt, d);
				//this.$worksheet.addLink(d);
			},
			
			finishLink: function(evt){
				console.log('finish link', this.$worksheet.$refs.drawlink);
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
		
		mounted: function(){
			var me = this;
			/*
			this.$worksheet.$once('worksheet-leftmouseup', function(evt){
				me.removeListeners();
				if(evt.defaultPrevented)
					return;

				console.log('cancel link');
				evt.stopPropagation();
			});
			*/
		},

		watch: {			
			mEvent: {
				immediate: true,
				handler: function(){
					if(!this.mEvent)
						return;
					console.log('watch event--------------------------------------------');
					
					document.addEventListener('mousemove', this.updateEvent);
					document.addEventListener('mouseup', this.cancelLink, {once: true});
					
					this.updateEvent(this.mEvent);
				}
			}			
		},
		
		methods: {
			finishLink: function(pin){
				var link = this.$worksheet.drawlink;
				console.assert(link);
				
				var d = {color: link.color, datatype: link.datatype};
				if(link.inputpin){
					d.input = {node: link.inputpin.$node.id, pin: link.inputpin.name};
					d.output = {node: pin.$node.id, pin: pin.name};
				}
				else if(link.outputpin){
					d.output = {node: link.outputpin.$node.id, pin: link.outputpin.name};
					d.input = {node: pin.$node.id, pin: pin.name};
				}
				
				//TODO: check if link not allredy exixts
				
				this.$worksheet.addLink(d);
				this.remove();
			},
			
			cancelLink: function(evt){
				this.removeListeners();
				this.$emit('cancel', evt, this);
				this.$worksheet.$emit('link-cancel', evt, this);
				if(!evt.defaultPrevented)
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
				console.log('remove listeners');
				document.removeEventListener('mousemove', this.updateEvent);
				//document.removeEventListener('mouseup', this.removeListeners);
				//evt.stopPropagation();
			},
			
		},
		template: '#ex-link-tpl'
	}
	Vue.component('ex-drawlink', DrawLinkComponent);
	
</script>
