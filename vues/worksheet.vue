<template id="worksheetTpl">
	<svg 
		style="width:100%;height:100%" 
		:class="classObject" 
		xmlns="http://www.w3.org/2000/svg" 
		ref="worksheet" 
		@mousemove="setFocus(true)"
		@mouseout="setFocus(false)"
		@contextmenu.prevent.stop="onContextMenu($event)" 
		@mousedown.right="onRightButtonDown($event)"
		@mousedown.left.stop="onLeftMouseDown($event)"
		@keyup.enter="onRightButtonDown"
	>
		<defs>
			<template v-for="(def, idx) in defs">
				<component v-bind="def.props">
					<component v-for="(subdef, idx) in def.childs" v-bind="subdef.props" />
				</component>
			</template>
			<slot name="defs" />
		</defs>

		<slot />

		<rect width="100%" height="100%" class="background" />
		<g class="exViewport">
			<rect width="100000" height="100000" transform="translate(-50000,-50000)" :fill="'url(#' + gridId + ')'" />
			<g class="exNodes">
				<component v-for="node in nodes"
					:is="node.ctor ? node.ctor : 'ex-node'" 
					class="exNode"
					:id="node.id"
					:x.sync="node.x"
					:y.sync="node.y"
					:width="node.width"
					:height="node.height"
					:title.sync="node.title"
					:subtitle="node.subtitle"
					:type="node.type"
					:flags="node.flags"
					:color="node.color"
					:img="node.img"
					:inputs="node.inputs"
					:outputs="node.outputs"
				/>
				<slot name="nodes" />
			</g>
			<g class="exLinks">
				<slot name="links" />
			</g>
			<g class="exSelection">
				<slot name="selection" />
			</g>
			<slot name="exViewport" />
			<template v-for="(child, index) in workspace">
				<component :is="child" :key="child.name"
					:x="child.x" :y="child.y"
				/>
			</template>
		</g>
		<ex-tooltip />
		<slot name="front" />
	</svg>
</template>
	
<script>

	var worksheetComponent = {
		mixins: [WorksheetGrid, WorksheetSelection],
		inject: ['getUid'],
		
		data: function(){
			return {
				classObject: {
					focus: true,
				},
				defs: [],
				nodes: [],
				links: [],
				selection: [],
				workspace: [],
			}
		},
		
		props: {
			id: String,
			cls: String,
		},
		
		methods: {
			addNode: function(data){
				//console.log(this._provided);

				if(typeof data.id !== 'String')
					data.id = this.getUid();

				if(data.inputs){
					Array.from(data.inputs).forEach(function (el, i) {
						data.inputs[i].type = 'input';
					});
				}
				if(data.outputs){
					Array.from(data.outputs).forEach(function (el, i) {
						data.outputs[i].type = 'output';
					});
				}
				this.nodes.push(data);
			},
			
			addLink: function(startPin, evt){
				this.links.push({
					starPin: startPin,
					startEvt: evt,
				});
			},
			
			addDef: function(data){
				var me = this;
				
				
				if(Array.isArray(data)){
					data.forEach(function(el){
						me.addDef(el);
					});
					return;
				}
				//console.log(this.defs);
				if(data.id) {
					var found = false;
					this.defs.foreach(function(elem){
						console.log(elem.id, data.id);
						if(elem.id == data.id)
							found = true;
					});
					if(found)
						return data.id;
				}
				else
					data.id = this.getUid();
				
				this.defs.push(data);
				return data.id;
			},
			
			getWorksheet: function(){
				return this;
			},
			
			getViewport: function(){
				return this.$el.querySelector(".svg-pan-zoom_viewport");
			},
			
			getSvg: function(){
				return this.$el;
			},

			getSvgCoord: function(evt, point){
				
			},
			
			setFocus: function(focus){
				return;
				if(focus){
					this.classObject.focus = true;
					this.$el.focus();
				} else {
					this.classObject.focus = false;
					this.$el.blur();				
				}
			},
			
			onContextMenu: function(evt){
				console.log('worksheet:onContextMenu');
				this.$eventBus.$emit('worksheet.contextmenu', this, evt);
				if(evt.defaultPrevented)
					return;
				this.$emit('worksheet.contextmenu', evt);
			},
			
			onRightButtonDown: function(evt){
				console.log('worksheet:onRightButtonDown');
				this.$eventBus.$emit('worksheet.rightbuttondown', this, evt);
				if(evt.defaultPrevented)
					return;
				this.$emit('worksheet.rightbuttondown', evt);
			},
			
			onRightButtonUp: function(evt){
				console.log('worksheet:onRightButtonUp');
				this.$eventBus.$emit('worksheet.rightbuttonup', this, evt);
				if(evt.defaultPrevented)
					return;
				this.$emit('worksheet.rightbuttonup', evt);
			},
			
			onLeftMouseDown: function(evt){
				console.log('worksheet:onLeftButtonDown');
				this.$eventBus.$emit('worksheet.leftmousedown', this, evt);
				this.$emit('worksheet.leftmousedown', evt);
				if(evt.defaultPrevented)
					return;
			}
		},

		provide: {
			getSvgMousePosition(evt) {
				var CTM = this.$el.getScreenCTM();
				return {
					x: (evt.clientX - CTM.e) / CTM.a,
					y: (evt.clientY - CTM.f) / CTM.d
				};
			},
			addSvgDef: function(data){this.addDef(data)},
		},
		

		template: '#worksheetTpl'
	};
	Vue.component('ex-worksheet', worksheetComponent);


	var titlebarButtonComponent = {
	  inject: ['getTitleButtonPos'],
	  
	  data: function(){
		  return {
		  }
	  },
	  
	  props: {
	  },
	  
	  methods: {
		test: function(){alert('t')},
	  },
	  
	  template: '#titlebarButtonTpl'	
	};
	Vue.component('ex-titlebarbutton', titlebarButtonComponent);


	var titleBarComponent = {
		inject: ['getUid'],

		mixins: [SvgBase],
		
		provide: {
			getTitleButtonPos: function(){return Math.floor(Math.random() * Math.floor(500));}
		},
	  
		data: function(){
			return {
				mTitle: this.title,
			}
		},
	  
		components: {
			'ex-titlebarbutton' : titlebarButtonComponent
		},
	  
		props: {
			title: {type: String, default: function(){return this.getUid()} }, 
		},
	  
		methods: {
			setTitle: function(str){this.$data._title = str;}
		},
	  
		template: '#titlebarTpl'	
	};
	Vue.component('ex-titlebar', titleBarComponent);

</script>

<style>
	.exWorksheet{
		-webkit-user-select: none; /* Safari */        
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* IE10+/Edge */
		user-select: none; /* Standard */	
		border: 3px solid #000;
		opacity: 0.9;
	}

	.exWorksheet .background{
		fill: #262626;
	}

	.exWorksheet.focus {
		border: 3px solid #00f;
		opacity: 1;
	}
</style>