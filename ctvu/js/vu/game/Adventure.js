vu.game.Adventure = CT.Class({
	CLASSNAME: "vu.game.Adventure",
	_: {
		scenes: {}
	},
	setScene: function(key) {
		var _ = this._, thaz = this, zcc = zero.core.current;
		key = key || this.game.scenes[0];
		if (zcc.scene)
			zcc.scene.unload();
		if (key in _.scenes)
			_.scenes[key].load();
		else {
			CT.db.one(key, function(sdata) {
				_.scenes[key] = new vu.game.Scene(CT.merge({
					adventure: thaz
				}, sdata));
			}, "json");
		}
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			player: null,
			state: {},
			game: {
				name: "game title",
				description: "game description",
				scenes: [], // keys
				portals: {},
				initial: {},
				victory: {},
				defeat: {}
			}
		});
		this.player = opts.player;
		var s = this.state = opts.state;
		s.actors = s.actors || {};
		s.inventory = s.inventory || {
			bag: [],
			gear: {}
		};
		this.game = opts.game;
		this.portals = opts.game.portals;
		this.controls = new zero.core.Controls();
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.game.name, "bigger"),
			opts.game.description,
			"(close this window to start!)"
		], "centered kidvp"), this.setScene);
	}
});