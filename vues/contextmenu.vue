<template>
	<ul :style="styleObject" :class="classObject">
		<component v-for="(item, idx) in items" :key="idx"
			:is="item.ctor ? item.ctor : 'ex-menuitem'"
			ref="items"
			v-bind="item"
		></component>
	</ul>
</template>

<template id="ex-menuitem-tpl">
	<li :id="id" :class="classObject" :title="desc" :shortcut="shortcut" @mousedown.stop="click">
		<a>{{title}}</a>
		<component is="ex-contextmenu" v-if="classObject.sub" ref="submenu"></component>
	</li>
</template>

<script>

	module.exports = {
	
		data: function(){
			return {
				classObject: {
					visible: false,
					exMenu: true,
				},
				styleObject: {
					left: 0,
					top: 0,
				},
				items: [],
			}
		},
		
		mounted: function(){
			if(this.$parent.classObject && this.$parent.classObject.sub){
				this.styleObject = {};
				this.classObject.exMenu = false;
			}
		},
		
		beforeDestroy: function(){
			console.log('destroy');
			this.items = [];
		},
		
		methods: {
			addItem: function(data){
				if(data.disabled)
					data.classObject = {disabled: true};
				else
					data.classObject = {};
				this.items.push(data);
			},
			
			addSubMenu: function(str){
				this.items.push({ctor: 'ex-menuitem', title: str, classObject: {sub: true}, submenuNode: false});
				//this.$forceUpdate();
				this.$mount();
				return this.$refs.items[this.$refs.items.length-1].$refs.submenu;
			},
			
			getLast: function(){
				return this.$refs.items[this.$refs.items.length-1];
			},
			
			addSeparator: function(){
				this.items.push({ctor: 'ex-menuitem', classObject: {sep: true}})
			},
			
			addTitle: function(str){
				this.items.push({ctor: 'ex-menuitem', title: str, classObject: {title: true}})
			},
			
			getItem: function(id){
				return this.items.find(items => item.id == id);
			},
			
			clear: function(){
				if(this.$refs.items){
					this.$refs.items.forEach(function(el){
						if(el.$refs.submenu)
							el.$refs.submenu.clear();
					});
				}
				this.items = [];
			},
			
			showAt: function(x, y){
				var me = this;
				this.styleObject.left = x;
				this.styleObject.top = y;
				this.classObject.visible = true;
				document.addEventListener('mousedown', function(evt){
					//console.log(evt);
					me.hide();
				}, {once: true, capture: true});
			},
			
			hide: function(){
				this.classObject.visible = false;
			},
		}
	}
	

	var MenuItem = {
		props: {
			id: {type: String, default: genUid()},
			classObject: {
				disabled: false,
			},
			title: String,
			desc: String,
			shortcut: String,
			callback: {},
			ctor: {},
		},
		
		beforeDestroy: function(){
			console.log('destroy');
			//this.items = [];
		},

		methods: {
			click: function(evt){				
				evt.stopPropagation();
				if(typeof this.callback === 'function')
					this.callback();
			},
		},
		template: '#ex-menuitem-tpl'
	};
	Vue.component('ex-menuitem', MenuItem);
	
	
	const ContextMenu = {
		created: function(){
			this.$on('mouse:context', this.onContextMenu);
		},
		
		beforeDestroy: function(){
			this.$off('mouse:context', this.onContextMenu);
		},
		
		methods: {
			onContextMenu: function(evt){
				const me = this
				, menu = this.$root.$refs.contextmenu;
				
				menu.clear();
				Vue.nextTick(function(){
					if(me.buildContextMenu)
						me.buildContextMenu(menu);
					me.$emit('cmenu', menu);
					me.$worksheet.$emit(me.$options._componentTag + ':contextmenu', me, menu);
					menu.showAt(evt.clientX, evt.clientY-10);					
				});
			}
		}
	}
	
