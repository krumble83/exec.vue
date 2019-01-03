
var id = 100;

function getUid(prefix){
	return 'svg' + ((prefix) ? prefix : '') + id++;
}

var worksheetComponent = {
  data: function(){
	  return {
		
	  }
  },
  props: {
	  id: {
		  type: String
	  },
	  cls: {
		  type: String
	  }
  },
  template: '#worksheetTpl'
};
Vue.component('ex-worksheet', worksheetComponent);


var titlebarButtonComponent = {
  data: function(){
	  return {
	  }
  },
  props: {
  },
  template: '#titlebarButtonTpl'	
};
Vue.component('ex-titlebarbutton', titlebarButtonComponent);


var titleBarComponent = {
  data: function(){
	  return {
		cursor: 0,
	  }
  },
  components: {
	  'ex-button' : titlebarButtonComponent
  },
  props: {
	  title: String, 
  },
  template: '#titlebarTpl'	
};
Vue.component('ex-titlebar', titleBarComponent);




var app = new Vue({
  el: '#app',
  mountedz: function(){
	  var svg = document.createElement('svg');
	  svg.setAttribute('width', '100%');
	  svg.setAttribute('height', '100%');
	  svg.setAttribute('class', '100%');
	  this.$el.appendChild(svg);
  },
  data: {
    title: ''
  },
  methods: {
	appendChild: function(){}
  }
})

