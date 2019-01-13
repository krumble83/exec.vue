<template id="pineditorinputtpl">
	<foreignObject is="foreignObject" :width="mWidth" :height="mHeight" :x="x" :y="y" :class="classObject" ref="editor" v-inline.horizontal="5" >
		<div class="textareaWrapper" @mousedown.stop="" @mousemove.stop="">
			<div class="textarea" ref="input" contenteditable="true" @focus="onFocus" @keydown.stop="update" @keyup="update" @blur="onBlur">
			{{mValue}}
			</div>
		</div>
	</foreignObject>	
</template>

<script>

	const PinEditorInputComponent = {
		mixins: [SvgBase],
		props: {
			ctor: {type: String},
			value: {default: ''},
			width: {default: 25},
			height: {default: 20}, 
		},
			
		data: function(){
			return {
				classObject: {
					exPinTextInput: true,
					blur: false,
				},
				mValue: this.value,
				mCtor: this.ctor,
			}
		},
		
		methods: {
		
			update: function(e){
				this.mWidth = Math.min(this.$refs.input.clientWidth + 5, 300);
				this.mHeight = Math.min(this.$refs.input.clientHeight, 150) + 4;
				this.$emit('editor-changed', this);
				//this.$forceUpdate();
				//this.$parent.$forceUpdate();
				this.$parent.update();
			},
		
			onFocus: function(){
				var me = this;
				requestAnimationFrame(function() {
					var range = document.createRange();
					range.selectNodeContents(me.$refs.input);
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				});
				this.classObject.blur = false;
			},
			
			onBlur: function(){
				var me = this;
				this.classObject.blur = true;
				Vue.nextTick(function(){
					me.mWidth = 65;
					me.$parent.update();
					me.$parent.$forceUpdate();
				});
			}
			
		},
		
		template: "#pineditorinputtpl"
	}
	Vue.component('ex-pineditor-input', PinEditorInputComponent);

</script>

<style>
.exWorksheet .exNode .exPin .exPinTextInput .textareaWrapper {
	max-height: 150px;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 1px;
	border: 1px solid #555;
	background-color: #000;
}

.exWorksheet .exNode .exPin .exPinTextInput.blur .textareaWrapper {
	max-height: 16px;
	max-width: 60px;
	overflow-y: hidden;
	overflow-x: hidden;
	padding: 1px;
	border: 1px solid #555;
	background-color: #000;
}


.exWorksheet .exNode .exPin .exPinTextInput .textareaWrapper .textarea {
	cursor: text;
    display: table-cell;
	height: 15px;
	width: 25px;
	color: #fff;
	outline: none;
	font-size: 12px;
	font-weight: normal;
	font-family:Arial;
	pointer-events: all;
	white-space: nowrap;
	padding-right: 7px;
	padding-top: 1px;
	/*height: 17px;*/
	
}
@media screen and (-webkit-min-device-pixel-ratio:0) { 

	.exWorksheet .exNode .exPin .exPinTextInput .textareaWrapper {
		overflow-y: hidden;
	}

}

.exWorksheet .exNode .exPin .exPinTextInput:focus {
	background-color: #555;
}
</style>