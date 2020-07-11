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
			var kind, player;
			this.players = {};
			for (kind in this.opts) {
				player = this.players[kind] = CT.dom.audio();
				player.volume = core.config.ctvu.volumes[kind];
				document.body.appendChild(player);
			}
		}
	},
	add: function(sound) {
		this[sound.kind][sound.name] = sound;
	},
	play: function(kind, name) {
		var track = this[kind][name], d, n;
		this.players[kind].src = track.item;
		this.players[kind].play();
		if (track.owners.length) {
			CT.cc.view({
				identifier: "Resource (audio - " + kind + "): " + name,
				owners: track.owners
			});
		} else {
			[d, n] = name.split(": ");
			zero.core.current.adventure.menus.attribution("hearing",
				n, "audio (" + kind + ")", d);
		}
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