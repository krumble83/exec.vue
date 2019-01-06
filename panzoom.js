var normalizeEvent = function(ev) {
  if(!ev.touches) {
    ev.touches = [{clientX: ev.clientX, clientY: ev.clientY}]
  }

  return ev.touches
}

var PanZoom = {
	inject: ['getUid'],
	
	data: function(){
		return {
			panZoom: {
				zoomFactor: 0.03,
				zoomMin: 0,
				zoomMax: Number.MAX_VALUE
			}
		}
	},
	
	created: function () {
		var wsheet = document.querySelector('#worksheetTpl')
			, wspace = document.querySelector('#workspaceTpl')
			, defs = wsheet.content.querySelector('defs')
			, smallId = this.getUid('Pattern')
			, medId = this.getUid('Pattern');
			
		wsheet.content.querySelector('.exWorkspace').prepend(document.importNode(wspace.content, true));
		var div = document.createElement('svg');
		div.innerHTML = '<pattern id="' + smallId + '" class="smallGrid" x="0" y="0" width="17" height="17" patternUnits="userSpaceOnUse"> \
			<path d="M 16 0 L 0 0 0 16" fill="none" stroke="#000"></path></pattern> \
			<pattern id="patternGrid" class="medGrid" x="0" y="0" width="129" height="129" patternUnits="userSpaceOnUse"> \
				<rect width="128" height="128" fill="url(#' + smallId + ')"></rect> \
				<path d="M 128 0 L 0 0 0 128" fill="none"></path> \
			</pattern>';
			for(var i=0; i < div.childNodes.length; i++)
				defs.append(div.childNodes[i]);
		//var pat = document.createElement('pattern');
		//pat.setAttribute('id', this.getUid('Pattern'));
		//defs.append(pat);
		//console.log(this.getUid());
	}
}
