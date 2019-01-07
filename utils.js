

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

} 