</script>
<style>
.exMenu {
	position: absolute;
	display: none;
	top: 300px;
	left: 300px;
	font-family: sans-serif;
	font-size: 12px;
	border: 1px solid #000;
	padding: 0;
	cursor: default;
	border-radius: 2px;
	min-width: 120px;
	z-index: 1000;

	background: #292929; /* Old browsers */
	background: -moz-linear-gradient(top, #292929 0%, #1a1a1a 20%, #1a1a1a 50%, #1a1a1a 80%, #292929 100%); /* FF3.6-15 */
	background: -webkit-linear-gradient(top, #292929 0%,#1a1a1a 20%,#1a1a1a 50%,#1a1a1a 80%,#292929 100%); /* Chrome10-25,Safari5.1-6 */
	background: linear-gradient(to bottom, #292929 0%,#1a1a1a 20%,#1a1a1a 50%,#1a1a1a 80%,#292929 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#292929', endColorstr='#292929',GradientType=0 ); /* IE6-9 */

	-webkit-user-select: none; /* Safari */        
	-moz-user-select: none; /* Firefox */
	-ms-user-select: none; /* IE10+/Edge */
	user-select: none; /* Standard */	
}

.exMenu.visible {
	display: block;
}

.exMenu ul {
	display: none;
	white-space: nowrap;
	padding: 0; 
	margin: 0;
	border: 1px solid #000;
	border-radius: 2px;

	background: #292929; /* Old browsers */
	background: -moz-linear-gradient(top, #292929 0%, #1a1a1a 20%, #1a1a1a 50%, #1a1a1a 80%, #292929 100%); /* FF3.6-15 */
	background: -webkit-linear-gradient(top, #292929 0%,#1a1a1a 20%,#1a1a1a 50%,#1a1a1a 80%,#292929 100%); /* Chrome10-25,Safari5.1-6 */
	background: linear-gradient(to bottom, #292929 0%,#1a1a1a 20%,#1a1a1a 50%,#1a1a1a 80%,#292929 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#292929', endColorstr='#292929',GradientType=0 ); /* IE6-9 */
	
	
}


.exMenu li {
	list-style-type: none;
	position: relative; 
	margin: 0; 
	padding: 0;
}

.exMenu li a {
	display: block; 
	padding: 5px 20px;
	padding-right: 30px;
	text-decoration: none;
	color: #eee;
	height: 11px;
	line-height: 10px;
	cursor: default;
	padding-right: 60px;
	white-space: nowrap;
}

.exMenu li:after {
    content: attr(data-shortcut) '';
	position: absolute;
	top: 5px; 
	left: 110px;
	white-space: nowrap;
	font-size: 11px;
	color: #777;
	pointer-events: none;
}


.exMenu li a:hover {
	background-color: #dea309;
	border-radius: 2px;
}

.exMenu li.sub > a{
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAYAAAAx8TU7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QwdCgEFEqlA3AAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAN0lEQVQI122OwQ0AMAgCwY3YfwhHoh9NbO29yIGJtG0AkEQU0SEzveQs2OeTwIclJTFecS3nSwcNtxEv8+bFmQAAAABJRU5ErkJggg==');
	background-position: 95% 50%;
	background-repeat: no-repeat;
}

.exMenu li:hover > ul {
	display: block; 
	position: absolute; 
	top: -1px; 
	left: 100%;
	white-space: nowrap;
}

.exMenu li.sep {
	background: #666666;
	height: 1px;
	margin: 0 10px;
	padding: 0;
	pointer-events: none;
}

.exMenu li.title a {
	padding: 2px;
	margin: 0;
	color: #777;
	font-size: 11px;
	pointer-events: none;
}

.exMenu li.title a:hover {
	background-color: #1a1a1a;
}


.exMenu li.disabled a{
	color: #777;
}

.exMenu li.disabled a:hover {
	background-color: #1a1a1a;
	pointer-events: none;
}
</style>
