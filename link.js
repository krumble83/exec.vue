
const LinkComponent = {
	props: {
		
	},
	
	data: function(){
		return {
			mInputPin: false,
			mOutputPin: false,
			mStartPin: false,
			mDataType: '',
		}
	},
	
	methods: {
		createLink: function(startPin){
			this.mStartPin = startPin;
			
			if(startPin.getType() == 'input')
				this.mInputPin = startPin;
			else
				this.mOutputPin = startPin;
		},
		
		finishLink: function(endPin){
			
		}
	}
}