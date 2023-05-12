vu.game.Adventure = CT.Class({
	CLASSNAME: "vu.game.Adventure",
	_: {
		scenes: {},
		cbs: {
			enter: function(person) {
				this.log("enter", person.name);
				zero.core.current.scene.personalize(person);
			},
			joined: function(person) {
				this.log("joined", person.name);
				person.score = person.score || 0;
//				zero.core.current.adventure = new vu.game.Adventure(vu.builders.adventure._.aopts);
			}
		},
		setState: function() {
			var s = this.state;
			s.script = s.script || "start";
			s.story = s.story || [];
			s.actors = s.actors || {};
			s.inventory = s.inventory || {
				bag: [],
				gear: {}
			};
		},
		reset: function() {
			// TODO: ungear!
			var prop, gi = this.game.initial;
			for (prop of CT.data.uniquify(Object.keys(this.state).concat(Object.keys(gi))))
				this.state[prop] = gi[prop] && JSON.parse(JSON.stringify(gi[prop]));
			this._.setState();
			this.upstate();
		},
		initState: function() {
			var _ = this._, oz = this.opts;
			this.state = oz.state;
			if (oz.state.story && oz.state.story.length) {
				CT.modal.choice({
					prompt: "resume adventure or start over?",
					data: ["resume", "restart"],
					cb: function(decision) {
						if (decision == "restart" && confirm("are you sure you want to lose your progress?"))
							_.reset();
						else
							_.setState();
					}
				});
			} else
				_.setState();
		},
		start: function() {
			var zcc = zero.core.current, vp = vu.portal;
			vu.live.init(this._.cbs);
			vp.on("filter", function(obj) {
				return obj.name in vp.options();
			});
			vu.portal.on("eject", function(portout) {
				vu.live.emit("eject", portout);
				CT.pubsub.unsubscribe(zcc.room.opts.key);
			});
			vp.on("inject", function(troom, pkey) { // Scene.start() handles subscribe
				zcc.injector = pkey;
				zcc.adventure.scene(vp.options()[vp.ejector.name].target);
				vu.live.emit("inject", pkey);
			});
		}
	},
	reset: function() {
		this._.reset();
		zero.core.current.scene.script("start");
	},
	upstate: function() {
		user.core.get() && vu.storage.edit({
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
		else
			_.start();
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
	scene: function(name) {
		this.state.script = "start";
		this.setScene(this.scenemap[name]);
	},
	score: function(amount, person) {
		if (!person) // is you - additive!
			zero.core.current.person.score += amount;
		else
			person.score = amount;
		this.menus.score();
		person || vu.live.meta();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			player: null,
			state: {},
			game: {
				name: "game title",
				description: "game description",
				scenes: [], // keys
				scenemap: {}, // name->key
				portals: {},
				initial: {},
				victory: {},
				defeat: {},
				score: {}
			}
		});
		zero.core.current.adventure = this;
		this._.initState();
		this.player = opts.player;
		this.game = opts.game;
		this.scenemap = opts.game.scenemap;
		this.portals = opts.game.portals;
		this.menus = new vu.menu.Game({
			state: this.state
		});
		this.controls = new zero.core.Controls({
			moveCb: vu.live.meta
		});
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