<template id="tpl.pineditorinput">
	<foreignObject :width="mWidth" :height="mHeight" :x="mX" :y="mY">
		<div class="textareaWrapper" @mousedown.stop="">
			<div class="textarea" ref="input" contenteditable="true" @focus="onFocus" @keydown="update" @keyup="update">
			{{mValue}}
			</div>
		</div>
	</foreignObject>	
</template>

<script>

	const PinEditorComponent = {

		props: {
			value: {},
		},
		
		data: function(){
			return {
				value: this.mValue,
			}
		}
	}

</script>