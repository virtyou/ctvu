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
	url: function(url, kind) {
		var parts = url.split("/"),
			tname = parts[parts.length - 1],
			site = parts[2],
			name = site + ": " + tname;
		kind = kind || "music";
		var track = {
			name: name,
			item: url,
			kind: kind
		};
		this.add(track, true);
		return track;
	},
	add: function(sound, doPlay) {
		this[sound.kind][sound.name] = sound;
		(doPlay === true) && this.play(sound.kind, sound.name);
	},
	play: function(kind, name) {
		var track = this[kind][name],
			player = this.players[kind];
		zero.core.util.playTrack(player, track);
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