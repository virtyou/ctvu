vu.audio = {};

vu.audio.Controller = CT.Class({
	CLASSNAME: "vu.audio.Controller",
	_: {
		tracks: function() {
			for (var kind in this.opts) {
				this[kind] = {};
				this.opts[kind].forEach(this.add);
			}
		},
		players: function() {
			this.players = {};
			for (var kind in this.opts) {
				this.players[kind] = CT.dom.audio();
				document.body.appendChild(this.players[kind]);
			}
		}
	},
	add: function(sound) {
		this[sound.kind][sound.name] = sound;
	},
	play: function(kind, name) {
		this.players[kind].src = this[kind][name].item;
		this.players[kind].play();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			fx: [],
			music: [],
			ambient: []
		});
		this._.tracks();
		this._.players();
	}
});