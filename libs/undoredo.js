

const EMPTY_STATE = 'emptyState';

const VueUndoRedo = {
	data() {
		return {
			done: [],
			undone: [],
			newMutation: true,
			ignoreMutations: ['changeNodePropertyShadow'],
			undoSequence: [],
		};
	},
	
	created() {
		if (this.$store) {
			this.$store.subscribe(mutation => {
				if (mutation.type !== EMPTY_STATE && this.ignoreMutations.indexOf(mutation.type) === -1) {
					this.done.push(mutation);
				}
				if (this.newMutation) {
					this.undone = [];
				}
			});
		}
	},
	
	computed: {
		canRedo() {
			return this.undone.length;
		},
		canUndo() {
			return this.done.length;
		}
	},
	
	methods: {
		redo() {
			if(!this.canRedo)
				return;
			let commit = this.undone.pop();
			this.newMutation = false;
			switch (typeof commit.payload) {
				case 'object':
					this.$store.commit(`${commit.type}`, Object.assign({}, commit.payload));
					break;
				default:
					this.$store.commit(`${commit.type}`, commit.payload);
			}
			this.newMutation = true;
		},
		undo() {
			if(!this.canUndo)
				return;
			this.undone.push(this.done.pop());
			this.newMutation = false;
			this.$store.commit(EMPTY_STATE);
			this.done.forEach(mutation => {
				//console.log(mutation.payload);
				switch (typeof mutation.payload) {
					case 'object':
						this.$store.commit(`${mutation.type}`, Object.assign({}, mutation.payload));
						break;
					default:
						this.$store.commit(`${mutation.type}`, mutation.payload);
				}
				this.done.pop();
			});
			this.newMutation = true;
		},
		
		startSequence: function(){
			
		},
		
		stopSequence: function(){
			
		},
	}
};
