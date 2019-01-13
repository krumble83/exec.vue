<template id="worksheetTpl">
	<svg 
		style="width:100%;height:100%" 
		:class="classObject" 
		xmlns="http://www.w3.org/2000/svg" 
		ref="worksheet" 
		@mousedown="setFocus(true)"
		@contextmenu.prevent.stop="onContextMenu($event)" 
		@mousedown.right="onRightButtonDown($event)"
		@mousedown.left.stop="onLeftMouseDown($event)"
		@mouseup.left="$emit('worksheet-leftmouseup', $event)"
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
		<g class="exViewport" ref="viewport">
			<rect width="100000" height="100000" transform="translate(-50000,-50000)" :fill="'url(#' + gridId + ')'" />
			<g class="exLinks" ref="links">
				<component v-for="link in links"
					:is="link.ctor ? link.ctor : 'ex-link'"
					:id="link.id"
					ref="links"
					:class="link.class"
					class="exLink"
					:event="link.event"
					:input="link.input"
					:output="link.output"
					:datatype="link.datatype || 'test'"
					:color="link.color"
				/>
				<component v-if="drawlink" 
					:is="drawlink.ctor ? drawlink.ctor : 'ex-link'"
					:id="drawlink.id"
					:class="drawlink.class"
					class="exLink"
					:event="drawlink.event"
					:inputpin="drawlink.inputpin"
					:outputpin="drawlink.outputpin"
					:datatype="drawlink.datatype || 'test'"
					:color="drawlink.color"
					:ref="drawlink.ref"
				/>
				<slot name="links" />
			</g>

			<g class="exNodes" ref="nodesEl">
				<component v-for="node in nodes" :key="node.id" 
					:is="node.ctor ? node.ctor : 'ex-node'"
					ref="nodes"
					class="exNode"

					:id="node.id"
					:class="node.class"
					:x="node.x"
					:y="node.y"
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
			<g class="exSelection" ref="selection">
				<slot name="selection" />
			</g>
			<slot name="exViewport" />
			<template v-for="(child, index) in workspace">
				<component :is="child.is" v-bind="child"
				/>
			</template>
		</g>
		<slot name="front" />
	</svg>
</template>
	
<script>

	var worksheetComponent = {
		mixins: [WorksheetGrid, WorksheetSelection, WorksheetNodeDraggable, WorksheetTooltip, WorksheetLibraryMenu],
		inject: ['getUid'],
		
		data: function(){
			return {
				classObject: {
					focus: true,
				},
				defs: [],
				selection: [],
				workspace: [],
				drawlink: false,
			}
		},
		
		props: {
			id: String,
			cls: String,
			//drawlink: false,
		},
		
		computed: {
			nodes: function() {
				return this.$store.state.nodes;
			},
			
			links: function(){
				return this.$store.state.links;
			},
			
			$worksheet: function(){ return this; }
		},

		methods: {
			addNode: function(data){
				if(!data.id)
					data.id = this.getUid('node');
				//this.nodes.push(data);
				this.$store.commit('addNode', data);
			},
			
			getNode: function(val){
				if(typeof val == 'function')
					return this.$refs.nodes.find(val);
				
				// assume val is the id of node
				return this.$refs.nodes.find(node => node.id === val);
			},
			
			removeNode: function(id){
				this.$store.commit('deleteNode', id);
			},
			
			drawLink: function(data){
				Vue.set(this, 'drawlink', data);
			},
			
			addLink: function(data){
				if(!data.id)
					data.id = this.getUid('node');
				this.$store.commit('addLink', data);
			},
			
			removeLink: function(id){
				this.$store.commit('deleteLink', id);
			},
			
			getLink: function(val){
				if(typeof val == 'function')
					return this.$refs.links.find(val);

				// assume val is the id of node
				return this.$refs.links.find(link => link.id === val);
			},
			
			addDef: function(data){
				var me = this;
								
				if(Array.isArray(data)){
					data.forEach(function(el){
						me.addDef(el);
					});
					return;
				}

				if(data.props.id) {
					var found = false;
					this.defs.forEach(function(elem){
						if(elem.props.id == data.props.id)
							found = elem;
					});
					if(found)
						return found;
				}
				else
					data.props.id = this.getUid();
				
				this.defs.push(data);
				return data.id;
			},
			
			getWorksheet: function(){
				return this;
			},
			
			getViewportEl: function(){
				return this.$refs.viewport;
			},
			
			getSvg: function(){
				return this.$el;
			},

			getSvgCoord: function(evt, point){
				
			},
			
			setFocus: function(focus){
				console.log('setFocus');
				this.$el.parentNode.focus();
				var i = document.createElement('input');
				i.setAttribute('display', 'none');
				document.body.appendChild(i);
				i.focus({preventScroll:true});
				document.body.removeChild(i);
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
				//this.$eventBus.$emit('worksheet.contextmenu', this, evt);
				if(evt.defaultPrevented)
					return;
				this.$emit('worksheet.contextmenu', evt);
			},
			
			onRightButtonDown: function(evt){
				console.log('worksheet:onRightButtonDown');
				//this.$eventBus.$emit('worksheet.rightbuttondown', this, evt);
				if(evt.defaultPrevented)
					return;
				this.$emit('worksheet.rightbuttondown', evt);
			},
			
			onRightButtonUp: function(evt){
				console.log('worksheet:onRightButtonUp');
				//this.$eventBus.$emit('worksheet.rightbuttonup', this, evt);
				if(evt.defaultPrevented)
					return;
				this.$emit('worksheet.rightbuttonup', evt);
			},
			
			onLeftMouseDown: function(evt){
				console.log('worksheet:onLeftButtonDown');
				//this.$eventBus.$emit('worksheet.leftmousedown', this, evt);
				this.$emit('worksheet-leftmousedown', evt);
				if(evt.defaultPrevented)
					return;
			}
		},

		provide: {
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
	
	.exTitlebar text {
		font-family: "Helvetica, Arial, sans-serif";
	}	
</style>