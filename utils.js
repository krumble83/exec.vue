
function assert(ass, callback){
	if(!ass){
		if(typeof callback === 'function')
			callback();
		throw new Error('Assertion Error');
	}
};

var Utils = {
	Svg: {
		getTranslate: function(str){
			var regex = new RegExp(/^translate\(([0-9]+),([0-9]+)\)$/i);
			var res = regex.exec(str);
			return {x: parseInt(res[1]), y: parseInt(res[2])};
		}
	},
	Template: {
		addProperty: function(tplId, targetSelector, pname, pvalue){
			var tpl = document.querySelector('#' + tlpId).content;
			var target = tpl.querySelector(targetSelector);
			target.setAttribute(pname, pvalue);
			
		}
	},
	Vue: {
		loadVue: function(){
			
			var args = Array.prototype.slice.call(arguments);

			if(args.length === 0)
				return;
			
			var tok = args.shift();
			if(typeof tok === 'string'){

				var xhr = getXMLHttpRequest();
				xhr.responseType = 'text';
				xhr.open('GET', 'vues/' + tok + '.vue', true);
				xhr.send(null);
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
						Utils.Vue.parseVue(xhr.responseText, tok);
						Utils.Vue.loadVue.apply(this, args);
					}
				};
			}
			else if(typeof tok === 'function'){
				if(tok.apply(this, args) === false)
					return;
				Utils.Vue.loadVue.apply(this, args);
			}
			else if(tok instanceof Array){
				Utils.Vue.loadVue.apply(this, tok.concat(args));
			}
			else{
				console.log('loadScript: Argument ignored (not string or function)');
				Utils.Vue.loadVue.apply(this, args);
			}
				
		},
		
		parseVue: function(data, name){
			var isExport = RegExp('module.exports', 'g').test(data);
			name = name.replace('.', '');
			
			if(isExport)
				data = data.replace('module.exports', 'ex' + name);

			var div = document.createElement('div');
			div.innerHTML = data;
			
			if(div.querySelector('template')){
				div.querySelectorAll('template').forEach(function(el){
					if(isExport && !el.getAttribute('id'))
						el.setAttribute('id', 'ex-' + name + '-tpl');
					document.body.prepend(el);
				});
			}
			
			if(div.querySelector('script')){
				var script = document.createElement('script');
				script.type = "text\/javascript";
				script.innerHTML = div.querySelector('script').innerHTML;
				(document.head || document.getElementsByTagName("head")[0]).appendChild(script);
				if(isExport){
					if(!window['ex' + name]['template'])
						window['ex' + name]['template'] = '#ex-' + name + '-tpl';
					Vue.component('ex-' + name, window['ex' + name]);
				}
			}
			if(div.querySelector('style')){
				var script = document.createElement('style');
				//script.type = "text\/javascript";
				script.innerHTML = div.querySelector('style').innerHTML;
				(document.head || document.getElementsByTagName("head")[0]).appendChild(script);
			}
		},
		
		parseVueOld: function(data, name){
			var div = document.createElement('div');
			div.innerHTML = data;
			
			if(div.querySelector('template')){
				div.querySelectorAll('template').forEach(function(el){
					document.body.prepend(el);
				});
			}
			
			if(div.querySelector('script')){
				var script = document.createElement('script');
				script.type = "text\/javascript";
				script.innerHTML = div.querySelector('script').innerHTML;
				(document.head || document.getElementsByTagName("head")[0]).appendChild(script);
			}
			if(div.querySelector('style')){
				var script = document.createElement('style');
				//script.type = "text\/javascript";
				script.innerHTML = div.querySelector('style').innerHTML;
				(document.head || document.getElementsByTagName("head")[0]).appendChild(script);
			}
		}
	}
} 

const Library = {
	Link : {
		SAME_NODE: {},
		SAME_PIN: {}
	}
	
}

function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function getXMLHttpRequest() {
	var xhr = null;
	
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
	} else {
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	
	return xhr;
}
