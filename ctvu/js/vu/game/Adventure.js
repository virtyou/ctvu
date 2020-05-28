vu.game.Adventure = CT.Class({
	CLASSNAME: "vu.game.Adventure",
	_: {
		scenes: {}
	},
	upstate: function() {
		vu.storage.edit({
			key: this.opts.key,
			state: this.state
		});
	},
	setScene: function(key) {
		var _ = this._, thaz = this, zcc = zero.core.current;
		key = key || this.state.scene || this.game.scenes[0];
		this.state.scene = key;
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
		zero.core.current.adventure = this;
		this.player = opts.player;
		var s = this.state = opts.state;
		s.script = s.script || "start";
		s.story = s.story || [];
		s.actors = s.actors || {};
		s.inventory = s.inventory || {
			bag: [],
			gear: {}
		};
		this.game = opts.game;
		this.portals = opts.game.portals;
		this.menus = new vu.menu.Game({
			state: s
		});
		this.controls = new zero.core.Controls();
		CT.modal.modal(CT.dom.div([
			CT.dom.div(opts.game.name, "bigger"),
			opts.game.description,
			"(click this window to start!)"
		], "centered kidvp"), this.setScene, {
			noClose: true,
			transition: "fade"
		}, true);
	}
});