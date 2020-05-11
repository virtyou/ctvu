vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			info: "top",
			scripts: "topleft",
			steps: "bottomleft",
			actors: "topright",
			props: "bottomright"
		},
		upscripts: function() {
			var scene = zero.core.current.scene;
			vu.storage.edit({
				key: scene.key,
				scripts: scene.scripts
			});
		},
		step: function(cb) {
			CT.modal.choice({
				prompt: "please select a variety",
				data: ["actor", "camera"], // lights, props, state
				cb: function(stype) {
					if (stype == "actor") {
						CT.modal.choice({
							prompt: "please select an actor",
							data: zero.core.current.scene.actors,
							cb: function(actor) {
								// assume say for now -- extend to respond, etc
								CT.modal.prompt({
									prompt: "what's the line?",
									cb: function(line) {
										cb({ actor: actor.name, line: line });
									}
								})
							}
						});
					} else if (stype == "camera") {
						CT.modal.choice({
							prompt: "please select an angle",
							data: ["behind", "pov", "rotate",
								"0", "1", "2", "3", "4", "5", "6", "7", "8"],
							cb: function(angle) {
								cb({ camera: angle });
							}
						});
					}
				}
			});
		},
		actors: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				scene = zero.core.current.scene,
				az = CT.dom.div(scene.actors.map(function(a) {
					return a.name;
				}));
			CT.dom.setContent(selz.actors, [
				az,
				CT.dom.button("add", function() {
					var akeys = scene.actors.map(function(a) {
						return a.key;
					});
					CT.modal.choice({
						prompt: "please select an actor",
						data: vu.storage.get("people").filter(function(p) {
							return !akeys.includes(p.key);
						}),
						cb: function(person) {
							scene.actors.push(person);
							CT.dom.addContent(az, person.name);
							vu.storage.edit({
								key: scene.key,
								actors: scene.actors.map(function(a) {
									return a.key;
								})
							});
						}
					});
				})
			]);
		},
		stepper: function(s) {
			return CT.dom.div(JSON.stringify(s),
				"bordered padded margined round", null, {
					onclick: function() {
						vu.game.util.step(s);
					}
				});
		},
		steps: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				scene = zero.core.current.scene;
			selz.steps.refresh = function(sname) {
				var stez = CT.dom.div(scene.scripts[sname].map(_.stepper));
				CT.dom.setContent(selz.steps, [
					stez,
					CT.dom.button("add step", function() {
						_.step(function(step) {
							CT.dom.addContent(stez, _.stepper(step));
							scene.scripts[sname].push(step);
							_.upscripts();
						});
					}),
					CT.dom.button("play all", function() {
						vu.game.util.script(scene.scripts[sname]);
					})
				]);
			};

		}
	},
	load: function(scene) {
		var _ = vu.builders.scene._, selz = _.selectors,
			snode = CT.dom.div(), upscripts = _.upscripts;
		zero.core.current.scene = scene;
		CT.dom.setContent(selz.info, [
			CT.dom.div(scene.name, "bigger"),
			scene.description,
			"room: " + scene.room.name,
			snode
		]);
		_.actors();
		_.steps();

		vu.core.fieldList(selz.scripts, Object.keys(scene.scripts), null, function(v) {
			var f = CT.dom.field(null, v);
			if (v) {
				f._trigger = v;
				f.onfocus = function() {
					CT.dom.setContent(snode, "scene: " + f._trigger);
					selz.steps.refresh(f._trigger);
				};
				f.onkeyup = function() {
					if (f.value) {
						f.value = f.value.toLowerCase();
						scene.scripts[f.value] = scene.scripts[f._trigger];
						delete scene.scripts[f._trigger];
						CT.dom.setContent(snode, "scene: " + f.value);
						f._trigger = f.value;
						upscripts();
					} else
						f.value = f._trigger; // meh
				};
			} else {
				f.onkeyup = function() { f.value = f.value.toLowerCase() };
			}
			return f;
		}, function(iput) {
			var key = iput.value;
			if (key in scene.scripts) return; // already exists...
			scene.scripts[key] = [];
			setTimeout(function() {
				iput.focus();
			});
		}, function(val) {
			delete scene.scripts[val];
			upscripts();
		});

		vu.builders.scene.build();
	},
	build: function() {
		var cfg = core.config.ctzero,
			scene = zero.core.current.scene;
		cfg.room = scene.room;
		cfg.people = scene.actors;
		zero.core.util.init();
	},
	setup: function() {
		var skey = location.hash.slice(1),
			selz = vu.builders.scene._.selectors;
		if (!skey)
			return alert("no scene specified!");
		selz.info = CT.dom.div();
		selz.scripts = CT.dom.div();
		selz.steps = CT.dom.div();
		selz.actors = CT.dom.div();
		selz.props = CT.dom.div();
		CT.db.one(skey, vu.builders.scene.load, "json");
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		vu.builders.scene.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};