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

				this.player = new vu.game.Player({
					person: person,
					menus: this.menus,
					level: this.state.level
				});

				this.controls.setCb(vu.clix.action);
				this.controls.setTarget(person, true);
			}
		},
		setState: function() {
			var s = this.state;
			s.script = s.script || "start";
			s.story = s.story || [];
			s.actors = s.actors || {};
			s.inventory = s.inventory || {
				gear: {},
				bag: { back: {}, hip: {} } // left/right
			};
			s.level || CT.modal.prompt({
				prompt: "what level are you starting at?",
				style: "number",
				min: 1,
				step: 1,
				noCancel: true,
				classname: "w300p",
				cb: function(num) {
					s.level = num;
				}
			});
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
					noCancel: true,
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
		ereg: function(emod) {
			CT.event.subscribe(emod, oname => zero.core.current.scene.envMod(emod, oname));
		},
		start: function() {
			var _ = this._, zcc = zero.core.current, vp = vu.portal, scene = this.scene, emod;
			vu.live.init(_.cbs);
			vp.on("filter", function(obj) { // NB: _not_ currently used - see vp.check()
				return obj.name in vp.options();
			});
			vp.on("eject", function(portout) {
				vu.live.emit("eject", portout);
				vp.ejector = portout && zero.core.Thing.get(portout);
				CT.pubsub.unsubscribe(zcc.room.opts.key);
			});
			vp.on("inject", function(troom, pkey) { // Scene.start() handles subscribe
				zcc.injector = pkey;
				scene(vp.options()[vp.ejector.name].target);
			});
			for (emod of ["burn", "melt", "shart", "wile", "die"])
				_.ereg(emod);
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
		zcc.scene || _.start();
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
	average: function(people) {
		var zcc = zero.core.current, pz = zcc.people,
			sum = people.map(p => pz[p].score.hp).reduce((a, b) => a + b, 0),
			average = Math.ceil(sum / people.length), name;
		for (name of people)
			pz[name].score.hp = average;
		this.menus.score();
		zcc.room.bump(pz[people[0]].body, pz[people[1]].body); // if > 2, whatever....
//		vu.game.hopper.zombify();
	},
	score: function(score, person) { // xp
		var isYou = !person, ps, xpcap, zcc = zero.core.current;
		if (isYou) { // additive!
			person = zcc.person;
			ps = person.score;
			ps.xp += score;
			xpcap = ps.level * 100;
			if (ps.xp > xpcap) {
				ps.level += 1;
				ps.xp -= xpcap;
				zcc.player.levelup();
			}
		} else
			person.score = score;
		this.menus.score();
		isYou && vu.live.meta();
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
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
		}), zcc = zero.core.current;
		zcc.adventure = this;
		this._.initState();
		this.game = opts.game;
		this.scenemap = opts.game.scenemap;
		this.portals = opts.game.portals;
		this.menus = new vu.menu.Game({
			state: this.state
		});
		this.controls = zcc.controls = new zero.core.Controls({
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