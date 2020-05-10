vu.game.Adventure = CT.Class({
	CLASSNAME: "vu.game.Adventure",
	_: {
		scenes: {}
	},
	setScene: function(skey) {
		var _ = this._, zcc = zero.core.current;
		skey = skey || this.opts.scenes[0];
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
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			player: null,
			state: {},
			game: {
				name: "game title",
				description: "game description",
				scenes: [], // keys
				initial: {},
				victory: {},
				defeat: {}
			}
		});
		this.player = opts.player;
		var s = this.state = opts.state;
		s.actors = s.actors || {};
		s.inventory = s.inventory || [];
		this.game = opts.game;
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.name, "bigger"),
			opts.description,
			"(close this window to start!)"
		], "centered kidvp"), null, this.setScene);
	}
});