vu.game.Scene = CT.Class({
	CLASSNAME: "vu.game.Scene",
	refresh: function() {
		this.log("refresh");
		// state has probs been updated > TODO:
		// - check victory/defeat conditions
		// - if multi, ws push; always update db
	},
	script: function(sname) {
		var oz = this.opts;
		vu.game.util.script(oz.scripts[sname],
			this.refresh, this.state);
	},
	start: function() {
		var zcc = zero.core.current;
		zcc.person = zcc.people[this.player.name];
		this.script("start");
	},
	unload: function() {
		// get rid of room / people!
	},
	load: function() {
		var oz = this.opts, cfg = core.config.ctzero, p;
		for (p of oz.actors)
			p.grippy = false;
		cfg.room = oz.room;
		cfg.people = oz.actors.concat([this.player]);
		zero.core.util.init(null, this.start);
		zero.core.current.scene = this;
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			name: "scene title",
			description: "scene description",
			room: null,
			props: {}, // TODO
			actors: [],
			scripts: {},
			fx: [],
			music: [],
			ambient: []
		});
		var a = this.adventure = opts.adventure,
			s = this.state = a.state, osa = s.actors;
		this.player = a.player;
		opts.actors.forEach(function(p) {
			osa[p.name] = osa[p.name] || {};
		});
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.name, "bigger"),
			opts.description,
			"(close this window to start!)"
		], "centered kidvp"), this.load);
		this.audio = new vu.audio.Controller({
			fx: opts.fx,
			music: opts.music,
			ambient: opts.ambient
		});
	}
});