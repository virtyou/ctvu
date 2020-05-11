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
		load: function(scene) {
			var _ = vu.builders.scene._, selz = _.selectors,
				sname = CT.dom.span();
			zero.core.current.scene = scene;
			CT.dom.setContent(selz.info, [
				CT.dom.div(scene.name, "bigger"),
				scene.description,
				"room: " + scene.room.name,
				CT.dom.span("script:"),
				CT.dom.pad(),
				sname
			]);
			var az = CT.dom.div(scene.actors.map(function(a) {
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

			var upscripts = function() {
				vu.storage.edit({
					key: scene.key,
					scripts: scene.scripts
				});
			};

			selz.steps.refresh = function(sname) {
				var stez = CT.dom.div(scene.scripts[sname].map(function(s) {
					return JSON.stringify(s);
				}));
				CT.dom.setContent(selz.steps, [
					stez,
					CT.dom.button("add step", function() {
						_.step(function(step) {
							CT.dom.addContent(stez, JSON.stringify(step));
							scene.scripts[sname].push(step);
							upscripts();
						});
					})
				]);
			};

			vu.core.fieldList(selz.scripts, Object.keys(scene.scripts), null, function(v) {
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						sname.innerHTML = f._trigger;
						selz.steps.refresh(f._trigger);
					};
					f.onkeyup = function() {
						if (f.value) {
							f.value = f.value.toLowerCase();
							scene.scripts[f.value] = scene.scripts[f._trigger];
							delete scene.scripts[f._trigger];
							sname.innerHTML = f._trigger = f.value;
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
		},
		step: function(cb) {
			// assume actor for now -- extend to lights, camera, props, and state
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
		},
		setup: function() {
			var skey = location.hash.slice(1),
				_ = vu.builders.scene._, selz = _.selectors;
			if (!skey)
				return alert("no scene specified!");
			selz.info = CT.dom.div();
			selz.scripts = CT.dom.div();
			selz.steps = CT.dom.div();
			selz.actors = CT.dom.div();
			selz.props = CT.dom.div();
			CT.db.one(skey, _.load, "json");
		}
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};