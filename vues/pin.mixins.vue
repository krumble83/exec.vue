<script>

	const PinForeignEditor = {
		props: {
			editor: String,
		}
	}

	const PinLink = {
		data: function(){
			return {
				classObject: {
					linked: false,
				},
			}
		},
		
		methods: {
			mouseEnter: function(evt){
				console.log('coucou');
			}
		}
	}
	
</script>