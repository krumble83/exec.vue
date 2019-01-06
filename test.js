new Vue({
	el: "#app",
	data: {
		circlePos: {
			cx: 0,
			cy: 0,
			r: 8
		},
		graphSize: 100
	},
	computed: {
		graphPos() {
			var size = this.graphSize
			var half = size / 2
			return {
				viewBox: [-half, -half, size, size].join(" "),
				width: size
			}
		}
	},
	methods: {
		startMove(evt) {
			const touch = (evt.type === "touchstart")
			if (!touch && evt.button !== 0) return;
			const events = touch ? {
				move: "touchmove",
				stop: "touchend"
			} : {
				move: "mousemove",
				stop: "mouseup"
			}
			const elem = evt.currentTarget.closest("svg")
			const point = elem.createSVGPoint()
			const transform = elem.getScreenCTM().inverse()
			const circlePos = this.circlePos
			const getPos = touch ? getTouchPos : getMousePos

			var moving = true
			var newPt

			const updateFn = () => {
				if (moving) requestAnimationFrame(updateFn)

				// Map the screen pixels back to svg coords
				newPt = point.matrixTransform(transform)
				circlePos.cx = newPt.x
				circlePos.cy = newPt.y
			}
			const moveFn = (evt) => getPos(evt, point)
			const stopFn = (evt) => {
				moving = false
				elem.removeEventListener(events.move, moveFn)
				elem.removeEventListener(events.stop, stopFn)
			}

			requestAnimationFrame(updateFn)
			moveFn(evt)

			elem.addEventListener(events.move, moveFn)
			elem.addEventListener(events.stop, stopFn)
		}
	}
})

function getMousePos(mouseEvent, point) {
	point.x = (mouseEvent.clientX)
	point.y = (mouseEvent.clientY)
}

function getTouchPos(touchEvent, point) {
	point.x = (touchEvent.touches[0].clientX)
	point.y = (touchEvent.touches[0].clientY)
}