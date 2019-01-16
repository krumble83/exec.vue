

const EMPTY_STATE = 'emptyState';

const VueUndoRedo = {
	data() {
		return {
			done: [],
			undone: [],
			newMutation: true,
			ignoreMutations: ['changeNodePropertyShadow'],
			sequence: 0,
		};
	},
	
	created() {
		if (this.$store) {
			this.$store.subscribe(mutation => {
				//console.log('mutation recorded ', mutation.type)
				if (mutation.type !== EMPTY_STATE && this.ignoreMutations.indexOf(mutation.type) === -1) {
					//mutation.sequence = this.sequence;
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
				//console.log(mutation.sequence);
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
			this.sequence++;
		},
		
		stopSequence: function(){
			this.sequence--;			
		},
	}
};

