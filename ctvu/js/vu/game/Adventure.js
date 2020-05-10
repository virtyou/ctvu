vu.game.Adventure = CT.Class({
	CLASSNAME: "vu.game.Adventure",
	_: {
		scenes: {}
	},
	scene: function(skey) {
		var _ = this._, zcc = zero.core.current;
		if (zcc.scene)
			zcc.scene.unload();
		if (key in _.scenes)
			_.scenes[key].load();
		else {
			CT.db.one(key, function(sdata) {
				_.scenes[key] = new vu.game.Scene(CT.merge({
					adventure: this
				}, sdata));
			}, "json");
		}
	},
	setPlayer: function() {
		var oz = this.opts;
		// if > 1, use selector
		this.player = oz.players[0];
		// sel p, then:
		this.setScene(oz.scenes[0]);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			game: {
				name: "game title",
				description: "game description",
				scenes: [], // keys
				players: [],
				initial: {},
				victory: {},
				defeat: {}
			},
			state: {}
		});
		var s = this.state = opts.state;
		s.actors = s.actors || {};
		s.inventory = s.inventory || [];
		this.game = opts.game;
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.name, "bigger"),
			opts.description,
			"(close this window to start!)"
		], "centered kidvp"), null, this.setPlayer);
	}
});