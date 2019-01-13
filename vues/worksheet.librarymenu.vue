<script>

const WorksheetLibraryMenu = {
	
	created: function(){
		var me = this;
		
		me.$worksheet.$on('link-cancel', function(evt, link){
			//console.log(this.$worksheet.$refs.drawlink);
			
			//evt.stopPropagation();
			if(evt.target == link.$el){
				evt.preventDefault();
				console.log('show library menu', evt);
			}
		});
	}
	
}

</script>