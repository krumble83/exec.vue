<script>

const WorksheetLibraryMenu = {
	
	created: function(){
		this.$worksheet.$once('worksheet-leftmouseup', function(evt){
			console.log('show library menu');
			//evt.stopPropagation();
			evt.preventDefault();
		});
		
	}
	
}

</script>