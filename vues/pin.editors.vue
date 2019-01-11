<template id="pineditorinputtpl">
	<svg>
		<foreignObject :width="mWidth" :height="mHeight" :x="mX" :y="mY" class="exPinTextInput exEditor" ref="editor">
			<div class="textareaWrapper" @mousedown.stop="">
				<div class="textarea" ref="input" contenteditable="true" @focus="onFocus" @keydown.stop="update" @keyup="update">
				{{mValue}}
				</div>
			</div>
		</foreignObject>	
		</svg>
</template>

<script>

	const PinEditorInputComponent = {
		mixins: [SvgBase],
		props: {
			ctor: {type: String},
			value: {default: ''},
			width:{default: 25},
		},
		
		mounted() {
			this.$nextTick(function () {
				// remove unwanted element all other is work jQuery required
				var el = this.$el;
				this.$el.parentNode.append(this.$el.firstChild);
				this.$el.parentNode.removeChild(el);
				//console.log(this.$el);
			})
		},
		
		data: function(){
			return {
				mValue: this.value,
				mCtor: this.ctor,
			}
		},
		
		computed: {

		},
		
		methods: {
		
			update: function(e){
				this.mWidth = Math.min(this.$refs.input.clientWidth + 5, 300);
				this.mHeight = Math.min(this.$refs.input.clientHeight, 150) + 4;
				this.$emit('editor-changed', this);
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
			},
			
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